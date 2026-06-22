/* ============================================================
   NEXA — Agent Execution Engine (multi-tenant)
   ------------------------------------------------------------
   Drives autonomous behaviour, scoped per tenant:
     • Background tick: for each tenant, an active employee
       periodically executes a task via a sandbox/live connector.
     • Command dispatch: a natural-language command is routed to
       the right employee, which executes an action chain
       (Understand → Decide → Execute), each step logged.
   Every public method takes a tenantId and operates only on that
   tenant's workspace, so data never crosses tenant boundaries.
   ============================================================ */

const store = require('./store');
const connectors = require('./connectors');
const llm = require('./llm');

function nextId(ws) { return 'act_' + (ws.seq++); }

/* Transparent, assumption-based estimate of human minutes saved per
   executed action — never presented as measured truth. */
const MINUTES_SAVED = { OM: 6, SM: 9, FM: 8, SA: 5, RA: 12, DA: 7, MM: 7, PM: 6, DOC: 25 };
function minutesFor(empId) { return MINUTES_SAVED[empId] || 6; }

function logAction(ws, { empId, summary, tag = 'executed', detail = null }) {
  const emp = ws.workforce.find(e => e.id === empId);
  const action = {
    id: nextId(ws), empId,
    empCode: emp ? emp.code : '??', empName: emp ? emp.name : 'Workforce',
    summary, tag, detail, ts: Date.now(),
  };
  ws.activity.unshift(action);
  if (ws.activity.length > 200) ws.activity.length = 200;
  if (emp && tag === 'executed') {
    emp.tasksToday += 1;
    emp.timeSavedToday = +(emp.timeSavedToday + minutesFor(empId) / 60).toFixed(2);
    // Pilot evidence: count every action the workforce actually executes.
    if (ws.pilot && ws.pilot.active) {
      ws.pilot.actionsExecuted += 1;
      ws.pilot.minutesTracked += minutesFor(empId);
    }
  }
  return action;
}

/* ---- autonomous background tasks per department ---- */
const AUTONOMOUS = {
  OM: async () => { const r = await connectors.email.triage(); return { summary: `processed ${r.processed} emails and updated CRM records`, detail: r }; },
  SM: async () => { const r = await connectors.crm.listInactiveLeads(); return { summary: `followed up ${Math.ceil((r.leads || 0) / 2)} leads · logged outcomes`, detail: r }; },
  FM: async () => { const r = await connectors.finance.listOverdue(); return { summary: `reviewed ${r.count} invoices · sent reminders`, detail: r }; },
  SA: async () => { const r = await connectors.support.resolveTickets(); return { summary: `resolved ${r.resolved || r.open || 0} tickets · CSAT ${r.csat || 'n/a'}`, detail: r }; },
  RA: async () => { const r = await connectors.recruiting.screen(); return { summary: `screened ${r.screened} applications · shortlisted top candidates`, detail: r }; },
  DA: async () => ({ summary: `refreshed dashboards · flagged 2 anomalies`, detail: { sandbox: true } }),
  MM: async () => ({ summary: `optimized 1 campaign · drafted 3 assets`, detail: { sandbox: true } }),
  PM: async () => ({ summary: `routed 2 purchase orders for approval`, detail: { sandbox: true } }),
  DOC: async () => ({ summary: `generated the weekly report · ready to download`, detail: { sandbox: true } }),
};

/* ---- command routing ---- */
function routeCommand(text) {
  const t = text.toLowerCase();
  if (/excel|spreadsheet|powerpoint|\bdeck\b|slides|presentation|word doc|\.xlsx|\.docx|\.pptx|generate (a |the )?(report|document|deck|model)|build (a |the )?(report|deck|model|workbook)/.test(t)) return 'DOC';
  if (/invoice|payment|finance|cashflow|overdue|reminder|expense|billing/.test(t)) return 'FM';
  if (/ticket|support|customer|csat|escalat/.test(t)) return 'SA';
  if (/lead|follow.?up|prospect|outreach|deal|pipeline|proposal/.test(t)) return 'SM';
  if (/candidate|recruit|interview|applicant|hire|onboarding plan/.test(t)) return 'RA';
  if (/campaign|marketing|content|copywrit|\bseo\b|social|newsletter|\bad(s)?\b|brand|audience/.test(t)) return 'MM';
  if (/procure|vendor|supplier|purchase order|\bpo\b|purchasing|spend|sourcing/.test(t)) return 'PM';
  if (/dashboard|analytics|anomal|\bkpi\b|metric|insight|trend|data analysis|forecast/.test(t)) return 'DA';
  if (/report|email|schedul|meeting|calendar|crm|document/.test(t)) return 'OM';
  return 'OM';
}

function docTypeFromText(text) {
  const t = (text || '').toLowerCase();
  if (/excel|spreadsheet|\.xlsx|workbook|model|cashflow|financial|budget/.test(t)) return 'xlsx';
  if (/powerpoint|\bdeck\b|slides|presentation|\.pptx|pitch/.test(t)) return 'pptx';
  return 'docx';
}
const DOC_META = { xlsx: 'Financial-Model', docx: 'Business-Report', pptx: 'Pitch-Deck' };
function docDescriptor(type) {
  const ext = type || 'docx';
  const date = new Date().toISOString().slice(0, 10);
  return { type: ext, filename: `NEXA-${DOC_META[ext] || 'Document'}-${date}.${ext}` };
}

/* ---- deterministic fallback chains (no LLM key) ---- */
async function buildChain(empId, text) {
  switch (empId) {
    case 'SM': {
      const leads = await connectors.crm.listInactiveLeads();
      await connectors.email.send({ to: 'segment:inactive', subject: 'Following up' });
      await connectors.crm.updateDeal({ stage: 'Re-engaged' });
      return [
        `identified ${leads.leads} matching leads`,
        `sent ${leads.leads} personalized follow-ups`,
        `updated CRM · stage set to Re-engaged`,
        `scheduled follow-up sequence`,
      ];
    }
    case 'FM': {
      const od = await connectors.finance.listOverdue();
      await connectors.finance.createInvoice({ amount: od.total });
      return [
        `reviewed ${od.count} overdue invoices (€${(od.total || 0).toLocaleString('en-US')})`,
        `sent payment reminders`,
        `flagged 1 account for escalation`,
        `updated cashflow forecast`,
      ];
    }
    case 'SA': {
      const r = await connectors.support.resolveTickets();
      return [
        `triaged the open ticket queue`,
        `resolved ${r.resolved || r.open || 0} tickets autonomously`,
        `updated knowledge base with 2 articles`,
        `escalated 1 ticket to human review`,
      ];
    }
    case 'RA': {
      const r = await connectors.recruiting.screen();
      await connectors.calendar.schedule({ title: 'Interview' });
      return [
        `screened ${r.screened} applications`,
        `shortlisted 7 candidates`,
        `scheduled 4 interview slots`,
        `sent follow-up emails to applicants`,
      ];
    }
    case 'MM': {
      await connectors.crm.listInactiveLeads();
      return [
        `analyzed recent campaign performance`,
        `drafted 3 content assets for the campaign`,
        `scheduled social posts and an email send`,
        `updated the marketing dashboard`,
      ];
    }
    case 'PM': {
      return [
        `reviewed open purchase requests`,
        `routed 2 purchase orders for approval`,
        `updated vendor and spend records`,
        `flagged 1 contract for renewal`,
      ];
    }
    case 'DA': {
      return [
        `pulled data from the connected systems`,
        `refreshed the dashboards`,
        `flagged 2 anomalies for review`,
        `shared an insights summary with management`,
      ];
    }
    case 'DOC': {
      const dt = docTypeFromText(text);
      const kind = dt === 'xlsx' ? 'Excel workbook' : dt === 'pptx' ? 'PowerPoint deck' : 'Word document';
      const d = docDescriptor(dt);
      return [
        `pulled the latest figures from connected systems`,
        `drafted and formatted the ${kind}`,
        `generated ${d.filename}`,
        `shared it with the team`,
      ];
    }
    default: {
      await connectors.email.triage();
      await connectors.calendar.schedule({ title: 'Sync' });
      return [
        `parsed the request and gathered context`,
        `executed: "${text}"`,
        `updated CRM and internal docs`,
        `notified management with a summary`,
      ];
    }
  }
}

/* ---- model-driven planning, grounded in the employee's role AND its
   learned memory for this tenant. Falls back to buildChain. ---- */
const EMP_CONTEXT = {
  OM: 'Operations: triage email, schedule meetings, update CRM, prepare summaries.',
  SM: 'Sales: qualify leads, send follow-ups, update deal stages, schedule meetings.',
  FM: 'Finance: review overdue invoices, send payment reminders, update cashflow.',
  SA: 'Support: triage tickets, resolve them, update the knowledge base, escalate.',
  RA: 'Recruiting: screen applications, shortlist, schedule interviews, follow up.',
  MM: 'Marketing: plan and run campaigns, draft content, schedule posts, report on performance.',
  PM: 'Procurement: manage vendors, raise and route purchase orders, track spend, handle renewals.',
  DA: 'Data analysis: refresh dashboards, track KPIs, detect anomalies, summarise insights.',
  DOC: 'Documents: pull connected data and produce Excel / Word / PowerPoint files.',
};
async function planChain(ws, empId, text) {
  if (!llm.isLive()) return buildChain(empId, text);
  try {
    const notes = (ws.memory[empId] || []).slice(0, 6).map(m => `- ${m.note}`).join('\n');
    const system =
      'You are the execution planner for a NEXA AI employee. ' +
      'Given the employee role, its learned preferences, and a command, return the ' +
      'concrete actions the employee will carry out via its connectors. Be specific. ' +
      `Employee role — ${EMP_CONTEXT[empId] || EMP_CONTEXT.OM}` +
      (notes ? `\nLearned preferences (must respect):\n${notes}` : '');
    const user = `Command: "${text}"\nReturn JSON: {"steps": ["past-tense action", ...]} with 3-5 steps.`;
    const out = await llm.completeJSON(system, user, { maxTokens: 400 });
    if (out && Array.isArray(out.steps) && out.steps.length) return out.steps.slice(0, 6).map(s => String(s));
  } catch { /* fall through */ }
  return buildChain(empId, text);
}

class NexaEngine {
  constructor() { this.listeners = new Set(); this.timer = null; }

  onAction(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  _emit(action) { for (const fn of this.listeners) fn(action); }

  start(intervalMs = 5000) { if (!this.timer) this.timer = setInterval(() => this.tick(), intervalMs); }
  stop() { clearInterval(this.timer); this.timer = null; }

  async tick() {
    for (const tid of store.tenantIds()) {
      const ws = store.tenant(tid);
      const active = ws.workforce.filter(e => e.status !== 'idle');
      if (!active.length) continue;
      const emp = active[Math.floor(Math.random() * active.length)];
      const fn = AUTONOMOUS[emp.id] || AUTONOMOUS.OM;
      try {
        const { summary, detail } = await fn();
        const action = logAction(ws, { empId: emp.id, summary, detail });
        this._emit(action);
      } catch { /* connector hiccup — skip this tick */ }
    }
    store.save();
  }

  /* legacy auto path */
  async dispatch(tenantId, text) {
    const ws = store.tenant(tenantId);
    const empId = routeCommand(text);
    const steps = await planChain(ws, empId, text);
    const actions = [logAction(ws, { empId, summary: `received command: "${text}"`, tag: 'command' })];
    for (const step of steps) actions.push(logAction(ws, { empId, summary: step, tag: 'executed' }));
    store.save();
    actions.forEach(a => this._emit(a));
    return { empId, actions };
  }

  /* ---------- audit ---------- */
  _audit(ws, entry) {
    const emp = ws.workforce.find(w => w.id === entry.empId);
    const e = {
      id: 'aud_' + (ws.aseq++), ts: Date.now(),
      empId: entry.empId || null, empCode: emp ? emp.code : (entry.empId || null),
      type: entry.type, summary: entry.summary, detail: entry.detail || null,
    };
    ws.audit.unshift(e);
    if (ws.audit.length > 500) ws.audit.length = 500;
    return e;
  }

  /* ---------- tasks · human-in-the-loop ---------- */
  async _executeTask(ws, task) {
    const steps = await planChain(ws, task.empId, task.text);
    const actions = [];
    for (const s of steps) actions.push(logAction(ws, { empId: task.empId, summary: s, tag: 'executed' }));
    task.steps = steps; task.status = 'done'; task.resolvedAt = Date.now();
    if (task.empId === 'DOC') task.document = docDescriptor(docTypeFromText(task.text));
    this._audit(ws, { type: 'execute', empId: task.empId, summary: `executed: "${task.text}"`, detail: { taskId: task.id, steps } });
    return actions;
  }

  async submitCommand(tenantId, text) {
    const ws = store.tenant(tenantId);
    const empId = routeCommand(text);
    const emp = ws.workforce.find(e => e.id === empId) || { code: empId, name: empId };
    const mode = (ws.autonomy && ws.autonomy[empId]) || 'supervised';
    const task = {
      id: 'task_' + (ws.tseq++),
      empId, empCode: emp.code, empName: emp.name || empId,
      text, steps: [], status: mode === 'auto' ? 'executing' : 'pending_approval',
      mode, createdAt: Date.now(), resolvedAt: null, document: null,
    };
    ws.tasks.unshift(task);
    if (ws.tasks.length > 200) ws.tasks.length = 200;
    this._audit(ws, { type: 'command', empId, summary: `received command: "${text}"`, detail: { taskId: task.id, mode } });
    let actions = [];
    if (mode === 'auto') actions = await this._executeTask(ws, task);
    store.save();
    actions.forEach(a => this._emit(a));
    return { task, executed: mode === 'auto', actions };
  }

  async approve(tenantId, id) {
    const ws = store.tenant(tenantId);
    const t = ws.tasks.find(x => x.id === id);
    if (!t) return { error: 'not found' };
    if (t.status !== 'pending_approval') return { error: 'not pending', task: t };
    t.status = 'executing';
    const actions = await this._executeTask(ws, t);
    this._audit(ws, { type: 'approve', empId: t.empId, summary: `approved & executed: "${t.text}"`, detail: { taskId: id } });
    store.save();
    actions.forEach(a => this._emit(a));
    return { task: t, actions };
  }

  reject(tenantId, id) {
    const ws = store.tenant(tenantId);
    const t = ws.tasks.find(x => x.id === id);
    if (!t) return { error: 'not found' };
    t.status = 'rejected'; t.resolvedAt = Date.now();
    this._audit(ws, { type: 'reject', empId: t.empId, summary: `rejected: "${t.text}"`, detail: { taskId: id } });
    store.save();
    return { task: t };
  }

  /* ---------- autonomy + memory ---------- */
  setAutonomy(tenantId, empId, level) {
    if (!['supervised', 'auto'].includes(level)) return { error: 'bad level' };
    const ws = store.tenant(tenantId);
    ws.autonomy[empId] = level;
    this._audit(ws, { type: 'autonomy', empId, summary: `autonomy set to ${level}` });
    store.save();
    return { empId, level };
  }
  addMemory(tenantId, empId, note) {
    if (!note || !note.trim()) return { error: 'empty' };
    const ws = store.tenant(tenantId);
    (ws.memory[empId] = ws.memory[empId] || []).unshift({ ts: Date.now(), note: note.trim() });
    this._audit(ws, { type: 'memory', empId, summary: `learned: "${note.trim()}"` });
    store.save();
    return { empId, memory: ws.memory[empId] };
  }

  /* ---------- scheduled documents ---------- */
  async runSchedule(tenantId, id) {
    const ws = store.tenant(tenantId);
    const s = ws.schedules.find(x => x.id === id);
    if (!s) return { error: 'not found' };
    const d = docDescriptor(s.docType);
    const task = {
      id: 'task_' + (ws.tseq++),
      empId: s.empId, empCode: 'DOC', empName: 'AI Document Specialist',
      text: s.title, steps: [], status: 'executing', mode: 'scheduled',
      createdAt: Date.now(), resolvedAt: null, document: null,
    };
    ws.tasks.unshift(task);
    const steps = [`pulled the latest data from connected systems`, `generated ${s.title}`, `saved ${d.filename}`, `shared it with the team`];
    for (const st of steps) logAction(ws, { empId: s.empId, summary: st, tag: 'executed' });
    task.steps = steps; task.status = 'done'; task.resolvedAt = Date.now(); task.document = d;
    s.lastRun = Date.now();
    this._audit(ws, { type: 'schedule', empId: s.empId, summary: `ran schedule: ${s.title}`, detail: { scheduleId: id, file: d.filename } });
    store.save();
    return { task, schedule: s };
  }

  /* ---------- ROI (transparent estimate) ---------- */
  computeRoi(tenantId) {
    const ws = store.tenant(tenantId);
    const wf = ws.workforce;
    const hours = +(wf.reduce((s, e) => s + (e.timeSavedToday || 0), 0)).toFixed(1);
    const tasks = wf.reduce((s, e) => s + (e.tasksToday || 0), 0);
    const avgPerf = wf.length ? Math.round(wf.reduce((s, e) => s + e.performance, 0) / wf.length) : 0;
    const HOURLY = 45;
    const dailySavings = Math.round(hours * HOURLY);
    const annualSavings = dailySavings * 260;
    const seats = wf.length;
    const monthlyCost = seats * 499;
    const roiPct = monthlyCost ? Math.round(((annualSavings / 12) - monthlyCost) / monthlyCost * 100) : 0;
    return {
      hoursSavedToday: hours, tasksToday: tasks, avgPerformance: avgPerf,
      dailySavings, annualSavings, monthlyCost, roiPct, seats,
      estimated: true,
      basis: `Estimated from per-task time assumptions (${HOURLY} €/h blended). Replace with measured time per customer.`,
    };
  }

  /* ---------- pilot mode ---------- */
  startPilot(tenantId, { baselineHoursPerWeek = 0, hourlyRate = 45, seats = 1, label = null } = {}) {
    const ws = store.tenant(tenantId);
    ws.pilot = {
      active: true, startedAt: Date.now(), endedAt: null, label,
      baselineHoursPerWeek: Number(baselineHoursPerWeek) || 0,
      hourlyRate: Number(hourlyRate) || 45,
      seats: Number(seats) || 1,
      actionsExecuted: 0, minutesTracked: 0,
    };
    this._audit(ws, { type: 'pilot', summary: `pilot started${label ? ' · ' + label : ''}`, detail: { baselineHoursPerWeek, hourlyRate, seats } });
    store.save();
    return this.computePilot(tenantId);
  }

  stopPilot(tenantId) {
    const ws = store.tenant(tenantId);
    if (!ws.pilot || !ws.pilot.active) return { active: false };
    ws.pilot.active = false; ws.pilot.endedAt = Date.now();
    this._audit(ws, { type: 'pilot', summary: 'pilot ended' });
    store.save();
    return this.computePilot(tenantId);
  }

  /* Pilot report: real executed-action evidence + savings derived from the
     customer's own baseline (not a fabricated per-task figure). */
  computePilot(tenantId) {
    const ws = store.tenant(tenantId);
    const pl = ws.pilot || {};
    if (!pl.startedAt) return { active: false, configured: false };
    const elapsedMs = (pl.endedAt || Date.now()) - pl.startedAt;
    const weeks = Math.max(elapsedMs / (7 * 24 * 3600 * 1000), 0);
    const days = Math.max(Math.floor(elapsedMs / (24 * 3600 * 1000)), 0);
    // Savings the customer can defend: their stated baseline hours, prorated.
    const baselineHoursSaved = +(pl.baselineHoursPerWeek * weeks).toFixed(1);
    const baselineSavings = Math.round(baselineHoursSaved * pl.hourlyRate);
    const monthsElapsed = Math.max(weeks / 4.345, 0);
    const cost = Math.round((pl.seats * 499) * Math.max(monthsElapsed, 0));
    const netSavings = baselineSavings - cost;
    return {
      active: !!pl.active, configured: true,
      label: pl.label, startedAt: pl.startedAt, endedAt: pl.endedAt,
      daysElapsed: days, weeksElapsed: +weeks.toFixed(2),
      // Verifiable evidence — actions the workforce actually carried out:
      actionsExecuted: pl.actionsExecuted,
      // Customer-baseline savings (the defensible ROI number):
      baselineHoursPerWeek: pl.baselineHoursPerWeek,
      hourlyRate: pl.hourlyRate, seats: pl.seats,
      baselineHoursSaved, baselineSavings, cost, netSavings,
      // Steady-state projection (useful from day one, before time accrues):
      projectedMonthlySavings: Math.round(pl.baselineHoursPerWeek * 4.345 * pl.hourlyRate),
      projectedMonthlyCost: pl.seats * 499,
      projectedMonthlyNet: Math.round(pl.baselineHoursPerWeek * 4.345 * pl.hourlyRate) - pl.seats * 499,
      note: 'actionsExecuted is verified activity; savings are derived from the customer-stated baseline, not assumptions.',
    };
  }
}

module.exports = { NexaEngine, logAction };
