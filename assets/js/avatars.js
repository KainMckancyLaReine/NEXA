/* ============================================================
   NEXA — AI employee avatars
   Generates a unique, role-themed robot portrait per AI as inline
   SVG (no stock human photos). Color comes from AICOLOR, the small
   badge glyph reflects the employee's function.
   Usage:  el.innerHTML = aiAvatar('FM', 64);
   ============================================================ */
(function () {
  // role glyphs, drawn around their own origin then placed in the badge
  var GLYPHS = {
    OM: '<g transform="translate(9,9)"><circle r="3" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
        '<g stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><line x1="0" y1="-6.5" x2="0" y2="-4"/><line x1="0" y1="4" x2="0" y2="6.5"/><line x1="-6.5" y1="0" x2="-4" y2="0"/><line x1="4" y1="0" x2="6.5" y2="0"/><line x1="-4.6" y1="-4.6" x2="-3" y2="-3"/><line x1="3" y1="3" x2="4.6" y2="4.6"/><line x1="3" y1="-3" x2="4.6" y2="-4.6"/><line x1="-4.6" y1="4.6" x2="-3" y2="3"/></g></g>',
    SM: '<g transform="translate(9,9)" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="-6,4 -1,-1 2,2 6,-4"/><polyline points="3,-4 6,-4 6,-1"/></g>',
    FM: '<text x="9" y="13.6" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor" font-family="Inter,system-ui,sans-serif">€</text>',
    SA: '<g transform="translate(9,9)" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M-5 1 A5 5 0 0 1 5 1"/><rect x="-6.6" y="1" width="3" height="5.4" rx="1.3" fill="currentColor" stroke="none"/><rect x="3.6" y="1" width="3" height="5.4" rx="1.3" fill="currentColor" stroke="none"/></g>',
    RA: '<g transform="translate(9,9)" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="-1" cy="-1" r="4"/><line x1="2" y1="2" x2="6.2" y2="6.2"/></g>',
    DOC:'<g transform="translate(9,9)" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"><rect x="-4.5" y="-6" width="9" height="12" rx="1.6"/><line x1="-2" y1="-2.6" x2="2" y2="-2.6"/><line x1="-2" y1="0" x2="2" y2="0"/><line x1="-2" y1="2.6" x2="1" y2="2.6"/></g>',
    DA: '<g transform="translate(9,9)" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="-4.5" y1="5" x2="-4.5" y2="1"/><line x1="0" y1="5" x2="0" y2="-3"/><line x1="4.5" y1="5" x2="4.5" y2="-1"/></g>',
    MM: '<g transform="translate(9,9)" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M-6 -1.5 L3 -5.5 L3 5.5 L-6 1.5 Z"/><line x1="-2.5" y1="3.2" x2="-1.5" y2="7"/></g>',
    PM: '<g transform="translate(9,9)" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><path d="M-5 -2 L0 -5 L5 -2 L0 1 Z"/><path d="M-5 -2 L-5 4.5 L0 7.5 L5 4.5 L5 -2"/><line x1="0" y1="1" x2="0" y2="7.5"/></g>'
  };
  GLYPHS._default = GLYPHS.DOC;

  function shade(hex, amt) {
    // darken a #rrggbb hex toward black by amt (0..1)
    try {
      var n = parseInt(hex.slice(1), 16);
      var r = Math.round(((n >> 16) & 255) * (1 - amt));
      var g = Math.round(((n >> 8) & 255) * (1 - amt));
      var b = Math.round((n & 255) * (1 - amt));
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    } catch (e) { return '#0B1220'; }
  }

  window.aiAvatar = function (id, size) {
    size = size || 96;
    var col = (window.AICOLOR && AICOLOR[id]) || '#3B82F6';
    var name = (window.AINAMES && AINAMES[id]) || id;
    var uid = 'av' + id + Math.floor(Math.random() * 1e6);
    var glyph = GLYPHS[id] || GLYPHS._default;
    return '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" role="img" aria-label="' + name + ' — AI avatar" xmlns="http://www.w3.org/2000/svg" style="display:block">' +
      '<defs>' +
      '<linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + col + '"/><stop offset="1" stop-color="' + shade(col, 0.55) + '"/></linearGradient>' +
      '<radialGradient id="' + uid + 'g" cx="50%" cy="30%" r="62%"><stop offset="0" stop-color="rgba(255,255,255,.4)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>' +
      '</defs>' +
      '<rect width="100" height="100" rx="24" fill="url(#' + uid + ')"/>' +
      '<rect width="100" height="100" rx="24" fill="url(#' + uid + 'g)"/>' +
      // antenna
      '<line x1="50" y1="19" x2="50" y2="29" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".92"/>' +
      '<circle cx="50" cy="16" r="3.4" fill="#fff"/>' +
      // ear pods
      '<rect x="19" y="42" width="6.5" height="16" rx="3.2" fill="#EAF1FB"/><rect x="74.5" y="42" width="6.5" height="16" rx="3.2" fill="#EAF1FB"/>' +
      // head
      '<rect x="26" y="28" width="48" height="44" rx="15" fill="#F4F8FF"/>' +
      '<rect x="26" y="28" width="48" height="44" rx="15" fill="none" stroke="rgba(11,18,32,.08)" stroke-width="1"/>' +
      // visor
      '<rect x="32" y="39" width="36" height="18" rx="9" fill="#0B1220"/>' +
      // eyes
      '<circle cx="43" cy="48" r="3.5" fill="' + col + '"><animate attributeName="opacity" values="1;.35;1" dur="3.2s" repeatCount="indefinite"/></circle>' +
      '<circle cx="57" cy="48" r="3.5" fill="' + col + '"><animate attributeName="opacity" values="1;.35;1" dur="3.2s" begin="0.4s" repeatCount="indefinite"/></circle>' +
      // smile
      '<path d="M43 64 Q50 69 57 64" stroke="rgba(11,18,32,.32)" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      // role badge
      '<g transform="translate(63,63)" color="' + col + '"><circle cx="9" cy="9" r="12" fill="#fff"/><circle cx="9" cy="9" r="12" fill="none" stroke="' + col + '" stroke-width="2"/>' + glyph + '</g>' +
      '</svg>';
  };
})();
