let selectedHotel = null;
let selectedRoom = null;
let discountAmount = 0;
let appliedCouponCode = null;
let totalAmount = 0;
let currentHotels = [];

function updateSteps(active) {
  const steps = ['stepSeats', 'stepPassenger', 'stepPayment', 'stepConfirm'];
  const map = { seats: 0, passenger: 1, payment: 2, confirm: 3 };
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
  const location = document.getElementById('location').value.trim();
  const date = document.getElementById('travelDate').value;

  const el = document.getElementById('hotelResults');
el.innerHTML = renderLoading('Searching for hotels', 'Finding best stays and room availability');
  startLoadingDots();
document.getElementById('resultsSection').classList.remove('hidden');
  document.getElementById('hotelDetailSection').classList.add('hidden');
  document.getElementById('roomSection').classList.add('hidden');
  document.getElementById('passengerSection').classList.add('hidden');
  document.getElementById('paymentSection').classList.add('hidden');

try {
    const hotels = await fallbackSearch(
      () => get(`/search/hotels?location=${encodeURIComponent(location)}&date=${date}`),
      () => generateMockHotels(location, date, 8),
      6000
    );
    renderHotels(Array.isArray(hotels) ? hotels : []);
  } catch (err) {
    renderHotels([]);
  } finally {
    stopLoadingDots();
  }
  // Safety net: guarantee the loading UI always clears even if the
  // promise chain above somehow hangs or never settles.
  setTimeout(function() {
    stopLoadingDots();
    var resultsEl = document.getElementById('hotelResults');
    if (resultsEl && resultsEl.querySelector('.loading-container')) {
      resultsEl.innerHTML = renderNoResults('No hotels found. Please try again.');
    }
  }, 12000);
});

function renderHotels(hotels) {
  const el = document.getElementById('hotelResults');
  if (!hotels.length) {
    el.innerHTML = renderNoResults('No hotels found for this location. Try "Jaipur", "Mumbai", "Goa" or another city.');
    return;
  }
  // Store for index-based lookups (avoids fragile inline JSON escaping)
  currentHotels = hotels;
  el.innerHTML = `<div class="room-grid">` + hotels.map((h, idx) => `
    <div class="card hotel-list-card" data-idx="${idx}" onclick="showHotelDetailById(${idx})" style="cursor:pointer;">
      <img src="${h.imageUrl || ''}?auto=format&fit=crop&w=500&q=60" alt="${h.hotelName || ''}" style="border-radius:10px; height:160px; width:100%; object-fit:cover; margin-bottom:12px;">
      <div class="flex-between">
        <strong>${h.hotelName || ''}</strong>
        <span class="stars" style="font-size:12px;">★ ${h.rating || 0}</span>
      </div>
      <p class="muted" style="font-size:13px; margin:4px 0 10px;">${h.location || ''}</p>
      <p class="muted" style="font-size:12px; margin-bottom:12px;">${((h.amenities || '') + '').split(',').join(' · ')}</p>
      <div class="flex-between">
        <div>
          <div style="font-weight:700; font-size:18px;">${fmtCurrency(h.currentPrice)}<span class="muted" style="font-size:12px; font-weight:400;">/night</span></div>
          <div class="muted" style="font-size:12px;">${h.availableRooms || 0} rooms left</div>
        </div>
        <button class="btn btn-primary btn-sm" style="cursor:pointer;">View Details</button>
      </div>
    </div>`).join('') + `</div>`;
}

function showHotelDetailById(idx) {
  const hotel = currentHotels[idx];
  if (!hotel) return;
  showHotelDetail(hotel);
}

function showHotelDetail(hotel) {
  selectedHotel = hotel;
  selectedRoom = null;
  discountAmount = 0;
  appliedCouponCode = null;
  document.getElementById('resultsSection').classList.add('hidden');
  document.getElementById('hotelDetailSection').classList.remove('hidden');
  document.getElementById('roomSection').classList.add('hidden');
  document.getElementById('passengerSection').classList.add('hidden');
  document.getElementById('paymentSection').classList.add('hidden');

  const amenities = (hotel.amenities || 'Free WiFi,Parking,Breakfast,AC,Restaurant,Gym').split(',');
  const features = [
    'Free Cancellation', 'Instant Confirmation', '24x7 Front Desk',
    'Housekeeping', 'Room Service', 'Airport Transfer'
  ];

  const stars = '★'.repeat(Math.round(hotel.rating || 0)) + '☆'.repeat(5 - Math.round(hotel.rating || 0));

  document.getElementById('hotelDetailContent').innerHTML = `
    <div class="card hotel-detail-hero mb-16">
      <img src="${hotel.imageUrl}?auto=format&fit=crop&w=900&q=70" alt="${hotel.hotelName}" class="hotel-detail-img">
      <div class="hotel-detail-overlay">
        <div class="flex-between" style="align-items:flex-end; flex-wrap:wrap; gap:12px;">
          <div>
            <h3>🏨 ${hotel.hotelName}</h3>
            <p class="muted" style="margin-top:4px;">${hotel.location} · ${hotel.roomType || 'Deluxe'} Rooms</p>
            <div class="stars" style="font-size:16px; margin-top:6px;">${stars} <span class="muted" style="font-size:13px; font-weight:600;">${hotel.rating}</span></div>
          </div>
          <div class="text-right">
            <div style="font-size:26px; font-weight:700; color:var(--gold);">${fmtCurrency(hotel.currentPrice)}<span class="muted" style="font-size:13px; font-weight:400;">/night</span></div>
            <div class="muted" style="font-size:13px;">${hotel.availableRooms} rooms left</div>
            <span class="tag tag-confirmed" style="margin-top:6px; display:inline-block;">✅ Available</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-2 mb-16" style="align-items:start;">
      <div>
        <div class="card mb-16">
          <h4 class="mb-12" style="font-size:16px;">🛎️ Facilities & Amenities</h4>
          <div class="hotel-amenity-grid">
            ${amenities.map(a => `<span class="hotel-amenity">✔️ ${a.trim()}</span>`).join('')}
          </div>
        </div>

        <div class="card">
          <h4 class="mb-12" style="font-size:16px;">✨ Features & Highlights</h4>
          <div class="hotel-amenity-grid">
            ${features.map(f => `<span class="hotel-amenity">⭐ ${f}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="card">
        <h4 class="mb-12" style="font-size:16px;">📊 Ratings</h4>
        <div class="hotel-rating-big">
          <span class="rating-score">${hotel.rating}</span>
          <span class="stars" style="font-size:20px;">${stars}</span>
        </div>
        <div class="rating-bars">
          <div class="rating-bar"><span>Cleanliness</span><div class="bar"><div class="bar-fill" style="width:${Math.round((hotel.rating/5)*90)}%"></div></div></div>
          <div class="rating-bar"><span>Service</span><div class="bar"><div class="bar-fill" style="width:${Math.round((hotel.rating/5)*85)}%"></div></div></div>
          <div class="rating-bar"><span>Location</span><div class="bar"><div class="bar-fill" style="width:${Math.round((hotel.rating/5)*95)}%"></div></div></div>
          <div class="rating-bar"><span>Value for Money</span><div class="bar"><div class="bar-fill" style="width:${Math.round((hotel.rating/5)*80)}%"></div></div></div>
        </div>
        <p class="muted" style="font-size:13px; margin-top:10px;">Based on verified guest ratings</p>
      </div>
    </div>

    <!-- Reviews -->
    <div class="card mb-16">
      <div class="flex-between" style="align-items:center;">
        <h4 class="mb-8" style="font-size:16px;">💬 Guest Reviews</h4>
<select id="hotelReviewSort" style="padding:6px 10px; border-radius:8px; border:1.5px solid var(--border); font-size:13px;" onchange="loadHotelReviews()">
          <option value="newest">Newest</option>
          <option value="helpful">Most Helpful</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>
      <p class="muted" id="hotelReviewsCount"></p>
      <div id="hotelReviewsList" class="mt-8"></div>
      <button class="btn btn-outline btn-sm mt-16" style="cursor:pointer;" onclick="showHotelReviewForm()">✍️ Write a Review</button>

      <div id="hotelReviewFormSection" class="hidden mt-16">
        <h4 class="mb-8" style="font-size:15px;">Write a Review</h4>
        <div class="form-group">
          <label>Rating</label>
          <div class="star-rating">
            <label><input type="radio" name="hReviewRating" value="1"> 1</label>
            <label><input type="radio" name="hReviewRating" value="2"> 2</label>
            <label><input type="radio" name="hReviewRating" value="3"> 3</label>
            <label><input type="radio" name="hReviewRating" value="4"> 4</label>
            <label><input type="radio" name="hReviewRating" value="5"> 5</label>
          </div>
        </div>
        <div class="form-group"><label>Comment</label><textarea id="hotelReviewComment" rows="3" style="width:100%; padding:10px 12px; border-radius:8px; border:1.5px solid var(--border); font-size:13px;"></textarea></div>
        <div class="form-group"><label>Photo URLs (optional)</label><input type="text" id="hotelReviewPhotos" placeholder="Comma-separated image URLs"></div>
        <div class="flex gap-8">
          <button class="btn btn-primary btn-sm" style="cursor:pointer;" onclick="submitHotelReview()">Submit Review</button>
          <button class="btn btn-outline btn-sm" style="cursor:pointer;" onclick="closeHotelReviewForm()">Cancel</button>
        </div>
        <p class="error-text" id="hotelReviewMsg"></p>
      </div>
    </div>

<!-- Book button -->
    <div class="card hotel-book-bar">
      <div class="flex-between" style="align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <div style="font-size:20px; font-weight:700;">${fmtCurrency(hotel.currentPrice)}<span class="muted" style="font-size:13px; font-weight:400;">/night</span></div>
          <div class="muted" style="font-size:13px;">${hotel.availableRooms} rooms available on this date</div>
        </div>
<div>
          <button class="btn btn-primary btn-sm" data-no-magnetic style="cursor:pointer;" onclick="proceedFromHotelDetail()">Book Now</button>
        </div>
      </div>
    </div>
`;

document.getElementById('hotelDetailSection').scrollIntoView({ behavior: 'smooth' });
  loadHotelReviews();
  injectHotelBubbles();
}

function injectHotelBubbles() {
  let container = document.getElementById('hotelBubbles');
  if (!container) {
    container = document.createElement('div');
    container.id = 'hotelBubbles';
    container.className = 'hotel-detail-floaties';
    container.style.cssText = 'position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:0;';
    const hero = document.querySelector('.hotel-detail-hero');
    if (hero) hero.appendChild(container);
  }
  container.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const b = document.createElement('div');
    b.className = 'hotel-bubble';
    const size = 12 + Math.random() * 30;
    b.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (Math.random() * 90) + '%;bottom:-40px;' +
      'animation-duration:' + (8 + Math.random() * 8) + 's;animation-delay:' + (Math.random() * 6) + 's;';
    container.appendChild(b);
  }
}

function proceedFromHotelDetail() {
  try {
    if (!selectedHotel) {
      alert('Please select a hotel first.');
      return;
    }

    // Guard against missing price fields so room pricing never shows NaN.
    if (selectedHotel.basePrice == null) selectedHotel.basePrice = selectedHotel.currentPrice || 0;
    if (selectedHotel.currentPrice == null) selectedHotel.currentPrice = selectedHotel.basePrice || 0;
    if (selectedHotel.availableRooms == null) selectedHotel.availableRooms = 0;

    // Derive a default room from the hotel's configured room type so the
    // summary/pricing works without requiring the room-selection step.
    const roomType = (selectedHotel.roomType || 'Deluxe');
    const names = ['Standard', 'Deluxe', 'Suite'];
    const idx = names.findIndex(n => (roomType + '').toLowerCase().indexOf(n.toLowerCase()) >= 0);
    const target = idx >= 0 ? idx : 1; // default to Deluxe (index 1)
    const multipliers = [{ name: 'Standard Room', priceMultiplier: 1 }, { name: 'Deluxe Room', priceMultiplier: 1.35 }, { name: 'Suite', priceMultiplier: 2.0 }];
    const baseRoom = multipliers[target];

    selectedRoom = {
      name: baseRoom.name,
      priceMultiplier: baseRoom.priceMultiplier,
      upgrade: target === 0 ? 0 : (target === 1 ? 0.35 : 1.0),
      price: Math.round(selectedHotel.basePrice * baseRoom.priceMultiplier)
    };

    // Go DIRECTLY to the Guest Details section (per FIX_PLAN.md), skipping room selection.
    document.getElementById('hotelDetailSection').classList.add('hidden');
    document.getElementById('roomSection').classList.add('hidden');
    document.getElementById('passengerSection').classList.remove('hidden');
    refreshSummary();
    generateCaptcha();
    updateSteps('passenger');
    document.getElementById('passengerSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    console.error('proceedFromHotelDetail error:', err);
    alert('Sorry, something went wrong while starting the booking. Please try again.');
  }
}

function selectHotel(hotel) {
  selectedHotel = hotel;
  selectedRoom = null;
  discountAmount = 0;
  appliedCouponCode = null;
  document.getElementById('resultsSection').classList.add('hidden');
  document.getElementById('hotelDetailSection').classList.add('hidden');
  document.getElementById('hotelRoomTitle').textContent = `${hotel.hotelName} — ${hotel.location}`;
  document.getElementById('hotelRoomMeta').textContent = `★ ${hotel.rating} · ${hotel.availableRooms} rooms available`;
  renderRoomTypes(hotel);
  document.getElementById('selectedRoomLabel').textContent = 'No room selected';
  document.getElementById('proceedToGuestBtn').disabled = true;
  document.getElementById('roomSection').classList.remove('hidden');
  updateSteps('seats');
  document.getElementById('roomSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderRoomTypes(hotel) {
  const el = document.getElementById('roomTypeGrid');
  const roomTypes = [
    { name: 'Standard Room', desc: 'Comfortable standard accommodation', price: hotel.basePrice, upgrade: 0, available: Math.floor(hotel.availableRooms * 0.5), img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=500&q=60' },
    { name: 'Deluxe Room', desc: 'Spacious room with premium amenities', price: Math.round(hotel.basePrice * 1.35), upgrade: Math.round(hotel.basePrice * 0.35), available: Math.floor(hotel.availableRooms * 0.3), img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=500&q=60' },
    { name: 'Suite', desc: 'Luxury suite with living area and city view', price: Math.round(hotel.basePrice * 2.0), upgrade: Math.round(hotel.basePrice * 1.0), available: Math.floor(hotel.availableRooms * 0.2), img: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e?auto=format&fit=crop&w=500&q=60' }
  ];

  el.innerHTML = roomTypes.map((rt, idx) => `
    <div class="room-card" data-room-index="${idx}" onclick="selectRoomType(${idx})">
      <div style="position:relative;">
        <img src="${rt.img}" alt="${rt.name}">
        <span class="preview-3d-badge" onclick="event.stopPropagation(); showRoomPreview('${rt.img}', '${rt.name}')">🔄 3D View</span>
      </div>
      <div class="room-info">
        <h4>${rt.name}</h4>
        <div class="room-rating">★ ${hotel.rating}</div>
        <p class="room-amenities">${rt.desc}</p>
        <div class="room-price">${fmtCurrency(rt.price)} <span class="muted" style="font-size:12px;font-weight:400;">/night</span></div>
        <div class="muted" style="font-size:12px;margin-top:4px;">${rt.available} rooms left</div>
        ${rt.upgrade > 0 ? `<span class="tag tag-confirmed" style="margin-top:6px;display:inline-block;">Upgrade +${fmtCurrency(rt.upgrade)}</span>` : ''}
      </div>
    </div>
  `).join('');
}

function selectRoomType(index) {
  const cards = document.querySelectorAll('.room-card');
  cards.forEach(c => c.classList.remove('selected'));

  const card = cards[index];
  if (!card) return;
  card.classList.add('selected');

  const roomTypes = [
    { name: 'Standard Room', priceMultiplier: 1, upgrade: 0 },
    { name: 'Deluxe Room', priceMultiplier: 1.35, upgrade: 0.35 },
    { name: 'Suite', priceMultiplier: 2.0, upgrade: 1.0 }
  ];

  selectedRoom = roomTypes[index];
  selectedRoom.price = Math.round(selectedHotel.basePrice * selectedRoom.priceMultiplier);

  document.getElementById('selectedRoomLabel').textContent =
    `Selected: ${selectedRoom.name} — ${fmtCurrency(selectedRoom.price)}/night`;
  document.getElementById('proceedToGuestBtn').disabled = false;
}

/* ============================================================
   Save Room Preference for future bookings
   ============================================================ */
function saveRoomPreference() {
  if (!selectedRoom || !selectedHotel) return;
  var prefs = JSON.parse(localStorage.getItem('twu_preferences') || '{}');
  prefs[selectedHotel.hotelName] = {
    roomName: selectedRoom.name,
    price: selectedRoom.price,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem('twu_preferences', JSON.stringify(prefs));
  var btn = document.getElementById('savePrefBtn');
  if (btn) {
    btn.textContent = '✅ Preference Saved';
    btn.disabled = true;
    setTimeout(function() {
      btn.textContent = '💾 Save Preference';
      btn.disabled = false;
    }, 2000);
  }
}

/* ============================================================
   Toggle 3D Preview overlay for room images
   ============================================================ */
function showRoomPreview(imgSrc, roomName) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed; inset:0; z-index:3000; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; cursor:pointer;';
  overlay.innerHTML = '<div style="position:relative; max-width:90vw; max-height:90vh; text-align:center;">' +
    '<img src="' + imgSrc + '" style="max-width:100%; max-height:85vh; border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.5);">' +
    '<p style="color:#fff; margin-top:12px; font-size:14px;">' + roomName + ' — Click anywhere to close</p>' +
  '</div>';
  overlay.onclick = function() { overlay.remove(); };
  document.body.appendChild(overlay);
}

function backToResults() {
  document.getElementById('hotelDetailSection').classList.add('hidden');
  document.getElementById('roomSection').classList.add('hidden');
  document.getElementById('resultsSection').classList.remove('hidden');
}

function backToHotelResults() {
  document.getElementById('roomSection').classList.add('hidden');
  document.getElementById('resultsSection').classList.remove('hidden');
}

function backToHotelDetail() {
  document.getElementById('passengerSection').classList.add('hidden');
  document.getElementById('hotelDetailSection').classList.remove('hidden');
  updateSteps('seats');
}

function backToRoom() {
  document.getElementById('passengerSection').classList.add('hidden');
  document.getElementById('roomSection').classList.remove('hidden');
  updateSteps('seats');
}

function showGuestStep() {
  document.getElementById('roomSection').classList.add('hidden');
  document.getElementById('passengerSection').classList.remove('hidden');
  refreshSummary();
  generateCaptcha();
  updateSteps('passenger');
}

function backToGuest() {
  document.getElementById('paymentSection').classList.add('hidden');
  document.getElementById('passengerSection').classList.remove('hidden');
  updateSteps('passenger');
}

function refreshSummary() {
  const base = selectedRoom ? selectedRoom.price : selectedHotel.currentPrice;
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
    const base = selectedRoom ? selectedRoom.price : selectedHotel.currentPrice;
    discountAmount = base * (coupon.discountPercent / 100);
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

  const name = document.getElementById('guestName').value.trim();
  const email = document.getElementById('guestEmail').value.trim();
  if (!name) {
    errEl.textContent = 'Please fill in guest details';
    errEl.style.display = 'block';
    return;
  }

  if (!validateCaptcha()) return;

  const code = document.getElementById('couponCode').value.trim();
  if (code && !appliedCouponCode) {
    errEl.textContent = 'Please click "Apply" to validate your coupon code first.';
    errEl.style.display = 'block';
    return;
  }

  document.getElementById('passengerSection').classList.add('hidden');
  document.getElementById('paymentSection').classList.remove('hidden');
  updateSteps('payment');

  const base = selectedRoom ? selectedRoom.price : selectedHotel.currentPrice;
  document.getElementById('payHotelInfo').textContent = `${selectedHotel.hotelName}, ${selectedHotel.location}`;
  document.getElementById('payRoomInfo').textContent = selectedRoom ? selectedRoom.name : selectedHotel.roomType;
  document.getElementById('payBase').textContent = fmtCurrency(base);
  document.getElementById('payDiscount').textContent = '-' + fmtCurrency(discountAmount);
  document.getElementById('payTotal').textContent = fmtCurrency(totalAmount);

  renderPaymentMethods('paymentMethodsContainer');
  document.getElementById('paymentAmountLabel').textContent = fmtCurrency(totalAmount);
}

document.addEventListener('paymentComplete', async (e) => {
  await confirmHotelBooking(e.detail);
});

async function confirmHotelBooking(paymentInfo) {
  const name = document.getElementById('guestName').value.trim();
  const email = document.getElementById('guestEmail').value.trim();
  const phone = document.getElementById('guestPhone').value.trim();

  try {
    const booking = await post('/bookings', {
      bookingType: 'HOTEL',
      referenceId: selectedHotel.id,
      fromLocation: selectedHotel.location,
      toLocation: selectedHotel.location,
      travelDate: document.getElementById('travelDate') ? document.getElementById('travelDate').value : '',
      passengerCount: 1,
      passengerDetails: JSON.stringify({
        name, email, phone,
        caption: (selectedRoom ? `Room: ${selectedRoom.name}` : '')
      }),
      couponCode: appliedCouponCode
    });

    document.getElementById('paymentSection').classList.add('hidden');
    document.getElementById('confirmSection').classList.remove('hidden');
    updateSteps('confirm');

    const roomName = selectedRoom ? selectedRoom.name : selectedHotel.roomType;
    document.getElementById('confirmMsg').textContent =
      `Booking #${booking.id} confirmed for ${fmtCurrency(booking.finalAmount)}. Room: ${roomName}`;

document.getElementById('paymentReceipt').innerHTML = `
      <strong>Payment Receipt</strong><br>
      Method: ${paymentInfo.method}<br>
      ${paymentInfo.method === 'UPI' ? 'UPI ID: ' : paymentInfo.method === 'Card' ? 'Card: ****' + paymentInfo.detail.slice(-4) : 'Ref: '} ${paymentInfo.detail}<br>
      Amount Paid: ${fmtCurrency(booking.finalAmount)}<br>
      Status: <span style="color:var(--success);font-weight:600;">Paid ✓</span>
    `;

    // Show the polished 3D ticket for hotel bookings (consistent with flight/bus flows).
    if (window.showTicket3D) {
      setTimeout(function() {
        window.showTicket3D({
          type: 'HOTEL',
          bookingId: booking.id,
          name: name,
          from: selectedHotel.hotelName,
          to: selectedHotel.location,
          date: document.getElementById('travelDate') ? document.getElementById('travelDate').value : new Date().toISOString().split('T')[0],
          amount: booking.finalAmount,
          transport: roomName,
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

// ========== HOTEL REVIEWS ==========
async function loadHotelReviews() {
  if (!selectedHotel) return;
  const sort = document.getElementById('hotelReviewSort').value;
  try {
    const reviews = await get(`/reviews/public/HOTEL/${selectedHotel.id}?sort=${sort}`);
    const listEl = document.getElementById('hotelReviewsList');
    const countEl = document.getElementById('hotelReviewsCount');

    if (!reviews.length) {
      countEl.textContent = 'No reviews yet. Be the first to review!';
      listEl.innerHTML = '<p class="muted">No reviews yet.</p>';
      return;
    }

    countEl.textContent = `${reviews.length} review(s)`;

    listEl.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="review-head">
          <div>
            <strong>${r.user ? r.user.name : 'Anonymous'}</strong>
            <span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          </div>
          <div class="review-date">${new Date(r.createdAt).toLocaleDateString()}</div>
        </div>
        <div class="review-body"><p>${r.comment}</p></div>
        <div class="review-actions">
          <button onclick="flagHotelReview(${r.id})">🚩 Flag as inappropriate</button>
          <button onclick="helpfulHotelReview(${r.id}, this)">👍 Helpful (${r.helpfulCount})</button>
          <button onclick="toggleHotelReplyForm(${r.id})">💬 Reply</button>
        </div>
        <div id="hReplyForm-${r.id}" class="hidden mt-8">
          <div class="flex gap-8">
            <input type="text" id="hReplyInput-${r.id}" placeholder="Write a reply..." style="flex:1;padding:8px 12px;border-radius:8px;border:1.5px solid var(--border);font-size:13px;">
            <button class="btn btn-primary btn-sm" onclick="submitHotelReply(${r.id})">Post</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    document.getElementById('hotelReviewsList').innerHTML = `<p class="error-text" style="display:block;">${err.message}</p>`;
  }
}

function showHotelReviewForm() {
  document.getElementById('hotelReviewFormSection').classList.remove('hidden');
  document.getElementById('hotelReviewFormSection').scrollIntoView({ behavior: 'smooth' });
}

function closeHotelReviewForm() {
  document.getElementById('hotelReviewFormSection').classList.add('hidden');
  document.getElementById('hotelReviewMsg').style.display = 'none';
}

async function submitHotelReview() {
  const rating = document.querySelector('input[name="hReviewRating"]:checked');
  const comment = document.getElementById('hotelReviewComment').value.trim();
  const photos = document.getElementById('hotelReviewPhotos').value.trim();
  const msg = document.getElementById('hotelReviewMsg');
  msg.style.display = 'none';

  if (!rating) { msg.textContent = 'Please select a rating'; msg.style.display = 'block'; return; }
  if (!comment) { msg.textContent = 'Please write a review'; msg.style.display = 'block'; return; }

  try {
    await post('/reviews', {
      targetType: 'HOTEL',
      targetId: selectedHotel.id,
      rating: parseInt(rating.value),
      comment: comment,
      photoUrls: photos
    });
    msg.textContent = 'Review submitted successfully!';
    msg.style.color = 'var(--success)';
    msg.style.display = 'block';
    document.getElementById('hotelReviewComment').value = '';
    document.getElementById('hotelReviewPhotos').value = '';
    document.querySelectorAll('input[name="hReviewRating"]').forEach(r => r.checked = false);
    setTimeout(() => { closeHotelReviewForm(); loadHotelReviews(); }, 1500);
  } catch (err) {
    msg.textContent = err.message;
    msg.style.color = 'var(--danger)';
    msg.style.display = 'block';
  }
}

async function flagHotelReview(id) {
  try { await post(`/reviews/${id}/flag`); alert('Review flagged for moderation.'); }
  catch (err) { alert(err.message); }
}

async function helpfulHotelReview(id, btn) {
  try {
    const review = await post(`/reviews/${id}/helpful`);
    btn.textContent = `👍 Helpful (${review.helpfulCount})`;
  } catch (err) { alert(err.message); }
}

function toggleHotelReplyForm(reviewId) {
  const f = document.getElementById(`hReplyForm-${reviewId}`);
  f.classList.toggle('hidden');
}

async function submitHotelReply(reviewId) {
  const input = document.getElementById(`hReplyInput-${reviewId}`);
  const text = input.value.trim();
  if (!text) return;
  try { await post(`/reviews/${reviewId}/reply`, { comment: text }); input.value = ''; document.getElementById(`hReplyForm-${reviewId}`).classList.add('hidden'); }
  catch (err) { alert(err.message); }
}
