# Korvaavat osoitteet 58 rikkinäiselle linkille — 30.8.2026

Lähtökohta: `docs/linkit-korjauslistan-tilanne-2026-08-30.md`, luokka "kova 404".
Menetelmä: kuusi rinnakkaista hakua. Jokainen ehdokas avattiin ja sen sisältö luettiin — pelkkä HTTP 200 ei riittänyt hyväksynnäksi.
Peruste tälle vaatimukselle: `eetu.fi` ja `pah.fi` vastasivat aikanaan normaalisti mutta olivat verkkotunnusten kauppapaikkoja.

## Tulos

| | Määrä |
| --- | ---: |
| Varmennettu korvaaja | 49 |
| Toimii nyt sellaisenaan (ei muutosta) | 1 |
| Korvaaja löytyi mutta jäi varmentamatta | 1 |
| Ei luotettavaa korvaajaa | 7 |
| **Yhteensä** | **58** |

Seitsemän joukossa on kaksi eri tapausta: palvelu on lakannut (Ähtärin ja Pudasjärven asiointiliikenne, Eläkeliiton kerhosivu, Juuan vieraskieliset sivut), tai sivu on olemassa mutta tarkistin ei päässyt lukemaan sitä (Kiuruvesi, Tuulensuu, Valkery). Jälkimmäiset kannattaa katsoa selaimella ennen poistoa.

## Museot ja kulttuurikohteet — `communityLinks.ts`

| Nimi | Vanha osoite | Uusi osoite | Peruste |
| --- | --- | --- | --- |
| Hämeen linna | `https://www.hameenlinna.fi/hameenlinna` | [kansallismuseo.fi](https://www.kansallismuseo.fi/fi/haemeenlinna) | Linna on Museoviraston kohde, ei kaupungin. Aukioloajat, hinnat ja näyttelyt varmistettu. |
| Hämeenlinnan taidemuseo | `https://www.hameenlinna.fi/taidemuseo` | [hameenlinnantaidemuseo.fi](https://www.hameenlinnantaidemuseo.fi/) | Museolla on nykyään oma verkkotunnus. Osoite Viipurintie 2 ja näyttelyt varmistettu. |
| Seurasaaren ulkomuseo | `https://www.kansallismuseo.fi/seurasaari` | [kansallismuseo.fi](https://www.kansallismuseo.fi/fi/seurasaarenulkomuseo) | Sama ylläpitäjä, vain polku muuttunut. 88 rakennusta, aukioloajat ja hinnat varmistettu. |
| Oulun taidemuseo | `https://www.ouka.fi/oulun-taidemuseo` | [ouluntaidemuseo.fi](https://ouluntaidemuseo.fi/) | Museo on irtautunut kaupungin sivustosta omaan verkkotunnukseen. Suomenkielinen etusivu varmistettu. |
| Rovaniemen taidemuseo | `https://www.rovaniemi.fi/taidemuseo` | [korundi.fi](https://korundi.fi/fi/kavijalle/rovaniemen-taidemuseo) | Museo toimii Kulttuuritalo Korundissa ja sisältö on siirtynyt sinne. Hinnat ja aukioloajat varmistettu. |

## Ohjattu ja soveltava liikunta — `localExerciseLinks.ts`

Vanhat osoitteet olivat usein kausisidonnaisia ("syksy-2025", "2024-2025", "kesaliikunta"). Korvaajiksi on valittu pysyviä yläsivuja, jotka eivät vanhene ensi vuonna.

| Nimi | Vanha osoite | Uusi osoite | Peruste |
| --- | --- | --- | --- |
| Akaa | `https://akaa.fi/tee-ja-viihdy/liikunta/erityisryhmien-liikunta/liikuntaryhmat/` | [akaa.fi](https://akaa.fi/tee-ja-viihdy/liikunta/erityisryhmien-liikunta/) | Erityisryhmien ja ikääntyneiden liikunta, Kuntopassi eläkeläisille, erityisliikuntakortti. Alasivu poistunut, yläsivu pysyvä. |
| Kiuruvesi | `https://kiuruvesi.fi/palvelut/liikunta-ja-ulkoilu/ohjatut-liikuntaryhmat-2024-2025/` | [kiuruvesi.fi](https://kiuruvesi.fi/palvelut/liikunta-ja-ulkoilu/erityisliikunta/) | Lukuvuosisidonnainen osoite vaihtuu joka syksy. Erityisliikunnan yläsivu on pysyvä ja johtaa Voimaa vanhuuteen -ohjelmaan. |
| Lappeenranta | `https://lappeenranta.fi/fi/kulttuuri-ja-liikunta/liikunta/ohjattu-liikunta/terveysliikunta-syksy-2025/ohjattujen-liikuntaryhmien-tuntikuvaukset` | [lappeenranta.fi](https://lappeenranta.fi/fi/kulttuuri-ja-liikunta/liikunta/ohjattu-liikunta/sovellettu-liikunta) | **Tarkista selaimella.** Sivu vastaa 200 ja on indeksoitu otsikolla "Sovellettu liikunta", mutta sisältö renderöityy JavaScriptillä eikä tarkistin nähnyt leipätekstiä. |
| Kuopio | `https://www.kuopio.fi/vapaa-aika-ja-hyvinvointi/liikkuva-kuopio/vertaisohjattu-liikunta/vertaisohjatut-liikuntarymat/` | [kuopio.fi](https://www.kuopio.fi/vapaa-aika-ja-hyvinvointi/liikkuva-kuopio/liikuntaa-ikaantyneille/kaupungin-ohjatut-liikuntaryhmat-ikaantyneille/) | Listaa ohjatut ryhmät ikääntyneille paikkoineen ja aikoineen. Osuu kohderyhmään paremmin kuin vanha vertaisohjaajasivu. |
| Petäjävesi | `https://www.petajavesi.fi/vapaa-aika-ja-kulttuuri/vapaa-ajan-palvelut2017/soveltava-liikunta` | [petajavesi.fi](https://www.petajavesi.fi/vapaa-aika-ja-hyvinvointi/liikunta/soveltava-liikunta/) | Sivusto uudistettu, vanha 2017-polku poistunut. Uudella sivulla VoiTas-ryhmä yli 70-vuotiaille. |
| Pori | `https://www.pori.fi/vapaa-aika/liikunta/ohjattu-liikunta/kesaliikunta/` | [pori.fi](https://www.pori.fi/vapaa-aika/liikunta/ohjattu-liikunta/liikuntaa-ikaantyville/) | Seniorikortti 65+, ohjatut ryhmät, tasapainoryhmät, etäjumppa ja erityisliikunnanohjaajan yhteystieto. |
| Pudasjärvi | `https://www.pudasjarvi.fi/liikuntapalvelut/liikuntatarjonta/` | [pudasjarvi.fi](https://www.pudasjarvi.fi/liikuntapalvelut/liikuntaryhmat/) | Tuolijumppa senioreille, hyvinvointipassijumppa, eläkeläisalennus. |
| Savukoski | `https://www.savukoski.fi/news-article/liikuntapalvelut/` | [savukoski.fi](https://www.savukoski.fi/kulttuuri-ja-vapaa-aika/liikunta/) | **Ohut sisältö.** Noin tuhannen asukkaan kunnalla ei ole erillistä seniori- tai erityisliikuntasivua. Harkitse rinnalle Lapin hyvinvointialueen liikuntaryhmäsivua. |

## Palvelu- ja asiointiliikenne — `localServiceTransportLinks.ts`

Kohde on sivu, jolta ikäihminen näkee reitit ja tilausnumeron. Kolmelle ei löytynyt sellaista.

| Nimi | Vanha osoite | Uusi osoite | Peruste |
| --- | --- | --- | --- |
| Kiuruvesi palveluliikenne | `https://kiuruvesi.fi/asuminen-ja-ymparisto/liikenne/palveluliikenne/` | **TARKISTA KÄSIN** | Otsikoltaan osuva sivu `kiuruvesi.fi/palvelut/matkailu/paikallisliikenneaikataulut/` on olemassa, mutta se renderöityy JavaScriptillä eikä reittejä tai tilausnumeroa pystynyt varmistamaan. |
| Lapinlahti asiointiliikenne | `https://lapinlahti.fi/liikenne/` | [lapinlahti.fi](https://lapinlahti.fi/fi/asuminen-ja-ymparisto/kadut-ja-liikenne/joukkoliikenne) | Oma asiointiliikenneosio ikäihmisille, tilausnumerot 0500 375 475 ja 0400 272 623, aikataulu-PDF:t. |
| Parikkala palveluliikenne | `https://parikkala.fi/asuminen-ja-ymparisto/joukkoliikenne/` | [parikkala.fi](https://parikkala.fi/asuminen-ja-ymparisto/asiointiliikenne/) | Reitit R1–R6 viikonpäivittäin, tilaus 0400 237 685 edellisenä arkipäivänä klo 13 mennessä. |
| Kuopio PALI-palveluliikenne | `https://vilkku.kuopio.fi/pali` | [vilkku.kuopio.fi](https://vilkku.kuopio.fi/aikataulut-ja-reitit/palveluliikenne-pali) | Reitit P1–P5 aikatauluineen, tilaus 044 4747 470 arkisin 9–14, myös verkkotilaus. |
| Joroinen palveluliikenne | `https://www.joroinen.fi/asuminen-ja-ymparisto/liikenne/palveluliikenne-pali/` | [joroinen.fi](https://www.joroinen.fi/asuminen-ja-ymparisto/kadut-tiet-ja-liikenne/joukkoliikenne-ja-pali/) | Kutsuohjattu PALI, tilausnumerot päiväkohtaisesti klo 8–15.30. |
| Ähtäri asiointiliikenne | `https://www.petripekkala.com/asiointiliikenne.html` | **EI KORVAAJAA** | Liikennöitsijän sivustolla ei ole enää asiointiliikennettä, vain tilausajot ja taksi. Kaupungin sivuilla ei mainita palvelua eikä tilausnumeroa. Palvelu on ilmeisesti lakannut. |
| Pudasjärvi palveluliikenne | `https://www.pudasjarvi.fi/asuminen-ja-ymparisto/liikenneyhteydet/asiointiliikenne/` | **EI KORVAAJAA** | Nykyinen liikennesivu kertoo vain bussi- ja taksiliikenteestä. Asiointiliikennettä ei mainita liikennesivulla, senioripalvelusivulla eikä aikataulu-PDF:ssä. |
| Sonkajärvi asiointi- ja palveluliikenne | `https://www.sonkajarvi.fi/asuminen-ja-ymparisto/tiet-ja-liikenne/joukkoliikenne/` | [sonkajarvi.fi](https://sonkajarvi.fi/fi/asuminen-ja-ymparisto/tiet-ja-liikenne/julkinen-liikenne/pali-palveluliikenne) | PALI viidellä alueella arkisin, tilaus 041 3123 885, hinnat ja tilausohje. |

## Senioritoiminta ja paikallisuutiset

| Nimi | Vanha osoite | Uusi osoite | Peruste |
| --- | --- | --- | --- |
| Pudasjärvi seniorit | `https://www.pudasjarvi.fi/asuminen-ja-ymparisto/seniorit/` | [pudasjarvi.fi](https://www.pudasjarvi.fi/ikaihmisten-ja-vammaisten-palvelut/) | Ikäihmisten ja vammaisten palvelut: digioppaat, retket, vanhusneuvosto, yhteystiedot. `localSeniorLinks.ts` |
| Riihimäki avoin senioritoiminta | `https://www.riihimaki.fi/ela-ja-voi-hyvin/hyvinvointi/aktiivisuutta-arkeen/avoin-senioritoiminta/` | [riihimaki.fi](https://www.riihimaki.fi/ela-ja-voi-hyvin/avoimet-hyvinvointipalvelut/lahitoiminta/) | Toiminta on nimetty uudelleen "lähitoiminnaksi". Senioripuistoilu, Riksula, kohtaamiskahvit, ohjaajien yhteystiedot. `localSeniorLinks.ts` |
| Kaleva, Oulun seutu | `https://www.kaleva.fi/oulun-seutu/` | [kaleva.fi](https://www.kaleva.fi/oulun-seutu) | **Vain kauttaviiva liikaa.** Sama osoite ilman lopun `/` toimii ja näyttää tuoreet Oulun seudun uutiset. `localNewspaperLinks.ts` |

## Kuntasivustot vieraalla kielellä — `municipalityWebsiteLocales.ts`

| Nimi | Vanha osoite | Uusi osoite | Peruste |
| --- | --- | --- | --- |
| Juuka, englanti | `https://www.juuka.fi/en/web/english` | **EI KORVAAJAA** | Sivusto on uusittu eikä siinä ole enää kielivalitsinta. Englanninkielistä sisältöä ei löytynyt mistään polusta. Rivi kannattaa poistaa. |
| Juuka, venäjä | `https://www.juuka.fi/ru/web/russian` | **EI KORVAAJAA** | Sama tilanne. Polku `/ru` avaa nykyään suomenkielisen ruokapalvelusivun, mikä on käyttäjälle harhaanjohtavaa. Rivi kannattaa poistaa. |
| Rantasalmi, englanti | `https://www.rantasalmi.fi/en/` | **Toimii — ei muutosta** | Sivu on aito englanninkielinen etusivu. Mittaushetken 404 oli ilmeisesti tilapäinen. Merkitse tarkistetuksi. |

## Digiopastuspaikat — `seniorSurfGuidancePlaces.ts`

Kirjastoja, järjestöjä ja palvelukeskuksia, joissa ikäihminen saa apua laitteen käyttöön.

| Nimi | Vanha osoite | Uusi osoite | Peruste |
| --- | --- | --- | --- |
| Mäntyharjun kirjasto | `https://mantyharju.fi/sisalto/palvelut/kirjastopalvelut` | [mantyharju.fi](https://www.mantyharju.fi/sivut/vapaa-aika-kulttuuri/kirjasto/) | Kirjaston aukioloajat, Pertunmaan sivukirjasto, yhteystiedot. Erillistä digiopastussivua ei enää ole. |
| Multian kirjasto | `https://multia.fi/asukkaille/kirjasto.html` | [multia.fi](https://multia.fi/kulttuuri-ja-vapaa-aika/kirjasto) | Kokoelmat, aukioloajat, neljä varattavaa tietokonetta, yhteystiedot. |
| Norra Kyrkslätts pensionärer | `https://norrakyrkslatt.spfpension.fi/textmodul/` | [kyrkslattseniorer.spfpension.fi](https://kyrkslattseniorer.spfpension.fi/it_hjalp_kurser_och_foredrag/) | Koko vanha verkkotunnus on kuollut ja yhdistys on poistunut SPF Västnylandin jäsenlistalta. Seuraaja on Kyrkslätts Seniorer r.f., jonka IT-tukisivulla on Enter ry:n maksuton laiteopastus ja Digitorget. |
| The Firma | `https://thefirma.fi/?page_id=44` | [tai.fi](https://tai.fi/kansalaisen-it-tuki-auttaa/) | Kansalaisten Helpdesk siirtyi 13.3.2026 Turun ammatti-instituutille Hyvinvointikeskus Wisioon. Kohderyhmä on edelleen pääosin yli 60-vuotiaat. |
| TSL Turku, Apupiste | `https://tslturku.fi/apupiste-nettitaitoja-kadesta-pitaen` | [tslturku.fi](https://www.tslturku.fi/apupiste) | Sama palvelu, osoite lyhentynyt. 30 minuutin varatut ajat tietokoneen, tabletin ja puhelimen ongelmiin. |
| Uudenkaupungin kirjaston digiopastus | `https://uusikaupunki.fi/fi/kirjaston-palvelut/kirjaston-digiopastus` | [uusikaupunki.fi](https://uusikaupunki.fi/fi/kirjaston-palvelut) | Alasivu on rikki myös kaupungin omassa navigaatiossa. Emosivu mainitsee digiopastuksen ja nimeää vastuuhenkilön. |
| Valkery, digineuvonta | `https://valkery.fi/digineuvonta/` | **TARKISTA KÄSIN** | Tarkistin ei saanut yhteyttä palvelimeen, mutta arkistotallenne 11.12.2025 ja hakutulokset viittaavat sivun olevan yhä pystyssä. Jos se on rikki, käytä [Valkeakosken kirjaston digineuvontaa](https://kirjasto.valkeakoski.fi/palvelut/digineuvonta/). |
| Eläkeliitto, muut viikoittaiset kerhot | `https://www.elakeliitto.fi/muut-viikottaiset-kerhot` | **EI KORVAAJAA** | Eläkeliiton sivustolta on poistunut koko kerhot-osio. Vastaavat sivut kuuluvat nykyään yksittäisille paikallisyhdistyksille, eikä vanhasta osoitteesta käy ilmi mihin paikkakuntaan linkki viittasi. Katso hakemistorivin muut tiedot. |
| Grankulla svenska pensionärer, IT-stöd | `https://www.grankulla.spfpension.fi/hobby/it_stod/` | [grankulla.spfpension.fi](https://grankulla.spfpension.fi/aktuellt/) | "Kajs + Tores it-tips": ladattavia oppaita sähköpostista, verkkopankista ja tietoturvasta senioreille. |
| Hangon kirjasto | `https://www.hanko.fi/kulttuuri_vapaa-aika_ja_nuoriso/kirjasto/aukioloajat_ja_yhteystiedot` | [hanko.fi](https://hanko.fi/kulttuuri-vapaa-aika-ja-nuoriso/kirjasto/aukioloajat-ja-yhteystiedot/) | Alaviivat vaihtuivat yhdysmerkeiksi ja www putosi pois. Sisältö on sama. |
| Helsinki, Kampin palvelukeskus | `https://www.hel.fi/sote/toimipisteet-fi/aakkosittain/kamppi-pake` | [hel.fi](https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/tekemista-ja-vertaistukea/palvelukeskukset/palvelukeskusten-toimipisteet/kampin-palvelukeskus) | Salomonkatu 21 B, ryhmät, lounasravintola, liikuntaneuvonta. |
| Helsinki, Munkkiniemen palvelukeskus | `https://www.hel.fi/sote/toimipisteet-fi/aakkosittain/munkkiniemi-pake` | [hel.fi](https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/palvelukeskukset/munkkiniemen-palvelukeskus) | Laajalahdentie 30, liikuntaryhmät, kuntosali, ravintola. |
| Helsinki, Pohjois-Haagan palvelukeskus | `https://www.hel.fi/sote/toimipisteet-fi/aakkosittain/pohjois-haaga-pake` | [hel.fi](https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/tekemista-ja-vertaistukea/palvelukeskukset/palvelukeskusten-toimipisteet/pohjois-haagan-palvelukeskus) | Hopeatie 14 / Mariankoti, avoin kohtaamispaikka, digitukea, kuntosali. |
| Helsinki, Syystien seniorikeskus | `https://www.hel.fi/sote/toimipisteet-fi/aakkosittain/syystien-seniorikeskus/` | [hel.fi](https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/ikaantyneiden-asumispalvelut/seniorikeskukset/etsi-seniorikeskus-tai-palvelutalo/syystien-seniorikeskus) | Takaniitynkuja 3, päivätoiminta ja asumispalvelut. |
| Huittisten kirjastopalvelut | `https://www.huittinen.fi/palvelut/kirjastopalvelut` | [huittinen.fi](https://www.huittinen.fi/vapaa-aika/kirjasto/) | Lauttakylän pääkirjasto ja Vampulan lähikirjasto, Finna, digiopastus mainittu. |
| Hyvinkään kirjaston tietotekniikkaopastukset | `https://www.hyvinkaa.fi/kulttuuri-ja-vapaa-aika/kirjasto/vierailut-ja-opetus/kirjaston-tietotekniikkaopastukset/` | [hyvinkaa.fi](https://www.hyvinkaa.fi/hyvinvointi/digituki/) | Kirjaston oma opastussivu on poistunut. Kaupunki on koonnut digituen yhteen, ja sivu kertoo että kirjasto antaa digitukea. |
| Kauhavan kirjasto | `https://www.kauhava.fi/palvelut/kirjasto_ja_tietopalvelut` | [kauhava.fi](https://www.kauhava.fi/vapaa_aika/kirjasto/) | Kaupunginkirjasto, avoin kohtaamispaikka, kokoelmat, e-aineistot, kirjastoauto Opus. |
| Keuruun kirjasto, asiakaskoneet | `https://www.keuruu.fi/vapaa-aika-ja-kulttuuri/kirjasto/palvelut/asiakaskoneet-ja-digipalvelut` | [keuruu.fi](https://keuruu.fi/vapaa-aika-ja-matkailu/kirjasto/kirjaston-tilat-ja-laitteet/) | Kahdeksan asiakaskonetta, oma digiopastusosio ajanvarauksella ja Digikahvila. |
| Kouvola, digituki yhteisötiloissa | `https://www.kouvola.fi/kouvolankaupunki/asiointi/digituki-2/digituki-yhteisotiloissa/` | [kouvola.fi](https://www.kouvola.fi/kouvolankaupunki/asiointi/digituki-2/) | Alasivu poistunut. Digituen pääsivu listaa kirjastot, kansalaisopiston, järjestöt ja ajanvarausnumeron. |
| Laitilan kirjastopalvelut | `https://www.laitila.fi/palvelut/kirjastopalvelut/` | [laitila.fi](https://www.laitila.fi/kulttuuri-ja-vapaa-aika/kirjasto/palvelut/) | Laitteisto, kirjakassi, kaukolaina, hinnasto. |
| Lohjan Sydän, digitoiminta | `https://www.lohjansydan.fi/toiminta/digitoiminta` | [lohjansydan.fi](https://www.lohjansydan.fi/digitoiminta) | Vain `/toiminta`-polku pudonnut. Lohjan Digiseniorit opastavat pääkirjastossa ma klo 10–12 ja Virkkalassa. |
| Mikkelin Setlementti, IkäDigi | `https://www.mikkelinsetlementti.fi/ikadigi/sdfghjk/` | [mikkelinsetlementti.fi](https://www.mikkelinsetlementti.fi/ikadigi/) | Vanhassa osoitteessa oli roskapolku `sdfghjk`. Oikea sivu: DigiHelppi, yksilöohjaus, DigiTreenit. |
| Närpiön kirjastot | `https://www.narpes.fi/fi/invanare/fritid-kultur/kirjasto/narpion-kirjastot` | [narpes.fi](https://www.narpes.fi/fi/kulttuuri-vapaa-aika-ja-nuoriso/narpion-kirjastot/) | Pää- ja sivukirjastot, kirjastoauto, aukioloajat. |
| Parainen, ohjaus ja neuvonta | `https://www.pargas.fi/sv/web/pargas/handledning-och-radgivning?inheritRedirect=true` | [pargas.fi](https://www.pargas.fi/kontaktuppgifter-staden) | **Heikoin osuma.** Alkuperäistä vastaava sivu antaa nykyään oikeusvirheen. Korvaaja on kaupungin ruotsinkielinen neuvontasivu, joka mainitsee avun sähköisten palvelujen käyttöön. |
| Sipoon pääkirjasto | `https://www.sipoo.fi/fi/kulttuuri_ja_vapaa-aika/kirjasto/kirjastot_ja_yhteystiedot/sipoon_paakirjasto` | [sipoo.fi](https://www.sipoo.fi/fi/servicechannel/sipoon-paakirjasto/) | Osoite, aukioloajat, Helle-kirjastoverkko, tietokoneiden käyttö. |
| Turku, Monitori digituki | `https://www.turku.fi/monitori/digituki` | [suomi.fi](https://www.suomi.fi/palvelut/digituki-turun-kaupunki/5a4f74d5-3933-445c-9784-fa30b7d45a50) | Turun oma polku on poissa kaikilla kokeilluilla muodoilla. Suomi.fi:n viranomaisylläpitoinen palvelukuvaus mainitsee Kauppatorin Monitorin digipalveluohjauksen ja pääkirjaston laiteopastuksen. |
| Tuulensuun palvelukeskus, Seniorit surffaa | `https://www.tuulensuunpalvelukeskus.fi/muut-palvelut/seniorit-surffaa` | **TARKISTA KÄSIN** | Verkkotunnus ei vastannut tarkistimelle lainkaan. Sivusto vaikuttaa olevan olemassa, mutta "Seniorit surffaa" ei esiinny enää missään lähteessä. Katso `tuulensuunpalvelukeskus.fi/palvelut/` selaimella. |
| Tuusula | `https://www.tuusula.fi/sivu.tmpl?sivu_id=10054` | [tuusula.fi](https://tuusula.fi/2025/04/03/tukea-ja-turvaa-digimaailmaan/) | Vanha sivutunniste ei enää vastaa mitään sisältöä. Korvaaja on kunnan artikkeli digituesta: Enter ry ja Lions Club pääkirjastossa, Jokelan kirjastossa ja Moniossa. |
| Utsjoen kirjasto | `https://www.utsjoki.fi/kuntalaiselle/kirjasto-kulttuuri-ja-vapaa-aika/kirjasto/` | [utsjoki.fi](https://www.utsjoki.fi/vapaa-aika-ja-hyvinvointi/kirjasto/) | Pedar Jalvi -pääkirjasto, aukioloajat, kirjastoauto, digipalvelut. |
| Varha, hyvinvointikeskusten palvelut yli 65-vuotiaille | `https://www.varha.fi/fi/palvelut/hyvinvointikeskusten-palvelut-yli-65-vuotiaille` | [varha.fi](https://www.varha.fi/fi/palvelut/ikaantyneiden-palvelut) | **Yleisempi kuin alkuperäinen.** Tarkkaa vastinetta ei löytynyt. Ikääntyneiden palvelut kattaa asiakasohjauksen, kotihoidon, asumispalvelut ja muistineuvolan. |
| Vöyrin kirjasto | `https://www.vora.fi/ko-kulttuuri-ja-vapaa-aika/kirjasto/` | [vora.fi](https://www.vora.fi/en/services/library/vora-main-library/) | **Huomaa kieli.** Vöyri ei enää julkaise suomenkielistä versiota, vain ruotsin ja englannin. Etsi ruotsinkielinen vastine ennen käyttöä — se palvelisi kaksikielistä kuntaa paremmin kuin englanti. |

## Mitä seuraavaksi

1. Viisi kohdetta on merkitty **TARKISTA KÄSIN** tai **heikoin osuma**: Lappeenranta, Kiuruveden palveluliikenne, Valkery, Tuulensuu ja Parainen. Ne kannattaa avata selaimella ennen kuin osoite viedään sovellukseen.
2. Vöyrin kirjastolle pitäisi löytää ruotsinkielinen osoite englanninkielisen sijaan.
3. Seitsemän riviä ilman korvaajaa: Ähtärin ja Pudasjärven asiointiliikenne, Juuan englanti ja venäjä, Eläkeliiton kerhosivu — sekä Kiuruvesi ja Tuulensuu jos manuaalitarkistus ei tuota tulosta. Nämä poistetaan, kuten yhdistyslinkkien kohdalla tehtiin vasta kun korvaajaa oikeasti ei ollut.
4. Helsingin viisi palvelukeskusta siirtyivät kaikki samalla kaavalla `hel.fi/sote/toimipisteet-fi/aakkosittain/…` → `hel.fi/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/…`. Tarkista onko hakemistossa muita saman vanhan polun osoitteita — sama korjaus pätee niihin.
5. Kausisidonnaiset osoitteet ovat oma vikatyyppinsä: `syksy-2025`, `2024-2025`, `kesaliikunta`. Ne toimivat julkaisuhetkellä ja hajoavat vuodessa. Korvaajiksi valittiin pysyviä yläsivuja. Tämä kannattaa muistaa myös uusia linkkejä lisättäessä.

Muutoksia ei ole viety koodiin. Tiedostot joita ne koskevat: `communityLinks.ts`, `localExerciseLinks.ts`, `localServiceTransportLinks.ts`, `localSeniorLinks.ts`, `localNewspaperLinks.ts`, `municipalityWebsiteLocales.ts`, `seniorSurfGuidancePlaces.ts`.
