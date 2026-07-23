/* ============================================================
   GócÔnThi — index.js (Supabase version)
   Trang chủ: countdown, countUp, subjects, featured docs
   ============================================================ */

/* -- Countdown -- */
(function initCountdown(){
  var examDate = new Date('2027-06-26T07:00:00+07:00');
  function update(){
    var now  = new Date();
    var diff = examDate - now;
    if(diff <= 0){
      var strip = document.getElementById('countdownStrip');
      if(strip) strip.innerHTML = '<span style="color:var(--teal);font-weight:700;font-size:.9rem"><i class="bi bi-check-circle-fill me-1"></i>Kỳ thi đã diễn ra!</span>';
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    var el = function(id){ return document.getElementById(id); };
    if(el('cdDays'))  el('cdDays').textContent  = d;
    if(el('cdHours')) el('cdHours').textContent = String(h).padStart(2,'0');
    if(el('cdMins'))  el('cdMins').textContent  = String(m).padStart(2,'0');
    if(el('cdSecs'))  el('cdSecs').textContent  = String(s).padStart(2,'0');
  }
  update();
  setInterval(update, 1000);
})();

/* -- CountUp Animation cho stats bar -- */
(function initCountUp(){
  var animated = false;
  var targets = document.querySelectorAll('.stat-v3 .sn[data-target]');

  function animateNumbers(){
    if(animated) return;
    animated = true;
    targets.forEach(function(el){
      var target   = parseInt(el.getAttribute('data-target'));
      var suffix   = el.getAttribute('data-suffix') || '';
      var duration = 2000;
      var startTime = null;

      function easeOutQuart(t){ return 1 - Math.pow(1 - t, 4); }

      function step(timestamp){
        if(!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = easeOutQuart(progress);
        var current = Math.round(eased * target);
        var formatted = current.toLocaleString('vi-VN');
        el.textContent = formatted + suffix;
        if(progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  var statsBar = document.querySelector('.stats-bar');
  if(!statsBar){ animateNumbers(); return; }

  if('IntersectionObserver' in window){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateNumbers();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    observer.observe(statsBar);
  } else {
    animateNumbers();
  }
})();

/* -- Load subjects từ Supabase -- */
(async function loadSubjectGrid(){
  try {
    var subs = await DB.getSubjects();
    var grid = document.getElementById('subjectGrid');
    if(!grid) return;
    grid.innerHTML = subs.map(function(s){
      var g = s.gradient || ['#1E40AF','#F59E0B'];
      return '<a class="scard" href="kho-de-thi.html?mon='+s.id+'"'
        +' style="--c1:'+g[0]+';--c2:'+g[1]+'">'
        +'<div class="sc-ic" style="background:linear-gradient(135deg,'+g[0]+','+g[1]+')">'
        +'<i class="bi '+s.icon+'"></i></div>'
        +'<span class="sc-name">'+s.name+'</span>'
        +'<span class="sc-count">'+s.count+' đề</span>'
        +'</a>';
    }).join('');
  } catch(e){ console.warn('Load subjects:', e); }
})();

/* -- Load featured docs từ Supabase -- */
var allDocs = [];
(async function loadFeatured(){
  try {
    var docs = await DB.getDocs();
    allDocs = docs;
    window._allDocsData = docs;
    renderFeatured(docs);
  } catch(e){
    console.warn('Load documents:', e);
    showEmptyFeatured();
  }
})();

function showEmptyFeatured(){
  var grid = document.getElementById('featuredGrid');
  if(!grid) return;
  grid.innerHTML = '<div class="col-12">'
    +'<div class="empty-featured">'
    +'<div class="ef-icon"><i class="bi bi-journal-bookmark"></i></div>'
    +'<h5>Đề thi đang được cập nhật</h5>'
    +'<p>Kho đề thi sẽ sớm xuất hiện tại đây. Hãy quay lại nhé!</p>'
    +'</div></div>';
}

function renderFeatured(docs){
  var grid = document.getElementById('featuredGrid');
  if(!grid) return;
  if(!docs || docs.length === 0){ showEmptyFeatured(); return; }
  var sorted = docs.slice().sort(function(a,b){ return b.downloads - a.downloads; });
  grid.innerHTML = sorted.map(function(doc){ return renderDocCardHome(doc); }).join('');
  if(typeof setupReveal === 'function') setupReveal();
}

function renderDocCardHome(doc){
  var isFree   = !doc.price;
  var badge    = isFree
    ? '<span class="badge-free"><i class="bi bi-unlock"></i> Miễn phí</span>'
    : '<span class="badge-premium"><i class="bi bi-gem"></i> Premium</span><span class="price-tag ms-1">'+(doc.price/1000)+'K</span>';
  var btnStyle = isFree ? '' : ' style="background:rgba(99,102,241,.12);color:var(--grape)"';
  var btnText  = isFree ? 'Tải ngay' : 'Mua đề';
  var btnIcon  = isFree ? 'bi-download' : 'bi-gem';
  var subName  = {toan:'Toán',ly:'Vật lý',hoa:'Hoá học',sinh:'Sinh học',anh:'Tiếng Anh',van:'Ngữ văn',su:'Lịch sử',dia:'Địa lý',gdktpl:'GD KT&PL'}[doc.subject] || doc.subject;
  var fmtIcon  = {pdf:'bi-file-earmark-pdf-fill',docx:'bi-file-earmark-word-fill'}[doc.format] || 'bi-file-earmark-fill';
  var grad     = doc.gradient || ['#1E40AF','#F59E0B'];
  var dl       = doc.downloads >= 1000 ? (doc.downloads/1000).toFixed(1).replace('.0','')+'K' : doc.downloads;
  var qInfo    = doc.questions ? doc.questions+' câu' : doc.pages+' trang';
  var typeLabel = doc.source || doc.type;

  var thumbHtml = doc.thumbnail
    ? '<img class="doc-thumb" src="'+doc.thumbnail+'" alt="'+doc.title+'" loading="lazy">'
    : '';

  return '<div class="col-sm-6 col-lg-3 reveal" data-type="'+doc.type+'">'
    +'<div class="doc-card">'
    +'<div class="doc-cover" style="background:linear-gradient(135deg,'+grad[0]+','+grad[1]+')">'
    +thumbHtml
    +'<span class="doc-type">'+typeLabel+'</span>'
    +'<i class="bi '+fmtIcon+' doc-fmt"></i>'
    +'</div>'
    +'<div class="doc-body">'
    +'<div class="d-flex align-items-center gap-2 mb-2">'+badge+'</div>'
    +'<h6>'+doc.title+'</h6>'
    +'<div class="doc-meta"><i class="bi '+doc.icon+'"></i> '+subName+' · '+qInfo+'</div>'
    +'<div class="doc-foot">'
    +'<span class="doc-stat"><i class="bi bi-download"></i> '+dl+'</span>'
    +'<span class="doc-stat"><i class="bi bi-star-fill" style="color:var(--amber)"></i> '+doc.rating+'</span>'
    +'<button class="doc-foot-preview" onclick="event.stopPropagation();openPreviewModal('+doc.id+')" title="Xem trước"><i class="bi bi-eye"></i></button>'
    +'<button class="btn-mini" onclick="event.stopPropagation();openDocModal('+doc.id+')"'+btnStyle+'><i class="bi '+btnIcon+'"></i> '+btnText+'</button>'
    +'</div></div></div></div>';
}

function filterFeatured(btn, type){
  document.querySelectorAll('.feat-tab-v2').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  renderFeatured(type === 'all' ? allDocs : allDocs.filter(function(d){ return d.type === type; }));
}

function heroSearch(){
  var q = (document.getElementById('heroSearchInput') || {}).value || '';
  window.location.href = q.trim()
    ? 'kho-de-thi.html?q=' + encodeURIComponent(q)
    : 'kho-de-thi.html';
}
