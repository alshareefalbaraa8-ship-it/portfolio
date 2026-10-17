/* ==========================================================
   السكربت الرئيسي: الشريط العلوي والتذييل، عرض الأعمال،
   صفحة تفاصيل العمل، حركة الظهور عند التمرير.
   ========================================================== */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const svg = (d) => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const ARROW_FWD = svg('<path d="M19 12H5M11 6l-6 6 6 6"/>');   // يشير لليسار = للأمام في العربية
  const ARROW_BACK = svg('<path d="M5 12h14M13 6l6 6-6 6"/>');

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  /* ---------- الشريط العلوي ---------- */
  function renderHeader() {
    const host = $('#site-header');
    if (!host) return;
    const links = SITE.nav.map((n) => {
      const active = n.match.includes(page);
      return '<li><a href="' + n.href + '"' + (active ? ' class="active" aria-current="page"' : '') + '>' + esc(n.label) + '</a></li>';
    }).join('');
    host.outerHTML =
      '<header class="site-header">' +
        '<div class="container header-inner">' +
          '<a class="brand" href="index.html" aria-label="الصفحة الرئيسية"><img src="' + esc(SITE.logo) + '" alt="' + esc(SITE.name) + '"></a>' +
          '<button class="nav-toggle" type="button" aria-label="القائمة" aria-expanded="false" aria-controls="main-nav"><span></span><span></span><span></span></button>' +
          '<nav class="main-nav" id="main-nav" aria-label="التنقل الرئيسي"><ul class="nav-list">' + links + '</ul></nav>' +
        '</div>' +
      '</header>';

    const header = $('.site-header');
    const toggle = $('.nav-toggle', header);
    const nav = $('.main-nav', header);
    // الشريط يختفي عند النزول للأسفل ويعود فور الصعود للأعلى قليلًا
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      header.classList.toggle('scrolled', y > 30);
      const menuOpen = nav.classList.contains('open');
      if (y < 120 || menuOpen) header.classList.remove('hidden');
      else if (y > lastY + 6) header.classList.add('hidden');      // نزول
      else if (y < lastY - 6) header.classList.remove('hidden');   // صعود
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const setOpen = (open) => { nav.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- التذييل ---------- */
  function renderFooter() {
    const host = $('#site-footer');
    if (!host) return;
    host.outerHTML =
      '<footer class="site-footer"><div class="container footer-inner">' +
        '<a href="index.html" aria-label="الصفحة الرئيسية"><img src="' + esc(SITE.logo) + '" alt="' + esc(SITE.name) + '"></a>' +
        '<span>© ' + new Date().getFullYear() + ' ' + esc(SITE.name) + ' — جميع الحقوق محفوظة</span>' +
      '</div></footer>';
  }

  /* ---------- بطاقات الأعمال ---------- */
  function cardHTML(p, i) {
    return '<a class="card reveal" style="--d:' + (i * 120) + 'ms" href="project.html?id=' + encodeURIComponent(p.id) + '">' +
      '<div class="card-media"><img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" loading="lazy">' +
      '<span class="card-cta">عرض المشروع ' + ARROW_FWD + '</span></div>' +
      '<h3>' + esc(p.title) + '</h3><p>' + esc(p.short) + '</p></a>';
  }
  function renderCards() {
    $$('[data-render="featured"]').forEach((el) => {
      el.innerHTML = PROJECTS.slice(0, SITE.featuredCount).map(cardHTML).join('');
    });
    $$('[data-render="works"]').forEach((el) => {
      el.innerHTML = PROJECTS.map(cardHTML).join('');
    });
  }

  /* ---------- صفحة تفاصيل العمل ---------- */
  function renderProject() {
    const root = $('#project-root');
    if (!root) return;
    const id = new URLSearchParams(location.search).get('id');
    const n = PROJECTS.length;
    const idx = PROJECTS.findIndex((p) => p.id === id);

    if (idx < 0) {
      document.title = 'العمل غير موجود | ' + SITE.name;
      root.innerHTML = '<section class="notfound container"><h1>لم نجد هذا العمل</h1><p>قد يكون الرابط غير صحيح أو أن العمل حُذف.</p>' +
        '<a class="btn btn-burgundy" data-arrow href="works.html">العودة إلى أعمالي</a></section>';
      return;
    }

    const p = PROJECTS[idx];
    document.title = p.title + ' | ' + SITE.name;

    const slides = p.images.map((src, i) =>
      '<div class="slide"><img src="' + esc(src) + '" alt="' + esc(p.title) + ' — صورة ' + (i + 1) + '"></div>').join('');
    const paras = String(p.description || '').split('\n').filter(Boolean).map((t) => '<p>' + esc(t) + '</p>').join('');
    const meta = (p.details || []).map((d) => '<div><dt>' + esc(d.label) + '</dt><dd>' + esc(d.value) + '</dd></div>').join('');
    const visit = p.link ? '<a class="btn btn-burgundy" data-arrow href="' + esc(p.link) + '" target="_blank" rel="noopener">زيارة الموقع</a>' : '';

    let pager = '';
    if (n > 1) {
      const prev = PROJECTS[(idx - 1 + n) % n], next = PROJECTS[(idx + 1) % n];
      pager =
        '<section class="pager"><div class="container pager-inner">' +
          '<a class="pager-link" href="project.html?id=' + encodeURIComponent(prev.id) + '"><span class="pager-label">' + ARROW_BACK + ' المشروع السابق</span><strong>' + esc(prev.title) + '</strong></a>' +
          '<a class="pager-link next" href="project.html?id=' + encodeURIComponent(next.id) + '"><span class="pager-label">المشروع التالي ' + ARROW_FWD + '</span><strong>' + esc(next.title) + '</strong></a>' +
        '</div></section>';
    }

    root.innerHTML =
      '<section class="page-hero has-deco"><img class="deco deco-letters tl" data-parallax="0.05" src="assets/images/deco/letters.png" alt="" aria-hidden="true"><div class="container">' +
        '<a class="crumbs" href="works.html">أعمالي</a><h1>' + esc(p.title) + '</h1><p>' + esc(p.short) + '</p>' +
      '</div></section>' +
      '<section class="section section-light has-deco"><img class="deco deco-letters br" data-parallax="-0.05" src="assets/images/deco/letters.png" alt="" aria-hidden="true"><span class="deco deco-circle tl" data-parallax="-0.06" style="--d:240px" aria-hidden="true"></span><div class="container project-grid">' +
        '<div class="slider-wrap reveal"><div class="slider" data-interval="3000" data-controls="dots arrows counter" data-zoom title="اضغط لعرض الصورة كاملة">' + slides + '</div></div>' +
        '<div class="project-info reveal" style="--d:150ms"><h2>عن المشروع</h2>' + paras +
          (meta ? '<dl class="meta">' + meta + '</dl>' : '') + visit + '</div>' +
      '</div></section>' + pager;
  }

  /* ---------- ظهور العناصر عند التمرير ---------- */
  function setupReveal() {
    const els = $$('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- حركة عناصر الزينة مع التمرير ---------- */
  function setupParallax() {
    const els = $$('[data-parallax]');
    if (!els.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      els.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const c = r.top + r.height / 2 - vh / 2;
        el.style.setProperty('--py', (-c * parseFloat(el.dataset.parallax)).toFixed(1) + 'px');
      });
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- التشغيل ---------- */
  renderHeader();
  renderFooter();
  renderCards();
  renderProject();
  $$('.btn[data-arrow]').forEach((b) => b.insertAdjacentHTML('beforeend', ARROW_FWD));
  window.initSliders();
  window.initZoomImages();
  $$('[data-logo-flag]').forEach((el) => window.initFlagLogo(el, SITE.logo));
  setupReveal();
  setupParallax();
})();
