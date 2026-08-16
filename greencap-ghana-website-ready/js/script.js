/* =========================================================
   GreenCap Ghana — Interactions
   Loading screen, nav behavior, scroll reveals, count-up,
   mobile menu, contact form, back-to-top.
   ========================================================= */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle (light/dark) ---------- */
  (function initThemeToggle() {
    var root = document.documentElement;
    var toggle = document.getElementById('themeToggle');
    var systemPref = window.matchMedia('(prefers-color-scheme: dark)');

    function currentTheme() {
      return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function reflectToggleState(theme) {
      if (!toggle) return;
      var switchingTo = theme === 'dark' ? 'light' : 'dark';
      toggle.setAttribute('aria-label', 'Switch to ' + switchingTo + ' mode');
    }

    function applyTheme(theme, persist) {
      root.setAttribute('data-theme', theme);
      reflectToggleState(theme);
      if (persist) {
        try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ }
      }
    }

    // Sync the button label with whatever the head script already applied.
    reflectToggleState(currentTheme());

    if (toggle) {
      toggle.addEventListener('click', function () {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
      });
    }

    // If the visitor hasn't made an explicit choice yet, keep following
    // their OS preference live (e.g. their system switches to dark mode
    // at sunset). Once they pick a theme manually, that choice sticks.
    var hasStoredPreference;
    try { hasStoredPreference = !!localStorage.getItem('theme'); } catch (e) { hasStoredPreference = false; }
    if (!hasStoredPreference && systemPref.addEventListener) {
      systemPref.addEventListener('change', function (e) {
        applyTheme(e.matches ? 'dark' : 'light', false);
      });
    }
  })();

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Loading screen ---------- */
  var loader = document.getElementById('loader');
  function hideLoader() {
    if (!loader) return;
    loader.classList.add('is-hidden');
  }
  if (prefersReducedMotion) {
    hideLoader();
  } else {
    window.addEventListener('load', function () {
      setTimeout(hideLoader, 500);
    });
    // Safety net in case 'load' is delayed
    setTimeout(hideLoader, 2600);
  }

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById('siteHeader');
  var backToTop = document.getElementById('backToTop');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 600);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  var navOverlay = document.getElementById('navOverlay');

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    if (navOverlay) navOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      if (navOverlay) navOverlay.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    if (navOverlay) navOverlay.addEventListener('click', closeMenu);

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Smooth-scroll offset correction for fixed header ---------- */
  var headerHeight = function () {
    return header ? header.offsetHeight : 0;
  };
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - (headerHeight() + 12);
      window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      // Update focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal-up');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Count-up metrics ----------
     Values are placeholders ("—") until verified figures are supplied.
     To activate a metric once real data is available:
       1. Set the number as the element's text content instead of "—"
       2. Set data-count-to="<final number>" on the same element
     The observer below will animate 0 -> final number when the panel
     scrolls into view. Elements left at "—" are skipped automatically. */
  // var metricEls = document.querySelectorAll('.metric-value');
  // function animateCount(el) {
  //   var target = parseInt(el.getAttribute('data-count-to'), 10);
  //   if (!target || isNaN(target) || target <= 0) return; // placeholder, skip
  //   var duration = 1400;
  //   var start = null;
  //   function step(ts) {
  //     if (start === null) start = ts;
  //     var progress = Math.min((ts - start) / duration, 1);
  //     var eased = 1 - Math.pow(1 - progress, 3);
  //     el.textContent = Math.floor(eased * target).toLocaleString();
  //     if (progress < 1) {
  //       window.requestAnimationFrame(step);
  //     } else {
  //       el.textContent = target.toLocaleString();
  //     }
  //   }
  //   window.requestAnimationFrame(step);
  // }
  // if (metricEls.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
  //   var metricObserver = new IntersectionObserver(
  //     function (entries) {
  //       entries.forEach(function (entry) {
  //         if (entry.isIntersecting) {
  //           animateCount(entry.target);
  //           metricObserver.unobserve(entry.target);
  //         }
  //       });
  //     },
  //     { threshold: 0.5 }
  //   );
  //   metricEls.forEach(function (el) { metricObserver.observe(el); });
  // }

  /* ---------- Active nav link on scroll ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute('id');
          var link = document.querySelector('.nav-links a[href="#' + id + '"]');
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove('is-active'); });
            link.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Contact form (EmailJS) ---------- */
  var EMAILJS_PUBLIC_KEY = 'g9ZonDoWRkG2YnZvX';
  var EMAILJS_SERVICE_ID = 'service_i7j06jj';
  var EMAILJS_TEMPLATE_ID = 'template_1o1e66h';

  if (window.emailjs && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  var form = document.getElementById('contactForm');
  var formNote = document.getElementById('formNote');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var label = submitBtn ? submitBtn.querySelector('.btn-label') : null;
      var nameField = document.getElementById('name');
      var orgField = document.getElementById('org');
      var emailField = document.getElementById('email');
      var interestField = document.getElementById('interest');
      var messageField = document.getElementById('message');

      if (label) label.textContent = 'Sending…';
      if (submitBtn) submitBtn.disabled = true;
      if (formNote) formNote.textContent = '';

      var templateParams = {
        name: nameField ? nameField.value : '',
        organization: orgField ? orgField.value : '',
        email: emailField ? emailField.value : '',
        interest: interestField ? interestField.value : '',
        message: messageField ? messageField.value : '',
        // Lets an EmailJS template use {{reply_to}} so GreenCap can hit
        // "Reply" and respond straight to the visitor.
        reply_to: emailField ? emailField.value : ''
      };

      sendContactForm(templateParams)
        .then(function () {
          if (formNote) {
            formNote.textContent = 'Thank you — your message has been sent successfully. Our team will get back to you soon.';
          }
          form.reset();
        })
        .catch(function (error) {
          console.error('EmailJS submission failed:', error);
          if (formNote) {
            formNote.textContent = "Sorry, we couldn't send your message right now. Please try again in a moment.";
          }
        })
        .finally(function () {
          if (label) label.textContent = 'Send Message';
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  function sendContactForm(templateParams) {
    if (!window.emailjs) {
      return Promise.reject(new Error('EmailJS SDK failed to load.'));
    }
    if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID') {
      return Promise.reject(new Error('EmailJS service/template IDs have not been configured yet.'));
    }
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
  }
})();
