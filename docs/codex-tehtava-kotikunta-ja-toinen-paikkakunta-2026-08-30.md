# Codex-tehtävä: kotikunnan kysyminen, asetus ja toinen paikkakunta

Päivitetty: 30.8.2026
Lähde: Eeron havainto ja päätös 30.8.2026
Koskee: `components/OnboardingTour.tsx`, `App.tsx`, `components/RegionalServicesPanel.tsx`, `i18n.tsx`
Liittyy: `docs/codex-tehtava-aloitussivu-ja-asennus-2026-08-30.md` (HS-01…HS-08)

## Miksi

Kotikunta on se yksi valinta, joka avaa suuren osan palvelun arvosta: paikalliset palvelut, uutiset, joukkoliikenne, kirjasto, hyvinvointialue ja sää. Ilman sitä käyttäjä näkee vain valtakunnalliset linkit.

**Mikään ei kuitenkaan kysy kuntaa.** Esittelykierroksen vaihe `regional-services` vain korostaa paneelin ja sanoo *"Valitse paikkakunta, niin saat paikalliset linkit"* — käyttäjän on itse löydettävä valitsin ja osattava käyttää sitä. Jos kierros on jo kertaalleen nähty, mikään ei ohjaa siihen enää.

Toinen havainto: kotikunta tallennetaan `localStorage`-avaimeen `locality` (`App.tsx:83`, `SAVED_LOCALITY_KEY`). **iOS:llä kotinäytön web-sovelluksella on oma erillinen tallennustila Safarista**, joten Safarissa valittu kunta ei seuraa mukaan, kun sivu lisätään kotinäyttöön. Androidilla Chromen kanssa se seuraa. Asennuksen jälkeen käyttäjä on siis iOS:llä samassa tilanteessa kuin ensikertalainen — ilman että mikään kysyy kuntaa.

## KK-01 · Kotikunta kysytään esittelykierroksessa (P1)

### Mitä tehdä

1. Muuta esittelykierroksen `regional-services`-vaihe korostuksesta **oikeaksi valintavaiheeksi**, samaan tapaan kuin nykyinen `kind: 'preferences'` -vaihe: uusi `kind: 'municipality'`, jossa on kuntavalitsin suoraan kierroksen kortissa.
2. Käytä samaa valitsinta kuin `RegionalServicesPanel` (`onLocalitySelected`-rajapinta on jo olemassa), älä tee toista toteutusta.
3. **Vaihetta ei saa pakottaa. Eero vahvisti tämän 30.8.2026: "voidaan ohittaa".** Selkeä "Ohita" tai "Valitsen myöhemmin" -painike samankokoisena kuin vahvistus. Kohderyhmässä pakotettu valinta, jota ei osaa tehdä, keskeyttää koko kierroksen.
4. Kun kunta on valittu, näytä vahvistus omalla rivillään: *"Valittu: Tampere. Näet nyt Tampereen palvelut, uutiset ja joukkoliikenteen."* Käyttäjän on nähtävä mitä valinta teki.
5. Sijoita vaihe **ennen** HS-08:n "Ota sivu käyttöön" -vaihetta, jotta kierros päättyy edelleen aloitussivukehotukseen.

### Hyväksymiskriteerit

- Kierroksen läpi kulkenut käyttäjä on joko valinnut kunnan tai ohittanut sen tietoisesti.
- Ohittaminen on yhtä helppoa kuin valitseminen.
- Valinta tallentuu samaan `locality`-avaimeen kuin ennenkin; uutta tallennuspaikkaa ei luoda.

## KK-02 · Kotikunta selkeästi Asetuksissa (P1)

### Mitä tehdä

Asetukset-paneelissa (`App.tsx`, `isSettingsOpen`) ei ole tällä hetkellä kotikunnan vaihtoa lainkaan — se onnistuu vain Lähelläsi-osion valitsimesta. Lisää Asetuksiin oma osio **"Kotikunta"**, jossa näkyy nykyinen valinta ja painike sen vaihtamiseen.

- Näytä nykyinen kunta tekstinä, ei pelkkänä pudotusvalikkona: *"Kotikunta: Tampere"* ja alla "Vaihda".
- Sama valitsinkomponentti kuin KK-01:ssä ja `RegionalServicesPanel`issa.
- Lisää myös "Tyhjennä kotikunta" -toiminto, jolla palaa valtakunnalliseen näkymään.

### Hyväksymiskriteerit

- Kotikunnan voi vaihtaa Asetuksista ilman että tarvitsee löytää Lähelläsi-osiota.
- Muutos näkyy heti sään, uutisten ja paikallisten palveluiden sisällössä.

## KK-03 · Toinen paikkakunta, esimerkiksi mökkipaikkakunta (P2)

### Miksi

Moni ikääntynyt viettää osan vuodesta toisella paikkakunnalla. Silloin sään, paikallisuutisten ja joukkoliikenteen pitäisi seurata mukana ilman että kotikunta pitää vaihtaa edestakaisin ja muistaa vaihtaa takaisin.

### Suositeltu ratkaisu: vaihto, ei rinnakkaisnäyttö

Kahden paikkakunnan tietojen näyttäminen yhtä aikaa kaksinkertaistaisi sivun sisällön ja tekisi siitä raskaan juuri sille käyttäjälle, jolle selkeys on tärkeintä. **Parempi on yksi aktiivinen paikkakunta ja selvä vaihtokytkin.**

1. Tallenna kaksi paikkakuntaa: `locality` (kotikunta, nykyinen avain säilyy ennallaan) ja uusi `secondaryLocality`. Aktiivisen valinnan tallentaa kolmas avain, esimerkiksi `activeLocalityKey`, arvoina `home` tai `secondary`.
2. Kun toinen paikkakunta on määritetty, näytä Lähelläsi-osion yläreunassa kaksi selkeää painiketta: **"Kotona: Tampere"** ja **"Mökillä: Kuhmoinen"**. Aktiivinen on korostettu. Ei pudotusvalikkoa — kaksi painiketta on kohderyhmälle helpompi kuin valikko.
3. Anna käyttäjän nimetä toinen paikkakunta itse (oletus "Mökillä", vaihtoehtoina esimerkiksi "Kesäpaikka" tai vapaa teksti). Nimi on käyttäjän oma, joten se saa olla mitä tahansa lyhyttä tekstiä — rajaa 20 merkkiin.
4. Toinen paikkakunta lisätään ja poistetaan **vain Asetuksista** (KK-02:n osion alta), jottei etusivulle tule lisää hallintaa.
5. Vaihdon on vaikutettava kaikkeen paikkakuntakohtaiseen kerralla: sää, paikallisuutiset, joukkoliikenne, palveluliikenne, kirjasto, hyvinvointialue ja opastuspaikat. Yksi `locality`-arvo ohjaa kaikkea jo nyt (`App.tsx:494` `regionalLocality`), joten muutos on keskitetty — älä hajota sitä komponenttikohtaiseksi.

### Rajaukset

- **Ei kolmatta paikkakuntaa.** Kaksi kattaa mökki- ja kaupunkiasumisen; kolmas tekisi käyttöliittymästä valikon.
- **Ei automaattista vaihtoa sijainnin perusteella.** Se yllättäisi käyttäjän ja vaatisi jatkuvaa paikannusta. Vaihto on aina käyttäjän oma painallus.
- **Ei mitään palvelimelle.** Molemmat paikkakunnat ovat `localStorage`ssa, kuten nykyinen kotikunta. Tämä pysyy käyttäjän omana asetuksena eikä muuta tietosuojaperustetta.

### Hyväksymiskriteerit

- Toisen paikkakunnan voi lisätä, nimetä, vaihtaa ja poistaa Asetuksista.
- Vaihto muuttaa kaiken paikallisen sisällön kerralla.
- Kun toista paikkakuntaa ei ole määritetty, käyttöliittymä näyttää täsmälleen nykyiseltä — ei ylimääräistä painiketta eikä valintaa.

## KK-04 · Asennetun sovelluksen tyhjä tallennustila (P2)

iOS:llä kotinäytön sovelluksella on oma `localStorage`, joten kotikunta ja perehdytyksen tila eivät seuraa Safarista. Käyttäjä kohtaa asennetun sovelluksen tyhjänä.

Vaihtoehdot, ratkaistava ennen HS-03:n asennuspainiketta:

1. **Yksinkertaisin:** anna perehdytyskierroksen käynnistyä normaalisti asennetussa sovelluksessa. KK-01:n jälkeen se kysyy kunnan, joten tilanne korjaantuu itsestään. **Tämä riittää todennäköisesti.**
2. Jos halutaan parempi: näytä asennuksen jälkeen kerran kevyt huomautus *"Tervetuloa. Valitse kotikuntasi, niin näet oman alueesi palvelut."* — mutta vain jos kuntaa ei ole.

**Älä** yritä siirtää asetuksia selaimesta sovellukseen. Se vaatisi palvelinpuolen tunnisteen tai käyttäjätilin, mikä on tälle palvelulle väärä suunta.

## Toteutusjärjestys

1. **KK-01** kotikunta esittelykierrokseen — suurin hyöty, pienin työ
2. **KK-02** kotikunta Asetuksiin
3. **KK-04** varmistus asennetulle sovellukselle (todennäköisesti pelkkä tarkistus, ei koodia)
4. **KK-03** toinen paikkakunta

Kohdat 1–2 kannattaa tehdä ennen laajaa tiedotusta. KK-03 on selkeä lisäominaisuus, joka sopii julkaisun jälkeiseen kierrokseen.
