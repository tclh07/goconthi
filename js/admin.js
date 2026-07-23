/* ============================================================
   GócÔnThi — app.js
   Core: animation reveal + toast notification
   ============================================================ */

/* ---------- Toast notification ---------- */
window.hlToast = function (msg, icon) {
  var exist = document.querySelector('.hl-toast');
  if (exist) exist.remove();
  var t = document.createElement('div');
  t.className = 'hl-toast';
  t.innerHTML = '<i class="bi ' + (icon || 'bi-check-circle-fill') + '"></i> ' + msg;
  document.body.appendChild(t);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { t.classList.add('show'); });
  });
  setTimeout(function () {
    t.classList.remove('show');
    setTimeout(function () { t.remove(); }, 350);
  }, 2500);
};

/* ---------- Hiệu ứng xuất hiện khi cuộn (.reveal) ---------- */
window.setupReveal = function () {
  var els = document.querySelectorAll('.reveal:not(.show)');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    /* Fallback: hiện tất cả nếu trình duyệt cũ */
    els.forEach(function (el) { el.classList.add('show'); });
    return;
  }
  document.body.classList.add('reveal-ready');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e, i) {
      if (e.isIntersecting) {
        setTimeout(function () { e.target.classList.add('show'); }, (i % 4) * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '50px' });
  els.forEach(function (el) { io.observe(el); });
};

(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupReveal);
  } else {
    setupReveal();
  }
})();
