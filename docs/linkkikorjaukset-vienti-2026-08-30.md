# Linkkikorjausten vienti tuotantoon — v0.77.2

Tämä käyttää Codexin rakentamaa REL-14-asennusputkea. Asennin ottaa varmuuskopiot itse, vaihtaa julkisen puun atomisesti ja **palauttaa tuotannon automaattisesti**, jos savukoe ei mene läpi. Migraatioita ei tarvita.

## Lähtötilanne

- Tuotannossa on `REL-14-v0.77.0-49cf755312e2`, tuntiajo `7 * * * *` aktiivinen, autoblock päällä.
- Julkaisuhaarassa `codex/rel14-production` odottaa **julkaisematon 0.77.1** eli Firebase-kirjautumisen korjaus tuotantobuildiin.
- Linkkikorjaukset on nyt viety samaan haaraan ja versio nostettu **0.77.2**:een.

Yksi vienti toimittaa siis molemmat: kirjautumiskorjauksen ja linkkikorjaukset. Erillistä `start-rel14-auth-hotfix.ps1`-ajoa ei enää tarvita.

## Mitä muuttuu

**113 osoitetta korvattu kahdeksassa datatiedostossa:**

- 49 kovaa 404:ää korjattu varmennettuun osoitteeseen. Kunnat ovat uudistaneet sivustonsa, ja museot ovat irtautuneet kaupunkien sivuilta omiin verkkotunnuksiin.
- 16 Helmet-kirjastoa sai kirjastokohtaisen osoitteen. Vanha yhteinen ohjaus vei ne kaikki samaan geneeriseen Finna-sivuun, joten mitatun ohjauskohteen käyttäminen olisi tuhonnut 16 erillistä linkkiä.
- 2 kuollutta Fredrika-kirjastojen osoitetta korvattu Kruunupyyn ja Uudenkaarlepyyn omilla kirjastosivuilla.
- 24 vanhentunutta ohjausta päivitetty suoraan uuteen osoitteeseen, jotta linkki ei katkea kun ohjaus joskus poistetaan.
- Kausisidonnaiset osoitteet (`syksy-2025`, `2024-2025`, `kesaliikunta`) vaihdettu pysyviin yläsivuihin.

**5 riviä poistettu, koska luotettavaa korvaajaa ei ole:**

| Rivi | Peruste |
| --- | --- |
| Juuka englanniksi | Kunta ei enää julkaise englanninkielistä sivustoa. |
| Juuka venäjäksi | Ei venäjänkielistä sisältöä. Polku `/ru` avaa nykyään suomenkielisen ruokapalvelusivun, mikä on käyttäjälle harhaanjohtavaa. |
| Tyrnävä englanniksi | Osoite ohjautuu sisällönhallintajärjestelmän kirjautumissivulle. |
| Ähtäri asiointiliikenne | Palvelu on lakannut; ei sivua reiteille eikä tilausnumerolle. |
| Pudasjärvi asiointiliikenne | Sama tilanne. |

Linkkiluettelo pienenee 2 386 osoitteesta 2 376:een: viisi riviä poistui ja muutama eri vanha osoite osoittaa nyt samaan uuteen kohteeseen. Asennin päivittää myös yksityisen `data/link-catalog.json`-tiedoston, jotta tuntiajo tarkistaa uudet osoitteet eikä vanhoja.

## 1. Valmistelu worktreessä

Kaikki tapahtuu julkaisuhaaran worktreessä, ei pääkansiossa.

```powershell
cd C:\dev\Aloitussivu\.tmp\rel14-release-worktree
Remove-Item apply-linkfix.py, apply-removals.py -ErrorAction SilentlyContinue
```

Jos `node_modules` puuttuu worktreestä, tee liitos pääkansion hakemistoon. Junction ei vaadi järjestelmänvalvojan oikeuksia.

```powershell
if (-not (Test-Path node_modules)) {
    cmd /c mklink /J node_modules C:\dev\Aloitussivu\node_modules
}
```

Tarkista mikä on muuttunut. Odotettu tulos: kahdeksan datatiedostoa, `appVersion.ts`, `package.json`, `package-lock.json` ja kolme uutta dokumenttia.

```powershell
git status --porcelain
```

## 2. Tarkistukset

```powershell
node node_modules\typescript\lib\tsc.js --noEmit -p tsconfig.json
node scripts\link-url-policy-test.mjs
node scripts\link-catalog-test.mjs
node scripts\check-no-hardcoded-secrets.mjs
php api\tests\run.php
```

Odotettu: TypeScript ilman virheitä, `{"status":"ok",...}`, `link-catalog-test=PASS links=2376`, salaisuustarkistus ilman löydöksiä, ja `61 tests, 0 failures`.

Nämä kaikki on ajettu valmiiksi tästä sisällöstä: TypeScript PASS, URL-käytäntö PASS, linkkiluettelo 2 376 osoitetta, API-testit 61/61 ja PHP-lint puhdas. Toistaminen on silti halpaa ja kannattaa.

## 3. Commit ja paketointi

Paketointiskripti kieltäytyy, jos työpuu ei ole puhdas.

```powershell
git add -A
git commit -m "fix: korjaa 63 rikkinaista linkkia, 5 kuollutta verkkotunnusta ja 24 vanhentunutta ohjausta"
git status --porcelain
```

Viimeinen komento ei saa tulostaa mitään.

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build-production-path-package.ps1 -FirebaseEnvFile C:\dev\Aloitussivu\.env.local
```

**Älä käytä `npm.cmd run package:production-path` tässä.** Codexin 0.77.1-korjaus muutti paketointiskriptiä niin, että Firebase-julkiasetukset on annettava eksplisiittisesti tiedostona — juuri niiden puuttuminen buildista rikkoi ylläpidon kirjautumisen versiossa 0.77.0. Tiedosto `.env.local` on `.gitignore`ssa eikä siksi ole worktreessä, joten se osoitetaan pääkansioon `-FirebaseEnvFile`-parametrilla. npm-skripti ei välitä parametreja, joten se kaatuisi virheeseen `Firebase-julkiasetusten tiedostoa ei löydy`.

Skripti rakentaa Cloudcity-buildin, varmentaa Firebase-avaimen verkossa tuotannon referer-osoitteella, muodostaa linkkiluettelon uudelleen ja tarkistaa itse, että työpuu on puhdas ja bundlessa on `/aloitus/api/v1`. Verkkoyhteys tarvitaan.

Vaihtoehtoisesti voit kopioida asetustiedoston worktreehen kertaluontoisesti, jolloin npm-skripti toimii. Tällöin tiedostoja on kaksi ja ne voivat erkaantua, joten parametri on parempi:

```powershell
Copy-Item C:\dev\Aloitussivu\.env.local C:\dev\Aloitussivu\.tmp\rel14-release-worktree\.env.local
```

## 4. Vienti

```powershell
cd C:\dev\Aloitussivu\.tmp\rel14-deploy
.\start-rel14-linkkikorjaukset.ps1
```

Skripti laskee paketin SHA-256:n itse, lukee `build-info.json`:sta build-tunnisteen, tarkistaa että versio on 0.77.2 ja työpuu oli puhdas, siirtää paketin ja asentimen palvelimelle ja käynnistää asennuksen. SSH-salasana kysytään kahdesti, siirrolle ja asennukselle erikseen.

Jos haluat ajaa asennuksen käsin jo avoimessa SSH-istunnossa:

```powershell
.\start-rel14-linkkikorjaukset.ps1 -UploadOnly
```

Skripti tulostaa tällöin valmiin komennon ympäristömuuttujineen.

## 5. Mitä asennin tekee

1. Tarkistaa paketin SHA-256:n, purkaa sen erilliseen ehdokashakemistoon ja varmistaa build-tunnisteen, version, tiedostot ja että oikea `config.php` **ei** ole paketissa.
2. Varmistaa että ehdokkaan linkkiluettelossa on 2 300–2 600 osoitetta. Näin puutteellinen katalogi ei pääse tuotantoon.
3. Lukee pääbundlen nimen ehdokkaan `index.html`-tiedostosta — sitä ei ole kovakoodattu, joten asennin toimii myös seuraavassa julkaisussa.
4. Ottaa varmuuskopiot: julkinen puu tar-pakettiin ja nykyinen `link-catalog.json` rollback-hakemistoon.
5. Vaihtaa julkisen puun kahdella `mv`-komennolla ja kopioi uuden linkkiluettelon.
6. Ajaa savukokeen: health, etusivu, pääbundle sekä `linkit.html` ja `yllapito.html`. Jos yksikin epäonnistuu, se palauttaa julkisen puun **ja** linkkiluettelon ja tulostaa `activation_rolled_back reason=...`.

Onnistunut ajo päättyy riviin `LINKS_STATUS=PASS`. Talleta tulostuvat `CODE_BACKUP`, `CATALOG_BACKUP` ja `ROLLBACK`.

`secrets/`, `logs/`, `cache/`, `protected_uploads/` ja tietokanta jäävät koskematta. Asennin tulostaa lopuksi `PRIVATE_API_CHANGED=false` ja `DATABASE_CHANGED=false`.

## 6. Vienninjälkeinen tarkistus

Asennin ajaa tekniset kokeet itse. Nämä kannattaa katsoa käsin:

```bash
/opt/alt/php84/usr/bin/php /home/seniorsurffi/aloitus-production/cron/link-check.php; echo
```

Ensimmäisellä ajolla työ havaitsee linkkiluettelon tarkistesumman muuttuneen ja synkronoi katalogin uudelleen. Vanhat osoitteet jäävät tauluun tilaan `catalog_active = 0` eikä niitä enää tarkisteta. Odotettu `status` on `completed`.

Selaimessa:

- `https://seniorsurf.fi/aloitus/linkit.html` — hae **Sellon kirjasto** ja **Oulun taidemuseo** ja avaa molemmat.
- Kirjaudu ylläpitoon ja varmista että Google-kirjautuminen toimii. Tämä on 0.77.1:n korjaus, joka menee samalla tuotantoon.

Muutaman päivän päästä kannattaa katsoa ylläpidon **Automaattinen linkkitarkistus** -näkymästä, ettei automaattinen esto ole piilottanut mitään yllättävää. `auto:domain_for_sale` on ainoa sisältöön perustuva sääntö, ja väärä positiivinen piilottaisi toimivan linkin hiljaisesti.

## 7. Palautus käsin

Asennin palauttaa itse, jos savukoe kaatuu. Jos vika löytyy vasta myöhemmin, käytä asentimen tulostamia polkuja:

```bash
(
  set -eu
  ROLLBACK=KORVAA_ROLLBACK_POLULLA
  PUB=/home/seniorsurffi/website.wp33403/aloitus
  CATALOG=/home/seniorsurffi/aloitus-production/data/link-catalog.json
  test -d "$ROLLBACK/wordpress_aloitus"
  mv -- "$PUB" "$ROLLBACK/manual_failed_wordpress_aloitus"
  mv -- "$ROLLBACK/wordpress_aloitus" "$PUB"
  cp -p -- "$ROLLBACK/link-catalog.json" "$CATALOG"
  chmod 640 "$CATALOG"
  curl -fsS --max-time 20 https://seniorsurf.fi/aloitus/ >/dev/null && printf 'MANUAL_ROLLBACK=PASS\n'
)
```

Tietokantaan ei kosketa. Migraatiot 005 ja 006 jäävät paikalleen.

## Jälkitöitä

1. **Julkaisuhaara pitää yhdistää mainiin.** Tuotannon koodi on haarassa `codex/rel14-production`, ja `main` on yhä commitissa `60e7e73` eli versiossa 0.76.1. Pääkansion työpuussa on lisäksi noin 280 committoimatonta muutosta. Tämä kannattaa siivota ennen seuraavaa julkaisua, ettei kukaan vahingossa rakenna paketista väärää sisältöä.
2. **`seniorSurfGuidancePlaces.ts` on tilannekuva SeniorSurfin WordPress-rajapinnasta** `https://seniorsurf.fi/wp-json/locations/v1/`. Kolmisenkymmentä tämän julkaisun korjauksesta on siinä tiedostossa, ja ne katoavat jos tiedosto generoidaan uudelleen. Oikea korjaus kuuluu SeniorSurfin omaan dataan.
3. **Viisi osoitetta jäi varmistamatta selaimella:** Lappeenrannan sovellettu liikunta (JavaScript-renderöity, sisältöä ei pystynyt lukemaan), Kiuruveden palveluliikenne, Valkeryn digineuvonta, Tuulensuun palvelukeskus ja Paraisten neuvontasivu. Kolme jälkimmäistä jätettiin ennalleen.
4. **Vöyrin kirjasto osoittaa nyt englanninkieliselle sivulle**, koska ruotsinkielistä ei saatu varmennettua. Kaksikielisessä kunnassa ruotsi olisi oikea valinta.
5. **Kausisidonnaiset osoitteet ovat oma vikatyyppinsä.** Ne toimivat lisäyshetkellä ja hajoavat vuodessa. Kannattaa muistaa uusia linkkejä lisättäessä.
6. Julkaisupäiväkirjaan kirjataan LC-02:n ja LC-04:n ennen- ja jälkeen-luvut ensimmäisen täyden tuotantokierroksen jälkeen.

## Lähdeaineisto

- `docs/linkit-404-korvaajat-2026-08-30.md` — kaikki 58 korvaajaa perusteluineen
- `docs/linkit-korjauslistan-tilanne-2026-08-30.md` — korjauslistan tilanne kategorioittain
- `docs/codex-tarkistus-linkkitarkistus-2026-08-30.md` — linkkitarkistuksen koodikatselmointi
- `.tmp/rel14-deploy/install-rel14-linkkikorjaukset.sh` — palvelimen asennin
- `.tmp/rel14-deploy/start-rel14-linkkikorjaukset.ps1` — PowerShell-käynnistin
