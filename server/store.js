/* ============================================================
   NEXA — Persistence layer (zero-dependency, multi-tenant)
   ------------------------------------------------------------
   Data is partitioned per tenant. The root document holds shared
   auth (users, signing secret) and a map of tenant workspaces:

     {
       authSecret,
       users:   [ { id, user, name, role, tenantId, passwordHash } ],
       tenants: { [tenantId]: <workspace> }
     }

   A workspace is the old single-tenant shape (company, connectors,
   workforce, activity, tasks, audit, memory, autonomy, schedules,
   sequences). All reads/writes go through store.tenant(id) so a
   token for tenant A can never see tenant B's data.

   The JSON file is an implementation detail behind this module —
   swapping to Postgres later means reimplementing load/save/tenant,
   not touching the engine or routes.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const auth = require('./auth');

const DB_PATH = path.join(__dirname, 'data', 'nexa.json');

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function seedAdmin() {
  const user = process.env.NEXA_ADMIN_USER || 'kain';
  const pass = process.env.NEXA_ADMIN_PASS || 'Kain25';
  const name = process.env.NEXA_ADMIN_NAME || 'Kain';
  return { id: 'usr_admin', user: user.toLowerCase(), name, role: 'admin', tenantId: 'default', passwordHash: auth.hashPassword(pass) };
}

const EMPLOYEE_LIBRARY = [
  { id: 'OM', code: 'OM', person: 'Emma', name: 'AI Operations Manager', dept: 'Operations', tagline: 'Email · Scheduling · Reporting · CRM',
    skills: ['Email management', 'Scheduling', 'Documentation', 'Reporting', 'CRM updates', 'Workflow execution'], price: 499 },
  { id: 'SM', code: 'SM', person: 'Liam', name: 'AI Sales Manager', dept: 'Sales', tagline: 'Lead qualification · Follow-up · Proposals',
    skills: ['Lead qualification', 'Lead follow-up', 'Proposal creation', 'Pipeline management', 'CRM updates', 'Meeting scheduling'], price: 499 },
  { id: 'FM', code: 'FM', person: 'Sophie', name: 'AI Finance Manager', dept: 'Finance', tagline: 'Invoices · Reminders · Cashflow reports',
    skills: ['Invoices', 'Expense monitoring', 'Payment reminders', 'Cashflow reports', 'Financial forecasting'], price: 499 },
  { id: 'SA', code: 'SA', person: 'Noah', name: 'AI Support Agent', dept: 'Support', tagline: 'Tickets · Customer comms · 24/7 support',
    skills: ['Ticket resolution', 'Customer communication', 'Knowledge base updates', 'Escalation handling', '24/7 support'], price: 499 },
  { id: 'RA', code: 'RA', person: 'Maya', name: 'AI Recruiting Agent', dept: 'Recruiting', tagline: 'Screening · Scheduling · Analytics',
    skills: ['Candidate screening', 'Interview scheduling', 'Application review', 'Follow-up management', 'Recruitment analytics'], price: 499 },
  { id: 'DA', code: 'DA', person: 'Lucas', name: 'AI Data Analyst', dept: 'Operations', tagline: 'Dashboards · Insights · Anomaly detection',
    skills: ['Reporting', 'Trend analysis', 'Anomaly detection', 'Forecasting', 'KPI tracking'], price: 499 },
  { id: 'MM', code: 'MM', person: 'Olivia', name: 'AI Marketing Manager', dept: 'Marketing', tagline: 'Campaigns · Content · Lead gen',
    skills: ['Campaign execution', 'Content drafting', 'Lead generation', 'A/B testing', 'Reporting'], price: 499 },
  { id: 'PM', code: 'PM', person: 'Daniel', name: 'AI Procurement Manager', dept: 'Operations', tagline: 'Vendors · POs · Approvals',
    skills: ['Vendor management', 'Purchase orders', 'Approval routing', 'Spend tracking'], price: 499 },
  { id: 'DOC', code: 'DOC', person: 'Ava', name: 'AI Document Specialist', dept: 'Documents', tagline: 'Excel · Word · PowerPoint · fully automated',
    skills: ['Excel spreadsheets', 'Word documents', 'PowerPoint decks', 'Report generation', 'Template automation'], price: 599 },
];

const DEFAULT_AUTONOMY = { OM:'supervised', SM:'supervised', FM:'supervised', SA:'auto', RA:'supervised', DOC:'supervised', DA:'auto', MM:'supervised', PM:'supervised' };
function defaultSchedules() {
  return [
    { id:'sch_1', empId:'DOC', title:'Weekly operations report', docType:'docx', cadence:'Weekly · Mon 08:00', enabled:true, lastRun:null },
    { id:'sch_2', empId:'DOC', title:'Monthly financial model', docType:'xlsx', cadence:'Monthly · 1st 07:00', enabled:true, lastRun:null },
  ];
}

/* A fresh tenant workspace. */
function seedWorkspace(tenantId = 'default', companyName = 'Acme Inc.') {
  const now = Date.now();
  return {
    company: { name: companyName, tenantId, industry: 'SaaS / Technology', team: '11–50', revenue: '€1M – €10M', plan: 'Growth' },
    connectors: [
      { id: 'gmail', name: 'Gmail', category: 'Email', connected: true },
      { id: 'slack', name: 'Slack', category: 'Chat', connected: true },
      { id: 'hubspot', name: 'HubSpot', category: 'CRM', connected: true },
      { id: 'gcal', name: 'Google Calendar', category: 'Calendar', connected: true },
      { id: 'exact', name: 'Exact', category: 'Accounting', connected: false },
    ],
    workforce: ['OM', 'SM', 'FM', 'SA', 'RA'].map((id, i) => {
      const lib = EMPLOYEE_LIBRARY.find(e => e.id === id);
      return {
        id, code: lib.code, person: lib.person, name: lib.name, dept: lib.dept, tagline: lib.tagline, skills: lib.skills,
        status: i % 4 === 2 ? 'busy' : 'live',
        tasksToday: 30 + Math.floor(Math.random() * 90),
        timeSavedToday: +(2 + Math.random() * 7).toFixed(1),
        performance: 95 + Math.floor(Math.random() * 5),
        installedAt: now - i * 86400000,
      };
    }),
    activity: [], tasks: [], audit: [],
    memory: {}, autonomy: { ...DEFAULT_AUTONOMY },
    schedules: defaultSchedules(),
    seq: 1, tseq: 1, aseq: 1,
  };
}

function seedRoot() {
  return {
    authSecret: process.env.NEXA_AUTH_SECRET || crypto.randomBytes(32).toString('hex'),
    users: [seedAdmin()],
    tenants: { default: seedWorkspace('default') },
  };
}

/* Backfill / upgrade older databases, including the pre-multi-tenant
   flat shape, without losing data. */
function migrate(root) {
  if (!root || typeof root !== 'object') return seedRoot();

  // Old flat shape: had company/workforce at the top level → wrap it.
  if (root.company || root.workforce) {
    const ws = {
      company: root.company || seedWorkspace().company,
      connectors: root.connectors || seedWorkspace().connectors,
      workforce: root.workforce || [],
      activity: root.activity || [], tasks: root.tasks || [], audit: root.audit || [],
      memory: root.memory || {}, autonomy: root.autonomy || { ...DEFAULT_AUTONOMY },
      schedules: root.schedules || defaultSchedules(),
      seq: root.seq || 1, tseq: root.tseq || 1, aseq: root.aseq || 1,
    };
    ws.company.tenantId = 'default';
    root = {
      authSecret: root.authSecret || process.env.NEXA_AUTH_SECRET || crypto.randomBytes(32).toString('hex'),
      users: Array.isArray(root.users) && root.users.length ? root.users : [seedAdmin()],
      tenants: { default: ws },
    };
  }

  if (!root.authSecret) root.authSecret = process.env.NEXA_AUTH_SECRET || crypto.randomBytes(32).toString('hex');
  if (!Array.isArray(root.users) || !root.users.length) root.users = [seedAdmin()];
  if (!root.tenants || typeof root.tenants !== 'object') root.tenants = { default: seedWorkspace('default') };

  // Per-workspace backfill of any missing collection.
  for (const [tid, ws] of Object.entries(root.tenants)) {
    if (!ws.company) ws.company = seedWorkspace(tid).company;
    ws.company.tenantId = tid;
    if (!ws.connectors) ws.connectors = seedWorkspace(tid).connectors;
    if (!ws.workforce) ws.workforce = [];
    if (!ws.activity) ws.activity = [];
    if (!ws.tasks) ws.tasks = [];
    if (!ws.audit) ws.audit = [];
    if (!ws.memory) ws.memory = {};
    if (!ws.autonomy) ws.autonomy = { ...DEFAULT_AUTONOMY };
    if (!ws.schedules) ws.schedules = defaultSchedules();
    if (typeof ws.seq !== 'number') ws.seq = 1;
    if (typeof ws.tseq !== 'number') ws.tseq = 1;
    if (typeof ws.aseq !== 'number') ws.aseq = 1;
  }
  return root;
}

let cache = null;

function load() {
  if (cache) return cache;
  ensureDir();
  try {
    cache = migrate(JSON.parse(fs.readFileSync(DB_PATH, 'utf8')));
  } catch {
    cache = seedRoot();
    save();
  }
  return cache;
}

function save() {
  ensureDir();
  // Atomic write: temp file + rename so a crash mid-write cannot corrupt the DB.
  const tmp = DB_PATH + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

/* The workspace for a tenant, seeded on first access. */
function tenant(tenantId = 'default') {
  const root = load();
  if (!root.tenants[tenantId]) { root.tenants[tenantId] = seedWorkspace(tenantId); save(); }
  return root.tenants[tenantId];
}
function tenantIds() { return Object.keys(load().tenants); }

/* Provision a brand-new tenant + its first admin user. */
function createTenant({ tenantId, companyName, adminUser, adminPass, adminName }) {
  const root = load();
  if (root.tenants[tenantId]) return { error: 'tenant_exists' };
  root.tenants[tenantId] = seedWorkspace(tenantId, companyName || tenantId);
  const user = {
    id: 'usr_' + crypto.randomBytes(6).toString('hex'),
    user: String(adminUser).trim().toLowerCase(), name: adminName || adminUser,
    role: 'admin', tenantId, passwordHash: auth.hashPassword(adminPass),
  };
  root.users.push(user);
  save();
  return { tenantId, user: { id: user.id, user: user.user, role: user.role } };
}

/* Add a user to an existing tenant. */
function createUser({ tenantId, user, pass, name, role = 'member' }) {
  const root = load();
  const login = String(user || '').trim().toLowerCase();
  if (!login || !pass) return { error: 'missing_fields' };
  if (root.users.find(u => u.user === login && (u.tenantId || 'default') === tenantId)) return { error: 'user_exists' };
  const rec = { id: 'usr_' + crypto.randomBytes(6).toString('hex'), user: login, name: name || user, role, tenantId, passwordHash: auth.hashPassword(pass) };
  root.users.push(rec);
  save();
  return { id: rec.id, user: rec.user, role: rec.role, tenantId };
}

function findUser(userLogin, tenantId = 'default') {
  const root = load();
  const u = String(userLogin || '').trim().toLowerCase();
  return (root.users || []).find(x => x.user === u && (x.tenantId || 'default') === tenantId) || null;
}

function reset() {
  cache = seedRoot();
  save();
  return cache;
}

module.exports = {
  load, save, reset,
  tenant, tenantIds, createTenant, createUser, findUser,
  EMPLOYEE_LIBRARY,
};
