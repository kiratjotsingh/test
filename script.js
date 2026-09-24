/* ==========================================================
   Made by Kirat — Creative studio
   script.js  (plain JavaScript, no libraries)

   Features
   1. Theme toggle (dark / light, remembered)
   2. Mobile menu
   3. Glow cursor that follows the mouse
   4. Scroll-reveal animations
   5. Animated stat counters
   6. Testimonial slider
   7. Header shadow + hero side-label parallax
   8. Footer year
   9. Hero headline reveal
  10. Magnetic buttons
  11. Page transitions
  12. Contact form (Formspree or email fallback)
   ========================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Theme toggle ---------- */
  var themeButton = document.getElementById('theme-toggle');

  function applyThemeUI() {
    if (!themeButton) return;
    var isDark = root.classList.contains('dark');
    var label = themeButton.querySelector('.theme-label');
    if (label) label.textContent = isDark ? 'Light' : 'Dark';
    themeButton.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  if (themeButton) {
    themeButton.addEventListener('click', function () {
      var nowDark = root.classList.toggle('dark');
      try { localStorage.setItem('mbk-theme', nowDark ? 'dark' : 'light'); } catch (e) {}
      applyThemeUI();
    });
    applyThemeUI();
  }

  /* ---------- 2. Mobile menu ---------- */
  var menuButton = document.getElementById('mobile-menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  function setMenu(open) {
    if (!menuButton || !mobileNav) return;
    mobileNav.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      setMenu(mobileNav.hidden);
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 640) setMenu(false);
    });
  }

  /* ---------- 3. Glow cursor ---------- */
  var cursor = document.querySelector('.custom-cursor');
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursor && canHover && !prefersReducedMotion) {
    var targetX = -100, targetY = -100, currentX = -100, currentY = -100;

    window.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('[data-cursor="hover"]')) cursor.classList.add('is-hovering');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('[data-cursor="hover"]')) cursor.classList.remove('is-hovering');
    });

    (function tick() {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      cursor.style.transform = 'translate(' + currentX + 'px, ' + currentY + 'px)';
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- 4. Scroll reveal ---------- */
  var revealItems = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 5. Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');

  function pad(n, width) {
    var s = String(n);
    while (s.length < width) s = '0' + s;
    return s;
  }

  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var width = parseInt(el.getAttribute('data-pad') || '0', 10);
    if (prefersReducedMotion) { el.textContent = pad(target, width); return; }

    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = pad(Math.round(target * eased), width);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------- 6. Testimonial slider ---------- */
  /* Edit this list to add, change or remove testimonials.
     NOTE: only the first quote came from the original page —
     the other two are placeholders to replace with real ones. */
  var testimonials = [
    {
      quote: 'Kirat took an idea that was hard to explain and made it feel obvious. The new identity changed how every room listened to us.',
      name: 'Maya Chen',
      role: 'Co-founder, Aura BioTech'
    },
    {
      quote: 'Replace this placeholder with a real client testimonial. Keep it to a sentence or two so it sits well at this size.',
      name: 'Client Name',
      role: 'Role, Company'
    },
    {
      quote: 'Replace this placeholder with a second real testimonial from a project you are proud of.',
      name: 'Client Name',
      role: 'Role, Company'
    }
  ];

  var tSwap = document.getElementById('testimonial-swap');
  var tQuote = document.getElementById('testimonial-quote');
  var tName = document.getElementById('testimonial-name');
  var tRole = document.getElementById('testimonial-role');
  var tAvatar = document.getElementById('testimonial-avatar');
  var tCurrent = document.getElementById('testimonial-current');
  var tTotal = document.getElementById('testimonial-total');
  var tPrev = document.getElementById('testimonial-prev');
  var tNext = document.getElementById('testimonial-next');
  var tIndex = 0;
  var tBusy = false;

  function renderTestimonial(i) {
    var t = testimonials[i];
    tQuote.textContent = t.quote;
    tName.textContent = t.name;
    tRole.textContent = t.role;
    tAvatar.textContent = t.name.charAt(0).toUpperCase();
    tCurrent.textContent = pad(i + 1, 2);
  }

  function goToTestimonial(i) {
    if (tBusy) return;
    tBusy = true;
    tIndex = (i + testimonials.length) % testimonials.length;
    tSwap.classList.add('is-changing');
    setTimeout(function () {
      renderTestimonial(tIndex);
      tSwap.classList.remove('is-changing');
      tBusy = false;
    }, prefersReducedMotion ? 0 : 250);
  }

  if (tSwap && tPrev && tNext) {
    tTotal.textContent = pad(testimonials.length, 2);
    renderTestimonial(0);
    tPrev.addEventListener('click', function () { goToTestimonial(tIndex - 1); });
    tNext.addEventListener('click', function () { goToTestimonial(tIndex + 1); });
  }

  /* ---------- 7. Header shadow + hero parallax ---------- */
  var header = document.getElementById('site-header');
  var sideLabel = document.getElementById('hero-side-label');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 10);
    if (sideLabel && !prefersReducedMotion) {
      sideLabel.style.transform = 'translateY(' + (y * 0.12) + 'px)';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- 8. Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 9. Hero headline reveal ---------- */
  function startHero() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('hero-in'); });
    });
  }
  if (document.readyState === 'complete') { startHero(); }
  else { window.addEventListener('load', startHero); setTimeout(startHero, 1200); }

  /* ---------- 10. Magnetic buttons ---------- */
  if (canHover && !prefersReducedMotion) {
    document.querySelectorAll('.button-primary, .button-light, .circle-arrow, .theme-toggle').forEach(function (el) {
      var strength = 0.25;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * strength;
        var y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.translate = x + 'px ' + y + 'px';
      });
      el.addEventListener('mouseleave', function () {
        var from = el.style.translate || '0px 0px';
        el.style.translate = '';
        if (el.animate) {
          el.animate([{ translate: from }, { translate: '0px 0px' }], { duration: 350, easing: 'cubic-bezier(.2,.8,.2,1)' });
        }
      });
    });
  }

  /* ---------- 11. Page transitions ---------- */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) document.body.classList.remove('page-leaving');
  });

  if (!prefersReducedMotion) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;

      var url;
      try { url = new URL(a.href, window.location.href); } catch (err) { return; }
      if (url.protocol !== window.location.protocol || url.host !== window.location.host) return;
      if (url.pathname === window.location.pathname && url.hash) return; // in-page anchor

      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(function () { window.location.href = a.href; }, 260);
    });
  }

  /* ---------- 12. Contact form ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var statusEl = document.getElementById('form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var fallbackEmail = form.getAttribute('data-fallback-email') || 'hello@madebykirat.com';

    function setStatus(message, kind) {
      statusEl.textContent = message;
      statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      if (data.get('_gotcha')) return; // spam trap

      var action = form.getAttribute('action') || '';

      // No form service connected yet -> open the visitor's email app instead
      if (!action || action.indexOf('YOUR_FORM_ID') !== -1) {
        var body = [
          'Name: ' + data.get('name'),
          'Email: ' + data.get('email'),
          'Project type: ' + data.get('project_type'),
          'Budget: ' + data.get('budget'),
          '',
          data.get('message')
        ].join('\n');
        window.location.href = 'mailto:' + fallbackEmail +
          '?subject=' + encodeURIComponent('New project enquiry from ' + data.get('name')) +
          '&body=' + encodeURIComponent(body);
        setStatus('Opening your email app…', 'success');
        return;
      }

      submitBtn.disabled = true;
      setStatus('Sending…', '');

      fetch(action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          setStatus('Thanks — your message is in. I’ll get back to you soon.', 'success');
        })
        .catch(function () {
          setStatus('Something went wrong. Please email ' + fallbackEmail + ' directly.', 'error');
        })
        .then(function () { submitBtn.disabled = false; });
    });
  }
})();
