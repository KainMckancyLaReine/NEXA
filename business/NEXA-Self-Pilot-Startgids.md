# NEXA — Self-pilot startgids (jij als je eigen eerste klant)

*Doel: NEXA echt laten werken op je eigen accounts, zodat je een draaiende
live-demo + een eerlijk eerste resultaat hebt — zonder dat je een klant nodig hebt.*

Je hebt geen klant nodig om een volwaardige pilot te draaien. Je dogfoodt op je
eigen Gmail en je eigen werk. Daarna verkoop je met een echte, werkende omgeving in
plaats van slides.

---

## De drie fasen

1. **Generale in sandbox** (vandaag, niets koppelen) — leer de flow.
2. **Self-pilot op je eigen Gmail** (½ dag setup) — echt werk, echt bewijs.
3. **Optioneel: testdata in gratis tools** (HubSpot/Exact) — volledige live-omgeving.

---

## Fase 1 — Generale in sandbox (30 min)

```bash
node server/server.js
```

Log in (`Kain` / `Kain25`) en doorloop de hele beweging één keer:

- Start de pilot-meter:
  `POST /api/pilot/start { "baselineHoursPerWeek": 10, "hourlyRate": 50, "seats": 1, "label": "Self-pilot" }`
- Geef een paar commando's (bv. "chase overdue invoices", "build an excel cashflow model").
- Geef een verzend-commando: *"stuur mail naar jezelf@gmail.com over een testherinnering"* →
  ga naar **Approvals** in het dashboard: je ziet het **mailconcept** (aan/onderwerp/body).
  Keur goed → in sandbox wordt het gesimuleerd.
- Bekijk `GET /api/pilot`: je ziet `actionsExecuted` oplopen.

Nu ken je de flow. De cijfers zijn nog gesimuleerd — dat fixen we in fase 2.

---

## Fase 2 — Self-pilot op je eigen Gmail (de echte proef)

Dit is de belangrijkste stap: NEXA leest je echte inbox en stuurt — na jouw
goedkeuring — echte mails. De diepe OAuth-stappen staan in
`NEXA-Setup-en-Go-Live.md`; hier de snelste route + de valkuilen.

### Snelste route naar een Gmail refresh token

1. Google Cloud Console → project → **Gmail API** inschakelen → OAuth-client (Web)
   aanmaken → noteer **client ID + secret**.
2. Ga naar de **Google OAuth 2.0 Playground**.
3. **Belangrijk (valkuil):** open het tandwiel rechtsboven → vink **"Use your own
   OAuth credentials"** aan en vul je client ID + secret in. Doe je dit niet, dan
   **trekt Google je refresh token na 24 uur in** en stopt de koppeling.
4. Zet in datzelfde menu **"Access type: offline"** en **"Force prompt: consent"**
   aan — anders krijg je geen refresh token terug.
5. Kies de scopes (least-privilege):
   - `https://www.googleapis.com/auth/gmail.readonly` (triage/lezen)
   - `https://www.googleapis.com/auth/gmail.send` (verzenden)
6. Authorize → akkoord geven → wissel de code in voor tokens → kopieer de
   **refresh token**.

### In `.env` zetten

```bash
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
```

Herstart de server. Je ziet nu `Provider → gmail LIVE`.

### Wat je een week test

- **Triage:** laat de Operations-bot dagelijks je ongelezen mails verwerken; kijk of
  de tellingen kloppen met je inbox.
- **Echt verzenden (veilig):** geef *"mail naar [een eigen tweede adres] over X"* →
  controleer het concept in de Approvals-view → keur goed → de mail komt **echt**
  binnen op dat adres (`mode: live` + een echte Gmail message-id).
- **Bijsturen:** corrigeer via de memory-functie ("altijd ondertekenen met …",
  "geen mails na 18:00"). Met een model-key actief stuurt dat de concepten echt bij.

> Tip: begin met versturen naar je eigen tweede mailadres, niet naar derden. Zo test
> je de echte verzendketen zonder iemand ongevraagd te mailen.

---

## Fase 3 — Optioneel: gratis CRM/finance-testdata

Wil je ook de CRM-/finance-bots echt zien draaien zonder klant:

- **HubSpot:** maak een gratis CRM-account met testcontacten. Let op: **Private Apps
  (de API-token) zijn niet op elk gratis account beschikbaar** — soms is een Starter-
  plan nodig. Lukt het, zet dan `HUBSPOT_TOKEN` in `.env`.
- **Exact Online:** gebruik een trial/test-divisie om `finance.listOverdue` op echte
  (test)data te draaien. Credentials → `.env` (zie go-live gids).

Dit is mooi voor een complete demo, maar **niet nodig** voor een overtuigende
self-pilot — Gmail alleen levert al echt, zichtbaar bewijs.

---

## Wat je hierna in handen hebt

- Een **draaiende live-omgeving** op je eigen accounts (geen mock).
- Een **eerlijk eerste ROI-datapunt** op je eigen werk (bestede tijd vóór vs. na).
- Een **demo die echt mails verstuurt** voor je eerste prospect-gesprek.
- Vertrouwen dat de keten werkt — vóór je klantdata aanraakt.

## Mini-checklist

- [ ] Fase 1 doorlopen (flow snap je)
- [ ] Eigen OAuth-credentials in de Playground gebruikt (geen 24u-verval)
- [ ] `gmail.readonly` + `gmail.send` scopes, offline + force consent
- [ ] `GMAIL_*` in `.env`, server toont `gmail LIVE`
- [ ] Een week getriageerd + ≥1 echte mail via approval verstuurd naar je eigen adres
- [ ] Eigen tijdsbesparing genoteerd als eerste ROI-bewijs

---

*Veiligheid: verzenden blijft altijd goedkeuring-gated. Gebruik in deze self-pilot
alleen je eigen adressen tot je zeker bent van de concepten.*
