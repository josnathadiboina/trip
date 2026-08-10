let selectedFlight = null;
let discountAmount = 0;
let appliedCouponCode = null;
let totalAmount = 0;
let flightDetailVisible = false;

function updateSteps(active) {
  const steps = ['stepPassenger', 'stepPayment', 'stepConfirm'];
  const map = { passenger: 0, payment: 1, confirm: 2 };
  const idx = map[active] ?? -1;
  steps.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active', 'completed');
    if (i < idx) el.classList.add('completed');
    else if (i === idx) el.classList.add('active');
  });
}

document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const from = document.getElementById('fromCity').value.trim();
  const to = document.getElementById('toCity').value.trim();
  const date = document.getElementById('travelDate').value;

const el = document.getElementById('flightResults');
  el.innerHTML = renderLoading('Searching for flights', 'Checking live schedules, prices and seat availability');
  startLoadingDots();
  document.getElementById('resultsSection').classList.remove('hidden');
  document.getElementById('flightDetailPanel').classList.add('hidden');
  document.getElementById('passengerSection').classList.add('hidden');
  document.getElementById('paymentSection').classList.add('hidden');
  updateSteps('search');

  // UNIQUE: show route map from source → destination
  const mapWrap = document.getElementById('flightRouteMap');
  if (mapWrap) {
    mapWrap.style.display = 'block';
    renderRouteMap(from, to, 'flightRouteMap');
  }

try {
    const flights = await fallbackSearch(
      () => get(`/search/flights?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`),
      () => generateMockFlights(from, to, date, 8),
      6000
    );
    renderFlights(Array.isArray(flights) ? flights : []);
  } catch (err) {
    renderFlights([]);
  } finally {
    stopLoadingDots();
  }
  // Safety net: guarantee the loading UI always clears even if the
  // promise chain above somehow hangs or never settles.
  setTimeout(function() {
    stopLoadingDots();
    var resultsEl = document.getElementById('flightResults');
    if (resultsEl && resultsEl.querySelector('.loading-container')) {
      resultsEl.innerHTML = renderNoResults('No flights found. Please try again.');
    }
  }, 12000);
});

function statusPillClass(status) {
  if (!status) return 'status-ontime';
  if (status.startsWith('Delayed')) return 'status-delay';
  if (status === 'Boarding') return 'status-board';
  return 'status-ontime';
}

function renderFlights(flights) {
  const el = document.getElementById('flightResults');
  if (!flights.length) {
    el.innerHTML = renderNoResults('No flights found for this route/date. Try Delhi \u2192 Jaipur.');
    return;
  }
  const bgImg = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80';
  el.innerHTML = flights.map(function(f) {
    const safeJson = JSON.stringify(f).replace(/'/g, "\\'").replace(/"/g, '"');
    return '<div class="result-item tilt-3d" style="position:relative; overflow:hidden; cursor:pointer; background:linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.88) 100%);">' +
      '<div style="position:absolute; inset:0; opacity:0.08; background:url(\'' + bgImg + '\') center/cover; z-index:0; pointer-events:none;"></div>' +
      '<div style="position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; width:100%;" onclick=\'showFlightDetail(' + safeJson + ')\'>' +
        '<div class="result-main">' +
          '<div>' +
            '<div class="result-name">\u2708\ufe0f ' + f.airline + ' \u00b7 ' + f.flightNumber + '</div>' +
'<div class="result-meta"><span class="status-pill ' + statusPillClass(f.liveStatus) + '">' + f.liveStatus + '</span></div>' +
          '</div>' +
          '<div class="time-block"><div class="time">' + formatTime12h(f.departureTime) + '</div><div class="city">' + f.fromCity + '</div></div>' +
          '<div class="arrow">\u2192</div>' +
          '<div class="time-block"><div class="time">' + formatTime12h(f.arrivalTime) + '</div><div class="city">' + f.toCity + '</div></div>' +
        '</div>' +
        '<div class="price-block">' +
          '<div class="amt">' + fmtCurrency(f.currentPrice) + '</div>' +
          '<div class="seats ' + (f.availableSeats < 20 ? 'low' : '') + '">' + f.availableSeats + ' seats left</div>' +
          '<button class="btn btn-primary btn-sm mt-8">Book Now</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function showFlightDetail(flight) {
  selectedFlight = flight;
  flightDetailVisible = true;
  document.getElementById('resultsSection').classList.add('hidden');
  document.getElementById('flightDetailPanel').classList.remove('hidden');
  document.getElementById('flightDetailTitle').textContent = flight.airline + ' ' + flight.flightNumber + ' \u2014 ' + flight.fromCity + ' to ' + flight.toCity;
  document.getElementById('flightDetailMeta').textContent = flight.travelDate + ' \u00b7 Departs ' + flight.departureTime;
  renderLiveStatus(flight);
  document.getElementById('priceHistoryChart').classList.add('hidden');
  loadFlightReviews();
  document.getElementById('flightDetailPanel').scrollIntoView({ behavior: 'smooth' });
}

function closeFlightDetail() {
  flightDetailVisible = false;
  document.getElementById('flightDetailPanel').classList.add('hidden');
  document.getElementById('flightDetailPanel').scrollIntoView({ behavior: 'smooth' });
}

function backToResults() {
  document.getElementById('flightDetailPanel').classList.add('hidden');
  document.getElementById('resultsSection').classList.remove('hidden');
  updateSteps('search');
}

function proceedFromFlightDetail() {
  if (!selectedFlight) return;
  discountAmount = 0;
  appliedCouponCode = null;
  document.getElementById('flightDetailPanel').classList.add('hidden');
document.getElementById('passengerSection').classList.remove('hidden');
  refreshSummary();
  updateSteps('passenger');
}

function backToFlightDetail() {
  document.getElementById('passengerSection').classList.add('hidden');
  document.getElementById('flightDetailPanel').classList.remove('hidden');
}

async function showPriceHistory() {
  if (!selectedFlight) return;
  const chartEl = document.getElementById('priceHistoryChart');
  chartEl.classList.toggle('hidden');
  if (chartEl.classList.contains('hidden')) return;
  try {
    const history = await get('/pricing/history?type=FLIGHT&targetId=' + selectedFlight.id);
    if (!history.length) {
      chartEl.querySelector('p').textContent = 'No price history data available yet.';
      return;
    }
    drawPriceChart(history);
  } catch (err) {
    chartEl.querySelector('p').textContent = 'Failed to load price history.';
  }
}

function drawPriceChart(history) {
  const canvas = document.getElementById('priceChartCanvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 200 * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = '200px';
  ctx.scale(dpr, dpr);
  const w = rect.width;
  const h = 200;
  ctx.clearRect(0, 0, w, h);
  const prices = history.map(function(h) { return h.price; });
  const min = Math.min.apply(null, prices) * 0.95;
  const max = Math.max.apply(null, prices) * 1.05;
  const range = max - min;
  const pad = { top: 20, bottom: 30, left: 20, right: 20 };
  ctx.strokeStyle = '#E4E9F2';
  ctx.lineWidth = 1;
  for (var i = 0; i <= 4; i++) {
    const y = pad.top + (h - pad.top - pad.bottom) * (1 - i / 4);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.strokeStyle = '#FF6B4A';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  prices.forEach(function(price, i) {
    const x = pad.left + (w - pad.left - pad.right) * (i / (prices.length - 1 || 1));
    const y = pad.top + (h - pad.top - pad.bottom) * (1 - (price - min) / (range || 1));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  prices.forEach(function(price, i) {
    const x = pad.left + (w - pad.left - pad.right) * (i / (prices.length - 1 || 1));
    const y = pad.top + (h - pad.top - pad.bottom) * (1 - (price - min) / (range || 1));
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FF6B4A';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#16213A';
ctx.font = '11px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(fmtCurrency(price), x, y - 10);
  });
  const pEl = document.querySelector('#priceHistoryChart p');
  pEl.textContent = 'Price history (' + history.length + ' records) \u2014 Current: ' + fmtCurrency(prices[prices.length - 1]);
}

function renderLiveStatus(flight) {
  const box = document.getElementById('liveStatusBox');
  var html = '<div class="mb-8"><span class="status-pill ' + statusPillClass(flight.liveStatus) + '">' + flight.liveStatus + '</span></div>';
  if (flight.delayReason) {
    html += '<p class="muted" style="font-size:13px;">Reason: ' + flight.delayReason + '</p>';
  }
  html += '<p class="muted" style="font-size:13px;">Revised departure: <strong>' + (flight.revisedDepartureTime || flight.departureTime) + '</strong></p>';
  html += '<p class="muted" style="font-size:13px;">Estimated arrival: <strong>' + (flight.estimatedArrival || flight.arrivalTime) + '</strong></p>';
  box.innerHTML = html;
}

async function refreshLiveStatus() {
  if (!selectedFlight) return;
  await post('/flights/live/' + selectedFlight.id + '/refresh');
  selectedFlight = await get('/flights/live/' + selectedFlight.id);
  renderLiveStatus(selectedFlight);
}

async function trackFlight() {
  if (!selectedFlight) return;
  await post('/flights/' + selectedFlight.id + '/track');
  alert('You are now tracking this flight.');
}

function backToPassenger() {
  document.getElementById('paymentSection').classList.add('hidden');
  document.getElementById('passengerSection').classList.remove('hidden');
  updateSteps('passenger');
}

function refreshSummary() {
  const base = selectedFlight.currentPrice;
  totalAmount = Math.max(0, base - discountAmount);
  document.getElementById('sumBase').textContent = fmtCurrency(base);
  document.getElementById('sumDiscount').textContent = '-' + fmtCurrency(discountAmount);
  document.getElementById('sumTotal').textContent = fmtCurrency(totalAmount);
}

async function applyCoupon() {
  const code = document.getElementById('couponCode').value.trim();
  const msg = document.getElementById('couponMsg');
  if (!code) return;
  try {
    const coupon = await post('/coupons/validate/' + code);
    discountAmount = selectedFlight.currentPrice * (coupon.discountPercent / 100);
    appliedCouponCode = code;
    msg.textContent = 'Coupon applied: ' + coupon.discountPercent + '% off';
    msg.style.display = 'block';
    refreshSummary();
  } catch (err) {
    msg.style.display = 'block';
    msg.style.color = 'var(--danger)';
    msg.textContent = err.message;
  }
}

function proceedToPayment() {
  const errEl = document.getElementById('passengerErr');
  errEl.style.display = 'none';
  const name = document.getElementById('passengerName').value.trim();
  const age = document.getElementById('passengerAge').value;
if (!name || !age) {
    errEl.textContent = 'Please fill in passenger details';
    errEl.style.display = 'block';
    return;
  }
  const code = document.getElementById('couponCode').value.trim();
  if (code && !appliedCouponCode) {
    errEl.textContent = 'Please click "Apply" to validate your coupon code first.';
    errEl.style.display = 'block';
    return;
  }
  document.getElementById('passengerSection').classList.add('hidden');
  document.getElementById('paymentSection').classList.remove('hidden');
  updateSteps('payment');
  document.getElementById('payFlightInfo').textContent = selectedFlight.airline + ' ' + selectedFlight.flightNumber + ' \u00b7 ' + selectedFlight.fromCity + ' \u2192 ' + selectedFlight.toCity;
  const base = selectedFlight.currentPrice;
  document.getElementById('payBase').textContent = fmtCurrency(base);
  document.getElementById('payDiscount').textContent = '-' + fmtCurrency(discountAmount);
  document.getElementById('payTotal').textContent = fmtCurrency(totalAmount);
  renderPaymentMethods('paymentMethodsContainer');
  document.getElementById('paymentAmountLabel').textContent = fmtCurrency(totalAmount);
}

document.addEventListener('paymentComplete', async function(e) {
  await confirmBooking(e.detail);
});

async function confirmBooking(paymentInfo) {
  const name = document.getElementById('passengerName').value.trim();
  const age = document.getElementById('passengerAge').value;
  try {
    const booking = await post('/bookings', {
      bookingType: 'FLIGHT',
      referenceId: selectedFlight.id,
      fromLocation: selectedFlight.fromCity,
      toLocation: selectedFlight.toCity,
      travelDate: selectedFlight.travelDate,
      passengerCount: 1,
      passengerDetails: JSON.stringify({
        name: name, age: age,
        gender: document.getElementById('passengerGender').value,
        caption: document.getElementById('caption').value
      }),
      couponCode: appliedCouponCode
    });
    document.getElementById('paymentSection').classList.add('hidden');
    document.getElementById('confirmSection').classList.remove('hidden');
    updateSteps('confirm');
    document.getElementById('confirmMsg').textContent = 'Booking #' + booking.id + ' confirmed for ' + fmtCurrency(booking.finalAmount) + '.';
    document.getElementById('paymentReceipt').innerHTML =
      '<strong>Payment Receipt</strong><br>' +
      'Method: ' + paymentInfo.method + '<br>' +
      (paymentInfo.method === 'UPI' ? 'UPI ID: ' : paymentInfo.method === 'Card' ? 'Card: ****' + paymentInfo.detail.slice(-4) : 'Ref: ') + paymentInfo.detail + '<br>' +
      'Amount Paid: ' + fmtCurrency(booking.finalAmount) + '<br>' +
      'Status: <span style="color:var(--success);font-weight:600;">Paid \u2713</span>';
    if (window.showTicket3D) {
      setTimeout(function() {
        window.showTicket3D({
          type: 'FLIGHT', bookingId: booking.id, name: name,
          from: selectedFlight.fromCity, to: selectedFlight.toCity,
          date: selectedFlight.travelDate, amount: booking.finalAmount,
          transport: selectedFlight.airline + ' ' + selectedFlight.flightNumber,
          method: paymentInfo.method
        });
      }, 500);
    }
  } catch (err) {
    document.getElementById('paymentSection').classList.add('hidden');
    document.getElementById('passengerSection').classList.remove('hidden');
    const errEl = document.getElementById('passengerErr');
    errEl.textContent = 'Booking failed: ' + err.message;
    errEl.style.display = 'block';
    updateSteps('passenger');
  }
}

async function loadFlightReviews() {
  if (!selectedFlight) return;
  const sort = document.getElementById('reviewSort').value;
  try {
    const reviews = await get('/reviews/public/FLIGHT/' + selectedFlight.id + '?sort=' + sort);
    const listEl = document.getElementById('reviewsList');
    const countEl = document.getElementById('reviewsCount');
    if (!reviews.length) {
      countEl.textContent = 'No reviews yet. Be the first to review!';
      listEl.innerHTML = '<p class="muted">No reviews yet.</p>';
      return;
    }
    countEl.textContent = reviews.length + ' review(s)';
    listEl.innerHTML = reviews.map(function(r) {
      var stars = '';
      for (var si = 0; si < r.rating; si++) stars += '\u2605';
      for (var si = r.rating; si < 5; si++) stars += '\u2606';
      var userName = (r.user && r.user.name) ? r.user.name : 'Anonymous';
      var dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '';
      return '<div class="review-card">' +
        '<div class="review-head">' +
          '<div><strong>' + userName + '</strong>' +
          '<span class="stars">' + stars + '</span></div>' +
          '<div class="review-date">' + dateStr + '</div>' +
        '</div>' +
        '<div class="review-body"><p>' + (r.comment || '') + '</p></div>' +
        '<div class="review-actions">' +
          '<button onclick="flagReview(' + r.id + ')">\uD83D\uDEA9 Flag as inappropriate</button>' +
          '<button onclick="helpfulReview(' + r.id + ', this)">\uD83D\uDC4D Helpful (' + (r.helpfulCount || 0) + ')</button>' +
          '<button onclick="toggleReplyForm(' + r.id + ')">\uD83D\uDCAC Reply</button>' +
        '</div>' +
        '<div id="replyForm-' + r.id + '" class="hidden mt-8">' +
          '<div class="flex gap-8">' +
            '<input type="text" id="replyInput-' + r.id + '" placeholder="Write a reply..." style="flex:1;padding:8px 12px;border-radius:8px;border:1.5px solid var(--border);font-size:13px;">' +
            '<button class="btn btn-primary btn-sm" onclick="submitReply(' + r.id + ')">Post</button>' +
          '</div>' +
        '</div>' +
        '<div id="replies-' + r.id + '" class="mt-8"></div>' +
      '</div>';
    }).join('');
  } catch (err) {
    document.getElementById('reviewsList').innerHTML = '<p class="error-text" style="display:block;">' + err.message + '</p>';
  }
}

function showReviewForm() {
  document.getElementById('reviewFormSection').classList.remove('hidden');
  document.getElementById('reviewFormSection').scrollIntoView({ behavior: 'smooth' });
}

function closeReviewForm() {
  document.getElementById('reviewFormSection').classList.add('hidden');
  document.getElementById('reviewMsg').style.display = 'none';
}

async function submitFlightReview() {
  const rating = document.querySelector('input[name="reviewRating"]:checked');
  const comment = document.getElementById('reviewComment').value.trim();
  const photos = document.getElementById('reviewPhotos').value.trim();
  const msg = document.getElementById('reviewMsg');
  msg.style.display = 'none';
  if (!rating) { msg.textContent = 'Please select a rating'; msg.style.display = 'block'; return; }
  if (!comment) { msg.textContent = 'Please write a review'; msg.style.display = 'block'; return; }
  try {
    await post('/reviews', {
      targetType: 'FLIGHT', targetId: selectedFlight.id,
      rating: parseInt(rating.value), comment: comment, photoUrls: photos
    });
    msg.textContent = 'Review submitted successfully!';
    msg.style.color = 'var(--success)';
    msg.style.display = 'block';
    document.getElementById('reviewComment').value = '';
    document.getElementById('reviewPhotos').value = '';
    document.querySelectorAll('input[name="reviewRating"]').forEach(function(r) { r.checked = false; });
    setTimeout(function() { closeReviewForm(); loadFlightReviews(); }, 1500);
  } catch (err) {
    msg.textContent = err.message;
    msg.style.color = 'var(--danger)';
    msg.style.display = 'block';
  }
}

async function flagReview(id) {
  try { await post('/reviews/' + id + '/flag'); alert('Review flagged.'); } catch (err) { alert(err.message); }
}

async function helpfulReview(id, btn) {
  try { var r = await post('/reviews/' + id + '/helpful'); btn.textContent = '\uD83D\uDC4D Helpful (' + r.helpfulCount + ')'; } catch (err) { alert(err.message); }
}

function toggleReplyForm(reviewId) {
  var el = document.getElementById('replyForm-' + reviewId);
  if (el) el.classList.toggle('hidden');
}

async function submitReply(reviewId) {
  var input = document.getElementById('replyInput-' + reviewId);
  var text = input.value.trim();
  if (!text) return;
  try {
    await post('/reviews/' + reviewId + '/reply', { comment: text });
    input.value = '';
    var form = document.getElementById('replyForm-' + reviewId);
    if (form) form.classList.add('hidden');
    loadReplies(reviewId);
  } catch (err) { alert(err.message); }
}

async function loadReplies(reviewId) {
  try {
    var replies = await get('/reviews/' + reviewId + '/replies');
    var el = document.getElementById('replies-' + reviewId);
    if (!el) return;
    el.innerHTML = replies.map(function(r) {
      var userName = (r.user && r.user.name) ? r.user.name : 'Anonymous';
      var dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '';
      return '<div style="background:var(--bg);border-radius:8px;padding:10px 12px;margin-top:8px;font-size:13px;">' +
        '<strong>' + userName + '</strong>: ' + r.comment +
        '<span class="muted" style="font-size:11px;display:block;">' + dateStr + '</span>' +
      '</div>';
    }).join('');
  } catch (err) { /* ignore */ }
}
