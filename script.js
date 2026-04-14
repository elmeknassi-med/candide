/* Candide School – Interactive behaviour */

(function () {
  'use strict';

  /* ── Navbar: scroll effect & mobile toggle ── */
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
    toggleBackToTop();
  }, { passive: true });

  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  /* Close mobile menu when a link is clicked */
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Active nav link on scroll ── */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(function (section) {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = navLinks.querySelector('a[href="#' + id + '"]');
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          navLinks.querySelectorAll('a').forEach(function (a) { a.classList.remove('active'); });
          link.classList.add('active');
        }
      }
    });
  }

  /* ── Back-to-top button ── */
  const backToTop = document.getElementById('back-to-top');

  function toggleBackToTop() {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Contact form ── */
  const form     = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Simple client-side validation */
      const firstName = form.firstName.value.trim();
      const lastName  = form.lastName.value.trim();
      const email     = form.email.value.trim();
      const message   = form.message.value.trim();

      if (!firstName || !lastName || !email || !message) {
        feedback.textContent = '⚠️ Please fill in all required fields.';
        feedback.style.color = '#c0392b';
        feedback.style.display = 'block';
        return;
      }

      /* Use the browser's built-in email validity check (honours HTML5 spec) */
      if (!form.email.validity.valid) {
        feedback.textContent = '⚠️ Please enter a valid email address.';
        feedback.style.color = '#c0392b';
        feedback.style.display = 'block';
        return;
      }

      /* Simulate a successful submission */
      feedback.textContent = '✅ Thank you! Your message has been received. We will get back to you shortly.';
      feedback.style.color = '#1e8449';
      feedback.style.display = 'block';
      form.reset();
    });
  }

  /* ── Intersection Observer: fade-in cards on scroll ── */
  if ('IntersectionObserver' in window) {
    const cards = document.querySelectorAll(
      '.program-card, .faculty-card, .event-item, .testimonial-card'
    );

    /* Use a CSS class for the initial hidden state to avoid conflicting with
       any inline transform values set by hover effects. */
    const style = document.createElement('style');
    style.textContent = [
      '.fade-hidden { opacity: 0; transform: translateY(20px);',
      '  transition: opacity .5s ease, transform .5s ease; }',
      '.fade-visible { opacity: 1; transform: translateY(0); }'
    ].join(' ');
    document.head.appendChild(style);

    cards.forEach(function (card) { card.classList.add('fade-hidden'); });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('fade-hidden');
          entry.target.classList.add('fade-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    cards.forEach(function (card) { observer.observe(card); });
  }

})();
