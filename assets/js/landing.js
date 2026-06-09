/* ============================================================
   NEXA — Landing (vanilla, light & smooth)
   No heavy scroll libs; native scroll + IntersectionObserver.
   ============================================================ */
(function () {
  const $ = s => document.querySelector(s);
  const t = k => (window.I18N ? I18N.t(k) : k);
  const lang = () => (window.I18N ? I18N.lang : 'en');

  /* ---------- Nav scroll + mobile menu ---------- */
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const tgl = $('#navToggle'), mMenu = $('#mMenu'), mBack = $('#mBackdrop');
  const closeM = () => { mMenu.classList.remove('open'); mBack.classList.remove('open'); };
  if (tgl) {
    tgl.addEventListener('click', () => { mMenu.classList.toggle('open'); mBack.classList.toggle('open'); });
    mBack.addEventListener('click', closeM);
    mMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeM));
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Problem chips ---------- */
  const probs = [
    ['✉','Incoming emails','#2563EB'], ['◷','Meetings','#6366F1'], ['☑','Tasks','#16A34A'],
    ['⇄','CRM updates','#06B6D4'], ['€','Invoices','#F59E0B'], ['☎','Customer requests','#EF4444'],
    ['⚠','Missed follow-ups','#EF4444'], ['⊞','Reports','#7C3AED'], ['◴','Reminders','#F97316'],
  ];
  const pg = $('#probGrid');
  if (pg) probs.forEach(p => {
    const d = document.createElement('div'); d.className = 'prob-chip';
    d.innerHTML = `<span class="i" style="background:${p[2]}1f;color:${p[2]}">${p[0]}</span>${p[1]}`;
    pg.appendChild(d);
  });

  /* ---------- Statements reveal ---------- */
  const stEl = $('#statements');
  if (stEl) {
    const so = new IntersectionObserver(es => {
      if (es[0].isIntersecting) {
        stEl.querySelectorAll('.st').forEach((s, i) => setTimeout(() => s.classList.add('on'), 250 + i * 400));
        so.disconnect();
      }
    }, { threshold: 0.4 });
    so.observe(stEl);
  }

  /* ---------- Workforce cards (named AI employees) ---------- */
  const WF = [
    { in:'E', name:'Emma',  role:'AI Operations Manager', c:'#6366F1', tasks:112, time:'6.4h', perf:99, st:'live', href:'employee.html?id=OM' },
    { in:'L', name:'Liam',  role:'AI Sales Manager',      c:'#16A34A', tasks:64,  time:'4.1h', perf:97, st:'live', href:'employee.html?id=SM' },
    { in:'S', name:'Sophie',role:'AI Finance Manager',    c:'#F59E0B', tasks:38,  time:'3.2h', perf:98, st:'busy', href:'employee.html?id=FM' },
    { in:'N', name:'Noah',  role:'AI Support Agent',      c:'#EC4899', tasks:124, time:'8.9h', perf:96, st:'live', href:'employee.html?id=SA' },
    { in:'M', name:'Maya',  role:'AI Recruiting Agent',   c:'#06B6D4', tasks:53,  time:'5.0h', perf:95, st:'live', href:'employee.html?id=RA' },
    { in:'+', name:'Hire more', role:'From the marketplace', c:'#0A0A0A', tasks:'∞', time:'—', perf:100, st:'idle', href:'marketplace.html' },
  ];
  const wg = $('#wfGrid');
  if (wg) WF.forEach((e, i) => {
    const a = document.createElement('a'); a.href = e.href; a.className = 'empc glass reveal'; a.style.transitionDelay = (i * 40) + 'ms';
    a.innerHTML = `<div class="av" style="background:${e.c}">${e.in}</div>
      <div class="pn">${e.name}</div><div class="rl">${e.role}</div>
      <div class="ms"><div class="m"><div class="v">${e.tasks}</div><div class="k">Tasks today</div></div>
      <div class="m"><div class="v">${e.time}</div><div class="k">Time saved</div></div></div>
      <div class="ft"><span class="status-dot ${e.st}"></span> ${e.perf}% · ${e.st}</div>`;
    wg.appendChild(a); io.observe(a);
  });

  /* ---------- Integrations (real logos) ---------- */
  const ig = $('#intGrid');
  if (ig) ['Gmail','Outlook','Slack','Microsoft Teams','HubSpot','Salesforce','Notion','Asana','Monday','AFAS','Exact','SAP','Dynamics','Google Calendar','Microsoft 365']
    .forEach(n => { const d = document.createElement('div'); d.className = 'integ';
      d.innerHTML = `<div class="logo-tile">${window.brandLogo ? brandLogo(n) : n}</div><span>${n}</span>`; ig.appendChild(d); });

  /* ---------- Counters ---------- */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count, suf = el.dataset.suffix || '';
    const co = new IntersectionObserver(es => {
      if (es[0].isIntersecting) {
        let v = 0; const step = target / 40;
        const tick = () => { v += step; if (v >= target) { el.textContent = target + suf; } else { el.textContent = Math.round(v) + suf; requestAnimationFrame(tick); } };
        tick(); co.disconnect();
      }
    }, { threshold: 0.6 });
    co.observe(el);
  });

  /* ---------- ROI calculator ---------- */
  (function roi() {
    const emp = $('#rEmp'), sal = $('#rSal'), hrs = $('#rHrs'); if (!emp) return;
    let indF = 1.0;
    const seg = $('#indSeg');
    seg.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') return; seg.querySelectorAll('button').forEach(b => b.classList.remove('active')); e.target.classList.add('active'); indF = parseFloat(e.target.dataset.f); calc(); });
    const eur = n => '€' + Math.round(n).toLocaleString('en-US');
    const num = n => Math.round(n).toLocaleString('en-US');
    function anim(el, val, fmt) { const cur = +(el.dataset._v || 0); const s = (val - cur) / 24; let v = cur, i = 0; const tick = () => { i++; v += s; if (i >= 24) { el.textContent = fmt(val); el.dataset._v = val; } else { el.textContent = fmt(v); requestAnimationFrame(tick); } }; tick(); }
    function calc() {
      const E = +emp.value, S = +sal.value, H = +hrs.value;
      $('#vEmp').textContent = E; $('#vSal').textContent = eur(S); $('#vHrs').textContent = H;
      const hourly = S / 1880, hoursYr = E * H * 46, autom = 0.62 * indF;
      anim($('#oSave'), hoursYr * hourly * autom, eur);
      anim($('#oHours'), hoursYr * autom, num);
      $('#oProd').textContent = Math.min(95, Math.round(18 + H * 1.6 * indF)) + '%';
      $('#oScore').textContent = Math.min(99, Math.round(70 + autom * 40));
    }
    [emp, sal, hrs].forEach(r => r.addEventListener('input', calc));
    const ro = new IntersectionObserver(es => { if (es[0].isIntersecting) { calc(); ro.disconnect(); } }, { threshold: 0.3 });
    ro.observe($('#roi')); calc();
  })();

  /* ---------- Pricing (monthly / yearly · free Mac only on Scale) ---------- */
  const TIERS = [
    { tier:'Starter',   mo:499,  yr:399,  emp:'pr.emp1',  laptop:false, feats:['pr.emp1','pr.feat.int3','pr.f.cc','pr.f.voice','pr.feat.email'] },
    { tier:'Growth',    mo:1499, yr:1199, emp:'pr.emp5',  laptop:false, feat:true, feats:['pr.emp5','pr.feat.intU','pr.feat.exec','pr.feat.prio','pr.f.voice'] },
    { tier:'Scale',     mo:4999, yr:3999, emp:'pr.emp25', laptop:true,  feats:['pr.emp25','pr.feat.adv','pr.f.workflows','pr.f.csm','pr.f.laptop'] },
    { tier:'Enterprise',mo:null, yr:null, emp:'pr.empU',  laptop:false, custom:true, feats:['pr.feat.unlwf','pr.f.infra','pr.f.models','pr.feat.advsec','pr.f.csm'] },
  ];
  const LAPTOP = { en:'+ Free MacBook or PC', de:'+ Gratis MacBook oder PC', nl:'+ Gratis MacBook of pc' };
  const CUSTOM = { en:'Custom', de:'Individuell', nl:'Op maat' };
  let bill = 'monthly';
  function renderPricing() {
    const grid = $('#priceGrid'); if (!grid) return; grid.innerHTML = '';
    TIERS.forEach(p => {
      const card = document.createElement('div'); card.className = 'pc glass reveal' + (p.feat ? ' feat' : '');
      let priceHTML, effmo='';
      if (p.custom) priceHTML = `<div class="price">${CUSTOM[lang()] || CUSTOM.en}</div>`;
      else if (bill === 'monthly') priceHTML = `<div class="price">€${p.mo.toLocaleString('en-US')}<small> ${t('price.mo')}</small></div>`;
      else { const annual=p.yr*12; priceHTML = `<div class="price">€${annual.toLocaleString('en-US')}<small> ${t('price.yr')}</small></div>`; effmo=`<div class="laptop" style="color:var(--text-3);font-weight:500">${t('price.effmo').replace('{x}', p.yr.toLocaleString('en-US'))}</div>`; }
      const laptopNote = (bill === 'yearly' && p.laptop) ? `<div class="laptop">${LAPTOP[lang()] || LAPTOP.en}</div>` : (effmo || `<div class="laptop"></div>`);
      card.innerHTML =
        (p.feat ? `<div class="feat-badge" data-i18n="price.popular">Most popular</div>` : '') +
        `<div class="tier">${p.tier}</div>${priceHTML}<div class="emp">${t(p.emp)}</div>${laptopNote}` +
        `<ul>${p.feats.map(f => `<li>${t(f)}</li>`).join('')}</ul>` +
        `<a href="${p.custom?'#':'onboarding.html'}" class="btn ${p.feat ? 'btn-primary' : 'btn-ghost'} btn-block" ${p.custom?'data-demo':''} data-i18n="${p.custom ? 'price.contact' : 'price.get'}">${p.custom ? 'Contact sales' : 'Get started'}</a>`;
      grid.appendChild(card); io.observe(card);
    });
    if (window.I18N) I18N.apply(grid);
  }
  const bt = $('#billToggle');
  if (bt) bt.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') return; bt.querySelectorAll('button').forEach(b => b.classList.remove('active')); e.target.classList.add('active'); bill = e.target.dataset.bill; renderPricing(); });
  renderPricing();
  window.addEventListener('nexa:lang', renderPricing);

  /* ---------- Staggered reveals for grid items ---------- */
  ['#probGrid .prob-chip', '#intGrid .integ'].forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => { el.classList.add('reveal'); el.style.transitionDelay = (i * 40) + 'ms'; io.observe(el); });
  });

  /* ---------- Integration logo marquee ---------- */
  (function marquee() {
    const track = $('#intTrack'); if (!track) return;
    const names = ['Gmail','Outlook','Slack','Microsoft Teams','HubSpot','Salesforce','Notion','Asana','Monday','SAP','Google Calendar','Microsoft 365'];
    const make = () => names.map(n => `<div class="m-item"><div class="logo-tile">${window.brandLogo ? brandLogo(n) : ''}</div>${n}</div>`).join('');
    track.innerHTML = make() + make(); // duplicate for seamless loop
  })();

  /* ---------- Hero device tilt + gentle scroll float ---------- */
  (function heroMotion() {
    const dev = document.querySelector('.hero .device'); if (!dev) return;
    const hero = document.querySelector('.hero');
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      let raf = null;
      hero.addEventListener('mousemove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = hero.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
          dev.style.transform = `perspective(1100px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg) translateY(${window._heroY || 0}px)`;
          raf = null;
        });
      });
      hero.addEventListener('mouseleave', () => { dev.style.transform = `translateY(${window._heroY || 0}px)`; });
    }
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { window._heroY = Math.min(40, window.scrollY * 0.04); dev.style.transform = `translateY(${window._heroY}px)`; ticking = false; });
    }, { passive: true });
  })();

  /* ---------- Book a Demo planner ---------- */
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
    document.querySelector('[data-demo-close]').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    $('#dConfirm').addEventListener('click', () => {
      const em = $('#dEmail').value.trim();
      if (!em) { $('#dEmail').style.borderColor = 'var(--error)'; $('#dEmail').focus(); return; }
      const topics = [...modal.querySelectorAll('#dTopics .ch.sel')].map(b => b.dataset.topic);
      const dateStr = selDate ? selDate.toLocaleDateString(lc(), { weekday: 'long', day: 'numeric', month: 'long' }) : '';
      $('#demoForm').classList.add('hidden');
      $('#demoDone').classList.remove('hidden');
      $('#demoWhen').innerHTML = `${dateStr} · ${selTime}` + (topics.length ? `<br><span style="font-weight:400;color:var(--text-2)">${topics.join(' · ')}</span>` : '');
    });
  })();

  /* ---------- Hero typewriter (rotating live actions) ---------- */
  (function typewriter() {
    const el = $('#twText'); if (!el) return;
    const PHRASES = [
      'Emma processed 17 emails', 'Liam followed up 24 leads', 'Sophie reconciled 12 invoices',
      'Noah resolved 18 tickets', 'Maya screened 42 applicants',
    ];
    let p = 0, i = 0, deleting = false;
    function tick() {
      const full = PHRASES[p];
      el.textContent = full.slice(0, i);
      if (!deleting) {
        if (i < full.length) { i++; setTimeout(tick, 42); }
        else { deleting = true; setTimeout(tick, 1500); }
      } else {
        if (i > 0) { i--; setTimeout(tick, 22); }
        else { deleting = false; p = (p + 1) % PHRASES.length; setTimeout(tick, 320); }
      }
    }
    tick();
  })();

  /* ---------- Command Center demo "video" — cycles through ALL views ---------- */
  (function ccDemo() {
    const root = $('#ccDemo'); if (!root) return;
    const typed = $('#ccTyped'), exec = $('#ccExec'), feed = $('#ccFeed'), prog = $('#ccProg');
    const side = root.querySelectorAll('#ccSide .i');
    const EMP = [
      ['E', '#6366F1', 'Emma', 'processed 17 emails'],
      ['L', '#16A34A', 'Liam', 'followed up 24 leads'],
      ['S', '#F59E0B', 'Sophie', 'reconciled 12 invoices'],
      ['N', '#EC4899', 'Noah', 'resolved 18 tickets'],
      ['M', '#06B6D4', 'Maya', 'screened 42 applicants'],
    ];
    let timers = [], rafs = [], visible = false, running = false, seg = 0;
    const T = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
    function clearAll() { timers.forEach(clearTimeout); timers = []; rafs.forEach(cancelAnimationFrame); rafs = []; }
    function highlight(n) { side.forEach((s, i) => s.classList.toggle('act-hl', i === n)); }
    function countUp(el, to, prefix, suffix, dur) {
      const start = performance.now();
      const step = now => { if (!running) return; const p = Math.min(1, (now - start) / dur); el.textContent = prefix + Math.round(to * (0.15 + 0.85 * p)).toLocaleString('en-US') + suffix; if (p < 1) rafs.push(requestAnimationFrame(step)); };
      rafs.push(requestAnimationFrame(step));
    }
    function typeCmd(text, done) {
      let i = 0;
      (function tp() { if (i <= text.length) { typed.textContent = text.slice(0, i); i++; T(tp, 45); } else if (done) T(done, 360); })();
    }
    /* ---- view renderers (render into the middle stage #ccFeed) ---- */
    function vDash() {
      feed.innerHTML = ''; $('#ccActions').textContent = '0'; $('#ccRev').textContent = '€0'; $('#ccPerf').textContent = '0%';
      EMP.forEach((e, idx) => T(() => {
        const d = document.createElement('div'); d.className = 'fr';
        d.innerHTML = `<span class="av" style="background:${e[1]}">${e[0]}</span><span class="nm">${e[2]}</span> <span class="wt">${e[3]}</span><span class="ex">Executed</span>`;
        feed.appendChild(d); requestAnimationFrame(() => d.classList.add('in'));
        T(() => { const x = d.querySelector('.ex'); if (x) x.classList.add('show'); }, 320);
        while (feed.children.length > 5) feed.removeChild(feed.firstChild);
      }, 250 + idx * 620));
      T(() => { countUp($('#ccActions'), 318, '', '', 1400); countUp($('#ccRev'), 1240000, '€', '', 1500); countUp($('#ccPerf'), 98, '', '%', 1400); }, 500);
    }
    function vWorkforce() {
      feed.innerHTML = '<div class="dv dv-grid">' + EMP.map(e =>
        `<div class="dv-chip"><span class="av" style="background:${e[1]}">${e[0]}</span><div><b>${e[2]}</b><small>${e[3].split(' ').slice(-2).join(' ')}</small></div></div>`
      ).join('') + '<div class="dv-chip" style="border-style:dashed;color:var(--text-3)"><span class="av" style="background:var(--ink)">+</span><div><b>Hire more</b><small>marketplace</small></div></div></div>';
    }
    function vOps() {
      feed.innerHTML = '<div class="dv dv-board">' +
        `<div class="dv-col"><div class="h">◷ Queued</div><div class="dv-task">Compile Q2 summary</div><div class="dv-task">Reconcile statement</div></div>` +
        `<div class="dv-col"><div class="h"><span class="status-dot busy"></span> Executing</div><div class="dv-task">Re-engage 38 leads</div></div>` +
        `<div class="dv-col"><div class="h"><span class="status-dot live"></span> Done</div><div class="dv-task">Resolved 18 tickets</div><div class="dv-task">Sent reminders</div></div>` +
        '</div>';
    }
    function vReports() {
      const data = [42, 58, 49, 71, 63, 38, 55], max = Math.max(...data), W = 300, H = 110, bw = W / data.length;
      const bars = data.map((v, i) => { const bh = (v / max) * (H - 22); return `<rect x="${i * bw + 6}" y="${H - bh}" width="${bw - 12}" height="${bh}" rx="3" fill="#6366F1" opacity="${0.45 + 0.55 * v / max}"/>`; }).join('');
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((l, i) => `<text x="${i * bw + bw / 2}" y="${H - 3}" fill="#9AA1AD" font-size="8" text-anchor="middle">${l}</text>`).join('');
      feed.innerHTML = `<div class="dv dv-rep"><div style="font-size:11px;font-weight:700;margin-bottom:6px">Weekly actions executed</div><svg viewBox="0 0 ${W} ${H}">${bars}${labels}</svg></div>`;
    }
    function vMarket() {
      const apps = [['DA', '#2563EB', 'AI Data Analyst'], ['MM', '#7C3AED', 'AI Marketing Manager'], ['PM', '#F97316', 'AI Procurement Manager']];
      feed.innerHTML = '<div class="dv">' + apps.map(a =>
        `<div class="dv-app"><span class="av" style="background:${a[1]}">${a[0]}</span><div><b>${a[2]}</b></div><span class="ins">Install</span></div>`
      ).join('') + '</div>';
    }
    const VIEWS = [
      { n: 0, cmd: 'Follow up all inactive leads', run: vDash, dur: 4400, typed: true, exec: 'Executing…' },
      { n: 1, cmd: 'Show my workforce', run: vWorkforce, dur: 2600, exec: 'Done' },
      { n: 2, cmd: 'Review the operations pipeline', run: vOps, dur: 2700, exec: 'Done' },
      { n: 3, cmd: 'Generate the weekly report', run: vReports, dur: 2700, exec: 'Done' },
      { n: 4, cmd: 'Browse the marketplace', run: vMarket, dur: 2700, exec: 'Done' },
    ];
    function runSeg() {
      if (!visible) { running = false; return; }
      running = true;
      const v = VIEWS[seg];
      highlight(v.n);
      prog.style.transition = 'none'; prog.style.width = '0%';
      requestAnimationFrame(() => { prog.style.transition = `width ${v.dur}ms linear`; prog.style.width = '100%'; });
      exec.classList.remove('go'); exec.textContent = 'Execute';
      const start = () => { exec.classList.add('go'); exec.textContent = v.exec; v.run(); };
      if (v.typed) typeCmd(v.cmd, start); else { typed.textContent = v.cmd; T(start, 250); }
      T(() => { seg = (seg + 1) % VIEWS.length; runSeg(); }, v.dur);
    }
    new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
      if (visible) { if (!running) { seg = 0; runSeg(); } }
      else { running = false; clearAll(); }
    }, { threshold: 0.3 }).observe(root);
  })();

  /* re-apply translations to dynamically built content + re-render pricing on lang switch */
  window.addEventListener('nexa:lang', () => { renderPricing(); if (window.I18N) I18N.apply(); });
  document.addEventListener('DOMContentLoaded', () => { if (window.I18N) I18N.apply(); });
})();
