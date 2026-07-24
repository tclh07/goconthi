/* ============================================================
   GócÔnThi — render.js
   Card render + Preview Modal + Doc Modal (tải/mua tự động)
   ============================================================ */

var SUBJECT_MAP = {
  toan:'Toán', ly:'Vật lý', hoa:'Hoá học', sinh:'Sinh học',
  anh:'Tiếng Anh', van:'Ngữ văn', su:'Lịch sử', dia:'Địa lý', gdktpl:'GD KT&PL'
};
var TYPE_MAP = {
  so:'Đề Sở GD&ĐT', dungsai:'Đề đúng sai', minhhoa:'Đề minh hoạ Bộ', tomtat:'Tóm tắt kiến thức'
};
var FORMAT_ICON = {
  pdf:'bi-file-earmark-pdf-fill', docx:'bi-file-earmark-word-fill', pptx:'bi-file-earmark-ppt-fill'
};

/* ============================================================
   CẤU HÌNH THANH TOÁN — Đọc từ Supabase
   ============================================================ */
var PAY_CONFIG = {
  bankName: 'Vietcombank (VCB)',
  bankCode: 'VCB',
  accountNo: '1234567890',
  accountOwner: 'NGUYEN VAN A'
};

/* Load cấu hình ngân hàng từ database */
(async function loadPayConfig(){
  try {
    var result = await supabase.from('site_settings').select('*');
    if(result.data){
      result.data.forEach(function(row){
        if(row.key === 'bank_name') PAY_CONFIG.bankName = row.value;
        if(row.key === 'bank_code') PAY_CONFIG.bankCode = row.value;
        if(row.key === 'bank_account') PAY_CONFIG.accountNo = row.value;
        if(row.key === 'bank_owner') PAY_CONFIG.accountOwner = row.value;
      });
    }
  } catch(e){ console.warn('Load pay config:', e); }
})();

/* ============================================================
   HỆ THỐNG ĐƠN HÀNG — localStorage
   ============================================================ */
/* ============================================================
   ORDER STORE — Supabase version
   Wrapper giữ cùng interface cũ để code modal không đổi nhiều
   ============================================================ */
var OrderStore = {
  add: async function(order){
    var data = {
      order_code: order.orderCode,
      doc_id: order.docId,
      doc_title: order.docTitle,
      amount: order.amount,
      buyer_name: order.buyerName || null,
      buyer_contact: order.buyerContact || null,
      user_id: (typeof _currentUser !== 'undefined' && _currentUser) ? _currentUser.id : null,
      status: 'pending'
    };
    var result = await DB.createOrder(data);
    return result || order;
  },
  findByCode: async function(code){
    var row = await DB.getOrderByCode(code);
    if(!row) return null;
    return {
      orderCode: row.order_code,
      docId: row.doc_id,
      docTitle: row.doc_title,
      amount: row.amount,
      buyerContact: row.buyer_contact,
      status: row.status,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
      createdAt: row.created_at
    };
  },
  isApproved: async function(docId){
    if(typeof _currentUser === 'undefined' || !_currentUser) return false;
    return await DB.isDocApproved(docId, _currentUser.id);
  },
  updateStatus: async function(code, status, approvedBy){
    await DB.updateOrderStatus(code, status, approvedBy);
  },
  getPendingCount: async function(){
    return await DB.getPendingCount();
  }
};

function formatNum(n){
  if(n>=1000) return (n/1000).toFixed(1).replace('.0','')+'K';
  return n;
}
function formatPrice(p){
  if(!p) return null;
  return (p/1000)+'K';
}

/* ============================================================
   GENERATE MÃ ĐƠN HÀNG
   Ghép: docCode (nhập ở admin) + random chữ+số, không cách, không ký tự đặc biệt
   VD: doc.docCode = "TOANHN01" → "TOANHN01X7K2M9"
   ============================================================ */
function generateOrderCode(doc){
  var base = (doc.docCode || 'DE' + doc.id).toUpperCase().replace(/[^A-Z0-9]/g, '');
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var rand = '';
  for(var i=0;i<6;i++) rand += chars.charAt(Math.floor(Math.random()*chars.length));
  return base + rand;
}

/* Biến global lưu trạng thái đơn hàng hiện tại */
var _currentOrderCode = null;
var _currentDocId = null;

/* Đếm ngược thanh toán */
var _countdownTimer = null;
var _countdownSeconds = 0;

/* ============================================================
   CARD RENDERERS
   ============================================================ */

function renderCoverHtml(doc){
  var grad = doc.gradient || ['#1E40AF','#3B82F6'];
  var thumbHtml = doc.thumbnail
    ? '<img class="doc-thumb" src="'+doc.thumbnail+'" alt="'+doc.title+'" loading="lazy">'
    : '';
  return '<div class="doc-cover" style="background:linear-gradient(135deg,'+grad[0]+','+grad[1]+')">' + thumbHtml;
}

function renderDocCard(doc){
  var isFree = !doc.price;
  var badge = isFree
    ? '<span class="badge-free"><i class="bi bi-unlock"></i> Miễn phí</span>'
    : '<span class="badge-premium"><i class="bi bi-gem"></i> Premium</span><span class="price-tag">'+formatPrice(doc.price)+'</span>';
  var typeLabel = doc.source || TYPE_MAP[doc.type] || doc.type;
  var subLabel = SUBJECT_MAP[doc.subject] || doc.subject;
  var btnStyle = isFree ? '' : ' style="background:rgba(123,95,242,.12);color:var(--grape)"';
  var btnText = isFree ? 'Tải ngay' : 'Mua đề';
  var btnIcon = isFree ? 'bi-download' : 'bi-gem';

  return '<div class="col-sm-6 col-xl-4 reveal">'
    +'<div class="doc-card" data-mon="'+doc.subject+'" data-loai="'+doc.type+'" data-nam="'+doc.year+'" data-price="'+(isFree?'free':'premium')+'">'
    + renderCoverHtml(doc)
    +'<span class="doc-type">'+typeLabel+'</span>'
    +'<i class="bi '+(FORMAT_ICON[doc.format]||'bi-file-earmark-fill')+' doc-fmt"></i>'
    +'</div>'
    +'<div class="doc-body">'
    +'<div class="d-flex align-items-center gap-2 mb-2">'+badge+'</div>'
    +'<h6>'+doc.title+'</h6>'
    +'<div class="doc-meta"><i class="bi '+doc.icon+'"></i> '+subLabel+' · '+TYPE_MAP[doc.type]+' · '+doc.year+'</div>'
    +'<div class="doc-foot">'
    +'<span class="doc-stat"><i class="bi bi-download"></i> '+formatNum(doc.downloads)+'</span>'
    +'<span class="doc-stat"><i class="bi bi-star-fill" style="color:var(--amber)"></i> '+doc.rating+'</span>'
    +'<button class="doc-foot-preview" onclick="event.stopPropagation();openPreviewModal('+doc.id+')" title="Xem trước"><i class="bi bi-eye"></i></button>'
    +'<button class="btn-mini" onclick="event.stopPropagation();openDocModal('+doc.id+')"'+btnStyle+'><i class="bi '+btnIcon+'"></i> '+btnText+'</button>'
    +'</div></div></div></div>';
}

function renderSubjectCard(sub, size){
  size = size || 'small';
  var grad = sub.gradient || ['#1E40AF','#3B82F6'];
  if(size==='small'){
    return '<div class="col-6 col-md-4 col-lg reveal">'
      +'<a class="cat-card text-center" href="kho-de-thi.html?mon='+sub.id+'" style="padding:1.3rem">'
      +'<div class="cat-ic mx-auto" style="background:linear-gradient(135deg,'+grad[0]+','+grad[1]+')"><i class="bi '+sub.icon+'"></i></div>'
      +'<h5 style="font-size:1rem">'+sub.name+'</h5>'
      +'<span class="cat-count"><i class="bi bi-file-earmark"></i> '+sub.count+' đề</span>'
      +'</a></div>';
  }
  return '';
}

/* ---- Load JSON → render ---- */
function loadDocs(jsonPath, gridId, limit){
  var grid = document.getElementById(gridId);
  if(!grid) return;
  fetch(jsonPath)
    .then(function(r){ return r.json(); })
    .then(function(docs){
      if(!window._allDocsData) window._allDocsData = [];
      docs.forEach(function(d){
        var exists = window._allDocsData.some(function(x){ return x.id === d.id; });
        if(!exists) window._allDocsData.push(d);
      });
      if(limit) docs = docs.slice(0, limit);
      grid.innerHTML = docs.map(renderDocCard).join('');
      if(typeof setupReveal === 'function') setupReveal();
    })
    .catch(function(err){ console.warn('Không load được JSON:', err); });
}
function loadSubjects(jsonPath, gridId){
  var grid = document.getElementById(gridId);
  if(!grid) return;
  fetch(jsonPath)
    .then(function(r){ return r.json(); })
    .then(function(subs){
      grid.innerHTML = subs.map(function(s){ return renderSubjectCard(s,'small'); }).join('');
      if(typeof setupReveal === 'function') setupReveal();
    })
    .catch(function(err){ console.warn('Không load được subjects:', err); });
}

/* ============================================================
   TIỆN ÍCH
   ============================================================ */
function findDocById(id){
  if(window._allDocsData){
    for(var i=0;i<window._allDocsData.length;i++){
      if(window._allDocsData[i].id === id) return window._allDocsData[i];
    }
  }
  if(typeof allDocs !== 'undefined'){
    for(var j=0;j<allDocs.length;j++){
      if(allDocs[j].id === id) return allDocs[j];
    }
  }
  return null;
}

function gotCopyText(text){
  navigator.clipboard.writeText(text).then(function(){
    var toast = document.createElement('div');
    toast.className = 'got-copy-toast';
    toast.innerHTML = '<i class="bi bi-check-circle-fill"></i> Đã sao chép: ' + text;
    document.body.appendChild(toast);
    setTimeout(function(){ toast.remove(); }, 2000);
  });
}

/* ============================================================
   1) PREVIEW MODAL — Xem trước (nút mắt)
   ============================================================ */
function ensurePreviewModal(){
  if(document.getElementById('docPreviewModal')) return;
  var modal = document.createElement('div');
  modal.id = 'docPreviewModal';
  modal.className = 'preview-modal-overlay';
  modal.innerHTML = ''
    +'<div class="preview-modal">'
      +'<div class="pm-header">'
        +'<div class="pm-title-wrap">'
          +'<div class="pm-icon"><i class="bi bi-eye"></i></div>'
          +'<div>'
            +'<h5 class="pm-title" id="pmTitle">Xem trước</h5>'
            +'<span class="pm-subtitle" id="pmSubtitle"></span>'
          +'</div>'
        +'</div>'
        +'<button class="pm-close" onclick="closePreviewModal()" title="Đóng"><i class="bi bi-x-lg"></i></button>'
      +'</div>'
      +'<div class="pm-body" id="pmBody"></div>'
      +'<div class="pm-footer" id="pmFooter"></div>'
    +'</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) closePreviewModal(); });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape'){ closePreviewModal(); closeDocModal(); }
  });
}

function openPreviewModal(docId){
  ensurePreviewModal();
  var doc = findDocById(docId);
  if(!doc) return;
  var isFree = !doc.price;
  var subName = SUBJECT_MAP[doc.subject] || doc.subject;

  document.getElementById('pmTitle').textContent = doc.title;
  document.getElementById('pmSubtitle').innerHTML = '<i class="bi '+doc.icon+'"></i> '+subName
    +' · <i class="bi bi-file-earmark"></i> '+doc.pages+' trang'
    +' · '+(isFree
      ? '<span style="color:var(--teal)"><i class="bi bi-unlock"></i> Xem toàn bộ</span>'
      : '<span style="color:var(--grape)"><i class="bi bi-gem"></i> Xem 1 trang</span>');

  var body = document.getElementById('pmBody');
  var pageLimit = isFree ? doc.pages : 1;
  if(doc.previewUrl){
    if(doc.format==='pdf'){
      body.innerHTML = '<iframe class="pm-pdf-frame" src="'+doc.previewUrl+(isFree?'':'?pages=1')+'"></iframe>';
    } else {
      body.innerHTML = '<div class="pm-img-preview"><img src="'+doc.previewUrl+'" alt="Preview">'
        +(isFree?'':'<div class="pm-lock-overlay"><div class="pm-lock-msg"><i class="bi bi-lock-fill"></i> Chỉ xem được trang đầu</div></div>')+'</div>';
    }
  } else {
    body.innerHTML = renderMockPreview(doc, pageLimit);
  }

  var footer = document.getElementById('pmFooter');
  if(isFree){
    footer.innerHTML = '<button class="pm-btn pm-btn-primary" onclick="closePreviewModal();openDocModal('+doc.id+')"><i class="bi bi-download"></i> Tải ngay</button>';
  } else {
    footer.innerHTML = '<span class="pm-price"><i class="bi bi-gem"></i> '+(doc.price/1000)+'K</span>'
      +'<button class="pm-btn pm-btn-premium" onclick="closePreviewModal();openDocModal('+doc.id+')"><i class="bi bi-cart-plus"></i> Mua đề</button>';
  }
  document.getElementById('docPreviewModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePreviewModal(){
  var m = document.getElementById('docPreviewModal');
  if(m){ m.classList.remove('active'); document.body.style.overflow=''; var f=m.querySelector('iframe'); if(f) f.src=''; }
}


/* ============================================================
   2) DOC MODAL — Tải (free) / Mua tự động (premium)
   ============================================================ */
function ensureDocModal(){
  if(document.getElementById('docActionModal')) return;
  var modal = document.createElement('div');
  modal.id = 'docActionModal';
  modal.className = 'preview-modal-overlay';
  modal.innerHTML = ''
    +'<div class="preview-modal dm-modal">'
      +'<div class="pm-header">'
        +'<div class="pm-title-wrap">'
          +'<div class="pm-icon" id="dmIcon"><i class="bi bi-download"></i></div>'
          +'<div>'
            +'<h5 class="pm-title" id="dmTitle"></h5>'
            +'<span class="pm-subtitle" id="dmSubtitle"></span>'
          +'</div>'
        +'</div>'
        +'<button class="pm-close" onclick="closeDocModal()"><i class="bi bi-x-lg"></i></button>'
      +'</div>'
      +'<div class="dm-content" id="dmContent"></div>'
    +'</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) closeDocModal(); });
}

function openDocModal(docId){
  ensureDocModal();
  var doc = findDocById(docId);
  if(!doc) return;
  var isFree = !doc.price;
  var subName = SUBJECT_MAP[doc.subject] || doc.subject;
  var qInfo = doc.questions ? doc.questions+' câu' : doc.pages+' trang';

  var iconEl = document.getElementById('dmIcon');
  if(isFree){
    iconEl.style.background = 'linear-gradient(135deg,var(--teal),#5B9BF2)';
    iconEl.innerHTML = '<i class="bi bi-download"></i>';
  } else {
    iconEl.style.background = 'linear-gradient(135deg,var(--grape),var(--coral))';
    iconEl.innerHTML = '<i class="bi bi-gem"></i>';
  }

  document.getElementById('dmTitle').textContent = doc.title;
  document.getElementById('dmSubtitle').innerHTML = '<i class="bi '+doc.icon+'"></i> '+subName
    +' · '+qInfo+' · '+(doc.format||'pdf').toUpperCase()+' · '+doc.pages+' trang';

  var content = document.getElementById('dmContent');
  if(isFree){
    content.innerHTML = renderFreeDocModal(doc);
  } else {
    
      _currentOrderCode = generateOrderCode(doc);
      _currentDocId = doc.id;
      content.innerHTML = renderPremiumDocModal(doc, _currentOrderCode);
      // Bắt đầu đếm ngược 15 phút
      startCountdown(15 * 60);
    }

  document.getElementById('docActionModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDocModal(){
  stopCountdown();
  var m = document.getElementById('docActionModal');
  if(m){ m.classList.remove('active'); document.body.style.overflow=''; var f=m.querySelector('iframe'); if(f) f.src=''; }
}


/* ---- Free modal ---- */
function renderFreeDocModal(doc){
  var previewHtml = '';
  if(doc.previewUrl){
    if(doc.format==='pdf'){
      previewHtml = '<iframe class="pm-pdf-frame" src="'+doc.previewUrl+'"></iframe>';
    } else {
      previewHtml = '<div class="pm-img-preview"><img src="'+doc.previewUrl+'" alt="Preview"></div>';
    }
  } else {
    previewHtml = renderMockPreview(doc, doc.pages);
  }

  return '<div class="dm-preview-section">'+previewHtml+'</div>'
    +'<div class="dm-free-footer">'
      +'<div class="dm-free-info">'
        +'<i class="bi bi-shield-check"></i>'
        +'<span>File '+doc.format.toUpperCase()+' · '+doc.pages+' trang · Miễn phí hoàn toàn</span>'
      +'</div>'
      +'<a href="'+(doc.downloadUrl||'#')+'" class="pm-btn pm-btn-primary dm-download-btn" '
        +(doc.downloadUrl?'download':'onclick="alert(\'Chức năng tải sẽ hoạt động khi có backend!\')"')+'>'
        +'<i class="bi bi-download"></i> Tải xuống miễn phí'
      +'</a>'
    +'</div>';
}


/* ============================================================
   PREMIUM MODAL — QR + đếm ngược + hiệu ứng kiểm tra "nhìn như thật"
   Admin duyệt tay phía sau, user thấy trải nghiệm tự động
   ============================================================ */
function renderPremiumDocModal(doc, orderCode){
  var previewHtml = '';
  if(doc.previewUrl){
    previewHtml = '<div class="pm-img-preview"><img src="'+doc.previewUrl+'" alt="Preview">'
      +'<div class="pm-lock-overlay"><div class="pm-lock-msg"><i class="bi bi-lock-fill"></i> Xem 1 trang · Mua để mở khoá</div></div></div>';
  } else {
    previewHtml = renderMockPreview(doc, 1);
  }

  var priceVnd = doc.price.toLocaleString('vi-VN') + 'đ';
  var qrUrl = 'https://img.vietqr.io/image/'+PAY_CONFIG.bankCode+'-'+PAY_CONFIG.accountNo+'-compact2.jpg?amount='+doc.price+'&addInfo='+encodeURIComponent(orderCode);

  return '<div class="dm-split">'
    /* ---- Cột trái: Preview ---- */
    +'<div class="dm-split-left">'
      +'<div class="dm-preview-section">'+previewHtml+'</div>'
      +'<div class="dm-buy-features">'
        +'<div class="dm-feat"><i class="bi bi-check-circle-fill"></i> '+(doc.questions?doc.questions+' câu hỏi + đáp án':'Tài liệu '+doc.pages+' trang')+'</div>'
        +'<div class="dm-feat"><i class="bi bi-check-circle-fill"></i> File '+doc.format.toUpperCase()+' chất lượng cao</div>'
        +'<div class="dm-feat"><i class="bi bi-check-circle-fill"></i> Tải về không giới hạn</div>'
        +'<div class="dm-feat"><i class="bi bi-check-circle-fill"></i> Mở khoá tự động sau khi xác nhận</div>'
      +'</div>'
    +'</div>'
    /* ---- Cột phải: Thanh toán ---- */
    +'<div class="dm-split-right">'
      /* Đếm ngược */
      +'<div class="dm-timer-bar" id="dmTimerBar">'
        +'<i class="bi bi-clock"></i>'
        +'<span>Thời gian thanh toán còn: </span>'
        +'<span class="dm-timer-count" id="dmTimerCount">15:00</span>'
      +'</div>'
      /* QR lớn */
      +'<div class="dm-qr-center">'
        +'<div class="dm-qr-box-lg" id="dmQrBank">'
          +'<img class="dm-qr-img-lg" src="'+qrUrl+'" alt="QR Thanh toán" onerror="this.parentElement.innerHTML=renderQrFallback()" />'
        +'</div>'
        +'<div class="dm-qr-hint">Quét bằng app Ngân hàng / Ví điện tử</div>'
      +'</div>'
      /* Thông tin CK */
      +'<div class="dm-pay-rows">'
        +'<div class="dm-pay-row"><span>Ngân hàng</span><span class="fw-semibold">'+PAY_CONFIG.bankName+'</span></div>'
        +'<div class="dm-pay-row"><span>Số tiền</span><span style="color:var(--coral);font-weight:700">'+priceVnd+'</span></div>'
        +'<div class="dm-pay-row dm-pay-row-hl"><span>Nội dung CK</span><span style="color:var(--teal);font-weight:600"><i class="bi bi-qr-code-scan"></i> Tự động khi quét QR</span></div>'
      /* FORM XÁC NHẬN ĐÃ CK */
      +'<div class="dm-confirm-section" id="dmConfirmSection">'
        +'<div class="dm-confirm-title"><i class="bi bi-send-check"></i> Đã chuyển khoản? Xác nhận tại đây</div>'
        +'<div class="dm-confirm-form">'
          +'<div class="dm-form-row">'
            +'<input type="text" class="dm-input" id="dmCustInfo" placeholder="Email hoặc Họ tên (để hỗ trợ nếu lỗi) *">'
          +'</div>'
          +'<div class="dm-form-row">'
            +'<input type="text" class="dm-input" id="dmCustTxContent" placeholder="Dán nội dung CK từ app ngân hàng vào đây *" value="" style="font-family:monospace;font-weight:600">'
          +'<button class="dm-btn-confirm" onclick="submitPaymentConfirm('+doc.id+',\''+orderCode+'\','+doc.price+')">'
            +'<i class="bi bi-check2-circle"></i> Tôi đã chuyển khoản'
          +'</button>'
        +'</div>'
      +'</div>'
      /* TRẠNG THÁI KIỂM TRA — ẩn ban đầu, hiệu ứng nhìn như thật */
      +'<div class="dm-payment-status" id="dmPaymentStatus" style="display:none">'
        /* Bước 1: Đang kiểm tra (spinner) */
        +'<div class="dm-status-checking" id="dmStatusChecking">'
          +'<div class="dm-status-spinner"></div>'
          +'<div>'
            +'<div class="dm-status-text" id="dmCheckingText">Đang kiểm tra giao dịch...</div>'
            +'<div class="dm-status-sub" id="dmCheckingSub">Hệ thống đang xác minh chuyển khoản của bạn</div>'
          +'</div>'
        +'</div>'
        /* Bước 2: Đang xử lý (sau vài giây) */
        +'<div class="dm-status-processing" id="dmStatusProcessing" style="display:none">'
          +'<div class="dm-status-icon-process"><i class="bi bi-gear-wide-connected"></i></div>'
          +'<div>'
            +'<div class="dm-status-text" style="color:var(--grape)">Đang xử lý giao dịch...</div>'
            +'<div class="dm-status-sub">Đã nhận thông tin. Đề sẽ <strong>tự động mở khoá trong vài phút</strong> sau khi xác nhận.</div>'
          +'</div>'
        +'</div>'
        /* Bước 3: Thành công (khi admin duyệt) */
        +'<div class="dm-status-success" id="dmStatusSuccess" style="display:none">'
          +'<div class="dm-status-icon-ok"><i class="bi bi-check-circle-fill"></i></div>'
          +'<div>'
            +'<div class="dm-status-text" style="color:var(--teal)">Thanh toán thành công!</div>'
            +'<div class="dm-status-sub">Đề thi đã mở khoá. Bấm nút bên dưới để tải.</div>'
          +'</div>'
        +'</div>'
      +'</div>'
      /* Ghi chú mã đơn — sau khi xác nhận */
      +'<div class="dm-order-reminder" id="dmOrderReminder" style="display:none">'
        +'<i class="bi bi-bookmark-check-fill"></i>'
        +'<span>Lưu mã <strong>'+orderCode+'</strong> để tra cứu đơn nếu cần.</span>'
      +'</div>'
      /* Nút tải — ẩn ban đầu */
      +'<div class="dm-download-after-pay" id="dmDownloadBtn" style="display:none">'
        +'<a href="'+(doc.downloadUrl||'#')+'" id="dmDownloadLink" class="pm-btn pm-btn-primary" style="width:100%;justify-content:center;padding:.8rem" '
          +(doc.downloadUrl?'download':'onclick="alert(\'File sẽ được gửi qua Zalo/Email khi có backend!\')"')+'>'
          +'<i class="bi bi-download"></i> Tải xuống đề thi'
        +'</a>'
      +'</div>'
      /* Nút tra cứu */
      +'<div class="dm-lookup-link">'
        +'<span>Đã mua trước đó?</span> '
        +'<a href="#" onclick="event.preventDefault();openOrderLookup()">Tra cứu đơn hàng →</a>'
      +'</div>'
      +'<div style="text-align:center;margin-top:.5rem">'
        +'<a href="#" onclick="event.preventDefault();openReportIssue(\''+orderCode+'\')" style="font-size:.82rem;color:#94A3B8;text-decoration:none"><i class="bi bi-flag me-1"></i>Gặp sự cố? Báo cáo tại đây</a>'
      +'</div>'
    +'</div>'
  +'</div>';
}


/* ============================================================
   MODAL ĐÃ MUA RỒI — khi đề đã được duyệt trước đó
   ============================================================ */
function renderAlreadyPurchasedModal(doc){
  var previewHtml = doc.previewUrl
    ? '<div class="pm-img-preview"><img src="'+doc.previewUrl+'" alt="Preview"></div>'
    : renderMockPreview(doc, doc.pages);

  return '<div class="dm-already-bought">'
    +'<div class="dm-bought-icon"><i class="bi bi-patch-check-fill"></i></div>'
    +'<h5>Bạn đã mua đề này rồi!</h5>'
    +'<p>Đề thi đã được mở khoá. Bạn có thể tải bất cứ lúc nào.</p>'
    +'<a href="'+(doc.downloadUrl||'#')+'" class="pm-btn pm-btn-primary" style="width:100%;justify-content:center;padding:.8rem;margin-top:1rem" '
      +(doc.downloadUrl?'download':'onclick="alert(\'File sẽ được gửi qua Zalo/Email khi có backend!\')"')+'>'
      +'<i class="bi bi-download"></i> Tải xuống đề thi'
    +'</a>'
  +'</div>';
}


/* ============================================================
   XÁC NHẬN ĐÃ CHUYỂN KHOẢN — Hiệu ứng "nhìn như thật"
   Spinner → "Đang kiểm tra" → "Đang xử lý" → chờ admin duyệt
   ============================================================ */
function submitPaymentConfirm(docId, orderCode, amount){
  var info = document.getElementById('dmCustInfo').value.trim();
  var txContent = document.getElementById('dmCustTxContent').value.trim();

  if(!info){ shakeInput('dmCustInfo'); return; }
  if(!txContent){ shakeInput('dmCustTxContent'); return; }

  var doc = findDocById(docId);
  var order = {
    orderCode: orderCode,
    docId: docId,
    docTitle: doc ? doc.title : 'Đề #'+docId,
    amount: amount,
    customerInfo: info,
    txContent: txContent,
    status: 'pending',
    createdAt: new Date().toLocaleString('vi-VN'),
    approvedBy: null,
    approvedAt: null
  };

  OrderStore.add(order);

  // Ẩn form, dừng đếm ngược
  var form = document.getElementById('dmConfirmSection');
  if(form) form.style.display = 'none';
  stopCountdown();
  var timerBar = document.getElementById('dmTimerBar');
  if(timerBar) timerBar.style.display = 'none';

  // Cập nhật steps → bước 2
  var s1 = document.getElementById('dmStep1');
  var s2 = document.getElementById('dmStep2');
  if(s1) s1.classList.add('done');
  if(s2) s2.classList.add('active');

  // Hiện trạng thái kiểm tra
  var statusEl = document.getElementById('dmPaymentStatus');
  if(statusEl) statusEl.style.display = '';

  // Hiện ghi chú mã đơn
  var reminder = document.getElementById('dmOrderReminder');
  if(reminder) reminder.style.display = '';

  // === CHUỖI HIỆU ỨNG "NHÌN NHƯ THẬT" ===
  var checkText = document.getElementById('dmCheckingText');
  var checkSub = document.getElementById('dmCheckingSub');

  // Giai đoạn 1: "Đang kiểm tra giao dịch..." (0-3s)
  setTimeout(function(){
    if(checkText) checkText.textContent = 'Đang kết nối hệ thống ngân hàng...';
    if(checkSub) checkSub.textContent = 'Xác minh nội dung chuyển khoản: ' + txContent;
  }, 2000);

  // Giai đoạn 2: "Đã nhận thông tin..." (3-6s)
  setTimeout(function(){
    if(checkText) checkText.textContent = 'Đã nhận thông tin giao dịch';
    if(checkSub) checkSub.innerHTML = 'Mã <strong>' + orderCode + '</strong> đang được xác minh...';
  }, 4500);

  // Giai đoạn 3: Chuyển sang "Đang xử lý" (6s+)
  setTimeout(function(){
    var checking = document.getElementById('dmStatusChecking');
    var processing = document.getElementById('dmStatusProcessing');
    if(checking) checking.style.display = 'none';
    if(processing) processing.style.display = '';

    // Cập nhật step 2 done, step 3 active
    if(s2){ s2.classList.add('done'); s2.classList.remove('active'); }
    var s3 = document.getElementById('dmStep3');
    if(s3) s3.classList.add('active');
  }, 7000);

  showToast('Đã gửi xác nhận! Hệ thống đang xử lý...');

  // Bắt đầu kiểm tra localStorage xem admin đã duyệt chưa (mỗi 5s)
  startApprovalCheck(orderCode, docId);
}

/* Kiểm tra liên tục xem admin đã duyệt chưa */
var _approvalCheckTimer = null;
function startApprovalCheck(orderCode, docId){
  if(_approvalCheckTimer) clearInterval(_approvalCheckTimer);
  _approvalCheckTimer = setInterval(function(){
    var order = OrderStore.findByCode(orderCode);
    if(order && order.status === 'approved'){
      clearInterval(_approvalCheckTimer);
      _approvalCheckTimer = null;
      // Hiện thành công!
      var checking = document.getElementById('dmStatusChecking');
      var processing = document.getElementById('dmStatusProcessing');
      var success = document.getElementById('dmStatusSuccess');
      var dlBtn = document.getElementById('dmDownloadBtn');
      if(checking) checking.style.display = 'none';
      if(processing) processing.style.display = 'none';
      if(success) success.style.display = '';
      if(dlBtn) dlBtn.style.display = '';

      // Steps: tất cả done
      ['dmStep1','dmStep2','dmStep3'].forEach(function(id){
        var el = document.getElementById(id);
        if(el){ el.classList.add('done'); el.classList.remove('active'); }
      });

      showToast('🎉 Đề thi đã mở khoá! Bấm tải ngay.');
    }
  }, 5000);
}

/* ============================================================
   ĐẾM NGƯỢC 15 PHÚT
   ============================================================ */
function startCountdown(seconds){
  stopCountdown();
  _countdownSeconds = seconds;
  updateTimerDisplay();
  _countdownTimer = setInterval(function(){
    _countdownSeconds--;
    if(_countdownSeconds <= 0){
      _countdownSeconds = 0;
      stopCountdown();
      // Hết giờ → ẩn form, hiện thông báo
      var form = document.getElementById('dmConfirmSection');
      if(form) form.innerHTML = '<div style="text-align:center;padding:.8rem;color:var(--coral)">'
        +'<i class="bi bi-clock-history" style="font-size:1.5rem"></i>'
        +'<div style="font-weight:700;margin-top:.3rem">Hết thời gian thanh toán</div>'
        +'<div style="font-size:.82rem;color:var(--ink-soft);margin-top:.2rem">Vui lòng đóng và mở lại để tạo đơn mới.</div>'
        +'</div>';
    }
    updateTimerDisplay();
  }, 1000);
}

function stopCountdown(){
  if(_countdownTimer){ clearInterval(_countdownTimer); _countdownTimer = null; }
}

function updateTimerDisplay(){
  var el = document.getElementById('dmTimerCount');
  var bar = document.getElementById('dmTimerBar');
  if(!el) return;
  var m = Math.floor(_countdownSeconds / 60);
  var s = _countdownSeconds % 60;
  el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  if(bar){
    if(_countdownSeconds <= 60) bar.className = 'dm-timer-bar urgent';
    else if(_countdownSeconds <= 180) bar.className = 'dm-timer-bar warning';
    else bar.className = 'dm-timer-bar';
  }
}

function shakeInput(id){
  var el = document.getElementById(id);
  if(!el) return;
  el.style.borderColor = 'var(--coral)';
  el.classList.add('shake');
  el.focus();
  setTimeout(function(){ el.classList.remove('shake'); }, 500);
}

function showToast(msg){
  var existing = document.querySelector('.got-copy-toast');
  if(existing) existing.remove();
  var toast = document.createElement('div');
  toast.className = 'got-copy-toast';
  toast.innerHTML = '<i class="bi bi-check-circle-fill"></i> ' + msg;
  document.body.appendChild(toast);
  setTimeout(function(){ toast.remove(); }, 3500);
}


/* ============================================================
   TRA CỨU ĐƠN HÀNG — Người dùng nhập mã để kiểm tra
   ============================================================ */
function openOrderLookup(){
  closeDocModal();
  // Tạo modal tra cứu
  var existing = document.getElementById('orderLookupModal');
  if(existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'orderLookupModal';
  modal.className = 'preview-modal-overlay active';
  modal.innerHTML = ''
    +'<div class="preview-modal" style="max-width:480px">'
      +'<div class="pm-header">'
        +'<div class="pm-title-wrap">'
          +'<div class="pm-icon" style="background:linear-gradient(135deg,var(--sky),var(--grape))"><i class="bi bi-search"></i></div>'
          +'<div>'
            +'<h5 class="pm-title">Tra cứu đơn hàng</h5>'
            +'<span class="pm-subtitle">Nhập mã đơn hàng để kiểm tra trạng thái</span>'
          +'</div>'
        +'</div>'
        +'<button class="pm-close" onclick="closeLookupModal()"><i class="bi bi-x-lg"></i></button>'
      +'</div>'
      +'<div style="padding:1.5rem">'
        +'<div class="dm-form-row" style="margin-bottom:1rem">'
          +'<input type="text" class="dm-input" id="lookupCode" placeholder="Nhập mã đơn hàng (VD: LYDS02ABC123)" style="text-transform:uppercase">'
        +'</div>'
        +'<button class="dm-btn-confirm" onclick="doOrderLookup()" style="margin-bottom:1rem">'
          +'<i class="bi bi-search"></i> Tra cứu'
        +'</button>'
        +'<div id="lookupResult"></div>'
      +'</div>'
    +'</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) closeLookupModal(); });
  document.body.style.overflow = 'hidden';
}

function closeLookupModal(){
  var m = document.getElementById('orderLookupModal');
  if(m){ m.remove(); document.body.style.overflow=''; }
}

function doOrderLookup(){
  var code = document.getElementById('lookupCode').value.trim().toUpperCase();
  var resultEl = document.getElementById('lookupResult');
  if(!code){ resultEl.innerHTML = '<div style="color:var(--coral);font-size:.88rem"><i class="bi bi-exclamation-circle"></i> Vui lòng nhập mã đơn hàng</div>'; return; }

  var order = OrderStore.findByCode(code);
  if(!order){
    resultEl.innerHTML = '<div class="dm-lookup-result not-found">'
      +'<i class="bi bi-x-circle" style="font-size:2rem;color:var(--coral)"></i>'
      +'<p style="font-weight:600">Không tìm thấy đơn hàng</p>'
      +'<p style="font-size:.85rem;color:var(--ink-soft)">Mã <strong>'+code+'</strong> không tồn tại. Vui lòng kiểm tra lại.</p>'
    +'</div>';
    return;
  }

  var statusMap = {
    pending: { icon:'bi-hourglass-split', color:'var(--amber)', label:'Đang chờ Admin duyệt', desc:'Admin sẽ kiểm tra chuyển khoản và duyệt trong ít phút.' },
    approved: { icon:'bi-check-circle-fill', color:'var(--teal)', label:'Đã duyệt — Sẵn sàng tải!', desc:'Đề thi đã mở khoá. Bạn có thể tải ngay.' },
    rejected: { icon:'bi-x-circle-fill', color:'var(--coral)', label:'Bị từ chối', desc:'Chuyển khoản chưa khớp. Vui lòng liên hệ Admin.' }
  };
  var s = statusMap[order.status] || statusMap.pending;

  var downloadHtml = '';
  if(order.status === 'approved'){
    var doc = findDocById(order.docId);
    downloadHtml = '<a href="'+(doc && doc.downloadUrl ? doc.downloadUrl : '#')+'" class="pm-btn pm-btn-primary" style="width:100%;justify-content:center;padding:.7rem;margin-top:.8rem" '
      +(doc && doc.downloadUrl ? 'download' : 'onclick="alert(\'File sẽ được gửi qua Zalo/Email khi có backend!\')"')+'>'
      +'<i class="bi bi-download"></i> Tải xuống đề thi</a>';
  }

  resultEl.innerHTML = '<div class="dm-lookup-result">'
    +'<div style="display:flex;align-items:center;gap:.7rem;margin-bottom:.8rem">'
      +'<i class="bi '+s.icon+'" style="font-size:1.8rem;color:'+s.color+'"></i>'
      +'<div><div style="font-weight:700;color:'+s.color+'">'+s.label+'</div>'
      +'<div style="font-size:.82rem;color:var(--ink-soft)">'+s.desc+'</div></div>'
    +'</div>'
    +'<div class="dm-pay-rows" style="margin-bottom:0">'
      +'<div class="dm-pay-row"><span>Mã đơn</span><span style="font-weight:700;font-family:monospace">'+order.orderCode+'</span></div>'
      +'<div class="dm-pay-row"><span>Đề thi</span><span style="font-weight:600">'+order.docTitle+'</span></div>'
      +'<div class="dm-pay-row"><span>Số tiền</span><span style="font-weight:700;color:var(--coral)">'+(order.amount?order.amount.toLocaleString('vi-VN')+'đ':'Miễn phí')+'</span></div>'
      +'<div class="dm-pay-row"><span>Ngày đặt</span><span>'+order.createdAt+'</span></div>'
      +(order.approvedAt ? '<div class="dm-pay-row"><span>Ngày duyệt</span><span style="color:var(--teal)">'+order.approvedAt+'</span></div>' : '')
    +'</div>'
    +downloadHtml
  +'</div>';
}


/* ============================================================
   TIỆN ÍCH MODAL
   ============================================================ */
/* QR fallback khi VietQR API không load được */
function renderQrFallback(){
  return renderQrSvg('#0F172A','#1E40AF','#F0F4FA');
}
function renderQrSvg(fill, accent, bg){
  return '<svg viewBox="0 0 160 160" width="130" height="130" xmlns="http://www.w3.org/2000/svg">'
    +'<rect width="160" height="160" rx="10" fill="'+bg+'"/>'
    +'<rect x="14" y="14" width="38" height="38" rx="4" fill="'+fill+'"/>'
    +'<rect x="108" y="14" width="38" height="38" rx="4" fill="'+fill+'"/>'
    +'<rect x="14" y="108" width="38" height="38" rx="4" fill="'+fill+'"/>'
    +'<rect x="22" y="22" width="22" height="22" rx="2" fill="'+bg+'"/>'
    +'<rect x="116" y="22" width="22" height="22" rx="2" fill="'+bg+'"/>'
    +'<rect x="22" y="116" width="22" height="22" rx="2" fill="'+bg+'"/>'
    +'<rect x="28" y="28" width="10" height="10" rx="1" fill="'+fill+'"/>'
    +'<rect x="122" y="28" width="10" height="10" rx="1" fill="'+fill+'"/>'
    +'<rect x="28" y="122" width="10" height="10" rx="1" fill="'+fill+'"/>'
    +'<rect x="62" y="62" width="10" height="10" rx="2" fill="'+accent+'"/>'
    +'<rect x="76" y="62" width="10" height="10" rx="2" fill="'+accent+'"/>'
    +'<rect x="62" y="76" width="10" height="10" rx="2" fill="'+fill+'"/>'
    +'<rect x="76" y="76" width="10" height="10" rx="2" fill="'+accent+'"/>'
    +'<text x="80" y="155" text-anchor="middle" font-size="6" fill="'+fill+'" opacity=".5">QR Demo</text>'
    +'</svg>';
}

/* ---- Mock preview pages ---- */
function renderMockPreview(doc, pageLimit){
  var html = '';
  var totalShow = Math.min(pageLimit, 3);
  var isFree = !doc.price;
  var grad = doc.gradient || ['#1E40AF','#3B82F6'];
  var subName = SUBJECT_MAP[doc.subject] || doc.subject;
  for(var i=0; i<totalShow; i++){
    html += '<div class="pm-mock-page"><div class="pm-page-num">Trang '+(i+1)+'</div>';
    if(i===0){
      html += '<div class="pm-mock-header" style="border-left-color:'+grad[0]+'">'
        +'<div class="pm-mock-title-line" style="width:75%"></div>'
        +'<div class="pm-mock-title-line sub" style="width:45%"></div></div>'
        +'<div class="pm-mock-info"><span>'+subName+'</span><span>'+doc.year+'</span><span>'+(doc.questions?doc.questions+' câu':doc.pages+' trang')+'</span></div>';
    }
    for(var j=0; j<(i===0?4:6); j++){
      html += '<div class="pm-mock-line" style="width:'+Math.round(70+Math.random()*28)+'%"></div>';
    }
    html += '<div class="pm-mock-line short" style="width:'+Math.round(30+Math.random()*25)+'%"></div></div>';
  }
  if(!isFree){
    html += '<div class="pm-premium-wall"><div class="pm-wall-content">'
      +'<div class="pm-wall-icon"><i class="bi bi-lock-fill"></i></div>'
      +'<h6>Tài liệu Premium</h6><p>Mua để xem toàn bộ '+doc.pages+' trang</p></div></div>';
  }
  return '<div class="pm-mock-wrap'+(isFree?'':' has-wall')+'">'+html+'</div>';
}

/* ---- BÁO CÁO SỰ CỐ THANH TOÁN ---- */
function openReportIssue(orderCode){
  var old = document.getElementById('reportIssuePopup');
  if(old) old.remove();

  var popup = document.createElement('div');
  popup.id = 'reportIssuePopup';
  popup.style.cssText = 'position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);opacity:0;transition:.25s';
  popup.innerHTML = ''
    +'<div style="background:#fff;border-radius:20px;padding:1.8rem;width:420px;max-width:92vw;box-shadow:0 20px 60px -12px rgba(15,23,42,.3);transform:scale(.9);transition:.3s cubic-bezier(.2,.7,.3,1)" id="reportBox">'
      +'<div style="display:flex;align-items:center;gap:.6rem;margin-bottom:1rem">'
        +'<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#EF4444,#F97316);display:grid;place-items:center;color:#fff"><i class="bi bi-flag-fill"></i></div>'
        +'<h5 style="margin:0;font-weight:700;font-size:1.05rem;flex:1">Báo cáo sự cố</h5>'
        +'<button onclick="closeReportIssue()" style="background:none;border:none;font-size:1.2rem;color:#94A3B8;cursor:pointer"><i class="bi bi-x-lg"></i></button>'
      +'</div>'
      +'<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:.7rem .9rem;margin-bottom:1rem;font-size:.82rem;color:#991B1B;display:flex;align-items:center;gap:.5rem">'
        +'<i class="bi bi-info-circle"></i> Mô tả sự cố để admin hỗ trợ nhanh nhất'
      +'</div>'
      +'<label style="font-size:.82rem;font-weight:600;color:#64748B;display:block;margin-bottom:.3rem">Mã đơn hàng</label>'
      +'<input type="text" id="reportOrder" value="'+(orderCode||'')+'" readonly style="width:100%;padding:.6rem .9rem;border:2px solid #E2E8F0;border-radius:12px;font-size:.9rem;font-family:monospace;font-weight:600;background:#F8FAFC;color:#64748B;outline:none;margin-bottom:.8rem">'
      +'<label style="font-size:.82rem;font-weight:600;color:#64748B;display:block;margin-bottom:.3rem">Zalo hoặc Email liên hệ *</label>'
      +'<input type="text" id="reportContact" placeholder="Số Zalo hoặc email..." style="width:100%;padding:.6rem .9rem;border:2px solid #E2E8F0;border-radius:12px;font-size:.9rem;font-family:inherit;outline:none;transition:.2s;margin-bottom:.8rem" onfocus="this.style.borderColor=\'#3B82F6\'" onblur="this.style.borderColor=\'#E2E8F0\'">'
      +'<label style="font-size:.82rem;font-weight:600;color:#64748B;display:block;margin-bottom:.3rem">Loại sự cố *</label>'
      +'<div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.8rem" id="reportTags">'
        +'<button class="rp-tag" onclick="selectTag(this)">Đã CK nhưng chưa duyệt</button>'
        +'<button class="rp-tag" onclick="selectTag(this)">QR không quét được</button>'
        +'<button class="rp-tag" onclick="selectTag(this)">Sai số tiền</button>'
        +'<button class="rp-tag" onclick="selectTag(this)">Không nhận được file</button>'
        +'<button class="rp-tag" onclick="selectTag(this)">Lỗi khác</button>'
      +'</div>'
      +'<label style="font-size:.82rem;font-weight:600;color:#64748B;display:block;margin-bottom:.3rem">Mô tả thêm</label>'
      +'<textarea id="reportDesc" rows="3" placeholder="Chi tiết sự cố..." style="width:100%;padding:.6rem .9rem;border:2px solid #E2E8F0;border-radius:12px;font-size:.9rem;font-family:inherit;outline:none;resize:vertical;transition:.2s" onfocus="this.style.borderColor=\'#3B82F6\'" onblur="this.style.borderColor=\'#E2E8F0\'"></textarea>'
      +'<div style="display:flex;gap:.6rem;margin-top:1.2rem">'
        +'<button onclick="closeReportIssue()" style="flex:1;padding:.65rem;border:2px solid #E2E8F0;background:#fff;border-radius:12px;font-weight:600;font-size:.9rem;color:#64748B;cursor:pointer;font-family:inherit">Huỷ</button>'
        +'<button onclick="submitReport()" style="flex:1;padding:.65rem;border:none;background:linear-gradient(135deg,#EF4444,#F97316);border-radius:12px;font-weight:600;font-size:.9rem;color:#fff;cursor:pointer;font-family:inherit;box-shadow:0 4px 14px -4px rgba(239,68,68,.4)"><i class="bi bi-send me-1"></i>Gửi báo cáo</button>'
      +'</div>'
    +'</div>';

  popup.addEventListener('click', function(e){ if(e.target===popup) closeReportIssue(); });
  document.body.appendChild(popup);
  requestAnimationFrame(function(){
    popup.style.opacity='1';
    document.getElementById('reportBox').style.transform='scale(1)';
  });
}

function closeReportIssue(){
  var el = document.getElementById('reportIssuePopup');
  if(!el) return;
  var box = document.getElementById('reportBox');
  if(box) box.style.transform='scale(.9)';
  el.style.opacity='0';
  setTimeout(function(){ el.remove(); },300);
}

function selectTag(btn){
  var all = document.querySelectorAll('#reportTags .rp-tag');
  for(var i=0;i<all.length;i++) all[i].classList.remove('selected');
  btn.classList.add('selected');
}

function submitReport(){
  var contact = (document.getElementById('reportContact')||{}).value.trim();
  var tags = document.querySelector('#reportTags .rp-tag.selected');
  var desc = (document.getElementById('reportDesc')||{}).value.trim();
  var order = (document.getElementById('reportOrder')||{}).value.trim();
  if(!contact){
    document.getElementById('reportContact').style.borderColor='#EF4444';
    return;
  }
  if(!tags){
    alert('Vui lòng chọn loại sự cố');
    return;
  }
  /* Lưu vào localStorage */
  var reports = JSON.parse(localStorage.getItem('got_reports')||'[]');
  reports.push({
    id: Date.now(),
    orderCode: order,
    contact: contact,
    type: tags.textContent.trim(),
    desc: desc,
    status: 'pending',
    time: Date.now()
  });
  localStorage.setItem('got_reports', JSON.stringify(reports));

  var box = document.getElementById('reportBox');
  if(box) box.innerHTML = ''
    +'<div style="text-align:center;padding:2rem 1rem">'
      +'<div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#059669,#10B981);display:grid;place-items:center;color:#fff;font-size:1.5rem;margin:0 auto .8rem;box-shadow:0 8px 20px -6px rgba(5,150,105,.4)"><i class="bi bi-check-lg"></i></div>'
      +'<h6 style="font-weight:700;margin:0 0 .4rem">Đã gửi báo cáo!</h6>'
      +'<p style="color:#64748B;font-size:.88rem;margin:0 0 1rem">Admin sẽ liên hệ bạn qua <strong>'+contact+'</strong> trong thời gian sớm nhất.</p>'
      +'<button onclick="closeReportIssue()" style="padding:.55rem 1.5rem;border:none;background:linear-gradient(135deg,#1E40AF,#2563EB);border-radius:12px;font-weight:600;color:#fff;cursor:pointer;font-family:inherit">Đóng</button>'
    +'</div>';
}
