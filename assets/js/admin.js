/* Emje Motion Admin — hide Elementor nags on Emje pages (fallback for :has) */
(function(){
  function hideNags(){
    var sels = [
      '.elementor-message',
      '.e-notice',
      '.notice.elementor-notice',
      'div[data-elementor-message]'
    ];
    sels.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        var notice = el.closest('.notice, .updated, .error, .is-dismissible');
        if(notice) { notice.style.display='none'; }
        else { el.style.display='none'; }
      });
    });
    // Text fallback: "Want to shape the future"
    document.querySelectorAll('.notice, .updated, .error').forEach(function(n){
      if(n.textContent && n.textContent.indexOf('Want to shape the future') !== -1){
        n.style.display='none';
      }
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', hideNags);
  } else { hideNags(); }
  // Re-run after Elementor injects via ajax
  setTimeout(hideNags, 500);
  setTimeout(hideNags, 1500);
})();
