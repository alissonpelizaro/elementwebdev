/* ═══════════════════════════════════════════════
   Element Web Development — main.js
   One rAF ticker, transform/opacity only, 60 fps.
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── single rAF ticker ───────────────────────── */
  var jobs = [];
  var running = false;
  function tick(t) {
    for (var i = 0; i < jobs.length; i++) jobs[i](t);
    requestAnimationFrame(tick);
  }
  function onFrame(fn) {
    jobs.push(fn);
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  /* ── pointer state (shared) ──────────────────── */
  var ptr = { x: innerWidth / 2, y: innerHeight / 2, has: false };
  window.addEventListener('pointermove', function (e) {
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.has = true;
  }, { passive: true });

  /* ── year ────────────────────────────────────── */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ── line wrapping for hero title reveal ─────── */
  function wrapLines() {
    $$('.split .line').forEach(function (l) {
      var txt = l.textContent;
      l.textContent = '';
      var s = document.createElement('span');
      s.className = 'line__i';
      s.textContent = txt;
      l.appendChild(s);
    });
  }
  wrapLines();

  /* ── i18n (PT ⇄ EN) ──────────────────────────── */
  var i18nNodes = $$('[data-en]');
  i18nNodes.forEach(function (n) { n.dataset.pt = n.textContent.trim(); });
  var lang = 'pt';
  var langBtn = $('#lang');
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      lang = lang === 'pt' ? 'en' : 'pt';
      i18nNodes.forEach(function (n) { n.textContent = lang === 'pt' ? n.dataset.pt : n.dataset.en; });
      wrapLines();
      document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
      $$('.lang__opt', langBtn).forEach(function (o, i) {
        o.classList.toggle('is-on', (lang === 'pt') === (i === 0));
      });
    });
  }

  /* ── custom cursor ───────────────────────────── */
  if (fine && !reduced) {
    document.body.classList.add('no-cursor');
    var cur = $('.cursor');
    var dot = $('.cursor__dot');
    var ring = $('.cursor__ring');
    var dx = ptr.x, dy = ptr.y, rx = ptr.x, ry = ptr.y;
    onFrame(function () {
      dx = lerp(dx, ptr.x, 0.55); dy = lerp(dy, ptr.y, 0.55);
      rx = lerp(rx, ptr.x, 0.16); ry = lerp(ry, ptr.y, 0.16);
      dot.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0) translate(-50%,-50%)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
    });
    document.addEventListener('pointerover', function (e) {
      var hot = e.target.closest('a,button,.card,.step,.values li,input,textarea');
      cur.classList.toggle('is-hot', !!hot);
    }, { passive: true });
  }

  /* ── scroll progress + nav state ─────────────── */
  var bar = $('.scrollbar span');
  var nav = $('#nav');
  var lastY = 0;

  /* ── reveal on enter ─────────────────────────── */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      var d = parseInt(el.dataset.delay || '0', 10);
      setTimeout(function () { el.classList.add('is-in'); }, d);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  $$('[data-reveal]').forEach(function (el) { io.observe(el); });

  /* ── nav active section ──────────────────────── */
  var links = $$('.nav__links a');
  var secs = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if (secs.length) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { navIo.observe(s); });
  }

  /* ── mobile menu ─────────────────────────────── */
  var burger = $('#burger');
  var menu = $('.nav__links');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── magnetic buttons ────────────────────────── */
  if (fine && !reduced) {
    $$('.magnetic').forEach(function (el) {
      var tx = 0, ty = 0, cx = 0, cy = 0, active = false;
      el.addEventListener('pointerenter', function () { active = true; });
      el.addEventListener('pointerleave', function () { active = false; tx = 0; ty = 0; });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        ty = (e.clientY - (r.top + r.height / 2)) * 0.42;
      });
      onFrame(function () {
        if (!active && Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05) return;
        cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
        el.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
      });
    });
  }

  /* ── 3D tilt + card spotlight ────────────────── */
  if (fine && !reduced) {
    $$('.tilt').forEach(function (el) {
      var max = parseFloat(el.dataset.tiltMax || '11');
      var trx = 0, try_ = 0, crx = 0, cry = 0, live = false;
      el.addEventListener('pointerenter', function () { live = true; });
      el.addEventListener('pointerleave', function () { live = false; trx = 0; try_ = 0; });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        trx = (0.5 - py) * max * 2;
        try_ = (px - 0.5) * max * 2;
        el.style.setProperty('--cx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--cy', (py * 100).toFixed(1) + '%');
      });
      onFrame(function () {
        if (!live && Math.abs(crx) < 0.02 && Math.abs(cry) < 0.02) return;
        crx = lerp(crx, trx, 0.12); cry = lerp(cry, try_, 0.12);
        el.style.transform = 'perspective(900px) rotateX(' + crx.toFixed(2) + 'deg) rotateY(' + cry.toFixed(2) + 'deg)';
      });
    });

    /* hero element tile follows the pointer across the whole hero */
    var tile = $('.hero .tile3d');
    var hero = $('.hero');
    if (tile && hero) {
      var hrx = 0, hry = 0, htx = 0, hty = 0;
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        htx = ((e.clientX - r.left) / r.width - 0.5) * 26;
        hty = ((e.clientY - r.top) / r.height - 0.5) * -18;
      });
      hero.addEventListener('pointerleave', function () { htx = 0; hty = 0; });
      onFrame(function () {
        hrx = lerp(hrx, hty, 0.07); hry = lerp(hry, htx, 0.07);
        tile.style.transform = 'rotateX(' + hrx.toFixed(2) + 'deg) rotateY(' + hry.toFixed(2) + 'deg)';
      });
    }
  }

  /* ── section spotlight ───────────────────────── */
  $$('.spotlight').forEach(function (sec) {
    sec.addEventListener('pointermove', function (e) {
      var r = sec.getBoundingClientRect();
      sec.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      sec.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  });

  /* ── counters ────────────────────────────────── */
  $$('[data-count]').forEach(function (el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var cIo = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      cIo.disconnect();
      var t0 = null, dur = 1400;
      (function step(t) {
        if (t0 === null) t0 = t;
        var p = clamp((t - t0) / dur, 0, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }, { threshold: 0.5 });
    cIo.observe(el);
  });

  /* ── marquee: duplicate for a seamless loop ──── */
  var row = $('#marqueeRow');
  if (row) row.innerHTML += row.innerHTML;

  /* ── scroll-driven work (one handler) ────────── */
  var cases = $$('.case');
  var processSec = $('.sec--process');
  var pin = $('#pin');
  var trackInner = $('#trackInner');
  var track = $('#track');
  var trackBar = $('#trackBar');
  var steps = $$('.step');
  var ghost = $('#pinGhost');
  var counter = $('#pinCounter');
  var stickyTop = 88;
  var wide = window.innerWidth > 860;
  var travel = 0;
  var ghostSpan = 0;

  /* The pin must last exactly as long as the horizontal travel it drives.
     A fixed height leaves the visitor scrolling through dead space with
     nothing moving. */
  function sizePin() {
    if (!pin || !trackInner || !track) return;
    if (!wide || reduced) { pin.style.height = ''; return; }
    travel = Math.max(0, trackInner.scrollWidth - track.clientWidth);
    pin.style.height = Math.round(window.innerHeight + travel * 0.8) + 'px';
    ghostSpan = ghost ? Math.max(0, window.innerWidth - ghost.offsetWidth) : 0;
  }

  function onScroll() {
    var sy = window.scrollY || document.documentElement.scrollTop;
    var vh = window.innerHeight;

    /* progress bar */
    var max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.width = (max > 0 ? (sy / max) * 100 : 0) + '%';

    /* nav */
    if (nav) {
      nav.classList.toggle('is-stuck', sy > 24);
      nav.classList.toggle('is-hidden', sy > 420 && sy > lastY && !menu.classList.contains('is-open'));
    }
    lastY = sy;

    /* stacked cases: every card recedes as the next one covers it — the
       last one is covered by the process section instead */
    if (wide && !reduced) {
      for (var i = 0; i < cases.length; i++) {
        var inner = cases[i].firstElementChild;
        var cover = i + 1 < cases.length ? cases[i + 1] : processSec;
        if (!cover) continue;
        var p = clamp(1 - (cover.getBoundingClientRect().top - stickyTop) / (vh * 0.85), 0, 1);
        inner.style.transform = 'scale(' + (1 - p * 0.08).toFixed(4) + ') translate3d(0,' + (-p * 26).toFixed(2) + 'px,0)';
        inner.style.opacity = (1 - p * 0.5).toFixed(3);
      }
    }

    /* pinned horizontal process track */
    if (wide && !reduced && pin && trackInner && track) {
      var span = pin.offsetHeight - vh;
      var p2 = clamp((sy - pin.offsetTop) / (span || 1), 0, 1);
      trackInner.style.transform = 'translate3d(' + (-travel * p2).toFixed(2) + 'px,0,0)';
      if (trackBar) trackBar.style.width = (p2 * 100).toFixed(2) + '%';

      /* every step reacts to how close it is to the middle of the screen */
      var cx = window.innerWidth / 2, active = 0, bestD = Infinity;
      for (var s = 0; s < steps.length; s++) {
        var r = steps[s].getBoundingClientRect();
        var d = Math.abs(r.left + r.width / 2 - cx);
        var f = clamp(1 - d / (window.innerWidth * 0.58), 0, 1);
        var e = f * f * (3 - 2 * f);
        steps[s].style.setProperty('--f', e.toFixed(3));
        steps[s].style.transform = 'translate3d(0,' + ((1 - e) * 34).toFixed(2) + 'px,0) scale(' + (0.9 + e * 0.1).toFixed(4) + ')';
        steps[s].style.opacity = (0.28 + e * 0.72).toFixed(3);
        if (d < bestD) { bestD = d; active = s; }
      }

      var label = ('0' + (active + 1)).slice(-2);
      if (ghost) {
        if (ghost.textContent !== label) ghost.textContent = label;
        ghost.style.transform = 'translate3d(' + (p2 * ghostSpan).toFixed(1) + 'px,-50%,0)';
      }
      if (counter && counter.textContent !== label) counter.textContent = label;
    }
  }

  var queued = false;
  window.addEventListener('scroll', function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { onScroll(); queued = false; });
  }, { passive: true });

  window.addEventListener('resize', function () {
    wide = window.innerWidth > 860;
    if (!wide) {
      cases.forEach(function (c) { c.firstElementChild.style.transform = ''; c.firstElementChild.style.opacity = ''; });
      steps.forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; s.style.removeProperty('--f'); });
      if (trackInner) trackInner.style.transform = '';
    }
    sizePin();
    onScroll();
  });

  sizePin();
  onScroll();
  /* web fonts change the step widths, so the pin has to be measured again */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { sizePin(); onScroll(); });
  }

  /* ── contact form → mailto ───────────────────── */
  var form = $('#form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = $('#formNote');
      if (!form.checkValidity()) {
        note.classList.add('is-err');
        note.textContent = lang === 'pt' ? 'Preencha nome, e-mail e mensagem.' : 'Please fill in name, e-mail and message.';
        return;
      }
      var name = $('#f-name').value.trim();
      var mail = $('#f-mail').value.trim();
      var msg = $('#f-msg').value.trim();
      var subject = encodeURIComponent('[Site] Novo projeto — ' + name);
      var body = encodeURIComponent(name + ' <' + mail + '>\n\n' + msg + '\n\n— enviado por elementwebdev.com.br');
      window.location.href = 'mailto:contato@elementwebdev.com.br?subject=' + subject + '&body=' + body;
      note.classList.remove('is-err');
      note.classList.add('is-ok');
      note.textContent = lang === 'pt' ? 'Abrindo seu cliente de e-mail…' : 'Opening your e-mail client…';
    });
  }

  /* ══════════════════════════════════════════════
     Particle field — hero background
     ══════════════════════════════════════════════ */
  var cv = $('#particles');
  if (cv && !reduced) {
    var ctx = cv.getContext('2d', { alpha: true });
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [], visible = true;
    var LINK = 132, REPEL = 130;

    function size() {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      var n = clamp(Math.round((W * H) / 15000), 34, 110);
      parts = [];
      for (var i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.26,
          vy: (Math.random() - 0.5) * 0.26,
          r: Math.random() * 1.5 + 0.7,
          h: Math.random()
        });
      }
    }

    var vIo = new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 });
    vIo.observe(cv);

    onFrame(function () {
      if (!visible || !W) return;
      ctx.clearRect(0, 0, W, H);

      var rect = cv.getBoundingClientRect();
      var mx = ptr.x - rect.left, my = ptr.y - rect.top;
      var near = ptr.has && mx > -REPEL && mx < W + REPEL && my > -REPEL && my < H + REPEL;

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;

        if (near) {
          var dxm = p.x - mx, dym = p.y - my;
          var d2 = dxm * dxm + dym * dym;
          if (d2 < REPEL * REPEL && d2 > 0.5) {
            var d = Math.sqrt(d2);
            var f = (1 - d / REPEL) * 0.9;
            p.x += (dxm / d) * f * 2.4;
            p.y += (dym / d) * f * 2.4;
          }
        }

        if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = p.h > 0.66 ? 'rgba(255,92,240,.62)' : p.h > 0.33 ? 'rgba(124,92,255,.62)' : 'rgba(34,211,238,.62)';
        ctx.fill();
      }

      ctx.lineWidth = 1;
      for (var a = 0; a < parts.length; a++) {
        var pa = parts[a];
        for (var b = a + 1; b < parts.length; b++) {
          var pb = parts[b];
          var ddx = pa.x - pb.x, ddy = pa.y - pb.y;
          var dd = ddx * ddx + ddy * ddy;
          if (dd > LINK * LINK) continue;
          var alpha = (1 - Math.sqrt(dd) / LINK) * 0.26;
          ctx.strokeStyle = 'rgba(124,92,255,' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      }

      if (near) {
        var g = ctx.createRadialGradient(mx, my, 0, mx, my, REPEL);
        g.addColorStop(0, 'rgba(34,211,238,.10)');
        g.addColorStop(1, 'rgba(34,211,238,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mx, my, REPEL, 0, 6.2832);
        ctx.fill();
      }
    });

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 160); });
    size();
  }
})();
