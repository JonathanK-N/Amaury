/* ══════════════════════════════════════════════
   TERROIRS CROISÉS – JavaScript
   ══════════════════════════════════════════════ */

'use strict';

// ── State ──
let cart = [];
let lang = 'fr';

// ── Helpers ──
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ══════════════════════════════════
// PRELOADER
// ══════════════════════════════════
window.addEventListener('load', () => {
  setTimeout(() => {
    const pre = $('preloader');
    if (pre) { pre.classList.add('hidden'); }
  }, 1200);
});

// ══════════════════════════════════
// NAVBAR – sticky + scroll class
// ══════════════════════════════════
function initNavbar() {
  const nav = $('navbar');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ══════════════════════════════════
// MOBILE MENU
// ══════════════════════════════════
function initMobileMenu() {
  const btn = $('hamburger');
  const menu = $('nav-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    menu.classList.toggle('open');
  });

  // Close on link click
  $$('#nav-menu a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('active');
      menu.classList.remove('open');
    });
  });

  // Mobile dropdowns
  $$('.has-dropdown > a').forEach(a => {
    a.addEventListener('click', e => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        a.closest('.has-dropdown').classList.toggle('open');
      }
    });
  });
}

// ══════════════════════════════════
// SMOOTH SCROLL
// ══════════════════════════════════
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ══════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  $$('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
}

// ══════════════════════════════════
// PARALLAX HERO
// ══════════════════════════════════
function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroBg.style.transform = `scale(1.05) translateY(${y * 0.2}px)`;
    }
  }, { passive: true });
}

// ══════════════════════════════════
// CART
// ══════════════════════════════════
function initCart() {
  const overlay = $('cart-overlay');
  const sidebar = $('cart-sidebar');
  const openBtn = $('cart-btn');
  const closeBtn = $('close-cart');

  function openCart() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  openBtn?.addEventListener('click', openCart);
  closeBtn?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);

  // Add to cart buttons
  $$('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      addToCart(id, name, price);
      openCart();
      animateCartBtn();
    });
  });

  // Wishlist toggle
  $$('.product-wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
      const icon = btn.querySelector('i');
      icon.classList.toggle('far');
      icon.classList.toggle('fas');
      icon.style.color = icon.classList.contains('fas') ? '#e74c3c' : '';
    });
  });
}

function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  renderCart();
}

function renderCart() {
  const container = $('cart-items');
  const countEl = $('cart-count');
  const totalEl = $('cart-total-price');
  if (!container) return;

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.qty * i.price, 0);

  countEl.textContent = totalQty || '';
  totalEl.textContent = formatPrice(totalPrice);

  if (cart.length === 0) {
    container.innerHTML = `<p class="cart-empty">${lang === 'fr' ? 'Votre panier est vide.' : 'Your cart is empty.'}</p>`;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
      </div>
      <div class="cart-item-price">${formatPrice(item.qty * item.price)}</div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash-alt"></i></button>
    </div>
  `).join('');
}

function formatPrice(n) {
  return n.toFixed(2).replace('.', ',') + ' $';
}

function animateCartBtn() {
  const btn = $('cart-btn');
  if (!btn) return;
  btn.style.transform = 'scale(1.3)';
  setTimeout(() => { btn.style.transform = ''; }, 300);
}

// ══════════════════════════════════
// CHECKOUT MODAL
// ══════════════════════════════════
function initCheckout() {
  const overlay = $('checkout-overlay');
  const modal = $('checkout-modal');
  const closeBtn = $('close-checkout');
  const checkoutBtn = document.querySelector('.cart-checkout');
  const successEl = $('payment-success');
  const contentEl = $('checkout-content');
  const successClose = $('success-close');

  function openCheckout() {
    if (cart.length === 0) return;
    renderCheckoutSummary();
    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Close cart sidebar
    $('cart-sidebar')?.classList.remove('active');
    $('cart-overlay')?.classList.remove('active');
  }

  function closeCheckout() {
    overlay.classList.remove('active');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Reset to content view
    if (successEl) successEl.style.display = 'none';
    if (contentEl) contentEl.style.display = '';
  }

  checkoutBtn?.addEventListener('click', openCheckout);
  closeBtn?.addEventListener('click', closeCheckout);
  overlay?.addEventListener('click', closeCheckout);
  successClose?.addEventListener('click', () => {
    closeCheckout();
    cart = [];
    renderCart();
  });

  // Payment tabs
  $$('.ptab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.ptab').forEach(t => t.classList.remove('active'));
      $$('.payment-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      $(tab.dataset.target)?.classList.add('active');
    });
  });

  // Credit card form
  initCreditCardForm();
  // PayPal flow
  initPayPalFlow();
}

function renderCheckoutSummary() {
  const itemsEl = $('checkout-items');
  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const tps = subtotal * 0.05;
  const tvq = subtotal * 0.09975;
  const total = subtotal + tps + tvq;

  if (itemsEl) {
    itemsEl.innerHTML = cart.map(item => `
      <div class="checkout-item">
        <span class="checkout-item-name">${item.name}</span>
        <span class="checkout-item-qty">x${item.qty}</span>
        <span class="checkout-item-price">${formatPrice(item.qty * item.price)}</span>
      </div>
    `).join('');
  }

  $('co-subtotal').textContent = formatPrice(subtotal);
  $('co-tps').textContent = formatPrice(tps);
  $('co-tvq').textContent = formatPrice(tvq);
  $('co-total').textContent = formatPrice(total);
  $('cc-pay-amount').textContent = formatPrice(total);
}

function showPaymentSuccess() {
  const successEl = $('payment-success');
  const contentEl = $('checkout-content');
  const orderNum = 'TC-' + Date.now().toString(36).toUpperCase();

  if (contentEl) contentEl.style.display = 'none';
  if (successEl) {
    successEl.style.display = '';
    successEl.querySelector('.success-order-num').textContent =
      (lang === 'fr' ? 'Commande #' : 'Order #') + orderNum;
  }
}

// ══════════════════════════════════
// CREDIT CARD FORM
// ══════════════════════════════════
function initCreditCardForm() {
  const form = $('cc-form');
  if (!form) return;

  const nameIn = $('cc-name');
  const numIn = $('cc-number');
  const expIn = $('cc-expiry');
  const cvvIn = $('cc-cvv');
  const emailIn = $('cc-email');
  const cardInner = $('card-visual-inner');

  // Format card number with spaces
  numIn?.addEventListener('input', () => {
    let v = numIn.value.replace(/\D/g, '').substring(0, 16);
    numIn.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    $('cv-number').textContent = v ? v.replace(/(\d{4})(?=\d)/g, '$1 ').padEnd(19, '•') : '•••• •••• •••• ••••';
    detectCardType(v);
  });

  // Format expiry MM / YY
  expIn?.addEventListener('input', () => {
    let v = expIn.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 3) v = v.substring(0, 2) + ' / ' + v.substring(2);
    expIn.value = v;
    $('cv-expiry').textContent = v || 'MM/AA';
  });

  // CVV – flip card
  cvvIn?.addEventListener('focus', () => cardInner?.classList.add('flipped'));
  cvvIn?.addEventListener('blur', () => cardInner?.classList.remove('flipped'));
  cvvIn?.addEventListener('input', () => {
    cvvIn.value = cvvIn.value.replace(/\D/g, '').substring(0, 4);
    $('cv-cvv').textContent = cvvIn.value || '•••';
  });

  // Name
  nameIn?.addEventListener('input', () => {
    $('cv-name').textContent = nameIn.value.toUpperCase() || 'JEAN TREMBLAY';
  });

  // Submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateCCForm()) return;

    const btn = $('cc-pay-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (lang === 'fr' ? 'Traitement...' : 'Processing...');

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-lock"></i> <span>${lang === 'fr' ? 'Payer maintenant' : 'Pay Now'}</span> <span>${$('co-total').textContent}</span>`;
      showPaymentSuccess();
    }, 2000);
  });
}

function detectCardType(num) {
  const typeEl = $('cc-card-type');
  const brandEl = $('cv-brand');
  let icon = 'far fa-credit-card';
  let brand = '<i class="far fa-credit-card fa-2x"></i>';

  if (/^4/.test(num)) { icon = 'fab fa-cc-visa'; brand = '<i class="fab fa-cc-visa fa-2x"></i>'; }
  else if (/^5[1-5]/.test(num)) { icon = 'fab fa-cc-mastercard'; brand = '<i class="fab fa-cc-mastercard fa-2x"></i>'; }
  else if (/^3[47]/.test(num)) { icon = 'fab fa-cc-amex'; brand = '<i class="fab fa-cc-amex fa-2x"></i>'; }

  if (typeEl) typeEl.innerHTML = `<i class="${icon}"></i>`;
  if (brandEl) brandEl.innerHTML = brand;
}

function validateCCForm() {
  let valid = true;
  const name = $('cc-name').value.trim();
  const num = $('cc-number').value.replace(/\s/g, '');
  const exp = $('cc-expiry').value.replace(/\s/g, '');
  const cvv = $('cc-cvv').value;
  const email = $('cc-email').value.trim();

  // Reset errors
  $$('.cc-error').forEach(e => e.textContent = '');

  if (name.length < 2) {
    $('err-name').textContent = lang === 'fr' ? 'Nom requis' : 'Name required';
    valid = false;
  }
  if (!/^\d{13,19}$/.test(num)) {
    $('err-number').textContent = lang === 'fr' ? 'Numéro invalide' : 'Invalid number';
    valid = false;
  }
  if (!/^\d{2}\/\d{2}$/.test(exp)) {
    $('err-expiry').textContent = lang === 'fr' ? 'Format MM/AA' : 'Format MM/YY';
    valid = false;
  } else {
    const [m, y] = exp.split('/').map(Number);
    const now = new Date();
    const expDate = new Date(2000 + y, m);
    if (m < 1 || m > 12 || expDate < now) {
      $('err-expiry').textContent = lang === 'fr' ? 'Date expirée' : 'Expired date';
      valid = false;
    }
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    $('err-cvv').textContent = lang === 'fr' ? 'CVV invalide' : 'Invalid CVV';
    valid = false;
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    $('err-email').textContent = lang === 'fr' ? 'Courriel invalide' : 'Invalid email';
    valid = false;
  }
  return valid;
}

// ══════════════════════════════════
// PAYPAL FLOW (SIMULATION)
// ══════════════════════════════════
function initPayPalFlow() {
  const ppBtn = $('paypal-btn');
  const ppOverlay = $('pp-popup-overlay');
  const ppClose = $('pp-popup-close');
  const ppLogin = $('pp-login-btn');
  const ppConfirm = $('pp-confirm-btn');
  const ppCancel = $('pp-cancel-btn');

  function showStep(id) {
    $$('.pp-step').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    const step = $(id);
    if (step) { step.style.display = 'block'; step.classList.add('active'); }
  }

  function openPP() {
    ppOverlay.style.display = '';
    showStep('pp-step-login');
    $('pp-confirm-amount').textContent = $('co-total').textContent;
  }

  function closePP() {
    ppOverlay.style.display = 'none';
    showStep('pp-step-login');
    $('pp-email').value = '';
    $('pp-pass').value = '';
  }

  ppBtn?.addEventListener('click', openPP);
  ppClose?.addEventListener('click', closePP);
  ppCancel?.addEventListener('click', closePP);

  ppLogin?.addEventListener('click', () => {
    if (!$('pp-email').value || !$('pp-pass').value) return;
    showStep('pp-step-confirm');
  });

  ppConfirm?.addEventListener('click', () => {
    showStep('pp-step-processing');
    setTimeout(() => {
      closePP();
      showPaymentSuccess();
    }, 2500);
  });
}

// ══════════════════════════════════
// LANGUAGE TOGGLE
// ══════════════════════════════════
function initLangToggle() {
  const btn = $('lang-toggle');
  const label = $('lang-label');
  if (!btn) return;

  btn.addEventListener('click', () => {
    lang = lang === 'fr' ? 'en' : 'fr';
    label.textContent = lang === 'fr' ? 'EN' : 'FR';
    applyLang();
  });
}

function applyLang() {
  $$('[data-fr][data-en]').forEach(el => {
    const text = el.dataset[lang];
    if (!text) return;
    // For inputs/select options use value/placeholder; otherwise innerHTML
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else if (el.tagName === 'OPTION') {
      el.textContent = text;
    } else {
      el.innerHTML = text;
    }
  });

  // Update html lang attribute
  document.documentElement.lang = lang;

  // Update add-to-cart button labels
  $$('.add-to-cart-btn').forEach(btn => {
    btn.textContent = btn.dataset[lang] || btn.textContent;
  });

  // Re-render cart for empty message
  if ($('cart-items')) renderCart();
}

// ══════════════════════════════════
// CONTACT FORM
// ══════════════════════════════════
function initContactForm() {
  const form = $('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const success = $('form-success');
    if (success) {
      success.style.display = 'flex';
      form.reset();
      setTimeout(() => { success.style.display = 'none'; }, 5000);
    }
  });
}

// ══════════════════════════════════
// ACTIVE NAV LINK on scroll
// ══════════════════════════════════
function initActiveNav() {
  const sections = $$('section[id]');
  const links = $$('#nav-menu a[href^="#"]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`#nav-menu a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
}

// ══════════════════════════════════
// CURSOR GLOW (desktop only)
// ══════════════════════════════════
function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;pointer-events:none;z-index:9998;
    width:300px;height:300px;border-radius:50%;
    background:radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%);
    transform:translate(-50%,-50%);transition:opacity 0.3s;
  `;
  document.body.appendChild(glow);

  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });
}

// ══════════════════════════════════
// NUMBERS COUNTER ANIMATION
// ══════════════════════════════════
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

// ══════════════════════════════════
// INIT ALL
// ══════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initParallax();
  initCart();
  initLangToggle();
  initContactForm();
  initActiveNav();
  initCursorGlow();
  initCheckout();

  // Initial cart render
  renderCart();

  // Staggered reveal delays for grid items
  $$('.product-card, .team-card, .service-card, .value-card').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
  });

  console.log('%c🍽 Terroirs Croisés', 'color:#c9a96e;font-size:1.5rem;font-weight:bold;');
  console.log('%cRestaurant gastronomique québécois – Sherbrooke, QC', 'color:#888;');
});

// ── Expose for inline handlers ──
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
