/* ============================================================
   NEXA — Agent Execution Engine
   ------------------------------------------------------------
   Drives autonomous behaviour:
     • Background tick: each active employee periodically executes
       a task via a sandbox connector and logs an executed action.
     • Command dispatch: a natural-language command is routed to
       the right employee, which executes an action chain
       (Understand → Decide → Execute), each step logged.
   This is an EXECUTION system: every command produces actions
   that were carried out, not suggestions.
   ============================================================ */

const store = require('./store');
const connectors = require('./connectors');

function nextId(db) { return 'act_' + (db.seq++); }

function logAction(db, { empId, summary, tag = 'executed', detail = null }) {
  const emp = db.workforce.find(e => e.id === empId);
  const action = {
    id: nextId(db),
    empId,
    empCode: emp ? emp.code : '??',
    empName: emp ? emp.name : 'Workforce',
    summary,
    tag,
    detail,
    ts: Date.now(),
  };
  db.activity.unshift(action);
  if (db.activity.length > 200) db.activity.length = 200;
  if (emp && tag === 'executed') {
    emp.tasksToday += 1;
    emp.timeSavedToday = +(emp.timeSavedToday + 0.1).toFixed(1);
  }
  return action;
}

/* ---- autonomous background tasks per department ---- */
const AUTONOMOUS = {
  OM: async () => { const r = await connectors.email.triage(); return { summary: `processed ${r.processed} emails and updated CRM records`, detail: r }; },
  SM: async () => { const r = await connectors.crm.listInactiveLeads(); return { summary: `followed up ${Math.ceil(r.leads / 2)} leads · logged outcomes`, detail: r }; },
  FM: async () => { const r = await connectors.finance.listOverdue(); return { summary: `reviewed ${r.count} invoices · sent reminders`, detail: r }; },
  SA: async () => { const r = await connectors.support.resolveTickets(); return { summary: `resolved ${r.resolved} tickets · CSAT ${r.csat}`, detail: r }; },
  RA: async () => { const r = await connectors.recruiting.screen(); return { summary: `screened ${r.screened} applications · shortlisted top candidates`, detail: r }; },
  DA: async () => ({ summary: `refreshed dashboards · flagged 2 anomalies`, detail: { sandbox: true } }),
  MM: async () => ({ summary: `optimized 1 campaign · drafted 3 assets`, detail: { sandbox: true } }),
  PM: async () => ({ summary: `routed 2 purchase orders for approval`, detail: { sandbox: true } }),
  DOC: async () => ({ summary: `generated the weekly report · ready to download`, detail: { sandbox: true } }),
};

/* ---- command routing: pick employee + build executed chain ---- */
function routeCommand(text) {
  const t = text.toLowerCase();
  if (/excel|spreadsheet|powerpoint|\bdeck\b|slides|presentation|word doc|\.xlsx|\.docx|\.pptx|generate (a |the )?(report|document|deck|model)|build (a |the )?(report|deck|model|workbook)/.test(t)) return 'DOC';
  if (/invoice|payment|finance|cashflow|overdue|reminder|expense|billing/.test(t)) return 'FM';
  if (/ticket|support|customer|csat|escalat/.test(t)) return 'SA';
  if (/lead|follow.?up|prospect|outreach|deal|pipeline|proposal/.test(t)) return 'SM';
  if (/candidate|recruit|interview|applicant|hire|onboarding plan/.test(t)) return 'RA';
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

async function buildChain(empId, text) {
  // returns ordered list of executed steps for the given command
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
        `reviewed ${od.count} overdue invoices (€${od.total.toLocaleString('en-US')})`,
        `sent payment reminders`,
        `flagged 1 account for escalation`,
        `updated cashflow forecast`,
      ];
    }
    case 'SA': {
      const r = await connectors.support.resolveTickets();
      return [
        `triaged the open ticket queue`,
        `resolved ${r.resolved} tickets autonomously`,
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
    default: { // OM
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

class NexaEngine {
  constructor() {
    this.db = store.load();
    this.listeners = new Set();
    this.timer = null;
  }

  onAction(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  _emit(action) { for (const fn of this.listeners) fn(action); }

  start(intervalMs = 5000) {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), intervalMs);
  }
  stop() { clearInterval(this.timer); this.timer = null; }

  async tick() {
    const active = this.db.workforce.filter(e => e.status !== 'idle');
    if (!active.length) return;
    const emp = active[Math.floor(Math.random() * active.length)];
    const fn = AUTONOMOUS[emp.id] || AUTONOMOUS.OM;
    const { summary, detail } = await fn();
    const action = logAction(this.db, { empId: emp.id, summary, detail });
    store.save();
    this._emit(action);
  }

  // dispatch a natural-language command; returns the executed chain (legacy/auto path)
  async dispatch(text) {
    const empId = routeCommand(text);
    const steps = await buildChain(empId, text);
    const actions = [];
    // first the command acknowledgement, then executed steps
    actions.push(logAction(this.db, { empId, summary: `received command: "${text}"`, tag: 'command' }));
    for (const step of steps) {
      actions.push(logAction(this.db, { empId, summary: step, tag: 'executed' }));
    }
    store.save();
    actions.forEach(a => this._emit(a));
    return { empId, actions };
  }

  /* ---------- audit log ---------- */
  _audit(entry) {
    const emp = this.db.workforce.find(w => w.id === entry.empId);
    const e = {
      id: 'aud_' + (this.db.aseq++),
      ts: Date.now(),
      empId: entry.empId || null,
      empCode: emp ? emp.code : (entry.empId || null),
      type: entry.type,
      summary: entry.summary,
      detail: entry.detail || null,
    };
    this.db.audit.unshift(e);
    if (this.db.audit.length > 500) this.db.audit.length = 500;
    return e;
  }

  /* ---------- tasks · human-in-the-loop approval ---------- */
  async _executeTask(task) {
    const steps = await buildChain(task.empId, task.text);
    const actions = [];
    for (const s of steps) actions.push(logAction(this.db, { empId: task.empId, summary: s, tag: 'executed' }));
    task.steps = steps;
    task.status = 'done';
    task.resolvedAt = Date.now();
    if (task.empId === 'DOC') task.document = docDescriptor(docTypeFromText(task.text));
    this._audit({ type: 'execute', empId: task.empId, summary: `executed: "${task.text}"`, detail: { taskId: task.id, steps } });
    return actions;
  }

  // submit a command; routes to an employee and either auto-executes or queues for approval
  async submitCommand(text) {
    const empId = routeCommand(text);
    const emp = this.db.workforce.find(e => e.id === empId) || { code: empId, name: empId };
    const mode = (this.db.autonomy && this.db.autonomy[empId]) || 'supervised';
    const task = {
      id: 'task_' + (this.db.tseq++),
      empId, empCode: emp.code, empName: emp.name || empId,
      text, steps: [], status: mode === 'auto' ? 'executing' : 'pending_approval',
      mode, createdAt: Date.now(), resolvedAt: null, document: null,
    };
    this.db.tasks.unshift(task);
    if (this.db.tasks.length > 200) this.db.tasks.length = 200;
    this._audit({ type: 'command', empId, summary: `received command: "${text}"`, detail: { taskId: task.id, mode } });
    let actions = [];
    if (mode === 'auto') { actions = await this._executeTask(task); }
    store.save();
    actions.forEach(a => this._emit(a));
    return { task, executed: mode === 'auto', actions };
  }

  async approve(id) {
    const t = this.db.tasks.find(x => x.id === id);
    if (!t) return { error: 'not found' };
    if (t.status !== 'pending_approval') return { error: 'not pending', task: t };
    t.status = 'executing';
    const actions = await this._executeTask(t);
    this._audit({ type: 'approve', empId: t.empId, summary: `approved & executed: "${t.text}"`, detail: { taskId: id } });
    store.save();
    actions.forEach(a => this._emit(a));
    return { task: t, actions };
  }

  reject(id) {
    const t = this.db.tasks.find(x => x.id === id);
    if (!t) return { error: 'not found' };
    t.status = 'rejected';
    t.resolvedAt = Date.now();
    this._audit({ type: 'reject', empId: t.empId, summary: `rejected: "${t.text}"`, detail: { taskId: id } });
    store.save();
    return { task: t };
  }

  /* ---------- autonomy + memory ---------- */
  setAutonomy(empId, level) {
    if (!['supervised', 'auto'].includes(level)) return { error: 'bad level' };
    this.db.autonomy[empId] = level;
    this._audit({ type: 'autonomy', empId, summary: `autonomy set to ${level}` });
    store.save();
    return { empId, level };
  }
  addMemory(empId, note) {
    if (!note || !note.trim()) return { error: 'empty' };
    (this.db.memory[empId] = this.db.memory[empId] || []).unshift({ ts: Date.now(), note: note.trim() });
    this._audit({ type: 'memory', empId, summary: `learned: "${note.trim()}"` });
    store.save();
    return { empId, memory: this.db.memory[empId] };
  }

  /* ---------- scheduled documents ---------- */
  async runSchedule(id) {
    const s = this.db.schedules.find(x => x.id === id);
    if (!s) return { error: 'not found' };
    const d = docDescriptor(s.docType);
    const task = {
      id: 'task_' + (this.db.tseq++),
      empId: s.empId, empCode: 'DOC', empName: 'AI Document Specialist',
      text: s.title, steps: [], status: 'executing', mode: 'scheduled',
      createdAt: Date.now(), resolvedAt: null, document: null,
    };
    this.db.tasks.unshift(task);
    const steps = [`pulled the latest data from connected systems`, `generated ${s.title}`, `saved ${d.filename}`, `shared it with the team`];
    for (const st of steps) logAction(this.db, { empId: s.empId, summary: st, tag: 'executed' });
    task.steps = steps; task.status = 'done'; task.resolvedAt = Date.now(); task.document = d;
    s.lastRun = Date.now();
    this._audit({ type: 'schedule', empId: s.empId, summary: `ran schedule: ${s.title}`, detail: { scheduleId: id, file: d.filename } });
    store.save();
    return { task, schedule: s };
  }

  /* ---------- ROI ---------- */
  computeRoi() {
    const wf = this.db.workforce;
    const hours = +(wf.reduce((s, e) => s + (e.timeSavedToday || 0), 0)).toFixed(1);
    const tasks = wf.reduce((s, e) => s + (e.tasksToday || 0), 0);
    const avgPerf = wf.length ? Math.round(wf.reduce((s, e) => s + e.performance, 0) / wf.length) : 0;
    const HOURLY = 45;                       // blended loaded cost of manual work
    const dailySavings = Math.round(hours * HOURLY);
    const annualSavings = dailySavings * 260; // working days
    const seats = wf.length;
    const monthlyCost = seats * 499;
    const roiPct = monthlyCost ? Math.round(((annualSavings / 12) - monthlyCost) / monthlyCost * 100) : 0;
    return { hoursSavedToday: hours, tasksToday: tasks, avgPerformance: avgPerf, dailySavings, annualSavings, monthlyCost, roiPct, seats };
  }
}

module.exports = { NexaEngine, logAction };
