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
- Työtilan siirto: aktiivinen kehitysrepo on `C:\dev\Aloitussivu`, `main` vastaa `origin/main`-haaraa ja vanhasta työtilasta vaaditut tiedostot ovat GitHubissa.
- Vanhan OneDrive-kansion tyhjä `.git` ei enää muodosta Git-repoa, eikä kansiota käytetä aktiiviseen kehitykseen.
- Väliaikainen `scripts/set-admin-claims.mjs` ja `C:\temp\aloitussivu-adminsdk.json` on poistettu.
- Uusi kehityskansio on varmennettu 23.7.2026: salaisuustarkistus, tuotantobuild, Functions-paketin TypeScript-tarkistus ja kaikki 21 ulkoasutarkistusta menivät läpi.

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

## Ennen tuotantojulkaisua: manuaaliset integraatiotestit

Tila: Testattava ympäristössä, jossa testitunnukset ja palvelinyhteydet ovat käytettävissä

1. Gemini-chat vastaa.
2. Linkkiehdotuksen lähetys toimii.
3. Huijausvaroitukset latautuvat.
4. Admin-tili pääsee ylläpitoon.
5. Ei-admin ei pääse ylläpitoon.
