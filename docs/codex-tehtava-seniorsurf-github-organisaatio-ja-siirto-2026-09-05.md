# GH-01…GH-08: SeniorSurfin GitHub-organisaatio ja CloudCity-julkaisupolku

Päiväys: 5.9.2026

Tila: Avoin

Prioriteetti: P1 ennen seuraavaa tuotantojulkaisua

## Tavoite

Siirretään `Eerotuomenoksa/Aloitussivu` henkilökohtaiselta GitHub-tililtä SeniorSurfin hallitsemaan GitHub-organisaatioon ja rakennetaan sen jälkeen hallittu GitHub Actions → CloudCity -julkaisupolku.

Valmis kokonaisuus täyttää seuraavat ehdot:

- repository ja tulevat projektit ovat SeniorSurfin organisaation omistuksessa;
- organisaatiolla on vähintään kaksi henkilökohtaista omistajatiliä;
- kaikilta jäseniltä vaaditaan turvallinen kaksivaiheinen tunnistautuminen;
- `main` on suojattu, GitHub Pages ei ole käytössä ja testit suoritetaan ennen yhdistämistä;
- staging- ja tuotantotunnukset on rajattu omiin GitHub-ympäristöihinsä;
- tuotantojulkaisu käynnistetään käsin ja vaatii hyväksynnän;
- CloudCity-julkaisu säilyttää palvelimella olevan `secrets/config.php`-tiedoston, tekee varmistuksen, aktivoi julkisen hakemiston atomisesti ja ajaa savukokeet;
- tietokanta- tai SSH-salaisuuksia ei tallenneta repositoryyn.

## Päätetty rakenne

SeniorSurfille luodaan **GitHub-organisaatio**, ei yhteistä henkilökohtaista käyttäjätiliä. Jokainen henkilö käyttää omaa GitHub-tunnustaan.

Ehdotettu organisaation tunnus on `SeniorSurf`. Jos se ei ole luontihetkellä saatavilla, varavaihtoehdot ovat `SeniorSurf-fi` ja `SeniorSurfFinland`.

Organisaation yhteystiedoksi asetetaan SeniorSurfin tai Vanhustyön keskusliiton hallitsema toiminnallinen sähköpostiosoite. Organisaation omistajuutta ei jätetä yhden henkilön varaan.

## GH-01: Organisaation perustaminen – Eero

- [ ] Avaa GitHubissa **Profile → Settings → Organizations → New organization**.
- [ ] Valitse aluksi GitHub Free; nykyinen Aloitussivu-repository on julkinen.
- [ ] Aseta organisaation nimeksi ensisijaisesti `SeniorSurf`.
- [ ] Aseta yhteyssähköposti, organisaation nimi, `https://seniorsurf.fi/` ja lyhyt kuvaus.
- [ ] Lisää organisaation logo ja perustiedot.
- [ ] Älä luo vielä tyhjää `Aloitussivu`-repositorya; siirtotoiminto luo sen.

Ohje: <https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/creating-a-new-organization-from-scratch>

## GH-02: Omistajat, oikeudet ja turvallisuus – Eero

- [ ] Kutsu vähintään toinen SeniorSurfin henkilö organisaation `Owner`-rooliin.
- [ ] Vaadi kaksivaiheinen tunnistautuminen kohdasta **Settings → Authentication security**.
- [ ] Salli vain turvalliset 2FA-menetelmät, kun kaikkien jäsenten valmius on tarkistettu.
- [ ] Aseta **Member privileges → Base permissions** arvoon `None`.
- [ ] Rajaa repositorioiden luonti, poistaminen, siirto ja näkyvyyden vaihto omistajille.
- [ ] Luo tarpeen mukaan tiimit `developers`, `aloitussivu-maintainers` ja `reviewers`.
- [ ] Anna repository-oikeudet ensisijaisesti tiimeille, ei irrallisina henkilökohtaisina poikkeuksina.
- [ ] Rajaa Actions GitHubin omiin tai erikseen hyväksyttyihin toimintoihin.
- [ ] Pidä Actionsin `GITHUB_TOKEN` oletuksena vain lukuoikeudella ja estä työnkulkuja hyväksymästä pull requesteja.

Ohjeet:

- <https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/best-practices-for-organizations>
- <https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-two-factor-authentication-for-your-organization/requiring-two-factor-authentication-in-your-organization>

## GH-03: Nykyisen työn tallentaminen ennen siirtoa – Eero ja Codex

Tilanne 5.9.2026:

- GitHub-repository on julkinen `Eerotuomenoksa/Aloitussivu`;
- oletushaara on `main`;
- paikallinen työ on haarassa `staging/lc-perf-01-parallel`;
- paikallisessa työpuussa on 54 muutettua tai uutta tiedostoa, jotka eivät siirry GitHubiin ennen commitointia ja pushia.

- [ ] Tarkista `git status` ja käy kaikki lisättävät tiedostot läpi.
- [ ] Varmista, ettei committiin tule `.env`-tiedostoja, `config.php`:ta, tietokantatunnuksia, tokeneita tai SSH-avaimia.
- [ ] Aja vähintään `npx tsc --noEmit`, `npm run build`, `npm run test:link-catalog`, `npm run test:link-policy`, `npm run test:rdap-cache` ja `npm run check:secrets`.
- [ ] Commitoi tarkistetut muutokset nykyiseen kehityshaaraan.
- [ ] Push `staging/lc-perf-01-parallel` nykyiseen GitHub-repositoryyn.

Repositorion voi teknisesti siirtää myös likaisella paikallisella työpuulla, eikä paikallinen työ silloin katoa. Ensin tehtävä commit ja push antaa kuitenkin varmimman palautuspisteen.

## GH-04: Aloitussivu-repositorion siirtäminen – Eero

- [ ] Avaa `Eerotuomenoksa/Aloitussivu` GitHubissa.
- [ ] Valitse **Settings → General → Danger Zone → Transfer ownership**.
- [ ] Aseta uudeksi omistajaksi vahvistettu SeniorSurfin organisaatiotunnus.
- [ ] Vahvista repositoryn nimi `Aloitussivu` ja hyväksy siirto.
- [ ] Älä luo vanhaan `Eerotuomenoksa/Aloitussivu`-osoitteeseen uutta samannimistä repositorya, jotta GitHubin uudelleenohjaus säilyy.

Siirron pitää säilyttää Git-historia, haarat, tagit, issuet, pull requestit, releaset, repository-salaisuudet, deploy keys -avaimet ja webhookit. GitHub Pages -osoite ei siirry, mutta Pages on jo poistettu käytöstä.

Ohje: <https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository>

## GH-05: Siirron jälkeinen tarkistus – Eero ja Codex

- [ ] Päivitä paikallinen remote, kun organisaation tarkka tunnus on tiedossa:

  ```powershell
  git remote set-url origin https://github.com/SeniorSurf/Aloitussivu.git
  git remote -v
  git fetch origin
  git ls-remote origin HEAD
  ```

- [ ] Varmista repositoryn näkyvyys, `main`-oletushaara, tiimit ja henkilöoikeudet.
- [ ] Tarkista repository secrets, deploy keys, webhookit ja Actions-asetukset siirron jälkeen.
- [ ] Varmista, että GitHub Pages on edelleen pois käytöstä.
- [ ] Päivitä README-, badge-, dokumentaatio- ja muut ulkoiset repositorylinkit uuteen osoitteeseen.

## GH-06: `main`-haaran suojaus ja CI – Codex, Eeron hyväksyntä

- [ ] Luo `main`-haaraan ruleset, joka estää force pushin ja haaran poistamisen.
- [ ] Vaadi pull request, onnistuneet tilatarkistukset ja keskustelujen ratkaiseminen ennen yhdistämistä.
- [ ] Vaadi yksi hyväksyntä, kun toinen tekninen hyväksyjä on nimetty.
- [ ] Korvaa nykyinen GitHub Pages -työnkulku `checks.yml`-tarkistustyönkululla.
- [ ] Varmista, ettei nykyisen `.github/workflows/deploy.yml`-tiedoston vanha `github-pages`-julkaisu tai GitHub Pages -referer jää käyttöön.

Ohje: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches>

## GH-07: GitHub-ympäristöt ja CloudCityn julkaisuavain – Eero

Luo repositoryyn **Settings → Environments**:

### `staging`

- [ ] Rajaa stagingin tunnukset vain staging-ympäristöön.
- [ ] Tallenna stagingin HTTP Basic Auth -tunnukset vain, jos Actions-savukokeet tarvitsevat niitä.
- [ ] Staging voidaan myöhemmin julkaista automaattisesti `main`-haaran päivityksestä.

### `production`

- [ ] Salli julkaisu vain `main`-haarasta tai hyväksytystä versiotagista.
- [ ] Aseta vaadituksi hyväksyjäksi toinen SeniorSurfin omistaja tai julkaisuvastaava.
- [ ] Luo CloudCityä varten erillinen SSH-avain; älä käytä henkilökohtaista SSH-avainta.
- [ ] Lisää julkinen avain CloudCityn hallintapaneeliin.
- [ ] Tallenna yksityinen avain vain `production`-ympäristön salaisuutena.
- [ ] Varmenna CloudCityn SSH-palvelimen host key -sormenjälki ennen `known_hosts`-arvon tallentamista.

Suunnitellut nimet, ei arvoja:

| Nimi | Tyyppi | Rajaus |
| --- | --- | --- |
| `CLOUDCITY_SSH_PRIVATE_KEY` | secret | production |
| `CLOUDCITY_HOST` | variable | production |
| `CLOUDCITY_USER` | variable | production |
| `CLOUDCITY_PORT` | variable | production |
| `CLOUDCITY_KNOWN_HOSTS` | variable tai secret | production |
| `STAGING_BASIC_AUTH_USER` | secret | staging |
| `STAGING_BASIC_AUTH_PASSWORD` | secret | staging |

Tietokannan salasanaa ja palvelimen `secrets/config.php`-sisältöä ei tallenneta GitHubiin. Firebase Web SDK:n julkiset `VITE_FIREBASE_*`-asetukset voidaan rajata repository- tai ympäristömuuttujiksi.

Ohjeet:

- <https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments>
- <https://tuki.cloudcity.fi/ohjeet/cloudcityn-hallintapaneeli/ssh-avaimet/>

## GH-08: GitHub Actions → CloudCity – Codex, Eeron hyväksyntä

- [ ] Tee `deploy-cloudcity.yml`, jonka tuotantoajo käynnistetään vain `workflow_dispatch`-toiminnolla.
- [ ] Käytä `production`-ympäristöä ja sen hyväksyntäporttia.
- [ ] Aja riippuvuuksien asennus, salaisuustarkistus, TypeScript-tarkistus, testit ja tuotantobuild.
- [ ] Muodosta olemassa olevalla `scripts/build-production-path-package.ps1`-skriptillä commit-tunnisteinen ZIP ja SHA-256.
- [ ] Siirrä ZIP CloudCityyn SFTP/SSH-yhteydellä ilman kolmannen osapuolen Actions-riippuvuutta.
- [ ] Tarkista palvelimella ZIPin SHA-256 ja `build-info.json` ennen purkamista.
- [ ] Ota varmistukset julkisesta hakemistosta, yksityisestä API-polusta ja tietokannasta ennen aktivointia.
- [ ] Säilytä olemassa oleva `secrets/config.php`; älä käytä `rsync --delete` -komentoa yksityiseen API-polkuun.
- [ ] Aja tarvittavat tietokantamigraatiot erillisellä hyväksytyllä vaiheella, ei huomaamatta jokaisen julkaisun yhteydessä.
- [ ] Aktivoi julkinen hakemisto atomisesti vasta palvelintarkistusten jälkeen.
- [ ] Aja tuotannon HTTP-savukokeet ja API-health-tarkistus.
- [ ] Palauta edellinen julkinen ja yksityinen versio automaattisesti tai ohjatusti, jos savukoe epäonnistuu.
- [ ] Kirjaa julkaistu commit, build ID, aika, tarkistustulokset ja mahdollinen palautus GitHub Deployment -historiaan ja projektin julkaisupäiväkirjaan.

Tuotantojulkaisua ei käynnistetä automaattisesti jokaisesta `main`-pushista. Staging voidaan automatisoida erikseen, mutta tuotanto vaatii aina tietoisen käynnistyksen ja hyväksynnän.

## Hyväksymiskriteerit

- [ ] `https://github.com/<SeniorSurf-organisaatio>/Aloitussivu` avautuu ja vanha repositoryosoite ohjaa sinne.
- [ ] Vähintään kaksi henkilöä on organisaation omistajia ja 2FA-vaatimus on voimassa.
- [ ] Paikallinen `origin` osoittaa SeniorSurfin repositoryyn ja fetch/push toimii.
- [ ] GitHub Pages on pois käytöstä eikä Pages-työnkulku enää käynnisty.
- [ ] Pull requestin tarkistukset estävät rikkinäisen muutoksen yhdistämisen `main`-haaraan.
- [ ] Tuotantojulkaisu ei saa SSH-avainta ennen GitHub-ympäristön hyväksyntää.
- [ ] Koepäivitys CloudCityyn, tuotannon savukokeet ja palautuskoe on dokumentoitu onnistuneiksi.
