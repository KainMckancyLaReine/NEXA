/* ============================================================
   NEXA — Connector layer
   ------------------------------------------------------------
   A small provider framework. Each connector runs in one of two
   modes:
     • SANDBOX (default) — safe, simulated. Touches no real
       account, sends no email, moves no money. Returns realistic
       fabricated results so the agent engine can demonstrate
       end-to-end execution without credentials.
     • LIVE — a real provider you register (see registerProvider)
       and enable by setting the matching environment variables.

   The engine calls high-level verbs (email.triage, crm.updateDeal,
   finance.createInvoice, …). Whether those hit the sandbox or a
   real API is decided here, per connector, at call time.

   To go live, see server/CONNECTORS.md.
   ============================================================ */

const LATENCY = () => 200 + Math.floor(Math.random() * 400);
const withLatency = (result) => new Promise(r => setTimeout(() => r(result), LATENCY()));
const rid = (p) => p + Math.random().toString(36).slice(2, 10);

/* ----- which connectors are configured for LIVE via env vars ----- */
const LIVE_ENV = {
  gmail:   ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN'],
  outlook: ['OUTLOOK_CLIENT_ID', 'OUTLOOK_CLIENT_SECRET', 'OUTLOOK_REFRESH_TOKEN'],
  hubspot: ['HUBSPOT_TOKEN'],
  salesforce: ['SF_CLIENT_ID', 'SF_CLIENT_SECRET', 'SF_REFRESH_TOKEN'],
  gcal:    ['GCAL_CLIENT_ID', 'GCAL_CLIENT_SECRET', 'GCAL_REFRESH_TOKEN'],
  exact:   ['EXACT_CLIENT_ID', 'EXACT_CLIENT_SECRET'],
};

function modeFor(connectorId) {
  const keys = LIVE_ENV[connectorId];
  if (keys && keys.every(k => process.env[k])) return 'live';
  return 'sandbox';
}

/* Registry of real provider implementations (filled by registerProvider). */
const providers = {};
function registerProvider(connectorId, impl) { providers[connectorId] = impl; }

/* Run a verb either against a registered live provider or the sandbox. */
async function run(connectorId, verb, args, sandboxFn) {
  if (modeFor(connectorId) === 'live' && providers[connectorId] && typeof providers[connectorId][verb] === 'function') {
    return providers[connectorId][verb](args);
  }
  return sandboxFn(args);
}

/* ----- high-level verbs used by the engine ----- */
const connectors = {
  email: {
    send: ({ to, subject } = {}) => run('gmail', 'send', { to, subject },
      () => withLatency({ ok: true, mode: 'sandbox', action: 'email.send', to, subject, messageId: rid('sbx_') })),
    triage: () => run('gmail', 'triage', {},
      () => withLatency({ ok: true, mode: 'sandbox', action: 'email.triage', processed: 12 + Math.floor(Math.random() * 30) })),
  },
  crm: {
    updateDeal: ({ stage } = {}) => run('hubspot', 'updateDeal', { stage },
      () => withLatency({ ok: true, mode: 'sandbox', action: 'crm.updateDeal', stage })),
    listInactiveLeads: () => run('hubspot', 'listInactiveLeads', {},
      () => withLatency({ ok: true, mode: 'sandbox', leads: 20 + Math.floor(Math.random() * 30) })),
  },
  calendar: {
    schedule: ({ title } = {}) => run('gcal', 'schedule', { title },
      () => withLatency({ ok: true, mode: 'sandbox', action: 'calendar.schedule', title, slot: 'Tue 14:00' })),
  },
  finance: {
    createInvoice: ({ amount } = {}) => run('exact', 'createInvoice', { amount },
      () => withLatency({ ok: true, mode: 'sandbox', action: 'finance.invoice', amount, number: 'INV-' + (1000 + Math.floor(Math.random() * 9000)) })),
    listOverdue: () => run('exact', 'listOverdue', {},
      () => withLatency({ ok: true, mode: 'sandbox', count: 4 + Math.floor(Math.random() * 8), total: 20000 + Math.floor(Math.random() * 40000) })),
  },
  support: {
    resolveTickets: () => run('hubspot', 'resolveTickets', {},
      () => withLatency({ ok: true, mode: 'sandbox', resolved: 8 + Math.floor(Math.random() * 20), csat: (4.4 + Math.random() * 0.5).toFixed(1) })),
  },
  recruiting: {
    screen: () => run('hubspot', 'screen', {},
      () => withLatency({ ok: true, mode: 'sandbox', screened: 20 + Math.floor(Math.random() * 40) })),
  },

  /* introspection used by the API / Command Center */
  registerProvider,
  status() {
    return Object.keys(LIVE_ENV).map(id => ({ id, mode: modeFor(id) }));
  },
};

module.exports = connectors;
