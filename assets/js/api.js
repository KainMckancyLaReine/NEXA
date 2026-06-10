/* ============================================================
   NEXA — Front-end API client
   Talks to the local NEXA server when present. If the server is
   not running (e.g. page opened directly as a file), every call
   resolves with `null` and callers fall back to local demo data,
   so the UI always works.
   ============================================================ */
window.NEXA = (function () {
  const sameOrigin = location.protocol.startsWith('http');
  const BASE = sameOrigin ? '' : 'http://localhost:4000';
  let online = sameOrigin; // assume online only when served over http

  async function call(pathname, opts = {}) {
    if (!online && !sameOrigin) return null;
    try {
      const res = await fetch(BASE + pathname, {
        method: opts.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
      if (!res.ok) { online = false; return null; }
      online = true;
      return await res.json();
    } catch {
      online = false;
      return null;
    }
  }

  return {
    get online() { return online; },
    login: (user, pass) => call('/api/login', { method: 'POST', body: { user, pass } }),
    state: () => call('/api/state'),
    workforce: () => call('/api/workforce'),
    employee: (id) => call('/api/employee/' + id),
    activity: (since = 0) => call('/api/activity?since=' + since),
    intelligence: () => call('/api/intelligence'),
    marketplace: () => call('/api/marketplace'),
    install: (id) => call('/api/workforce/install', { method: 'POST', body: { id } }),
    command: (text) => call('/api/commands', { method: 'POST', body: { text } }),

    // tasks · human-in-the-loop
    tasks: (status) => call('/api/tasks' + (status ? ('?status=' + encodeURIComponent(status)) : '')),
    submitTask: (text) => call('/api/tasks', { method: 'POST', body: { text } }),
    approveTask: (id) => call('/api/tasks/approve', { method: 'POST', body: { id } }),
    rejectTask: (id) => call('/api/tasks/reject', { method: 'POST', body: { id } }),
    // audit · autonomy · memory
    audit: () => call('/api/audit'),
    roi: () => call('/api/roi'),
    setAutonomy: (id, level) => call('/api/employee/' + id + '/autonomy', { method: 'POST', body: { level } }),
    getMemory: (id) => call('/api/employee/' + id + '/memory'),
    addMemory: (id, note) => call('/api/employee/' + id + '/memory', { method: 'POST', body: { note } }),
    // schedules · connectors
    schedules: () => call('/api/schedules'),
    runSchedule: (id) => call('/api/schedules/run', { method: 'POST', body: { id } }),
    toggleSchedule: (id) => call('/api/schedules/toggle', { method: 'POST', body: { id } }),
    connectorList: () => call('/api/connectors'),
    toggleConnector: (id) => call('/api/connectors/toggle', { method: 'POST', body: { id } }),
  };
})();
