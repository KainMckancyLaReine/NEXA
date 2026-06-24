/* ============================================================
   NEXA — API + static server (zero-dependency, multi-tenant)
   Run:  node server/server.js   →  http://localhost:4000
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const store = require('./store');
const auth = require('./auth');
const connectors = require('./connectors');
const { NexaEngine } = require('./engine');

const PORT = process.env.PORT || 4000;
const ROOT = path.join(__dirname, '..');
const CORS_ORIGIN = process.env.NEXA_CORS_ORIGIN || '*';
const MAX_BODY = 1_000_000; // 1 MB request cap
const engine = new NexaEngine();
engine.start(5000);

/* ---- register live connector providers (activate when env vars present) ---- */
function registerProviders() {
  const registry = [
    ['gmail', () => require('./providers/gmail')],
    ['hubspot', () => require('./providers/hubspot')],
    ['exact', () => require('./providers/exact')],
  ];
  const live = new Set(connectors.status().filter(s => s.mode === 'live').map(s => s.id));
  for (const [id, load] of registry) {
    if (live.has(id)) {
      try { connectors.registerProvider(id, load()); console.log(`     Provider      → ${id} LIVE`); }
      catch (e) { console.warn(`     Provider ${id} failed to load:`, e.message); }
    }
  }
}
registerProviders();

const PUBLIC_API = new Set(['/api/login', '/api/signup', '/api/forgot', '/api/reset-password']);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'no-referrer',
  'X-XSS-Protection': '0',
};

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.png': 'image/png', '.jpg': 'image/jpeg' };

function json(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    ...SECURITY_HEADERS,
  });
  res.end(JSON.stringify(data));
}

/* Read a JSON body with a hard size cap to prevent memory-exhaustion. */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = '', size = 0, over = false;
    req.on('data', c => {
      if (over) return;
      size += c.length;
      if (size > MAX_BODY) { over = true; reject(new Error('payload_too_large')); return; }
      b += c;
    });
    req.on('end', () => { if (over) return; try { resolve(b ? JSON.parse(b) : {}); } catch { resolve({}); } });
    req.on('error', reject);
  });
}

function serveStatic(req, res, urlPath) {
  const rel = urlPath === '/' ? '/index.html' : decodeURIComponent(urlPath);
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) return json(res, 403, { error: 'forbidden' });
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream', ...SECURITY_HEADERS });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://${req.headers.host}`);
  const p = u.pathname;

  if (req.method === 'OPTIONS') return json(res, 204, {});

  // ---------- API ----------
  if (p.startsWith('/api/')) {
    const root = store.load();
    const secret = root.authSecret;
    let body;
    if (req.method === 'POST') {
      try { body = await readBody(req); }
      catch { return json(res, 413, { error: 'payload_too_large' }); }
    }

    /* ---------- public: login ---------- */
    if (p === '/api/login' && req.method === 'POST') {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local').toString();
      if (auth.rateLimited(ip)) return json(res, 429, { ok: false, error: 'too_many_attempts' });
      const { user, pass, tenant = 'default' } = body;
      const account = store.findUser(user, tenant);
      const ok = account && auth.verifyPassword(pass, account.passwordHash);
      if (!ok) return json(res, 401, { ok: false, error: 'invalid_credentials' });
      auth.resetRateLimit(ip);
      const token = auth.issueToken({ userId: account.id, tenantId: account.tenantId, role: account.role }, secret);
      const ws = store.tenant(account.tenantId);
      return json(res, 200, { ok: true, user: account.name, role: account.role, tenant: account.tenantId, company: ws.company.name, token });
    }

    /* ---------- public: self-serve signup (new tenant + admin) ---------- */
    if (p === '/api/signup' && req.method === 'POST') {
      if (process.env.NEXA_ALLOW_SIGNUP === 'false') return json(res, 403, { error: 'signup_disabled' });
      const { tenantId, companyName, user, pass, name } = body;
      if (!tenantId || !user || !pass) return json(res, 400, { error: 'missing_fields' });
      const r = store.createTenant({ tenantId: String(tenantId).trim().toLowerCase(), companyName, adminUser: user, adminPass: pass, adminName: name });
      if (r.error) return json(res, 409, r);
      const token = auth.issueToken({ userId: r.user.id, tenantId: r.tenantId, role: 'admin' }, secret);
      return json(res, 200, { ok: true, tenant: r.tenantId, token });
    }

    /* ---------- public: request a password reset ---------- */
    if (p === '/api/forgot' && req.method === 'POST') {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local').toString();
      if (auth.rateLimited('forgot:' + ip)) return json(res, 429, { ok: false, error: 'too_many_attempts' });
      const { user, tenant = 'default' } = body;
      const account = store.findUser(user, tenant);
      if (account) {
        const rtoken = auth.issueResetToken({ userId: account.id, tenantId: account.tenantId }, secret);
        // Always make the code available to the operator via the server console.
        console.log(`\n  🔑  Password reset code for "${account.user}" (valid 30 min):\n      ${rtoken}\n`);
        // If Gmail is live and the account has an email, deliver it there too.
        if (account.email) {
          try {
            await connectors.email.send({ to: account.email, subject: 'Your NEXA password reset code',
              text: `Use this code to reset your password (valid 30 minutes):\n\n${rtoken}\n\nIf you did not request this, ignore this email.` });
          } catch (e) { /* console fallback already done */ }
        }
      }
      // Never reveal whether the account exists.
      return json(res, 200, { ok: true, message: 'If that account exists, a reset code was issued. Check your email, or the server console in local mode.' });
    }

    /* ---------- public: complete a password reset ---------- */
    if (p === '/api/reset-password' && req.method === 'POST') {
      const { token, password } = body;
      if (!password || String(password).length < 8) return json(res, 400, { ok: false, error: 'weak_password', message: 'Password must be at least 8 characters.' });
      const v = auth.verifyResetToken(token, secret);
      if (!v) return json(res, 400, { ok: false, error: 'invalid_or_expired' });
      const r = store.setPassword(v.userId, password);
      if (r.error) return json(res, 400, { ok: false, error: r.error });
      return json(res, 200, { ok: true });
    }

    /* ---------- auth gate ---------- */
    if (!PUBLIC_API.has(p)) {
      const ctx = auth.authContext(req, secret);
      if (!ctx) return json(res, 401, { error: 'unauthorized' });
      req.auth = ctx;
    }

    const tid = req.auth.tenantId;
    const ws = store.tenant(tid);
    const isAdmin = req.auth.role === 'admin';

    /* ---------- admin: user management ---------- */
    if (p === '/api/users' && req.method === 'GET') {
      if (!isAdmin) return json(res, 403, { error: 'forbidden' });
      return json(res, 200, { users: store.listUsers(tid) });
    }
    if (p === '/api/users' && req.method === 'POST') {
      if (!isAdmin) return json(res, 403, { error: 'forbidden' });
      const { user, pass, name, email, role } = body;
      if (!pass || String(pass).length < 8) return json(res, 400, { error: 'weak_password', message: 'Password must be at least 8 characters.' });
      const r = store.createUser({ tenantId: tid, user, pass, name, email, role: role === 'admin' ? 'admin' : 'member' });
      return json(res, r.error ? 409 : 200, r);
    }
    if (p === '/api/users/remove' && req.method === 'POST') {
      if (!isAdmin) return json(res, 403, { error: 'forbidden' });
      const { userId } = body;
      if (userId === req.auth.userId) return json(res, 400, { error: 'cannot_remove_self', message: "You can't remove your own account." });
      const target = store.findUserById(userId);
      if (!target || (target.tenantId || 'default') !== tid) return json(res, 404, { error: 'not_found' });
      if (target.founder) return json(res, 403, { error: 'founder_protected', message: 'The founder account cannot be removed.' });
      const admins = store.listUsers(tid).filter(u => u.role === 'admin');
      if (target.role === 'admin' && admins.length <= 1) return json(res, 400, { error: 'last_admin', message: 'Cannot remove the last admin.' });
      return json(res, 200, store.removeUser(userId));
    }
    if (p === '/api/users/role' && req.method === 'POST') {
      if (!isAdmin) return json(res, 403, { error: 'forbidden' });
      const { userId, role } = body;
      if (userId === req.auth.userId) return json(res, 400, { error: 'cannot_change_self', message: "You can't change your own role." });
      const target = store.findUserById(userId);
      if (!target || (target.tenantId || 'default') !== tid) return json(res, 404, { error: 'not_found' });
      if (target.founder) return json(res, 403, { error: 'founder_protected', message: "The founder's role cannot be changed." });
      if (target.role === 'admin' && role !== 'admin') {
        const admins = store.listUsers(tid).filter(u => u.role === 'admin');
        if (admins.length <= 1) return json(res, 400, { error: 'last_admin', message: 'Cannot demote the last admin.' });
      }
      const r = store.setUserRole(userId, role === 'admin' ? 'admin' : 'member');
      return json(res, r.error ? 400 : 200, r);
    }
    if (p === '/api/users/password' && req.method === 'POST') {
      if (!isAdmin) return json(res, 403, { error: 'forbidden' });
      const { userId, newPassword } = body;
      if (!newPassword || String(newPassword).length < 8) return json(res, 400, { error: 'weak_password', message: 'Password must be at least 8 characters.' });
      const target = store.findUserById(userId);
      if (!target || (target.tenantId || 'default') !== tid) return json(res, 404, { error: 'not_found' });
      if (target.founder && target.id !== req.auth.userId) return json(res, 403, { error: 'founder_protected', message: "The founder's password can only be changed by the founder." });
      store.setPassword(userId, newPassword);
      return json(res, 200, { ok: true });
    }

    /* ---------- admin: create a new company account (tenant) ---------- */
    if (p === '/api/tenants' && req.method === 'POST') {
      if (!isAdmin) return json(res, 403, { error: 'forbidden' });
      const { tenantId, companyName, user, pass, name } = body;
      if (!tenantId || !user || !pass) return json(res, 400, { error: 'missing_fields' });
      if (String(pass).length < 8) return json(res, 400, { error: 'weak_password', message: 'Admin password must be at least 8 characters.' });
      const r = store.createTenant({ tenantId: String(tenantId).trim().toLowerCase(), companyName, adminUser: user, adminPass: pass, adminName: name });
      return json(res, r.error ? 409 : 200, r);
    }
    if (p === '/api/me' && req.method === 'GET') {
      const u = store.findUserById(req.auth.userId);
      return json(res, 200, { userId: req.auth.userId, user: u ? u.user : null, role: req.auth.role, tenant: tid, company: ws.company.name,
        name: u ? u.name : null, email: u ? (u.email || null) : null, avatar: u ? (u.avatar || null) : null });
    }
    if (p === '/api/me/password' && req.method === 'POST') {
      const { currentPassword, newPassword } = body;
      if (!newPassword || String(newPassword).length < 8) return json(res, 400, { ok: false, error: 'weak_password', message: 'Password must be at least 8 characters.' });
      const u = store.findUserById(req.auth.userId);
      if (!u || !auth.verifyPassword(currentPassword, u.passwordHash)) return json(res, 401, { ok: false, error: 'wrong_current', message: 'Current password is incorrect.' });
      store.setPassword(u.id, newPassword);
      return json(res, 200, { ok: true });
    }
    if (p === '/api/me/profile' && req.method === 'POST') {
      const { avatar, name } = body;
      if (avatar != null) {
        if (typeof avatar !== 'string' || !/^data:image\/(png|jpe?g|webp);base64,/.test(avatar)) return json(res, 400, { ok: false, error: 'bad_image' });
        if (avatar.length > 700000) return json(res, 413, { ok: false, error: 'too_large', message: 'Image too large — use a smaller photo.' });
      }
      const r = store.updateUserProfile(req.auth.userId, { avatar, name });
      return json(res, r.error ? 400 : 200, r.error ? { ok: false, error: r.error } : { ok: true });
    }

    if (p === '/api/state' && req.method === 'GET')
      return json(res, 200, { company: ws.company, connectors: ws.connectors, workforce: ws.workforce });

    if (p === '/api/workforce' && req.method === 'GET')
      return json(res, 200, { workforce: ws.workforce });

    if (p.match(/^\/api\/employee\/[A-Z]+$/) && req.method === 'GET') {
      const id = p.split('/').pop();
      const emp = ws.workforce.find(e => e.id === id);
      if (!emp) return json(res, 404, { error: 'not found' });
      const history = ws.activity.filter(a => a.empId === id).slice(0, 40);
      return json(res, 200, { employee: emp, history });
    }

    if (p === '/api/activity' && req.method === 'GET') {
      const since = +u.searchParams.get('since') || 0;
      const items = ws.activity.filter(a => a.ts > since).slice(0, 50);
      return json(res, 200, { activity: ws.activity.slice(0, 30), latest: items });
    }

    if (p === '/api/intelligence' && req.method === 'GET') {
      const wf = ws.workforce;
      const avgPerf = wf.length ? Math.round(wf.reduce((s, e) => s + e.performance, 0) / wf.length) : 0;
      const timeSaved = wf.reduce((s, e) => s + e.timeSavedToday, 0).toFixed(1);
      const tasks = wf.reduce((s, e) => s + e.tasksToday, 0);
      return json(res, 200, {
        revenueForecast: '€1.24M', revenueTrend: '+8.1% MoM',
        bottleneck: 'Invoice approvals delayed 2.3 days avg',
        risk: { accounts: 3, arr: '€84k' },
        performance: avgPerf, timeSaved, tasksExecuted: tasks,
        recommendations: [
          '14 trial accounts show buying signals — deploy Sales Manager outreach.',
          'Auto-send payment reminders for 6 overdue invoices (€31k).',
          'Route tier-1 tickets fully to Support Agent — frees 9h/week.',
        ],
      });
    }

    if (p === '/api/marketplace' && req.method === 'GET') {
      const installed = new Set(ws.workforce.map(e => e.id));
      const items = store.EMPLOYEE_LIBRARY.map(e => ({ ...e, installed: installed.has(e.id) }));
      return json(res, 200, { marketplace: items });
    }

    if (p === '/api/workforce/install' && req.method === 'POST') {
      const { id } = body;
      const lib = store.EMPLOYEE_LIBRARY.find(e => e.id === id);
      if (!lib) return json(res, 400, { error: 'unknown employee' });
      if (ws.workforce.find(e => e.id === id)) return json(res, 200, { ok: true, already: true });
      ws.workforce.push({
        id: lib.id, code: lib.code, person: lib.person, name: lib.name, dept: lib.dept, tagline: lib.tagline, skills: lib.skills,
        status: 'live', tasksToday: 0, timeSavedToday: 0, performance: 95, installedAt: Date.now(),
      });
      store.save();
      return json(res, 200, { ok: true, workforce: ws.workforce });
    }

    if (p === '/api/commands' && req.method === 'POST') {
      const { text } = body;
      if (!text || !text.trim()) return json(res, 400, { error: 'empty command' });
      return json(res, 200, await engine.dispatch(tid, text.trim()));
    }

    /* ---------- tasks · human-in-the-loop ---------- */
    if (p === '/api/tasks' && req.method === 'GET') {
      const status = u.searchParams.get('status');
      let items = ws.tasks;
      if (status) items = items.filter(t => t.status === status);
      const pending = ws.tasks.filter(t => t.status === 'pending_approval').length;
      return json(res, 200, { tasks: items.slice(0, 60), pending });
    }
    if (p === '/api/tasks' && req.method === 'POST') {
      const { text } = body;
      if (!text || !text.trim()) return json(res, 400, { error: 'empty command' });
      return json(res, 200, await engine.submitCommand(tid, text.trim()));
    }
    if (p === '/api/tasks/approve' && req.method === 'POST')
      return json(res, 200, await engine.approve(tid, body.id));
    if (p === '/api/tasks/reject' && req.method === 'POST')
      return json(res, 200, engine.reject(tid, body.id));

    /* ---------- audit ---------- */
    if (p === '/api/audit' && req.method === 'GET')
      return json(res, 200, { audit: ws.audit.slice(0, 100) });

    /* ---------- autonomy + memory ---------- */
    if (p.match(/^\/api\/employee\/[A-Z]+\/autonomy$/) && req.method === 'POST')
      return json(res, 200, engine.setAutonomy(tid, p.split('/')[3], body.level));
    if (p.match(/^\/api\/employee\/[A-Z]+\/memory$/) && req.method === 'GET') {
      const id = p.split('/')[3];
      return json(res, 200, { memory: ws.memory[id] || [], autonomy: ws.autonomy[id] || 'supervised' });
    }
    if (p.match(/^\/api\/employee\/[A-Z]+\/memory$/) && req.method === 'POST')
      return json(res, 200, engine.addMemory(tid, p.split('/')[3], body.note));

    /* ---------- schedules ---------- */
    if (p === '/api/schedules' && req.method === 'GET')
      return json(res, 200, { schedules: ws.schedules });
    if (p === '/api/schedules/run' && req.method === 'POST')
      return json(res, 200, await engine.runSchedule(tid, body.id));
    if (p === '/api/schedules/toggle' && req.method === 'POST') {
      const s = ws.schedules.find(x => x.id === body.id);
      if (s) { s.enabled = !s.enabled; store.save(); }
      return json(res, 200, { schedule: s });
    }

    /* ---------- ROI ---------- */
    if (p === '/api/roi' && req.method === 'GET')
      return json(res, 200, engine.computeRoi(tid));

    /* ---------- pilot mode ---------- */
    if (p === '/api/pilot' && req.method === 'GET')
      return json(res, 200, engine.computePilot(tid));
    if (p === '/api/pilot/start' && req.method === 'POST') {
      if (!isAdmin) return json(res, 403, { error: 'forbidden' });
      return json(res, 200, engine.startPilot(tid, body));
    }
    if (p === '/api/pilot/stop' && req.method === 'POST') {
      if (!isAdmin) return json(res, 403, { error: 'forbidden' });
      return json(res, 200, engine.stopPilot(tid));
    }

    /* ---------- connectors ---------- */
    if (p === '/api/connectors' && req.method === 'GET') {
      const live = new Map(connectors.status().map(s => [s.id, s.mode]));
      const items = ws.connectors.map(c => ({ ...c, mode: live.get(c.id) || 'sandbox' }));
      return json(res, 200, { connectors: items });
    }
    if (p === '/api/connectors/toggle' && req.method === 'POST') {
      const c = ws.connectors.find(x => x.id === body.id);
      if (c) { c.connected = !c.connected; store.save(); }
      return json(res, 200, { connector: c });
    }

    /* ---------- reset (admin only) ---------- */
    if (p === '/api/reset' && req.method === 'POST') {
      if (!isAdmin) return json(res, 403, { error: 'forbidden' });
      store.reset();
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { error: 'unknown endpoint' });
  }

  serveStatic(req, res, p);
});

server.listen(PORT, () => {
  console.log(`\n  ◎  NEXA running → http://localhost:${PORT}`);
  console.log(`     API base      → http://localhost:${PORT}/api`);
  const liveCount = connectors.status().filter(s => s.mode === 'live').length;
  console.log(`     Connectors    → ${liveCount ? liveCount + ' LIVE' : 'SANDBOX (no real accounts touched)'}\n`);
});
