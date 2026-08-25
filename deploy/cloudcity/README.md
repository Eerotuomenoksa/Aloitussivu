# REL-07: Cloudcity-stagingin siirtopaketti

Paketti rakennetaan komennolla:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-rel07-staging-package.ps1
```

Tuloksena syntyy Gitistä ohitettuun `.tmp`-hakemistoon purettu tarkistuskansio ja ZIP-tiedosto. Paketti ei sisällä tietokantasalasanaa, Firebase ID-tokenia, Basic Auth -tunnuksia eikä valmista `secrets/config.php`-tiedostoa.

ZIP on tarkoitettu purettavaksi Cloudcityn staging-hakemistoon:

```text
/website.aloitussivu-staging/
  bootstrap.php
  src/
  cron/ncsc.php
  secrets/config.staging.example.php
  logs/
  cache/
  protected_uploads/
  public_html/
```

Pura ZIP niin, että `bootstrap.php`, `src`, `secrets` ja `public_html` tulevat suoraan
`/website.aloitussivu-staging/`-hakemiston alle. Ohjaa sen jälkeen staging-alidomain
hallintapaneelin **Ohjaa alikansioon** -toiminnolla alikansioon `public_html`.
`public_html` on staging-alidomainin ainoa julkinen hakemisto. Älä pura pakettia
WordPressin juureen `/website.wp33403/` äläkä ohjaa staging-alidomainia koko staging-hakemiston juureen.

Ennen API:n avaamista:

1. Kopioi palvelimella `secrets/config.staging.example.php` tiedostoksi `secrets/config.php` vain ensimmäisellä asennuskerralla. Älä korvaa olemassa olevaa oikeaa `config.php`-tiedostoa pakettipäivityksessä.
2. Täytä staging-tietokannan käyttäjä ja salasana repositorion ulkopuolella.
3. Korvaa `CHANGE_ME` vähintään 32 tavun satunnaisella rate limit -salaisuudella.
4. Aseta oikeudet: ympäristöhakemistot `750`, `secrets/config.php` ja lokitiedosto `640`.
5. Pidä `token_header` arvossa `x-firebase-id-token`, koska stagingin Basic Auth käyttää tavallista `Authorization`-otsaketta.
6. Varmista, että `logs`, `cache` ja `protected_uploads` eivät ole `public_html`-hakemiston sisällä.

REL-09:stä alkaen `cron/ncsc.php` sijoitetaan web-juuren ulkopuolelle ja sen hakemisto-oikeus on `750`, tiedosto-oikeus `640`. Cloudcityn **Aja PHP-skripti** -ajastus suorittaa kotihakemistoon suhteutetun tiedoston `website.aloitussivu-staging/cron/ncsc.php` arkipäivisin klo 11.30 ja 15.30 Europe/Helsinki-ajassa. Täsmälliset käyttöönotto-, testi- ja palautusvaiheet ovat `docs/rel09-tausta-ajot-ja-palautuskoe.md`-ohjeessa.

Stagingin pääjuuren `.htaccess` tekee HTTPS-ohjauksen, estää hakemistolistauksen, lisää stagingin `noindex`-rajauksen ja suojausotsikot, antaa hashatuille resursseille pitkän välimuistin sekä HTML:lle uudelleenvalidoinnin ja ottaa gzip-pakkauksen käyttöön, jos palvelinmoduuli on saatavilla. API:n oma `.htaccess` reitittää `/api/v1/*`-pyynnöt entrypointiin ja pakottaa API-vastaukset välimuistittomiksi.

Palautus tehdään poistamalla tai siirtämällä vain stagingin ympäristöjuureen viety Aloitussivun versio ja palauttamalla sitä edeltävä staging-paketti. WordPressin tiedostoja tai tietokantaa ei palauteta Aloitussivun staging-palautuksessa.
