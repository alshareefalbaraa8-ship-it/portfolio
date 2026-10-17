/* ==========================================================
   معرض الصور المتبدل
   الاستخدام في HTML:
   <div class="slider" data-interval="3000" data-controls="dots arrows counter" data-clickable>
     <div class="slide"><img src="..." alt=""></div> ...
   </div>
   data-controls: dots (نقاط) · arrows (أسهم) · counter (عدّاد)
   data-clickable: الضغط على الصورة ينقل للتالية
   ========================================================== */
(function () {
  'use strict';

  const ICON_NEXT = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  const ICON_PREV = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

  class Slider {
    constructor(root) {
      this.root = root;
      this.slides = Array.from(root.querySelectorAll('.slide'));
      if (!this.slides.length) return;
      this.interval = Number(root.dataset.interval) || 3000;
      this.controls = (root.dataset.controls || 'dots').split(/\s+/);
      this.index = 0;
      this.timer = null;
      this.inView = true;
      root.style.setProperty('--interval', this.interval + 'ms');
      root.dataset.ready = '1';

      this.build();
      this.bind();
      this.go(0);
      this.play();
    }

    build() {
      const r = this.root;
      if (this.controls.includes('dots') && this.slides.length > 1) {
        this.dotsEl = document.createElement('div');
        this.dotsEl.className = 'slider-dots';
        this.dots = this.slides.map((_, i) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', 'الصورة ' + (i + 1));
          b.addEventListener('click', (e) => { e.stopPropagation(); this.go(i); this.play(); });
          this.dotsEl.appendChild(b);
          return b;
        });
        r.appendChild(this.dotsEl);
      }
      if (this.controls.includes('arrows') && this.slides.length > 1) {
        const mk = (cls, label, icon, fn) => {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'slider-arrow ' + cls;
          b.setAttribute('aria-label', label); b.innerHTML = icon;
          b.addEventListener('click', (e) => { e.stopPropagation(); fn(); this.play(); });
          r.appendChild(b);
        };
        mk('prev', 'الصورة السابقة', ICON_PREV, () => this.prev());
        mk('next', 'الصورة التالية', ICON_NEXT, () => this.next());
        r.tabIndex = 0;
      }
      if (this.controls.includes('counter')) {
        this.counterEl = document.createElement('div');
        this.counterEl.className = 'slider-counter';
        r.appendChild(this.counterEl);
      }
    }

    bind() {
      const r = this.root;
      if (r.hasAttribute('data-clickable')) {
        r.addEventListener('click', () => { this.next(); this.play(); });
      }
      // الضغط على الصورة يفتحها كاملة بنسبتها الأصلية (data-zoom)
      if (r.hasAttribute('data-zoom')) {
        r.addEventListener('click', () => this.zoom());
      }
      // لوحة المفاتيح (في الواجهة العربية: السهم الأيسر = التالي)
      r.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && r.hasAttribute('data-zoom') && e.target === r) { this.zoom(); return; }
        if (e.key === 'ArrowLeft') { this.next(); this.play(); }
        if (e.key === 'ArrowRight') { this.prev(); this.play(); }
      });
      // السحب باللمس
      let startX = null;
      r.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
      r.addEventListener('touchend', (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(dx) < 40) return;
        dx > 0 ? this.next() : this.prev();
        this.play();
      }, { passive: true });
      // لا نبدّل الصور إذا كانت خارج الشاشة أو التبويب مخفي
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((es) => { this.inView = es[0].isIntersecting; }).observe(r);
      }
    }

    go(i) {
      const n = this.slides.length;
      this.index = (i + n) % n;
      this.slides.forEach((s, k) => s.classList.toggle('active', k === this.index));
      if (this.dots) {
        this.dots.forEach((d) => d.classList.remove('active'));
        void this.dotsEl.offsetWidth;            // إعادة تشغيل حركة شريط التقدّم
        this.dots[this.index].classList.add('active');
      }
      if (this.counterEl) {
        const f = (x) => x.toLocaleString('ar-EG');
        this.counterEl.textContent = f(this.index + 1) + ' / ' + f(n);
      }
    }
    next() { this.go(this.index + 1); }
    prev() { this.go(this.index - 1); }

    // فتح الصورة الحالية كاملة؛ يتوقف التبديل التلقائي أثناء العرض
    zoom() {
      if (!window.Lightbox) return;
      const list = this.slides.map((s) => {
        const im = s.querySelector('img');
        return im ? { src: im.currentSrc || im.src, alt: im.alt } : null;
      }).filter(Boolean);
      this.paused = true;
      window.Lightbox.open(list, this.index, (i) => {
        this.paused = false;
        this.go(i);
        this.play();
      });
    }

    play() {
      clearInterval(this.timer);
      if (this.slides.length < 2) return;
      this.timer = setInterval(() => {
        if (document.hidden || !this.inView || this.paused) return;
        this.next();
      }, this.interval);
    }
  }

  window.Slider = Slider;
  window.initSliders = function (scope) {
    (scope || document).querySelectorAll('.slider:not([data-ready])').forEach((el) => new Slider(el));
  };
})();
