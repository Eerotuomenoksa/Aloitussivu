# TODO_HUMAN

## SEC-001: Pyorayta functions/.env -salaisuudet ja siirra Secret Manageriin

Priority: P0
Status: Odottaa ihmisen toimenpiteita

Tee nama ennen kuin vastaavat Cloud Functions -muutokset otetaan tuotantoon:

1. Luo uusi `GEMINI_API_KEY` Google Cloud Consolessa ja poista vanha avain.
2. Pyyda uusi `NAMEDAY_API_TOKEN` nimipaivarajapinta.fi-palvelusta ja poista vanha token kaytosta.
3. Generoi uusi `ADMIN_TRIGGER_SECRET`, esimerkiksi komennolla `openssl rand -base64 32`.
4. Aseta arvot Firebase Secret Manageriin:
   - `firebase functions:secrets:set GEMINI_API_KEY`
   - `firebase functions:secrets:set NAMEDAY_API_TOKEN`
   - `firebase functions:secrets:set ADMIN_TRIGGER_SECRET`
5. Poista tai tyhjenna paikallinen `functions/.env`.

Varmistus:

1. `functions/.env` on tyhja tai poistettu.
2. `rg "AIzaSy" functions` ei loyda kovakoodattuja avaimia.
3. `npm run check:secrets` menee lapi.

## SEC-002: Siirra tyohakemisto OneDriven ulkopuolelle tai poista synkronointi alikansioilta

Priority: P0
Status: Odottaa ihmisen toimenpiteita

Nykyinen tyohakemisto on OneDrive-polussa:

`C:\Users\eero.tuomenoksa\OneDrive - Vanhustyön keskusliitto ry\Tiedostot\GitHub\Aloitussivu`

Suositeltu korjaus:

1. Kloonaa repo uuteen paikalliseen polkuun, esimerkiksi `C:\dev\Aloitussivu`.
2. Tee jatkokehitys uudessa kansiossa.
3. Varmista, ettei `node_modules`, `dist`, `.env` tai `functions/.env` synkronoidu pilveen.

Vaihtoehtoinen korjaus, jos repo jaa OneDriveen:

1. Sulje synkronointi pois kansioilta `node_modules`, `dist` ja salaisuuksia sisaltavilta `.env`-tiedostoilta.
2. Varmista OneDriven asetuksista, ettei `functions/.env` paady pilveen.

Varmistus:

1. `C:\dev\Aloitussivu\.git` loytyy, jos repo siirrettiin.
2. OneDrive ei synkronoi `dist`-, `node_modules`- tai `.env`-sisaltoja.

## SEC-003: Lisaa HTTP-referrer-rajoitus VITE_FIREBASE_API_KEY:lle

Priority: P0
Status: Odottaa ihmisen toimenpiteita

Tee Google Cloud Consolessa projektissa `aloitussivu-5d50c`:

1. Avaa API credentials: `https://console.cloud.google.com/apis/credentials?project=aloitussivu-5d50c`.
2. Muokkaa selainpuolen Firebase API -avainta.
3. Aseta Application restrictions -kohdaksi `HTTP referrers (web sites)`.
4. Lisaa sallitut referrerit:
   - `https://eerotuomenoksa.github.io/*`
   - `https://aloitussivu-5d50c.web.app/*`
   - `https://aloitussivu-5d50c.firebaseapp.com/*`
   - `http://localhost:5173/*`
5. Rajaa API restrictions -kohdassa avaimelle vain tarpeelliset rajapinnat:
   - Identity Toolkit API
   - Cloud Firestore API
   - Firebase Installations API
   - Token Service API
   - Firebase App Check API

Varmistus:

1. Avaimen kaytto ilman sallittua referreria ei onnistu.
2. Sivuston kirjautuminen, Firestore-luku ja App Check toimivat edelleen sallituilta domaineilta.
