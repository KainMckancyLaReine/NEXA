# NEXA — Setup & go-live gids

Van demo naar een echte pilot-omgeving. Volg deze stappen in volgorde. Je hebt
geen extra packages nodig (Node 18+); alle connectors werken via ingebouwde fetch.

---

## 0. Configuratie aanmaken

```bash
cp .env.example .env
```

Open `.env` en vul minimaal in:

```bash
NEXA_AUTH_SECRET=<lange willekeurige string>      # bv. `openssl rand -hex 32`
NEXA_ADMIN_USER=jouwnaam
NEXA_ADMIN_PASS=<sterk wachtwoord>
NEXA_CORS_ORIGIN=https://app.jouwdomein.nl         # geen * in productie
NEXA_ALLOW_SIGNUP=false                             # pilot = jij maakt de tenants
```

> Zolang een connector-blok leeg is, blijft die connector in **sandbox** (veilig,
> raakt niets aan). Vul je de variabelen, dan gaat hij automatisch **live**.

---

## 1. AI-engine live zetten (aanrader voor de pilot)

Zet één model-key zodat de bots echt plannen i.p.v. vaste teksten:

```bash
ANTHROPIC_API_KEY=sk-ant-...        # of: OPENAI_API_KEY=sk-...
# optioneel: NEXA_LLM_MODEL=claude-sonnet-4-6
```

Kies bij voorkeur een aanbieder die je input **niet** gebruikt voor training en een
verwerkersovereenkomst (DPA) biedt — zie de security-baseline.

---

## 2. Connector: Gmail live

1. Google Cloud Console → nieuw project → **Gmail API** inschakelen.
2. OAuth-consent scherm instellen; scopes minimaal houden:
   - `https://www.googleapis.com/auth/gmail.readonly` (triage)
   - `https://www.googleapis.com/auth/gmail.send` (alleen als verzenden aan moet)
3. OAuth-client (type *Web*) aanmaken → client ID + secret.
4. Eenmalig een **refresh token** ophalen via de OAuth Playground of je eigen flow.
5. In `.env`:

```bash
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
```

Bij herstart logt de server `Provider → gmail LIVE`.

---

## 3. Connector: HubSpot live (CRM)

1. HubSpot → Settings → Integrations → **Private Apps** → app aanmaken.
2. Scopes: `crm.objects.contacts.read`, `…deals.read/write`, `tickets.read`
   (alleen wat je gebruikt).
3. Kopieer het **access token**.

```bash
HUBSPOT_TOKEN=pat-...
```

---

## 4. Connector: Exact Online live (finance — beachhead)

1. Exact App Center → app registreren → client ID + secret.
2. Doorloop de OAuth-autorisatie → **refresh token** (let op: Exact roteert het
   refresh token bij elke vernieuwing — sla de nieuwe op in productie).
3. Bepaal de **division** (administratie-ID) van de klant.

```bash
EXACT_CLIENT_ID=...
EXACT_CLIENT_SECRET=...
EXACT_REFRESH_TOKEN=...
EXACT_DIVISION=...
EXACT_BASE=https://start.exactonline.nl   # pas regio aan indien nodig
```

> `finance.listOverdue` haalt direct echte achterstallige posten op. Het posten van
> facturen (`createInvoice`) blijft achter goedkeuring én vereist een per-klant
> factuur-mapping voordat het echt boekt — bewust veilig.

---

## 5. Draaien

```bash
node server/server.js
```

De opstartregel toont nu hoeveel connectors **LIVE** zijn. Log in met je admin-account
en start de pilot:

```bash
POST /api/pilot/start
{ "baselineHoursPerWeek": 18, "hourlyRate": 50, "seats": 1, "label": "Klantnaam" }
```

---

## 6. Productie-hardening (vóór de eerste echte klant)

Niet met code op te lossen — dit is jouw checklist:

- **TLS/HTTPS** afdwingen via een reverse proxy (Caddy/Nginx) of een platform
  (Render, Fly.io, Railway). Nooit klantdata over plain HTTP.
- **`NEXA_CORS_ORIGIN`** op je echte front-end origin zetten (geen `*`).
- **Token-encryptie at rest** voor de OAuth-tokens (secret manager / KMS).
- **Postgres** i.p.v. de JSON-store bij meerdere klanten — de store zit achter een
  schone `load/save/tenant`-interface, dus dit is een drop-in vervanging.
- **Back-ups** van de datastore (geëncrypteerd, getest).
- **DPA + EU-datalocatie** geregeld. Zie `NEXA-Security-en-AVG-Baseline.md`.

---

## Snelle probleemoplossing

| Symptoom | Oorzaak / fix |
|---|---|
| Connector blijft `sandbox` | Eén of meer env-variabelen ontbreken; check de exacte namen in `.env.example` |
| `401 unauthorized` op API | Token verlopen (12u) of ontbreekt — opnieuw inloggen |
| Bots geven nog "verzonnen" cijfers | Connector staat nog op sandbox, of geen model-key gezet |
| Exact `token` fout | Refresh token verlopen/geroteerd — opnieuw autoriseren |
