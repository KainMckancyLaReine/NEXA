/* ============================================================
   NEXA — Real, current brand logos for integrations
   Loads the live brand logo (Clearbit, hi-res) and falls back
   to the live Google favicon (always current, ~2025), then to a
   branded letter tile. This guarantees a real logo for every
   integration and stays up to date automatically.
   ============================================================ */

/* AI employees — human names + accent colors (shared across pages) */
window.AINAMES = { OM:'Emma', SM:'Liam', FM:'Sophie', SA:'Noah', RA:'Maya', DA:'Lucas', MM:'Olivia', PM:'Daniel', DOC:'Ava' };
window.AICOLOR = { OM:'#6366F1', SM:'#16A34A', FM:'#F59E0B', SA:'#EC4899', RA:'#06B6D4', DA:'#2563EB', MM:'#7C3AED', PM:'#F97316', DOC:'#0EA5E9' };
window.aiInitial = code => ((window.AINAMES[code] || code)[0] || '?');

/* brand → primary domain (drives both the logo and the favicon) + fallback colour */
window.BRAND = {
  'Gmail':            { domain:'gmail.com',              fb:'#EA4335' },
  'Outlook':          { domain:'outlook.com',            fb:'#0078D4' },
  'Slack':            { domain:'slack.com',              fb:'#4A154B' },
  'Microsoft Teams':  { domain:'teams.microsoft.com',    fb:'#6264A7' },
  'HubSpot':          { domain:'hubspot.com',            fb:'#FF7A59' },
  'Salesforce':       { domain:'salesforce.com',         fb:'#00A1E0' },
  'Notion':           { domain:'notion.so',              fb:'#111111' },
  'Asana':            { domain:'asana.com',              fb:'#F06A6A' },
  'Monday':           { domain:'monday.com',             fb:'#FF3D57' },
  'AFAS':             { domain:'afas.nl',                fb:'#E2001A' },
  'Exact':            { domain:'exact.com',              fb:'#ED1C24' },
  'SAP':              { domain:'sap.com',                fb:'#0FAAFF' },
  'Dynamics':         { domain:'dynamics.microsoft.com', fb:'#002050' },
  'Google Calendar':  { domain:'calendar.google.com',    fb:'#4285F4' },
  'Microsoft 365':    { domain:'microsoft365.com',       fb:'#D83B01' },
};

/* Returns the inner HTML for a `.logo-tile` container (img + branded fallback). */
window.brandLogo = function (name) {
  const b = window.BRAND[name] || {};
  const letter = (name && name[0]) || '?';
  const fb = b.fb || '#3B82F6';
  if (b.domain) {
    const clearbit = 'https://logo.clearbit.com/' + b.domain + '?size=128';
    const favicon = 'https://www.google.com/s2/favicons?domain=' + b.domain + '&sz=128';
    // onerror chain: Clearbit logo -> Google favicon -> branded letter
    const onerr = "if(!this.dataset.t){this.dataset.t=1;this.src=this.dataset.fav;}else{this.closest('.logo-tile').classList.add('imgfail');}";
    return `<img src="${clearbit}" data-fav="${favicon}" alt="${name} logo" loading="lazy" onerror="${onerr}">` +
           `<span class="fallback" style="background:${fb}">${letter}</span>`;
  }
  return `<span class="fallback" style="background:${fb};display:grid">${letter}</span>`;
};
