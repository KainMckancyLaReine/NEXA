/* ============================================================
   NEXA — Front-end API client
   Talks to the local NEXA server when present. If the server is
   not running (e.g. page opened directly as a file), every call
   resolves with `null` and callers fall back to local demo data,
   so the UI always works.
   ============================================================ */
window.NEXA = (function () {
  // ===========================================================================
  // STATIC HOSTING (e.g. GitHub Pages): point this at your deployed NEXA backend
  // so the static site can log in and load real data from the server.
  //   e.g. const API_BASE_OVERRIDE = 'https://nexa-xxxx.onrender.com';
  // Leave '' when the Node server serves this site itself (same origin / local).
  // You can also set window.NEXA_API_BASE = '...' before this script loads.
  // ===========================================================================
  const API_BASE_OVERRIDE = '';
  const configured = ((window.NEXA_API_BASE || API_BASE_OVERRIDE) || '').replace(/\/+$/, '');

  const sameOrigin = location.protocol.startsWith('http');
  const BASE = configured || (sameOrigin ? '' : 'http://localhost:4000');
  let online = !!configured || sameOrigin; // online when a backend URL is known

  // Bearer token from login. Kept in memory and mirrored to localStorage
  // (when available) so navigation within the dashboard stays signed in.
  let token = null;
  try { token = localStorage.getItem('nexa_token') || null; } catch {}
  function setToken(t) {
    token = t || null;
    try { t ? localStorage.setItem('nexa_token', t) : localStorage.removeItem('nexa_token'); } catch {}
  }

  async function call(pathname, opts = {}) {
    if (!online && !sameOrigin) return null;
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;
      const res = await fetch(BASE + pathname, {
        method: opts.method || 'GET',
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
      // On an expired/missing token, clear it and behave like "offline" so
      // callers fall back to local demo data instead of rendering errors.
      if (res.status === 401 && pathname !== '/api/login' && pathname !== '/api/signup') { setToken(null); return null; }
      if (!res.ok) { online = false; return null; }
      online = true;
      return await res.json();
    } catch {
      online = false;
      return null;
    }
  }

  async function login(user, pass, tenant = 'default') {
    const r = await call('/api/login', { method: 'POST', body: { user, pass, tenant } });
    if (r && r.ok && r.token) setToken(r.token);
    return r;
  }

  async function signup(opts) {
    const r = await call('/api/signup', { method: 'POST', body: opts });
    if (r && r.ok && r.token) setToken(r.token);
    return r;
  }

  return {
    get online() { return online; },
    get configured() { return !!configured; },
    get authed() { return !!token; },
    logout: () => setToken(null),
    login,
    signup,
    forgotPassword: (user, tenant='default') => call('/api/forgot', { method: 'POST', body: { user, tenant } }),
    resetPassword: (token, password) => call('/api/reset-password', { method: 'POST', body: { token, password } }),
    me: () => call('/api/me'),
    changePassword: (currentPassword, newPassword) => call('/api/me/password', { method: 'POST', body: { currentPassword, newPassword } }),
    updateProfile: (patch) => call('/api/me/profile', { method: 'POST', body: patch }),
    listUsers: () => call('/api/users'),
    createUser: (u) => call('/api/users', { method: 'POST', body: u }),
    removeUser: (userId) => call('/api/users/remove', { method: 'POST', body: { userId } }),
    setUserRole: (userId, role) => call('/api/users/role', { method: 'POST', body: { userId, role } }),
    setUserPassword: (userId, newPassword) => call('/api/users/password', { method: 'POST', body: { userId, newPassword } }),
    createCompany: (data) => call('/api/tenants', { method: 'POST', body: data }),
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
    // pilot mode
    pilot: () => call('/api/pilot'),
    startPilot: (cfg) => call('/api/pilot/start', { method: 'POST', body: cfg }),
    stopPilot: () => call('/api/pilot/stop', { method: 'POST' }),
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
