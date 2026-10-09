/**
 * Cafe Matcha Coffee Crawl — Main JavaScript
 * Handles cart management, responsive navigation, scroll effects, and interactive features.
 */

// Cart state management
let cartCount = 0;
const cartCountElement = document.getElementById('cart-count');
const cartNotification = document.getElementById('cart-notification');
const cartNotificationText = document.getElementById('cart-notification-text');
let notificationTimeout = null;

// Initialize cart from localStorage if present
function initCart() {
  const savedCount = localStorage.getItem('cafe_matcha_cart_count');
  if (savedCount && !isNaN(parseInt(savedCount, 10))) {
    cartCount = parseInt(savedCount, 10);
    updateCartDisplay();
  }
}

// Update cart badge UI
function updateCartDisplay() {
  if (!cartCountElement) return;
  cartCountElement.textContent = cartCount;
  if (cartCount > 0) {
    cartCountElement.classList.add('visible');
  } else {
    cartCountElement.classList.remove('visible');
  }
}

// Add product to cart with animated feedback
function addToCart(button) {
  const productName = button.getAttribute('data-product') || 'Item';
  const productPrice = button.getAttribute('data-price') || '';

  cartCount++;
  localStorage.setItem('cafe_matcha_cart_count', cartCount);
  updateCartDisplay();

  // Add bounce effect to cart count badge
  if (cartCountElement) {
    cartCountElement.classList.remove('bump');
    void cartCountElement.offsetWidth; // trigger reflow
    cartCountElement.classList.add('bump');
  }

  // Button micro-interaction
  const originalHTML = button.innerHTML;
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    Added!
  `;
  button.style.background = 'linear-gradient(135deg, #2E3827 0%, #1a2215 100%)';

  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.style.background = '';
  }, 1400);

  // Show Toast Notification
  showNotification(`Added ${productName} (₹${productPrice}) to your cart! ☕`);
}

// Display Toast Notification
function showNotification(message) {
  if (!cartNotification) return;

  if (cartNotificationText) {
    cartNotificationText.textContent = message;
  }

  cartNotification.classList.add('show');

  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  notificationTimeout = setTimeout(() => {
    cartNotification.classList.remove('show');
  }, 3200);
}

// Navbar scroll listener (adds shadow & blur styling on scroll)
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// Mobile navigation menu toggle
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (!hamburger || !navLinks) return;

  // Create backdrop overlay for mobile menu if not exists
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  function toggleMenu() {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    overlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  // Close menu when any nav link is clicked
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// Scroll spy to highlight active section in navbar
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__links a[href^="#"]');

  if (sections.length === 0 || navLinks.length === 0) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').substring(1);
      if (href === currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }, { passive: true });
}

// Newsletter subscription handling
function handleNewsletterSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('newsletter-email');
  const msg = document.getElementById('newsletter-msg');

  if (!input || !msg) return;

  const email = input.value.trim();
  if (email) {
    msg.textContent = `☕ Thanks for joining! Welcome, ${email}.`;
    msg.style.color = '#E4B44A';
    input.value = '';

    setTimeout(() => {
      msg.textContent = '';
    }, 5000);
  }
}

// Cart button interaction
function initCartButton() {
  const cartBtn = document.getElementById('cart-btn');
  if (!cartBtn) return;

  cartBtn.addEventListener('click', () => {
    if (cartCount === 0) {
      showNotification('Your cart is empty. Pick a drink from the menu below! 🍵');
    } else {
      showNotification(`🛒 You have ${cartCount} item${cartCount > 1 ? 's' : ''} in your cart ready for pickup!`);
    }
  });
}

// Scroll animations (IntersectionObserver)
function initScrollAnimations() {
  const cards = document.querySelectorAll('.feature-card, .menu-card, .cafe-card');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in', 'visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.classList.add('fade-in');
    observer.observe(card);
  });
}

// Global initialization on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initCart();
  initNavbarScroll();
  initMobileMenu();
  initScrollSpy();
  initCartButton();
  initScrollAnimations();
});
