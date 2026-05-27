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
