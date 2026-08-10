/* ============================================================
   TRIP-WITH-US — shared API helper
   ============================================================ */
const API_BASE = '/api';

function getToken() { return localStorage.getItem('twu_token'); }
function getRole() { return localStorage.getItem('twu_role'); }
function getUserName() { return localStorage.getItem('twu_name'); }
function getUserId() { return localStorage.getItem('twu_uid'); }
function getUserEmail() { return localStorage.getItem('twu_email'); }
function getUserAge() { return localStorage.getItem('twu_age'); }
function getUserLocation() { return localStorage.getItem('twu_location'); }
function getUserMobile() { return localStorage.getItem('twu_mobile'); }

function saveSession(auth) {
  localStorage.setItem('twu_token', auth.token);
  localStorage.setItem('twu_role', auth.role);
  localStorage.setItem('twu_name', auth.name);
  localStorage.setItem('twu_uid', auth.userId);
  // Persist full profile details for future logins (fallback when backend is offline)
if (auth.email) localStorage.setItem('twu_email', auth.email);
  if (auth.age != null) localStorage.setItem('twu_age', auth.age);
  if (auth.location) localStorage.setItem('twu_location', auth.location);
  if (auth.mobileNumber) localStorage.setItem('twu_mobile', auth.mobileNumber);
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

function requireAuth() {
  if (!getToken()) window.location.href = 'index.html';
}

function requireAdmin() {
  if (!getToken() || getRole() !== 'ADMIN') window.location.href = 'index.html';
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, { ...options, headers });
  let body = null;
  try { body = await res.json(); } catch (e) { /* no body */ }

  if (!res.ok) {
    const msg = (body && body.message) ? body.message : 'Request failed (' + res.status + ')';
    throw new Error(msg);
  }
  return body;
}

var get = function(path) { return api(path); }
var post = function(path, data) { return api(path, { method: 'POST', body: JSON.stringify(data || {}) }); }
var put = function(path, data) { return api(path, { method: 'PUT', body: JSON.stringify(data || {}) }); }

/* ---------- Shared nav rendering ---------- */
function renderNavProfile() {
  const el = document.getElementById('navProfile');
  if (!el) return;
  if (getToken()) {
    const initial = (getUserName() || 'U').charAt(0).toUpperCase();
    el.innerHTML = `
      <a href="profile.html" class="profile-pill">
        <span class="avatar">${initial}</span> ${getUserName() || 'Profile'}
      </a>`;
  } else {
    el.innerHTML = `<a href="index.html" class="btn btn-primary btn-sm">Login</a>`;
  }
}

function toggleMobileNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

function fmtCurrency(n) {
  if (n === null || n === undefined) return '₹0';
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

document.addEventListener('DOMContentLoaded', renderNavProfile);
