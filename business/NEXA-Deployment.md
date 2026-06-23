# NEXA — Live deployment (echte login op een publieke URL)

**Waarom GitHub Pages niet werkte:** dat is statische hosting — het kan geen
Node-server draaien, dus er is geen `/api/login`. NEXA's server serveert *zowel de
site als de API* op één poort, dus je deployt gewoon de hele repo naar een host die
Node draait. Dan werkt login, accounts en het dashboard op één live URL. GitHub
Pages heb je voor de app niet meer nodig.

De code is hiervoor klaar: de server luistert op `process.env.PORT` en serveert de
site + API samen. Configbestanden staan in de repo (`render.yaml`, `Procfile`,
`Dockerfile`).

---

## Aanrader: Render (gratis, makkelijkst)

1. Zet de repo op GitHub (mag dezelfde repo zijn als nu).
2. Ga naar **render.com** → log in met GitHub.
3. **New → Blueprint** → kies je NEXA-repo. Render leest `render.yaml`.
   (Of: **New → Web Service** → repo kiezen → Start command `node server/server.js`.)
4. Zet vóór "Create" de geheime waarden:
   - **NEXA_ADMIN_PASS** = jouw admin-wachtwoord (wordt niet in de repo opgeslagen).
   - NEXA_ADMIN_USER staat al op `kain`; NEXA_AUTH_SECRET genereert Render zelf.
5. **Create** → na ~1 minuut krijg je een URL zoals `https://nexa-xxxx.onrender.com`.
6. Open `…/signin.html` en log in met `kain` + het wachtwoord dat je instelde.

Klaar. De hele app (site, dashboard, accounts, shop, settings) draait nu live.

> Belangrijk — gratis plan = **vluchtige opslag**: bij elke redeploy/herstart reset
> de data en seedt de app opnieuw uit de `NEXA_ADMIN_*` env. Voor blijvende
> accounts: upgrade het plan en koppel een disk op
> `…/server/data` (zie de commentaarregels in `render.yaml`).

---

## Alternatief: Railway

1. **railway.app** → New Project → Deploy from GitHub → kies de repo.
2. Railway pikt de `Procfile` op (`web: node server/server.js`).
3. Variables → zet `NEXA_ADMIN_USER`, `NEXA_ADMIN_PASS`, `NEXA_AUTH_SECRET`,
   `NEXA_ALLOW_SIGNUP=false`.
4. Genereer een domein onder Settings → je live URL.

## Alternatief: Fly.io (Docker)

1. Installeer de `fly` CLI, `fly launch` in de projectmap (gebruikt de `Dockerfile`).
2. `fly secrets set NEXA_ADMIN_PASS=… NEXA_AUTH_SECRET=… NEXA_ADMIN_USER=kain`
3. `fly deploy`.

---

## Omgevingsvariabelen (productie)

| Variabele | Doel |
|---|---|
| `NEXA_AUTH_SECRET` | Ondertekent login-tokens; vast houden zodat sessies herstart overleven |
| `NEXA_ADMIN_USER` / `NEXA_ADMIN_PASS` | Het beschermde oprichter-account |
| `NEXA_ALLOW_SIGNUP` | `false` in productie (admins maken accounts in-app aan) |
| `NEXA_CORS_ORIGIN` | Alleen nodig als front-end op een ander domein draait dan de API |
| `ANTHROPIC_API_KEY` / connector-keys | Optioneel — zet de echte AI + connectoren aan (zie go-live gids) |

---

## Je eigen domein koppelen

Op elke host kun je onder "Custom domain" je domein (bijv. `app.nexa.nl`)
toevoegen; volg de DNS-instructie (een CNAME naar de host-URL). De site én de API
draaien dan op jouw domein.

---

## Even checken na deploy

- `https://<jouw-url>/` toont de landingpagina.
- `https://<jouw-url>/signin.html` → inloggen met je admin-account werkt.
- In het dashboard: Settings, de pop-up shop en het live-paneel werken op echte data.

Als login "kan de server niet bereiken" geeft, draait de Node-service niet of staat
de start command verkeerd — controleer de host-logs en dat `node server/server.js`
de start command is.
