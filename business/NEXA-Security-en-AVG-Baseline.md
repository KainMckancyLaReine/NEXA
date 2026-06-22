# NEXA — Security & AVG/GDPR baseline

*22 juni 2026 · interne werkdocument*

Dit document legt de beveiligingsbasis vast die nodig is om bedrijven hun inbox,
CRM en facturen aan NEXA te laten toevertrouwen. Het splitst wat **al in de code
zit** van wat **nog proces/credentials vereist**, en geeft het pad naar SOC 2.

## Wat nu in de code zit

- **Authenticatie.** Wachtwoorden gehasht met scrypt + per-user salt; geen
  plain-text. Sessietokens zijn HMAC-ondertekend met expiry (12u) en worden op
  elke beveiligde route geverifieerd. Login is rate-limited.
- **Autorisatie.** Elke `/api/*`-route (behalve login/signup) vereist een geldig
  token. Gevoelige acties (gebruikers aanmaken, reset) zijn admin-only.
- **Tenant-isolatie.** Data is per tenant gepartitioneerd; een token voor tenant A
  kan de data van tenant B niet lezen of muteren (getest).
- **Input-hardening.** Request-body gelimiteerd op 1 MB (anti-DoS); JSON-parsing
  faalt veilig.
- **Beveiligingsheaders.** `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: no-referrer` op alle responses.
- **Configureerbare CORS.** Standaard `*` voor de demo; in productie te
  vergrendelen op de eigen front-end origin via `NEXA_CORS_ORIGIN`.
- **Secrets via env.** Geen secrets in de code of git (`.env` genegeerd).
- **Veilige opslag.** Atomic writes voorkomen corruptie van de datastore.
- **Least-privilege uitvoering.** Side-effecten (e-mail verzenden, factuur posten)
  blijven achter de approval-queue en worden volledig in de audit-log vastgelegd.

## Wat nog moet (proces / infra)

| Onderwerp | Actie | Prioriteit |
|---|---|---|
| Token-opslag connectors | OAuth-tokens encrypted at rest (KMS/secret manager), niet plain in de DB | Hoog |
| Productie-DB | Postgres met tenant-kolom + row-level isolatie; encryptie at rest | Hoog |
| Transport | TLS afdwingen (HTTPS-only) via reverse proxy / load balancer | Hoog |
| OAuth-scopes | Per connector de minimale scopes vastleggen (zie hieronder) | Hoog |
| Verwerkersovereenkomst (DPA) | Standaard AVG-verwerkersovereenkomst klaarzetten voor elke klant | Hoog |
| Datalocatie | EU-hosting kiezen en vastleggen (data residency) | Hoog |
| Logging/retentie | Retentiebeleid voor audit-log en activity; recht op verwijdering | Midden |
| Backups | Geëncrypteerde, geteste back-ups van de datastore | Midden |
| Pen-test | Externe penetratietest vóór eerste enterprise-deal | Midden |
| SOC 2 | Type I starten (beleid + controls), daarna Type II (observatieperiode) | Later |

## Least-privilege OAuth-scopes (richtlijn)

- **Gmail:** `gmail.readonly` voor triage; `gmail.send` alleen als verzenden is
  ingeschakeld. Nooit volledige `mail.google.com`.
- **HubSpot:** alleen de objecten die je gebruikt (`crm.objects.contacts`,
  `deals`, `tickets`) — read waar mogelijk, write alleen waar nodig.
- **Exact Online:** beperk tot de administratie(s) (division) van de klant; lees
  receivables, schrijf alleen facturen na expliciete mapping en approval.

## AVG/GDPR-kernpunten

- **Rol:** NEXA is **verwerker**; de klant is verwerkingsverantwoordelijke. Leg dit
  vast in een DPA met sub-verwerkers (model-provider, hosting) erin benoemd.
- **Rechtsgrond & dataminimalisatie:** verwerk alleen wat de taak vereist; haal
  geen volledige mailbox binnen als triage-metadata volstaat.
- **Betrokkenenrechten:** ondersteun inzage en verwijdering per tenant (de
  tenant-partitie maakt dit uitvoerbaar).
- **Sub-verwerkers:** als je een LLM-API gebruikt, kies een aanbieder die data
  niet traint op input en een DPA biedt; documenteer de datastroom.
- **Meldplicht datalekken:** proces vastleggen (72-uurs melding).

## Aanbevolen volgorde

1. TLS + `NEXA_CORS_ORIGIN` + admin-wachtwoord via env (vandaag te doen).
2. Token-encryptie + Postgres bij de eerste echte connector-koppeling.
3. DPA + EU-datalocatie vóór de eerste betalende klant.
4. Pen-test + SOC 2 Type I zodra er meerdere klanten zijn.

> Dit is een interne baseline, geen juridisch advies. Laat de DPA en het
> AVG-register toetsen door een jurist vóór de eerste productie-klant.
