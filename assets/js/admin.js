/* Emje Motion Admin — header dropdown + hide Elementor nags */
(function(){
  function initHeader(){
    var header = document.getElementById('emjeAdminHeader');
    if(!header) return;
    var toggle = header.querySelector('.emje-admin-header__toggle');
    var dropdown = document.getElementById('emjeAdminDropdown');
    if(!toggle || !dropdown) return;
    function setOpen(open){
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    toggle.addEventListener('click', function(e){
      e.stopPropagation();
      var isOpen = header.classList.contains('is-open');
      setOpen(!isOpen);
    });
    document.addEventListener('click', function(e){
      if(!header.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function(){
      if(window.innerWidth > 768) setOpen(false);
    });
  }
  function initOverviewDirty(){
    var btn = document.getElementById('emjeSaveBtn');
    var form = btn ? btn.closest('form') : null;
    if(!btn || !form) return;
    var checks = form.querySelectorAll('input[type="checkbox"][name^="module_"]');
    if(!checks.length) return;
    var initial = Array.prototype.map.call(checks, function(c){ return c.checked; });
    function update(){
      var dirty = Array.prototype.some.call(checks, function(c,i){ return c.checked !== initial[i]; });
      btn.disabled = !dirty;
      btn.setAttribute('aria-disabled', dirty ? 'false' : 'true');
      btn.title = dirty ? '' : 'No changes to save';
    }
    Array.prototype.forEach.call(checks, function(c){ c.addEventListener('change', update); });
    update();
  }
  function initSettingsDirty(){
    var btn = document.getElementById('emjeSaveSettingsBtn');
    var form = btn ? btn.closest('form') : null;
    if(!btn || !form) return;
    var checks = form.querySelectorAll('input[type="checkbox"]');
    var ranges = form.querySelectorAll('input[type="range"]');
    if(!checks.length && !ranges.length) return;
    var initialChecks = Array.prototype.map.call(checks, function(c){ return c.checked; });
    var initialRanges = Array.prototype.map.call(ranges, function(r){ return r.value; });
    function update(){
      var dirtyChecks = Array.prototype.some.call(checks, function(c,i){ return c.checked !== initialChecks[i]; });
      var dirtyRanges = Array.prototype.some.call(ranges, function(r,i){ return r.value !== initialRanges[i]; });
      var dirty = dirtyChecks || dirtyRanges;
      btn.disabled = !dirty;
      btn.setAttribute('aria-disabled', dirty ? 'false' : 'true');
      btn.title = dirty ? '' : 'No changes to save';
    }
    Array.prototype.forEach.call(checks, function(c){ c.addEventListener('change', update); });
    Array.prototype.forEach.call(ranges, function(r){ r.addEventListener('input', update); r.addEventListener('change', update); });
    update();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ initHeader(); initOverviewDirty(); initSettingsDirty(); });
  } else { initHeader(); initOverviewDirty(); initSettingsDirty(); }

  function initToasts(){
    var notices = document.querySelectorAll('body.toplevel_page_emje-motion .notice.is-dismissible, body.emje-motion_page_emje-motion-settings .notice.is-dismissible, body.emje-motion_page_emje-motion-about .notice.is-dismissible, body.toplevel_page_emje-motion .notice.notice-success, body.emje-motion_page_emje-motion-settings .notice.notice-success, body.emje-motion_page_emje-motion-about .notice.notice-success');
    notices.forEach(function(n){
      // skip Elementor nags already hidden
      if(n.querySelector('.elementor-message, .e-notice')) return;
      // wrap inner content so padding doesn't stretch with outer transform (fix choppy)
      var inner = n.querySelector('.emje-toast-inner');
      if(!inner){
        inner = document.createElement('div');
        inner.className = 'emje-toast-inner';
        // move existing p/text nodes into inner (button may be added later by WP)
        var toMove = [];
        Array.prototype.forEach.call(n.childNodes, function(c){
          if(c.nodeType === 1 && c.classList && c.classList.contains('emje-toast-inner')) return;
          if(c.nodeType === 3 && c.textContent.trim() === '') return;
          if(c.nodeType === 1 || (c.nodeType === 3 && c.textContent.trim() !== '')) toMove.push(c);
        });
        toMove.forEach(function(c){ inner.appendChild(c); });
        n.appendChild(inner);
      }
      // if WP added dismiss button outside inner (common.js runs after us), move it inside immediately
      var outerBtn = n.querySelector(':scope > .notice-dismiss');
      if(outerBtn && outerBtn.parentNode !== inner){
        inner.appendChild(outerBtn);
      }
      // ensure dismiss button is inside inner and has correct style (icon via CSS ::before/::after, no JS inject needed for appear)
      var btn = n.querySelector('.notice-dismiss');
      if(btn){
        if(inner && btn.parentNode !== inner){
          inner.appendChild(btn);
        }
        // remove any leftover <i> from previous version to avoid double icon
        var oldIcon = btn.querySelector('.ph-duotone, .ph');
        if(oldIcon) oldIcon.remove();
        // ensure empty button will still show CSS icon
        if(btn.textContent.trim() === '') btn.setAttribute('aria-label', 'Dismiss');
      }
      var timer;
      function hide(){ n.classList.add('is-hiding'); setTimeout(function(){ n.style.display='none'; }, 220); }
      function start(){ clearTimeout(timer); timer = setTimeout(hide, 3000); }
      function stop(){ clearTimeout(timer); }
      n.addEventListener('mouseenter', stop);
      n.addEventListener('mouseleave', function(){ clearTimeout(timer); timer = setTimeout(hide, 1500); });
      if(btn) btn.addEventListener('click', function(){ clearTimeout(timer); hide(); });
      // delay start until appear animation finishes (.32s)
      setTimeout(start, 340);
    });
    // observe for WP common.js adding dismiss button outside inner (fix X below bug)
    if(window.MutationObserver && !window._emjeToastObserver){
      window._emjeToastObserver = new MutationObserver(function(muts){
        muts.forEach(function(m){
          m.addedNodes.forEach(function(node){
            if(node.nodeType !== 1) return;
            var btns = [];
            if(node.matches && node.matches('.notice-dismiss')) btns.push(node);
            if(node.querySelectorAll) {
              var found = node.querySelectorAll('.notice-dismiss');
              for(var i=0;i<found.length;i++) btns.push(found[i]);
            }
            btns.forEach(function(b){
              var notice = b.closest('.notice');
              if(!notice) return;
              if(notice.querySelector('.elementor-message, .e-notice')) return;
              var inner = notice.querySelector('.emje-toast-inner');
              if(inner && b.parentNode !== inner){
                inner.appendChild(b);
              }
            });
            // also handle notice added with inner already
            if(node.matches && node.matches('.notice')){
              var n2 = node;
              if(n2.querySelector('.elementor-message, .e-notice')) return;
              if(!n2.querySelector('.emje-toast-inner')){
                var inner2 = document.createElement('div');
                inner2.className = 'emje-toast-inner';
                var toMove2 = [];
                Array.prototype.forEach.call(n2.childNodes, function(c){
                  if(c.nodeType === 1 && c.classList && c.classList.contains('emje-toast-inner')) return;
                  if(c.nodeType === 3 && c.textContent.trim() === '') return;
                  if(c.nodeType === 1 || (c.nodeType === 3 && c.textContent.trim() !== '')) toMove2.push(c);
                });
                toMove2.forEach(function(c){ inner2.appendChild(c); });
                n2.appendChild(inner2);
              }
            }
          });
        });
      });
      window._emjeToastObserver.observe(document.body, {childList:true, subtree:true});
    }
  }
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
        if(notice) {
          // don't hide our own success toast
          if(notice.classList.contains('notice-success') && notice.textContent.indexOf('Features saved') !== -1) return;
          if(notice.classList.contains('notice-success') && notice.textContent.indexOf('Settings saved') !== -1) return;
          if(notice.classList.contains('notice-success') && notice.textContent.indexOf('Modules updated') !== -1) return;
          if(notice.textContent.indexOf("You're up to date") !== -1) return;
          notice.style.display='none';
        }
        else { el.style.display='none'; }
      });
    });
    // Text fallback: "Want to shape the future"
    document.querySelectorAll('.notice, .updated, .error').forEach(function(n){
      if(n.textContent && n.textContent.indexOf('Want to shape the future') !== -1){
        n.style.display='none';
      }
    });
    initToasts();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', hideNags);
  } else { hideNags(); }
  // Re-run after Elementor injects via ajax
  setTimeout(hideNags, 500);
  setTimeout(hideNags, 1500);
})();
