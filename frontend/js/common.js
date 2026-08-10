/* ============================================================
   COMMON.JS — Navbar, Footer, CAPTCHA, Payment, 3D Features
   ============================================================ */

/* Injects the shared navbar + footer markup into any page that includes this file. */
function injectNavbar(activePage) {
  const nav = document.getElementById('siteNavbar');
  if (!nav) return;
  const link = (href, label) => `<a href="${href}" class="${activePage === href ? 'active' : ''}">${label}</a>`;
nav.innerHTML = `
    <div class="nav-inner">
<a href="home.html" class="logo"><span class="logo-pin">◎</span>TripWithUs</a>
      <ul class="nav-links" id="navLinks">
        ${link('home.html', 'Home')}
        ${link('bus.html', 'Bus')}
        ${link('car.html', 'Car')}
        ${link('train.html', 'Train')}
        ${link('flight.html', 'Flight')}
        ${link('hotel.html', 'Hotel')}
        ${link('history.html', 'My Trips')}
      </ul>
      <div class="nav-right">
        <div id="navProfile"></div>
        <button class="nav-toggle" id="navToggleBtn">&#9776;</button>
      </div>`;
  renderNavProfile();
}

function injectFooter() {
  const foot = document.getElementById('siteFooter');
  if (!foot) return;
foot.innerHTML = `<div class="container">&copy; 2026 TripWithUs TRAVELS (INDIA) PRIVATE LIMITED. All rights reserved</div>`;
}

function toggleMobileNav() {
  const links = document.getElementById('navLinks');
  if (links) links.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', function() {
  var toggleBtn = document.getElementById('navToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      var links = document.getElementById('navLinks');
      if (links) links.classList.toggle('open');
    });
  }
});

/* ============================================================
   Format utilities shared across pages
   ============================================================ */
function formatTime12h(timeStr) {
  if (!timeStr) return '--:--';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h = h - 12;
  return h + ':' + m + ' ' + ampm;
}

function fmtCurrency(amount) {
  if (amount == null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

/* ============================================================
   Interactive Loading Animation
   ============================================================ */
function renderLoading(message, subMessage) {
  return `<div class="loading-container">
    <div class="loading-animation">
      <div class="ring"></div>
      <div class="ring"></div>
      <div class="ring"></div>
    </div>
    <div class="loading-text" id="loadingText">${message || 'Searching live availability'}<span id="loadingDots"></span></div>
    <div class="loading-sub">${subMessage || 'Fetching best prices and availability for you'}</div>
  </div>`;
}

var _loadingDotsInterval = null;

function startLoadingDots() {
  if (_loadingDotsInterval) clearInterval(_loadingDotsInterval);
  var dots = 0;
  _loadingDotsInterval = setInterval(function() {
    var el = document.getElementById('loadingDots');
    if (!el) { clearInterval(_loadingDotsInterval); _loadingDotsInterval = null; return; }
    dots = (dots + 1) % 4;
    el.textContent = '.'.repeat(dots);
  }, 400);
}

function stopLoadingDots() {
  if (_loadingDotsInterval) {
    clearInterval(_loadingDotsInterval);
    _loadingDotsInterval = null;
  }
  var el = document.getElementById('loadingDots');
  if (el) el.textContent = '';
}

/* ============================================================
   Timeout + Fallback helpers — ensure search loading never
   stays stuck forever (resolves even if the API hangs/fails)
   ============================================================ */
function withTimeout(work, ms) {
  var timeout = new Promise(function(_, reject) {
    setTimeout(function() {
      reject(new Error('Request timed out'));
    }, ms || 8000);
  });
  // Wrap the request function so any synchronous throw is converted
  // into a rejected promise that Promise.race can handle.
  var task;
  try {
    task = typeof work === 'function' ? Promise.resolve().then(work) : Promise.resolve(work);
  } catch (err) {
    task = Promise.reject(err);
  }
  return Promise.race([task, timeout]);
}

/* Runs a search API call with a timeout. If it hangs or fails,
   returns a fallback value (generated mock data) so the UI
   always completes and never remains stuck on the loader. */
async function fallbackSearch(requestFn, fallbackFn, timeoutMs) {
  try {
    var result = await withTimeout(requestFn, timeoutMs || 8000);
    return (result !== undefined && result !== null) ? result : [];
  } catch (err) {
    // Fall back to local mock generation so results always render.
    if (typeof fallbackFn === 'function') {
      try {
        var mock = fallbackFn();
        if (mock && typeof mock.then === 'function') return mock;
        return mock || [];
      } catch (e2) {
        return [];
      }
    }
    return [];
  }
}

function renderNoResults(customMessage) {
  return `<div class="card text-center" style="padding:40px 20px;">
    <div style="font-size:48px; margin-bottom:16px;">🔍</div>
    <h4 style="margin-bottom:8px;">No Results Found</h4>
    <p class="muted">${customMessage || 'Try different search criteria or date.'}</p>
  </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  injectNavbar(document.body.getAttribute('data-active'));
  injectFooter();
  injectBackToTop();

  // Fresh, cosmic, modern animations
  setTimeout(initScrollReveal, 300);
  setTimeout(initGradientSheen, 500);
  setTimeout(initCosmicParticles, 700);
  setTimeout(initAuroraDrift, 850);
  setTimeout(initHeroDrift, 800);
  setTimeout(init3DTilt, 500);
  setTimeout(initParallax, 600);
  setTimeout(initMagneticButtons, 400);
  setTimeout(initStatCounters, 500);
  setTimeout(initWavesDivider, 1200);

  // UNIQUE: welcome photo popup on the home page only
  if (document.body.getAttribute('data-active') === 'home.html') {
    setTimeout(showWelcomePopup, 1200);
  }
});

/* ============================================================
   Back to Top Button
   ============================================================ */
function injectBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.innerHTML = '↑';
  btn.title = 'Back to top';
  btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
}

/* ============================================================
   3D Scroll Reveal
   ============================================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal-3d, .section, .card, .result-item, .room-card, .offer-card, .why-card').forEach(el => {
    if (!el.classList.contains('no-reveal')) {
      el.classList.add('reveal-3d');
      observer.observe(el);
    }
  });
}

/* ============================================================
   Gradient Sheen — subtle animated sheen sweeping across
   cards and section titles (clean, modern, non-3D)
   ============================================================ */
function initGradientSheen() {
  // Animated gradient text for section titles
  document.querySelectorAll('.section-title').forEach(function(el) {
    if (!el.classList.contains('sheen-title')) {
      el.classList.add('sheen-title');
    }
  });
  // Subtle gradient border glow on cards
  document.querySelectorAll('.card, .search-card, .summary-box').forEach(function(card) {
    if (!card.classList.contains('glow-border')) {
      card.classList.add('glow-border');
    }
  });
}

/* ============================================================
   Hero Drift — gentle floating shapes in hero sections
   (soft colors, slow drift; replaces the old 3D rotating rings)
   ============================================================ */
function initHeroDrift() {
  var heroes = document.querySelectorAll('header.hero');
  heroes.forEach(function(hero) {
    if (hero.querySelector('.drift-blob')) return;
    var shapes = [
      { cls: 'drift-blob', size: 180, top: '10%', left: '6%', color: 'rgba(123,92,255,0.16)' },
      { cls: 'drift-blob blob2', size: 120, top: '60%', right: '8%', color: 'rgba(255,77,141,0.14)' },
      { cls: 'drift-blob blob3', size: 80, top: '40%', left: '18%', color: 'rgba(255,194,77,0.18)' }
    ];
shapes.forEach(function(s) {
      var div = document.createElement('div');
      div.className = s.cls;
      div.style.cssText = 'width:' + s.size + 'px;height:' + s.size + 'px;' +
        (s.top !== undefined ? 'top:' + s.top + ';' : '') +
        (s.left !== undefined ? 'left:' + s.left + ';' : '') +
        (s.right !== undefined ? 'right:' + s.right + ';' : '') +
        'background:radial-gradient(circle,' + s.color + ',transparent 70%);';
      hero.appendChild(div);
    });
  });
}

/* ============================================================
   TRIPWITHUS — 3D Tilt on interactive cards (mouse-driven)
   ============================================================ */
function init3DTilt() {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
document.querySelectorAll('.tilt-3d, .feature-tilt, .mode-launch-card, .dest-card, .room-card, .result-item').forEach(function(card) {
    if (card.classList.contains('tilt-bound')) return;
    card.classList.add('tilt-bound');
    card.classList.add('tilt-glare');
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'perspective(900px) rotateX(' + (-py * 8) + 'deg) rotateY(' + (px * 8) + 'deg) translateY(-4px)';
      // Update glare light source to follow cursor
      var gx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      var gy = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      card.style.setProperty('--gx', gx + '%');
      card.style.setProperty('--gy', gy + '%');
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });
}

/* ============================================================
   TRIPWITHUS — Subtle parallax on hero ambient layers
   ============================================================ */
function initParallax() {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var hero = document.querySelector('header.hero');
  if (!hero) return;
  var layers = hero.querySelectorAll('.drift-blob, .hero-orb, .hero-ring');
  if (layers.length === 0) return;
  window.addEventListener('mousemove', function(e) {
    var x = (e.clientX / window.innerWidth - 0.5);
    var y = (e.clientY / window.innerHeight - 0.5);
    layers.forEach(function(layer, i) {
      var depth = 20 + (i * 12);
      layer.style.transform = 'translate(' + (x * depth) + 'px, ' + (y * depth) + 'px)';
    });
  });
}

/* ============================================================
   Cosmic Particle System — twinkling starfield + aurora orbs.
   Replaces the old "water bubble" animation with a premium,
   space-inspired ambient background.
   ============================================================ */
function initCosmicParticles() {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  if (document.getElementById('cosmic-sky')) return;
  var container = document.createElement('div');
  container.id = 'cosmic-sky';
  document.body.appendChild(container);

  // Twinkling stars (small points of light)
  var starCount = 55;
  for (var i = 0; i < starCount; i++) {
    var star = document.createElement('div');
    star.className = 'cosmic-star';
    var size = 1.5 + Math.random() * 3;
    var left = Math.random() * 100;
    var top = Math.random() * 100;
    var delay = Math.random() * 6;
    var dur = 3 + Math.random() * 5;
    star.style.cssText =
      'width:' + size + 'px;height:' + size + 'px;left:' + left + '%;top:' + top + '%;' +
      'animation-duration:' + dur + 's;animation-delay:-' + delay + 's;';
    container.appendChild(star);
  }

  // Aurora nebula orbs (large soft glowing blobs, drifting slowly)
  var aurora = [
    { size: 340, left: -70, top: -60, dur: 26, color: 'rgba(123,92,255,0.34)' },
    { size: 300, right: -60, top: 20, dur: 30, color: 'rgba(255,77,141,0.28)' },
    { size: 240, left: 30, bottom: -90, dur: 24, color: 'rgba(255,194,77,0.22)' },
    { size: 200, left: 60, top: 40, dur: 32, color: 'rgba(53,194,156,0.20)' }
  ];
  aurora.forEach(function(a) {
    var orb = document.createElement('div');
    orb.className = 'cosmic-aurora';
    var pos =
      (a.left !== undefined ? 'left:' + a.left + '%;' : '') +
      (a.right !== undefined ? 'right:' + a.right + '%;' : '') +
      (a.top !== undefined ? 'top:' + a.top + '%;' : '') +
      (a.bottom !== undefined ? 'bottom:' + a.bottom + '%;' : '');
    orb.style.cssText =
      'width:' + a.size + 'px;height:' + a.size + 'px;' + pos +
      'background:radial-gradient(circle, ' + a.color + ' 0%, transparent 70%);' +
      'animation-duration:' + a.dur + 's;';
    container.appendChild(orb);
  });
}

/* ============================================================
   Aurora Drift — gentle flowing sheen across the viewport
   ============================================================ */
function initAuroraDrift() {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var wrap = document.querySelector('body');
  var sheen = document.createElement('div');
  sheen.className = 'aurora-sheen';
  wrap.appendChild(sheen);
}

/* ============================================================
   Magnetic Buttons — buttons gently follow the cursor
   ============================================================ */
function initMagneticButtons() {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  if (!window.matchMedia('(hover: hover)').matches) return; // touch devices skip
  document.querySelectorAll('.btn, .store-btn, .mode-launch-card, .social-icon').forEach(function(btn) {
    if (btn.classList.contains('magnetic-bound')) return;
    btn.classList.add('magnetic-bound');
    btn.addEventListener('mousemove', function(e) {
      var rect = btn.getBoundingClientRect();
      var mx = (e.clientX - rect.left - rect.width / 2) * 0.18;
      var my = (e.clientY - rect.top - rect.height / 2) * 0.25;
      btn.style.transform = 'translate(' + mx + 'px, ' + my + 'px)';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.transform = '';
    });
  });
}

/* ============================================================
   Animated Stat Counters — numbers count up when scrolled into view
   ============================================================ */
function initStatCounters() {
  var nums = document.querySelectorAll('.stat-num[data-count]');
  if (!nums.length) return;
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      io.unobserve(el);
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
      var duration = 1400;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = eased * target;
        var display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString('en-IN');
        el.textContent = display + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  nums.forEach(function(n) { io.observe(n); });
}

/* ============================================================
   Animated Waves Divider — a flowing CSS wave under hero sections
   ============================================================ */
function initWavesDivider() {
  var heroes = document.querySelectorAll('header.hero');
  heroes.forEach(function(hero) {
    if (hero.querySelector('.waves-divider')) return;
    var waves = document.createElement('div');
    waves.className = 'waves-divider';
    waves.innerHTML =
      '<svg viewBox="0 0 1200 120" preserveAspectRatio="none">' +
      '<path class="wave wave-1" d="M0,64 C150,100 350,20 600,50 C850,80 1050,30 1200,60 L1200,120 L0,120 Z"></path>' +
      '<path class="wave wave-2" d="M0,80 C180,40 360,100 600,70 C840,40 1020,90 1200,60 L1200,120 L0,120 Z"></path>' +
      '</svg>';
    hero.appendChild(waves);
  });
}

/* ============================================================
   Newsletter — simple client-side subscribe handler
   ============================================================ */
function handleNewsletter(event) {
  if (event) event.preventDefault();
  const email = document.getElementById('newsletterEmail');
  const msg = document.getElementById('newsletterMsg');
  if (email && msg) {
    msg.textContent = '🎉 Thanks for subscribing! Deals are on their way to ' + email.value.trim() + '.';
    msg.style.display = 'block';
    email.value = '';
  }
}

/* ============================================================
   UNIQUE: Welcome Popup — a photo popup shown on page load
   ============================================================ */
function showWelcomePopup() {
if (sessionStorage.getItem('TripWithUs_welcome_seen')) return;
  sessionStorage.setItem('TripWithUs_welcome_seen', '1');
  var overlay = document.createElement('div');
  overlay.className = 'popup-overlay';
  overlay.id = 'welcomePopup';
  overlay.innerHTML = `
    <div class="popup-card">
      <button class="popup-close" onclick="closeWelcomePopup()">&times;</button>
      <div class="popup-media" style="background-image:url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80');"></div>
      <div class="popup-body">
<span class="popup-eyebrow">Welcome to TripWithUs</span>
        <h3>Your next escape begins here ✨</h3>
        <p>Buses, trains, flights, cars &amp; hotels — all in one place. Let's plan something unforgettable.</p>
        <button class="btn btn-primary btn-block" onclick="closeWelcomePopup()">Start Exploring</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(function() { overlay.classList.add('show'); }, 300);
}

function closeWelcomePopup() {
  var overlay = document.getElementById('welcomePopup');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 350);
  }
}

/* ============================================================
   UNIQUE: Route Map — draws source → destination on a
   Leaflet + OpenStreetMap (no API key) using Nominatim geocoding
   ============================================================ */
function renderRouteMap(from, to, containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  // Lazy-load Leaflet CSS/JS the first time it's needed
  if (!window.L) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    var script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = function() { buildRouteMap(from, to, container); };
    script.onerror = function() { container.innerHTML = '<p class="muted">Map could not load (no internet).</p>'; };
    document.head.appendChild(script);
  } else {
    buildRouteMap(from, to, container);
  }
}

function buildRouteMap(from, to, container) {
  var mapEl = document.createElement('div');
  mapEl.style.width = '100%';
  mapEl.style.height = '280px';
  mapEl.style.borderRadius = '14px';
  mapEl.style.zIndex = '1';
  container.innerHTML = '';
  container.appendChild(mapEl);

  var map = L.map(mapEl).setView([20.59, 78.96], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  var geocoder = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=';
  var fromP = fetch(geocoder + encodeURIComponent(from)).then(function(r) { return r.json(); });
  var toP = fetch(geocoder + encodeURIComponent(to)).then(function(r) { return r.json(); });

  Promise.all([fromP, toP]).then(function(results) {
    var fromRes = results[0] && results[0][0];
    var toRes = results[1] && results[1][0];
    if (!fromRes || !toRes) {
      container.innerHTML = '<p class="muted">Could not locate the route. Please try different cities.</p>';
      return;
    }
    var a = L.latLng(fromRes.lat, fromRes.lon);
    var b = L.latLng(toRes.lat, toRes.lon);
    L.marker(a).addTo(map).bindPopup('<b>' + from + '</b>').openPopup();
    L.marker(b).addTo(map).bindPopup('<b>' + to + '</b>');
    L.polyline([a, b], { color: '#7B5CFF', weight: 4, dashArray: '8 8' }).addTo(map);
    map.fitBounds([a, b], { padding: [40, 40] });
  }).catch(function() {
    container.innerHTML = '<p class="muted">Route map could not be loaded.</p>';
  });
}

/* ============================================================
   CAPTCHA Utility — simple numeric challenge
   ============================================================ */
let currentCaptchaAnswer = 0;

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 20) + 5;
  const num2 = Math.floor(Math.random() * 15) + 3;
  currentCaptchaAnswer = num1 + num2;
  const el = document.getElementById('captchaQuestion');
  if (el) el.textContent = `${num1} + ${num2} = ?`;
  const input = document.getElementById('captchaInput');
  if (input) { input.value = ''; input.classList.remove('is-valid', 'is-invalid'); }
  const msg = document.getElementById('captchaMsg');
  if (msg) { msg.style.display = 'none'; }
}

function validateCaptcha() {
  const input = document.getElementById('captchaInput');
  const msg = document.getElementById('captchaMsg');
  if (!input || !msg) return false;
  const val = parseInt(input.value, 10);
  if (val === currentCaptchaAnswer) {
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
    msg.style.display = 'none';
    return true;
  } else {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    msg.textContent = 'Incorrect answer. Please try again.';
    msg.style.display = 'block';
    return false;
  }
}

/* ============================================================
   Payment Methods — shared rendering
   ============================================================ */
function renderPaymentMethods(containerId, onComplete) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <h4 class="mb-16">Select Payment Method</h4>
    <div class="payment-options">
      <label class="payment-option">
        <input type="radio" name="paymentMethod" value="UPI" checked>
        <span class="payment-icon">📱</span>
        <span class="payment-label">UPI (GPay / PhonePe / Paytm)</span>
      </label>
      <label class="payment-option">
        <input type="radio" name="paymentMethod" value="Card">
        <span class="payment-icon">💳</span>
        <span class="payment-label">Credit / Debit Card</span>
      </label>
      <label class="payment-option">
        <input type="radio" name="paymentMethod" value="NetBanking">
        <span class="payment-icon">🏦</span>
        <span class="payment-label">Net Banking</span>
      </label>
      <label class="payment-option">
        <input type="radio" name="paymentMethod" value="Wallet">
        <span class="payment-icon">👛</span>
        <span class="payment-label">Wallet (Paytm / Amazon Pay)</span>
      </label>
    </div>

    <!-- UNIQUE: UPI sub-options (UPI ID / QR scan / open app) -->
    <div id="upiOptions" class="upi-options" style="display:none;">
      <p class="upi-heading">Choose how you'd like to pay via UPI</p>
      <div class="upi-modes">
        <button type="button" class="upi-mode" data-upimode="id" onclick="selectUpiMode('id', this)">
          <span class="upi-mode-ico">⌨️</span>
          <span>Enter UPI ID</span>
        </button>
        <button type="button" class="upi-mode" data-upimode="qr" onclick="selectUpiMode('qr', this)">
          <span class="upi-mode-ico">📷</span>
          <span>Scan QR Code</span>
        </button>
        <button type="button" class="upi-mode" data-upimode="app" onclick="selectUpiMode('app', this)">
          <span class="upi-mode-ico">📲</span>
          <span>Open an App</span>
        </button>
      </div>

      <!-- UPI ID input -->
      <div class="upi-sub-panel" id="upiIdPanel" style="display:none;">
        <div class="form-group">
          <label>Your UPI ID</label>
          <input type="text" id="upiIdField" placeholder="e.g. yourname@okhdfc" class="payment-input">
        </div>
      </div>

      <!-- QR code -->
      <div class="upi-sub-panel" id="upiQrPanel" style="display:none;">
        <p class="muted" style="font-size:13px; margin-bottom:10px;">Scan with any UPI app to pay <strong id="upiQrAmount">₹0</strong></p>
        <div class="upi-qr-wrap">
          <img id="upiQrImg" alt="UPI QR Code" style="width:170px;height:170px;border-radius:14px;background:#fff;padding:8px;">
        </div>
      </div>

<!-- App quick-launch -->
      <div class="upi-sub-panel" id="upiAppPanel" style="display:none;">
        <p class="muted" style="font-size:13px; margin-bottom:10px;">Tap an app below to pay <strong id="upiAppAmount">₹0</strong></p>
        <div class="upi-apps">
          <button type="button" class="upi-app-btn" onclick="launchUpiApp('phonepe')"><span class="upiapp-ico">🟣</span>PhonePe</button>
          <button type="button" class="upi-app-btn" onclick="launchUpiApp('gpay')"><span class="upiapp-ico">💚</span>Google Pay</button>
          <button type="button" class="upi-app-btn" onclick="launchUpiApp('paytm')"><span class="upiapp-ico">🔵</span>Paytm</button>
        </div>
        <div class="upi-fallback" id="upiFallback" style="display:none; margin-top:12px; padding:12px; border:1.5px dashed var(--border); border-radius:12px; background:var(--bg);">
          <p style="font-size:13px; font-weight:600; margin-bottom:8px;">App didn't open? No problem — use this instead:</p>
          <div class="flex gap-8" style="align-items:flex-end; flex-wrap:wrap;">
            <div class="form-group" style="flex:1; min-width:180px;">
              <label>Copy our UPI ID</label>
<input type="text" id="upiFallbackId" readonly value="TripWithUs@upi" style="background:#fff;">
            </div>
            <button type="button" class="btn btn-outline btn-sm" onclick="copyUpiId()">📋 Copy</button>
          </div>
          <p class="muted" style="font-size:12px; margin-top:8px;">Open any UPI app → Pay → enter amount <strong id="upiFallbackAmt">₹0</strong> → enter the UPI ID above.</p>
          <div style="margin-top:10px; text-align:center;">
            <img id="upiFallbackQr" alt="UPI QR" style="width:150px;height:150px;border-radius:12px;background:#fff;padding:6px;">
          </div>
        </div>
      </div>
    </div>

    <div id="paymentDetailInput" class="mt-16" style="display:none;">
      <div class="form-group">
        <label id="paymentDetailLabel">Card Number</label>
        <input type="text" id="paymentDetailField" placeholder="XXXX XXXX XXXX XXXX" class="payment-input">
      </div>
    </div>
    <button class="btn btn-primary btn-block mt-16" onclick="handlePayment('${containerId}')">
      Pay <span id="paymentAmountLabel">₹0</span>
    </button>
    <p class="error-text" id="paymentErr"></p>
  `;

  // Update payment sub-panels based on selection
  el.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const detailWrap = document.getElementById('paymentDetailInput');
      const upiWrap = document.getElementById('upiOptions');
      const val = radio.value;

      if (val === 'UPI') {
        upiWrap.style.display = 'block';
        detailWrap.style.display = 'none';
        selectUpiMode('id', document.querySelector('[data-upimode="id"]'));
      } else {
        upiWrap.style.display = 'none';
        detailWrap.style.display = 'block';
        const detailLabel = document.getElementById('paymentDetailLabel');
        const detailField = document.getElementById('paymentDetailField');
        if (val === 'Card') {
          detailLabel.textContent = 'Card Number';
          detailField.placeholder = 'XXXX XXXX XXXX XXXX';
        } else if (val === 'NetBanking') {
          detailLabel.textContent = 'Select Bank';
          detailField.placeholder = 'e.g. SBI, HDFC, ICICI';
        } else {
          detailLabel.textContent = 'Wallet Mobile Number';
          detailField.placeholder = 'e.g. 9876543210';
        }
      }
    });
  });

  // Store the onComplete callback
  el.dataset.onComplete = onComplete ? 'true' : 'false';
}

/* UNIQUE helper: switch between UPI modes */
function selectUpiMode(mode, btn) {
  document.querySelectorAll('.upi-mode').forEach(function(m) { m.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  var show = { id: 'upiIdPanel', qr: 'upiQrPanel', app: 'upiAppPanel' };
  ['upiIdPanel', 'upiQrPanel', 'upiAppPanel'].forEach(function(p) {
    var el = document.getElementById(p);
    if (el) el.style.display = (p === show[mode]) ? 'block' : 'none';
  });
  if (mode === 'qr') {
    showUpiQr();
  }
  if (mode === 'app') {
    showUpiApp();
  }
}

/* Populate the "Open an App" fallback with a QR + amount */
function showUpiApp() {
  var amountEl = document.getElementById('paymentAmountLabel');
  var amount = 0;
  if (amountEl) amount = parseInt(String(amountEl.textContent).replace(/[^0-9]/g, ''), 10) || 0;
  var amtEl = document.getElementById('upiAppAmount');
  if (amtEl) amtEl.textContent = fmtCurrency(amount);
  var fbAmt = document.getElementById('upiFallbackAmt');
  if (fbAmt) fbAmt.textContent = fmtCurrency(amount);

  var upiPayload = 'upi://pay?pa=TripWithUs@upi&pn=TripWithUs&am=' + amount + '&cu=INR&tn=TripWithUs%20Booking';
  var qr = document.getElementById('upiFallbackQr');
  if (qr) qr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(upiPayload);
}

function copyUpiId() {
  var field = document.getElementById('upiFallbackId');
  var id = field ? field.value || 'TripWithUs@upi' : 'TripWithUs@upi';
  var done = false;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(id).then(function() { done = true; }).catch(function() {});
  }
  setTimeout(function() {
    if (done) { showToast('✅ UPI ID copied: ' + id); return; }
    field.select();
    field.setSelectionRange(0, 99999);
    try { document.execCommand('copy'); showToast('✅ UPI ID copied: ' + id); }
    catch (e) { showToast('UPI ID: ' + id); }
  }, 120);
}

/* Simple toast helper (no dependency) */
function showToast(msg) {
  var t = document.getElementById('toast-TripWithUs');
  if (t) t.parentNode.removeChild(t);
  t = document.createElement('div');
  t.id = 'toast-TripWithUs';
  t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#16213A;color:#fff;padding:12px 20px;border-radius:40px;font-size:13px;font-weight:600;z-index:2000;box-shadow:0 10px 30px rgba(0,0,0,0.25);opacity:0;transition:opacity .3s;white-space:nowrap;';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function() { t.style.opacity = '1'; });
  setTimeout(function() { t.style.opacity = '0'; }, 2600);
}

/* Generate a QR for the payment (uses a free QR API, amount + merchant) */
function showUpiQr() {
  var amountEl = document.getElementById('paymentAmountLabel');
  var amount = 0;
  if (amountEl) amount = parseInt(String(amountEl.textContent).replace(/[^0-9]/g, ''), 10) || 0;
  var amtEl = document.getElementById('upiQrAmount');
  if (amtEl) amtEl.textContent = fmtCurrency(amount);

  var upiPayload = 'upi://pay?pa=TripWithUs@upi&pn=TripWithUs&am=' + amount + '&cu=INR&tn=TripWithUs%20Booking';
  var img = document.getElementById('upiQrImg');
  if (img) img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=' + encodeURIComponent(upiPayload);
}

/* UNIQUE: try to launch a UPI app via deep link; fallback gracefully on desktop */
function launchUpiApp(app) {
  var amount = 0;
  var amtEl = document.getElementById('paymentAmountLabel');
  if (amtEl) amount = parseInt(String(amtEl.textContent).replace(/[^0-9]/g, ''), 10) || 0;
  var upi = 'upi://pay?pa=TripWithUs@upi&pn=TripWithUs&am=' + amount + '&cu=INR&tn=TripWithUs%20Booking';
  var urls = {
    phonepe: 'phonepe://pay?pa=TripWithUs@upi&pn=TripWithUs&am=' + amount,
    gpay: 'tez://upi/pay?pa=TripWithUs@upi&pn=TripWithUs&am=' + amount,
    paytm: 'paytmmp://pay?pa=TripWithUs@upi&pn=TripWithUs&am=' + amount
  };
  var target = urls[app] || upi;

  var fb = document.getElementById('upiFallback');
  if (fb) fb.style.display = 'block';

  // Try the deep link. On mobile it launches the app; on desktop nothing happens.
  var opened = false;
  try {
    var win = window.open(target, '_self');
    if (win) opened = true;
  } catch (e) { opened = false; }

  // Show a helpful message + the fallback (QR + copyable UPI ID) so payment
  // always works even if the app didn't open.
  var errEl = document.getElementById('paymentErr');
  if (errEl) {
    errEl.style.display = 'block';
    errEl.textContent = 'If the app did not open, use the QR or copy the UPI ID below to pay.';
  }
}

function handlePayment(containerId) {
  const selected = document.querySelector(`#${containerId} input[name="paymentMethod"]:checked`);
  const errEl = document.getElementById('paymentErr');
  errEl.style.display = 'none';

  if (!selected) {
    errEl.textContent = 'Please select a payment method.';
    errEl.style.display = 'block';
    return;
  }

  let detail = '';

  if (selected.value === 'UPI') {
    const activeModeBtn = document.querySelector('#upiOptions .upi-mode.active');
    const mode = activeModeBtn ? activeModeBtn.getAttribute('data-upimode') : 'id';
    if (mode === 'qr') {
      detail = 'UPI QR Scan';
    } else if (mode === 'app') {
      detail = 'UPI App (PhonePe/GPay/Paytm)';
    } else {
      detail = document.getElementById('upiIdField').value.trim();
      if (!detail) {
        errEl.textContent = 'Please enter your UPI ID (e.g. name@upi).';
        errEl.style.display = 'block';
        return;
      }
    }
  } else {
    detail = document.getElementById('paymentDetailField').value.trim();
    if (!detail) {
      errEl.textContent = 'Please enter your payment details.';
      errEl.style.display = 'block';
      return;
    }
  }

  // Simulate payment processing with spinner
  const payBtn = document.querySelector(`#${containerId} .btn-primary`);
  payBtn.disabled = true;
  payBtn.innerHTML = '<span class="spinner-3d"></span> Processing...';

  // Simulate a 1.5s payment gateway call
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('paymentComplete', {
      detail: { method: selected.value, detail: detail }
    }));
  }, 1500);
}

/* ============================================================
   Voice Greeting — speaks a unique welcome message when a
   booking is confirmed. Uses the browser Web Speech API.
   ============================================================ */
var speechEnabled = true;
var speechUtterance = null;

function getGreetingMessage(ticketData) {
  var firstName = '';
  if (ticketData && ticketData.name) {
    firstName = String(ticketData.name).trim().split(/\s+/)[0];
  }
  var nameIntro = firstName ? 'Dear ' + firstName + ', ' : '';

  var typeSpecific = '';
  switch ((ticketData && ticketData.type || '').toUpperCase()) {
    case 'FLIGHT':
      typeSpecific = 'your flight has been successfully confirmed. We are truly grateful for choosing TripWithUs for your travel.';
      break;
    case 'HOTEL':
      typeSpecific = 'your hotel stay has been successfully confirmed. We sincerely thank you for choosing TripWithUs and wish you a delightful stay.';
      break;
    case 'CAR':
      typeSpecific = 'your car has been successfully booked. Thank you so much for trusting TripWithUs, and may you have a smooth, safe ride.';
      break;
    case 'TRAIN':
      typeSpecific = 'your train ticket has been successfully confirmed. We are grateful for your trust and wish you a comfortable journey.';
      break;
    default:
      typeSpecific = 'your bus ticket has been successfully confirmed. Thank you from the bottom of our hearts for choosing TripWithUs.';
      break;
  }

  var ticketRef = ticketData && ticketData.bookingId ? ' Your ticket number is ' + ticketData.bookingId + '. ' : ' ';
  var thanks = ' Thank you for booking with TripWithUs. We appreciate you and wish you a wonderful journey ahead! ';
  return nameIntro + 'Good news! ' + typeSpecific + ticketRef + thanks + 'Have a safe and happy trip!';
}

function speakGreeting(ticketData) {
  if (!speechEnabled) return;
  if (!('speechSynthesis' in window)) return;

  try {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    var message = getGreetingMessage(ticketData);
    var voices = window.speechSynthesis.getVoices();

    // UNIQUE: strongly prefer a warm female voice.
    // Match known female voices first (Google UK/US Female, Samantha, Zira,
    // Microsoft Heera/Neerja/Priya/ZiraN, Amelia, Karen, Moira, Tessa...).
    var voicedNames = /female|Samantha|Zira|Susan|Heera|Neerja|Priya|Amelia|Karen|Moira|Tessa|Google US English|Google UK English Female|Microsoft.*Female|Google हिन्दी/i;
    var enVoice = voices.find(function(v) { return /female/i.test(v.name) && /^en/i.test(v.lang); })
                || voices.find(function(v) { return voicedNames.test(v.name + ' ' + v.lang) && /^en/i.test(v.lang); })
                || voices.find(function(v) { return voicedNames.test(v.name + ' ' + v.lang); })
                || voices.find(function(v) { return /^en/i.test(v.lang); });

    speechUtterance = new SpeechSynthesisUtterance(message);
    // Slightly higher pitch + gentle pace for a clear, pleasant female tone.
    speechUtterance.rate = 0.95;
    speechUtterance.pitch = 1.3;
    speechUtterance.volume = 1.0;
    if (enVoice) { speechUtterance.voice = enVoice; }

    // Animate the voice wave while speaking
    var wave = document.querySelector('.voice-wave');
    if (wave) wave.classList.add('playing');
    var btn = document.querySelector('.voice-btn');
    if (btn) { btn.classList.add('speaking'); btn.textContent = '🔊'; }

    speechUtterance.onend = function() {
      if (wave) wave.classList.remove('playing');
      if (btn) { btn.classList.remove('speaking'); btn.textContent = '🔊'; }
    };
    speechUtterance.onerror = function() {
      if (wave) wave.classList.remove('playing');
      if (btn) { btn.classList.remove('speaking'); btn.textContent = '🔊'; }
    };

    window.speechSynthesis.speak(speechUtterance);
  } catch (e) {
    // Silent fail — voice is a bonus, never block booking
  }
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  var wave = document.querySelector('.voice-wave');
  if (wave) wave.classList.remove('playing');
  var btn = document.querySelector('.voice-btn');
  if (btn) { btn.classList.remove('speaking'); btn.textContent = '🔊'; }
}

function toggleVoice() {
  speechEnabled = !speechEnabled;
  var btn = document.getElementById('voiceToggleBtn');
  if (btn) {
    btn.classList.toggle('muted', !speechEnabled);
    btn.textContent = speechEnabled ? '🔊' : '🔇';
  }
  if (!speechEnabled) stopSpeaking();
}

function renderVoiceNote(ticketData) {
  var container = document.getElementById('voiceNoteSlot');
  if (!container) return '';
  container.innerHTML = '<div class="voice-note">' +
    '<button class="voice-btn" id="voiceToggleBtn" title="Play / Mute voice greeting" onclick="toggleVoice()">🔊</button>' +
    '<span class="voice-wave"><span></span><span></span><span></span><span></span><span></span></span>' +
    '<span>Happy Journey! Tap to hear your greeting</span>' +
    '</div>';
  return container;
}

/* ============================================================
   3D Ticket Generation
   ============================================================ */
window.showTicket3D = function(ticketData) {
  // Create overlay
  var overlay = document.createElement('div');
  overlay.className = 'ticket-3d-overlay';
  overlay.innerHTML = '<div class="ticket-3d-container"><div class="ticket-3d"><div class="ticket-3d-inner">' +
    '<div class="ticket-3d-front">' +
      '<div class="ticket-3d-badge">' + getTransportEmoji(ticketData.type) + '</div>' +
'<div class="ticket-3d-header">🎟️ TripWithUs</div>' +
      '<div class="ticket-3d-type">' + ticketData.type + ' TICKET</div>' +
      '<div class="ticket-3d-route">' +
        '<span class="ticket-city">' + ticketData.from + '</span>' +
        '<span class="ticket-arrow">→</span>' +
        '<span class="ticket-city">' + ticketData.to + '</span>' +
      '</div>' +
      '<div class="ticket-3d-info">' +
        '<div class="ticket-info-row"><span>Booking #</span><strong>' + ticketData.bookingId + '</strong></div>' +
        '<div class="ticket-info-row"><span>Name</span><strong>' + ticketData.name + '</strong></div>' +
        '<div class="ticket-info-row"><span>Transport</span><strong>' + ticketData.transport + '</strong></div>' +
        (ticketData.seats ? '<div class="ticket-info-row"><span>Seats</span><strong>' + ticketData.seats + '</strong></div>' : '') +
        '<div class="ticket-info-row"><span>Date</span><strong>' + ticketData.date + '</strong></div>' +
        '<div class="ticket-info-row"><span>Amount</span><strong class="ticket-amount">' + fmtCurrency(ticketData.amount) + '</strong></div>' +
      '</div>' +
      '<div class="ticket-3d-footer">Paid via ' + ticketData.method + ' ✓</div>' +
      '<div id="voiceNoteSlot"></div>' +
    '</div>' +
    '<button class="ticket-3d-close" onclick="closeTicket3D()">×</button></div>';

  document.body.appendChild(overlay);

  // Trigger animation after render
  setTimeout(function() {
    var ticket = overlay.querySelector('.ticket-3d');
    if (ticket) ticket.classList.add('visible');
  }, 50);

  // Add the voice greeting note + speak the unique welcome message
  setTimeout(function() {
    var slot = overlay.querySelector('#voiceNoteSlot');
    if (slot) {
      slot.innerHTML = '<div class="voice-note">' +
        '<button class="voice-btn" id="voiceToggleBtn" title="Play / Mute voice greeting" onclick="toggleVoice()">🔊</button>' +
        '<span class="voice-wave"><span></span><span></span><span></span><span></span><span></span></span>' +
        '<span>Happy Journey! Playing your greeting...</span>' +
        '</div>';
    }
    speakGreeting(ticketData);
  }, 900);

  // Auto close after 8 seconds (voice greeting plays alongside)
  window.ticket3dTimer = setTimeout(closeTicket3D, 10000);
};

function closeTicket3D() {
  stopSpeaking();
  var overlay = document.querySelector('.ticket-3d-overlay');
  if (overlay) {
    var ticket = overlay.querySelector('.ticket-3d');
    if (ticket) ticket.classList.remove('visible');
    setTimeout(function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 500);
  }
  if (window.ticket3dTimer) {
    clearTimeout(window.ticket3dTimer);
    window.ticket3dTimer = null;
  }
}

function getTransportEmoji(type) {
  var emojis = { 'BUS': '🚌', 'CAR': '🚗', 'TRAIN': '🚆', 'FLIGHT': '✈️', 'HOTEL': '🏨' };
  return emojis[type] || '🎫';
}
