# Firebase-määritysohje

Tämä ohje kertoo, miten Firebase otetaan käyttöön tässä Aloitussivu-projektissa.

## 1. Luo Firebase-projekti

1. Avaa https://console.firebase.google.com/
2. Valitse **Add project** / **Lisää projekti**.
3. Anna projektille nimi, esimerkiksi `seniorin-aloitussivu`.
4. Google Analytics ei ole tämän sovelluksen toiminnan kannalta pakollinen.
5. Luo projekti loppuun.

## 2. Lisää web-sovellus

1. Avaa luotu Firebase-projekti.
2. Valitse projektin etusivulta web-kuvake `</>`.
3. Anna sovellukselle nimi, esimerkiksi `Aloitussivu`.
4. Firebase Hostingia ei tarvitse ottaa tässä vaiheessa käyttöön.
5. Firebase näyttää lopuksi `firebaseConfig`-asetukset.

Tarvitset näistä arvot:

```ts
apiKey
authDomain
projectId
storageBucket
messagingSenderId
appId
```

## 3. Lisää asetukset `.env`-tiedostoon

Projektin juuressa on `.env.example`. Tee sen rinnalle tiedosto `.env` ja täytä arvot Firebase Consolesta:

```env
VITE_FIREBASE_API_KEY=oma_api_key
VITE_FIREBASE_AUTH_DOMAIN=oma_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=oma_project_id
VITE_FIREBASE_STORAGE_BUCKET=oma_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=oma_sender_id
VITE_FIREBASE_APP_ID=oma_app_id
```

Käynnistä kehityspalvelin uudelleen `.env`-muutosten jälkeen:

```bash
npm run dev -- --host 127.0.0.1
```

## 4. Ota Google-kirjautuminen käyttöön

1. Firebase Consolessa avaa **Authentication**.
2. Valitse **Get started**, jos Authentication ei ole vielä käytössä.
3. Avaa **Sign-in method**.
4. Ota käyttöön **Google**.
5. Lisää tukisähköpostiksi sama Google-tili, jolla projektia hallitaan.
6. Tallenna.

Tässä projektissa ylläpitäjäksi on määritelty:

```ts
eero.tuomenoksa@gmail.com
```

Vain tällä sähköpostilla kirjautunut käyttäjä voi lukea, hyväksyä ja muokata linkkiehdotuksia ylläpidossa.

## 5. Luo Firestore-tietokanta

1. Firebase Consolessa avaa **Firestore Database**.
2. Valitse **Create database**.
3. Valitse tuotantotila / production mode.
4. Valitse sopiva sijainti, esimerkiksi Euroopan alue.
5. Luo tietokanta.

Sovellus käyttää kokoelmia:

```text
linkReports
approvedLinks
```

Niitä ei tarvitse luoda käsin. Firestore luo kokoelmat, kun sovellus kirjoittaa ensimmäiset dokumentit.

## 6. Julkaise Firestore-säännöt

Projektissa on valmis sääntötiedosto:

```text
firestore.rules
```

Säännöt sallivat:

- linkkiehdotusten luomisen julkisesti kokoelmaan `linkReports`
- linkkiehdotusten lukemisen ja käsittelyn vain ylläpitäjälle
- hyväksyttyjen linkkien lukemisen kaikille
- hyväksyttyjen linkkien muokkaamisen vain ylläpitäjälle

Säännöt voi kopioida Firebase Consolessa:

1. Avaa **Firestore Database**.
2. Avaa **Rules**.
3. Korvaa sisältö projektin `firestore.rules`-tiedoston sisällöllä.
4. Paina **Publish**.

## 7. Testaa määritys

1. Käynnistä sovellus:

```bash
npm run dev -- --host 127.0.0.1
```

2. Avaa sovellus selaimessa.
3. Avaa ylläpitosivu:

```text
http://127.0.0.1:5173/yllapito.html
```

4. Kirjaudu Googlella.
5. Tarkista, ettei näkyviin tule ilmoitusta `Firebase ei ole määritetty`.

## 8. Yleisimmät ongelmat

Jos sovellus sanoo edelleen, että Firebase ei ole määritetty:

- varmista, että `.env` on projektin juuressa
- varmista, että kaikki pakolliset `VITE_FIREBASE_*`-arvot on täytetty
- käynnistä dev-palvelin uudelleen
- varmista, ettei arvojen ympärillä ole lainausmerkkejä tai ylimääräisiä välilyöntejä

Jos kirjautuminen ei onnistu:

- varmista, että Google-kirjautuminen on päällä Firebase Authenticationissa
- varmista, että kirjaudut ylläpitäjän sähköpostilla
- varmista, että Firebase-projektin `authDomain` on oikein `.env`-tiedostossa

Jos ylläpito avautuu mutta Firestore-tiedot eivät näy:

- varmista, että Firestore Database on luotu
- varmista, että `firestore.rules` on julkaistu
- tarkista selaimen konsolista mahdollinen `permission-denied`-virhe
