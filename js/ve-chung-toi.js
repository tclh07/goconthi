/* FAQ toggle */
function toggleFaq(el){
  var item = el.closest('.faq-item');
  var wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(f){ f.classList.remove('open'); });
  if(!wasOpen) item.classList.add('open');
}

/* Copy to clipboard */
function copyText(btn,text){
  navigator.clipboard.writeText(text).then(function(){
    btn.classList.add('copied');
    btn.querySelector('i').className = 'bi bi-check-lg';
    setTimeout(function(){
      btn.classList.remove('copied');
      btn.querySelector('i').className = 'bi bi-copy';
    }, 1500);
  });
}

/* Animated counter */
function animateCounters(){
  var nums = document.querySelectorAll('.sc-num[data-target]');
  nums.forEach(function(el){
    if(el.dataset.animated) return;
    var rect = el.getBoundingClientRect();
    if(rect.top > window.innerHeight || rect.bottom < 0) return;
    el.dataset.animated = '1';
    var target = parseInt(el.dataset.target);
    var suffix = el.dataset.suffix || '';
    var duration = 1200;
    var start = performance.now();
    function step(now){
      var progress = Math.min((now - start) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(ease * target);
      el.textContent = current.toLocaleString('vi-VN') + suffix;
      if(progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* Scroll top button visibility */
function handleScrollTop(){
  var btn = document.getElementById('scrollTopBtn');
  if(!btn) return;
  if(window.scrollY > 400){
    btn.classList.add('show');
  } else {
    btn.classList.remove('show');
  }
}

window.addEventListener('scroll', function(){
  animateCounters();
  handleScrollTop();
});
window.addEventListener('load', function(){
  animateCounters();
});
</script>
