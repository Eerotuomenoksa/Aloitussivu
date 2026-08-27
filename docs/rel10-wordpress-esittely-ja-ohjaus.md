# REL-10: WordPress-esittely ja suora `/aloitus/`-julkaisu

Päivitetty 27.8.2026. Käyttäjän lopullinen osoite ja selaimen osoitepalkissa säilyvä osoite on `https://seniorsurf.fi/aloitus/`. Canonista polkua ei ohjata alidomainiin.

## Nykytila 25.8.2026

- `https://seniorsurf.fi/aloitus/` näyttää vielä WordPressin 404-sivun.
- Tuolloin suunniteltu `https://seniorsurf.fi/aloitussivu-palvelu/` näytti WordPressin 404-sivun. Tuotevastuu lyhensi esittelysivun osoitteeksi `https://seniorsurf.fi/aloitussivu/` 27.8.2026; uusi sivu ei ole vielä julkaistu.
- WordPressin tiedostoja, asetuksia, tietokantaa tai reititystä ei ole muutettu REL-10:ssä.

## WordPress-pohjan välitarkistus 27.8.2026

- `https://seniorsurf.fi/aloitussivu/` on julkaistu WordPress-sivuna ja palauttaa HTTP 200:n ilman osoitteen vaihtumista.
- Julkinen otsikko on **Seniorin aloitussivu**. Viisi hyväksyttyä esittelykappaletta sekä teksti **Avataan 1.9.2026** näkyvät sivun lähteessä.
- Sivulla ei vielä ole kuvaa eikä **Avaa Seniorin aloitussivu** -linkkiä. Kuvakaappaus- ja painiketestit ovat siksi avoinna.
- Ennen fyysisen sovellushakemiston käyttöönottoa `https://seniorsurf.fi/aloitus/` palauttaa WordPressin HTTP 301 -ohjauksen osoitteeseen `/aloitussivu/` (`X-Redirect-By: WordPress`). Tämä on lähtötila, ei hyväksytty lopputulos. Ohjauksen pitää poistua, kun fyysinen `/aloitus/`-hakemisto aktivoidaan; erillistä Redirection-sääntöä ei lisätä.
- WordPressin etusivu, kolme vertailusivua, julkinen haku, ylläpitokirjautumisen ohjaus ja vertailumedia läpäisivät vain lukevan välisavukokeen. Lopullinen WP-11 tehdään fyysisen `/aloitus/`-hakemiston jälkeen.

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
- polkutunnus: `aloitussivu`
- julkinen osoite: `https://seniorsurf.fi/aloitussivu/`
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

### Julkaisu WordPressin lohkoeditorissa

1. Valitse **Sivut → Lisää uusi sivu**.
2. Anna sivun otsikoksi **Seniorin aloitussivu – palvelun esittely**.
3. Aseta polkutunnukseksi `aloitussivu`. Esikatseluosoitteen pitää päättyä muotoon `/aloitussivu/`.
4. Lisää hyväksytty sisältö yllä olevassa järjestyksessä: **Otsikko**-lohko tasolla 2, viisi **Kappale**-lohkoa ja lopuksi **Painikkeet**-lohko.
5. Aseta painikkeen tekstiksi **Avaa Seniorin aloitussivu** ja linkiksi `https://seniorsurf.fi/aloitus/`. Linkkiä ei tarvitse avata uuteen välilehteen.
6. Varmista, että sivu on julkinen ja hakukonenäkyvyys on sallittu. Tarkista esikatselu sekä tietokoneen että puhelimen levyisessä näkymässä.
7. Julkaise sivu ja avaa julkinen osoite uloskirjautuneena. Varmista, että sivu palauttaa hyväksytyn sisällön ja että painike osoittaa täsmälleen `/aloitus/`-osoitteeseen.

Älä luo WordPress-sivua polkuun `/aloitus/` äläkä lisää tälle polulle Redirection-sääntöä. `/aloitus/` varataan fyysisessä hakemistossa julkaistavalle sovellukselle.

### Kuvakaappaustyölista esittelysivua varten

Kuvakaappaukset otetaan vasta puhtaasta hyväksytystä näkymästä. Niissä ei saa näkyä ylläpitoa, lomakevastauksia, tunnuksia, selaimen kirjanmerkkejä tai muuta henkilötietoa.

1. Ota sovelluksen etusivusta tietokonekuva 1440 × 900 pikselin näkymässä, vihreällä vaalealla oletusteemalla ja 100 prosentin tekstikoolla. Kunnaksi voi valita Tampereen, jotta Lähelläsi-osio näkyy julkisella testisisällöllä.
2. Ota samasta sovellusversiosta puhelinkuva 390 × 844 pikselin näkymässä. Varmista, ettei sisältö leikkaudu eikä kuvassa ole avointa modaalia.
3. Rajaa esittelysivulle käytettävä kuva niin, että palvelun nimi, haku ja vähintään yksi keskeinen sisältöalue näkyvät. Tallenna verkkoon optimoituna WebP- tai PNG-tiedostona ilman tarpeettomia metatietoja.
4. Lisää WordPress-kuvalle vaihtoehtoinen teksti: `Seniorin aloitussivun etusivu, jossa näkyvät haku ja arjen palvelut.` Älä laita olennaista ohjetekstiä vain kuvan sisään.
5. Kun WordPress-pohja on valmis, ota siitä tarkistuskuvat 1280 pikselin ja 390 pikselin leveydellä. Kuvissa pitää näkyä sivun otsikko, esittelyteksti, sovelluskuva ja **Avaa Seniorin aloitussivu** -painike.
6. Säilytä alkuperäiset tarkistuskuvat paikallisesti julkaisuportin ajan. WordPressiin ladataan vain hyväksytty esittelykuva; selainkehysten tai testitulosten kuvia ei julkaista.

## Valinnaiset kirjoitusvirheosoitteet

Vasta kun suora `/aloitus/`-osoite toimii, Redirection-lisäosalla voidaan ohjata esimerkiksi `/aloitusivu/`, `/aloittussivu/`, `/alotussivu/` ja `/alku/` suoraan osoitteeseen `/aloitus/`. Osoitetta `/aloitussivu/` ei käytetä alias-sääntönä, koska se kuuluu WordPressin esittelysivulle.

- testissä HTTP 302, julkaisussa HTTP 301
- kyselyparametrit välitetään kohteeseen
- ei säännöllistä lauseketta
- IP-osoitteiden tallennus pois käytöstä
- lähde `/aloitus/` ei kuulu alias-sääntöihin

## Testit ennen hyväksyntää

1. `https://seniorsurf.fi/aloitus/` palauttaa HTTP 200:n ilman ulkoista uudelleenohjausta ja osoitepalkki säilyy samana.
2. `https://seniorsurf.fi/aloitus/api/v1/health` palauttaa HTTP 200:n, sovelluksen tilan `ok` ja tietokannan tilan `up` sekä `Cache-Control: no-store` -otsakkeen.
3. Frontendin resurssit latautuvat `/aloitus/assets/`-polusta ja API-pyynnöt `/aloitus/api/v1`-polusta.
4. `https://seniorsurf.fi/aloitussivu/` palauttaa HTTP 200:n, ja **Avaa Seniorin aloitussivu** -linkki osoittaa suoraan `/aloitus/`-osoitteeseen.
5. Tarkoituksella puuttuva `/aloitus/`-osoite näyttää Aloitussivun oman 404-sivun eikä WordPressin 404-sivua.
6. WordPressin etusivu, Etäopastus, Ajankohtaista, Yhteystiedot, julkinen haku, kirjautumissivu ja vertailumedia toimivat kuten ennen muutosta.

## Palautus

Jos suora polku aiheuttaa virheen, julkinen `aloitus`-hakemisto siirretään pois WordPressin juuresta palautuspisteeseen ja WordPressin savukoe toistetaan. Yksityinen `/aloitus-production/`-hakemisto ei vaikuta WordPressin reititykseen. Mahdolliset kirjoitusvirheosoitteiden Redirection-säännöt poistetaan ensin käytöstä. WordPressin pääjuuren `.htaccess`-tiedostoa ei palauteta, koska sitä ei muuteta tässä toteutuksessa.
