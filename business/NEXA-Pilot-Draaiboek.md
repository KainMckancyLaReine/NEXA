# NEXA — Pilot-draaiboek (30 dagen)

*Doel: van één echte klant één gemeten ROI-cijfer halen dat je volgende tien deals verkoopt.*

De hele pilot draait om twee dingen bewijzen: **NEXA doet echt werk** (verifieerbaar)
en **dat werk bespaart geld** (gemeten tegen de baseline van de klant). Alles
hieronder dient die twee bewijzen.

---

## 1. Kies de juiste pilotklant

Niet de grootste — de meest geschikte. Profiel:

- Accountancy-/administratiekantoor, 10–75 medewerkers (het beachhead-segment).
- Voelt scherpe, herhaalbare pijn: debiteurenbeheer / factuurherinneringen.
- Draait op Exact (of Twinfield) + Gmail/Outlook.
- Eén beslisser die ja kan zeggen (eigenaar / kantoormanager).
- Bereid een betaalde pilot te doen — betaald commitment voorspelt adoptie.

Diskwalificeer wie "een AI-chatbot" wil, geen vaste workflow heeft, of geen
beslisser aan tafel brengt.

## 2. Scope: één bot, één workflow

Begin met **Sophie (Finance)** op debiteurenbeheer, eventueel met **Ava
(Documents)** voor het wekelijkse cashflow-rapport. Niet meer. Eén bot die
aantoonbaar 15 uur/week wegneemt verkoopt beter dan vijf bots die "van alles wat"
doen.

Wat de bot doet in de pilot:
- Achterstallige facturen ophalen uit Exact.
- Herinneringen opstellen en — na goedkeuring — versturen.
- De cashflow-/debiteurenstatus wekelijks rapporteren.

Houd **autonomy op "supervised"** gedurende de hele pilot: elke verzendactie gaat
eerst door de approval-queue. Dat bouwt vertrouwen en is je veiligheidsverhaal.

## 3. Leg de baseline vast (dit is cruciaal)

Vóór NEXA iets doet, meet je samen met de klant hoeveel tijd de workflow nú kost.
Vraag concreet:

- Hoeveel uur per week besteedt het team aan herinneringen + opvolging? (bv. 18u)
- Wat is het beladen uurtarief van die persoon/rol? (bv. €50)
- Hoeveel facturen/maand, gemiddelde DSO (dagen tot betaling)?

Voer dit in bij de start van de pilot in NEXA:

```
POST /api/pilot/start
{ "baselineHoursPerWeek": 18, "hourlyRate": 50, "seats": 1, "label": "De Vries Accountants" }
```

NEXA berekent dan:
- **actionsExecuted** — verifieerbaar bewijs van uitgevoerd werk.
- **baselineSavings / netSavings** — prorata bespaarde euro's uit *hun* baseline.
- **projectedMonthlySavings / -Net** — de maandprojectie (vanaf dag één bruikbaar).

Belangrijk: de besparing komt uit de baseline die de klant zélf gaf — niet uit een
verzonnen getal. Dat maakt het cijfer verdedigbaar.

## 4. Tijdlijn

**Week 0 — kickoff (halve dag)**
Baseline vastleggen, succescriterium afspreken, connector koppelen (Exact + Gmail —
zie de Setup-gids), Finance-bot installeren, autonomy op supervised. Pilot starten.

**Week 1 — meekijken**
Bot stelt herinneringen op; klant keurt goed in de approval-queue. Jij kijkt dagelijks
mee, stuurt bij via de memory-functie ("altijd finance@klant.nl in CC", "geen
herinneringen op vrijdag"). Die correcties sturen het gedrag echt bij.

**Week 2–3 — ritme**
Vertrouwen groeit; klant keurt sneller goed. Wekelijks cashflow-rapport via Ava.
Tussentijdse check: loopt actionsExecuted op, daalt de DSO?

**Week 4 — meten & beslissen**
Vergelijk: bestede uren nu vs. baseline, DSO nu vs. start, actionsExecuted totaal.
Lever het pilot-rapport op. Beslis samen: omzetten naar betaald abonnement.

## 5. Succescriterium (vooraf afspreken)

Eén helder, meetbaar criterium. Voorbeeld:

> "NEXA neemt ≥10 uur/week debiteurenwerk over en verlaagt de DSO met ≥3 dagen,
> binnen 30 dagen, zonder dat een verkeerde herinnering de deur uitgaat."

Geen vage "het bevalt goed". Een getal waar je samen ja/nee op zegt.

## 6. Prijs van de pilot

Betaald, niet gratis. Bijvoorbeeld €750 voor 30 dagen op één bot, of de eerste
maand tegen €499 met een opzegmogelijkheid. Betaald commitment filtert tijdverspillers
en voorspelt of ze daarna blijven.

## 7. De oplevering = je belangrijkste asset

Eindig met één casestudy: naam (met toestemming), baseline → resultaat, een quote
van de klant, en het netto-besparingscijfer. Dat document verkoopt klant 2 t/m 11.

---

## Checklist

- [ ] Pilotklant gekozen (past op het profiel, beslisser aan tafel)
- [ ] Eén bot + één workflow afgebakend (Finance/debiteuren)
- [ ] Baseline gemeten (uren/week, uurtarief, DSO) en ingevoerd via `/api/pilot/start`
- [ ] Connector live gekoppeld (zie Setup-gids), autonomy op supervised
- [ ] Succescriterium schriftelijk afgesproken
- [ ] Pilot betaald
- [ ] Wekelijkse check + memory-correcties
- [ ] Eindmeting + casestudy opgeleverd
