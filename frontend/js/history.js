/* ============================================================
   HISTORY.JS — Booking History page
   Uses /api/bookings/my (existing endpoint) + /api/bookings/{id}/cancel
   ============================================================ */
let allBookings = [];

const TYPE_META = {
  BUS:    { label: 'Bus',    icon: '🚌', color: '#0E7C86' },
  CAR:    { label: 'Car',    icon: '🚗', color: '#7B5CFF' },
  TRAIN:  { label: 'Train',  icon: '🚆', color: '#0F6CBD' },
  FLIGHT: { label: 'Flight', icon: '✈️', color: '#E8590C' },
  HOTEL:  { label: 'Hotel',  icon: '🏨', color: '#B8860B' }
};

function getTypeMeta(type) {
  return TYPE_META[type] || { label: type || 'Trip', icon: '🎫', color: '#555' };
}

function statusBadge(status) {
  if (!status) return '<span class="tag tag-confirmed">Booking</span>';
  const s = String(status).toUpperCase();
  if (s === 'CONFIRMED') return '<span class="tag tag-confirmed">✅ Confirmed</span>';
  if (s === 'CANCELLED') return '<span class="tag tag-cancelled">❌ Cancelled</span>';
  if (s === 'COMPLETED') return '<span class="tag tag-completed">✔ Completed</span>';
  return `<span class="tag">${status}</span>`;
}

function parsePassengerName(details) {
  try {
    const d = JSON.parse(details || '{}');
    return d.name || '';
  } catch (e) { return ''; }
}

function formatDateString(str) {
  if (!str) return '—';
  return str;
}

function formatBookedAt(str) {
  if (!str) return '—';
  try { return new Date(str).toLocaleString(); } catch (e) { return str; }
}

async function loadHistory() {
  const listEl = document.getElementById('historyList');
  listEl.innerHTML = '<div class="loader">Loading your bookings...</div>';
  try {
    const bookings = await get('/bookings/my');
    allBookings = Array.isArray(bookings) ? bookings : [];
    renderHistory(allBookings);
  } catch (err) {
    listEl.innerHTML = `<p class="error-text" style="display:block;">${err.message}</p>`;
  }
}

function applyFilters() {
  const q = (document.getElementById('historySearch').value || '').toLowerCase().trim();
  const type = document.getElementById('historyTypeFilter').value;

  let filtered = allBookings;
  if (type) filtered = filtered.filter(b => (b.bookingType || '').toUpperCase() === type.toUpperCase());
  if (q) {
    filtered = filtered.filter(b => {
      const hay = [
        b.bookingType, b.fromLocation, b.toLocation, b.travelDate,
        String(b.id), b.status, parsePassengerName(b.passengerDetails)
      ].join(' ').toLowerCase();
      return hay.indexOf(q) >= 0;
    });
  }
  renderHistory(filtered);
}

function resetFilters() {
  document.getElementById('historySearch').value = '';
  document.getElementById('historyTypeFilter').value = '';
  renderHistory(allBookings);
}

function renderHistory(bookings) {
  const listEl = document.getElementById('historyList');
  const countEl = document.getElementById('historyCount');

  if (countEl) {
    countEl.textContent = bookings.length + (bookings.length === 1 ? ' booking' : ' bookings');
  }

  if (!bookings.length) {
    listEl.innerHTML = `
      <div class="card text-center" style="padding:48px 20px;">
        <div style="font-size:52px; margin-bottom:14px;">🧳</div>
        <h4 style="margin-bottom:8px;">No bookings found</h4>
        <p class="muted">Looks like you haven't made any trips yet. Let's plan one!</p>
        <a href="home.html" class="btn btn-primary mt-16" style="display:inline-block;">Start Planning</a>
      </div>`;
    return;
  }

  listEl.innerHTML = bookings.map(b => {
    const meta = getTypeMeta(b.bookingType);
    const name = parsePassengerName(b.passengerDetails);
    const emoji = meta.icon;
    return `
      <div class="card history-card" style="margin-bottom:16px;">
        <div class="flex-between" style="flex-wrap:wrap; gap:14px; align-items:flex-start;">
          <div class="flex" style="gap:14px; align-items:flex-start;">
            <div class="history-icon" style="width:52px;height:52px;border-radius:14px;background:${meta.color}18;background:rgba(0,0,0,0.04);display:flex;align-items:center;justify-content:center;font-size:26px;border:1px solid ${meta.color}33;">${emoji}</div>
            <div>
              <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                <strong style="font-size:16px;">${meta.label} Booking</strong>
                ${statusBadge(b.status)}
              </div>
              <div class="history-route" style="margin-top:6px; font-size:15px; font-weight:600;">
                ${b.fromLocation || '—'} <span style="color:${meta.color};">→</span> ${b.toLocation || '—'}
              </div>
              <div class="muted" style="font-size:13px; margin-top:4px;">
                ${name ? name + ' · ' : ''}Travel date: ${formatDateString(b.travelDate)}
              </div>
              <div class="muted" style="font-size:12px; margin-top:2px;">
                Booked on ${formatBookedAt(b.bookedAt)}
                ${b.seatNumbers ? ' · Seats: ' + b.seatNumbers : ''}
              </div>
            </div>
          </div>
          <div class="text-right" style="text-align:right;">
            <div style="font-size:20px; font-weight:700; color:var(--violet-600);">${fmtCurrency(b.finalAmount)}</div>
            <div class="muted" style="font-size:12px;">Booking #${b.id}</div>
            ${b.couponCode ? '<div class="muted" style="font-size:12px;">Coupon: ' + b.couponCode + '</div>' : ''}
            <div style="margin-top:10px;">
              ${(b.status === 'CONFIRMED') ? `
                <button class="btn btn-outline btn-sm" onclick="cancelBooking(${b.id})" style="border-color:var(--danger); color:var(--danger);">Cancel</button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

async function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  const reason = prompt('Reason for cancellation (optional):');
  if (reason === null) return;
  try {
    await post(`/bookings/${id}/cancel`, { reason: reason || 'Not specified' });
    alert('Booking #' + id + ' cancelled successfully.');
    loadHistory();
  } catch (err) {
    alert('Cancellation failed: ' + err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
  const searchEl = document.getElementById('historySearch');
  if (searchEl) searchEl.addEventListener('input', applyFilters);
});
