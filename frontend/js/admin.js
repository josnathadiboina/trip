let currentFleet = 'buses';

document.addEventListener('DOMContentLoaded', async () => {
  await loadSummary();
  await loadFleet('buses');
  setupAddForm();
});

async function loadSummary() {
  const s = await get('/admin/summary');
  document.getElementById('summaryCards').innerHTML = `
    <div class="card"><div class="muted" style="font-size:12px;">TOTAL BOOKINGS</div><div style="font-size:26px; font-weight:700;">${s.totalBookings}</div></div>
    <div class="card"><div class="muted" style="font-size:12px;">FLEET SIZE</div><div style="font-size:26px; font-weight:700;">${s.totalBuses + s.totalCars + s.totalTrains + s.totalFlights}</div></div>
    <div class="card"><div class="muted" style="font-size:12px;">OPEN ISSUES</div><div style="font-size:26px; font-weight:700; color:var(--danger);">${s.openIssues}</div></div>
    <div class="card"><div class="muted" style="font-size:12px;">PENDING REFUNDS</div><div style="font-size:26px; font-weight:700; color:var(--gold);">${s.pendingRefunds}</div></div>
  `;
}

function showAdminTab(name, btn) {
  ['availability', 'issues', 'coupons', 'bookings', 'refunds', 'reviews'].forEach(t => {
    document.getElementById('admin-' + t).classList.toggle('hidden', t !== name);
  });
  btn.parentElement.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (name === 'issues') loadIssuesAdmin();
  if (name === 'coupons') loadCouponsAdmin();
  if (name === 'bookings') loadBookingsAdmin();
  if (name === 'refunds') loadRefundsAdmin();
  if (name === 'reviews') loadReviewsAdmin();
}

function showFleet(type, btn) {
  currentFleet = type;
  document.querySelectorAll('#admin-availability .mode-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadFleet(type);
  setupAddForm();
}

/* ---------- ADD NEW ITEM FORM ---------- */
const FLEET_FIELD_CONFIGS = {
  buses: [
    { id: 'operatorName', label: 'Operator Name', type: 'text', placeholder: 'e.g. RoyalCruiser Travels' },
    { id: 'busType', label: 'Bus Type', type: 'select', options: ['AC Sleeper', 'AC Seater', 'Non-AC Sleeper', 'Non-AC Seater'] },
    { id: 'fromCity', label: 'From City', type: 'text', placeholder: 'e.g. Delhi' },
    { id: 'toCity', label: 'To City', type: 'text', placeholder: 'e.g. Jaipur' },
    { id: 'departureTime', label: 'Departure Time', type: 'text', placeholder: 'e.g. 22:00' },
    { id: 'arrivalTime', label: 'Arrival Time', type: 'text', placeholder: 'e.g. 05:30' },
    { id: 'travelDate', label: 'Travel Date', type: 'date' },
    { id: 'totalSeats', label: 'Total Seats', type: 'number', value: 40 },
    { id: 'availableSeats', label: 'Available Seats', type: 'number', value: 40 },
    { id: 'basePrice', label: 'Base Price (₹)', type: 'number', value: 899 },
    { id: 'rating', label: 'Rating', type: 'number', value: 4.0, step: 0.1 },
  ],
  cars: [
    { id: 'carModel', label: 'Car Model', type: 'text', placeholder: 'e.g. Toyota Etios' },
    { id: 'carType', label: 'Car Type', type: 'select', options: ['Sedan', 'SUV', 'Hatchback', 'Luxury Sedan'] },
    { id: 'fromCity', label: 'From City', type: 'text', placeholder: 'e.g. Delhi' },
    { id: 'toCity', label: 'To City', type: 'text', placeholder: 'e.g. Jaipur' },
    { id: 'travelDate', label: 'Travel Date', type: 'date' },
    { id: 'pickupTime', label: 'Pickup Time', type: 'text', placeholder: 'e.g. 06:00' },
    { id: 'seatCapacity', label: 'Seat Capacity', type: 'number', value: 4 },
    { id: 'basePrice', label: 'Base Price (₹)', type: 'number', value: 2999 },
    { id: 'driverName', label: 'Driver Name', type: 'text', placeholder: 'e.g. Ramesh Kumar' },
    { id: 'rating', label: 'Rating', type: 'number', value: 4.5, step: 0.1 },
  ],
  trains: [
    { id: 'trainName', label: 'Train Name', type: 'text', placeholder: 'e.g. Pink City Express' },
    { id: 'trainNumber', label: 'Train Number', type: 'text', placeholder: 'e.g. 12958' },
    { id: 'fromCity', label: 'From City', type: 'text', placeholder: 'e.g. Delhi' },
    { id: 'toCity', label: 'To City', type: 'text', placeholder: 'e.g. Jaipur' },
    { id: 'departureTime', label: 'Departure Time', type: 'text', placeholder: 'e.g. 06:10' },
    { id: 'arrivalTime', label: 'Arrival Time', type: 'text', placeholder: 'e.g. 10:50' },
    { id: 'travelDate', label: 'Travel Date', type: 'date' },
    { id: 'travelClass', label: 'Travel Class', type: 'select', options: ['Sleeper', 'AC 3-Tier', 'AC 2-Tier', 'AC First', 'AC Chair Car'] },
    { id: 'totalSeats', label: 'Total Seats', type: 'number', value: 72 },
    { id: 'availableSeats', label: 'Available Seats', type: 'number', value: 72 },
    { id: 'basePrice', label: 'Base Price (₹)', type: 'number', value: 650 },
  ],
  flights: [
    { id: 'airline', label: 'Airline', type: 'text', placeholder: 'e.g. IndiGo' },
    { id: 'flightNumber', label: 'Flight Number', type: 'text', placeholder: 'e.g. 6E-2031' },
    { id: 'fromCity', label: 'From City', type: 'text', placeholder: 'e.g. Delhi' },
    { id: 'toCity', label: 'To City', type: 'text', placeholder: 'e.g. Jaipur' },
    { id: 'departureTime', label: 'Departure Time', type: 'text', placeholder: 'e.g. 09:15' },
    { id: 'arrivalTime', label: 'Arrival Time', type: 'text', placeholder: 'e.g. 10:20' },
    { id: 'travelDate', label: 'Travel Date', type: 'date' },
    { id: 'totalSeats', label: 'Total Seats', type: 'number', value: 180 },
    { id: 'availableSeats', label: 'Available Seats', type: 'number', value: 180 },
    { id: 'basePrice', label: 'Base Price (₹)', type: 'number', value: 2899 },
  ],
  hotels: [
    { id: 'hotelName', label: 'Hotel Name', type: 'text', placeholder: 'e.g. Taj Jai Mahal Palace' },
    { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Jaipur' },
    { id: 'roomType', label: 'Room Type', type: 'select', options: ['Standard', 'Deluxe', 'Suite'] },
    { id: 'totalRooms', label: 'Total Rooms', type: 'number', value: 30 },
    { id: 'availableRooms', label: 'Available Rooms', type: 'number', value: 30 },
    { id: 'basePrice', label: 'Base Price per Night (₹)', type: 'number', value: 4999 },
    { id: 'rating', label: 'Rating', type: 'number', value: 4.5, step: 0.1 },
    { id: 'imageUrl', label: 'Image URL', type: 'text', placeholder: 'https://images.unsplash.com/...' },
    { id: 'amenities', label: 'Amenities (comma separated)', type: 'text', placeholder: 'Pool,Spa,Free WiFi' },
  ],
};

function setupAddForm() {
  const configs = FLEET_FIELD_CONFIGS[currentFleet];
  if (!configs) return;

  const titleMap = { buses: 'Bus', cars: 'Car', trains: 'Train', flights: 'Flight', hotels: 'Hotel' };
  document.getElementById('addFormTitle').textContent = `Add New ${titleMap[currentFleet]}`;

  const fieldsContainer = document.getElementById('addFormFields');
  fieldsContainer.innerHTML = configs.map(f => {
    if (f.type === 'select') {
      return `<div class="form-group">
        <label>${f.label}</label>
        <select id="add-${f.id}">${f.options.map(o => `<option>${o}</option>`).join('')}</select>
      </div>`;
    }
    return `<div class="form-group">
      <label>${f.label}</label>
      <input type="${f.type}" id="add-${f.id}" placeholder="${f.placeholder || ''}" value="${f.value || ''}" ${f.step ? `step="${f.step}"` : ''} ${f.type === 'number' ? `min="0"` : ''}>
    </div>`;
  }).join('');

  document.getElementById('addItemMsg').style.display = 'none';
}

document.getElementById('addItemForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('addItemMsg');
  msg.style.display = 'none';

  const configs = FLEET_FIELD_CONFIGS[currentFleet];
  const data = {};
  configs.forEach(f => {
    const el = document.getElementById(`add-${f.id}`);
    data[f.id] = el.type === 'number' || f.type === 'number' ? parseFloat(el.value) || 0 : el.value;
  });

  // Set current price = base price
  if (data.basePrice !== undefined) data.currentPrice = data.basePrice;

  try {
    let result;
    if (currentFleet === 'buses') result = await post('/admin/buses', data);
    else if (currentFleet === 'cars') result = await post('/admin/cars', data);
    else if (currentFleet === 'trains') result = await post('/admin/trains', data);
    else if (currentFleet === 'flights') result = await post('/admin/flights', data);
    else if (currentFleet === 'hotels') result = await post('/admin/hotels', data);

    msg.textContent = `✅ New ${currentFleet.slice(0, -1)} added successfully!`;
    msg.style.display = 'block';
    msg.style.color = 'var(--success)';
    loadFleet(currentFleet);
    // Clear form
    setupAddForm();
  } catch (err) {
    msg.textContent = 'Error: ' + err.message;
    msg.style.display = 'block';
    msg.style.color = 'var(--danger)';
  }
});

/* ---------- FLEET LIST ---------- */
async function loadFleet(type) {
  const el = document.getElementById('fleetList');
  el.innerHTML = '<div class="loader">Loading...</div>';
  const items = await get('/admin/' + type);
  if (type === 'buses' || type === 'trains' || type === 'flights') {
    el.innerHTML = items.map(i => `
      <div class="result-item">
        <div>
          <div class="result-name">${i.operatorName || i.trainName || i.airline} ${i.flightNumber || i.trainNumber || ''}</div>
          <div class="result-meta">${i.fromCity} → ${i.toCity} · ${i.travelDate}</div>
        </div>
        <div class="flex gap-8" style="align-items:center;">
          <input type="number" value="${i.availableSeats}" style="width:80px; padding:8px; border-radius:8px; border:1.5px solid var(--border);" id="avail-${type}-${i.id}">
          <button class="btn btn-outline btn-sm" onclick="updateAvailability('${type}', ${i.id}, 'availableSeats')">Update</button>
        </div>
      </div>`).join('');
  } else if (type === 'cars') {
    el.innerHTML = items.map(i => `
      <div class="result-item">
        <div>
          <div class="result-name">${i.carModel} (${i.carType})</div>
          <div class="result-meta">${i.fromCity} → ${i.toCity} · ${i.travelDate} · Driver: ${i.driverName}</div>
        </div>
        <div class="flex gap-8" style="align-items:center;">
          <label class="muted" style="font-size:13px;">Available</label>
          <input type="checkbox" ${i.available ? 'checked' : ''} onchange="toggleCarAvailability(${i.id}, this.checked)">
        </div>
      </div>`).join('');
  } else if (type === 'hotels') {
    el.innerHTML = items.map(i => `
      <div class="result-item">
        <div>
          <div class="result-name">${i.hotelName}</div>
          <div class="result-meta">${i.location} · ${i.roomType} · ★ ${i.rating}</div>
        </div>
        <div class="flex gap-8" style="align-items:center;">
          <input type="number" value="${i.availableRooms}" style="width:80px; padding:8px; border-radius:8px; border:1.5px solid var(--border);" id="avail-hotels-${i.id}">
          <button class="btn btn-outline btn-sm" onclick="updateAvailability('hotels', ${i.id}, 'availableRooms')">Update</button>
        </div>
      </div>`).join('');
  }
}

async function updateAvailability(type, id, field) {
  const input = document.getElementById(`avail-${type}-${id}`);
  const value = parseInt(input.value, 10);
  const items = await get('/admin/' + type);
  const item = items.find(i => i.id === id);
  item[field] = value;
  await put(`/admin/${type}/${id}`, item);
  alert('Availability updated');
}

async function toggleCarAvailability(id, checked) {
  const cars = await get('/admin/cars');
  const car = cars.find(c => c.id === id);
  car.available = checked;
  await put(`/admin/cars/${id}`, car);
}

async function loadIssuesAdmin() {
  const el = document.getElementById('issuesAdminList');
  el.innerHTML = '<div class="loader">Loading...</div>';
  const issues = await get('/admin/issues');
  if (!issues.length) { el.innerHTML = '<p class="muted">No issues raised yet.</p>'; return; }
  el.innerHTML = issues.map(i => `
    <div class="result-item">
      <div>
        <div class="result-name">${i.subject} <span class="tag ${i.status === 'RESOLVED' ? 'tag-confirmed' : 'tag-cancelled'}">${i.status}</span></div>
        <div class="result-meta">${i.description}</div>
        <div class="muted" style="font-size:12px;">From: ${i.user ? i.user.name : 'Unknown'}</div>
      </div>
      <div class="flex gap-8">
        <input type="text" placeholder="Response..." id="resp-${i.id}" style="padding:8px; border-radius:8px; border:1.5px solid var(--border);">
        <button class="btn btn-primary btn-sm" onclick="resolveIssue(${i.id})">Resolve</button>
      </div>
    </div>`).join('');
}

async function resolveIssue(id) {
  const response = document.getElementById(`resp-${id}`).value.trim() || 'Resolved by support team.';
  await put(`/admin/issues/${id}/resolve`, { response, status: 'RESOLVED' });
  loadIssuesAdmin();
  loadSummary();
}

async function loadCouponsAdmin() {
  const el = document.getElementById('couponsAdminList');
  el.innerHTML = '<div class="loader">Loading...</div>';
  const coupons = await get('/admin/coupons');
  el.innerHTML = coupons.map(c => `
    <div class="result-item">
      <div>
        <div class="result-name">${c.code} <span class="tag ${c.active ? 'tag-confirmed' : 'tag-cancelled'}">${c.active ? 'ACTIVE' : 'INACTIVE'}</span></div>
        <div class="result-meta">${c.description || ''} · ${c.discountPercent}% off · Valid ${c.validFrom} to ${c.validTo}</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="toggleCoupon(${c.id}, ${!c.active})">${c.active ? 'Deactivate' : 'Activate'}</button>
    </div>`).join('');
}

async function toggleCoupon(id, active) {
  await put(`/admin/coupons/${id}/toggle?active=${active}`);
  loadCouponsAdmin();
}

document.getElementById('couponForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await post('/admin/coupons', {
    code: document.getElementById('couponCodeInput').value.trim(),
    description: document.getElementById('couponDesc').value.trim(),
    discountPercent: parseFloat(document.getElementById('couponDiscount').value),
    validFrom: document.getElementById('couponFrom').value,
    validTo: document.getElementById('couponTo').value,
    active: true
  });
  document.getElementById('couponForm').reset();
  loadCouponsAdmin();
});

async function loadBookingsAdmin() {
  const el = document.getElementById('bookingsAdminList');
  el.innerHTML = '<div class="loader">Loading...</div>';
  const bookings = await get('/admin/bookings');
  if (!bookings.length) { el.innerHTML = '<p class="muted">No bookings yet.</p>'; return; }
  el.innerHTML = bookings.map(b => `
    <div class="result-item">
      <div>
        <div class="result-name">${b.bookingType} — ${b.user ? b.user.name : ''} <span class="tag ${b.status === 'CANCELLED' ? 'tag-cancelled' : 'tag-confirmed'}">${b.status}</span></div>
        <div class="result-meta">${b.fromLocation || ''} ${b.toLocation ? '→ ' + b.toLocation : ''} · ${b.travelDate || ''}</div>
      </div>
      <div class="amt">${fmtCurrency(b.finalAmount)}</div>
    </div>`).join('');
}

async function loadRefundsAdmin() {
  const el = document.getElementById('refundsAdminList');
  el.innerHTML = '<div class="loader">Loading...</div>';
  const refunds = await get('/admin/refunds');
  if (!refunds.length) { el.innerHTML = '<p class="muted">No refunds yet.</p>'; return; }
  el.innerHTML = refunds.map(r => `
    <div class="result-item">
      <div>
        <div class="result-name">Refund #${r.id} for Booking #${r.booking.id}</div>
        <div class="result-meta">${r.reason} · Requested ${new Date(r.requestedAt).toLocaleDateString()}</div>
      </div>
      <div class="flex gap-8" style="align-items:center;">
        <div class="amt">${fmtCurrency(r.refundAmount)}</div>
        <span class="tag ${r.status === 'COMPLETED' ? 'tag-confirmed' : 'tag-cancelled'}">${r.status}</span>
        ${r.status !== 'COMPLETED' ? `<button class="btn btn-outline btn-sm" onclick="advanceRefund(${r.id})">Advance Status</button>` : ''}
      </div>
    </div>`).join('');
}

async function advanceRefund(id) {
  await put(`/admin/refunds/${id}/advance`);
  loadRefundsAdmin();
  loadSummary();
}

async function loadReviewsAdmin() {
  const el = document.getElementById('reviewsAdminList');
  el.innerHTML = '<div class="loader">Loading...</div>';
  const reviews = await get('/admin/reviews/flagged');
  if (!reviews.length) { el.innerHTML = '<p class="muted">No flagged reviews.</p>'; return; }
  el.innerHTML = reviews.map(r => `
    <div class="result-item">
      <div>
        <div class="result-name">${r.targetType} #${r.targetId} · ★ ${r.rating}</div>
        <div class="result-meta">${r.comment}</div>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-outline btn-sm" onclick="moderateReview(${r.id}, false)">Keep</button>
        <button class="btn btn-primary btn-sm" onclick="moderateReview(${r.id}, true)">Remove</button>
      </div>
    </div>`).join('');
}

async function moderateReview(id, remove) {
  await put(`/admin/reviews/${id}/moderate?remove=${remove}`);
  loadReviewsAdmin();
}
