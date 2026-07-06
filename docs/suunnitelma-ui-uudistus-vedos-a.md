# Toteutussuunnitelma: etusivun visuaalinen uudistus (vedos A, värivyöhykkeet)

Pohjana hyväksytty vedos `docs/ui-vedos-a-varivyohykkeet.html`. Tavoite: hajanaisesta laatikkoruudukosta yhtenäisiin värivyöhykkeisiin, isommat kuvakkeet ja tekstit, infotekstit aihealueille. Toiminnallisuus (haku, suosikit, modaalit, asetukset, kieliversiot) säilyy ennallaan — muutos on esitystavassa.

## Vaihe 1: Värijärjestelmä (index.css)

Lisätään 10 vyöhykeväriä CSS-muuttujina: 9 aihealuetta + Lähelläsi. Jokaisella neljä arvoa: `-bg` (pastellitausta), `-accent` (kuvakelaatta), `-border` ja `-strong` (tunnusväri, tekstikontrasti AA-tasolla). Kategoriaväri pysyy samana kaikissa neljässä väriteemassa (tunnistettavuus), mutta `html.dark`-tilaan tehdään tummennetut vastineet (esim. `#eaf1f9` → `#16242f`, strong-värit vaalennettuina). Tämä on uudistuksen ainoa kohta, jossa väärin tehty työ kostautuu myöhemmin, joten dark-parit tarkistetaan kontrastityökalulla heti.

## Vaihe 2: QuickLinks.tsx — vyöhykkeet ja sisällysvalikko

Suurin muutos. Bentoruudukko (`bento-grid`, `groupCardStyles`, pienet chipit) korvataan:

- `shortcutGroups`-taulukkoon lisätään kentät `description` (i18n-avain) ja `zone` (värimuuttujien etuliite).
- Jokainen ryhmä renderöidään `<section class="zone">`-vyöhykkeenä: iso kuvakelaatta (5.4rem), Cormorant-otsikko ~2.1rem, infoteksti, ja linkit isoina riveinä (min-korkeus 4.6rem, 2rem kuvake, nuoli oikealla). Rivit ovat nykyiset alakategoria-napit/-linkit — klikkauslogiikka (`onSelectCategory`, ProviderModal) ei muutu.
- Vyöhykkeiden ylle "Mitä etsit tänään?" -valikkokortti ankkurilinkkeineen (`#asiointi` jne. + `#lahellasi`). Pehmeä vieritys `scroll-behavior: smooth` + `scroll-margin-top`. Valikon Lähelläsi-chippi piilotetaan, jos alueelliset palvelut on kytketty pois asetuksista.
- Hakutulosnäkymä säilyy, mutta tuloskortit päivitetään samaan rivityyliin.
- `data-tour="quick-links"` ja muut ankkurit säilytetään, jotta opastuskierros toimii.

## Vaihe 3: Huijausvaroitus omaksi bannerikseen

`ScamAlertsBanner` irrotetaan RegionalServicesPanelin sisältä ja nostetaan App.tsx:ssä mainin ensimmäiseksi elementiksi (keltainen kaista, 3 px kultareunus, role="alert"). Asetusten `scamAlerts`-kytkin ohjaa jatkossa tätä. RegionalServicesPanelin `showScamAlerts`-propista luovutaan.

## Vaihe 4: FavoriteLinks.tsx — kultavyöhyke

Suosikit saavat oman vaalean kultataustan (`--theme-gold-pale`-pohjainen vyöhyke) ja opastetekstin "Lisää suosikki painamalla tähteä minkä tahansa linkin kohdalla". Muutos nykyiseen: vyöhyke näytetään opastetekstillä myös silloin, kun suosikkeja ei vielä ole (nykyisin komponentti palauttaa null) — tämä tekee ominaisuuden löydettäväksi. Pillerityyli on jo lähellä vedosta, vain mitat kasvavat.

## Vaihe 5: RegionalServicesPanel.tsx — Lähelläsi-vyöhyke

Paneeli puetaan vihreäksi `z-local`-vyöhykkeeksi samalla otsikkorakenteella kuin aihealueet (📍-laatta, "Lähelläsi · {kunta}", infoteksti). Kunnanvaihtokenttä kompaktiksi pillerimuotoon. Palvelulinkit samaan isoon rivityyliin kuin vyöhykkeissä. `LocalNewsHeadlines` siirtyy paneelin sisään valkoiseksi uutiskortiksi oikeaan palstaan (mobiilissa alle). Asetusten `regionalNews`-kytkin piilottaa vain uutiskortin.

## Vaihe 6: App.tsx — järjestys ja kuori

Main-järjestys: varoitus → suosikit → Lähelläsi → sisällysvalikko → vyöhykkeet. "Valitse palvelu" -otsikko (🌿) poistuu, valikkokortti korvaa sen. Header säilyy lähes ennallaan; vedoksen tervehdysteksti ("Hyvää päivää!") lisätään kellon alle pienenä lisänä.

## Vaihe 7: i18n.tsx — käännökset

Uudet avaimet: 9 aihealuekuvausta, valikko-otsikko, suosikkien opasteteksti, Lähelläsi-otsikko ja -infoteksti, tervehdykset (3). Yhteensä ~16 avainta × 7 kieltä (fi, sv, en, et, ru, uk, se). Teen käännösehdotukset kaikille kielille; pohjoissaamen ja ukrainan käännökset kannattaa tarkistuttaa kuten aiemminkin.

## Vaihe 8: Viimeistely ja tarkistukset

Mobiili (vyöhykkeet pinoutuvat, kuvakkeet 4.2rem, html 18px), tekstinsuurennos 50–200 % (vyöhykerivit joustavat, ei katkeavia sanoja), näppäimistönavigointi ja fokustyylit vyöhykeriveillä, dark mode kaikissa neljässä teemassa, `npm run build`. Lopuksi changelog-merkintä (`changelogData.ts`) ja versionosto (`appVersion.ts`); saavutettavuusseloste ei muutu, koska kontrastit paranevat.

## Ehdotettu järjestys ja laajuus

Vaiheet tehdään yllä olevassa järjestyksessä omaan git-haaraan (`ui-varivyohykkeet`). Vaiheet 1–2 ovat työläimmät (~puolet kokonaisuudesta), 3–6 pieniä, 7 mekaaninen mutta laaja, 8 tarkistuspäivä. Vanha bentotyyli poistetaan vasta lopuksi, jotta vertailu onnistuu kehityksen aikana.

## Riskit

Suurin riski on dark moden ja neljän väriteeman yhteispeli pastellivärien kanssa — siksi vaihe 1 tehdään ensin ja tarkistetaan kunnolla. Toinen huomio: infotekstit kasvattavat sivun pituutta, minkä sisällysvalikon ankkurit kompensoivat. Kolmas: käännösten laatu harvinaisemmilla kielillä.
