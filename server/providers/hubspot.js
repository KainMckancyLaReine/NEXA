/* ============================================================
   NEXA — HubSpot live provider (real API, zero-dependency)
   ------------------------------------------------------------
   Implements the CRM verbs against the real HubSpot CRM API using
   a private-app token. Activates only when set:
       HUBSPOT_TOKEN
   Registered in server.js via connectors.registerProvider('hubspot', ...).
   Uses global fetch (Node 18+).
   ============================================================ */

const API = 'https://api.hubapi.com';

async function hub(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`hubspot ${path} ${res.status}: ${await res.text()}`);
  return res.json();
}

module.exports = {
  /* Leads with no activity in the last 30 days. */
  async listInactiveLeads() {
    const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
    const body = {
      filterGroups: [{ filters: [{ propertyName: 'notes_last_contacted', operator: 'LT', value: String(cutoff) }] }],
      properties: ['email', 'firstname', 'lastname', 'notes_last_contacted'],
      limit: 100,
    };
    const data = await hub('/crm/v3/objects/contacts/search', { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, mode: 'live', leads: data.total ?? (data.results || []).length, sample: (data.results || []).slice(0, 5) };
  },

  /* Move a deal to a new stage. dealId + stage required for a real write. */
  async updateDeal({ dealId, stage } = {}) {
    if (!dealId) return { ok: false, mode: 'live', action: 'crm.updateDeal', error: 'dealId required' };
    await hub(`/crm/v3/objects/deals/${dealId}`, { method: 'PATCH', body: JSON.stringify({ properties: { dealstage: stage } }) });
    return { ok: true, mode: 'live', action: 'crm.updateDeal', dealId, stage };
  },

  /* Count open support tickets (read-only; resolution stays human-gated). */
  async resolveTickets() {
    const body = {
      filterGroups: [{ filters: [{ propertyName: 'hs_pipeline_stage', operator: 'NEQ', value: 'closed' }] }],
      properties: ['subject', 'hs_pipeline_stage'], limit: 100,
    };
    const data = await hub('/crm/v3/objects/tickets/search', { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, mode: 'live', open: data.total ?? 0, note: 'resolution requires approval' };
  },
};
