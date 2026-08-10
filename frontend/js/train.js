let selectedTrain = null;
let discountAmount = 0;
let appliedCouponCode = null;
let totalAmount = 0;

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

const el = document.getElementById('trainResults');
  el.innerHTML = renderLoading('Searching for trains', 'Checking live seat availability and schedules');
  startLoadingDots();
  document.getElementById('resultsSection').classList.remove('hidden');
  document.getElementById('passengerSection').classList.add('hidden');
  document.getElementById('paymentSection').classList.add('hidden');

  // UNIQUE: show route map from source → destination
  const mapWrap = document.getElementById('trainRouteMap');
  if (mapWrap) {
    mapWrap.style.display = 'block';
    renderRouteMap(from, to, 'trainRouteMap');
  }

  try {
    const trains = await get(`/search/trains?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
    stopLoadingDots();
    renderTrains(trains);
  } catch (err) {
    stopLoadingDots();
    el.innerHTML = `<p class="error-text" style="display:block;">${err.message}</p>`;
  }
});

function renderTrains(trains) {
  const el = document.getElementById('trainResults');
  if (!trains.length) {
    el.innerHTML = renderNoResults('No trains found for this route/date. Try Delhi → Jaipur.');
    return;
  }
  const bgImg = 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&q=80';
  el.innerHTML = trains.map(t => {
    const safeJson = JSON.stringify(t).replace(/'/g, "\\'").replace(/"/g, '"');
    return `<div class="result-item tilt-3d" style="position:relative; overflow:hidden; background:linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.88) 100%);">
      <div style="position:absolute; inset:0; opacity:0.08; background:url('${bgImg}') center/cover; z-index:0; pointer-events:none;"></div>
      <div style="position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; width:100%;">
        <div class="result-main">
          <div>
            <div class="result-name">🚆 ${t.trainName} (${t.trainNumber})</div>
            <div class="result-meta">${t.travelClass}</div>
          </div>
          <div class="time-block"><div class="time">${formatTime12h(t.departureTime)}</div><div class="city">${t.fromCity}</div></div>
          <div class="arrow">→</div>
          <div class="time-block"><div class="time">${formatTime12h(t.arrivalTime)}</div><div class="city">${t.toCity}</div></div>
        </div>
        <div class="price-block">
          <div class="amt">${fmtCurrency(t.currentPrice)}</div>
          <div class="seats ${t.availableSeats < 10 ? 'low' : ''}">${t.availableSeats} seats left</div>
          <button class="btn btn-primary btn-sm mt-8" onclick='selectTrain(${safeJson})'>Book Now</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function selectTrain(train) {
  selectedTrain = train;
  discountAmount = 0;
  appliedCouponCode = null;
  document.getElementById('resultsSection').classList.add('hidden');
document.getElementById('passengerSection').classList.remove('hidden');
  refreshSummary();
  updateSteps('passenger');
}

function backToResults() {
  document.getElementById('passengerSection').classList.add('hidden');
  document.getElementById('resultsSection').classList.remove('hidden');
}

function backToPassenger() {
  document.getElementById('paymentSection').classList.add('hidden');
  document.getElementById('passengerSection').classList.remove('hidden');
  updateSteps('passenger');
}

function refreshSummary() {
  const base = selectedTrain.currentPrice;
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
    const coupon = await post(`/coupons/validate/${code}`);
    discountAmount = selectedTrain.currentPrice * (coupon.discountPercent / 100);
    appliedCouponCode = code;
    msg.textContent = `Coupon applied: ${coupon.discountPercent}% off`;
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

  document.getElementById('payTrainInfo').textContent = `${selectedTrain.trainName} (${selectedTrain.trainNumber}) · ${selectedTrain.fromCity} → ${selectedTrain.toCity}`;
  const base = selectedTrain.currentPrice;
  document.getElementById('payBase').textContent = fmtCurrency(base);
  document.getElementById('payDiscount').textContent = '-' + fmtCurrency(discountAmount);
  document.getElementById('payTotal').textContent = fmtCurrency(totalAmount);

  renderPaymentMethods('paymentMethodsContainer');
  document.getElementById('paymentAmountLabel').textContent = fmtCurrency(totalAmount);
}

document.addEventListener('paymentComplete', async (e) => {
  await confirmBooking(e.detail);
});

async function confirmBooking(paymentInfo) {
  const name = document.getElementById('passengerName').value.trim();
  const age = document.getElementById('passengerAge').value;

  try {
    const booking = await post('/bookings', {
      bookingType: 'TRAIN',
      referenceId: selectedTrain.id,
      fromLocation: selectedTrain.fromCity,
      toLocation: selectedTrain.toCity,
      travelDate: selectedTrain.travelDate,
      passengerCount: 1,
      passengerDetails: JSON.stringify({
        name, age,
        gender: document.getElementById('passengerGender').value,
        caption: document.getElementById('caption').value
      }),
      couponCode: appliedCouponCode
    });

    document.getElementById('paymentSection').classList.add('hidden');
    document.getElementById('confirmSection').classList.remove('hidden');
    updateSteps('confirm');

    document.getElementById('confirmMsg').textContent =
      `Booking #${booking.id} confirmed for ${fmtCurrency(booking.finalAmount)}.`;

    document.getElementById('paymentReceipt').innerHTML = `
      <strong>Payment Receipt</strong><br>
      Method: ${paymentInfo.method}<br>
      ${paymentInfo.method === 'UPI' ? 'UPI ID: ' : paymentInfo.method === 'Card' ? 'Card: ****' + paymentInfo.detail.slice(-4) : 'Ref: '} ${paymentInfo.detail}<br>
      Amount Paid: ${fmtCurrency(booking.finalAmount)}<br>
      Status: <span style="color:var(--success);font-weight:600;">Paid ✓</span>`;

    if (window.showTicket3D) {
      setTimeout(() => {
        window.showTicket3D({
          type: 'TRAIN',
          bookingId: booking.id,
          name: name,
          from: selectedTrain.fromCity,
          to: selectedTrain.toCity,
          date: selectedTrain.travelDate,
          amount: booking.finalAmount,
          transport: `${selectedTrain.trainName} (${selectedTrain.trainNumber})`,
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
