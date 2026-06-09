/* ============================================================
   NEXA — i18n (English / Deutsch / Nederlands)
   Hand-written, grammatically correct copy for all three.
   Usage:
     <h1 data-i18n="hero.title"></h1>
     <input data-i18n-ph="cc.cmd_ph">
     I18N.t('nav.pricing')   // in JS
   ============================================================ */
(function () {
  const DICT = {
    // -------- nav --------
    'nav.platform':   { en:'Platform',     de:'Plattform',     nl:'Platform' },
    'nav.workforce':  { en:'Workforce',    de:'Belegschaft',   nl:'Personeel' },
    'nav.integrations':{en:'Integrations', de:'Integrationen', nl:'Integraties' },
    'nav.marketplace':{ en:'Marketplace',  de:'Marktplatz',    nl:'Marktplaats' },
    'nav.pricing':    { en:'Pricing',      de:'Preise',        nl:'Prijzen' },
    'nav.signin':     { en:'Sign in',      de:'Anmelden',      nl:'Inloggen' },
    'nav.deploy':     { en:'Deploy Workforce', de:'Belegschaft starten', nl:'Personeel inzetten' },
    'nav.home':       { en:'Home',         de:'Start',         nl:'Home' },
    'nav.command':    { en:'Command Center', de:'Kommandozentrale', nl:'Commandocentrum' },

    // -------- hero --------
    'hero.badge':  { en:'The AI Workforce Operating System', de:'Das Betriebssystem für die KI-Belegschaft', nl:'Het besturingssysteem voor je AI-personeel' },
    'hero.title1': { en:'Your first', de:'Deine erste', nl:'Je eerste' },
    'hero.title2': { en:'digital workforce.', de:'digitale Belegschaft.', nl:'digitale personeel.' },
    'hero.sub':    { en:'Deploy autonomous AI employees that execute real work across your company — while your team focuses on growth.', de:'Setze autonome KI-Mitarbeiter ein, die echte Arbeit in deinem Unternehmen erledigen — während sich dein Team auf Wachstum konzentriert.', nl:'Zet autonome AI-medewerkers in die echt werk uitvoeren in je bedrijf — terwijl jouw team zich op groei richt.' },
    'hero.cta1':   { en:'Deploy Workforce', de:'Belegschaft starten', nl:'Personeel inzetten' },
    'hero.cta2':   { en:'Watch demo', de:'Demo ansehen', nl:'Bekijk demo' },
    'hero.proof':  { en:'Trusted by modern teams · SOC 2 Type II · GDPR', de:'Vertraut von modernen Teams · SOC 2 Type II · DSGVO', nl:'Vertrouwd door moderne teams · SOC 2 Type II · AVG' },

    // -------- problem --------
    'prob.eyebrow':{ en:'The Problem', de:'Das Problem', nl:'Het probleem' },
    'prob.title':  { en:'Manual operations are breaking modern companies.', de:'Manuelle Abläufe überfordern moderne Unternehmen.', nl:'Handmatige processen breken moderne bedrijven op.' },
    'prob.sub':    { en:'Teams spend thousands of hours a year on repetitive work.', de:'Teams verbringen jährlich tausende Stunden mit wiederkehrender Arbeit.', nl:'Teams besteden duizenden uren per jaar aan repetitief werk.' },

    // -------- solution --------
    'sol.eyebrow': { en:'The Solution', de:'Die Lösung', nl:'De oplossing' },
    'sol.title':   { en:'Meet NEXA.', de:'Das ist NEXA.', nl:'Maak kennis met NEXA.' },
    'sol.sub':     { en:'The operating system for autonomous companies.', de:'Das Betriebssystem für autonome Unternehmen.', nl:'Het besturingssysteem voor autonome bedrijven.' },
    'sol.understand':{ en:'Understands', de:'Versteht', nl:'Begrijpt' },
    'sol.decide':  { en:'Decides', de:'Entscheidet', nl:'Beslist' },
    'sol.execute': { en:'Executes', de:'Führt aus', nl:'Voert uit' },

    // -------- workforce --------
    'wf.eyebrow':  { en:'Digital Workforce', de:'Digitale Belegschaft', nl:'Digitaal personeel' },
    'wf.title':    { en:'Specialists. Working 24/7.', de:'Spezialisten. Rund um die Uhr.', nl:'Specialisten. 24/7 aan het werk.' },
    'wf.sub':      { en:'Each AI employee owns a function, reports live metrics, and never stops.', de:'Jeder KI-Mitarbeiter verantwortet einen Bereich, liefert Live-Kennzahlen und hört nie auf.', nl:'Elke AI-medewerker beheert een functie, levert live cijfers en stopt nooit.' },

    // -------- human band --------
    'human.eyebrow':{ en:'Human + AI', de:'Mensch + KI', nl:'Mens + AI' },
    'human.title': { en:'Your people do the strategy. NEXA does the execution.', de:'Deine Mitarbeiter machen die Strategie. NEXA übernimmt die Ausführung.', nl:'Jouw mensen doen de strategie. NEXA doet de uitvoering.' },
    'human.sub':   { en:'The repetitive work that drains your team runs autonomously in the background. Your people focus on judgement, relationships and growth.', de:'Die repetitive Arbeit, die dein Team auslaugt, läuft autonom im Hintergrund. Deine Mitarbeiter konzentrieren sich auf Urteilsvermögen, Beziehungen und Wachstum.', nl:'Het repetitieve werk dat je team uitput, loopt autonoom op de achtergrond. Jouw mensen richten zich op inzicht, relaties en groei.' },

    // -------- integrations --------
    'int.eyebrow': { en:'Integrations', de:'Integrationen', nl:'Integraties' },
    'int.title':   { en:'One workforce. Every system.', de:'Eine Belegschaft. Jedes System.', nl:'Eén personeelsbestand. Elk systeem.' },
    'int.sub':     { en:'NEXA sits above your stack — reading, deciding and acting inside the tools you already use.', de:'NEXA steht über deinem Stack — liest, entscheidet und handelt in den Tools, die du bereits nutzt.', nl:'NEXA staat boven je stack — leest, beslist en handelt in de tools die je al gebruikt.' },

    // -------- offer (laptop + annual) --------
    'offer.eyebrow':{ en:'Annual plan perk', de:'Jahresabo-Vorteil', nl:'Voordeel jaarabonnement' },
    'offer.title': { en:'Go annual on Scale. Get a MacBook on us.', de:'Scale jährlich buchen. MacBook geschenkt.', nl:'Kies Scale jaarlijks. MacBook cadeau.' },
    'offer.sub':   { en:'Choose the annual Scale plan — our top tier — and we ship a new MacBook or PC to run your Command Center, plus 20% off versus monthly.', de:'Wähle das jährliche Scale-Abo — unseren Top-Tarif — und wir senden dir ein neues MacBook oder einen PC für deine Kommandozentrale, plus 20% Rabatt gegenüber monatlich.', nl:'Kies het jaarabonnement Scale — ons duurste pakket — en wij sturen een nieuwe MacBook of pc voor je Commandocentrum, plus 20% korting ten opzichte van maandelijks.' },
    'offer.b1':    { en:'Free MacBook or PC, shipped to your team', de:'Gratis MacBook oder PC, direkt zu deinem Team', nl:'Gratis MacBook of pc, opgestuurd naar je team' },
    'offer.b2':    { en:'20% lower than monthly billing', de:'20% günstiger als monatliche Abrechnung', nl:'20% goedkoper dan maandelijks betalen' },
    'offer.b3':    { en:'Priority onboarding & dedicated support', de:'Bevorzugtes Onboarding & persönlicher Support', nl:'Voorrang bij onboarding & persoonlijke support' },
    'offer.cta':   { en:'Claim the annual offer', de:'Jahresangebot sichern', nl:'Claim de jaaraanbieding' },

    // -------- ROI --------
    'roi.eyebrow': { en:'ROI Calculator', de:'ROI-Rechner', nl:'ROI-calculator' },
    'roi.title':   { en:'Scale revenue without scaling headcount.', de:'Umsatz steigern, ohne Personal aufzustocken.', nl:'Schaal je omzet zonder meer personeel.' },
    'roi.sub':     { en:'Move the sliders. See what an autonomous workforce returns.', de:'Bewege die Regler. Sieh, was eine autonome Belegschaft einbringt.', nl:'Versleep de schuifjes. Zie wat autonoom personeel oplevert.' },
    'roi.employees':{ en:'Employees', de:'Mitarbeiter', nl:'Medewerkers' },
    'roi.salary':  { en:'Average salary', de:'Durchschnittsgehalt', nl:'Gemiddeld salaris' },
    'roi.hours':   { en:'Hours lost to admin / week', de:'Stunden für Admin / Woche', nl:'Uren aan administratie / week' },
    'roi.industry':{ en:'Industry', de:'Branche', nl:'Branche' },
    'roi.save':    { en:'Annual cost savings', de:'Jährliche Einsparungen', nl:'Jaarlijkse besparing' },
    'roi.recovered':{ en:'Hours recovered / yr', de:'Zurückgewonnene Stunden / Jahr', nl:'Teruggewonnen uren / jaar' },
    'roi.prod':    { en:'Productivity increase', de:'Produktivitätssteigerung', nl:'Productiviteitsstijging' },
    'roi.score':   { en:'Efficiency score', de:'Effizienz-Score', nl:'Efficiëntiescore' },

    // -------- command preview --------
    'cp.eyebrow':  { en:'Command Center', de:'Kommandozentrale', nl:'Commandocentrum' },
    'cp.title':    { en:'Command your digital workforce.', de:'Steuere deine digitale Belegschaft.', nl:'Bestuur je digitale personeel.' },
    'cp.sub':      { en:'Live workforce activity, business metrics, AI insights and autonomous actions — in one cockpit.', de:'Live-Aktivität, Geschäftskennzahlen, KI-Einblicke und autonome Aktionen — in einem Cockpit.', nl:'Live activiteit, bedrijfscijfers, AI-inzichten en autonome acties — in één cockpit.' },

    // -------- proof --------
    'proof.eyebrow':{ en:'Proven impact', de:'Belegte Wirkung', nl:'Bewezen impact' },
    'proof.title': { en:'Enterprise teams run leaner with NEXA.', de:'Enterprise-Teams arbeiten mit NEXA schlanker.', nl:'Enterprise-teams werken efficiënter met NEXA.' },
    'proof.s1':    { en:'reduction in administrative workload', de:'weniger Verwaltungsaufwand', nl:'minder administratieve werklast' },
    'proof.s2':    { en:'faster lead response time', de:'schnellere Reaktionszeit bei Leads', nl:'snellere reactietijd op leads' },
    'proof.s3':    { en:'increase in operational efficiency', de:'mehr operative Effizienz', nl:'hogere operationele efficiëntie' },

    // -------- pricing --------
    'price.eyebrow':{ en:'Pricing', de:'Preise', nl:'Prijzen' },
    'price.title': { en:'Hire your workforce.', de:'Stelle deine Belegschaft ein.', nl:'Neem je personeel aan.' },
    'price.sub':   { en:'Per AI employee. Cancel anytime. No headcount required.', de:'Pro KI-Mitarbeiter. Jederzeit kündbar. Kein Personalbedarf.', nl:'Per AI-medewerker. Altijd opzegbaar. Geen extra personeel nodig.' },
    'price.monthly':{ en:'Monthly', de:'Monatlich', nl:'Maandelijks' },
    'price.yearly':{ en:'Yearly · save 20%', de:'Jährlich · 20% sparen', nl:'Jaarlijks · 20% korting' },
    'price.mo':    { en:'/mo', de:'/Mon.', nl:'/mnd' },
    'price.yr':    { en:'/year', de:'/Jahr', nl:'/jaar' },
    'price.effmo': { en:'≈ €{x}/mo · save 20%', de:'≈ {x} €/Mon. · 20% sparen', nl:'≈ €{x}/mnd · 20% korting' },
    'price.get':   { en:'Get started', de:'Loslegen', nl:'Aan de slag' },
    'price.popular':{ en:'Most popular', de:'Am beliebtesten', nl:'Populairst' },
    'price.contact':{ en:'Contact sales', de:'Vertrieb kontaktieren', nl:'Neem contact op' },

    // -------- final --------
    'final.title': { en:'Stop hiring for repetitive work.', de:'Stelle niemanden mehr für Routinearbeit ein.', nl:'Stop met aannemen voor repetitief werk.' },
    'final.sub':   { en:'Deploy your first digital workforce today.', de:'Setze noch heute deine erste digitale Belegschaft ein.', nl:'Zet vandaag je eerste digitale personeel in.' },
    'final.cta':   { en:'Create workspace', de:'Workspace erstellen', nl:'Workspace aanmaken' },

    // -------- command center UI --------
    'cc.cmd_ph':   { en:'Tell your workforce what to accomplish…', de:'Sag deiner Belegschaft, was zu tun ist…', nl:'Vertel je personeel wat het moet doen…' },
    'cc.execute':  { en:'Execute', de:'Ausführen', nl:'Uitvoeren' },
    'cc.dashboard':{ en:'Command Center', de:'Kommandozentrale', nl:'Commandocentrum' },
    'cc.workforce':{ en:'Workforce', de:'Belegschaft', nl:'Personeel' },
    'cc.operations':{ en:'Operations', de:'Betrieb', nl:'Operatie' },
    'cc.integrations':{ en:'Integrations', de:'Integrationen', nl:'Integraties' },
    'cc.reports':  { en:'Reports', de:'Berichte', nl:'Rapporten' },
    'cc.marketplace':{ en:'Marketplace', de:'Marktplatz', nl:'Marktplaats' },
    'cc.live':     { en:'Live activity', de:'Live-Aktivität', nl:'Live activiteit' },
    'cc.voice':    { en:'Voice command', de:'Sprachbefehl', nl:'Spraakopdracht' },
    'cc.listening':{ en:'Listening…', de:'Höre zu…', nl:'Aan het luisteren…' },

    // -------- book a demo --------
    'nav.demo':     { en:'Book a demo', de:'Demo buchen', nl:'Demo plannen' },
    'demo.title':   { en:'Book your NEXA demo', de:'Buche deine NEXA-Demo', nl:'Plan je NEXA-demo' },
    'demo.sub':     { en:'Pick a slot — we walk you through deploying your first AI workforce.', de:'Wähle einen Termin — wir zeigen dir, wie du deine erste KI-Belegschaft startest.', nl:'Kies een moment — we laten je zien hoe je je eerste AI-personeel inzet.' },
    'demo.name':    { en:'Your details', de:'Deine Angaben', nl:'Jouw gegevens' },
    'demo.date':    { en:'Choose a day', de:'Tag wählen', nl:'Kies een dag' },
    'demo.time':    { en:'Choose a time', de:'Uhrzeit wählen', nl:'Kies een tijd' },
    'demo.confirm': { en:'Confirm booking', de:'Buchung bestätigen', nl:'Bevestig afspraak' },
    'demo.booked':  { en:'Demo booked!', de:'Demo gebucht!', nl:'Demo ingepland!' },
    'demo.bookedsub':{ en:'Check your inbox for the calendar invite.', de:'Die Kalendereinladung liegt in deinem Postfach.', nl:'Je vindt de agenda-uitnodiging in je inbox.' },
    'demo.fullname':{ en:'Full name', de:'Vollständiger Name', nl:'Volledige naam' },
    'demo.email':  { en:'Work email', de:'Geschäftliche E-Mail', nl:'Werk-e-mail' },
    'demo.company':{ en:'Company', de:'Unternehmen', nl:'Bedrijf' },
    'demo.teamph': { en:'Team size…', de:'Teamgröße…', nl:'Teamgrootte…' },
    'demo.topics': { en:'What would you like to see?', de:'Was möchtest du sehen?', nl:'Wat wil je graag zien?' },

    // -------- platform page --------
    'pf.eyebrow':  { en:'Platform', de:'Plattform', nl:'Platform' },
    'pf.title':    { en:'The platform behind autonomous operations.', de:'Die Plattform hinter autonomen Abläufen.', nl:'Het platform achter autonome operaties.' },
    'pf.sub':      { en:'NEXA is not a chatbot or a workflow builder. It is a digital labour platform: AI employees that read context, make decisions and carry out real work inside your existing tools — supervised by you, operated by them.', de:'NEXA ist kein Chatbot und kein Workflow-Builder. Es ist eine digitale Arbeitsplattform: KI-Mitarbeiter, die Kontext erfassen, Entscheidungen treffen und echte Arbeit in deinen Tools erledigen — von dir beaufsichtigt, von ihnen ausgeführt.', nl:'NEXA is geen chatbot of workflow-bouwer. Het is een digitaal arbeidsplatform: AI-medewerkers die context lezen, beslissingen nemen en echt werk uitvoeren in je bestaande tools — door jou begeleid, door hen uitgevoerd.' },
    'pf.how':      { en:'How it works', de:'So funktioniert es', nl:'Hoe het werkt' },
    'pf.howt':     { en:'Understand. Decide. Execute.', de:'Verstehen. Entscheiden. Ausführen.', nl:'Begrijpen. Beslissen. Uitvoeren.' },
    'pf.hows':     { en:'Every request runs through the same autonomous loop — no human in the loop for the repetitive 80%.', de:'Jede Anfrage durchläuft dieselbe autonome Schleife — ohne Mensch für die repetitiven 80%.', nl:'Elke aanvraag doorloopt dezelfde autonome lus — zonder mens voor de repetitieve 80%.' },
    'pf.cc':       { en:'Command Center', de:'Kommandozentrale', nl:'Commandocentrum' },
    'pf.cct':      { en:'One cockpit for your whole digital workforce.', de:'Ein Cockpit für deine gesamte digitale Belegschaft.', nl:'Eén cockpit voor je hele digitale personeel.' },
    'pf.sec':      { en:'Security & trust', de:'Sicherheit & Vertrauen', nl:'Veiligheid & vertrouwen' },
    'pf.sect':     { en:'Enterprise-grade by default.', de:'Standardmäßig auf Enterprise-Niveau.', nl:'Standaard op enterprise-niveau.' },
    'pf.ctrl':     { en:'Control', de:'Kontrolle', nl:'Controle' },
    'pf.ctrlt':    { en:'Autonomy you can dial in.', de:'Autonomie, die du einstellen kannst.', nl:'Autonomie die je zelf instelt.' },
    'pf.cta':      { en:'Put your operations on autopilot.', de:'Schalte deinen Betrieb auf Autopilot.', nl:'Zet je operatie op de automatische piloot.' },

    // -------- workforce page --------
    'wfp.title':   { en:'Meet your AI employees.', de:'Lerne deine KI-Mitarbeiter kennen.', nl:'Maak kennis met je AI-medewerkers.' },
    'wfp.sub':     { en:'Five named specialists, each owning a function, reporting live metrics and working around the clock. Hire one, or the whole team.', de:'Fünf benannte Spezialisten, jeder mit eigenem Bereich, mit Live-Kennzahlen und rund um die Uhr im Einsatz. Stelle einen ein — oder das ganze Team.', nl:'Vijf specialisten met een naam, elk met een eigen functie, live cijfers en 24/7 aan het werk. Neem er één aan, of het hele team.' },
    'wfp.cta':     { en:'Hire your first AI employee today.', de:'Stelle noch heute deinen ersten KI-Mitarbeiter ein.', nl:'Neem vandaag je eerste AI-medewerker aan.' },

    // -------- integrations page --------
    'intp.title':  { en:'One workforce. Every system.', de:'Eine Belegschaft. Jedes System.', nl:'Eén personeelsbestand. Elk systeem.' },
    'intp.sub':    { en:'NEXA sits above your stack — reading, deciding and acting inside the tools your team already lives in. Connect in minutes with least-privilege access.', de:'NEXA steht über deinem Stack — liest, entscheidet und handelt in den Tools, in denen dein Team ohnehin arbeitet. In Minuten verbunden, mit minimalen Rechten.', nl:'NEXA staat boven je stack — leest, beslist en handelt in de tools waar je team al in werkt. In minuten verbonden, met minimale rechten.' },
    'intp.how':    { en:'How it connects', de:'So wird verbunden', nl:'Hoe het verbindt' },
    'intp.howt':   { en:'Live in three steps.', de:'In drei Schritten live.', nl:'Live in drie stappen.' },
    'intp.req':    { en:'Need another integration?', de:'Brauchst du eine weitere Integration?', nl:'Een andere integratie nodig?' },
    'intp.reqs':   { en:'Tell us your tool — most new connectors ship within weeks.', de:'Nenne uns dein Tool — die meisten neuen Konnektoren sind in Wochen verfügbar.', nl:'Noem je tool — de meeste nieuwe koppelingen zijn binnen weken klaar.' },

    // -------- pricing FAQ --------
    'pr.cmp':      { en:'Compare plans', de:'Tarife vergleichen', nl:'Plannen vergelijken' },
    'pr.cmpt':     { en:'Everything in every plan.', de:'Alles in jedem Tarif.', nl:'Alles in elk plan.' },
    'pr.faqt':     { en:'Common questions.', de:'Häufige Fragen.', nl:'Veelgestelde vragen.' },
    'pr.cta':      { en:'Hire your first AI employee today.', de:'Stelle noch heute deinen ersten KI-Mitarbeiter ein.', nl:'Neem vandaag je eerste AI-medewerker aan.' },

    // -------- pricing hero + lead --------
    'price.leadfull':{ en:'Per AI employee. Cancel anytime. No headcount required. Annual billing saves 20%; the Scale plan includes a free laptop.', de:'Pro KI-Mitarbeiter. Jederzeit kündbar. Kein Personalbedarf. Jährliche Abrechnung spart 20%; der Scale-Tarif enthält einen Gratis-Laptop.', nl:'Per AI-medewerker. Altijd opzegbaar. Geen extra personeel nodig. Jaarlijks betalen bespaart 20%; het Scale-pakket bevat een gratis laptop.' },
    'pr.ctalead':  { en:'From €499/month. Save 20% on annual billing; the Scale plan includes a free laptop.', de:'Ab 499 €/Monat. 20% sparen bei jährlicher Abrechnung; der Scale-Tarif enthält einen Gratis-Laptop.', nl:'Vanaf €499/maand. Bespaar 20% bij jaarlijks betalen; het Scale-pakket bevat een gratis laptop.' },

    // -------- pricing comparison table --------
    'pr.feature':  { en:'Feature', de:'Funktion', nl:'Functie' },
    'pr.unlimited':{ en:'Unlimited', de:'Unbegrenzt', nl:'Onbeperkt' },
    'pr.f.employees':{ en:'AI employees', de:'KI-Mitarbeiter', nl:'AI-medewerkers' },
    'pr.f.integrations':{ en:'Integrations', de:'Integrationen', nl:'Integraties' },
    'pr.f.cc':     { en:'Command Center', de:'Kommandozentrale', nl:'Commandocentrum' },
    'pr.f.voice':  { en:'Voice commands', de:'Sprachbefehle', nl:'Spraakopdrachten' },
    'pr.f.exec':   { en:'Executive intelligence', de:'Management-Insights', nl:'Executive-intelligentie' },
    'pr.f.workflows':{ en:'Custom workflows', de:'Eigene Workflows', nl:'Aangepaste workflows' },
    'pr.f.csm':    { en:'Dedicated CSM', de:'Persönlicher CSM', nl:'Toegewijde CSM' },
    'pr.f.infra':  { en:'Private infrastructure', de:'Private Infrastruktur', nl:'Privé-infrastructuur' },
    'pr.f.models': { en:'Custom models', de:'Eigene Modelle', nl:'Aangepaste modellen' },
    'pr.f.laptop': { en:'Free laptop (annual)', de:'Gratis-Laptop (jährlich)', nl:'Gratis laptop (jaarlijks)' },

    // -------- pricing FAQ Q&A --------
    'pr.q1':       { en:'What exactly is an "AI employee"?', de:'Was genau ist ein „KI-Mitarbeiter"?', nl:'Wat is een "AI-medewerker" precies?' },
    'pr.a1':       { en:'A specialized autonomous agent that owns a function — operations, sales, finance, support or recruiting — and executes real work inside your connected tools, 24/7.', de:'Ein spezialisierter autonomer Agent, der einen Bereich verantwortet — Betrieb, Vertrieb, Finanzen, Support oder Recruiting — und rund um die Uhr echte Arbeit in deinen verbundenen Tools erledigt.', nl:'Een gespecialiseerde autonome agent die een functie beheert — operatie, sales, finance, support of recruitment — en 24/7 echt werk uitvoert in je gekoppelde tools.' },
    'pr.q2':       { en:'Can I cancel anytime?', de:'Kann ich jederzeit kündigen?', nl:'Kan ik altijd opzeggen?' },
    'pr.a2':       { en:'Yes. Monthly plans are cancellable any time. Annual plans run for twelve months and include the 20% discount (the free laptop comes with the Scale plan).', de:'Ja. Monatsabos sind jederzeit kündbar. Jahresabos laufen zwölf Monate und enthalten 20% Rabatt (der Gratis-Laptop gehört zum Scale-Tarif).', nl:'Ja. Maandabonnementen zijn altijd opzegbaar. Jaarabonnementen lopen twaalf maanden en bevatten 20% korting (de gratis laptop hoort bij het Scale-pakket).' },
    'pr.q3':       { en:'How does the free laptop work?', de:'Wie funktioniert der Gratis-Laptop?', nl:'Hoe werkt de gratis laptop?' },
    'pr.a3':       { en:'The free laptop comes with our most expensive plan, Scale, on annual billing. We ship a new MacBook or PC to your team to run the Command Center once your workspace is live.', de:'Der Gratis-Laptop gehört zu unserem teuersten Tarif, Scale, bei jährlicher Abrechnung. Wir senden deinem Team ein neues MacBook oder einen PC für die Kommandozentrale, sobald dein Workspace live ist.', nl:'De gratis laptop hoort bij ons duurste pakket, Scale, bij jaarlijkse facturatie. Wij sturen je team een nieuwe MacBook of pc voor het Commandocentrum zodra je workspace live is.' },
    'pr.q4':       { en:'Is my data safe?', de:'Sind meine Daten sicher?', nl:'Zijn mijn gegevens veilig?' },
    'pr.a4':       { en:'Yes. NEXA is SOC 2 Type II and GDPR compliant, encrypts data in transit and at rest, uses least-privilege connector scopes, and keeps a full audit log of every action.', de:'Ja. NEXA ist SOC 2 Type II- und DSGVO-konform, verschlüsselt Daten bei Übertragung und Speicherung, nutzt minimale Zugriffsrechte und führt ein vollständiges Audit-Log jeder Aktion.', nl:'Ja. NEXA is SOC 2 Type II- en AVG-conform, versleutelt data tijdens overdracht en opslag, gebruikt minimale toegangsrechten en houdt een volledig auditlog van elke actie bij.' },
    'pr.q5':       { en:'Do the AI employees actually take actions?', de:'Führen die KI-Mitarbeiter wirklich Aktionen aus?', nl:'Voeren de AI-medewerkers echt acties uit?' },
    'pr.a5':       { en:'Yes — NEXA is an execution system, not a suggestion tool. You can start in supervised mode and increase autonomy as you build trust.', de:'Ja — NEXA ist ein Ausführungssystem, kein Vorschlagstool. Du kannst im überwachten Modus starten und die Autonomie erhöhen, wenn das Vertrauen wächst.', nl:'Ja — NEXA is een uitvoeringssysteem, geen suggestietool. Je kunt starten in begeleide modus en de autonomie vergroten naarmate het vertrouwen groeit.' },
    'pr.q6':       { en:"What if I need a tool you don't support yet?", de:'Was, wenn ich ein Tool brauche, das ihr noch nicht unterstützt?', nl:'Wat als ik een tool nodig heb die jullie nog niet ondersteunen?' },
    'pr.a6':       { en:'Request it on the Integrations page. Most new connectors ship within a few weeks, and Enterprise can get priority builds.', de:'Fordere es auf der Integrationsseite an. Die meisten neuen Konnektoren sind in wenigen Wochen verfügbar, Enterprise erhält bevorzugte Umsetzung.', nl:'Vraag hem aan op de Integraties-pagina. De meeste nieuwe koppelingen zijn binnen enkele weken klaar, en Enterprise krijgt voorrang.' },

    // -------- pricing cards (headcount + features) --------
    'pr.emp1':     { en:'1 AI employee', de:'1 KI-Mitarbeiter', nl:'1 AI-medewerker' },
    'pr.emp5':     { en:'5 AI employees', de:'5 KI-Mitarbeiter', nl:'5 AI-medewerkers' },
    'pr.emp25':    { en:'25 AI employees', de:'25 KI-Mitarbeiter', nl:'25 AI-medewerkers' },
    'pr.empU':     { en:'Unlimited workforce', de:'Unbegrenzte Belegschaft', nl:'Onbeperkt personeel' },
    'pr.feat.int3':{ en:'3 core integrations', de:'3 Kern-Integrationen', nl:'3 kernintegraties' },
    'pr.feat.intU':{ en:'Unlimited integrations', de:'Unbegrenzte Integrationen', nl:'Onbeperkte integraties' },
    'pr.feat.email':{ en:'Email support', de:'E-Mail-Support', nl:'E-mailsupport' },
    'pr.feat.exec':{ en:'Executive Intelligence', de:'Management-Insights', nl:'Executive-intelligentie' },
    'pr.feat.prio':{ en:'Priority support', de:'Bevorzugter Support', nl:'Voorrangssupport' },
    'pr.feat.adv': { en:'Advanced automation', de:'Erweiterte Automatisierung', nl:'Geavanceerde automatisering' },
    'pr.feat.unlwf':{ en:'Unlimited AI workforce', de:'Unbegrenzte KI-Belegschaft', nl:'Onbeperkt AI-personeel' },
    'pr.feat.advsec':{ en:'Advanced security', de:'Erweiterte Sicherheit', nl:'Geavanceerde beveiliging' },

    // -------- onboarding --------
    'ob.exit':     { en:'Exit', de:'Beenden', nl:'Afsluiten' },
    'ob.s1':       { en:'Company', de:'Unternehmen', nl:'Bedrijf' },
    'ob.s2':       { en:'Connect', de:'Verbinden', nl:'Koppelen' },
    'ob.s3':       { en:'Workforce', de:'Belegschaft', nl:'Personeel' },
    'ob.s4':       { en:'Deploy', de:'Start', nl:'Inzetten' },
    'ob.step1t':   { en:'Company Information', de:'Unternehmensdaten', nl:'Bedrijfsgegevens' },
    'ob.step1s':   { en:'Tell us about your company so NEXA can calibrate your workforce.', de:'Erzähl uns von deinem Unternehmen, damit NEXA deine Belegschaft kalibriert.', nl:'Vertel ons over je bedrijf zodat NEXA je personeel kan afstemmen.' },
    'ob.step2t':   { en:'Connect Systems', de:'Systeme verbinden', nl:'Systemen koppelen' },
    'ob.step2s':   { en:'Select the tools NEXA will operate inside. You can connect more later.', de:'Wähle die Tools, in denen NEXA arbeiten soll. Du kannst später mehr verbinden.', nl:'Kies de tools waarin NEXA werkt. Je kunt er later meer koppelen.' },
    'ob.step3t':   { en:'Choose Your Workforce', de:'Wähle deine Belegschaft', nl:'Kies je personeel' },
    'ob.step3s':   { en:'Select the AI employees to deploy. Each runs autonomously, 24/7.', de:'Wähle die KI-Mitarbeiter zum Einsatz. Jeder arbeitet autonom, rund um die Uhr.', nl:'Kies de AI-medewerkers die je inzet. Elk werkt autonoom, 24/7.' },
    'ob.next':     { en:'Continue →', de:'Weiter →', nl:'Doorgaan →' },
    'ob.back':     { en:'← Back', de:'← Zurück', nl:'← Terug' },

    // -------- signin --------
    'si.title':    { en:'Sign in to NEXA', de:'Bei NEXA anmelden', nl:'Inloggen bij NEXA' },
    'si.sub':      { en:'Command your autonomous workforce', de:'Steuere deine autonome Belegschaft', nl:'Bestuur je autonome personeel' },
    'si.google':   { en:'Continue with Google', de:'Mit Google fortfahren', nl:'Doorgaan met Google' },
    'si.ms':       { en:'Continue with Microsoft', de:'Mit Microsoft fortfahren', nl:'Doorgaan met Microsoft' },
    'si.or':       { en:'or sign in with your account', de:'oder mit deinem Konto anmelden', nl:'of log in met je account' },
    'si.user':     { en:'Username or email', de:'Benutzername oder E-Mail', nl:'Gebruikersnaam of e-mail' },
    'si.pass':     { en:'Password', de:'Passwort', nl:'Wachtwoord' },
    'si.remember': { en:'Remember me', de:'Angemeldet bleiben', nl:'Onthoud mij' },
    'si.forgot':   { en:'Forgot password?', de:'Passwort vergessen?', nl:'Wachtwoord vergeten?' },
    'si.go':       { en:'Sign in →', de:'Anmelden →', nl:'Inloggen →' },
    'si.nowork':   { en:'No workspace yet?', de:'Noch kein Workspace?', nl:'Nog geen workspace?' },
    'si.create':   { en:'Create one', de:'Erstelle einen', nl:'Maak er een aan' },

    // -------- marketplace --------
    'mk.eyebrow':  { en:'Phase 3 · Workforce Marketplace', de:'Phase 3 · Belegschafts-Marktplatz', nl:'Fase 3 · Personeels-marktplaats' },
    'mk.title':    { en:'Install AI employees<br>like apps.', de:'Installiere KI-Mitarbeiter<br>wie Apps.', nl:'Installeer AI-medewerkers<br>als apps.' },
    'mk.sub':      { en:'Browse specialized digital workers. One click hires them into your workforce — instantly operational.', de:'Durchstöbere spezialisierte digitale Mitarbeiter. Ein Klick stellt sie in deine Belegschaft ein — sofort einsatzbereit.', nl:'Blader door gespecialiseerde digitale medewerkers. Eén klik neemt ze aan in je personeel — direct inzetbaar.' },
    'mk.install':  { en:'Install', de:'Installieren', nl:'Installeren' },
    'mk.installed':{ en:'Installed', de:'Installiert', nl:'Geïnstalleerd' },
    'mk.permo':    { en:'/mo', de:'/Mon.', nl:'/mnd' },
    'mk.connected':{ en:'● Connected to live NEXA server — installs persist.', de:'● Mit dem Live-NEXA-Server verbunden — Installationen bleiben erhalten.', nl:'● Verbonden met de live NEXA-server — installaties blijven bewaard.' },
    'mk.demo':     { en:'○ Demo mode — start the server (node server/server.js) to make installs persist.', de:'○ Demo-Modus — starte den Server (node server/server.js), damit Installationen erhalten bleiben.', nl:'○ Demomodus — start de server (node server/server.js) zodat installaties bewaard blijven.' },
    'mk.hired':    { en:'hired — now operational in your Command Center.', de:'eingestellt — jetzt in deiner Kommandozentrale aktiv.', nl:'aangenomen — nu actief in je Commandocentrum.' },

    // -------- departments --------
    'dept.All':        { en:'All', de:'Alle', nl:'Alle' },
    'dept.Operations': { en:'Operations', de:'Betrieb', nl:'Operatie' },
    'dept.Sales':      { en:'Sales', de:'Vertrieb', nl:'Sales' },
    'dept.Finance':    { en:'Finance', de:'Finanzen', nl:'Finance' },
    'dept.Support':    { en:'Support', de:'Support', nl:'Support' },
    'dept.Recruiting': { en:'Recruiting', de:'Recruiting', nl:'Recruitment' },
    'dept.Marketing':  { en:'Marketing', de:'Marketing', nl:'Marketing' },
    'dept.Documents':  { en:'Documents', de:'Dokumente', nl:'Documenten' },

    // -------- pricing popup (logged-out install) --------
    'pp.title':    { en:'Choose a plan to install', de:'Wähle einen Tarif zum Installieren', nl:'Kies een plan om te installeren' },
    'pp.sub':      { en:'Installing AI employees requires an active plan. Pick monthly or yearly billing below.', de:'Das Installieren von KI-Mitarbeitern erfordert einen aktiven Tarif. Wähle unten monatliche oder jährliche Abrechnung.', nl:'Het installeren van AI-medewerkers vereist een actief plan. Kies hieronder maandelijkse of jaarlijkse facturatie.' },
    'pp.signin':   { en:'Already have a plan? Sign in', de:'Hast du bereits einen Tarif? Anmelden', nl:'Heb je al een plan? Inloggen' },
    'pp.year':     { en:'/year', de:'/Jahr', nl:'/jaar' },
    'pp.permoyear':{ en:'≈ €{x}/mo billed yearly', de:'≈ {x} €/Mon. jährlich abgerechnet', nl:'≈ €{x}/mnd jaarlijks gefactureerd' },
    'pp.choose':   { en:'Choose plan', de:'Tarif wählen', nl:'Plan kiezen' },

    // -------- workforce page (dynamic) --------
    'wf.eyebrow2': { en:'Digital Workforce', de:'Digitale Belegschaft', nl:'Digitaal personeel' },
    'wf.statactions':{ en:'actions executed / day', de:'Aktionen / Tag', nl:'acties uitgevoerd / dag' },
    'wf.stattime': { en:'time saved / day', de:'gesparte Zeit / Tag', nl:'tijd bespaard / dag' },
    'wf.statperf': { en:'average performance', de:'durchschnittliche Leistung', nl:'gemiddelde prestatie' },
    'wf.staton':   { en:'always on', de:'immer aktiv', nl:'altijd actief' },
    'wf.daywith':  { en:'A day with', de:'Ein Tag mit', nl:'Een dag met' },
    'wf.viewprofile':{ en:'View {x}’s profile →', de:'Profil von {x} ansehen →', nl:'Bekijk profiel van {x} →' },
    'wf.photoh':   { en:'A full team, without a single new hire.', de:'Ein ganzes Team, ohne eine einzige Neueinstellung.', nl:'Een volledig team, zonder één nieuwe aanwerving.' },
    'wf.photop':   { en:'Add specialists from the marketplace whenever you need more capacity.', de:'Füge bei Bedarf Spezialisten aus dem Marktplatz hinzu.', nl:'Voeg specialisten uit de marktplaats toe wanneer je meer capaciteit nodig hebt.' },
    'wf.browse':   { en:'Browse the marketplace →', de:'Marktplatz durchsuchen →', nl:'Bekijk de marktplaats →' },
    'wf.ctalead':  { en:'From €499/month. Operational in minutes.', de:'Ab 499 €/Monat. In Minuten einsatzbereit.', nl:'Vanaf €499/maand. Binnen minuten inzetbaar.' },
    // metric labels
    'm.taskstoday':{ en:'tasks today', de:'Aufgaben heute', nl:'taken vandaag' },
    'm.timesaved': { en:'time saved', de:'gesparte Zeit', nl:'tijd bespaard' },
    'm.performance':{ en:'performance', de:'Leistung', nl:'prestatie' },
    'm.followups': { en:'follow-ups', de:'Follow-ups', nl:'opvolgingen' },
    'm.invoices':  { en:'invoices', de:'Rechnungen', nl:'facturen' },
    'm.tickets':   { en:'tickets', de:'Tickets', nl:'tickets' },
    'm.screened':  { en:'screened', de:'geprüft', nl:'gescreend' },
    'm.documents': { en:'documents', de:'Dokumente', nl:'documenten' },

    // -------- command center · documents --------
    'cc.documents':{ en:'Documents', de:'Dokumente', nl:'Documenten' },
    'doc.title':   { en:'Documents', de:'Dokumente', nl:'Documenten' },
    'doc.sub':     { en:'Ava, your AI Document Specialist, generates Excel, Word and PowerPoint files — fully automated.', de:'Ava, deine KI-Dokumentenspezialistin, erstellt Excel-, Word- und PowerPoint-Dateien — vollautomatisch.', nl:'Ava, je AI-documentspecialist, genereert Excel-, Word- en PowerPoint-bestanden — volledig geautomatiseerd.' },
    'doc.generate':{ en:'Generate', de:'Erstellen', nl:'Genereren' },
    'doc.generating':{ en:'Generating…', de:'Wird erstellt…', nl:'Bezig met genereren…' },
    'doc.download':{ en:'Download', de:'Herunterladen', nl:'Downloaden' },
    'doc.ready':   { en:'ready — downloading now.', de:'fertig — wird heruntergeladen.', nl:'klaar — wordt nu gedownload.' },
    'doc.recent':  { en:'Recently generated', de:'Kürzlich erstellt', nl:'Recent gegenereerd' },
    'doc.norecent':{ en:'No documents generated yet.', de:'Noch keine Dokumente erstellt.', nl:'Nog geen documenten gegenereerd.' },
    'doc.xlsx.t':  { en:'Financial model (Excel)', de:'Finanzmodell (Excel)', nl:'Financieel model (Excel)' },
    'doc.xlsx.s':  { en:'Revenue, costs & cashflow — .xlsx with live formulas', de:'Umsatz, Kosten & Cashflow — .xlsx mit Formeln', nl:'Omzet, kosten & cashflow — .xlsx met formules' },
    'doc.docx.t':  { en:'Business report (Word)', de:'Geschäftsbericht (Word)', nl:'Bedrijfsrapport (Word)' },
    'doc.docx.s':  { en:'Formatted operations summary — .doc document', de:'Formatierte Betriebsübersicht — .doc-Dokument', nl:'Opgemaakt operationeel overzicht — .doc-document' },
    'doc.pptx.t':  { en:'Pitch deck (PowerPoint)', de:'Pitch-Deck (PowerPoint)', nl:'Pitch-deck (PowerPoint)' },
    'doc.pptx.s':  { en:'5-slide company overview — .pptx presentation', de:'5-Folien-Unternehmensüberblick — .pptx-Präsentation', nl:'Bedrijfsoverzicht van 5 slides — .pptx-presentatie' },
    'doc.schedules':{ en:'Scheduled documents', de:'Geplante Dokumente', nl:'Geplande documenten' },
    'doc.run':     { en:'Run now', de:'Jetzt ausführen', nl:'Nu uitvoeren' },
    'doc.lastrun': { en:'Last run', de:'Zuletzt', nl:'Laatst' },
    'doc.never':   { en:'never', de:'nie', nl:'nooit' },

    // -------- command center · approvals / audit / autonomy / roi --------
    'cc.approvals':{ en:'Approvals', de:'Freigaben', nl:'Goedkeuringen' },
    'cc.audit':    { en:'Audit log', de:'Audit-Log', nl:'Auditlog' },
    'ap.title':    { en:'Approvals', de:'Freigaben', nl:'Goedkeuringen' },
    'ap.sub':      { en:'Supervised actions wait here for your approval before they run.', de:'Überwachte Aktionen warten hier auf deine Freigabe, bevor sie ausgeführt werden.', nl:'Begeleide acties wachten hier op je goedkeuring voordat ze worden uitgevoerd.' },
    'ap.none':     { en:'Nothing waiting — your workforce is clear.', de:'Nichts offen — deine Belegschaft ist auf dem Laufenden.', nl:'Niets in de wachtrij — je personeel is bij.' },
    'ap.approve':  { en:'Approve', de:'Freigeben', nl:'Goedkeuren' },
    'ap.reject':   { en:'Reject', de:'Ablehnen', nl:'Afwijzen' },
    'ap.approved': { en:'approved — executing now.', de:'freigegeben — wird ausgeführt.', nl:'goedgekeurd — wordt nu uitgevoerd.' },
    'ap.rejected': { en:'rejected.', de:'abgelehnt.', nl:'afgewezen.' },
    'ap.sent':     { en:'sent for approval.', de:'zur Freigabe gesendet.', nl:'ter goedkeuring verzonden.' },
    'au.title':    { en:'Audit log', de:'Audit-Log', nl:'Auditlog' },
    'au.sub':      { en:'Every command, execution, approval and change — fully traceable.', de:'Jeder Befehl, jede Ausführung, Freigabe und Änderung — vollständig nachvollziehbar.', nl:'Elke opdracht, uitvoering, goedkeuring en wijziging — volledig herleidbaar.' },
    'au.none':     { en:'No activity logged yet.', de:'Noch keine Aktivität protokolliert.', nl:'Nog geen activiteit gelogd.' },
    'roi.cardt':   { en:'Live ROI', de:'Live-ROI', nl:'Live-ROI' },
    'roi.annual':  { en:'Projected annual savings', de:'Voraussichtliche Jahresersparnis', nl:'Verwachte jaarbesparing' },
    'roi.return':  { en:'Return on cost', de:'Kosten-Rendite', nl:'Rendement op kosten' },
    'aut.title':   { en:'Autonomy', de:'Autonomie', nl:'Autonomie' },
    'aut.supervised':{ en:'Supervised — approve before run', de:'Überwacht — Freigabe vor Ausführung', nl:'Begeleid — goedkeuren vóór uitvoeren' },
    'aut.auto':    { en:'Autonomous — runs automatically', de:'Autonom — läuft automatisch', nl:'Autonoom — voert automatisch uit' },
    'mem.title':   { en:'Memory', de:'Gedächtnis', nl:'Geheugen' },
    'mem.ph':      { en:'Teach this employee something it should remember…', de:'Bringe diesem Mitarbeiter etwas bei, das er sich merken soll…', nl:'Leer deze medewerker iets dat hij moet onthouden…' },
    'mem.save':    { en:'Save', de:'Speichern', nl:'Opslaan' },
    'mem.none':    { en:'No memory yet. Corrections you give are remembered here.', de:'Noch kein Gedächtnis. Deine Korrekturen werden hier gemerkt.', nl:'Nog geen geheugen. Correcties die je geeft worden hier onthouden.' },

    // -------- agent explainer pages --------
    'ag.back':     { en:'← All agents', de:'← Alle Agenten', nl:'← Alle agents' },
    'ag.does':     { en:'What {x} does', de:'Was {x} macht', nl:'Wat {x} doet' },
    'ag.how':      { en:'How it works', de:'So funktioniert es', nl:'Hoe het werkt' },
    'ag.caps':     { en:'Capabilities', de:'Fähigkeiten', nl:'Wat ze kan' },
    'ag.demo':     { en:'Live demo', de:'Live-Demo', nl:'Live demo' },
    'ag.demosub':  { en:'A simulation of {x} working — exactly what you see in the Command Center.', de:'Eine Simulation von {x} bei der Arbeit — genau wie in der Kommandozentrale.', nl:'Een simulatie van {x} aan het werk — precies wat je in het Commandocentrum ziet.' },
    'ag.hire':     { en:'Hire {x}', de:'{x} einstellen', nl:'Neem {x} aan' },
    'ag.meet':     { en:'Meet the whole team →', de:'Lerne das ganze Team kennen →', nl:'Maak kennis met het hele team →' },
    'ag.try':      { en:'Generate a real document', de:'Echtes Dokument erstellen', nl:'Genereer een echt document' },
    'ag.247':      { en:'Works 24/7', de:'Arbeitet rund um die Uhr', nl:'Werkt 24/7' },
    'ag.super':    { en:'Supervised or autonomous', de:'Überwacht oder autonom', nl:'Begeleid of autonoom' },
    'ag.audit':    { en:'Every action audited', de:'Jede Aktion protokolliert', nl:'Elke actie gelogd' },
    'ag.step.u':   { en:'Understands', de:'Versteht', nl:'Begrijpt' },
    'ag.step.d':   { en:'Decides', de:'Entscheidet', nl:'Beslist' },
    'ag.step.e':   { en:'Executes', de:'Führt aus', nl:'Voert uit' },
  };

  const FLAGS = { en:'🇬🇧', de:'🇩🇪', nl:'🇳🇱' };
  const NAMES = { en:'English', de:'Deutsch', nl:'Nederlands' };

  function detect() {
    try {
      const saved = localStorage.getItem('nexa_lang');
      if (saved && FLAGS[saved]) return saved;
      const l = (navigator.language || 'en').slice(0,2);
      return FLAGS[l] ? l : 'en';
    } catch { return 'en'; }
  }

  const I18N = {
    lang: detect(),
    t(key) { const e = DICT[key]; return e ? (e[this.lang] || e.en) : key; },
    apply(root) {
      (root || document).querySelectorAll('[data-i18n]').forEach(el => { el.textContent = this.t(el.getAttribute('data-i18n')); });
      (root || document).querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = this.t(el.getAttribute('data-i18n-html')); });
      (root || document).querySelectorAll('[data-i18n-ph]').forEach(el => { el.setAttribute('placeholder', this.t(el.getAttribute('data-i18n-ph'))); });
      document.documentElement.lang = this.lang;
    },
    set(lang) {
      if (!FLAGS[lang]) return;
      this.lang = lang;
      try { localStorage.setItem('nexa_lang', lang); } catch {}
      this.apply();
      document.querySelectorAll('.lang').forEach(refreshSelector);
      window.dispatchEvent(new CustomEvent('nexa:lang', { detail: lang }));
    },
    flag(l) { return FLAGS[l || this.lang]; },
    name(l) { return NAMES[l || this.lang]; },
    langs: ['en','de','nl'],
  };

  function refreshSelector(root) {
    const btn = root.querySelector('.lang-btn .flag'); if (btn) btn.textContent = FLAGS[I18N.lang];
    const lbl = root.querySelector('.lang-btn .lbl'); if (lbl) lbl.textContent = I18N.lang.toUpperCase();
    root.querySelectorAll('.lang-menu button').forEach(b => b.classList.toggle('active', b.dataset.l === I18N.lang));
  }

  // Build a flag selector into a container element
  I18N.mount = function (container) {
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.className = 'lang';
    wrap.innerHTML =
      `<button class="lang-btn" aria-label="Language"><span class="flag">${FLAGS[I18N.lang]}</span><span class="lbl">${I18N.lang.toUpperCase()}</span><span class="chev">▾</span></button>
       <div class="lang-menu">` +
      I18N.langs.map(l => `<button data-l="${l}"><span class="flag">${FLAGS[l]}</span> ${NAMES[l]} <span class="check">✓</span></button>`).join('') +
      `</div>`;
    container.appendChild(wrap);
    const btn = wrap.querySelector('.lang-btn');
    btn.addEventListener('click', e => { e.stopPropagation(); wrap.classList.toggle('open'); });
    wrap.querySelectorAll('.lang-menu button').forEach(b => b.addEventListener('click', () => { I18N.set(b.dataset.l); wrap.classList.remove('open'); }));
    document.addEventListener('click', () => wrap.classList.remove('open'));
    refreshSelector(wrap);
    return wrap;
  };

  window.I18N = I18N;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang-mount]').forEach(c => I18N.mount(c));
    I18N.apply();
  });
})();
