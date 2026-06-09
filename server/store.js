/* ============================================================
   NEXA — Persistence layer (zero-dependency JSON store)
   ============================================================ */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'nexa.json');

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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

function seed() {
  const now = Date.now();
  return {
    company: { name: 'Acme Inc.', industry: 'SaaS / Technology', team: '11–50', revenue: '€1M – €10M', plan: 'Growth' },
    connectors: [
      { id: 'gmail', name: 'Gmail', category: 'Email', connected: true },
      { id: 'slack', name: 'Slack', category: 'Chat', connected: true },
      { id: 'hubspot', name: 'HubSpot', category: 'CRM', connected: true },
      { id: 'gcal', name: 'Google Calendar', category: 'Calendar', connected: true },
      { id: 'exact', name: 'Exact', category: 'Accounting', connected: false },
    ],
    // installed workforce (subset of library)
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
    activity: [],
    tasks: [],
    audit: [],
    memory: {},                       // { [empId]: [ {ts, note} ] }
    autonomy: { OM:'supervised', SM:'supervised', FM:'supervised', SA:'auto', RA:'supervised', DOC:'supervised', DA:'auto', MM:'supervised', PM:'supervised' },
    schedules: [
      { id:'sch_1', empId:'DOC', title:'Weekly operations report', docType:'docx', cadence:'Weekly · Mon 08:00', enabled:true, lastRun:null },
      { id:'sch_2', empId:'DOC', title:'Monthly financial model', docType:'xlsx', cadence:'Monthly · 1st 07:00', enabled:true, lastRun:null },
    ],
    seq: 1,
    tseq: 1,
    aseq: 1,
  };
}

/* Backfill collections that may be missing from an older saved DB. */
function migrate(db) {
  if (!db.tasks) db.tasks = [];
  if (!db.audit) db.audit = [];
  if (!db.memory) db.memory = {};
  if (!db.autonomy) db.autonomy = { OM:'supervised', SM:'supervised', FM:'supervised', SA:'auto', RA:'supervised', DOC:'supervised', DA:'auto', MM:'supervised', PM:'supervised' };
  if (!db.schedules) db.schedules = [
    { id:'sch_1', empId:'DOC', title:'Weekly operations report', docType:'docx', cadence:'Weekly · Mon 08:00', enabled:true, lastRun:null },
    { id:'sch_2', empId:'DOC', title:'Monthly financial model', docType:'xlsx', cadence:'Monthly · 1st 07:00', enabled:true, lastRun:null },
  ];
  if (typeof db.tseq !== 'number') db.tseq = 1;
  if (typeof db.aseq !== 'number') db.aseq = 1;
  return db;
}

let cache = null;

function load() {
  if (cache) return cache;
  ensureDir();
  try {
    cache = migrate(JSON.parse(fs.readFileSync(DB_PATH, 'utf8')));
  } catch {
    cache = seed();
    save();
  }
  return cache;
}

function save() {
  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2));
}

function reset() {
  cache = seed();
  save();
  return cache;
}

module.exports = { load, save, reset, EMPLOYEE_LIBRARY };
