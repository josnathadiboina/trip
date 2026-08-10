let selectedCar = null;
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

  const el = document.getElementById('carResults');
  el.innerHTML = renderLoading('Searching for cars', 'Finding available cabs and drivers');
  startLoadingDots();
  document.getElementById('resultsSection').classList.remove('hidden');
  document.getElementById('passengerSection').classList.add('hidden');
  document.getElementById('paymentSection').classList.add('hidden');
  document.getElementById('confirmSection').classList.add('hidden');

  try {
    const cars = await get(`/search/cars?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
    stopLoadingDots();
    renderCars(cars);
  } catch (err) {
    stopLoadingDots();
    el.innerHTML = `<p class="error-text" style="display:block;">${err.message}</p>`;
  }
});

function renderCars(cars) {
  const el = document.getElementById('carResults');
  if (!cars.length) {
    el.innerHTML = renderNoResults('No cars found for this route/date. Try Delhi → Jaipur.');
    return;
  }
  const bgImg = 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80';
  el.innerHTML = cars.map(function(c) { 
    const safeJson = JSON.stringify(c).replace(/'/g, "\\'").replace(/"/g, '"');
    return `<div class="result-item tilt-3d" style="position:relative; overflow:hidden; background:linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.88) 100%);">
      <div style="position:absolute; inset:0; opacity:0.08; background:url('${bgImg}') center/cover; z-index:0; pointer-events:none;"></div>
      <div style="position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; width:100%;">
        <div class="result-main">
          <div>
            <div class="result-name">🚗 ${c.carModel}</div>
            <div class="result-meta">${c.carType} · ${c.seatCapacity} seats · ★ ${c.rating} · Driver: ${c.driverName}</div>
          </div>
          <div class="time-block"><div class="time">${formatTime12h(c.pickupTime)}</div><div class="city">${c.fromCity}</div></div>
          <div class="arrow">→</div>
          <div class="time-block"><div class="time">--:--</div><div class="city">${c.toCity}</div></div>
        </div>
        <div class="price-block">
          <div class="amt">${fmtCurrency(c.currentPrice)}</div>
          <div class="seats ${!c.available ? 'low' : ''}">${c.available ? 'Available now' : 'Unavailable'}</div>
          <button class="btn btn-primary btn-sm mt-8" ${!c.available ? 'disabled' : ''} onclick='selectCar(${safeJson})'>Book This Car</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function selectCar(car) {
  selectedCar = car;
  discountAmount = 0;
  appliedCouponCode = null;
  document.getElementById('resultsSection').classList.add('hidden');
  document.getElementById('passengerSection').classList.remove('hidden');
  document.getElementById('carTitle').textContent = car.carModel + ' (' + car.carType + ') — ' + car.fromCity + ' to ' + car.toCity;
  refreshSummary();
  generateCaptcha();
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
  var base = selectedCar.currentPrice;
  totalAmount = Math.max(0, base - discountAmount);
  document.getElementById('sumBase').textContent = fmtCurrency(base);
  document.getElementById('sumDiscount').textContent = '-' + fmtCurrency(discountAmount);
  document.getElementById('sumTotal').textContent = fmtCurrency(totalAmount);
}

async function applyCoupon() {
  var code = document.getElementById('couponCode').value.trim();
  var msg = document.getElementById('couponMsg');
  if (!code) return;
  try {
    var coupon = await post('/coupons/validate/' + code);
    discountAmount = selectedCar.currentPrice * (coupon.discountPercent / 100);
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
  var errEl = document.getElementById('passengerErr');
  errEl.style.display = 'none';

  var name = document.getElementById('passengerName').value.trim();
  var age = document.getElementById('passengerAge').value;
  if (!name || !age) {
    errEl.textContent = 'Please fill in passenger details';
    errEl.style.display = 'block';
    return;
  }

  if (!validateCaptcha()) return;

  var code = document.getElementById('couponCode').value.trim();
  if (code && !appliedCouponCode) {
    errEl.textContent = 'Please click "Apply" to validate your coupon code first.';
    errEl.style.display = 'block';
    return;
  }

  document.getElementById('passengerSection').classList.add('hidden');
  document.getElementById('paymentSection').classList.remove('hidden');
  updateSteps('payment');

  document.getElementById('payCarInfo').textContent = selectedCar.carModel + ' (' + selectedCar.carType + ') · ' + selectedCar.fromCity + ' → ' + selectedCar.toCity;
  var base = selectedCar.currentPrice;
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
  var name = document.getElementById('passengerName').value.trim();
  var age = document.getElementById('passengerAge').value;

  try {
    var booking = await post('/bookings', {
      bookingType: 'CAR',
      referenceId: selectedCar.id,
      fromLocation: selectedCar.fromCity,
      toLocation: selectedCar.toCity,
      travelDate: selectedCar.travelDate,
      passengerCount: 1,
      passengerDetails: JSON.stringify({
        name: name,
        age: age,
        gender: document.getElementById('passengerGender').value,
        caption: document.getElementById('caption').value
      }),
      couponCode: appliedCouponCode
    });

    document.getElementById('paymentSection').classList.add('hidden');
    document.getElementById('confirmSection').classList.remove('hidden');
    updateSteps('confirm');

    document.getElementById('confirmMsg').textContent = 'Booking #' + booking.id + ' confirmed for ' + fmtCurrency(booking.finalAmount) + '.';

    document.getElementById('paymentReceipt').innerHTML = '<strong>Payment Receipt</strong><br>' +
      'Method: ' + paymentInfo.method + '<br>' +
      (paymentInfo.method === 'UPI' ? 'UPI ID: ' : paymentInfo.method === 'Card' ? 'Card: ****' + paymentInfo.detail.slice(-4) : 'Ref: ') + paymentInfo.detail + '<br>' +
      'Amount Paid: ' + fmtCurrency(booking.finalAmount) + '<br>' +
      'Status: <span style="color:var(--success);font-weight:600;">Paid ✓</span>';

    if (window.showTicket3D) {
      setTimeout(function() {
        window.showTicket3D({
          type: 'CAR',
          bookingId: booking.id,
          name: name,
          from: selectedCar.fromCity,
          to: selectedCar.toCity,
          date: selectedCar.travelDate,
          amount: booking.finalAmount,
          transport: selectedCar.carModel,
          method: paymentInfo.method
        });
      }, 500);
    }
  } catch (err) {
    document.getElementById('paymentSection').classList.add('hidden');
    document.getElementById('passengerSection').classList.remove('hidden');
    var errEl = document.getElementById('passengerErr');
    errEl.textContent = 'Booking failed: ' + err.message;
    errEl.style.display = 'block';
    updateSteps('passenger');
  }
}
