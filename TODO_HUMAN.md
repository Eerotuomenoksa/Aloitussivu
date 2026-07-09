# TODO_HUMAN

Tässä tiedostossa on jäljellä oleva siivous- ja tarkistuslista. Varsinaiset manuaaliset tietoturvakohdat on tehty, paitsi nimipäivädataan liittyvä SEC-015, joka tehdään aikaisintaan elokuussa 2026.

Älä kirjoita salasanoja, API-avaimia, tokeneita tai service account -avainten sisältöjä tähän tiedostoon.

## Heinäkuu 2026: päätökset ennen elokuun viimeistelyä

Tila: Päätettävä ennen elokuun aloituspakettia

Päätöslista on koottu tiedostoon `docs/julkaisun-paatoslista-2026-07-08.md`. Käy vähintään nämä läpi ennen varsinaista viimeistelyä:

1. Virallinen nimi.
2. Lopullinen osoite tai julkaisupolku.
3. Palvelinmalli: Cloudcity, Firebase Hosting välivaiheena tai muu tuotantomalli.
4. Ylläpidon sähköposti-ilmoitusten vastaanottajat ja toteutustapa.
5. Nimipäivätoiminnon tuotantomalli: tiedostopohjainen data tai piilotus.
6. Julkaisuun kuulumattomien linkkien ja ylläpitolinkkien kohtalo.
7. Päätös siitä, mitkä Office- ja muut päätösaineistot lisätään versionhallintaan. Lighthouse-aineisto pidetään paikallisena eikä viedä GitHubiin.

## Tehty

- SEC-001: Gemini- ja admin-salaisuudet on uusittu ja `npm run check:secrets` on mennyt läpi.
- SEC-002: Repo on kloonattu OneDriven ulkopuolelle kansioon `C:\dev\Aloitussivu`.
- SEC-003: Selainpuolen Firebase API -avain on rajattu.
- SEC-009: Firebase Custom Claims on asetettu admin-tileille.
- SEC-010: Kaksivaiheinen tunnistautuminen on käytössä admin-tileillä.
- SEC-011: Google Cloud -budjettihälytykset on asetettu.

## SEC-015: Nimipäivätiedosto ja vanhan tokenin poisto

Tila: Siirretty myöhemmäksi, aikaisintaan elokuussa 2026

Nykyinen nimipäivätoteutus ja nykyinen `NAMEDAY_API_TOKEN` pidetään käytössä siihen asti. Älä poista tokenia vielä.

Elokuussa 2026 tai myöhemmin:

1. Hanki vuoden 2026 nimipäivädata CSV- tai JSON-muodossa.
2. Muunna data muotoon, jossa avain on `KK-PP`:

   ```json
   {
     "01-01": ["Uudenvuodenpäivä"],
     "01-02": ["Aapeli"],
     "01-03": ["Elma", "Elmeri"]
   }
   ```

3. Tallenna tiedosto polkuun `assets/namedays-2026.json`.
4. Testaa, että tämän päivän nimipäivä näkyy etusivulla oikein.
5. Peruuta vanha `NAMEDAY_API_TOKEN` nimipaivarajapinta.fi-palvelussa.
6. Poista Firestoresta `adminStats/namedayApi`, jos sitä ei enää päivitetä.
7. Lisää muistutus joulukuulle 2026: päivitä `assets/namedays-2026.json` -> `assets/namedays-2027.json`.

## Elokuu 2026: ylläpidon sähköposti-ilmoitukset

Tila: Lisätty elokuun todo-listalle

Selvitä Cloudcityn Pro-tilin sähköpostimahdollisuudet ja päätä, millä tavalla ylläpito saa viestin uusista todo-asioista.

Toteutuksessa huomioitavaa:

1. Lähetys tehdään vain palvelinpuolelta, esimerkiksi Cloud Functionista tai Cloudcityn backendistä.
2. SMTP-tunnuksia tai API-avaimia ei lisätä frontendin `.env`-tiedostoihin tai versionhallintaan.
3. Mahdolliset salaisuudet tallennetaan Secret Manageriin, Cloudcityn ympäristömuuttujiin tai muuhun palvelinpuolen salaisuuksien hallintaan.
4. Ensimmäinen ilmoitustyyppi voi olla uusi linkki-ilmoitus ylläpitoon.
5. Myöhemmin mukaan voi lisätä huijausvaroitusten automaation nollatulokset, nimipäivärajapinnan käyttörajan lähestymisen ja käyttötilastojen päivittymättömyyden.
6. Jos ilmoituksia tulee paljon, käytä päivittäistä koontia yksittäisten sähköpostien sijaan.

## Nyt tehtävä siivous ennen siirtymistä C:\dev-kansioon

### 1. Vie vanhan OneDrive-kansion paikallinen työ GitHubiin

Vanha kansio on vielä `origin/main`-haaraa edellä paikallisilla commiteilla. Älä poista vanhaa kansiota ennen kuin nämä muutokset on viety GitHubiin.

Vanhassa kansiossa:

```powershell
cd "C:\Users\eero.tuomenoksa\OneDrive - Vanhustyön keskusliitto ry\Tiedostot\GitHub\Aloitussivu"
git status --short --branch
```

Tarkista, että mukana ovat vähintään nämä tarkoitukselliset muutokset:

- `TODO_HUMAN.md`
- `components/QuickLinks.tsx`
- `i18n.tsx`
- `docs/paivan-mietelauseet-ehdotus.csv`
- tietoturva-auditin dokumentit, jos haluat säilyttää ne GitHubissa

Kun muutokset näyttävät oikeilta:

```powershell
git add TODO_HUMAN.md components/QuickLinks.tsx i18n.tsx docs/paivan-mietelauseet-ehdotus.csv docs/codex-tietoturva-toimenpiteet.md docs/tietoturva-arvio-2026-05-27.md
git commit -m "chore: update manual security checklist and homepage groups"
git push origin main
```

Jos commit ei synny, koska osa muutoksista on jo commitoitu, aja silti:

```powershell
git push origin main
```

### 2. Päivitä uusi C:\dev-kansio GitHubista

Kun vanhan kansion push on valmis:

```powershell
cd C:\dev\Aloitussivu
git pull origin main
```

### 3. Poista väliaikainen admin-claims-skripti uudesta kansiosta

Uudessa kansiossa näkyi väliaikainen skripti:

```text
C:\dev\Aloitussivu\scripts\set-admin-claims.mjs
```

Poista se, koska sitä ei pidä jättää projektiin:

```powershell
cd C:\dev\Aloitussivu
Remove-Item scripts\set-admin-claims.mjs
```

Varmista myös, että service account -avain on poistettu:

```powershell
Test-Path C:\temp\aloitussivu-adminsdk.json
```

Jos komento palauttaa `True`, poista tiedosto:

```powershell
Remove-Item C:\temp\aloitussivu-adminsdk.json
```

### 4. Varmista uusi kehityskansio

Uudessa kansiossa:

```powershell
cd C:\dev\Aloitussivu
npm run check:secrets
npm run build
cd functions
npx tsc --noEmit
cd ..
```

### 5. Testaa selaimessa

Käy läpi:

1. Etusivu aukeaa.
2. 9 pääkategorian ruudukko näkyy tasaisena.
3. Gemini-chat vastaa.
4. Linkkiehdotuksen lähetys toimii.
5. Huijausvaroitukset latautuvat.
6. Admin-tili pääsee ylläpitoon.
7. Ei-admin ei pääse ylläpitoon.

### 6. Käytä jatkossa vain uutta kansiota

Jatkossa aktiivinen kehityskansio on:

```text
C:\dev\Aloitussivu
```

Älä tee uusia muutoksia vanhassa OneDrive-kansiossa.
