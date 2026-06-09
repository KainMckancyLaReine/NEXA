/* ============================================================
   NEXA — API + static server (zero-dependency)
   Run:  node server/server.js   →  http://localhost:4000
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const store = require('./store');
const { NexaEngine } = require('./engine');

const PORT = process.env.PORT || 4000;
const ROOT = path.join(__dirname, '..'); // serve the site too
const engine = new NexaEngine();
engine.start(5000);

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function json(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' });
  res.end(body);
}

function readBody(req) {
  return new Promise(resolve => {
    let b = '';
    req.on('data', c => (b += c));
    req.on('end', () => { try { resolve(b ? JSON.parse(b) : {}); } catch { resolve({}); } });
  });
}

function serveStatic(req, res, urlPath) {
  let rel = urlPath === '/' ? '/index.html' : decodeURIComponent(urlPath);
  const filePath = path.join(ROOT, rel);
  if (!filePath.startsWith(ROOT)) return json(res, 403, { error: 'forbidden' });
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://${req.headers.host}`);
  const p = u.pathname;

  if (req.method === 'OPTIONS') return json(res, 204, {});

  // ---------- API ----------
  if (p.startsWith('/api/')) {
    const db = store.load();

    if (p === '/api/state' && req.method === 'GET')
      return json(res, 200, { company: db.company, connectors: db.connectors, workforce: db.workforce });

    if (p === '/api/workforce' && req.method === 'GET')
      return json(res, 200, { workforce: db.workforce });

    if (p.match(/^\/api\/employee\/[A-Z]+$/) && req.method === 'GET') {
      const id = p.split('/').pop();
      const emp = db.workforce.find(e => e.id === id);
      if (!emp) return json(res, 404, { error: 'not found' });
      const history = db.activity.filter(a => a.empId === id).slice(0, 40);
      return json(res, 200, { employee: emp, history });
    }

    if (p === '/api/activity' && req.method === 'GET') {
      const since = +u.searchParams.get('since') || 0;
      const items = db.activity.filter(a => a.ts > since).slice(0, 50);
      return json(res, 200, { activity: db.activity.slice(0, 30), latest: items });
    }

    if (p === '/api/intelligence' && req.method === 'GET') {
      const wf = db.workforce;
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
      const installed = new Set(db.workforce.map(e => e.id));
      const items = store.EMPLOYEE_LIBRARY.map(e => ({ ...e, installed: installed.has(e.id) }));
      return json(res, 200, { marketplace: items });
    }

    if (p === '/api/workforce/install' && req.method === 'POST') {
      const { id } = await readBody(req);
      const lib = store.EMPLOYEE_LIBRARY.find(e => e.id === id);
      if (!lib) return json(res, 400, { error: 'unknown employee' });
      if (db.workforce.find(e => e.id === id)) return json(res, 200, { ok: true, already: true });
      db.workforce.push({
        id: lib.id, code: lib.code, person: lib.person, name: lib.name, dept: lib.dept, tagline: lib.tagline, skills: lib.skills,
        status: 'live', tasksToday: 0, timeSavedToday: 0, performance: 95, installedAt: Date.now(),
      });
      store.save();
      return json(res, 200, { ok: true, workforce: db.workforce });
    }

    if (p === '/api/commands' && req.method === 'POST') {
      const { text } = await readBody(req);
      if (!text || !text.trim()) return json(res, 400, { error: 'empty command' });
      const result = await engine.dispatch(text.trim());
      return json(res, 200, result);
    }

    /* ---------- tasks · human-in-the-loop ---------- */
    if (p === '/api/tasks' && req.method === 'GET') {
      const status = u.searchParams.get('status');
      let items = db.tasks;
      if (status) items = items.filter(t => t.status === status);
      const pending = db.tasks.filter(t => t.status === 'pending_approval').length;
      return json(res, 200, { tasks: items.slice(0, 60), pending });
    }
    if (p === '/api/tasks' && req.method === 'POST') {
      const { text } = await readBody(req);
      if (!text || !text.trim()) return json(res, 400, { error: 'empty command' });
      const result = await engine.submitCommand(text.trim());
      return json(res, 200, result);
    }
    if (p === '/api/tasks/approve' && req.method === 'POST') {
      const { id } = await readBody(req);
      return json(res, 200, await engine.approve(id));
    }
    if (p === '/api/tasks/reject' && req.method === 'POST') {
      const { id } = await readBody(req);
      return json(res, 200, engine.reject(id));
    }

    /* ---------- audit ---------- */
    if (p === '/api/audit' && req.method === 'GET')
      return json(res, 200, { audit: db.audit.slice(0, 100) });

    /* ---------- autonomy + memory ---------- */
    if (p.match(/^\/api\/employee\/[A-Z]+\/autonomy$/) && req.method === 'POST') {
      const id = p.split('/')[3];
      const { level } = await readBody(req);
      return json(res, 200, engine.setAutonomy(id, level));
    }
    if (p.match(/^\/api\/employee\/[A-Z]+\/memory$/) && req.method === 'GET') {
      const id = p.split('/')[3];
      return json(res, 200, { memory: db.memory[id] || [], autonomy: db.autonomy[id] || 'supervised' });
    }
    if (p.match(/^\/api\/employee\/[A-Z]+\/memory$/) && req.method === 'POST') {
      const id = p.split('/')[3];
      const { note } = await readBody(req);
      return json(res, 200, engine.addMemory(id, note));
    }

    /* ---------- schedules ---------- */
    if (p === '/api/schedules' && req.method === 'GET')
      return json(res, 200, { schedules: db.schedules });
    if (p === '/api/schedules/run' && req.method === 'POST') {
      const { id } = await readBody(req);
      return json(res, 200, await engine.runSchedule(id));
    }
    if (p === '/api/schedules/toggle' && req.method === 'POST') {
      const { id } = await readBody(req);
      const s = db.schedules.find(x => x.id === id);
      if (s) { s.enabled = !s.enabled; store.save(); }
      return json(res, 200, { schedule: s });
    }

    /* ---------- ROI ---------- */
    if (p === '/api/roi' && req.method === 'GET')
      return json(res, 200, engine.computeRoi());

    /* ---------- connectors ---------- */
    if (p === '/api/connectors' && req.method === 'GET') {
      const connectors = require('./connectors');
      const live = new Map(connectors.status().map(s => [s.id, s.mode]));
      const items = db.connectors.map(c => ({ ...c, mode: live.get(c.id) || 'sandbox' }));
      return json(res, 200, { connectors: items });
    }
    if (p === '/api/connectors/toggle' && req.method === 'POST') {
      const { id } = await readBody(req);
      const c = db.connectors.find(x => x.id === id);
      if (c) { c.connected = !c.connected; store.save(); }
      return json(res, 200, { connector: c });
    }

    if (p === '/api/reset' && req.method === 'POST') { store.reset(); return json(res, 200, { ok: true }); }

    return json(res, 404, { error: 'unknown endpoint' });
  }

  // ---------- static site ----------
  serveStatic(req, res, p);
});

server.listen(PORT, () => {
  console.log(`\n  ◎  NEXA running → http://localhost:${PORT}`);
  console.log(`     API base      → http://localhost:${PORT}/api`);
  console.log(`     Connectors    → SANDBOX (no real accounts touched)\n`);
});
