# NEXA — Wat is er gebouwd (changelog naar marktklaar)

*22 juni 2026*

Dit zijn de wijzigingen die de audit-bevindingen omzetten in echte code. Alles is
getest: server start, login werkt, beveiligde routes weigeren ongeautoriseerde
toegang, commando's lopen door de approval-queue.

## P0 — opgelost

**1. Echte authenticatie** — `server/auth.js` (nieuw), `server/server.js`,
`assets/js/api.js`
- Wachtwoorden gehasht met scrypt + salt (geen plain-text meer).
- Stateless, HMAC-ondertekende tokens met 12u-expiry; op élke `/api/*`-route
  geverifieerd (behalve login). Geknoeide of verlopen tokens → 401.
- Login rate-limited (8 pogingen/15 min per IP).
- Signing-secret en admin-account uit env (`NEXA_AUTH_SECRET`, `NEXA_ADMIN_*`);
  demo-login `Kain/Kain25` blijft werken.
- Front-end client stuurt nu de bearer-token mee en logt uit bij 401.

**2. Echte AI in de engine** — `server/llm.js` (nieuw), `server/engine.js`
- Provider-agnostische LLM-laag (Anthropic of OpenAI, auto-detectie via env).
- `planChain()` laat het model de Understand→Decide→Execute-stappen genereren,
  toegespitst op het commando. Zonder key valt het terug op de deterministische
  `buildChain` — demo blijft draaien.

**3. Echte connectors** — `server/providers/gmail.js` + `hubspot.js` (nieuw),
`server/server.js`
- Gmail: echte OAuth-token-refresh + Gmail API voor triage/verzenden.
- HubSpot: echte CRM-search voor inactieve leads, deal-updates, ticket-telling.
- Worden automatisch geregistreerd zodra hun env-vars aanwezig zijn; anders
  sandbox. Side-effects blijven achter approval + audit.

**4. Robuuste opslag + multi-tenant fundament** — `server/store.js`
- Atomic writes (temp-bestand + rename) → geen corruptie meer bij een crash.
- Echte `users`-array met gehashte credentials; `tenantId` op company en data;
  `authSecret` per installatie. Migratie vult dit aan op bestaande databases.

## P1 — opgelost / ingezet

**5. Eerlijke ROI** — `server/engine.js`
- Niet langer `+0.1 uur` per actie. Nu transparante per-taaktype-schattingen,
  output gelabeld `estimated:true` met de aannames erbij. Klaar om te vervangen
  door gemeten tijd per klant.

**6. Security-hygiëne** — `.env.example` (nieuw), `.gitignore`
- Alle secrets via env; `.env` genegeerd door git; voorbeeldconfig toegevoegd.

## Ronde 2 — "fix alles": de rest afgemaakt

**7. Echte multi-tenancy** — `server/store.js`, `server/engine.js`,
`server/server.js`
- Data is nu per tenant gepartitioneerd (`tenants[tenantId]`). Elke engine-methode
  en API-route is gescopet op `req.auth.tenantId`. **Getest:** tenant B kan de
  memory/data van tenant A niet zien.
- Self-serve `POST /api/signup` maakt een nieuwe tenant + admin aan en geeft een
  token terug. Migratie wikkelt de oude flat-DB automatisch in `tenants.default`.

**8. Memory die meebeslist** — `server/engine.js`
- De per-employee memory wordt nu in de LLM-planningsprompt geïnjecteerd
  ("Learned preferences — must respect"). Correcties van de gebruiker sturen dus
  echt toekomstig gedrag (met een model-key actief).

**9. Gebruikersbeheer + rollen** — `server/server.js`
- `POST /api/users` (admin-only) voegt teamleden toe binnen de tenant. `reset` is
  nu ook admin-only. `GET /api/me` geeft de huidige sessie terug.

**10. Security-hardening** — `server/server.js`
- Beveiligingsheaders op alle responses (nosniff, SAMEORIGIN, no-referrer).
- Request-body gelimiteerd op 1 MB → **getest: 413** bij oversize.
- Configureerbare CORS-origin (`NEXA_CORS_ORIGIN`).

**11. Tweede finance-connector** — `server/providers/exact.js`
- Echte Exact Online-provider: OAuth-refresh (met token-rotatie) + receivables
  ophalen. Activeert op `EXACT_*` env-vars. Relevant voor het accountancy-beachhead.

**12. Compliance-baseline** — `business/NEXA-Security-en-AVG-Baseline.md`
- Volledige security/AVG-basis: wat in code zit, wat nog proces vereist,
  least-privilege scopes per connector, en het pad naar SOC 2.

**13. Alle 9 AI-medewerkers volledig commandeerbaar** — `server/engine.js`
- Marketing (MM), Data Analyst (DA) en Procurement (PM) waren alleen actief in de
  autonome achtergrondloop en vielen bij commando's terug op Operations. Nu hebben
  ze eigen routing-keywords, eigen actie-chains én eigen AI-planningscontext.
  **Getest:** alle 9 (OM/SM/FM/SA/RA/MM/PM/DA/DOC) routeren correct en voeren uit.

## Echt nog over (vereist jouw input/credentials — niet door code op te lossen)

- **Connector-credentials.** Gmail/HubSpot/Exact-code is echt maar slaapt tot jij
  OAuth-credentials zet (`.env`). Eén echte klant-account koppelen = volgende stap.
- **Productie-Postgres.** De store is nu tenant-bewust en achter een schone
  interface; Postgres is een drop-in vervanging van `load/save/tenant` — infra-keuze.
- **TLS + DPA + EU-datalocatie.** Operationeel/juridisch, niet code. Zie de
  security-baseline voor de volgorde.

## Hoe te draaien

```bash
node server/server.js        # demo (sandbox, deterministisch)
# of met echte AI + connectors:
cp .env.example .env         # vul keys in
# ANTHROPIC_API_KEY / HUBSPOT_TOKEN / GMAIL_* …
node server/server.js
```
