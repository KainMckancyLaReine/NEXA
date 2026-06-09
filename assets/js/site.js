/* ============================================================
   NEXA — Shared site behaviour (subpages)
   nav scroll · mobile menu · reveals · marquee · Book-a-demo
   ============================================================ */
(function () {
  const $ = s => document.querySelector(s);

  /* nav scrolled state */
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* mobile menu */
  const tgl = $('#navToggle'), mMenu = $('#mMenu'), mBack = $('#mBackdrop');
  if (tgl && mMenu) {
    const close = () => { mMenu.classList.remove('open'); mBack && mBack.classList.remove('open'); };
    tgl.addEventListener('click', () => { mMenu.classList.toggle('open'); mBack && mBack.classList.toggle('open'); });
    mBack && mBack.addEventListener('click', close);
    mMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach((el, i) => { io.observe(el); });

  /* integration marquee (if present) */
  const track = $('#intTrack');
  if (track && window.brandLogo) {
    const names = ['Gmail','Outlook','Slack','Microsoft Teams','HubSpot','Salesforce','Notion','Asana','Monday','SAP','Google Calendar','Microsoft 365'];
    const make = () => names.map(n => `<div class="m-item"><div class="logo-tile">${brandLogo(n)}</div>${n}</div>`).join('');
    track.innerHTML = make() + make();
  }

  /* Book a Demo modal */
  (function demo() {
    const modal = $('#demoModal'); if (!modal) return;
    let selDate = null, selTime = null, built = false;
    const lc = () => (window.I18N ? I18N.lang : 'en');
    function build() {
      if (built) return; built = true;
      const dd = $('#dDates'), dt = $('#dTimes');
      const d = new Date(); let n = 0;
      while (n < 5) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) {
        const day = new Date(d); const c = document.createElement('button'); c.className = 'ch' + (n === 0 ? ' sel' : '');
        c.innerHTML = `${day.toLocaleDateString(lc(), { weekday: 'short' })}<span class="d2">${day.toLocaleDateString(lc(), { day: 'numeric', month: 'short' })}</span>`;
        c.onclick = () => { dd.querySelectorAll('.ch').forEach(x => x.classList.remove('sel')); c.classList.add('sel'); selDate = day; };
        dd.appendChild(c); if (n === 0) selDate = day; n++;
      } }
      ['09:00','10:30','13:00','14:30','16:00'].forEach((tm, i) => {
        const c = document.createElement('button'); c.className = 'ch' + (i === 0 ? ' sel' : ''); c.textContent = tm;
        c.onclick = () => { dt.querySelectorAll('.ch').forEach(x => x.classList.remove('sel')); c.classList.add('sel'); selTime = tm; };
        dt.appendChild(c); if (i === 0) selTime = tm;
      });
    }
    const topicsBound = () => modal.querySelectorAll('#dTopics .ch').forEach(b => b.onclick = () => b.classList.toggle('sel'));
    const open = () => { build(); topicsBound(); modal.classList.add('open'); document.body.style.overflow = 'hidden'; if (window.I18N) I18N.apply(modal); };
    const close = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
    document.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); open(); }));
    const xb = document.querySelector('[data-demo-close]'); if (xb) xb.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    const cf = $('#dConfirm');
    if (cf) cf.addEventListener('click', () => {
      const em = $('#dEmail').value.trim();
      if (!em) { $('#dEmail').style.borderColor = 'var(--error)'; $('#dEmail').focus(); return; }
      const topics = [...modal.querySelectorAll('#dTopics .ch.sel')].map(b => b.dataset.topic);
      const dateStr = selDate ? selDate.toLocaleDateString(lc(), { weekday: 'long', day: 'numeric', month: 'long' }) : '';
      $('#demoForm').classList.add('hidden'); $('#demoDone').classList.remove('hidden');
      $('#demoWhen').innerHTML = `${dateStr} · ${selTime}` + (topics.length ? `<br><span style="font-weight:400;color:var(--text-2)">${topics.join(' · ')}</span>` : '');
    });
  })();

  document.addEventListener('DOMContentLoaded', () => { if (window.I18N) I18N.apply(); });
})();
