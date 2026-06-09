/* ============================================================
   NEXA — logo preloader
   Shows ONCE per session (the main 5s intro) on the first page
   loaded. Navigating between pages does NOT show it again.
   Self-contained: injects its own critical CSS, runs from <head>.
   ============================================================ */
(function () {
  try {
    if (window.__nexaPreloaded) return;
    window.__nexaPreloaded = true;

    // Only the first page in a session shows the preloader.
    try {
      if (sessionStorage.getItem('nexa_pre_seen')) return;
      sessionStorage.setItem('nexa_pre_seen', '1');
    } catch (e) { /* if storage blocked, still show once per page load */ }

    var ROOT = document.documentElement;
    var TOTAL = 5000;          // full intro length
    var FADE = 550;
    var visible = TOTAL - FADE;

    var st = document.createElement('style');
    st.id = 'nexa-pre-style';
    st.textContent =
      '#nexa-pre{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;' +
      'background:radial-gradient(120% 120% at 50% 0%,#ffffff 0%,#eef2f8 100%);transition:opacity .55s ease,visibility .55s;}' +
      '#nexa-pre.hide{opacity:0;visibility:hidden;}' +
      '#nexa-pre .nplogo{width:clamp(86px,16vw,128px);height:auto;display:block;opacity:0;transform:scale(.7) translateY(8px) rotate(-6deg);' +
      'filter:drop-shadow(0 14px 34px rgba(124,58,237,.30));animation:nppop .7s cubic-bezier(.2,.85,.25,1) forwards, npfloat 3.4s ease-in-out .7s infinite;}' +
      '#nexa-pre .npw{font-family:Inter,system-ui,-apple-system,sans-serif;font-weight:900;letter-spacing:-.05em;' +
      'font-size:clamp(1.8rem,6vw,2.7rem);color:#0A0A0A;display:flex;align-items:center;line-height:1;height:1.1em;}' +
      '#nexa-pre .npw .cur{display:inline-block;width:.07em;height:.9em;background:#7C3AED;margin-left:.08em;border-radius:2px;' +
      'animation:npblink 1s steps(1) infinite;}' +
      '#nexa-pre .npbar{width:124px;height:3px;border-radius:3px;background:rgba(10,10,10,.08);overflow:hidden;margin-top:-8px;}' +
      '#nexa-pre .npbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#3B82F6,#7C3AED);transition:width ' + (visible - 400) + 'ms ease;}' +
      '#nexa-pre .npsub{font-family:Inter,sans-serif;font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#9aa3af;' +
      'opacity:0;transition:opacity .5s ease;}' +
      '@keyframes nppop{0%{opacity:0;transform:scale(.7) translateY(8px) rotate(-6deg);}60%{opacity:1;}100%{opacity:1;transform:scale(1) translateY(0) rotate(0);}}' +
      '@keyframes npfloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}' +
      '@keyframes npblink{50%{opacity:0;}}' +
      '@media(prefers-reduced-motion:reduce){#nexa-pre .nplogo{animation:none;opacity:1;transform:none;}#nexa-pre .npw .cur{animation:none;}}';
    (document.head || ROOT).appendChild(st);

    var o = document.createElement('div');
    o.id = 'nexa-pre';
    o.innerHTML =
      '<img class="nplogo" src="assets/img/nexa-mark-trans.png" alt="NEXA" ' +
        'onerror="this.onerror=null;this.src=\'assets/img/nexa-mark.png\'">' +
      '<div class="npw"><span class="t"></span><span class="cur"></span></div>' +
      '<div class="npbar"><i></i></div>' +
      '<div class="npsub">AI Workforce OS</div>';

    function mount() {
      if (document.body) { document.body.appendChild(o); document.body.style.overflow = 'hidden'; }
      else { ROOT.appendChild(o); document.addEventListener('DOMContentLoaded', function () {
        if (document.body && o.parentNode === ROOT) { document.body.appendChild(o); document.body.style.overflow = 'hidden'; }
      }); }
    }
    mount();

    var word = 'NEXA', tEl = o.querySelector('.t'), sub = o.querySelector('.npsub'),
        bar = o.querySelector('.npbar i'), i = 0, finished = false;

    function type() {
      if (i < word.length) { tEl.textContent += word.charAt(i++); setTimeout(type, 150); }
      else { sub.style.opacity = '1'; }
    }
    function done() {
      if (finished) return; finished = true;
      o.classList.add('hide');
      if (document.body) document.body.style.overflow = '';
      setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); var s = document.getElementById('nexa-pre-style'); if (s) s.remove(); }, FADE);
    }

    setTimeout(function () { if (bar) bar.style.width = '100%'; }, 200);  // bar fills across the intro
    setTimeout(type, 650);            // type the wordmark after the logo pops in
    setTimeout(done, visible);        // start fade so it's fully gone at ~5s
  } catch (e) { /* never let the preloader break the page */ }
})();
