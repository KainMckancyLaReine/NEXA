# NEXA — Connectors (going live)

NEXA ships with **sandbox connectors**: safe, simulated integrations that
never touch a real account, send email, or move money. They let the agent
engine demonstrate full end-to-end execution without credentials.

Each connector runs in one of two modes, decided per call in
`server/connectors.js`:

- **sandbox** (default) — fabricated, realistic results.
- **live** — a real provider you register, enabled automatically once the
  matching environment variables are present.

## How a connector resolves

The engine calls high-level verbs, e.g. `connectors.email.triage()` or
`connectors.finance.createInvoice({ amount })`. For each verb:

1. NEXA checks whether that connector is **configured for live** (all of its
   environment variables are set — see `LIVE_ENV` in `connectors.js`).
2. If live **and** a provider is registered, it calls the real provider.
3. Otherwise it returns the sandbox result.

## Going live with a provider (example: Gmail)

1. Create OAuth credentials in Google Cloud and obtain a refresh token.
2. Set the environment variables before starting the server:

   ```bash
   export GMAIL_CLIENT_ID=...
   export GMAIL_CLIENT_SECRET=...
   export GMAIL_REFRESH_TOKEN=...
   node server/server.js
   ```

3. Register the real implementation (e.g. in a new `server/providers/gmail.js`)
   and wire it in at startup:

   ```js
   const connectors = require('./connectors');
   connectors.registerProvider('gmail', {
     async triage()            { /* call Gmail API, return { processed } */ },
     async send({ to, subject }) { /* send via Gmail API, return { ok, messageId } */ },
   });
   ```

That's it — `email.triage()` / `email.send()` now hit Gmail in production and
fall back to sandbox locally.

## Environment variables recognised

| Connector  | Required env vars                                             |
|------------|--------------------------------------------------------------|
| gmail      | `GMAIL_CLIENT_ID` `GMAIL_CLIENT_SECRET` `GMAIL_REFRESH_TOKEN` |
| outlook    | `OUTLOOK_CLIENT_ID` `OUTLOOK_CLIENT_SECRET` `OUTLOOK_REFRESH_TOKEN` |
| hubspot    | `HUBSPOT_TOKEN`                                              |
| salesforce | `SF_CLIENT_ID` `SF_CLIENT_SECRET` `SF_REFRESH_TOKEN`        |
| gcal       | `GCAL_CLIENT_ID` `GCAL_CLIENT_SECRET` `GCAL_REFRESH_TOKEN`  |
| exact      | `EXACT_CLIENT_ID` `EXACT_CLIENT_SECRET`                     |

`GET /api/connectors` reports each connector's current `mode` (`sandbox` or
`live`) so the Command Center can show it.

## Safety

Every side-effecting action should pass through NEXA's **approval queue**
(`POST /api/tasks` → `pending_approval` → human approves → executes). Keep an
employee in `supervised` autonomy until you trust it; switch to `auto` per
employee from the Command Center. Every action is written to the **audit log**
(`GET /api/audit`).
