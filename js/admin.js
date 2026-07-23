var ADMIN_ACCOUNTS = [
  { user: 'admin', pass: 'chau@123' },
  { user: 'goconthi', pass: 'chau@123' }
];

function adminLogin(){
  var user = (document.getElementById('adminUser')||{}).value.trim();
  var pass = (document.getElementById('adminPass')||{}).value.trim();
  var err = document.getElementById('adminLoginError');

  if(!user || !pass){
    err.textContent = 'Vui lòng nhập đầy đủ thông tin';
    err.style.display = '';
    return;
  }

  var found = false;
  for(var i=0; i<ADMIN_ACCOUNTS.length; i++){
    if(ADMIN_ACCOUNTS[i].user === user && ADMIN_ACCOUNTS[i].pass === pass){
      found = true; break;
    }
  }

  if(!found){
    err.textContent = 'Sai tài khoản hoặc mật khẩu!';
    err.style.display = '';
    document.getElementById('adminPass').value = '';
    return;
  }

  /* Lưu session */
  localStorage.setItem('admin_session', JSON.stringify({user: user, loginAt: Date.now()}));
  document.getElementById('adminLoginGate').style.opacity = '0';
  setTimeout(function(){ document.getElementById('adminLoginGate').style.display = 'none'; }, 300);
}

/* Tự check session khi load */
(function(){
  var session = JSON.parse(localStorage.getItem('admin_session')||'null');
  if(session){
    var gate = document.getElementById('adminLoginGate');
    if(gate) gate.style.display = 'none';
  }
})();

function adminLogout(){
  if(!confirm('Đăng xuất khỏi Admin?')) return;
  localStorage.removeItem('admin_session');
  location.reload();
}

// ========================================
// DATA LAYER (thay bằng API calls khi có backend)
// ========================================
var SUBJECTS={toan:'Toán',ly:'Vật lý',hoa:'Hoá học',sinh:'Sinh học',anh:'Tiếng Anh',van:'Ngữ văn',su:'Lịch sử',dia:'Địa lý',gdktpl:'GD KT&PL'};
var TYPES={so:'Đề Sở',dungsai:'Đúng sai',minhhoa:'Minh hoạ',tomtat:'Tóm tắt'};
var CATEGORIES={toan:'Toán',ly:'Vật lý',hoa:'Hoá học',sinh:'Sinh học',anh:'Tiếng Anh',van:'Ngữ văn',su:'Lịch sử',dia:'Địa lý',phuongphap:'Phương pháp',suckhoe:'Sức khoẻ',kinhnghiem:'Kinh nghiệm'};
var TABS={dashboard:'Dashboard',documents:'Quản lý đề thi',posts:'Bài viết Góc sĩ tử',orders:'Lịch sử đơn hàng',reports:'Báo cáo sự cố',settings:'Cài đặt'};

var docsData=[];
var postsData=[
  {id:1,title:'5 mẹo giải nhanh Hàm số trong 30 giây',category:'toan',author:'Minh Tuấn',excerpt:'Kỹ thuật giải nhanh hàm bậc 3, bậc 4 mà không cần bảng biến thiên đầy đủ.',cover:null,tags:['toán','hàm số','mẹo'],status:'published',createdAt:'2026-07-10'},
  {id:2,title:'Nhớ công thức Lý 12 bằng sơ đồ tư duy',category:'ly',author:'Ngọc Lan',excerpt:'Mind map giúp nhớ lâu hơn 3 lần. Áp dụng cho Dao động và Sóng.',cover:null,tags:['vật lý','mind map'],status:'published',createdAt:'2026-07-08'},
  {id:3,title:'Từ 5 lên 8+ điểm Hoá chỉ trong 2 tháng',category:'hoa',author:'Hải Nam',excerpt:'Lộ trình thực tế từ sĩ tử tăng 3 điểm nhờ phân loại phản ứng.',cover:null,tags:['hoá học','kinh nghiệm'],status:'published',createdAt:'2026-07-05'},
  {id:4,title:'Bí quyết 9+ Tiếng Anh cho người trung bình',category:'anh',author:'Thu Trang',excerpt:'45 phút/ngày, không cần học thêm. Từ bạn đạt 9.6 điểm.',cover:null,tags:['tiếng anh'],status:'published',createdAt:'2026-07-02'},
  {id:5,title:'Pomodoro: ôn thi gấp đôi, không kiệt sức',category:'phuongphap',author:'Khánh Duy',excerpt:'Học 25 phút — nghỉ 5 phút. Hiệu quả bất ngờ khi ôn marathon.',cover:null,tags:['phương pháp','pomodoro'],status:'published',createdAt:'2026-06-28'},
  {id:6,title:'Quản lý stress mùa thi: ăn, ngủ, nghỉ',category:'suckhoe',author:'BS Minh',excerpt:'Chế độ ăn ngủ và giải stress khoa học cho sĩ tử.',cover:null,tags:['sức khoẻ','stress'],status:'published',createdAt:'2026-06-25'},
  {id:7,title:'Cách ôn Sinh hiệu quả khi còn 1 tháng',category:'sinh',author:'Admin',excerpt:'Đang viết...',cover:null,tags:['sinh học'],status:'draft',createdAt:'2026-07-15'}
];
// Trạng thái đơn hàng (localStorage):
// pending  = Khách đã bấm "Tôi đã CK" nhưng Admin chưa duyệt
// approved = Admin đã duyệt → đề mở khoá cho khách tải
// rejected = Admin từ chối (CK sai hoặc không thấy tiền)
var ORDERS_KEY='goconthi_orders';
function loadOrdersFromStorage(){
  try{ return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; }
  catch(e){ return []; }
}
function saveOrdersToStorage(orders){
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}
// Chuyển đổi format từ localStorage sang format admin table
function getOrdersData(){
  var raw = loadOrdersFromStorage();
  return raw.map(function(o,i){
    return {
      id: 'DH' + String(i+1).padStart(3,'0'),
      orderCode: o.orderCode,
      docTitle: o.docTitle || 'Đề #'+o.docId,
      docId: o.docId,
      txCode: o.orderCode,
      amount: o.amount || 0,
      time: o.createdAt || '',
      status: o.status === 'approved' ? 'approved' : (o.status === 'rejected' ? 'rejected' : 'pending'),
      customerInfo: o.customerInfo || o.customerName || '',
      txContent: o.txContent || o.orderCode || '',
      approvedBy: o.approvedBy || null,
      approvedAt: o.approvedAt || null
    };
  });
}
var ordersData = getOrdersData();

// Cập nhật đơn hàng → đồng bộ localStorage
function refreshOrders(){
  ordersData = getOrdersData();
}

// Số đơn treo — dùng cho notification
var _lastPendingCount = 0;

// State
var currentDocFilter='all';
var currentDocSearch='';
var currentPostFilter='all';
var currentPostSearch='';
var currentOrderFilter='all';
var currentOrderSearch='';
var postTags=[];
var editingDocId=null;
var editingPostId=null;

// ========================================
// TAB NAVIGATION
// ========================================
function showTab(tab){
  Object.keys(TABS).forEach(function(t){
    var el=document.getElementById('tab-'+t);
    if(el) el.style.display = t===tab ? '' : 'none';
  });
  document.getElementById('pageTitle').textContent=TABS[tab]||tab;
  document.querySelectorAll('.sb-nav a').forEach(function(a){
    a.classList.toggle('active',a.dataset.tab===tab);
  });
  if(tab==='documents') renderDocTable();
  if(tab==='posts') renderPostTable();
  if(tab==='orders') renderOrderTable();
  if(tab==='dashboard') renderDashboard();
  if(tab==='reports') renderReports();
}
document.querySelectorAll('.sb-nav a').forEach(function(a){
  a.addEventListener('click',function(e){
    e.preventDefault();
    showTab(this.dataset.tab);
  });
});

// ========================================
// TOAST
// ========================================
function toast(msg){
  var t=document.getElementById('toast');
  document.getElementById('toastText').textContent=msg;
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')},2500);
}

// ========================================
// DOCUMENTS
// ========================================
function loadDocsData(){
  fetch('data/documents.json')
    .then(function(r){return r.json()})
    .then(function(d){docsData=d;renderDocTable();renderDashboard();})
    .catch(function(){docsData=[];renderDocTable();renderDashboard();});
}

function renderDocTable(){
  var filtered=docsData.filter(function(d){
    if(currentDocFilter==='free' && d.price>0) return false;
    if(currentDocFilter==='premium' && !d.price) return false;
    if(currentDocSearch){
      var q=currentDocSearch.toLowerCase();
      return d.title.toLowerCase().indexOf(q)!==-1||(SUBJECTS[d.subject]||'').toLowerCase().indexOf(q)!==-1;
    }
    return true;
  });
  var tb=document.getElementById('docTableBody');
  if(!filtered.length){
    tb.innerHTML='<tr><td colspan="7"><div class="empty-state" style="padding:2rem"><i class="bi bi-inbox"></i><p>Không tìm thấy đề thi nào</p></div></td></tr>';
    return;
  }
  tb.innerHTML=filtered.map(function(doc){
    var isFree=!doc.price;
    var grad=doc.gradient||['#1E40AF','#F59E0B'];
    var thumb=doc.thumbnail
      ?'<img src="'+doc.thumbnail+'" alt="">'
      :'<div class="cell-doc-thumb" style="background:linear-gradient(135deg,'+grad[0]+','+grad[1]+')"><i class="bi '+(doc.icon||'bi-file-earmark-text')+'"></i></div>';
    return '<tr>'
      +'<td><div class="cell-doc">'+thumb
      +'<div class="cell-doc-info"><span class="title">'+doc.title+'</span><span class="sub">'+doc.pages+' trang'+(doc.questions?' · '+doc.questions+' câu':'')+'</span></div>'
      +'</div></td>'
      +'<td>'+(SUBJECTS[doc.subject]||doc.subject)+'</td>'
      +'<td>'+(TYPES[doc.type]||doc.type)+'</td>'
      +'<td><span class="badge-s '+(isFree?'badge-free':'badge-premium')+'">'+(isFree?'<i class="bi bi-unlock"></i> Free':'<i class="bi bi-gem"></i> '+(doc.price/1000)+'K')+'</span></td>'
      +'<td>'+formatK(doc.downloads)+'</td>'
      +'<td><i class="bi bi-star-fill" style="color:var(--amber);font-size:.75rem"></i> '+doc.rating+'</td>'
      +'<td><div style="display:flex;gap:2px">'
      +'<button class="btn-icon edit" title="Sửa" onclick="editDoc('+doc.id+')"><i class="bi bi-pencil"></i></button>'
      +'<button class="btn-icon del" title="Xoá" onclick="deleteDoc('+doc.id+')"><i class="bi bi-trash3"></i></button>'
      +'</div></td></tr>';
  }).join('');
  document.getElementById('statDocs').textContent=docsData.length;
  var info=document.getElementById('docPageInfo');
  if(info) info.textContent='Hiển thị '+filtered.length+' / '+docsData.length+' đề thi';
}

function filterDocs(btn,f){
  document.querySelectorAll('[data-filter]').forEach(function(b){b.classList.remove('active')});
  btn.classList.add('active');
  currentDocFilter=f;
  renderDocTable();
}
function searchDocs(){currentDocSearch=document.getElementById('docSearchInput').value;renderDocTable();}

function toggleDocForm(){
  var f=document.getElementById('docForm');
  if(f.classList.contains('open')){f.classList.remove('open');editingDocId=null;resetDocForm();}
  else{f.classList.add('open');document.getElementById('docFormTitle').textContent=editingDocId?'Chỉnh sửa đề thi':'Thêm đề thi mới';f.scrollIntoView({behavior:'smooth',block:'start'});}
}
function resetDocForm(){
  ['fTitle','fSource','fDocCode','fDesc'].forEach(function(id){document.getElementById(id).value='';});
  document.getElementById('fSubject').value='';document.getElementById('fType').value='';
  document.getElementById('fYear').value='2026';document.getElementById('fPages').value='';
  document.getElementById('fQuestions').value='';document.getElementById('fPrice').value='0';
  document.getElementById('fThumbPreview').innerHTML='';document.getElementById('fThumbName').innerHTML='';
  document.getElementById('fPreviewFileName').innerHTML='';document.getElementById('fFileName').innerHTML='';
}

function setPrice(btn,type){
  btn.parentElement.querySelectorAll('button').forEach(function(b){b.className=''});
  btn.className=type==='free'?'active-free':'active-premium';
  document.getElementById('fPrice').value=type==='free'?'0':'';
  document.getElementById('fPrice').disabled=type==='free';
}

function saveDoc(){
  var title=document.getElementById('fTitle').value.trim();
  var subject=document.getElementById('fSubject').value;
  var type=document.getElementById('fType').value;
  var docCode=document.getElementById('fDocCode').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(!title||!subject||!type||!docCode){toast('Vui lòng điền đầy đủ thông tin bắt buộc!');return;}

  // TODO: Backend — POST /api/documents với FormData (fThumb, fPreviewFile, fFile)
  var newDoc={
    id:editingDocId||docsData.length+1,
    title:title,subject:subject,type:type,
    source:document.getElementById('fSource').value.trim()||'',
    year:parseInt(document.getElementById('fYear').value),
    price:parseInt(document.getElementById('fPrice').value)||0,
    downloads:0,rating:0,
    pages:parseInt(document.getElementById('fPages').value)||0,
    questions:parseInt(document.getElementById('fQuestions').value)||null,
    format:'pdf',gradient:['#1E40AF','#F59E0B'],icon:'bi-file-earmark-text',
    thumbnail:null,previewUrl:null,docCode:docCode
  };
  if(editingDocId){
    var idx=docsData.findIndex(function(d){return d.id===editingDocId});
    if(idx!==-1){newDoc.downloads=docsData[idx].downloads;newDoc.rating=docsData[idx].rating;docsData[idx]=newDoc;}
  }else{docsData.push(newDoc);}
  renderDocTable();toggleDocForm();
  toast(editingDocId?'Đã cập nhật đề thi!':'Đã thêm đề thi thành công!');
  editingDocId=null;
}

function editDoc(id){
  var doc=docsData.find(function(d){return d.id===id});
  if(!doc) return;
  editingDocId=id;
  document.getElementById('fTitle').value=doc.title;
  document.getElementById('fSubject').value=doc.subject;
  document.getElementById('fType').value=doc.type;
  document.getElementById('fSource').value=doc.source||'';
  document.getElementById('fDocCode').value=doc.docCode||'';
  document.getElementById('fYear').value=doc.year;
  document.getElementById('fPages').value=doc.pages||'';
  document.getElementById('fQuestions').value=doc.questions||'';
  document.getElementById('fPrice').value=doc.price||0;
  var f=document.getElementById('docForm');
  f.classList.add('open');
  document.getElementById('docFormTitle').textContent='Chỉnh sửa đề thi';
  f.scrollIntoView({behavior:'smooth',block:'start'});
}

function deleteDoc(id){
  if(!confirm('Xoá đề thi này?')) return;
  docsData=docsData.filter(function(d){return d.id!==id});
  // TODO: Backend — DELETE /api/documents/:id
  renderDocTable();toast('Đã xoá đề thi');
}

function exportDocs(){
  // TODO: Backend — GET /api/documents/export
  toast('Tính năng xuất CSV sẽ hoạt động khi có backend');
}

// File previews
document.getElementById('fThumb').addEventListener('change',function(){
  var file=this.files[0];
  if(!file){document.getElementById('fThumbName').innerHTML='';document.getElementById('fThumbPreview').innerHTML='';return;}
  document.getElementById('fThumbName').innerHTML='<i class="bi bi-check-circle-fill"></i> '+file.name;
  var reader=new FileReader();
  reader.onload=function(e){document.getElementById('fThumbPreview').innerHTML='<img src="'+e.target.result+'" alt="Preview">';};
  reader.readAsDataURL(file);
});
document.getElementById('fPreviewFile').addEventListener('change',function(){
  var n=this.files[0]?this.files[0].name:'';
  document.getElementById('fPreviewFileName').innerHTML=n?'<i class="bi bi-check-circle-fill"></i> '+n:'';
});
document.getElementById('fFile').addEventListener('change',function(){
  var n=this.files[0]?this.files[0].name:'';
  document.getElementById('fFileName').innerHTML=n?'<i class="bi bi-check-circle-fill"></i> '+n:'';
});

// ========================================
// POSTS (Bài viết)
// ========================================
function renderPostTable(){
  var filtered=postsData.filter(function(p){
    if(currentPostFilter==='published' && p.status!=='published') return false;
    if(currentPostFilter==='draft' && p.status!=='draft') return false;
    if(currentPostSearch){
      var q=currentPostSearch.toLowerCase();
      return p.title.toLowerCase().indexOf(q)!==-1||p.author.toLowerCase().indexOf(q)!==-1;
    }
    return true;
  });
  var tb=document.getElementById('postTableBody');
  if(!filtered.length){
    tb.innerHTML='<tr><td colspan="6"><div class="empty-state" style="padding:2rem"><i class="bi bi-pen"></i><p>Chưa có bài viết nào</p></div></td></tr>';
    return;
  }
  tb.innerHTML=filtered.map(function(p){
    var thumbHtml = p.cover
      ? '<img src="'+p.cover+'" alt="" style="width:42px;height:42px;border-radius:10px;object-fit:cover;border:1px solid rgba(15,23,42,.06)">'
      : '<div class="cell-doc-thumb" style="background:var(--cream-dark);color:var(--ink-faint);font-size:1rem"><i class="bi bi-image"></i></div>';
    return '<tr>'
      +'<td><div class="cell-doc">'
      +thumbHtml
      +'<div class="cell-doc-info"><span class="title">'+p.title+'</span><span class="sub">'+p.excerpt.substring(0,50)+'...</span></div>'
      +'</div></td>'
      +'<td>'+(CATEGORIES[p.category]||p.category)+'</td>'
      +'<td>'+p.author+'</td>'
      +'<td><span class="badge-s badge-'+(p.status==='published'?'published':'draft')+'">'
      +(p.status==='published'?'<i class="bi bi-check-circle"></i> Đã đăng':'<i class="bi bi-file-earmark"></i> Nháp')+'</span></td>'
      +'<td style="font-size:.82rem;color:var(--ink-soft)">'+p.createdAt+'</td>'
      +'<td><div style="display:flex;gap:2px">'
      +'<button class="btn-icon view" title="Xem" onclick="viewPost('+p.id+')"><i class="bi bi-eye"></i></button>'
      +'<button class="btn-icon edit" title="Sửa" onclick="editPost('+p.id+')"><i class="bi bi-pencil"></i></button>'
      +'<button class="btn-icon del" title="Xoá" onclick="deletePost('+p.id+')"><i class="bi bi-trash3"></i></button>'
      +'</div></td></tr>';
  }).join('');
}

function filterPosts(btn,f){
  document.querySelectorAll('[data-pfilter]').forEach(function(b){b.classList.remove('active')});
  btn.classList.add('active');currentPostFilter=f;renderPostTable();
}
function searchPosts(){currentPostSearch=document.getElementById('postSearchInput').value;renderPostTable();}

function togglePostForm(){
  var f=document.getElementById('postForm');
  if(f.classList.contains('open')){f.classList.remove('open');editingPostId=null;resetPostForm();}
  else{f.classList.add('open');document.getElementById('postFormTitle').textContent=editingPostId?'Chỉnh sửa bài viết':'Thêm bài viết mới';f.scrollIntoView({behavior:'smooth',block:'start'});}
}
function resetPostForm(){
  ['pTitle','pAuthor','pExcerpt','pTagInput','pCategoryLabel'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('pCategory').value='';
  document.getElementById('pContent').innerHTML='';
  document.getElementById('pCoverPreview').innerHTML='';
  document.getElementById('pCoverName').innerHTML='';
  postTags=[];renderTags();
}

function savePost(status){
  var title=document.getElementById('pTitle').value.trim();
  var cat=document.getElementById('pCategory').value;
  var author=document.getElementById('pAuthor').value.trim();
  var excerpt=document.getElementById('pExcerpt').value.trim();
  var content=document.getElementById('pContent').innerHTML.trim();
  if(!title||!cat||!author||!excerpt){toast('Vui lòng điền đầy đủ thông tin bắt buộc!');return;}
  if(status==='published'&&!content){toast('Bài đăng cần có nội dung!');return;}

  // TODO: Backend — POST /api/posts với FormData (pCoverFile)
  var post={
    id:editingPostId||postsData.length+1,
    title:title,category:cat,author:author,excerpt:excerpt,
    cover:null, // Backend sẽ trả URL ảnh sau khi upload
    tags:postTags.slice(),status:status,
    content:content,createdAt:new Date().toISOString().split('T')[0]
  };
  if(editingPostId){
    var idx=postsData.findIndex(function(p){return p.id===editingPostId});
    if(idx!==-1){post.cover=postsData[idx].cover;postsData[idx]=post;}
  }else{postsData.push(post);}
  renderPostTable();togglePostForm();
  toast(status==='published'?'Đã đăng bài viết!':'Đã lưu nháp!');
  editingPostId=null;
}

function editPost(id){
  var post=postsData.find(function(p){return p.id===id});
  if(!post) return;
  editingPostId=id;
  document.getElementById('pTitle').value=post.title;
  document.getElementById('pCategory').value=post.category;
  document.getElementById('pAuthor').value=post.author;
  document.getElementById('pExcerpt').value=post.excerpt;
  var catLabel=document.getElementById('pCategoryLabel');
  if(catLabel) catLabel.value='';
  document.getElementById('pContent').innerHTML=post.content||'';
  // Hiện ảnh bìa cũ nếu có
  if(post.cover){
    document.getElementById('pCoverPreview').innerHTML='<img src="'+post.cover+'" alt="Cover">';
  }else{
    document.getElementById('pCoverPreview').innerHTML='';
  }
  document.getElementById('pCoverName').innerHTML='';
  postTags=post.tags?post.tags.slice():[];renderTags();
  var f=document.getElementById('postForm');
  f.classList.add('open');
  document.getElementById('postFormTitle').textContent='Chỉnh sửa bài viết';
  f.scrollIntoView({behavior:'smooth',block:'start'});
}

function viewPost(id){
  // TODO: Mở preview bài viết
  toast('Tính năng xem trước sẽ hoạt động khi có backend');
}

function deletePost(id){
  if(!confirm('Xoá bài viết này?')) return;
  postsData=postsData.filter(function(p){return p.id!==id});
  renderPostTable();toast('Đã xoá bài viết');
}

// Tags
function renderTags(){
  var wrap=document.getElementById('pTagsWrap');
  var input=document.getElementById('pTagInput');
  wrap.querySelectorAll('.tag-item').forEach(function(t){t.remove()});
  postTags.forEach(function(tag,i){
    var el=document.createElement('span');el.className='tag-item';
    el.innerHTML=tag+' <button onclick="removeTag('+i+')">&times;</button>';
    wrap.insertBefore(el,input);
  });
}
function handleTagKey(e){
  if(e.key==='Enter'){
    e.preventDefault();
    var val=e.target.value.trim();
    if(val&&postTags.indexOf(val)===-1){postTags.push(val);renderTags();}
    e.target.value='';
  }
}
function removeTag(i){postTags.splice(i,1);renderTags();}

// Cover preview
document.getElementById('pCoverFile').addEventListener('change',function(){
  var file=this.files[0];
  if(!file){document.getElementById('pCoverName').innerHTML='';document.getElementById('pCoverPreview').innerHTML='';return;}
  document.getElementById('pCoverName').innerHTML='<i class="bi bi-check-circle-fill"></i> '+file.name;
  var reader=new FileReader();
  reader.onload=function(e){document.getElementById('pCoverPreview').innerHTML='<img src="'+e.target.result+'" alt="Cover">';};
  reader.readAsDataURL(file);
});

// Rich text editor
function rteCmd(cmd,val){document.execCommand(cmd,false,val||null);document.getElementById('pContent').focus();}
function insertLink(){var url=prompt('Nhập URL:');if(url) document.execCommand('createLink',false,url);}
function insertImage(){var url=prompt('Nhập URL ảnh:');if(url) document.execCommand('insertImage',false,url);}

// ========================================
// ORDERS (Đơn hàng — thanh toán tự động)
// ========================================
function renderOrderTable(){
  refreshOrders();
  var filtered=ordersData.filter(function(o){
    if(currentOrderFilter!=='all'&&o.status!==currentOrderFilter) return false;
    if(currentOrderSearch){
      var q=currentOrderSearch.toLowerCase();
      return o.docTitle.toLowerCase().indexOf(q)!==-1
        ||o.txCode.toLowerCase().indexOf(q)!==-1
        ||o.id.toLowerCase().indexOf(q)!==-1
        ||o.customerInfo.toLowerCase().indexOf(q)!==-1
        ||o.txContent.toLowerCase().indexOf(q)!==-1;
    }
    return true;
  });
  var tb=document.getElementById('orderTableBody');
  if(!filtered.length){
    tb.innerHTML='<tr><td colspan="8"><div class="empty-state" style="padding:2rem"><i class="bi bi-receipt"></i><p>Không tìm thấy đơn hàng nào</p><p style="font-size:.82rem;color:var(--ink-faint)">Khi khách mua đề và bấm "Tôi đã CK", đơn sẽ hiện ở đây.</p></div></td></tr>';
    return;
  }
  tb.innerHTML=filtered.map(function(o){
    var statusMap={
      approved:{cls:'badge-done',    label:'<i class="bi bi-check-circle"></i> Đã duyệt'},
      pending: {cls:'badge-pending', label:'<i class="bi bi-hourglass-split"></i> Chờ duyệt'},
      rejected:{cls:'badge-cancel',  label:'<i class="bi bi-x-circle"></i> Từ chối'}
    };
    var s=statusMap[o.status]||statusMap.pending;

    // Thao tác tuỳ trạng thái
    var actions='';
    if(o.status==='pending'){
      actions='<button class="btn-teal" style="font-size:.72rem;padding:.25rem .6rem" title="Duyệt đơn" onclick="manualApprove(\''+o.orderCode+'\')">'
        +'<i class="bi bi-check-lg"></i> Duyệt</button>'
        +'<button class="btn-icon del" title="Từ chối" onclick="rejectOrder(\''+o.orderCode+'\')">'
        +'<i class="bi bi-x-lg"></i></button>';
    }else{
      actions='<button class="btn-icon view" title="Chi tiết" onclick="viewOrder(\''+o.orderCode+'\')"><i class="bi bi-eye"></i></button>';
    }

    // Mã đơn + nút copy
    var txHtml='<span style="font-family:monospace;font-size:.78rem;background:var(--cream-dark);padding:.15rem .5rem;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:.3rem" onclick="copyTx(\''+o.txCode+'\')" title="Nhấn để copy">'+o.txCode+' <i class="bi bi-copy" style="font-size:.65rem;opacity:.5"></i></span>';

    // Thông tin khách
    var custHtml = '<div style="font-weight:600;font-size:.84rem">'+o.customerInfo+'</div>'
      +'<div style="font-size:.72rem;color:var(--ink-soft);font-family:monospace">CK: '+o.txContent+'</div>';

    return '<tr'+(o.status==='pending'?' style="background:rgba(247,168,35,.03)"':'')+' >'
      +'<td style="font-weight:600;color:var(--ink-soft);font-size:.78rem">'+o.id+'</td>'
      +'<td style="font-weight:600;max-width:170px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+o.docTitle+'</td>'
      +'<td>'+custHtml+'</td>'
      +'<td>'+txHtml+'</td>'
      +'<td style="font-weight:700;color:var(--coral)">'+(o.amount?formatK(o.amount):'Free')+'</td>'
      +'<td style="font-size:.8rem;color:var(--ink-soft)">'+o.time+'</td>'
      +'<td><span class="badge-s '+s.cls+'">'+s.label+'</span></td>'
      +'<td><div style="display:flex;gap:2px">'+actions+'</div></td></tr>';
  }).join('');

  // Stats
  var approved=ordersData.filter(function(o){return o.status==='approved'}).length;
  var pending=ordersData.filter(function(o){return o.status==='pending'}).length;
  var rejected=ordersData.filter(function(o){return o.status==='rejected'}).length;
  var revenue=ordersData.filter(function(o){return o.status==='approved'}).reduce(function(s,o){return s+o.amount},0);
  document.getElementById('statPaid').textContent=approved;
  document.getElementById('statPending').textContent=pending;
  document.getElementById('statExpired').textContent=rejected;
  document.getElementById('statRevenue').textContent=formatK(revenue);
  // Sidebar badge: chỉ hiện nếu có đơn chờ duyệt
  var badge=document.getElementById('pendingCount');
  if(pending>0){badge.textContent=pending;badge.style.display='';}
  else{badge.style.display='none';}
  document.getElementById('orderPageInfo').textContent='Hiển thị '+filtered.length+' / '+ordersData.length+' đơn hàng';

  // Thông báo nếu có đơn mới
  if(pending > _lastPendingCount && _lastPendingCount >= 0){
    if(_lastPendingCount > 0) toast('🔔 Có '+pending+' đơn hàng mới chờ duyệt!');
  }
  _lastPendingCount = pending;
}

function filterOrders(btn,f){
  document.querySelectorAll('[data-ofilter]').forEach(function(b){b.classList.remove('active')});
  btn.classList.add('active');currentOrderFilter=f;renderOrderTable();
}
function searchOrders(){currentOrderSearch=document.getElementById('orderSearchInput').value;renderOrderTable();}

// Admin duyệt đơn hàng
function manualApprove(orderCode){
  if(!confirm('Duyệt đơn '+orderCode+'?\nBạn đã kiểm tra lịch sử CK ngân hàng và xác nhận tiền đã vào?')) return;
  // Cập nhật localStorage
  var orders = loadOrdersFromStorage();
  for(var i=0;i<orders.length;i++){
    if(orders[i].orderCode === orderCode){
      orders[i].status = 'approved';
      orders[i].approvedBy = 'admin';
      orders[i].approvedAt = new Date().toLocaleString('vi-VN');
      break;
    }
  }
  saveOrdersToStorage(orders);
  renderOrderTable();renderDashboard();
  toast('✅ Đã duyệt đơn '+orderCode+' — đề mở khoá cho khách tải!');
}
function rejectOrder(orderCode){
  if(!confirm('Từ chối đơn '+orderCode+'?\nChuyển khoản chưa khớp hoặc không thấy tiền?')) return;
  var orders = loadOrdersFromStorage();
  for(var i=0;i<orders.length;i++){
    if(orders[i].orderCode === orderCode){
      orders[i].status = 'rejected';
      break;
    }
  }
  saveOrdersToStorage(orders);
  renderOrderTable();renderDashboard();
  toast('Đã từ chối đơn '+orderCode);
}
function viewOrder(orderCode){
  var orders = loadOrdersFromStorage();
  var o = orders.find(function(x){return x.orderCode===orderCode});
  if(!o){toast('Không tìm thấy đơn '+orderCode); return;}
  var info = '📋 Chi tiết đơn hàng\n\n'
    +'Mã: '+o.orderCode+'\n'
    +'Đề: '+o.docTitle+'\n'
    +'Khách: '+o.customerInfo+'\n'
    +'Nội dung CK: '+o.txContent+'\n'
    +'Số tiền: '+(o.amount?o.amount.toLocaleString('vi-VN')+'đ':'Miễn phí')+'\n'
    +'Ngày đặt: '+o.createdAt+'\n'
    +'Trạng thái: '+(o.status==='approved'?'Đã duyệt':(o.status==='rejected'?'Từ chối':'Chờ duyệt'))+'\n'
    +(o.approvedAt?'Ngày duyệt: '+o.approvedAt:'');
  alert(info);
}
function copyTx(code){
  navigator.clipboard.writeText(code).then(function(){toast('Đã copy: '+code);}).catch(function(){toast(code);});
}

function exportOrders(){
  // TODO: Backend — GET /api/orders/export
  toast('Tính năng xuất CSV sẽ hoạt động khi có backend');
}

// ========================================
// SETTINGS
// ========================================
function saveSettings(section){
  // TODO: Backend — PUT /api/settings/bank
  toast('Đã lưu thông tin ngân hàng!');
}

// ========================================
// DASHBOARD
// ========================================
function renderDashboard(){
  refreshOrders();
  // Đơn chờ duyệt — hiện khi có đơn cần xử lý
  var stuck=ordersData.filter(function(o){return o.status==='pending'});
  var el=document.getElementById('dashPendingOrders');
  if(!stuck.length){
    el.innerHTML='<div class="empty-state" style="padding:1.5rem"><i class="bi bi-check-circle" style="font-size:2rem;color:var(--teal)"></i><p style="font-size:.85rem">Không có đơn nào chờ duyệt!</p></div>';
  }else{
    el.innerHTML=stuck.map(function(o){
      return '<div class="dash-list-item" style="background:rgba(247,168,35,.03)">'
        +'<div style="flex:1;min-width:0">'
          +'<div style="font-weight:600;font-size:.88rem">'+o.docTitle+'</div>'
          +'<div style="font-size:.76rem;color:var(--ink-soft)">'
            +'<span style="font-weight:600;color:var(--ink)">'+o.customerInfo+'</span>'
            +' · '+formatK(o.amount)
          +'</div>'
          +'<div style="font-size:.72rem;color:var(--ink-faint);margin-top:.15rem">'
            +'CK: <span style="font-family:monospace;background:var(--cream-dark);padding:.1rem .4rem;border-radius:4px;font-size:.72rem">'+o.txContent+'</span>'
            +' · '+o.time
          +'</div>'
        +'</div>'
        +'<div style="display:flex;gap:4px">'
        +'<button class="btn-teal" style="font-size:.72rem;padding:.25rem .6rem" onclick="manualApprove(\''+o.orderCode+'\');renderDashboard()"><i class="bi bi-check-lg"></i> Duyệt</button>'
        +'<button style="background:rgba(30,64,175,.08);color:var(--coral);border:none;border-radius:6px;font-size:.72rem;padding:.25rem .5rem;cursor:pointer;font-family:inherit" onclick="rejectOrder(\''+o.orderCode+'\');renderDashboard()"><i class="bi bi-x-lg"></i></button>'
        +'</div></div>';
    }).join('');
  }

  // Recent docs
  var recent=docsData.slice(-5).reverse();
  var el2=document.getElementById('dashRecentDocs');
  if(!recent.length){
    el2.innerHTML='<div class="empty-state" style="padding:1.5rem"><i class="bi bi-file-earmark-text" style="font-size:2rem"></i><p style="font-size:.85rem">Chưa có đề thi nào</p></div>';
  }else{
    el2.innerHTML=recent.map(function(doc){
      var grad=doc.gradient||['#1E40AF','#F59E0B'];
      return '<div class="dash-list-item">'
        +'<div class="cell-doc-thumb" style="background:linear-gradient(135deg,'+grad[0]+','+grad[1]+');width:36px;height:36px;border-radius:8px;font-size:.85rem"><i class="bi '+(doc.icon||'bi-file-earmark-text')+'"></i></div>'
        +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:.86rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+doc.title+'</div>'
        +'<div style="font-size:.76rem;color:var(--ink-soft)">'+(SUBJECTS[doc.subject]||doc.subject)+' · '+(TYPES[doc.type]||doc.type)+'</div></div>'
        +'<span class="badge-s '+(doc.price?'badge-premium':'badge-free')+'">'+(doc.price?(doc.price/1000)+'K':'Free')+'</span></div>';
    }).join('');
  }

  // Update stat counts
  document.getElementById('statDocs').textContent=docsData.length;
  var approvedCount=ordersData.filter(function(o){return o.status==='approved'}).length;
  document.getElementById('statOrders').textContent=approvedCount;
}

// Auto-refresh đơn hàng mỗi 10 giây (kiểm tra localStorage cập nhật)
setInterval(function(){
  var current=ordersData.length;
  refreshOrders();
  if(ordersData.length!==current){
    renderOrderTable();renderDashboard();
  }
  // Kiểm tra nếu có đơn pending mới
  var newPending=ordersData.filter(function(o){return o.status==='pending'}).length;
  if(newPending > _lastPendingCount){
    renderOrderTable();renderDashboard();
  }
},10000);

// ========================================
// UTILS
// ========================================
function formatK(n){
  if(n>=1000000) return (n/1000000).toFixed(1).replace('.0','')+'M';
  if(n>=1000) return (n/1000).toFixed(1).replace('.0','')+'K';
  return n;
}

// ========================================
// INIT
// ========================================
loadDocsData();
renderPostTable();
renderOrderTable();

/* ============ REPORTS ============ */
function renderReports(){
  var reports = JSON.parse(localStorage.getItem('got_reports')||'[]');
  var tbody = document.getElementById('reportTableBody');
  var empty = document.getElementById('reportEmpty');
  var badge = document.getElementById('reportCount');
  if(!tbody) return;

  var pending = 0, done = 0;
  reports.forEach(function(r){ if(r.status==='pending') pending++; else done++; });

  if(document.getElementById('statReportPending')) document.getElementById('statReportPending').textContent = pending;
  if(document.getElementById('statReportDone')) document.getElementById('statReportDone').textContent = done;
  if(document.getElementById('statReportTotal')) document.getElementById('statReportTotal').textContent = reports.length;
  if(badge){ badge.textContent = pending; badge.style.display = pending > 0 ? '' : 'none'; }

  if(reports.length === 0){
    tbody.innerHTML = '';
    if(empty) empty.style.display = '';
    return;
  }
  if(empty) empty.style.display = 'none';

  var html = '';
  for(var i = reports.length - 1; i >= 0; i--){
    var r = reports[i];
    var time = new Date(r.time).toLocaleString('vi-VN');
    var statusHtml = r.status === 'pending'
      ? '<span style="background:#FEF3C7;color:#92400E;font-size:.75rem;font-weight:700;padding:.2rem .6rem;border-radius:50px">Chờ xử lý</span>'
      : '<span style="background:#ECFDF5;color:#065F46;font-size:.75rem;font-weight:700;padding:.2rem .6rem;border-radius:50px">Đã xử lý</span>';
    var actions = r.status === 'pending'
      ? '<button class="btn-action-c" style="color:#059669" onclick="resolveReport('+r.id+')"><i class="bi bi-check-lg"></i> Xử lý</button>'
        +'<button class="btn-action-c" style="color:#EF4444" onclick="deleteReport('+r.id+')"><i class="bi bi-trash3"></i></button>'
      : '<button class="btn-action-c" style="color:#EF4444" onclick="deleteReport('+r.id+')"><i class="bi bi-trash3"></i> Xóa</button>';

    html += '<tr>'
      +'<td style="font-size:.82rem;white-space:nowrap">'+time+'</td>'
      +'<td><code style="background:#F1F5F9;padding:.2rem .4rem;border-radius:4px;font-size:.8rem">'+(r.orderCode||'—')+'</code></td>'
      +'<td><span style="background:#FEF2F2;color:#DC2626;font-size:.75rem;font-weight:600;padding:.2rem .5rem;border-radius:6px">'+r.type+'</span></td>'
      +'<td style="font-weight:600;font-size:.85rem">'+r.contact+'</td>'
      +'<td style="font-size:.85rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(r.desc||'—')+'</td>'
      +'<td>'+statusHtml+'</td>'
      +'<td>'+actions+'</td>'
    +'</tr>';
  }
  tbody.innerHTML = html;
}

function resolveReport(id){
  var reports = JSON.parse(localStorage.getItem('got_reports')||'[]');
  for(var i=0;i<reports.length;i++){
    if(reports[i].id === id){ reports[i].status = 'resolved'; break; }
  }
  localStorage.setItem('got_reports', JSON.stringify(reports));
  renderReports();
}

function deleteReport(id){
  if(!confirm('Xóa báo cáo này?')) return;
  var reports = JSON.parse(localStorage.getItem('got_reports')||'[]');
  reports = reports.filter(function(r){ return r.id !== id; });
  localStorage.setItem('got_reports', JSON.stringify(reports));
  renderReports();
}

function clearResolvedReports(){
  if(!confirm('Xóa tất cả báo cáo đã xử lý?')) return;
  var reports = JSON.parse(localStorage.getItem('got_reports')||'[]');
  reports = reports.filter(function(r){ return r.status === 'pending'; });
  localStorage.setItem('got_reports', JSON.stringify(reports));
  renderReports();
}
