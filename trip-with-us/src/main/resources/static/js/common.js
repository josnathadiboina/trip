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
      <a href="home.html" class="logo">TRIP<span class="dot">•</span>WITH<span class="dot">•</span>US</a>
      <ul class="nav-links" id="navLinks">
        ${link('home.html', 'Home')}
        ${link('bus.html', 'Bus')}
        ${link('car.html', 'Car')}
        ${link('train.html', 'Train')}
        ${link('flight.html', 'Flight')}
        ${link('hotel.html', 'Hotel')}
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
  foot.innerHTML = `<div class="container">&copy; 2026 TRIPWITHUS (INDIA) PRIVATE LIMITED. All rights reserved</div>`;
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

  // 3D Scroll Reveal
  setTimeout(initScrollReveal, 500);

  // Init 3D Mouse Parallax
  setTimeout(initMouseParallax3D, 1000);

  // ---- Site-wide 3D engine ----
  setTimeout(initMagneticButtons, 600);
  setTimeout(initCardSpotlight, 700);
  setTimeout(initFloatingParticles, 800);
  setTimeout(initHero3D, 900);
  setTimeout(initScrollTilt3D, 1100);
  setTimeout(initHeroMouseParallax, 1200);
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
   3D Mouse Parallax Tilt
   ============================================================ */
function initMouseParallax3D() {
  var tiltElements = document.querySelectorAll('.tilt-3d, .result-item, .card, .room-card, .search-card, .offer-card, .why-card, .summary-box, .payment-option, .mode-tab, .social-icon');
  tiltElements.forEach(function(el) {
    el.addEventListener('mousemove', function(e) {
      var rect = el.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = ((y - centerY) / centerY) * -5;
      var rotateY = ((x - centerX) / centerX) * 5;
      el.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(10px)';
      el.style.transition = 'transform 0.1s ease-out';
    });
    el.addEventListener('mouseleave', function() {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      el.style.transition = 'transform 0.5s ease-out';
    });
  });
}

/* ============================================================
   Magnetic Buttons — buttons gently pull toward the cursor
   ============================================================ */
function initMagneticButtons() {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var buttons = document.querySelectorAll('.btn');
  buttons.forEach(function(btn) {
    // Skip magnetic pull on critical booking/action buttons so they are always
    // directly clickable and never "run away" from the cursor (which made the
    // hotel "Book Now" button very hard to click).
    if (btn.hasAttribute('data-no-magnetic') || /book|proceed|pay|confirm|continue|submit|search/i.test(btn.textContent || '')) {
      btn.classList.add('magnetic');
      return;
    }
    btn.classList.add('magnetic');
    btn.addEventListener('mousemove', function(e) {
      var rect = btn.getBoundingClientRect();
      var relX = e.clientX - rect.left - rect.width / 2;
      var relY = e.clientY - rect.top - rect.height / 2;
      var pull = Math.min(8, Math.max(-8, relX * 0.2));
      var pullY = Math.min(5, Math.max(-5, relY * 0.2));
      btn.style.transform = 'translate(' + pull + 'px, ' + pullY + 'px) translateZ(12px)';
      btn.style.transition = 'transform 0.15s ease-out';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.transform = 'translate(0, 0) translateZ(0px)';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    });
  });
}

/* ============================================================
   Card Spotlight — mouse-tracking radial highlight
   ============================================================ */
function initCardSpotlight() {
  var cards = document.querySelectorAll('.card, .result-item, .room-card, .offer-card, .why-card, .summary-box, .search-card');
  cards.forEach(function(card) {
    card.classList.add('spotlight-card');
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var mx = ((e.clientX - rect.left) / rect.width) * 100;
      var my = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
  });
}

/* ============================================================
   Floating 3D Particles — glassy bubbles rising bottom→top
   ============================================================ */
function initFloatingParticles() {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  if (document.getElementById('particles-3d')) return;
  var container = document.createElement('div');
  container.id = 'particles-3d';
  document.body.appendChild(container);

  var colors = ['rgba(255,107,74,0.5)', 'rgba(255,183,76,0.5)', 'rgba(22,48,92,0.45)', 'rgba(255,255,255,0.5)'];
  var count = 18;
  for (var i = 0; i < count; i++) {
    var p = document.createElement('div');
    p.className = 'particle-3d';
    var size = 8 + Math.random() * 16;
    var left = Math.random() * 100;
    var dur = 8 + Math.random() * 10;
    var delay = -Math.random() * dur;
    var sway = (Math.random() * 60 - 30).toFixed(0) + 'px';
    p.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + left + '%;' +
      'background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), ' + colors[i % colors.length] + ' 60%, transparent);' +
      'box-shadow:inset 0 0 8px rgba(255,255,255,0.3), 0 0 14px ' + colors[i % colors.length] + ';' +
      'border:1px solid rgba(255,255,255,0.25);' +
      '--dur:' + dur + 's;--sway:' + sway + ';animation-delay:' + delay + 's;';
    container.appendChild(p);
  }
}

/* ============================================================
   Hero 3D — rotating rings + floating orbs in every hero
   ============================================================ */
function initHero3D() {
  var heroes = document.querySelectorAll('header.hero');
  heroes.forEach(function(hero) {
    hero.style.transformStyle = 'preserve-3d';
    // Skip if already injected
    if (hero.querySelector('.hero-ring')) return;

    // Floating orbs
    var orbs = [
      { size: 200, top: '12%', left: '8%', color: 'rgba(255,107,74,0.16)' },
      { size: 150, top: '18%', right: '12%', color: 'rgba(255,183,76,0.14)' },
      { size: 90, top: '60%', left: '22%', color: 'rgba(255,255,255,0.10)' }
    ];
    orbs.forEach(function(orb, idx) {
      var div = document.createElement('div');
      div.className = 'hero-orb';
      div.style.cssText = 'width:' + orb.size + 'px;height:' + orb.size + 'px;' +
        (orb.top !== undefined ? 'top:' + orb.top + ';' : '') +
        (orb.left !== undefined ? 'left:' + orb.left + ';' : '') +
        (orb.right !== undefined ? 'right:' + orb.right + ';' : '') +
        'background:radial-gradient(circle,' + orb.color + ',transparent 70%);' +
        'animation-delay:' + (idx * 1.2) + 's;';
      hero.appendChild(div);
    });

    // Rotating rings
    var ringSpecs = [
      { cls: 'hero-ring-1', size: 260, top: '-60px', right: '10%' },
      { cls: 'hero-ring-2', size: 180, top: '30%', left: '5%' },
      { cls: 'hero-ring-3', size: 120, top: '55%', right: '22%' }
    ];
    ringSpecs.forEach(function(r) {
      var ring = document.createElement('div');
      ring.className = 'hero-ring ' + r.cls;
      ring.style.cssText = 'width:' + r.size + 'px;height:' + r.size + 'px;' +
        (r.top !== undefined ? 'top:' + r.top + ';' : '') +
        (r.left !== undefined ? 'left:' + r.left + ';' : '') +
        (r.right !== undefined ? 'right:' + r.right + ';' : '');
      hero.appendChild(ring);
    });

    // Wrap hero inner content for 3D parallax
    var container = hero.querySelector('.container');
    if (container && !container.classList.contains('hero-content-3d')) {
      container.classList.add('hero-content-3d');
    }
  });
}

/* ============================================================
   Scroll-based 3D Tilt — elements rotate as they scroll
   ============================================================ */
function initScrollTilt3D() {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var elements = document.querySelectorAll('.section-title, .card, .result-item, .room-card, .offer-card, .why-card, .mission-icon, .mode-tab');
  if (!elements.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-tilt');
        var rect = entry.boundingClientRect;
        var centerY = rect.top + rect.height / 2;
        var viewportCenter = window.innerHeight / 2;
        var delta = (centerY - viewportCenter) / viewportCenter;
        var tilt = Math.max(-6, Math.min(6, delta * 6));
        entry.target.style.transform = 'perspective(900px) rotateX(' + tilt + 'deg) translateZ(8px)';
        setTimeout(function() {
          entry.target.style.transform = 'perspective(900px) rotateX(0deg) translateZ(0px)';
        }, 500);
      }
    });
  }, { threshold: 0.15 });
  elements.forEach(function(el) { observer.observe(el); });
}

/* ============================================================
   Hero Mouse Parallax — hero content follows the cursor
   ============================================================ */
function initHeroMouseParallax() {
  var heroes = document.querySelectorAll('header.hero');
  heroes.forEach(function(hero) {
    var content = hero.querySelector('.container');
    if (!content) return;
    hero.addEventListener('mousemove', function(e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      content.style.transform = 'perspective(900px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg) translateZ(20px)';
      content.style.transition = 'transform 0.1s ease-out';
    });
    hero.addEventListener('mouseleave', function() {
      content.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
      content.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    });
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
        <span class="payment-icon">💰</span>
        <span class="payment-label">Wallet (Paytm / Amazon Pay)</span>
      </label>
    </div>
    <div id="paymentDetailInput" class="mt-16">
      <div class="form-group">
        <label id="paymentDetailLabel">UPI ID</label>
        <input type="text" id="paymentDetailField" placeholder="e.g. name@upi" class="payment-input">
      </div>
    <button class="btn btn-primary btn-block mt-16" onclick="handlePayment('${containerId}')">
      Pay <span id="paymentAmountLabel">₹0</span>
    </button>
    <p class="error-text" id="paymentErr"></p>
  `;

  // Update payment detail field based on selection
  el.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const detailLabel = document.getElementById('paymentDetailLabel');
      const detailField = document.getElementById('paymentDetailField');
      const val = radio.value;
      if (val === 'UPI') {
        detailLabel.textContent = 'UPI ID';
        detailField.placeholder = 'e.g. name@upi';
      } else if (val === 'Card') {
        detailLabel.textContent = 'Card Number';
        detailField.placeholder = 'XXXX XXXX XXXX XXXX';
      } else if (val === 'NetBanking') {
        detailLabel.textContent = 'Select Bank';
        detailField.placeholder = 'e.g. SBI, HDFC, ICICI';
      } else {
        detailLabel.textContent = 'Wallet Mobile Number';
        detailField.placeholder = 'e.g. 9876543210';
      }
    });
  });

  // Store the onComplete callback
  el.dataset.onComplete = onComplete ? 'true' : 'false';
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

  const detail = document.getElementById('paymentDetailField').value.trim();
  if (!detail) {
    errEl.textContent = 'Please enter your payment details.';
    errEl.style.display = 'block';
    return;
  }

  // Simulate payment processing with 3D spinner
  const payBtn = document.querySelector(`#${containerId} .btn-primary`);
  payBtn.disabled = true;
  payBtn.innerHTML = '<span class="spinner-3d"></span> Processing...';

  // Simulate a 1.5s payment gateway call
  setTimeout(() => {
    // Call the stored onComplete callback via custom event
    document.dispatchEvent(new CustomEvent('paymentComplete', {
      detail: { method: selected.value, detail: detail }
    }));
  }, 1500);
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
      '<div class="ticket-3d-header">TRIP·WITH·US</div>' +
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
    '</div>' +
    '<button class="ticket-3d-close" onclick="closeTicket3D()">✕</button></div>';

  document.body.appendChild(overlay);

  // Trigger animation after render
  setTimeout(function() {
    var ticket = overlay.querySelector('.ticket-3d');
    if (ticket) ticket.classList.add('visible');
  }, 50);

  // Auto close after 8 seconds
  window.ticket3dTimer = setTimeout(closeTicket3D, 8000);
};

function closeTicket3D() {
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
