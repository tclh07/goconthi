/* ============================================================
   GócÔnThi — components.js
   Navbar, Footer, Search Overlay, Login Modal
   Gọi 1 lần → tất cả trang đồng bộ, không copy-paste
   ============================================================ */

/* ---- Xác định trang hiện tại ---- */
function currentPage(){
  var p = location.pathname.split('/').pop() || 'index.html';
  return p;
}
function isActive(page){
  var cur = currentPage();
  if(page === 'index.html') return cur === 'index.html' || cur === '';
  return cur === page;
}
function activeClass(page){
  return isActive(page) ? ' active' : '';
}

/* ============ NAVBAR ============ */
function renderNavbar(){
  var nav = document.getElementById('main-navbar');
  if(!nav) return;
  nav.innerHTML = '<nav class="navbar navbar-expand-lg py-2">'
  +'<div class="container">'
    +'<a class="navbar-brand d-flex align-items-center gap-2 flex-shrink-0" href="index.html">'
      +'<span class="brand-mark"><i class="bi bi-book-half"></i></span>'
      +'<span style="font-family:\'Baloo 2\';font-weight:800;font-size:1.25rem;color:#fff">Góc<span style="color:var(--sky)">ÔnThi</span></span>'
    +'</a>'
    +'<button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navCollapse"><i class="bi bi-list fs-2" style="color:#fff"></i></button>'
    +'<div class="collapse navbar-collapse" id="navCollapse">'
      +'<ul class="navbar-nav mx-auto gap-1">'
        +'<li class="nav-item"><a class="nav-link'+activeClass('index.html')+'" href="index.html">Trang chủ</a></li>'
        +'<li class="nav-item"><a class="nav-link'+activeClass('kho-de-thi.html')+'" href="kho-de-thi.html">Kho đề thi</a></li>'
        +'<li class="nav-item"><a class="nav-link'+activeClass('goc-si-tu.html')+'" href="goc-si-tu.html">Góc sĩ tử</a></li>'
        +'<li class="nav-item"><a class="nav-link'+activeClass('ve-chung-toi.html')+'" href="ve-chung-toi.html">Về chúng tôi</a></li>'
      +'</ul>'
      +'<div class="navbar-actions d-flex align-items-center gap-2 flex-shrink-0">'
        +'<button class="nav-search-btn" onclick="openSearch()" type="button" title="Tìm kiếm" aria-label="Tìm kiếm"><i class="bi bi-search"></i></button>'
        +'<a href="#" class="btn btn-ghost" data-bs-toggle="modal" data-bs-target="#loginModal"><i class="bi bi-person me-1"></i>Đăng nhập</a>'
      +'</div>'
    +'</div>'
  +'</div></nav>';

  /* Thêm khoảng trống cho body vì navbar fixed */
  var nb = nav.querySelector('.navbar');
  if(nb){
    var h = nb.offsetHeight || 64;
    document.body.style.paddingTop = h + 'px';
    /* Cập nhật lại khi resize */
    window.addEventListener('resize', function(){
      document.body.style.paddingTop = nb.offsetHeight + 'px';
    });
  }

  /* Thêm shadow khi scroll */
  window.addEventListener('scroll', function(){
    var nb = document.querySelector('.navbar');
    if(!nb) return;
    if(window.scrollY > 10) nb.classList.add('scrolled');
    else nb.classList.remove('scrolled');
  }, {passive:true});
}

/* ============ FOOTER ============ */
function renderFooter(){
  var ft = document.getElementById('main-footer');
  if(!ft) return;
  ft.innerHTML = '<div class="container">'
    +'<div class="row g-4">'
      +'<div class="col-lg-4">'
        +'<a class="navbar-brand d-flex align-items-center gap-2 mb-3" href="index.html">'
          +'<span class="brand-mark" style="box-shadow:none"><i class="bi bi-book-half"></i></span>'
          +'<span style="font-family:\'Baloo 2\';font-weight:800;font-size:1.25rem;color:#fff">Góc<span style="color:var(--sky)">ÔnThi</span></span>'
        +'</a>'
        +'<p style="color:rgba(255,255,255,.6);max-width:320px">Nền tảng chia sẻ và mua bán đề thi TN THPT. Đồng hành cùng sĩ tử trên hành trình chinh phục kỳ thi.</p>'
        +'<div class="d-flex gap-2 mt-3">'
          +'<a href="#" class="foot-social"><i class="bi bi-facebook"></i></a>'
          +'<a href="#" class="foot-social"><i class="bi bi-youtube"></i></a>'
          +'<a href="#" class="foot-social"><i class="bi bi-tiktok"></i></a>'
          +'<a href="#" class="foot-social"><i class="bi bi-envelope-fill"></i></a>'
        +'</div>'
      +'</div>'
      +'<div class="col-6 col-lg-2">'
        +'<h6 class="mb-3">Kho đề thi</h6>'
        +'<ul class="list-unstyled d-grid gap-2">'
          +'<li><a href="kho-de-thi.html">Đề Sở GD&ĐT</a></li>'
          +'<li><a href="kho-de-thi.html">Đề đúng sai</a></li>'
          +'<li><a href="kho-de-thi.html">Đề minh hoạ Bộ</a></li>'
          +'<li><a href="kho-de-thi.html">Tóm tắt kiến thức</a></li>'
        +'</ul>'
      +'</div>'
      +'<div class="col-6 col-lg-2">'
        +'<h6 class="mb-3">Trang</h6>'
        +'<ul class="list-unstyled d-grid gap-2">'
          +'<li><a href="goc-si-tu.html">Góc sĩ tử</a></li>'
          +'<li><a href="ve-chung-toi.html">Về chúng tôi</a></li>'
          +'<li><a href="admin.html">Quản trị</a></li>'
        +'</ul>'
      +'</div>'
      +'<div class="col-lg-4">'
        +'<h6 class="mb-3">Nhận đề mới mỗi tuần</h6>'
        +'<p style="color:rgba(255,255,255,.6)">Đăng ký để không bỏ lỡ đề thi mới nhất.</p>'
        +'<div class="search-wrap" style="box-shadow:none;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12)">'
          +'<input type="email" placeholder="Email của bạn..." style="color:#fff">'
          +'<button class="btn btn-coral">Đăng ký</button>'
        +'</div>'
      +'</div>'
    +'</div>'
    +'<hr style="border-color:rgba(255,255,255,.12);margin:2.5rem 0 1.2rem">'
    +'<div class="d-flex flex-wrap justify-content-between align-items-center" style="color:rgba(255,255,255,.55);font-size:.88rem">'
      +'<span>© 2026 GócÔnThi. Chia sẻ tài liệu vì cộng đồng sĩ tử.</span>'
      +'<div class="d-flex gap-3 mt-2 mt-md-0"><a href="dieu-khoan.html">Điều khoản</a><a href="bao-mat.html">Bảo mật</a><a href="ve-chung-toi.html">Liên hệ</a></div>'
    +'</div>'
  +'</div>';
}

/* ============ SEARCH OVERLAY ============ */
function renderSearchOverlay(){
  var el = document.getElementById('search-overlay');
  if(!el) return;
  el.className = 'search-overlay';
  el.id = 'searchOverlay';
  el.innerHTML = '<div class="search-overlay-inner">'
    +'<div class="container position-relative">'
      +'<button class="so-close" type="button" onclick="closeSearch()" title="Đóng (ESC)"><i class="bi bi-x-lg"></i></button>'
      +'<h5 class="so-title"><i class="bi bi-search"></i> Tìm đề thi</h5>'
      +'<div class="overlay-search">'
        +'<i class="bi bi-search"></i>'
        +'<input type="text" id="soInput" placeholder="Nhập môn, loại đề, Sở GD&ĐT..." autocomplete="off" oninput="liveSearch()">'
        +'<button class="btn-go" type="button" onclick="doSearch()">Tìm</button>'
      +'</div>'
      +'<div id="soResults"></div>'
      +'<div id="soSuggest" class="overlay-suggest">'
        +'<div class="suggest-label"><i class="bi bi-fire" style="color:var(--amber)"></i> Đang tìm nhiều</div>'
        +'<div class="suggest-list">'
          +'<a class="suggest-item" href="#" onclick="fillSearch(\'Toán Sở Hà Nội 2026\');return false"><i class="bi bi-search"></i> Toán Sở Hà Nội 2026</a>'
          +'<a class="suggest-item" href="#" onclick="fillSearch(\'Đúng sai Vật Lý\');return false"><i class="bi bi-search"></i> Đúng sai Vật Lý</a>'
          +'<a class="suggest-item" href="#" onclick="fillSearch(\'Hoá học đề minh hoạ\');return false"><i class="bi bi-search"></i> Hoá học đề minh hoạ</a>'
          +'<a class="suggest-item" href="#" onclick="fillSearch(\'Tiếng Anh\');return false"><i class="bi bi-search"></i> Tiếng Anh Sở TP.HCM</a>'
        +'</div>'
      +'</div>'
    +'</div>'
  +'</div>';
}

function fillSearch(text){
  var inp = document.getElementById('soInput');
  if(inp){ inp.value = text; inp.focus(); liveSearch(); }
}

function openSearch(){
  var o = document.getElementById('searchOverlay');
  if(o){ o.classList.add('active'); document.body.style.overflow='hidden';
    setTimeout(function(){ var i=document.getElementById('soInput'); if(i) i.focus(); },200);
  }
}
function closeSearch(){
  var o = document.getElementById('searchOverlay');
  if(o){ o.classList.remove('active'); document.body.style.overflow=''; }
  var r = document.getElementById('soResults');
  if(r) r.innerHTML='';
  var s = document.getElementById('soSuggest');
  if(s) s.style.display='';
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape') closeSearch();
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openSearch(); }
});

var _searchTimer = null;
var _searchCache = null;

function liveSearch(){
  clearTimeout(_searchTimer);
  var q = (document.getElementById('soInput')||{}).value.trim().toLowerCase();
  var results = document.getElementById('soResults');
  var suggest = document.getElementById('soSuggest');

  if(!q){
    if(results) results.innerHTML='';
    if(suggest) suggest.style.display='';
    return;
  }
  if(suggest) suggest.style.display='none';

  /* loading skeleton */
  if(results) results.innerHTML = ''
    +'<div style="padding:1rem 0">'
      +'<div style="display:flex;gap:.8rem;align-items:center;padding:.6rem 0" class="search-skeleton">'
        +'<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%);background-size:200%;animation:shimmer 1.2s infinite"></div>'
        +'<div style="flex:1"><div style="height:12px;width:70%;border-radius:6px;background:linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%);background-size:200%;animation:shimmer 1.2s infinite;margin-bottom:6px"></div>'
        +'<div style="height:10px;width:40%;border-radius:6px;background:linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%);background-size:200%;animation:shimmer 1.2s infinite"></div></div>'
      +'</div>'
      +'<div style="display:flex;gap:.8rem;align-items:center;padding:.6rem 0" class="search-skeleton">'
        +'<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%);background-size:200%;animation:shimmer 1.2s infinite"></div>'
        +'<div style="flex:1"><div style="height:12px;width:60%;border-radius:6px;background:linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%);background-size:200%;animation:shimmer 1.2s infinite;margin-bottom:6px"></div>'
        +'<div style="height:10px;width:35%;border-radius:6px;background:linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%);background-size:200%;animation:shimmer 1.2s infinite"></div></div>'
      +'</div>'
    +'</div>';

  _searchTimer = setTimeout(function(){ fetchAndSearch(q); }, 400);
}

function fetchAndSearch(q){
  var results = document.getElementById('soResults');
  if(!results) return;

  function doFilter(docs){
    var matched = [];
    for(var i=0;i<docs.length;i++){
      var d = docs[i];
      var text = (d.title+' '+d.subject+' '+(d.source||'')+' '+(d.type||'')).toLowerCase();
      if(text.indexOf(q) >= 0) matched.push(d);
    }
    renderResults(matched, q);
  }

  if(_searchCache){
    doFilter(_searchCache);
  } else {
    fetch('data/documents.json')
      .then(function(r){ return r.json(); })
      .then(function(data){ _searchCache = data; doFilter(data); })
      .catch(function(){ results.innerHTML='<p style="color:#64748B;text-align:center;padding:1.5rem">Không thể tải dữ liệu</p>'; });
  }
}

function renderResults(items, q){
  var results = document.getElementById('soResults');
  if(!results) return;

  if(items.length === 0){
    results.innerHTML = ''
      +'<div style="text-align:center;padding:2rem 1rem">'
        +'<div style="font-size:3rem;margin-bottom:.5rem">🔍</div>'
        +'<p style="font-weight:600;color:var(--ink);margin:0 0 .3rem">Không tìm thấy kết quả</p>'
        +'<p style="color:#64748B;font-size:.88rem;margin:0">Thử tìm với từ khóa khác</p>'
      +'</div>';
    return;
  }

  var html = '<div style="padding:.8rem 0">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem">'
      +'<span style="font-size:.82rem;color:#64748B;font-weight:600">Tìm thấy '+items.length+' kết quả</span>'
      +'<a href="kho-de-thi.html?q='+encodeURIComponent(q)+'" style="font-size:.82rem;color:var(--coral);font-weight:600;text-decoration:none">Xem tất cả →</a>'
    +'</div>';

  for(var i=0;i<Math.min(items.length,5);i++){
    var d = items[i];
    var g1 = d.gradient ? d.gradient[0] : '#1E40AF';
    var g2 = d.gradient ? d.gradient[1] : '#3B82F6';
    var isFree = !d.price || d.price===0;
    var badge = isFree
      ? '<span style="background:rgba(14,165,233,.1);color:#0369A1;font-size:.7rem;font-weight:700;padding:.15rem .5rem;border-radius:50px">Miễn phí</span>'
      : '<span style="background:rgba(124,58,237,.1);color:#6D28D9;font-size:.7rem;font-weight:700;padding:.15rem .5rem;border-radius:50px">'+d.price.toLocaleString('vi')+'đ</span>';
    var delay = i * 80;

    html += '<a href="chi-tiet-de.html?id='+d.id+'" class="search-result-item" style="display:flex;align-items:center;gap:.8rem;padding:.75rem;border:1px solid #E2E8F0;border-radius:14px;margin-bottom:.5rem;text-decoration:none;color:inherit;transition:.25s;opacity:0;transform:translateY(10px);animation:fadeSlideUp .35s ease '+delay+'ms forwards" onclick="closeSearch()">'
      +'<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,'+g1+','+g2+');display:grid;place-items:center;color:#fff;flex-shrink:0;font-size:1.1rem"><i class="bi '+(d.icon||'bi-file-earmark-text')+'"></i></div>'
      +'<div style="flex:1;min-width:0">'
        +'<div style="font-weight:600;font-size:.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--ink)">'+highlightMatch(d.title, q)+'</div>'
        +'<div style="font-size:.75rem;color:#64748B;display:flex;align-items:center;gap:.5rem;margin-top:.15rem">'
          +'<span>'+(d.source||'')+'</span>'
          +'<span>·</span>'
          +'<span><i class="bi bi-download" style="font-size:.65rem"></i> '+(d.downloads?d.downloads.toLocaleString('vi'):'0')+'</span>'
        +'</div>'
      +'</div>'
      +badge
    +'</a>';
  }
  html += '</div>';
  results.innerHTML = html;
}

function highlightMatch(text, q){
  if(!q) return text;
  var idx = text.toLowerCase().indexOf(q.toLowerCase());
  if(idx < 0) return text;
  return text.substring(0,idx)
    +'<mark style="background:rgba(56,189,248,.2);color:var(--ink);padding:0 2px;border-radius:3px">'
    +text.substring(idx, idx+q.length)+'</mark>'
    +text.substring(idx+q.length);
}

function doSearch(){
  var q = (document.getElementById('soInput')||{}).value||'';
  if(q.trim()) window.location.href = 'kho-de-thi.html?q='+encodeURIComponent(q);
}

/* ============ LOGIN / REGISTER MODAL ============ */
function renderLoginModal(){
  var el = document.getElementById('login-modal');
  if(!el) return;
  el.className = 'modal fade';
  el.id = 'loginModal';
  el.setAttribute('tabindex','-1');
  el.setAttribute('aria-hidden','true');

  /* --- Google SVG icon (reuse) --- */
  var gSvg = '<svg viewBox="0 0 48 48" width="20" height="20"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/></svg>';

  /* --- Divider --- */
  var divider = '<div class="auth-divider"><span>hoặc dùng email</span></div>';

  /* --- LOGIN FORM --- */
  var loginForm = ''
    + '<button type="button" class="auth-google-btn" onclick="authGoogleLogin()">' + gSvg + ' Đăng nhập với Google</button>'
    + divider
    + '<div class="auth-error" id="loginError"></div>'
    + '<div class="mb-3"><label class="um-label">Email</label><input type="email" id="loginEmail" class="form-control" placeholder="email@example.com"></div>'
    + '<div class="mb-3"><label class="um-label">Mật khẩu</label><input type="password" id="loginPass" class="form-control" placeholder="••••••••"></div>'
    + '<div class="d-flex justify-content-between align-items-center mb-3">'
      + '<label class="auth-check"><input type="checkbox"> Ghi nhớ đăng nhập</label>'
      + '<a href="#" class="auth-forgot">Quên mật khẩu?</a>'
    + '</div>'
    + '<button class="btn btn-coral w-100 auth-submit" type="button" id="loginBtn" onclick="authLogin()"><i class="bi bi-box-arrow-in-right me-1"></i> Đăng nhập</button>';

  /* --- REGISTER FORM --- */
  /* --- REGISTER FORM --- */
  var registerForm = ''
    + '<button type="button" class="auth-google-btn" onclick="authGoogleLogin()">' + gSvg + ' Đăng ký với Google</button>'
    + divider
    + '<div class="auth-error" id="registerError"></div>'
    + '<div class="mb-3"><label class="um-label">Họ và tên</label><input type="text" id="regFullName" class="form-control" placeholder="Trần Thành"></div>'
    + '<div class="mb-3"><label class="um-label">Tên hiển thị</label><input type="text" id="regName" class="form-control" placeholder="VD: Nguyễn Văn A"></div>'
    + '<div class="mb-3"><label class="um-label">Email</label><input type="email" id="regEmail" class="form-control" placeholder="you@gmail.com"></div>'
    + '<div class="mb-3"><label class="um-label">Mật khẩu</label><input type="password" id="regPass" class="form-control" placeholder="Tối thiểu 8 ký tự"></div>'
    + '<div class="mb-3"><label class="um-label">Nhập lại mật khẩu</label><input type="password" id="regPass2" class="form-control" placeholder="••••••••"></div>'
    + '<label class="auth-check mb-3 d-block"><input type="checkbox" id="regAgree"> Tôi đồng ý với <a href="#" class="auth-link">điều khoản sử dụng</a> của GócÔnThi</label>'
    + '<button class="btn btn-coral w-100 auth-submit" type="button" id="regBtn" onclick="authRegister()"><i class="bi bi-person-plus me-1"></i> Tạo tài khoản</button>';
  el.innerHTML = '<div class="modal-dialog modal-dialog-centered">'
    +'<div class="modal-content hl-modal">'
      +'<div class="modal-header">'
        +'<div>'
          +'<h5 class="modal-title" id="authModalTitle"><i class="bi bi-shield-lock"></i> Đăng nhập</h5>'
          +'<p class="um-sub" id="authModalSub">Đăng nhập để tải tài liệu và tích điểm đóng góp</p>'
        +'</div>'
        +'<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>'
      +'</div>'
      +'<div class="modal-body">'
        +'<div class="auth-tabs">'
          +'<button type="button" class="auth-tab active" data-tab="login" onclick="switchAuthTab(\'login\')">Đăng nhập</button>'
          +'<button type="button" class="auth-tab" data-tab="register" onclick="switchAuthTab(\'register\')">Đăng ký</button>'
        +'</div>'
        +'<div id="authTabLogin" class="auth-pane">' + loginForm + '</div>'
        +'<div id="authTabRegister" class="auth-pane" style="display:none">' + registerForm + '</div>'
      +'</div>'
    +'</div>'
  +'</div>';

  /* Enter key submits */
  el.addEventListener('keydown', function(e){
    if(e.key !== 'Enter') return;
    var lp = document.getElementById('authTabLogin');
    if(lp && lp.style.display !== 'none') authLogin();
    else authRegister();
  });
}

/* ---- Tab switch ---- */
function switchAuthTab(tab){
  var tabs = document.querySelectorAll('.auth-tab');
  for(var i=0;i<tabs.length;i++) tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab')===tab);
  var lp = document.getElementById('authTabLogin');
  var rp = document.getElementById('authTabRegister');
  if(lp) lp.style.display = tab==='login' ? '' : 'none';
  if(rp) rp.style.display = tab==='register' ? '' : 'none';
  /* clear errors */
  clearAuthErrors();
  var title = document.getElementById('authModalTitle');
  var sub   = document.getElementById('authModalSub');
  if(tab==='login'){
    if(title) title.innerHTML = '<i class="bi bi-shield-lock"></i> Đăng nhập';
    if(sub)   sub.textContent = 'Đăng nhập để tải tài liệu và tích điểm đóng góp';
  } else {
    if(title) title.innerHTML = '<i class="bi bi-person-plus"></i> Đăng ký';
    if(sub)   sub.textContent = 'Tạo tài khoản để đóng góp và tải tài liệu miễn phí';
  }
}

/* ============================================================
   SUPABASE AUTH SYSTEM
   ============================================================ */

/* ---- helpers ---- */
function clearAuthErrors(){
  var e1 = document.getElementById('loginError');
  var e2 = document.getElementById('registerError');
  if(e1){ e1.textContent=''; e1.style.display='none'; }
  if(e2){ e2.textContent=''; e2.style.display='none'; }
  document.querySelectorAll('#loginModal .form-control.is-invalid').forEach(function(el){ el.classList.remove('is-invalid'); });
}

function showAuthError(id, msg){
  var el = document.getElementById(id);
  if(!el) return;
  el.textContent = msg;
  el.style.display = 'flex';
  var modal = document.querySelector('#loginModal .modal-content');
  if(modal){ modal.classList.add('auth-shake'); setTimeout(function(){ modal.classList.remove('auth-shake'); },400); }
}

function markInvalid(id){
  var el = document.getElementById(id);
  if(el) el.classList.add('is-invalid');
}

function setLoading(btnId, loading){
  var btn = document.getElementById(btnId);
  if(!btn) return;
  if(loading){
    btn.dataset.origText = btn.innerHTML;
    btn.innerHTML = '<span class="auth-spinner"></span> Đang xử lý...';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.origText || btn.innerHTML;
    btn.disabled = false;
  }
}

function showToast(msg, type){
  var t = document.getElementById('authToast');
  if(!t){
    t = document.createElement('div');
    t.id = 'authToast';
    t.className = 'auth-toast';
    document.body.appendChild(t);
  }
  t.innerHTML = '<i class="bi bi-'+(type==='success'?'check-circle-fill':'exclamation-triangle-fill')+'"></i> '+msg;
  t.className = 'auth-toast auth-toast--'+type+' show';
  setTimeout(function(){ t.classList.remove('show'); },3500);
}

function closeModal(){
  var m = document.getElementById('loginModal');
  if(m){
    var inst = bootstrap.Modal.getInstance(m);
    if(inst) inst.hide();
  }
}

function getInitial(name){
  if(!name) return '?';
  var parts = name.trim().split(/\s+/);
  return parts.length > 1 ? (parts[0][0]+parts[parts.length-1][0]).toUpperCase() : name[0].toUpperCase();
}

/* Biến global lưu user hiện tại */
var _currentUser = null;

/* ---- LOGIN (Supabase) ---- */
async function authLogin(){
  clearAuthErrors();
  var email = (document.getElementById('loginEmail')||{}).value||'';
  var pass  = (document.getElementById('loginPass')||{}).value||'';
  var ok = true;

  if(!email.trim()){ markInvalid('loginEmail'); ok=false; }
  if(!pass.trim()){ markInvalid('loginPass'); ok=false; }
  if(!ok){ showAuthError('loginError','Vui lòng nhập đầy đủ thông tin'); return; }

  setLoading('loginBtn',true);
  var result = await Auth.signIn(email.trim(), pass);
  setLoading('loginBtn',false);

  if(result.error){
    var msg = result.error.message;
    if(msg.indexOf('Invalid login')>=0) msg = 'Email hoặc mật khẩu không chính xác';
    else if(msg.indexOf('Email not confirmed')>=0) msg = 'Vui lòng xác nhận email trước khi đăng nhập';
    showAuthError('loginError', msg);
    return;
  }

  closeModal();
  var name = result.data.user.user_metadata.full_name || email.split('@')[0];
  showToast('Chào mừng '+name+' quay trở lại!','success');
}

/* ---- REGISTER (Supabase) ---- */
async function authRegister(){
  clearAuthErrors();
  var fullName = (document.getElementById('regFullName')||{}).value||'';
  var name  = (document.getElementById('regName')||{}).value||'';
  var email = (document.getElementById('regEmail')||{}).value||'';
  var pass  = (document.getElementById('regPass')||{}).value||'';
  var pass2 = (document.getElementById('regPass2')||{}).value||'';
  var agree = document.getElementById('regAgree');
  var ok = true;

  if(!name.trim()){ markInvalid('regName'); ok=false; }
  if(!email.trim()){ markInvalid('regEmail'); ok=false; }
  if(!pass){ markInvalid('regPass'); ok=false; }
  if(!pass2){ markInvalid('regPass2'); ok=false; }
  if(!ok){ showAuthError('registerError','Vui lòng nhập đầy đủ thông tin'); return; }

  if(email.indexOf('@')<1){ markInvalid('regEmail'); showAuthError('registerError','Email không hợp lệ'); return; }
  if(pass.length<8){ markInvalid('regPass'); showAuthError('registerError','Mật khẩu phải có ít nhất 8 ký tự'); return; }
  if(pass !== pass2){ markInvalid('regPass2'); showAuthError('registerError','Mật khẩu nhập lại không khớp'); return; }
  if(agree && !agree.checked){ showAuthError('registerError','Bạn cần đồng ý với điều khoản sử dụng'); return; }

  setLoading('regBtn',true);
  var result = await Auth.signUp(email.trim(), pass, fullName.trim() || name.trim());
  setLoading('regBtn',false);

  if(result.error){
    var msg = result.error.message;
    if(msg.indexOf('already registered')>=0) msg = 'Email này đã được đăng ký';
    showAuthError('registerError', msg);
    return;
  }

  closeModal();
  showToast('Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.','success');
}

/* ---- GOOGLE LOGIN (Supabase OAuth) ---- */
async function authGoogleLogin(){
  var gBtn = document.querySelector('#loginModal .auth-google-btn');
  if(gBtn){ gBtn.disabled=true; gBtn.innerHTML='<span class="auth-spinner"></span> Đang kết nối Google...'; }
  await Auth.signInGoogle();
}

/* ---- LOGOUT (Supabase) ---- */
async function authLogout(){
  await Auth.signOut();
  _currentUser = null;
  updateNavbarAuth();
  showToast('Đã đăng xuất','success');
}

/* ---- Update navbar for auth state ---- */
function updateNavbarAuth(user){
  var wrap = document.querySelector('.navbar-actions');
  if(!wrap) return;
  _currentUser = user || _currentUser;
  var session = _currentUser ? {
    name: _currentUser.user_metadata.full_name || _currentUser.email.split('@')[0],
    email: _currentUser.email
  } : null;

  if(!session){
    /* logged out — show login button */
    var existing = wrap.querySelector('.auth-user-wrap');
    if(existing) existing.remove();
    var loginBtn = wrap.querySelector('.btn-ghost');
    if(!loginBtn){
      var a = document.createElement('a');
      a.href='#'; a.className='btn btn-ghost'; a.setAttribute('data-bs-toggle','modal'); a.setAttribute('data-bs-target','#loginModal');
      a.innerHTML='<i class="bi bi-person me-1"></i>Đăng nhập';
      wrap.appendChild(a);
    }
    return;
  }

  /* logged in — show avatar + dropdown */
  var loginBtn = wrap.querySelector('.btn-ghost');
  if(loginBtn) loginBtn.remove();
  var existing = wrap.querySelector('.auth-user-wrap');
  if(existing) existing.remove();

  var initials = getInitial(session.name);
  var div = document.createElement('div');
  div.className = 'auth-user-wrap';
  div.innerHTML = ''
    +'<button class="auth-avatar-btn" onclick="this.nextElementSibling.classList.toggle(\'show\')" type="button">'
      +'<span class="auth-avatar">'+initials+'</span>'
      +'<span class="auth-uname">'+session.name+'</span>'
      +'<i class="bi bi-chevron-down" style="font-size:.7rem;opacity:.5"></i>'
    +'</button>'
    +'<div class="auth-dropdown">'
      +'<div class="auth-dd-header">'
        +'<span class="auth-avatar auth-avatar--lg">'+initials+'</span>'
        +'<div><strong>'+session.name+'</strong><br><small style="color:var(--ink-soft)">'+session.email+'</small></div>'
      +'</div>'
      +'<div class="auth-dd-sep"></div>'
      +'<a href="#" class="auth-dd-item" onclick="openProfilePanel();return false"><i class="bi bi-person"></i> Trang cá nhân</a>'
      +'<a href="#" class="auth-dd-item" onclick="openDownloadsPanel();return false"><i class="bi bi-download"></i> Tài liệu đã tải</a>'
      +'<a href="#" class="auth-dd-item" onclick="openFavoritesPanel();return false"><i class="bi bi-star"></i> Yêu thích</a>'
      +'<div class="auth-dd-sep"></div>'
      +'<a href="#" class="auth-dd-item auth-dd-logout" onclick="authLogout();return false"><i class="bi bi-box-arrow-right"></i> Đăng xuất</a>'
    +'</div>';
  wrap.appendChild(div);

  /* close dropdown on outside click */
  document.addEventListener('click', function closeDD(e){
    if(!div.contains(e.target)){
      var dd = div.querySelector('.auth-dropdown');
      if(dd) dd.classList.remove('show');
    }
  });
}

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', async function(){
  renderNavbar();
  renderFooter();
  renderSearchOverlay();
  renderLoginModal();

  /* Khôi phục session từ Supabase */
  var user = await Auth.getUser();
  if(user) updateNavbarAuth(user);

  /* Lắng nghe thay đổi auth (login/logout/token refresh) */
  Auth.onAuthChange(function(event, session){
    if(event === 'SIGNED_IN' && session){
      _currentUser = session.user;
      updateNavbarAuth(session.user);
    } else if(event === 'SIGNED_OUT'){
      _currentUser = null;
      updateNavbarAuth();
    }
  });
});
/* ============================================================
   PANELS: Trang cá nhân / Tài liệu đã tải / Yêu thích
   (giả lập localStorage — nhìn thật, không cần backend)
   ============================================================ */

/* ---- HELPER: tạo slide panel ---- */
function createPanel(id, title, icon, contentHtml){
  var old = document.getElementById(id);
  if(old) old.remove();

  var overlay = document.createElement('div');
  overlay.id = id;
  overlay.style.cssText = 'position:fixed;inset:0;z-index:1070;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);opacity:0;transition:.25s';
  overlay.innerHTML = ''
    +'<div class="panel-popup" style="background:#fff;border-radius:20px;width:440px;max-width:92vw;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 20px 60px -12px rgba(15,23,42,.3);transform:scale(.9);transition:.3s cubic-bezier(.2,.7,.3,1)">'
      +'<div style="padding:1.2rem 1.5rem;display:flex;align-items:center;gap:.7rem;border-bottom:1px solid #E2E8F0;flex-shrink:0">'
        +'<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#1E40AF,#0EA5E9);display:grid;place-items:center;color:#fff"><i class="bi '+icon+'"></i></div>'
        +'<span style="font-weight:700;font-size:1.05rem;flex:1">'+title+'</span>'
        +'<button onclick="closePanel(\''+id+'\')" style="background:none;border:none;font-size:1.2rem;color:#94A3B8;cursor:pointer;width:32px;height:32px;border-radius:8px;transition:.15s" onmouseover="this.style.background=\'#F1F5F9\'" onmouseout="this.style.background=\'none\'"><i class="bi bi-x-lg"></i></button>'
      +'</div>'
      +'<div class="panel-body" style="padding:1.2rem 1.5rem;overflow-y:auto;flex:1">'+contentHtml+'</div>'
    +'</div>';

  overlay.addEventListener('click', function(e){ if(e.target===overlay) closePanel(id); });
  document.body.appendChild(overlay);

  requestAnimationFrame(function(){
    overlay.style.opacity='1';
    overlay.querySelector('.panel-popup').style.transform='scale(1)';
  });
}

function closePanel(id){
  var el = document.getElementById(id);
  if(!el) return;
  var box = el.querySelector('.panel-popup');
  if(box) box.style.transform='scale(.9)';
  el.style.opacity='0';
  setTimeout(function(){ el.remove(); }, 300);
}

/* ---- TRANG CÁ NHÂN (Supabase) ---- */
async function openProfilePanel(){
  var dd = document.querySelector('.auth-dropdown.show');
  if(dd) dd.classList.remove('show');

  if(!_currentUser) return;
  var name = _currentUser.user_metadata.full_name || _currentUser.email.split('@')[0];
  var email = _currentUser.email;
  var initial = getInitial(name);
  var joinDate = new Date(_currentUser.created_at).toLocaleDateString('vi-VN');

  var html = ''
    +'<div style="text-align:center;padding:1rem 0 1.5rem">'
      +'<div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#0EA5E9);color:#fff;font-size:1.8rem;font-weight:700;display:grid;place-items:center;margin:0 auto .8rem;box-shadow:0 8px 24px -8px rgba(30,64,175,.4)">'+initial+'</div>'
      +'<h5 style="margin:0 0 .2rem;font-weight:700;font-size:1.15rem">'+name+'</h5>'
      +'<p style="color:#64748B;font-size:.88rem;margin:0">'+email+'</p>'
    +'</div>'

    +'<div style="border:1px solid #E2E8F0;border-radius:14px;overflow:hidden">'
      +'<div style="padding:.8rem 1rem;border-bottom:1px solid #E2E8F0;display:flex;justify-content:space-between"><span style="color:#64748B;font-size:.85rem">Họ và tên</span><span style="font-weight:600;font-size:.85rem">'+name+'</span></div>'
      +'<div style="padding:.8rem 1rem;border-bottom:1px solid #E2E8F0;display:flex;justify-content:space-between"><span style="color:#64748B;font-size:.85rem">Email</span><span style="font-weight:600;font-size:.85rem">'+email+'</span></div>'
      +'<div style="padding:.8rem 1rem;display:flex;justify-content:space-between"><span style="color:#64748B;font-size:.85rem">Ngày tham gia</span><span style="font-weight:600;font-size:.85rem">'+joinDate+'</span></div>'
    +'</div>';

  createPanel('profilePanel','Trang cá nhân','bi-person',html);
}

/* ---- TÀI LIỆU ĐÃ TẢI (Supabase) ---- */
async function openDownloadsPanel(){
  var dd = document.querySelector('.auth-dropdown.show');
  if(dd) dd.classList.remove('show');
  if(!_currentUser){ showToast('Vui lòng đăng nhập','error'); return; }

  var downloads = await DB.getDownloadHistory(_currentUser.id);
  var html = '';

  if(!downloads.length){
    html = '<div style="text-align:center;padding:3rem 1rem">'
      +'<i class="bi bi-download" style="font-size:3rem;color:#CBD5E1"></i>'
      +'<p style="color:#64748B;margin:.8rem 0 0;font-size:.92rem">Bạn chưa tải tài liệu nào</p>'
      +'<a href="kho-de-thi.html" style="color:#1E40AF;font-weight:600;font-size:.88rem;text-decoration:none" onclick="closePanel(\'downloadsPanel\')">Khám phá kho đề thi →</a>'
    +'</div>';
  } else {
    for(var i=0;i<downloads.length;i++){
      var d = downloads[i];
      var doc = d.documents || {};
      var grad = doc.gradient || ['#1E40AF','#3B82F6'];
      var time = new Date(d.created_at).toLocaleDateString('vi-VN');
      html += '<div style="display:flex;align-items:center;gap:.8rem;padding:.8rem;border:1px solid #E2E8F0;border-radius:12px;margin-bottom:.6rem">'
        +'<div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,'+grad[0]+','+grad[1]+');display:grid;place-items:center;color:#fff;flex-shrink:0"><i class="bi bi-file-earmark-text"></i></div>'
        +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+(doc.title||'Tài liệu')+'</div><div style="font-size:.75rem;color:#64748B">'+time+'</div></div>'
      +'</div>';
    }
  }
  createPanel('downloadsPanel','Tài liệu đã tải','bi-download',html);
}

function addDownload(doc){
  if(!_currentUser) return;
  DB.addDownloadHistory(_currentUser.id, doc.id);
}

/* ---- YÊU THÍCH (Supabase) ---- */
async function openFavoritesPanel(){
  var dd = document.querySelector('.auth-dropdown.show');
  if(dd) dd.classList.remove('show');
  if(!_currentUser){ showToast('Vui lòng đăng nhập','error'); return; }

  var favorites = await DB.getFavorites(_currentUser.id);
  var html = '';

  if(!favorites.length){
    html = '<div style="text-align:center;padding:3rem 1rem">'
      +'<i class="bi bi-star" style="font-size:3rem;color:#CBD5E1"></i>'
      +'<p style="color:#64748B;margin:.8rem 0 0;font-size:.92rem">Chưa có tài liệu yêu thích</p>'
      +'<a href="kho-de-thi.html" style="color:#1E40AF;font-weight:600;font-size:.88rem;text-decoration:none" onclick="closePanel(\'favoritesPanel\')">Khám phá kho đề thi →</a>'
    +'</div>';
  } else {
    for(var i=0;i<favorites.length;i++){
      var f = favorites[i];
      var doc = f.documents || {};
      var grad = doc.gradient || ['#1E40AF','#3B82F6'];
      html += '<div style="display:flex;align-items:center;gap:.8rem;padding:.8rem;border:1px solid #E2E8F0;border-radius:12px;margin-bottom:.6rem">'
        +'<div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,'+grad[0]+','+grad[1]+');display:grid;place-items:center;color:#fff;flex-shrink:0"><i class="bi bi-file-earmark-text"></i></div>'
        +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+(doc.title||'')+'</div><div style="font-size:.75rem;color:#64748B">'+(doc.subject||'')+'</div></div>'
        +'<button onclick="toggleFavorite('+doc.id+');closePanel(\'favoritesPanel\');setTimeout(openFavoritesPanel,400)" style="background:none;border:none;color:#F59E0B;cursor:pointer;font-size:1.1rem" title="Bỏ thích"><i class="bi bi-star-fill"></i></button>'
      +'</div>';
    }
  }
  createPanel('favoritesPanel','Yêu thích','bi-star',html);
}

async function toggleFavorite(docId){
  if(!_currentUser){ showToast('Vui lòng đăng nhập để yêu thích','error'); return false; }
  var added = await DB.toggleFavorite(_currentUser.id, docId);
  showToast(added ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích', 'success');
  return added;
}

async function isFavorited(docId){
  if(!_currentUser) return false;
  return await DB.isFavorited(_currentUser.id, docId);
}
