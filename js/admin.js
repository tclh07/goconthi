/* ============================================================
   GócÔnThi — Admin Panel (Supabase version)
   ============================================================ */

var ADMIN_ACCOUNTS = [
  { user: 'admin', pass: 'chau@123' },
  { user: 'goconthi', pass: 'chau@123' }
];

function adminLogin(){
  var user = (document.getElementById('adminUser')||{}).value.trim();
  var pass = (document.getElementById('adminPass')||{}).value.trim();
  var err = document.getElementById('adminLoginError');
  if(!user || !pass){ err.textContent='Vui lòng nhập đầy đủ thông tin'; err.style.display=''; return; }
  var found=false;
  for(var i=0;i<ADMIN_ACCOUNTS.length;i++){
    if(ADMIN_ACCOUNTS[i].user===user && ADMIN_ACCOUNTS[i].pass===pass){ found=true; break; }
  }
  if(!found){ err.textContent='Sai tài khoản hoặc mật khẩu!'; err.style.display=''; document.getElementById('adminPass').value=''; return; }
  localStorage.setItem('admin_session', JSON.stringify({user:user, loginAt:Date.now()}));
  document.getElementById('adminLoginGate').style.opacity='0';
  setTimeout(function(){ document.getElementById('adminLoginGate').style.display='none'; }, 300);
}
(function(){
  var session=JSON.parse(localStorage.getItem('admin_session')||'null');
  if(session){ var gate=document.getElementById('adminLoginGate'); if(gate) gate.style.display='none'; }
})();
function adminLogout(){
  if(!confirm('Đăng xuất khỏi Admin?')) return;
  localStorage.removeItem('admin_session');
  location.reload();
}

// ========================================
// DATA — Supabase
// ========================================
var SUBJECTS={toan:'Toán',ly:'Vật lý',hoa:'Hoá học',sinh:'Sinh học',anh:'Tiếng Anh',van:'Ngữ văn',su:'Lịch sử',dia:'Địa lý',gdktpl:'GD KT&PL'};
var TYPES={so:'Đề Sở',dungsai:'Đúng sai',minhhoa:'Minh hoạ',tomtat:'Tóm tắt'};
var CATEGORIES={toan:'Toán',ly:'Vật lý',hoa:'Hoá học',sinh:'Sinh học',anh:'Tiếng Anh',van:'Ngữ văn',su:'Lịch sử',dia:'Địa lý',phuongphap:'Phương pháp',suckhoe:'Sức khoẻ',kinhnghiem:'Kinh nghiệm'};
var TABS={dashboard:'Dashboard',documents:'Quản lý đề thi',posts:'Bài viết Góc sĩ tử',orders:'Lịch sử đơn hàng',settings:'Cài đặt'};

var docsData=[];
var postsData=[];
var ordersData=[];

var currentDocFilter='all';
var currentDocSearch='';
var currentPostFilter='all';
var currentPostSearch='';
var currentOrderFilter='all';
var currentOrderSearch='';
var postTags=[];
var editingDocId=null;
var editingPostId=null;
var _lastPendingCount=0;

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
  if(tab==='documents') loadAndRenderDocs();
  if(tab==='posts') loadAndRenderPosts();
  if(tab==='orders') loadAndRenderOrders();
  if(tab==='dashboard') renderDashboard();
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
// DOCUMENTS — Supabase CRUD
// ========================================
async function loadAndRenderDocs(){
  docsData = await DB.getDocs();
  renderDocTable();
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
  btn.classList.add('active'); currentDocFilter=f; renderDocTable();
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

async function saveDoc(){
  var title=document.getElementById('fTitle').value.trim();
  var subject=document.getElementById('fSubject').value;
  var type=document.getElementById('fType').value;
  var docCode=document.getElementById('fDocCode').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(!title||!subject||!type||!docCode){toast('Vui lòng điền đầy đủ thông tin bắt buộc!');return;}

  var GRAD_MAP={toan:['#1E40AF','#3B82F6'],ly:['#0369A1','#0EA5E9'],hoa:['#0D9488','#14B8A6'],sinh:['#059669','#34D399'],anh:['#7C3AED','#A78BFA'],van:['#1E3A8A','#60A5FA'],su:['#6D28D9','#8B5CF6'],dia:['#0284C7','#38BDF8'],gdktpl:['#334155','#64748B']};
  var ICON_MAP={toan:'bi-calculator',ly:'bi-lightning-charge',hoa:'bi-droplet-half',sinh:'bi-tree',anh:'bi-translate',van:'bi-pen',su:'bi-clock-history',dia:'bi-globe-asia-australia',gdktpl:'bi-bank'};

  var docData={
    title:title, subject:subject, type:type,
    source:document.getElementById('fSource').value.trim()||null,
    year:parseInt(document.getElementById('fYear').value),
    price:parseInt(document.getElementById('fPrice').value)||0,
    pages:parseInt(document.getElementById('fPages').value)||0,
    questions:parseInt(document.getElementById('fQuestions').value)||null,
    format:'pdf',
    gradient:GRAD_MAP[subject]||['#1E40AF','#F59E0B'],
    icon:ICON_MAP[subject]||'bi-file-earmark-text',
    doc_code:docCode
  };

  // Upload thumbnail nếu có
  var thumbFile=document.getElementById('fThumb').files[0];
  if(thumbFile){
    var thumbName='thumb_'+docCode+'_'+Date.now()+'.'+thumbFile.name.split('.').pop();
    await Storage.uploadThumbnail(thumbFile, thumbName);
    docData.thumbnail=Storage.getThumbnailUrl(thumbName);
  }

  // Upload file đề thi nếu có
  var docFile=document.getElementById('fFile').files[0];
  if(docFile){
    var fileName=docCode+'_'+Date.now()+'.'+docFile.name.split('.').pop();
    await Storage.uploadDocument(docFile, fileName);
    docData.file_url=fileName;
    docData.format=docFile.name.split('.').pop().toLowerCase();
  }

  if(editingDocId){
    await supabase.from('documents').update(docData).eq('id', editingDocId);
    toast('Đã cập nhật đề thi!');
  } else {
    docData.downloads=0;
    docData.rating=0;
    await supabase.from('documents').insert(docData);
    toast('Đã thêm đề thi thành công!');
  }

  await loadAndRenderDocs();
  toggleDocForm();
  editingDocId=null;
  renderDashboard();
}

function editDoc(id){
  var doc=docsData.find(function(d){return d.id===id});
  if(!doc) return;
  editingDocId=id;
  document.getElementById('fTitle').value=doc.title;
  document.getElementById('fSubject').value=doc.subject;
  document.getElementById('fType').value=doc.type;
  document.getElementById('fSource').value=doc.source||'';
  document.getElementById('fDocCode').value=doc.doc_code||'';
  document.getElementById('fYear').value=doc.year;
  document.getElementById('fPages').value=doc.pages||'';
  document.getElementById('fQuestions').value=doc.questions||'';
  document.getElementById('fPrice').value=doc.price||0;
  if(doc.thumbnail){
    document.getElementById('fThumbPreview').innerHTML='<img src="'+doc.thumbnail+'" alt="Preview">';
  }
  var f=document.getElementById('docForm');
  f.classList.add('open');
  document.getElementById('docFormTitle').textContent='Chỉnh sửa đề thi';
  f.scrollIntoView({behavior:'smooth',block:'start'});
}

async function deleteDoc(id){
  if(!confirm('Xoá đề thi này?')) return;
  await supabase.from('documents').delete().eq('id', id);
  await loadAndRenderDocs();
  renderDashboard();
  toast('Đã xoá đề thi');
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
// POSTS — Supabase CRUD
// ========================================
async function loadAndRenderPosts(){
  var result = await supabase.from('posts').select('*').order('created_at',{ascending:false});
  postsData = result.data || [];
  renderPostTable();
}

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
    var cat=p.category_label||CATEGORIES[p.category]||p.category;
    var date=p.created_at?p.created_at.split('T')[0]:'-';
    var thumbHtml = p.cover
      ? '<img src="'+p.cover+'" alt="" style="width:42px;height:42px;border-radius:10px;object-fit:cover;border:1px solid rgba(15,23,42,.06)">'
      : '<div class="cell-doc-thumb" style="background:var(--cream-dark);color:var(--ink-faint);font-size:1rem"><i class="bi bi-image"></i></div>';
    return '<tr>'
      +'<td><div class="cell-doc">'+thumbHtml
      +'<div class="cell-doc-info"><span class="title">'+p.title+'</span><span class="sub">'+(p.excerpt||'').substring(0,50)+'...</span></div>'
      +'</div></td>'
      +'<td>'+cat+'</td>'
      +'<td>'+p.author+'</td>'
      +'<td><span class="badge-s badge-'+(p.status==='published'?'published':'draft')+'">'
      +(p.status==='published'?'<i class="bi bi-check-circle"></i> Đã đăng':'<i class="bi bi-file-earmark"></i> Nháp')+'</span></td>'
      +'<td style="font-size:.82rem;color:var(--ink-soft)">'+date+'</td>'
      +'<td><div style="display:flex;gap:2px">'
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

async function savePost(status){
  var title=document.getElementById('pTitle').value.trim();
  var cat=document.getElementById('pCategory').value;
  var author=document.getElementById('pAuthor').value.trim();
  var excerpt=document.getElementById('pExcerpt').value.trim();
  var content=document.getElementById('pContent').innerHTML.trim();
  var catLabel=document.getElementById('pCategoryLabel');
  if(!title||!cat||!author||!excerpt){toast('Vui lòng điền đầy đủ thông tin bắt buộc!');return;}
  if(status==='published'&&!content){toast('Bài đăng cần có nội dung!');return;}

  var postData={
    title:title, category:cat,
    category_label:catLabel?catLabel.value||CATEGORIES[cat]||cat:CATEGORIES[cat]||cat,
    author:author, excerpt:excerpt, tags:postTags.slice(),
    status:status,
    author_initials:author.split(' ').map(function(w){return w[0]}).join('').toUpperCase().substring(0,2),
    author_color:'#1E40AF'
  };

  // Upload cover nếu có
  var coverFile=document.getElementById('pCoverFile').files[0];
  if(coverFile){
    var coverName='cover_'+Date.now()+'.'+coverFile.name.split('.').pop();
    await Storage.uploadPostImage(coverFile, coverName);
    postData.cover=Storage.getPostImageUrl(coverName);
  }

  if(editingPostId){
    await supabase.from('posts').update(postData).eq('id', editingPostId);
    toast(status==='published'?'Đã cập nhật bài viết!':'Đã lưu nháp!');
  } else {
    await supabase.from('posts').insert(postData);
    toast(status==='published'?'Đã đăng bài viết!':'Đã lưu nháp!');
  }

  await loadAndRenderPosts();
  togglePostForm();
  editingPostId=null;
}

function editPost(id){
  var post=postsData.find(function(p){return p.id===id});
  if(!post) return;
  editingPostId=id;
  document.getElementById('pTitle').value=post.title;
  document.getElementById('pCategory').value=post.category;
  document.getElementById('pAuthor').value=post.author;
  document.getElementById('pExcerpt').value=post.excerpt||'';
  var catLabel=document.getElementById('pCategoryLabel');
  if(catLabel) catLabel.value=post.category_label||'';
  document.getElementById('pContent').innerHTML=post.content||'';
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

async function deletePost(id){
  if(!confirm('Xoá bài viết này?')) return;
  await supabase.from('posts').delete().eq('id', id);
  await loadAndRenderPosts();
  toast('Đã xoá bài viết');
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
// ORDERS — Supabase
// ========================================
async function loadAndRenderOrders(){
  var result = await supabase.from('orders').select('*').order('created_at',{ascending:false});
  ordersData = (result.data||[]).map(function(o,i){
    return {
      id:'DH'+String(i+1).padStart(3,'0'),
      orderCode:o.order_code,
      docTitle:o.doc_title||'Đề #'+o.doc_id,
      docId:o.doc_id,
      txCode:o.order_code,
      amount:o.amount||0,
      time:o.created_at?new Date(o.created_at).toLocaleString('vi-VN'):'',
      status:o.status,
      customerInfo:o.buyer_name||o.buyer_contact||'',
      txContent:o.order_code,
      approvedBy:o.approved_by,
      approvedAt:o.approved_at?new Date(o.approved_at).toLocaleString('vi-VN'):null
    };
  });
  renderOrderTable();
}

function renderOrderTable(){
  var filtered=ordersData.filter(function(o){
    if(currentOrderFilter!=='all'&&o.status!==currentOrderFilter) return false;
    if(currentOrderSearch){
      var q=currentOrderSearch.toLowerCase();
      return o.docTitle.toLowerCase().indexOf(q)!==-1
        ||o.txCode.toLowerCase().indexOf(q)!==-1
        ||o.id.toLowerCase().indexOf(q)!==-1
        ||o.customerInfo.toLowerCase().indexOf(q)!==-1;
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
      approved:{cls:'badge-done',label:'<i class="bi bi-check-circle"></i> Đã duyệt'},
      pending:{cls:'badge-pending',label:'<i class="bi bi-hourglass-split"></i> Chờ duyệt'},
      rejected:{cls:'badge-cancel',label:'<i class="bi bi-x-circle"></i> Từ chối'}
    };
    var s=statusMap[o.status]||statusMap.pending;
    var actions='';
    if(o.status==='pending'){
      actions='<button class="btn-teal" style="font-size:.72rem;padding:.25rem .6rem" onclick="manualApprove(\''+o.orderCode+'\')"><i class="bi bi-check-lg"></i> Duyệt</button>'
        +'<button class="btn-icon del" onclick="rejectOrder(\''+o.orderCode+'\')"><i class="bi bi-x-lg"></i></button>';
    }else{
      actions='<button class="btn-icon view" onclick="viewOrder(\''+o.orderCode+'\')"><i class="bi bi-eye"></i></button>';
    }
    var txHtml='<span style="font-family:monospace;font-size:.78rem;background:var(--cream-dark);padding:.15rem .5rem;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:.3rem" onclick="copyTx(\''+o.txCode+'\')">'+o.txCode+' <i class="bi bi-copy" style="font-size:.65rem;opacity:.5"></i></span>';
    var custHtml='<div style="font-weight:600;font-size:.84rem">'+o.customerInfo+'</div>';

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

  var approved=ordersData.filter(function(o){return o.status==='approved'}).length;
  var pending=ordersData.filter(function(o){return o.status==='pending'}).length;
  var rejected=ordersData.filter(function(o){return o.status==='rejected'}).length;
  var revenue=ordersData.filter(function(o){return o.status==='approved'}).reduce(function(s,o){return s+o.amount},0);
  document.getElementById('statPaid').textContent=approved;
  document.getElementById('statPending').textContent=pending;
  document.getElementById('statExpired').textContent=rejected;
  document.getElementById('statRevenue').textContent=formatK(revenue);
  var badge=document.getElementById('pendingCount');
  if(pending>0){badge.textContent=pending;badge.style.display='';}
  else{badge.style.display='none';}
  document.getElementById('orderPageInfo').textContent='Hiển thị '+filtered.length+' / '+ordersData.length+' đơn hàng';
  _lastPendingCount=pending;
}

function filterOrders(btn,f){
  document.querySelectorAll('[data-ofilter]').forEach(function(b){b.classList.remove('active')});
  btn.classList.add('active');currentOrderFilter=f;renderOrderTable();
}
function searchOrders(){currentOrderSearch=document.getElementById('orderSearchInput').value;renderOrderTable();}

async function manualApprove(orderCode){
  if(!confirm('Duyệt đơn '+orderCode+'?\nĐã kiểm tra lịch sử CK ngân hàng?')) return;
  await supabase.from('orders').update({
    status:'approved', approved_by:'admin', approved_at:new Date().toISOString()
  }).eq('order_code', orderCode);
  await loadAndRenderOrders();
  renderDashboard();
  toast('✅ Đã duyệt đơn '+orderCode);
}

async function rejectOrder(orderCode){
  if(!confirm('Từ chối đơn '+orderCode+'?')) return;
  await supabase.from('orders').update({status:'rejected'}).eq('order_code', orderCode);
  await loadAndRenderOrders();
  renderDashboard();
  toast('Đã từ chối đơn '+orderCode);
}

function viewOrder(orderCode){
  var o=ordersData.find(function(x){return x.orderCode===orderCode});
  if(!o){toast('Không tìm thấy đơn'); return;}
  alert('📋 Chi tiết đơn hàng\n\nMã: '+o.orderCode+'\nĐề: '+o.docTitle+'\nKhách: '+o.customerInfo
    +'\nSố tiền: '+(o.amount?o.amount.toLocaleString('vi-VN')+'đ':'Miễn phí')
    +'\nNgày đặt: '+o.time+'\nTrạng thái: '+(o.status==='approved'?'Đã duyệt':o.status==='rejected'?'Từ chối':'Chờ duyệt')
    +(o.approvedAt?'\nNgày duyệt: '+o.approvedAt:''));
}

function copyTx(code){
  navigator.clipboard.writeText(code).then(function(){toast('Đã copy: '+code);}).catch(function(){toast(code);});
}

// ========================================
// SETTINGS
// ========================================
function saveSettings(section){toast('Đã lưu thông tin ngân hàng!');}

// ========================================
// DASHBOARD — Supabase
// ========================================
async function renderDashboard(){
  if(!docsData.length) docsData = await DB.getDocs();
  if(!ordersData.length) await loadAndRenderOrders();

  var stuck=ordersData.filter(function(o){return o.status==='pending'});
  var el=document.getElementById('dashPendingOrders');
  if(!stuck.length){
    el.innerHTML='<div class="empty-state" style="padding:1.5rem"><i class="bi bi-check-circle" style="font-size:2rem;color:var(--teal)"></i><p style="font-size:.85rem">Không có đơn nào chờ duyệt!</p></div>';
  }else{
    el.innerHTML=stuck.map(function(o){
      return '<div class="dash-list-item" style="background:rgba(247,168,35,.03)">'
        +'<div style="flex:1;min-width:0">'
        +'<div style="font-weight:600;font-size:.88rem">'+o.docTitle+'</div>'
        +'<div style="font-size:.76rem;color:var(--ink-soft)"><span style="font-weight:600;color:var(--ink)">'+o.customerInfo+'</span> · '+formatK(o.amount)+'</div>'
        +'<div style="font-size:.72rem;color:var(--ink-faint);margin-top:.15rem">CK: <span style="font-family:monospace;background:var(--cream-dark);padding:.1rem .4rem;border-radius:4px;font-size:.72rem">'+o.txContent+'</span> · '+o.time+'</div>'
        +'</div>'
        +'<div style="display:flex;gap:4px">'
        +'<button class="btn-teal" style="font-size:.72rem;padding:.25rem .6rem" onclick="manualApprove(\''+o.orderCode+'\');renderDashboard()"><i class="bi bi-check-lg"></i> Duyệt</button>'
        +'<button style="background:rgba(30,64,175,.08);color:var(--coral);border:none;border-radius:6px;font-size:.72rem;padding:.25rem .5rem;cursor:pointer;font-family:inherit" onclick="rejectOrder(\''+o.orderCode+'\');renderDashboard()"><i class="bi bi-x-lg"></i></button>'
        +'</div></div>';
    }).join('');
  }

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

  document.getElementById('statDocs').textContent=docsData.length;
  var approvedCount=ordersData.filter(function(o){return o.status==='approved'}).length;
  document.getElementById('statOrders').textContent=approvedCount;
}

// Auto-refresh đơn hàng mỗi 30 giây
setInterval(async function(){
  await loadAndRenderOrders();
  renderDashboard();
}, 30000);

// ========================================
// UTILS
// ========================================
function formatK(n){
  if(n>=1000000) return (n/1000000).toFixed(1).replace('.0','')+'M';
  if(n>=1000) return (n/1000).toFixed(1).replace('.0','')+'K';
  return n;
}

// ========================================
// INIT — Load từ Supabase
// ========================================
(async function(){
  await loadAndRenderDocs();
  await loadAndRenderPosts();
  await loadAndRenderOrders();
  renderDashboard();
})();
