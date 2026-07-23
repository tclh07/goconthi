/* ===== Chi tiết đề — Payment & Copy logic ===== */
function switchPayTab(tab){
  document.querySelectorAll('.pay-tab').forEach(function(b){ b.classList.remove('active'); });
  document.querySelector('.pay-tab[data-tab="'+tab+'"]').classList.add('active');
  document.getElementById('panelBank').style.display = tab==='bank' ? '' : 'none';
  document.getElementById('panelMomo').style.display = tab==='momo' ? '' : 'none';
}
function copyText(text){
  if(navigator.clipboard){
    navigator.clipboard.writeText(text).then(function(){
      showCopyToast('Đã sao chép: '+text);
    });
  } else {
    var ta=document.createElement('textarea');
    ta.value=text;document.body.appendChild(ta);ta.select();
    document.execCommand('copy');document.body.removeChild(ta);
    showCopyToast('Đã sao chép: '+text);
  }
}
function showCopyToast(msg){
  var t=document.getElementById('copyToast');
  if(t){t.remove();}
  t=document.createElement('div');
  t.id='copyToast';
  t.style.cssText='position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:.6rem 1.2rem;border-radius:12px;font-size:.88rem;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.18);animation:fadeInUp .3s';
  t.innerHTML='<i class="bi bi-check-circle-fill" style="color:var(--teal);margin-right:.4rem"></i> '+msg;
  document.body.appendChild(t);
  setTimeout(function(){t.remove();},2500);
}
function confirmPayment(){
  var contact=document.getElementById('payContact').value.trim();
  if(!contact){alert('Vui lòng nhập số Zalo hoặc Email để nhận file!');return;}
  alert('Cảm ơn bạn! Đơn hàng đã được ghi nhận.\nAdmin sẽ kiểm tra CK và duyệt trong vài phút.\nLiên hệ: '+contact);
  var modal=document.getElementById('paymentModal');
  if(modal && window.bootstrap){var inst=bootstrap.Modal.getInstance(modal);if(inst)inst.hide();}
}
