# REL-10: WordPress-esittely ja suora `/aloitus/`-julkaisu

Päivitetty 25.8.2026. Käyttäjän lopullinen osoite ja selaimen osoitepalkissa säilyvä osoite on `https://seniorsurf.fi/aloitus/`. Canonista polkua ei ohjata alidomainiin.

## Nykytila 25.8.2026

- `https://seniorsurf.fi/aloitus/` näyttää vielä WordPressin 404-sivun.
- `https://seniorsurf.fi/aloitussivu-palvelu/` näyttää vielä WordPressin 404-sivun.
- WordPressin tiedostoja, asetuksia, tietokantaa tai reititystä ei ole muutettu REL-10:ssä.

## Hyväksytty tuotantorakenne

```text
https://seniorsurf.fi/aloitus/
  -> /home/seniorsurffi/website.wp33403/aloitus/
     vain julkinen frontend, .htaccess ja api-entrypoint

/home/seniorsurffi/aloitus-production/
  bootstrap.php, src, cron, secrets, logs, cache, protected_uploads
  ei julkista osoitetta
```

- Frontend käyttää tuotannossa saman originin osoitetta `/aloitus/api/v1`.
- API poistaa ulkoisen `/aloitus`-etuliitteen ennen sisäistä `/api/v1`-reititystä.
- Staging säilyy osoitteessa `https://staging.aloitussivu.seniorsurf.fi/` ja käyttää edelleen juuritason `/api/v1`-reittejä.
- WordPressin pääjuuren `.htaccess`-tiedostoa ei muuteta. Olemassa olevan fyysisen `aloitus`-hakemiston pitää ohittaa WordPressin normaali etusäädin; tämä varmennetaan ennen tuotantojulkaisua ja sen jälkeen.
- `Redirection`-lisäosaan ei tehdä sääntöä lähteelle `/aloitus/`, koska se vaihtaisi käyttäjän osoitteen tai voisi aiheuttaa silmukan.

## WordPress-esittelysivu

Luo WordPressiin tavallinen julkinen sivu seuraavilla tiedoilla:

- otsikko: **Seniorin aloitussivu – palvelun esittely**
- polkutunnus: `aloitussivu-palvelu`
- julkinen osoite: `https://seniorsurf.fi/aloitussivu-palvelu/`
- hakukonenäkyvyys: sallittu

### Hyväksytty sisältö 26.8.2026

> ## Seniorin aloitussivu
>
> Seniorin aloitussivu kokoaa arjen tärkeät verkkopalvelut yhteen selkeään näkymään. Palvelu on tarkoitettu erityisesti ikääntyneille ja digiopastuksen tueksi.
>
> Seniorin aloitussivun voi tallentaa selaimen aloitussivuksi tai asettaa selaimen asetuksista avautumaan automaattisesti selainta käynnistettäessä.
>
> Sivulta löytyvät Google-haku ja palveluhaku, julkisia ja muita arjen palveluita, tärkeitä puhelinnumeroita sekä käyttäjän valitseman kotikunnan paikallisia palveluita.
>
> Tekstikokoa voi suurentaa ja värimaailman voi valita itselleen sopivaksi. Palvelu on mainokseton ja sitä voi käyttää ilman kirjautumista.
>
> Seniorin aloitussivua kehitetään käyttäjäpalautteen perusteella. Sivulla voi antaa palautetta sekä ilmoittaa puuttuvasta tai toimimattomasta linkistä.
>
> **[Avaa Seniorin aloitussivu](https://seniorsurf.fi/aloitus/)**

Linkin näkyvän tekstin pitää kuvata kohde. Älä käytä pelkkää tekstiä ”Klikkaa tästä”.

SeniorSurf-tuotevastuu hyväksyi sisällön 26.8.2026. Eero Tuomenoksa luo ja julkaisee esittelysivun itse WordPressissä ennen REL-11-julkaisuporttia.

## Valinnaiset kirjoitusvirheosoitteet

Vasta kun suora `/aloitus/`-osoite toimii, Redirection-lisäosalla voidaan ohjata esimerkiksi `/aloitussivu/`, `/aloitusivu/`, `/aloittussivu/`, `/alotussivu/` ja `/alku/` suoraan osoitteeseen `/aloitus/`.

- testissä HTTP 302, julkaisussa HTTP 301
- kyselyparametrit välitetään kohteeseen
- ei säännöllistä lauseketta
- IP-osoitteiden tallennus pois käytöstä
- lähde `/aloitus/` ei kuulu alias-sääntöihin

## Testit ennen hyväksyntää

1. `https://seniorsurf.fi/aloitus/` palauttaa HTTP 200:n ilman ulkoista uudelleenohjausta ja osoitepalkki säilyy samana.
2. `https://seniorsurf.fi/aloitus/api/v1/health` palauttaa HTTP 200:n, sovelluksen tilan `ok` ja tietokannan tilan `up` sekä `Cache-Control: no-store` -otsakkeen.
3. Frontendin resurssit latautuvat `/aloitus/assets/`-polusta ja API-pyynnöt `/aloitus/api/v1`-polusta.
4. `https://seniorsurf.fi/aloitussivu-palvelu/` palauttaa HTTP 200:n, ja **Avaa Seniorin aloitussivu** -linkki osoittaa suoraan `/aloitus/`-osoitteeseen.
5. Tarkoituksella puuttuva `/aloitus/`-osoite näyttää Aloitussivun oman 404-sivun eikä WordPressin 404-sivua.
6. WordPressin etusivu, Etäopastus, Ajankohtaista, Yhteystiedot, julkinen haku, kirjautumissivu ja vertailumedia toimivat kuten ennen muutosta.

## Palautus

Jos suora polku aiheuttaa virheen, julkinen `aloitus`-hakemisto siirretään pois WordPressin juuresta palautuspisteeseen ja WordPressin savukoe toistetaan. Yksityinen `/aloitus-production/`-hakemisto ei vaikuta WordPressin reititykseen. Mahdolliset kirjoitusvirheosoitteiden Redirection-säännöt poistetaan ensin käytöstä. WordPressin pääjuuren `.htaccess`-tiedostoa ei palauteta, koska sitä ei muuteta tässä toteutuksessa.
