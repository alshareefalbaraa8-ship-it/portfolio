/* ==========================================================
   عرض الصورة كاملة (Lightbox)
   - على أي معرض صور أضف  data-zoom  فيفتح الضغط على الصورة نافذة العرض الكامل.
   - على أي صورة مفردة أضف  data-zoom  على وسم <img> نفسه.
   الصورة تُعرض بنسبتها الأصلية دون قص مهما كان شكلها (مستطيلة، طويلة، مربعة).
   الإغلاق: زر ×، أو الضغط خارج الصورة، أو مفتاح Esc.
   التنقل بين الصور: الأسهم، أو مفاتيح الأسهم، أو السحب على الهاتف.
   ========================================================== */
(function () {
  'use strict';

  const ICON_NEXT = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  const ICON_PREV = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  const ICON_CLOSE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  let root, imgEl, counterEl, prevBtn, nextBtn, closeBtn;
  let items = [], index = 0, onClose = null, lastFocus = null, isOpen = false;

  function build() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'lightbox';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'عرض الصورة كاملة');
    root.hidden = true;
    root.innerHTML =
      '<button class="lb-btn lb-close" type="button" aria-label="إغلاق">' + ICON_CLOSE + '</button>' +
      '<button class="lb-btn lb-nav lb-prev" type="button" aria-label="الصورة السابقة">' + ICON_PREV + '</button>' +
      '<button class="lb-btn lb-nav lb-next" type="button" aria-label="الصورة التالية">' + ICON_NEXT + '</button>' +
      '<figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-counter"></figcaption></figure>';
    document.body.appendChild(root);

    imgEl = root.querySelector('.lb-img');
    counterEl = root.querySelector('.lb-counter');
    prevBtn = root.querySelector('.lb-prev');
    nextBtn = root.querySelector('.lb-next');
    closeBtn = root.querySelector('.lb-close');

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); show(index - 1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); show(index + 1); });
    // الضغط على الخلفية (خارج الصورة) يغلق
    root.addEventListener('click', (e) => { if (e.target === root || e.target.classList.contains('lb-figure')) close(); });

    document.addEventListener('keydown', (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(index + 1);    // في الواجهة العربية: اليسار = التالي
      else if (e.key === 'ArrowRight') show(index - 1);
      else if (e.key === 'Tab') {                         // إبقاء التركيز داخل النافذة
        const f = Array.from(root.querySelectorAll('button:not([hidden])'));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    let startX = null;
    root.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (startX === null || items.length < 2) return;
      const dx = e.changedTouches[0].clientX - startX; startX = null;
      if (Math.abs(dx) > 50) show(index + (dx > 0 ? 1 : -1));
    }, { passive: true });
  }

  function show(i) {
    const n = items.length;
    index = (i + n) % n;
    const it = items[index];
    imgEl.classList.remove('in');
    imgEl.src = it.src;
    imgEl.alt = it.alt || '';
    const reveal = () => imgEl.classList.add('in');
    if (imgEl.complete) requestAnimationFrame(reveal); else imgEl.onload = reveal;
    const multi = n > 1;
    prevBtn.hidden = nextBtn.hidden = counterEl.hidden = !multi;
    if (multi) counterEl.textContent = (index + 1).toLocaleString('ar-EG') + ' / ' + n.toLocaleString('ar-EG');
  }

  function open(list, start, closeCb) {
    if (!list || !list.length) return;
    build();
    items = list; onClose = closeCb || null;
    lastFocus = document.activeElement;
    isOpen = true;
    root.hidden = false;
    document.documentElement.classList.add('lb-lock');
    show(start || 0);
    requestAnimationFrame(() => root.classList.add('open'));
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    root.classList.remove('open');
    document.documentElement.classList.remove('lb-lock');
    setTimeout(() => { if (!isOpen) { root.hidden = true; imgEl.removeAttribute('src'); } }, 350);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    if (onClose) onClose(index);
  }

  window.Lightbox = { open, close };

  // صورة مفردة: <img data-zoom src="...">
  window.initZoomImages = function (scope) {
    (scope || document).querySelectorAll('img[data-zoom]:not([data-zoom-ready])').forEach((img) => {
      img.dataset.zoomReady = '1';
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      const go = () => open([{ src: img.currentSrc || img.src, alt: img.alt }], 0);
      img.addEventListener('click', go);
      img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  };
})();
