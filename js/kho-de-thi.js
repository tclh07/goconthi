/* ============================================================
   KHO ĐỀ THI v2 — Logic (Supabase version)
   ============================================================ */
var SUBJECT_MAP = {toan:'Toán',ly:'Vật lý',hoa:'Hoá học',sinh:'Sinh học',anh:'Tiếng Anh',van:'Ngữ văn',su:'Lịch sử',dia:'Địa lý',gdktpl:'GD KT&PL'};
var TYPE_MAP = {so:'Đề Sở',dungsai:'Đúng sai',minhhoa:'Minh hoạ Bộ',tomtat:'Tóm tắt'};

var allDocs = [];
var currentMon = 'all';
var currentPrice = 'all';

/* Load subject pills từ Supabase */
(async function(){
  try {
    var subs = await DB.getSubjects();
    var c = document.getElementById('subjectPills');
    c.innerHTML += subs.map(function(s){
      var g = s.gradient||['#1E40AF','#F59E0B'];
      return '<button class="sub-pill" data-mon="'+s.id+'" onclick="filterMon(this)">'
        +'<span class="sp-ic" style="background:linear-gradient(135deg,'+g[0]+','+g[1]+')"><i class="bi '+s.icon+'"></i></span>'
        +s.name+'<span class="sp-count">'+s.count+'</span></button>';
    }).join('');
  } catch(e){ console.warn('subjects:', e); }
})();

/* Load documents từ Supabase */
(async function(){
  try {
    var docs = await DB.getDocs();
    allDocs = docs;
    window._allDocsData = docs;
    renderGrid(docs);
  } catch(e){ console.warn('docs:', e); showEmpty(); }
})();

function renderCard(doc){
  var isFree = !doc.price;
  var grad = doc.gradient||['#1E40AF','#F59E0B'];
  var subName = SUBJECT_MAP[doc.subject]||doc.subject;
  var typeName = TYPE_MAP[doc.type]||doc.type;
  var fmt = doc.format||'pdf';
  var dl = doc.downloads>=1000?(doc.downloads/1000).toFixed(1).replace('.0','')+'K':doc.downloads;
  var qInfo = doc.questions?doc.questions+' câu':doc.pages+' trang';
  var priceHtml, btnHtml;
  if(isFree){
    priceHtml='<span class="dc2-price-tag free">Free</span>';
    btnHtml='<button class="dc2-btn free-btn" onclick="event.preventDefault();event.stopPropagation();openDocModal('+doc.id+')"><i class="bi bi-download"></i> Tải</button>';
  } else {
    priceHtml='<span class="dc2-price-tag">'+(doc.price/1000)+'K</span>';
    btnHtml='<button class="dc2-btn premium-btn" onclick="event.preventDefault();event.stopPropagation();openDocModal('+doc.id+')"><i class="bi bi-gem"></i> Mua</button>';
  }

  var thumbHtml = doc.thumbnail
    ? '<img class="doc-thumb" src="'+doc.thumbnail+'" alt="" loading="lazy">'
    : '';
  var fmtIcon = {pdf:'bi-file-earmark-pdf-fill',docx:'bi-file-earmark-word-fill'}[fmt]||'bi-file-earmark-fill';

  return '<div class="col-6 col-md-4 col-xl-3 reveal"><a class="dc2" href="chi-tiet-de.html?id='+doc.id+'">'
    +'<div class="dc2-cover" style="background:linear-gradient(135deg,'+grad[0]+','+grad[1]+')">'
    +thumbHtml
    +'<i class="bi '+fmtIcon+' dc2-fmt"></i>'
    +'<span class="dc2-source">'+(doc.source||typeName)+'</span>'
    +'</div>'
    +'<div class="dc2-body">'
    +'<div class="dc2-title">'+doc.title+'</div>'
    +'<div class="dc2-meta"><i class="bi '+(doc.icon||'bi-file-earmark')+'"></i> '+subName+' · '+qInfo+' · '+doc.year+'</div>'
    +'<div class="dc2-foot">'
    +'<div class="dc2-stats"><span><i class="bi bi-download"></i> '+dl+'</span><span><i class="bi bi-star-fill" style="color:var(--amber)"></i> '+doc.rating+'</span></div>'
    +priceHtml+btnHtml
    +'</div></div></a></div>';
}

function renderGrid(docs){
  var grid = document.getElementById('docGrid');
  if(!grid) return;
  if(!docs.length){ showEmpty(); return; }
  grid.innerHTML = docs.map(renderCard).join('');
  document.getElementById('resultCount').textContent = docs.length;
  if(typeof setupReveal==='function') setupReveal();
}

function showEmpty(){
  var grid = document.getElementById('docGrid');
  if(grid) grid.innerHTML = '<div class="col-12"><div class="kdt-empty"><div class="ke-icon"><i class="bi bi-search"></i></div><h5>Không tìm thấy đề thi</h5><p>Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p><button class="btn btn-coral" onclick="resetFilters()"><i class="bi bi-arrow-counterclockwise me-1"></i>Xoá bộ lọc</button></div></div>';
  document.getElementById('resultCount').textContent='0';
}

function filterMon(btn){
  document.querySelectorAll('.sub-pill').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  currentMon=btn.getAttribute('data-mon');
  applyFilters();
}
function filterPrice(btn){
  document.querySelectorAll('.fb-price-btn').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  currentPrice=btn.getAttribute('data-price');
  applyFilters();
}
function applyFilters(){
  var loai=document.getElementById('filterLoai').value;
  var nam=document.getElementById('filterNam').value;
  var filtered=allDocs.filter(function(d){
    if(currentMon!=='all'&&d.subject!==currentMon) return false;
    if(loai!=='all'&&d.type!==loai) return false;
    if(nam!=='all'&&String(d.year)!==nam) return false;
    if(currentPrice==='free'&&d.price) return false;
    if(currentPrice==='premium'&&!d.price) return false;
    return true;
  });
  renderGrid(filtered);
}
function resetFilters(){
  currentMon='all'; currentPrice='all';
  document.querySelectorAll('.sub-pill').forEach(function(b){b.classList.remove('active');});
  document.querySelector('.sub-pill[data-mon="all"]').classList.add('active');
  document.querySelectorAll('.fb-price-btn').forEach(function(b){b.classList.remove('active');});
  document.querySelector('.fb-price-btn[data-price="all"]').classList.add('active');
  document.getElementById('filterLoai').selectedIndex=0;
  document.getElementById('filterNam').selectedIndex=0;
  renderGrid(allDocs);
}
function sortDocs(btn,type){
  document.querySelectorAll('.fb-sort-btn').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  var s=allDocs.slice();
  if(type==='downloads') s.sort(function(a,b){return b.downloads-a.downloads;});
  else if(type==='rating') s.sort(function(a,b){return b.rating-a.rating;});
  else s.sort(function(a,b){return b.year-a.year||b.id-a.id;});
  allDocs=s; applyFilters();
}
function kdtSearch(){
  var q=(document.getElementById('kdtSearchInput')||{}).value||'';
  if(!q.trim()) return;
  var ql=q.toLowerCase();
  var f=allDocs.filter(function(d){
    return d.title.toLowerCase().indexOf(ql)!==-1||(SUBJECT_MAP[d.subject]||'').toLowerCase().indexOf(ql)!==-1||(d.source||'').toLowerCase().indexOf(ql)!==-1;
  });
  renderGrid(f);
}

/* Auto-filter from URL */
(function(){
  var p=new URLSearchParams(window.location.search);
  var mon=p.get('mon'), q=p.get('q');
  if(mon) setTimeout(function(){var b=document.querySelector('.sub-pill[data-mon="'+mon+'"]');if(b)filterMon(b);},500);
  if(q){var i=document.getElementById('kdtSearchInput');if(i)i.value=q;setTimeout(kdtSearch,500);}
})();
