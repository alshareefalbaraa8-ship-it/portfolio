/* ==========================================================
   الشعار + لمعان يمرّ عليه من اليمين إلى اليسار (والتموّج كالعلم اختياري: WAVE)
   يُرسم الشعار على canvas شريحة بعد شريحة، وتُزاح كل شريحة رأسيًا
   بموجة جيبية يزداد مداها كلما ابتعدنا عن "السارية" (الجهة اليمنى).
   لتعديل الحركة غيّر الثوابت في قسم SETTINGS.
   ========================================================== */
(function () {
  'use strict';

  // ---------- SETTINGS ----------
  const WAVE = false;         // false = الشعار ثابت والضوء فقط يمرّ عليه · true = يتموّج كالعلم
  const STRIP = 2;            // عرض الشريحة بالبكسل (أصغر = أنعم وأثقل)
  const AMPLITUDE = 0.045;    // قوة التموّج (نسبة من عرض الشعار)
  const WAVE_SPEED = 2.8;     // سرعة الموجة
  const SHINE_EVERY = 5;      // كل كم ثانية يمرّ اللمعان
  const SHINE_DURATION = 1.6; // مدة مرور اللمعان بالثواني
  // ------------------------------

  function initFlagLogo(stage, src) {
    const canvas = stage.querySelector('canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const img = new Image();

    let W = 0, H = 0, dpr = 1, fit = null, raf = 0, running = false, inView = true;

    function layout() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      const iw = img.naturalWidth || 800, ih = img.naturalHeight || 400;
      const padX = W * 0.06, padY = H * 0.1;
      const s = Math.min((W - padX * 2) / iw, (H - padY * 2) / ih);
      fit = { iw, ih, dw: iw * s, dh: ih * s, x: (W - iw * s) / 2, y: (H - ih * s) / 2 };
      draw(performance.now());
    }

    function draw(now) {
      if (!fit) return;
      const t = reduce ? 0 : now / 1000;
      const { iw, ih, dw, dh, x, y } = fit;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);

      const n = WAVE ? Math.max(8, Math.ceil(dw / STRIP)) : 1;
      const stripW = dw / n;
      const overlap = WAVE ? 0.7 : 0;
      const srcStep = iw / n;
      const srcW = (stripW + overlap) * (iw / dw);
      const amp = Math.min(dw, H) * AMPLITUDE;
      const off = new Float32Array(n);

      if (!WAVE) ctx.drawImage(img, x, y, dw, dh);
      for (let i = 0; WAVE && i < n; i++) {
        const s = n > 1 ? 1 - i / (n - 1) : 0;                       // 0 عند السارية (يمين) → 1 عند الطرف الحر (يسار)
        const att = Math.pow(s, 0.9);
        const wave = Math.sin(s * 7.5 - t * WAVE_SPEED) + 0.35 * Math.sin(s * 16 - t * WAVE_SPEED * 1.6 + 1.3);
        off[i] = (reduce || !WAVE) ? 0 : amp * att * wave;
        ctx.drawImage(img, i * srcStep, 0, Math.min(srcW, iw - i * srcStep), ih,
          x + i * stripW, y + off[i], stripW + overlap, dh);
      }

      if (reduce) return;

      // ظلال وإضاءة خفيفة حسب ميل القماش
      ctx.globalCompositeOperation = 'source-atop';
      const norm = amp * 14 / n + 0.0001;
      for (let i = 1; WAVE && i < n; i++) {
        const sl = Math.max(-1, Math.min(1, (off[i - 1] - off[i]) / norm));
        ctx.fillStyle = sl > 0 ? 'rgba(255,255,255,' + (sl * 0.16) + ')' : 'rgba(0,0,0,' + (-sl * 0.3) + ')';
        ctx.fillRect(x + i * stripW, 0, stripW + overlap, H);
      }

      // اللمعان: يعبر من اليمين إلى اليسار ثم يسكن قليلًا
      const ph = (t % SHINE_EVERY) / SHINE_DURATION;
      if (ph < 1) {
        const e = ph < 0.5 ? 2 * ph * ph : 1 - Math.pow(-2 * ph + 2, 2) / 2;
        const bw = dw * 0.32;
        const cx = x + dw + bw * 0.6 - e * (dw + bw * 1.2);
        const g = ctx.createLinearGradient(cx + bw / 2, y, cx - bw / 2, y + dh * 0.35);
        g.addColorStop(0, 'rgba(255,250,235,0)');
        g.addColorStop(0.5, 'rgba(255,250,235,0.85)');
        g.addColorStop(1, 'rgba(255,250,235,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    function loop(now) {
      if (!running) return;
      draw(now);
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (reduce || running || !inView || document.hidden || !fit) return;
      running = true; raf = requestAnimationFrame(loop);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }

    img.onload = function () { layout(); start(); };
    img.onerror = function () { stage.classList.add('no-logo'); };
    img.src = src;

    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(canvas);
    else window.addEventListener('resize', layout);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; inView ? start() : stop(); }).observe(stage);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  }

  window.initFlagLogo = initFlagLogo;
})();
