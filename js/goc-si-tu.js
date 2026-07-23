/* ============================================================
   GócÔnThi — goc-si-tu.js (Supabase version)
   Load bài viết từ Supabase thay vì posts.json
   ============================================================ */
var GRAD_MAP = {
  toan:'var(--coral),var(--amber)', ly:'var(--grape),var(--sky)', hoa:'var(--teal),var(--sky)',
  sinh:'var(--teal-dark),var(--teal)', anh:'var(--rose),var(--coral)', van:'var(--amber),var(--coral)',
  su:'var(--grape),var(--rose)', dia:'var(--sky),var(--teal)', gdktpl:'var(--coral),var(--grape)',
  phuongphap:'var(--amber),#3AA929', suckhoe:'var(--sky),var(--grape)', kinhnghiem:'var(--coral),var(--teal)'
};

(async function(){
  try {
    var posts = await DB.getPosts();
    if(!posts.length){ showPostsEmpty(); return; }

    var featured = posts.find(function(p){ return p.featured; }) || posts[0];
    var rest = posts.filter(function(p){ return p.id !== featured.id; });

    renderFeaturedPost(featured);
    renderPostsGrid(rest);
    if(typeof setupReveal === 'function') setupReveal();
  } catch(e){ console.warn('posts:', e); showPostsEmpty(); }
})();

function renderFeaturedPost(p){
  var grad = GRAD_MAP[p.category] || 'var(--coral),var(--amber)';
  var coverHtml = p.cover
    ? '<img src="'+p.cover+'" alt="'+p.title+'" style="width:100%;height:100%;object-fit:cover">'
    : '';
  var coverStyle = p.cover ? '' : 'background:linear-gradient(135deg,'+grad+')';
  var label = p.category_label || p.categoryLabel || p.category;

  document.getElementById('featuredPost').innerHTML =
    '<div class="tip-featured reveal">'
    +'<div class="tf-cover" style="'+coverStyle+'">'+coverHtml
    +'<span class="tf-tag">'+label+'</span>'
    +'<span class="tf-badge"><i class="bi bi-fire me-1"></i>Nổi bật</span>'
    +'</div>'
    +'<div class="tf-body">'
    +'<div class="tf-title">'+p.title+'</div>'
    +'<div class="tf-desc">'+p.excerpt+'</div>'
    +'<div class="tf-footer">'
    +'<div class="d-flex align-items-center gap-2">'
    +'<span class="ava-sm" style="background:'+(p.author_color||p.authorColor)+'">'+
      (p.author_initials||p.authorInitials)+'</span>'
    +'<span style="font-size:.78rem;color:var(--ink-soft)">'+p.author+'</span>'
    +'</div>'
    +'<a href="bai-viet.html?id='+p.id+'" class="tip-read">Đọc bài viết →</a>'
    +'</div></div></div>';
}

function renderPostsGrid(posts){
  document.getElementById('postsGrid').innerHTML = posts.map(function(p){
    var grad = GRAD_MAP[p.category] || 'var(--coral),var(--amber)';
    var coverHtml = p.cover
      ? '<img src="'+p.cover+'" alt="'+p.title+'" style="width:100%;height:100%;object-fit:cover">'
      : '';
    var coverStyle = p.cover ? '' : 'background:linear-gradient(135deg,'+grad+')';
    var label = p.category_label || p.categoryLabel || p.category;

    return '<div class="tip-card reveal">'
      +'<div class="tc-cover" style="'+coverStyle+'">'+coverHtml
      +'<span class="tc-tag">'+label+'</span></div>'
      +'<div class="tc-body">'
      +'<div class="tc-title">'+p.title+'</div>'
      +'<div class="tc-desc">'+p.excerpt+'</div>'
      +'<div class="tc-footer">'
      +'<div class="tc-meta"><span class="ava-sm" style="background:'+
        (p.author_color||p.authorColor)+'">'+(p.author_initials||p.authorInitials)+'</span> '+p.author+'</div>'
      +'<a href="bai-viet.html?id='+p.id+'" class="tip-read">Đọc →</a>'
      +'</div></div></div>';
  }).join('');
}

function showPostsEmpty(){
  document.getElementById('featuredPost').innerHTML = '';
  document.getElementById('postsGrid').innerHTML =
    '<div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--ink-soft)">'
    +'<i class="bi bi-pen" style="font-size:2.5rem;opacity:.2;display:block;margin-bottom:.6rem"></i>'
    +'<p>Chưa có bài viết nào</p></div>';
}
