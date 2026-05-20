/* =============================================================================
   SPRING VALLEY DENTAL — core.js
   Nav scroll-hide · mobile drawer · FAQ accordion · live hours ·
   scroll reveal · stats counter · Saturday tooltip
   S3/CloudFront static · no external dependencies
   ============================================================================= */
(function () {
  'use strict';

  /* ── HOURS CONFIG ───────────────────────────────────────────────────────── */
  var HOURS = {
    0: { label: 'Sunday',    open: null,  close: null  }, // closed
    1: { label: 'Monday',    open: 600,   close: 1140  }, // 10am–7pm
    2: { label: 'Tuesday',   open: 510,   close: 960   }, // 8:30am–4pm
    3: { label: 'Wednesday', open: 600,   close: 1140  }, // 10am–7pm
    4: { label: 'Thursday',  open: null,  close: null  }, // closed
    5: { label: 'Friday',    open: 480,   close: 900   }, // 8am–3pm
    6: { label: 'Saturday',  open: null,  close: null,
         note: 'First Saturday of each month by appointment only. Call (972) 852-2222 to schedule.' }
  };

  function isOpen(day) {
    var h = HOURS[day];
    if (!h || h.open === null) return false;
    var now = new Date();
    var tm  = now.getHours() * 60 + now.getMinutes();
    return tm >= h.open && tm < h.close;
  }

  /* ── SCROLL-AWARE NAV ───────────────────────────────────────────────────── */
  function initNav() {
    var nav     = document.getElementById('site-nav');
    if (!nav) return;
    var lastY   = window.scrollY;
    var ticking = false;

    function tick() {
      var y = window.scrollY;
      if (y > lastY && y > 80) {
        nav.classList.add('nav-hidden');
      } else {
        nav.classList.remove('nav-hidden');
      }
      nav.classList.toggle('nav-scrolled', y > 30);
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(tick); ticking = true; }
    }, { passive: true });
  }

  /* ── MOBILE DRAWER ──────────────────────────────────────────────────────── */
  function initDrawer() {
    var burger  = document.getElementById('hamburger');
    var drawer  = document.getElementById('mobile-drawer');
    var overlay = document.getElementById('drawer-overlay');
    var closeBtn = document.getElementById('drawer-close');
    if (!burger || !drawer || !overlay) return;

    function open() {
      drawer.hidden = false;
      requestAnimationFrame(function () {
        drawer.classList.add('open');
        overlay.classList.add('open');
      });
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 50);
    }

    function close() {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      setTimeout(function () { drawer.hidden = true; }, 320);
      burger.focus();
    }

    burger.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) close();
    });

    // close on nav link click
    drawer.querySelectorAll('.drawer-nav-link, .drawer-quick-btn').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  /* ── FAQ ACCORDION ──────────────────────────────────────────────────────── */

  /* ── FOCUS TRAP inside mobile drawer (WCAG 2.1 SC 2.1.2) ────────────── */
  function trapFocus(drawer) {
    var focusable = drawer.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    drawer.addEventListener('keydown', function(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });
  }

  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var btn    = item.querySelector('.faq-btn');
      var answer = item.querySelector('.faq-answer');
      if (!btn || !answer) return;

      
        /* A2: aria-labelledby for answer regions */
        var btnId = 'faq-btn-' + Math.random().toString(36).slice(2,7);
        btn.setAttribute('id', btnId);
        answer.setAttribute('aria-labelledby', btnId);
btn.addEventListener('click', function () {
        var isExpanded = btn.getAttribute('aria-expanded') === 'true';

        // close all others in same list
        var list = item.closest('.faq-list');
        if (list) {
          list.querySelectorAll('.faq-item.open').forEach(function (openItem) {
            if (openItem !== item) {
              var ob  = openItem.querySelector('.faq-btn');
              var oa  = openItem.querySelector('.faq-answer');
              if (ob) ob.setAttribute('aria-expanded', 'false');
              if (oa) { oa.style.maxHeight = '0'; oa.classList.remove('open'); }
              openItem.classList.remove('open');
            }
          });
        }

        if (isExpanded) {
          btn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = '0';
          answer.classList.remove('open');
          item.classList.remove('open');
        } else {
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          answer.classList.add('open');
          item.classList.add('open');
        }
      });
    });
  }

  /* ── LIVE HOURS HIGHLIGHT ───────────────────────────────────────────────── */
  function applyHours(containerId, rowSel, daySel) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var today = new Date().getDay();
    var open  = isOpen(today);

    container.querySelectorAll(rowSel).forEach(function (row) {
      var d = parseInt(row.getAttribute('data-day'), 10);
      if (d !== today) return;
      row.classList.add('today');
      var dayEl = row.querySelector(daySel);
      if (!dayEl) return;

      var pill = document.createElement('span');
      pill.className = open ? 'live-pill' : 'live-pill closed';
      pill.textContent = open ? 'Open now' : 'Closed';
      pill.setAttribute('aria-label', open ? 'Currently open' : 'Currently closed');
      dayEl.appendChild(pill);
    });
  }

  function initHours() {
    applyHours('loc-hours',    '.hr-row', '.hday');
    applyHours('footer-hours', '.fhr',    '.fhd');
    applyHours('drawer-hours', '.dhr',    '.dd');
    // Saturday tooltip trigger for keyboard
    document.querySelectorAll('.sat-info').forEach(function (el) {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', 'Saturday hours details');
    });
  }

  /* ── SCROLL REVEAL ──────────────────────────────────────────────────────── */
  function initReveal() {
    if (!window.IntersectionObserver) {
      // fallback — show everything
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('in');
      });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ── STATS COUNTER ──────────────────────────────────────────────────────── */
  function countUp(el, target, duration) {
    var start = 0;
    var step  = Math.ceil(target / (duration / 30));
    var timer = setInterval(function () {
      start = Math.min(start + step, target);
      el.textContent = start;
      if (start >= target) clearInterval(timer);
    }, 30);
  }

  function initCounters() {
    if (!window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el     = e.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (!isNaN(target)) countUp(el, target, 800);
        // stats bar accent lines
        var sb = el.closest('.sb');
        if (sb) sb.classList.add('in');
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(function (el) {
      obs.observe(el);
    });
    // also trigger sb accent for non-counter stats
    document.querySelectorAll('.sb').forEach(function (sb) {
      obs.observe(sb);
    });
  }

  /* ── GALLERY FILTER ─────────────────────────────────────────────────────── */
  function initGalleryFilter() {
    var btns  = document.querySelectorAll('.gf-btn');
    var items = document.querySelectorAll('.gallery-item');
    if (!btns.length) return;

    btns.forEach(function (btn) {
      
        /* A2: aria-labelledby for answer regions */
        var btnId = 'faq-btn-' + Math.random().toString(36).slice(2,7);
        btn.setAttribute('id', btnId);
        answer.setAttribute('aria-labelledby', btnId);
btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        items.forEach(function (item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  /* ── FOOTER YEAR ────────────────────────────────────────────────────────── */

  /* ── LAZY GOOGLE MAPS ────────────────────────────────────────────────── */
  function initLazyMaps() {
    if (!window.IntersectionObserver) {
      document.querySelectorAll('iframe[data-src]').forEach(function(iframe) {
        iframe.src = iframe.getAttribute('data-src');
      });
      return;
    }
    document.querySelectorAll('iframe[data-src]').forEach(function(iframe) {
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            iframe.src = iframe.getAttribute('data-src');
            obs.unobserve(iframe);
          }
        });
      }, { rootMargin: '300px' });
      obs.observe(iframe);
    });
  }


  /* ── GALLERY FILTER ARIA-PRESSED ─────────────────────────────────────── */
  function initGalleryAria() {
    document.querySelectorAll('.gf-btn').forEach(function(btn) {
      if (!btn.hasAttribute('aria-pressed')) {
        btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
      }
      btn.addEventListener('click', function() {
        document.querySelectorAll('.gf-btn').forEach(function(b) {
          b.setAttribute('aria-pressed', 'false');
        });
        btn.setAttribute('aria-pressed', 'true');
      });
    });
  }


  /* ── STATS COUNTER — IntersectionObserver so it fires on scroll ─────── */
  function initStats() {
    var items = document.querySelectorAll('[data-count]');
    if (!items.length) return;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!window.IntersectionObserver || prefersReduced) {
      items.forEach(function(el) {
        el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
      });
      return;
    }
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el   = entry.target;
        var end  = parseInt(el.getAttribute('data-count'), 10);
        var suf  = el.getAttribute('data-suffix') || '';
        var dur  = 1400;
        var cur  = 0;
        var inc  = Math.ceil(end / (dur / 16));
        var timer = setInterval(function() {
          cur = Math.min(cur + inc, end);
          el.textContent = cur + suf;
          if (cur >= end) clearInterval(timer);
        }, 16);
        obs.unobserve(el);
      });
    }, { threshold: 0.3 });
    items.forEach(function(el) { obs.observe(el); });
  }

  function setYear() {
    var el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ── ARIA CURRENT PAGE ──────────────────────────────────────────────────── */
  function setCurrentPage() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .drawer-nav-link').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href === path || (path === '' && href === 'index.html')) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ── SMOOTH ANCHOR SCROLL ───────────────────────────────────────────────── */
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id  = a.getAttribute('href').slice(1);
        var el  = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
        var top  = el.getBoundingClientRect().top + window.scrollY - navH - 12;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }


  /* ── MORE DROPDOWN KEYBOARD HANDLER ────────────────────────────────────── */
  function initMoreDropdown() {
    var trigger = document.getElementById('nav-more-trigger');
    var menu    = document.getElementById('nav-more-menu');
    if (!trigger || !menu) return;

    function openMenu() {
      trigger.setAttribute('aria-expanded', 'true');
      menu.classList.add('open');
      // focus first item
      var first = menu.querySelector('a[role="menuitem"]');
      if (first) setTimeout(function() { first.focus(); }, 50);
    }

    function closeMenu() {
      trigger.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    }

    trigger.addEventListener('click', function(e) {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        trigger.focus();
      }
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!trigger.contains(e.target) && !menu.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on blur (tab away from last item)
    menu.addEventListener('keydown', function(e) {
      if (e.key !== 'Tab') return;
      var items = Array.from(menu.querySelectorAll('a[role="menuitem"]'));
      var last  = items[items.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        closeMenu();
      }
    });
  }

  /* ── INIT ───────────────────────────────────────────────────────────────── */
  function init() {
    initNav();
    initDrawer();
    initFAQ();
    initHours();
    initReveal();
    initCounters();
    initGalleryFilter();
    setYear();
    setCurrentPage();
    initGalleryAria();
    initLazyMaps();
    initAnchorScroll();
    initMoreDropdown();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
