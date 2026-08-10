let currentProfile = null;
let pendingCancelBookingId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
  await loadBookings();
});

async function loadProfile() {
  currentProfile = await get('/profile');
  document.getElementById('profileView').innerHTML = `
    <div><span class="muted" style="font-size:12px;">NAME</span><div style="font-weight:600;">${currentProfile.name}</div></div>
    <div><span class="muted" style="font-size:12px;">AGE</span><div style="font-weight:600;">${currentProfile.age ?? '—'}</div></div>
    <div><span class="muted" style="font-size:12px;">MOBILE NUMBER</span><div style="font-weight:600;">${currentProfile.mobileNumber}</div></div>
    <div><span class="muted" style="font-size:12px;">EMAIL</span><div style="font-weight:600;">${currentProfile.email ?? '—'}</div></div>
    <div><span class="muted" style="font-size:12px;">LOCATION</span><div style="font-weight:600;">${currentProfile.location ?? '—'}</div></div>
  `;
  document.getElementById('editName').value = currentProfile.name || '';
  document.getElementById('editAge').value = currentProfile.age || '';
  document.getElementById('editEmail').value = currentProfile.email || '';
  document.getElementById('editLocation').value = currentProfile.location || '';
}

function toggleEdit() {
  document.getElementById('profileEditForm').classList.toggle('hidden');
}

document.getElementById('profileEditForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('editMsg');
  try {
    const updated = {
      name: document.getElementById('editName').value.trim(),
      age: document.getElementById('editAge').value,
      email: document.getElementById('editEmail').value.trim(),
      location: document.getElementById('editLocation').value.trim()
    };
    await put('/profile', updated);
    // Persist updated details locally too (for offline fallback / future logins)
    localStorage.setItem('twu_name', updated.name);
    if (updated.age) localStorage.setItem('twu_age', updated.age);
    if (updated.email) localStorage.setItem('twu_email', updated.email);
    if (updated.location) localStorage.setItem('twu_location', updated.location);
    msg.textContent = 'Profile updated successfully';
    msg.style.display = 'block';
    await loadProfile();
  } catch (err) {
    msg.textContent = err.message;
    msg.style.color = 'var(--danger)';
    msg.style.display = 'block';
  }
});

function showTab(name, btn) {
  ['bookings', 'refunds', 'recommendations', 'issues'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('hidden', t !== name);
  });
  document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (name === 'refunds') loadRefunds();
  if (name === 'recommendations') loadRecommendations(false);
  if (name === 'issues') loadIssues();
}

async function loadBookings() {
  const el = document.getElementById('bookingsList');
  try {
    const bookings = await get('/bookings/my');
    if (!bookings.length) { el.innerHTML = '<p class="muted">No bookings yet. Go book your first trip!</p>'; return; }
    el.innerHTML = bookings.map(b => `
      <div class="result-item">
        <div>
          <div class="result-name">${b.bookingType} · ${b.fromLocation || ''} ${b.toLocation ? '→ ' + b.toLocation : ''}</div>
          <div class="result-meta">${b.travelDate || ''} · Booked ${new Date(b.bookedAt).toLocaleDateString()} ${b.seatNumbers ? '· Seats: ' + b.seatNumbers : ''}</div>
          <span class="tag ${b.status === 'CANCELLED' ? 'tag-cancelled' : 'tag-confirmed'}">${b.status}</span>
        </div>
        <div class="price-block">
          <div class="amt">${fmtCurrency(b.finalAmount)}</div>
          ${b.status === 'CONFIRMED' ? `<button class="btn btn-outline btn-sm mt-8" onclick="cancelBooking(${b.id})">Cancel Booking</button>` : ''}
        </div>
      </div>`).join('');
  } catch (err) {
    el.innerHTML = `<p class="error-text" style="display:block;">${err.message}</p>`;
  }
}

// ---------- Cancellation with predefined reason dropdown ----------
function cancelBooking(id) {
  pendingCancelBookingId = id;
  const modal = document.getElementById('cancelModal');
  if (!modal) return;
  const errEl = document.getElementById('cancelReasonErr');
  const select = document.getElementById('cancelReasonSelect');
  select.value = '';
  errEl.style.display = 'none';
  modal.classList.remove('hidden');
}

function closeCancelModal() {
  const modal = document.getElementById('cancelModal');
  if (modal) modal.classList.add('hidden');
  pendingCancelBookingId = null;
  const errEl = document.getElementById('cancelReasonErr');
  if (errEl) errEl.style.display = 'none';
}

async function confirmCancelBooking() {
  const select = document.getElementById('cancelReasonSelect');
  const errEl = document.getElementById('cancelReasonErr');
  const reason = select.value.trim();
  if (!reason) {
    errEl.textContent = 'Please select a reason for cancellation.';
    errEl.style.display = 'block';
    return;
  }
  const id = pendingCancelBookingId;
  closeCancelModal();
  try {
    await post(`/bookings/${id}/cancel`, { reason });
    alert('Booking cancelled. A refund has been initiated — check the Refunds tab for status.');
    await loadBookings();
  } catch (err) {
    alert(err.message);
  }
}

async function loadRefunds() {
  const el = document.getElementById('refundsList');
  el.innerHTML = '<div class="loader">Loading...</div>';
  try {
    const refunds = await get('/refunds/my');
    if (!refunds.length) { el.innerHTML = '<p class="muted">No refunds yet.</p>'; return; }
    el.innerHTML = refunds.map(r => `
      <div class="result-item">
        <div>
          <div class="result-name">Refund for Booking #${r.booking.id}</div>
          <div class="result-meta">Reason: ${r.reason} · Requested ${new Date(r.requestedAt).toLocaleDateString()}</div>
        </div>
        <div class="price-block">
          <div class="amt">${fmtCurrency(r.refundAmount)}</div>
          <div class="seats">${r.status}</div>
          ${r.expectedCompletionAt ? `<div class="muted" style="font-size:11px; margin-top:4px;">Expected by ${new Date(r.expectedCompletionAt).toLocaleDateString()}</div>` : ''}
        </div>
      </div>`).join('');
  } catch (err) {
    el.innerHTML = `<p class="error-text" style="display:block;">${err.message}</p>`;
  }
}

async function loadRecommendations(forceGenerate) {
  const el = document.getElementById('recoList');
  el.innerHTML = '<div class="loader">Loading...</div>';
  try {
    let recs = forceGenerate ? await get('/recommendations/generate') : await get('/recommendations/my');
    if (!recs.length) recs = await get('/recommendations/generate');
    el.innerHTML = recs.map(r => `
      <div class="card">
        <strong>${r.itemName}</strong>
        <p class="muted mt-8" style="font-size:13px;">${r.reasonText}</p>
        <details class="mt-8"><summary style="cursor:pointer; font-size:12px; color:var(--coral);">Why this recommendation?</summary>
          <p class="muted" style="font-size:12px;">Match score: ${(r.matchScore * 100).toFixed(0)}% based on your past booking destinations.</p>
        </details>
        <div class="flex gap-8 mt-16">
          <button class="btn btn-outline btn-sm" onclick="giveFeedback(${r.id}, 'HELPFUL', this)">👍 Helpful</button>
          <button class="btn btn-outline btn-sm" onclick="giveFeedback(${r.id}, 'IRRELEVANT', this)">👎 Not for me</button>
        </div>
      </div>`).join('');
  } catch (err) {
    el.innerHTML = `<p class="error-text" style="display:block;">${err.message}</p>`;
  }
}

async function giveFeedback(id, feedback, btn) {
  await post(`/recommendations/${id}/feedback`, { feedback });
  btn.closest('.card').style.opacity = '0.5';
}

document.getElementById('issueForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await post('/profile/issues', {
    subject: document.getElementById('issueSubject').value.trim(),
    description: document.getElementById('issueDescription').value.trim()
  });
  document.getElementById('issueForm').reset();
  loadIssues();
});

async function loadIssues() {
  const el = document.getElementById('issuesList');
  el.innerHTML = '<div class="loader">Loading...</div>';
  try {
    const issues = await get('/profile/issues');
    if (!issues.length) { el.innerHTML = '<p class="muted">No support tickets raised yet.</p>'; return; }
    el.innerHTML = issues.map(i => `
      <div class="result-item">
        <div>
          <div class="result-name">${i.subject}</div>
          <div class="result-meta">${i.description}</div>
          ${i.adminResponse ? `<p class="muted mt-8" style="font-size:13px;"><strong>Admin:</strong> ${i.adminResponse}</p>` : ''}
        </div>
        <span class="tag ${i.status === 'RESOLVED' ? 'tag-confirmed' : 'tag-cancelled'}">${i.status}</span>
      </div>`).join('');
  } catch (err) {
    el.innerHTML = `<p class="error-text" style="display:block;">${err.message}</p>`;
  }
}

