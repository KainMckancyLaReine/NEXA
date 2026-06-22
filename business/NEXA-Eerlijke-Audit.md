# NEXA — Eerlijke audit & pad naar marktklaar

*22 juni 2026 · interne werkdocument*

## Korte conclusie

NEXA is een sterk gebouwde **demo met een professioneel verhaal**, maar nog geen
verkoopbaar product. De UI, het narratief, de business-docs en de
architectuurkeuzes (sandbox-connectors met een nette live-route) zijn beter dan
bij de meeste startups in dit stadium. De kloof zit niet in *presentatie* — die
is af — maar in **echte uitvoering, vertrouwen en security**. Zolang elke
"AI-medewerker" gefabriceerde resultaten teruggeeft, betaalt niemand €499–4.999
per maand. Eén echt werkende connector bij één echte klant is meer waard dan tien
extra schermen.

De goede nieuws: jouw eigen strategie-doc benoemt exact dit ("ship a small number
of real integrations, land 2–3 lighthouse customers, harden trust and security").
Deze audit maakt dat concreet en prioriteert het.

---

## Wat al goed is (niet aankomen)

- **Productverhaal en wedge.** "Digitale arbeid i.p.v. nóg een dashboard" is
  scherp. De document-engine (Ava → echte xlsx/docx/pptx) is de sterkste wedge:
  tastbare output op dag één.
- **Architectuur van de connector-laag.** `modeFor()` + `LIVE_ENV` +
  `registerProvider` is een nette, eerlijke abstractie. Live gaan is invullen,
  niet herbouwen.
- **Trust-primitieven bestaan al in concept.** Autonomy-dial (supervised/auto),
  approval-queue, audit-log. De *vorm* klopt; de *hardheid* nog niet.
- **Polish.** Meertalig (EN/DE/NL), strakke branding, coherente investor-docs.

---

## De kloof — geprioriteerd

### P0 — blokkeert élke betalende klant

1. **Connectors zijn 100% sandbox.** `connectors.js` retourneert overal
   `mode:'sandbox'` met random getallen (`12 + random(30)` mails, etc.). Geen
   enkele actie raakt een echt systeem. → Maak **één** connector echt
   end-to-end: Gmail-triage óf factuurherinneringen. Niet alle zes tegelijk.

2. **Geen echte AI in de engine.** `routeCommand()` is regex-routing en
   `buildChain()` geeft hardcoded stap-teksten terug ("sent X personalized
   follow-ups") zonder dat er iets gepersonaliseerd wordt. Het product heet
   "AI workforce" maar er zit nog geen LLM in de lus. → Vervang `buildChain`
   door een echte Understand→Decide→Execute met een model dat tool-calls doet
   tegen de connector-verbs.

3. **Auth is een demo-deur.** Eén hardcoded admin (`kain`/`Kain25`) in
   `server.js`, token is base64 van user+timestamp (geen verificatie, geen
   expiry, nergens gecontroleerd op API-routes). Elke `/api/*` is in feite open.
   → Echte auth (sessies/JWT met verificatie), per-route autorisatie,
   multi-tenant data-isolatie.

4. **JSON-bestand als database.** `store.js` schrijft naar één `nexa.json`.
   Geen concurrency, geen tenants, dataverlies bij crash, niet schaalbaar. →
   Postgres (of SQLite → Postgres) met een tenant-kolom op alles.

### P1 — nodig voordat een serieuze B2B-koper tekent

5. **Security & compliance.** Je verkoopt toegang tot inbox, CRM en facturen van
   bedrijven. Minimaal nodig: least-privilege OAuth-scopes, encryptie at rest
   voor tokens, AVG/GDPR-verwerkersovereenkomst, datalocatie-keuze (EU), en een
   plan richting SOC 2. Dit is in EU-SMB vaak een harde inkoop-eis.

6. **De approval/audit-laag echt sluitend maken.** Nu kan `auto`-modus
   side-effects uitvoeren zonder dat de connector echt iets doet — dus de
   veiligheidsclaim is nog niet getest tegen echte acties. Zodra connectors live
   zijn: gate *elke* side-effect achter policy + approval, met rollback waar kan.

7. **ROI-cijfers zijn verzonnen.** `computeRoi()` gebruikt `timeSavedToday +=
   0.1` per actie en €45/uur blended. Mooie demo, maar een koper die dit doorheeft
   verliest vertrouwen. → Meet echte bespaarde tijd uit echte taken, of label het
   expliciet als "geschatte" ROI met transparante aannames.

### P2 — schaal en verdediging (jouw "Later", terecht later)

8. Per-employee geheugen dat echt leert van correcties (nu wordt `memory` opgeslagen
   maar nergens terug-geïnjecteerd in beslissingen).
9. Multi-agent hand-offs.
10. Community-marketplace met revenue-share (netwerk-effect / moat).

---

## Go-to-market — eerlijke noten

- **Pricing-anker is goed, bewijs ontbreekt.** €499/medewerker positioneert dit
  als arbeid, niet software — sterk. Maar de prijs is alleen te verdedigen met een
  **bewezen** uren/euro-besparing bij een referentieklant. Tot die er is, is elke
  prijs een aanname.
- **Te brede ICP.** De homepage richt zich op 7 segmenten (recruitment, sales,
  marketing, accountancy, vastgoed, e-commerce, SaaS). Voor founder-led sales is
  dat te veel. Kies **één** segment waar de pijn het scherpst en de workflow het
  meest uniform is — accountancy/admin (factuurherinneringen) of recruitment
  (CV-screening) lenen zich het best voor één diepe, echte connector.
- **"Gratis MacBook bij Scale" kan tegen je werken.** Bij serieuze B2B-kopers
  ondermijnt een laptop-cadeau soms de geloofwaardigheid van een
  bedrijfskritisch platform. Test dit; het trekt mogelijk de verkeerde lead aan.
- **Wedge-volgorde voor de eerste deals.** Land met Documents óf Operations (laag
  risico, tastbaar), bewijs ROI, breid daarna uit. Dat staat al goed in je
  strategie-doc — houd je eraan en weersta de neiging breed te lanceren.

---

## Concreet 90-dagen pad

**Weken 1–3 — kies en bouw één echte connector.**
Gmail-triage óf Exact/factuurherinnering. Echte OAuth, echte API-call, achter
approval + audit. Eén medewerker, één workflow, écht werkend.

**Weken 3–6 — echte AI in de lus + fundament.**
Vervang `buildChain` door model-gedreven tool-calls. Zet echte auth + Postgres met
tenant-isolatie neer. Token-encryptie.

**Weken 6–10 — één lighthouse-klant, gratis/diep begeleid.**
Eén bedrijf in je gekozen segment. Meet *echte* bespaarde uren. Dit cijfer wordt je
belangrijkste verkoop-asset en vervangt de gesimuleerde ROI.

**Weken 10–13 — security-baseline + casestudy.**
AVG-verwerkersovereenkomst, least-privilege scopes, EU-datalocatie, start SOC 2.
Schrijf de eerste casestudy met echte cijfers. Pas daarna pricing aan op bewijs.

---

## De drie dingen die nu het meeste bewegen

1. **Eén connector echt live** — verandert NEXA van demo naar product.
2. **Eén echte klant met een echt ROI-getal** — verandert het verhaal van
   "verzonnen" naar "bewezen".
3. **Echte auth + multi-tenant DB** — zonder dit kun je geen tweede klant veilig
   bedienen.

Alle drie zijn klein van scope als je weerstaat om breed te willen zijn. De rest
(meer connectors, meer segmenten, marketplace, memory) volgt vanzelf zodra deze
drie staan.
