# TODO_HUMAN

Tässä tiedostossa ovat ne tietoturvatehtävät, joita Codex ei voi tehdä kokonaan puolestasi, koska ne vaativat kirjautumista ulkoisiin palveluihin, laskutusasetuksia tai salaisuuksien käsittelyä.

Älä kirjoita salasanoja, API-avaimia tai tokeneita tähän tiedostoon.

## SEC-001: Päivitä Gemini- ja ylläpitosalaisuudet turvallisempaan paikkaan

Prioriteetti: P0
Tila: Odottaa ihmisen toimenpiteitä
Palvelut: Google Cloud Console, Firebase CLI, paikallinen projektikansio

Tämän kohdan tarkoitus on poistaa uudelleen luotavat salaisuudet paikallisesta `functions/.env`-tiedostosta. Nimipäivä-tokenia ei pyöritetä nyt, koska se on toimitettu vain kerran ja nimipäivät todennäköisesti korvataan myöhemmin ostetulla datalla ilman rajapintaa.

### 1. Luo uusi Gemini API -avain Google Cloudissa

1. Avaa selain ja mene osoitteeseen `https://console.cloud.google.com/apis/credentials`.
2. Varmista yläreunan projektivalitsimesta, että valittuna on projekti `aloitussivu-5d50c`.
3. Etsi nykyinen Geminiin tai Generative Language APIin liittyvä API-avain.
4. Luo uusi API-avain painikkeesta `Create credentials` -> `API key`.
5. Kopioi uusi avain talteen vain siksi aikaa, että asetat sen Firebase Secret Manageriin.
6. Kun uusi avain on asetettu ja toiminta testattu, poista vanha Gemini API -avain samasta näkymästä.

### 2. Luo uusi ADMIN_TRIGGER_SECRET paikallisesti

1. Avaa PowerShell.
2. Siirry projektikansioon:

   ```powershell
   cd "C:\Users\eero.tuomenoksa\OneDrive - Vanhustyön keskusliitto ry\Tiedostot\GitHub\Aloitussivu"
   ```

3. Luo uusi satunnainen arvo:

   ```powershell
   openssl rand -base64 32
   ```

4. Kopioi tulostunut arvo talteen vain siksi aikaa, että asetat sen Firebase Secret Manageriin.

### 3. Tallenna uusitut salaisuudet Firebase Secret Manageriin

1. Avaa PowerShell projektikansiossa.
2. Kirjaudu Firebaseen, jos et ole kirjautunut:

   ```powershell
   firebase login
   ```

3. Varmista, että Firebase CLI käyttää oikeaa projektia:

   ```powershell
   firebase use aloitussivu-5d50c
   ```

4. Aseta uusi Gemini-avain:

   ```powershell
   firebase functions:secrets:set GEMINI_API_KEY
   ```

   Kun komento kysyy arvoa, liitä uusi Gemini API -avain.

5. Aseta uusi admin-trigger-salaisuus:

   ```powershell
   firebase functions:secrets:set ADMIN_TRIGGER_SECRET
   ```

   Kun komento kysyy arvoa, liitä äsken luotu satunnainen arvo.

6. Älä aseta `NAMEDAY_API_TOKEN`-arvoa Secret Manageriin tässä vaiheessa. Nykyinen nimipäivä-token pidetään käytössä vanhalla tavalla testijakson ajan.

### 4. Päivitä paikallinen `functions/.env`

1. Avaa tiedosto `functions/.env` paikallisessa projektikansiossa.
2. Poista siitä uusitut `GEMINI_API_KEY`- ja `ADMIN_TRIGGER_SECRET`-arvot, kun niiden Secret Manager -käyttö on varmistettu.
3. Älä poista `NAMEDAY_API_TOKEN`-arvoa vielä, ellei nimipäivätoiminto ole korvattu toisella toteutuksella.

### Valmis, kun

1. Gemini-toiminto toimii uudella avaimella.
2. Admin-trigger käyttää uutta salaisuutta.
3. Nimipäivätoiminto toimii edelleen nykyisellä `NAMEDAY_API_TOKEN`-tokenilla.
4. Komento `npm run check:secrets` menee läpi.

## SEC-002: Siirrä kehityskansio pois OneDrivesta tai estä riskikansioiden synkronointi

Prioriteetti: P0
Tila: Odottaa ihmisen toimenpiteitä
Palvelut: Windows File Explorer, OneDrive, GitHub

Nykyinen projektikansio on OneDriven sisällä:

```text
C:\Users\eero.tuomenoksa\OneDrive - Vanhustyön keskusliitto ry\Tiedostot\GitHub\Aloitussivu
```

Tämä voi synkronoida kehityksen väliaikaistiedostoja ja salaisuuksia Microsoftin pilveen. Suositeltu ratkaisu on siirtää repo tavalliseen paikalliseen kansioon.

### Suositeltu tapa: kloonaa repo uuteen paikalliseen kansioon

1. Avaa File Explorer.
2. Luo kansio `C:\dev`, jos sitä ei vielä ole.
3. Avaa PowerShell.
4. Siirry uuteen kansioon:

   ```powershell
   cd C:\dev
   ```

5. Kloonaa GitHub-repo uudelleen. Käytä samaa GitHub-osoitetta, jota repo nyt käyttää:

   ```powershell
   git clone <repo-osoite> Aloitussivu
   ```

6. Avaa jatkossa projekti kansiosta:

   ```text
   C:\dev\Aloitussivu
   ```

7. Älä tee jatkokehitystä enää OneDrive-kansion kopiosta.

### Vaihtoehtoinen tapa: jos projekti jää OneDriveen

1. Avaa OneDrive-asetukset Windowsin tehtäväpalkista.
2. Etsi synkronointiasetukset tälle OneDrive-tilille.
3. Varmista, ettei OneDrive synkronoi näitä kansioita tai tiedostoja:
   - `node_modules`
   - `dist`
   - `.env`
   - `.env.local`
   - `functions/.env`
   - `functions/.env.local`
4. Jos OneDrive ei tarjoa helppoa poissulkua, käytä suositeltua tapaa ja siirrä repo `C:\dev`-kansioon.

### Valmis, kun

1. Projektin aktiivinen kehityskansio on `C:\dev\Aloitussivu`, tai OneDrive-synkronointi on varmasti estetty riskitiedostoilta.
2. `dist`, `node_modules` ja `.env`-tiedostot eivät synkronoidu OneDriveen.

## SEC-003: Rajaa selainpuolen Firebase API -avain oikeille sivustoille

Prioriteetti: P0
Tila: Odottaa ihmisen toimenpiteitä
Palvelu: Google Cloud Console

Selainpuolen Firebase API -avain saa näkyä selaimessa, mutta sitä pitää rajoittaa niin, että sitä voi käyttää vain omilta sivustoilta.

### Tee näin Google Cloud Consolessa

1. Avaa selain ja mene osoitteeseen:

   ```text
   https://console.cloud.google.com/apis/credentials?project=aloitussivu-5d50c
   ```

2. Varmista yläreunasta, että projekti on `aloitussivu-5d50c`.
3. Avaa selainpuolen Firebase API -avain. Se on se avain, jota käytetään `VITE_FIREBASE_API_KEY`-ympäristömuuttujassa.
4. Etsi kohta `Application restrictions`.
5. Valitse vaihtoehto `HTTP referrers (web sites)`.
6. Lisää sallitut sivustot yksi kerrallaan:

   ```text
   https://eerotuomenoksa.github.io/*
   https://aloitussivu-5d50c.web.app/*
   https://aloitussivu-5d50c.firebaseapp.com/*
   http://localhost:5173/*
   ```

7. Etsi kohta `API restrictions`.
8. Valitse `Restrict key`.
9. Salli vain nämä rajapinnat:
   - Identity Toolkit API
   - Cloud Firestore API
   - Firebase Installations API
   - Token Service API
   - Firebase App Check API
10. Tallenna muutokset.

### Valmis, kun

1. Avain on rajattu vain yllä oleville referrer-osoitteille.
2. Sivuston kirjautuminen toimii edelleen.
3. Firestoresta luettavat tiedot toimivat edelleen.
4. Paikallinen kehitys toimii osoitteessa `http://localhost:5173`.

## SEC-010: Ota kaksivaiheinen tunnistautuminen käyttöön admin-tileillä

Prioriteetti: P2
Tila: Odottaa ihmisen toimenpiteitä
Palvelu: Google-tilin asetukset

Tämä pitää tehdä ennen Firebase Custom Claims -muutosta, jotta admin-tilit ovat paremmin suojattuja.

### Tee näin jokaisella admin-tilillä

1. Kirjaudu selaimessa adminina käytettävälle Google-tilille.
2. Avaa osoite:

   ```text
   https://myaccount.google.com/signinoptions/two-step-verification
   ```

3. Valitse `Get started` tai vastaava aloituspainike.
4. Lisää vahva toinen tunnistautumistapa:
   - ensisijaisesti Authenticator-sovellus, esimerkiksi Google Authenticator tai Microsoft Authenticator
   - tai fyysinen turvallisuusavain, kuten YubiKey
5. Vältä SMS-varmistusta, jos parempi vaihtoehto on käytettävissä.
6. Tallenna varakoodit turvalliseen paikkaan.
7. Tee sama kaikille admin-tileille.

### Valmis, kun

1. Molemmat admin-tilit pyytävät kirjautuessa kaksivaiheisen vahvistuksen.
2. Varakoodit on tallennettu turvallisesti.
3. Pääset edelleen kirjautumaan ylläpitoon.

## SEC-011: Lisää budjettihälytykset Google Cloudiin

Prioriteetti: P2
Tila: Odottaa ihmisen toimenpiteitä
Palvelu: Google Cloud Billing

Budjettihälytys ei estä palvelua toimimasta, mutta se lähettää ilmoituksen, jos kustannukset alkavat nousta.

### Tee näin Google Cloud Billingissä

1. Avaa selain ja mene osoitteeseen:

   ```text
   https://console.cloud.google.com/billing/budgets?project=aloitussivu-5d50c
   ```

2. Varmista, että projekti on `aloitussivu-5d50c`.
3. Valitse `Create budget`.
4. Anna budjetille nimi, esimerkiksi:

   ```text
   Aloitussivu kuukausibudjetti
   ```

5. Rajaa budjetti koskemaan projektia `aloitussivu-5d50c`.
6. Aseta budjetin summaksi:

   ```text
   10 EUR / kuukausi
   ```

7. Lisää hälytysrajat:
   - 50 %
   - 90 %
   - 100 %
8. Varmista, että ilmoitukset lähtevät oikeaan ylläpitosähköpostiin.
9. Tallenna budjetti.

### Gemini API -erillishälytys

Jos Google Cloud Billing antaa rajata budjetin tiettyyn palveluun:

1. Luo toinen budjetti.
2. Anna nimeksi:

   ```text
   Aloitussivu Gemini API
   ```

3. Rajaa palveluksi Gemini API, Generative Language API tai Vertex AI sen mukaan, missä kustannukset näkyvät.
4. Aseta budjetiksi:

   ```text
   5 EUR / kuukausi
   ```

5. Lisää hälytysrajat 50 %, 90 % ja 100 %.

### Valmis, kun

1. Google Cloud Billingissä näkyy aktiivinen `10 EUR / kuukausi` projektibudjetti.
2. Ilmoitukset lähtevät oikeaan ylläpitosähköpostiin.
3. Gemini APIlle on oma hälytys, jos palvelukohtainen rajaus oli saatavilla.
