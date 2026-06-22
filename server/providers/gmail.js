/* ============================================================
   NEXA — Gmail live provider (real API, zero-dependency)
   ------------------------------------------------------------
   Implements the email connector verbs against the real Gmail
   API. Activates only when these env vars are set:
       GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
   Registered in server.js via connectors.registerProvider('gmail', ...).

   Safety: send() is gated by the engine's approval/audit layer.
   This module performs the network call only when actually invoked
   after approval. Uses global fetch (Node 18+).
   ============================================================ */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API = 'https://gmail.googleapis.com/gmail/v1/users/me';

let _access = { token: null, exp: 0 };

async function accessToken() {
  if (_access.token && Date.now() < _access.exp - 60_000) return _access.token;
  const body = new URLSearchParams({
    client_id: process.env.GMAIL_CLIENT_ID,
    client_secret: process.env.GMAIL_CLIENT_SECRET,
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`gmail token ${res.status}: ${await res.text()}`);
  const data = await res.json();
  _access = { token: data.access_token, exp: Date.now() + (data.expires_in || 3600) * 1000 };
  return _access.token;
}

async function api(path, init = {}) {
  const token = await accessToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`gmail ${path} ${res.status}: ${await res.text()}`);
  return res.json();
}

function rfc822({ to, subject, text }) {
  const lines = [`To: ${to}`, `Subject: ${subject}`, 'Content-Type: text/plain; charset="UTF-8"', '', text || ''];
  return Buffer.from(lines.join('\r\n')).toString('base64url');
}

module.exports = {
  /* Count and label unread/inbox messages — a real "triage" read. */
  async triage() {
    const list = await api('/messages?q=is:unread%20category:primary&maxResults=50');
    const processed = (list.messages || []).length;
    return { ok: true, mode: 'live', action: 'email.triage', processed };
  },

  /* Send a real email. Only reached after approval in supervised mode. */
  async send({ to, subject, text } = {}) {
    if (!to || to.startsWith('segment:')) {
      // Segment expansion belongs to the CRM connector; refuse ambiguous sends.
      return { ok: false, mode: 'live', action: 'email.send', error: 'explicit recipient required' };
    }
    const out = await api('/messages/send', { method: 'POST', body: JSON.stringify({ raw: rfc822({ to, subject, text }) }) });
    return { ok: true, mode: 'live', action: 'email.send', to, subject, messageId: out.id };
  },
};
