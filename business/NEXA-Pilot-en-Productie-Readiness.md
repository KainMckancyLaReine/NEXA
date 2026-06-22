# NEXA — Pilot- & productie-readiness (de complete status)

*22 juni 2026 · het overzicht: wat moet er nog, hoe draai je een pilot, wanneer is het productieklaar.*

Korte stand van zaken: de software is **pilot-klaar**. De code is niet meer de
bottleneck. Wat resteert is grotendeels operationeel/juridisch (credentials, TLS,
DPA) plus een handvol kleine code-fixes. Hieronder alles, eerlijk en compleet.

---

## DEEL 1 — Wat moet er nog gefixt vóór de pilots

### A. Blokkers voor een échte pilot (met klantdata) — vereisen jou

1. **Connector-credentials van de pilotklant** koppelen (Gmail / Exact / HubSpot
   via OAuth). De code is af; jij levert de credentials. → ~½ dag. Zie de go-live gids.
2. **Hosten met HTTPS/TLS.** Nu draait het op `localhost`. Klantdata mag nooit over
   plain HTTP. Zet het op Render / Fly.io / een VPS met Caddy. → enkele uren.
3. **Verwerkersovereenkomst (DPA) + EU-datalocatie** vóór je hun inbox/facturen
   aanraakt. Juridisch, geen code. Verplicht onder de AVG.
4. **Secret-beheer.** OAuth-tokens staan in `.env` op de server (niet in de DB).
   Voor één pilot op een afgeschermde server is dat acceptabel; gebruik een
   secret manager zodra het serieuzer wordt.

### B. Kleine code-fixes die de geloofwaardigheid verhogen (geen harde blokkers)

5. **Dagelijkse reset van "vandaag"-cijfers.** `tasksToday` / `timeSavedToday`
   tellen nu eindeloos op en resetten niet per dag → het live-ROI-paneel loopt op.
   De aparte **pilot-meter is wél correct** (cumulatief sinds start), dus voor de
   pilot-ROI maakt dit niet uit, maar het oogt slordig in het dashboard. Kleine fix.
6. **Approval-queue in het dashboard het mailconcept laten tonen** (aan/onderwerp/
   body + Goedkeuren-knop). Nu draagt de taak het concept al mee via de API, maar
   de UI toont het nog niet apart. Nodig voordat een klant zelf comfortabel mails
   goedkeurt.
7. **Homepage-claims kloppend maken** met wat live is (sandbox vs. live, en de
   negen bots). Voorkomt een geloofwaardigheidsdeuk bij een oplettende koper.

> Wil je, dan fix ik 5–7 nu meteen; het is klein werk.

### C. Wat NIET nodig is voor één pilot (bewust uitstellen)

- Postgres — de JSON-store met atomic writes is prima voor één tenant/pilot.
- SOC 2, pen-test — pas relevant bij meerdere/enterprise-klanten.
- Multi-agent hand-offs, community-marketplace — later.

---

## DEEL 2 — Hoe je de pilot draait (in het kort)

Het volledige draaiboek staat in `NEXA-Pilot-Draaiboek.md`. Samengevat:

1. **Kies één kantoor** uit het beachhead-segment (accountancy/admin, 10–75 fte,
   beslisser aan tafel, draait op Exact + Gmail/Outlook).
2. **Scope tot één bot, één workflow:** Sophie (Finance) op debiteurenbeheer,
   eventueel Ava (Documents) voor het wekelijkse cashflow-rapport. Niet meer.
3. **Meet de baseline** samen met de klant: uren/week aan herinneringen, uurtarief,
   DSO. Voer in via `POST /api/pilot/start {baselineHoursPerWeek, hourlyRate, seats}`.
4. **Koppel de connector live** (go-live gids) en zet autonomy op **supervised** —
   elke verzendactie eerst door de approval-queue.
5. **Week 1–4:** bot stelt herinneringen op, klant keurt goed, jij stuurt bij via
   de memory-functie. NEXA telt elke echt uitgevoerde actie (`actionsExecuted`) en
   rekent de besparing uit de baseline van de klant.
6. **Dag 30:** meet bestede uren nu vs. baseline en DSO-verbetering, lever het
   pilot-rapport + één casestudy op. Beslis: omzetten naar betaald.

**Succescriterium vooraf afspreken**, meetbaar, bv: *"≥10 uur/week overgenomen,
DSO −3 dagen, binnen 30 dagen, zonder foute verzending."* Pilot betaald maken.

---

## DEEL 3 — Wanneer is het productieklaar?

Denk in vier niveaus. We staan tussen niveau 1 en 2.

| Niveau | Wat het betekent | Wat er nog voor nodig is |
|---|---|---|
| **1. Pilot-klaar (NU)** | Draait end-to-end, in sandbox veilig te demonstreren | ✅ klaar |
| **2. Echte pilot** | Eén klant, echte data, één connector live | Credentials + TLS-hosting + DPA (Deel 1A) |
| **3. Productie, 1e betalende klant** | Veilig, betrouwbaar, betaald | Niveau 2 + code-fixes 5–7 + een schone pilot die betrouwbaarheid bewijst + secret-beheer + back-ups |
| **4. Schaal (meerdere klanten)** | Meerdere tenants, betrouwbaar onder last | Postgres + monitoring/alerting + SOC 2-traject + pen-test + DPA-proces + support |

**Concreet:** het is *productieklaar voor een eerste betalende klant* zodra niveau 2
staat én je één pilot succesvol hebt afgerond én de kleine fixes (5–7) en back-ups
geregeld zijn. Realistisch is dat **weken werk, geen maanden** — en het meeste is
operationeel, niet code.

---

## DEEL 4 — Volledige resterende roadmap

**Code (klein, ik kan dit doen)**
- [ ] Dagelijkse reset van "vandaag"-metrics (#5)
- [ ] Mailconcept tonen in de approval-queue met Goedkeuren-knop (#6)
- [ ] Homepage-claims afstemmen op live functionaliteit (#7)
- [ ] Optioneel: verbruik-gebaseerde prijscomponent naast de seat
- [ ] Optioneel: per-employee memory verder uitbouwen (leren van correcties)

**Infra (jij / een engineer)**
- [ ] TLS-hosting opzetten (Render/Fly/Caddy)
- [ ] `NEXA_CORS_ORIGIN` op echte origin, sterke `NEXA_AUTH_SECRET`
- [ ] Geëncrypteerde back-ups van de datastore
- [ ] Bij meerdere klanten: migratie JSON → Postgres (drop-in achter de store-interface)
- [ ] Monitoring/alerting + logging-retentie

**Security & juridisch (jij + jurist)**
- [ ] DPA/verwerkersovereenkomst klaarzetten
- [ ] EU-datalocatie kiezen en vastleggen
- [ ] Least-privilege OAuth-scopes per connector (richtlijn staat in de baseline)
- [ ] Secret manager voor tokens
- [ ] Later: pen-test, SOC 2 Type I → II

**Go-to-market (jij)**
- [ ] Eén pilotklant landen en de pilot draaien
- [ ] Echte ROL meten → één casestudy met naam + cijfers
- [ ] Pricing pas verdedigen met dat gemeten cijfer
- [ ] Daarna: volgende 7 klanten met de casestudy als asset

---

## De kern in drie zinnen

De software is klaar om een pilot te draaien; de bottleneck is nu distributie en
operatie, niet code. Om een *echte* pilot te starten heb je drie dingen nodig die
alleen jij kunt regelen: connector-credentials, TLS-hosting en een DPA. Productie­klaar
voor je eerste betalende klant ben je na één geslaagde pilot plus een handvol kleine
fixes — een kwestie van weken, niet maanden.
