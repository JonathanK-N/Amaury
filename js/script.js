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

// Checkout button
document.addEventListener('DOMContentLoaded', () => {
  const checkout = document.querySelector('.cart-checkout');
  checkout?.addEventListener('click', () => {
    if (cart.length === 0) return;
    alert(lang === 'fr'
      ? `Merci pour votre commande ! Total : ${formatPrice(cart.reduce((s,i)=>s+i.qty*i.price,0))}\nNous vous contacterons sous peu.`
      : `Thank you for your order! Total: ${formatPrice(cart.reduce((s,i)=>s+i.qty*i.price,0))}\nWe will contact you shortly.`
    );
    cart = [];
    renderCart();
  });
});

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
