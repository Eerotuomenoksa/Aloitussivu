# Korjauslistan tilanne 30.8.2026 klo 17.30

Lähtökohta: `docs/linkit-korjattavat-2026-08-30-aamu.csv`, 236 riviä, mitattu klo 06.34 ennen yhdistyskorjauksia.
Menetelmä: jokainen listan osoite haettiin sellaisenaan nykyisistä lähdetiedostoista.

**Mittausskripti ei piilota mitään.** Se lukee katalogin, tarkistaa osoitteet ja kirjoittaa raportin. Piilotus tapahtuu kahdella muulla mekanismilla, joita kumpaakaan ei ole ajettu näille riveille:

1. `linkVisibility.ts` selaimessa: piilottaa kaiken mikä ei ole `https://` sekä `linkHealth.ts`:n 102 osoitteen estolistan. Tämä on tuotannossa päällä.
2. Palvelimen `blocked_links` automaattisen piilotuksen kautta. Ei vielä käytössä — migraatio ajetaan nyt, ja `auto_block_enabled` pidetään pois päältä kunnes P1-korjaus on tehty.

## Yhteenveto

| Toimenpide | Korjattu | Yhä koodissa | Näkyykö käyttäjälle |
| --- | ---: | ---: | --- |
| POISTA HETI (verkkotunnusten kauppapaikka) | 2 | 0 | — |
| päivitä HTTPS | 42 | 0 | — |
| poista (kuollut verkkotunnus) | 40 | 5 | **kyllä, klikattavissa** |
| korjaa osoite (kova 404) | 0 | 58 | **kyllä, klikattavissa** |
| päivitä ohjaus (301/302 uuteen osoitteeseen) | 0 | 43 | kyllä, mutta toimii |
| poista tai korvaa (`http://`) | 0 | 17 | ei — protokolla piilottaa, sivu puuttuu sovelluksesta |
| tarkista käsin | 11 | 18 | kyllä |

Käyttäjälle rikkinäisenä näkyviä on siis **63**: 5 kuollutta verkkotunnusta ja 58 kovaa 404:ää.
Nämä ovat täsmälleen ne, jotka automaattinen piilotus ottaa hoitaakseen heti kun cron on päällä.

## Kuolleet verkkotunnukset — poistettava tai korvattava (5)

Nimipalvelu ei tunne osoitetta lainkaan. Etsi korvaaja samalla tavalla kuin 39 yhdistyksen kohdalla.

| Nimi | Osoite | HTTP | Lähdetiedosto |
| --- | --- | --- | --- |
| www.lansi-uusimaa.fi | `https://www.lansi-uusimaa.fi/` | enotfound | `localServices.ts` |
| www.vimpeli.fi | `https://www.vimpeli.fi/rss.xml` | enotfound | `municipalityNewsFeeds.ts` |
| www.vimpeli.fi | `https://www.vimpeli.fi/` | enotfound | `municipalityWebsites.ts` |
| www.fredrikabiblioteken.fi | `https://www.fredrikabiblioteken.fi/fi/library-page/kruunupyyn-p%C3%A4%C3%A4kirjasto` | enotfound | `seniorSurfGuidancePlaces.ts` |
| www.fredrikabiblioteken.fi | `https://www.fredrikabiblioteken.fi/fi/library-page/uudenkaarlepyyn-kaupunginkirjasto` | enotfound | `seniorSurfGuidancePlaces.ts` |

## Kova 404 — osoite on muuttunut sivustolla (58)

Palvelin vastaa, mutta sivua ei ole. Useimmiten kunta on uudistanut sivustonsa ja sivu löytyy uudesta osoitteesta.

| Nimi | Osoite | HTTP | Lähdetiedosto |
| --- | --- | --- | --- |
| Hämeen linna | `https://www.hameenlinna.fi/hameenlinna` | 404 | `communityLinks.ts` |
| Hämeenlinnan taidemuseo | `https://www.hameenlinna.fi/taidemuseo` | 404 | `communityLinks.ts` |
| Seurasaaren ulkomuseo | `https://www.kansallismuseo.fi/seurasaari` | 404 | `communityLinks.ts` |
| Oulun taidemuseo | `https://www.ouka.fi/oulun-taidemuseo` | 404 | `communityLinks.ts` |
| Rovaniemen taidemuseo | `https://www.rovaniemi.fi/taidemuseo` | 404 | `communityLinks.ts` |
| akaa.fi | `https://akaa.fi/tee-ja-viihdy/liikunta/erityisryhmien-liikunta/liikuntaryhmat/` | 404 | `localExerciseLinks.ts` |
| kiuruvesi.fi | `https://kiuruvesi.fi/palvelut/liikunta-ja-ulkoilu/ohjatut-liikuntaryhmat-2024-2025/` | 404 | `localExerciseLinks.ts` |
| lappeenranta.fi | `https://lappeenranta.fi/fi/kulttuuri-ja-liikunta/liikunta/ohjattu-liikunta/terveysliikunta-syksy-2025/ohjattujen-liikuntaryhmien-tuntikuvaukset` | 404 | `localExerciseLinks.ts` |
| www.kuopio.fi | `https://www.kuopio.fi/vapaa-aika-ja-hyvinvointi/liikkuva-kuopio/vertaisohjattu-liikunta/vertaisohjatut-liikuntarymat/` | 404 | `localExerciseLinks.ts` |
| www.petajavesi.fi | `https://www.petajavesi.fi/vapaa-aika-ja-kulttuuri/vapaa-ajan-palvelut2017/soveltava-liikunta` | 404 | `localExerciseLinks.ts` |
| www.pori.fi | `https://www.pori.fi/vapaa-aika/liikunta/ohjattu-liikunta/kesaliikunta/` | 404 | `localExerciseLinks.ts` |
| www.pudasjarvi.fi | `https://www.pudasjarvi.fi/liikuntapalvelut/liikuntatarjonta/` | 404 | `localExerciseLinks.ts` |
| www.savukoski.fi | `https://www.savukoski.fi/news-article/liikuntapalvelut/` | 404 | `localExerciseLinks.ts` |
| www.kaleva.fi | `https://www.kaleva.fi/oulun-seutu/` | 404 | `localNewspaperLinks.ts` |
| www.pudasjarvi.fi | `https://www.pudasjarvi.fi/asuminen-ja-ymparisto/seniorit/` | 404 | `localSeniorLinks.ts` |
| www.riihimaki.fi | `https://www.riihimaki.fi/ela-ja-voi-hyvin/hyvinvointi/aktiivisuutta-arkeen/avoin-senioritoiminta/` | 404 | `localSeniorLinks.ts` |
| Kiuruvesi palveluliikenne | `https://kiuruvesi.fi/asuminen-ja-ymparisto/liikenne/palveluliikenne/` | 404 | `localServiceTransportLinks.ts` |
| Lapinlahti asiointiliikenne | `https://lapinlahti.fi/liikenne/` | 404 | `localServiceTransportLinks.ts` |
| Parikkala palveluliikenne | `https://parikkala.fi/asuminen-ja-ymparisto/joukkoliikenne/` | 404 | `localServiceTransportLinks.ts` |
| Kuopio PALI-palveluliikenne | `https://vilkku.kuopio.fi/pali` | 404 | `localServiceTransportLinks.ts` |
| Joroinen palveluliikenne | `https://www.joroinen.fi/asuminen-ja-ymparisto/liikenne/palveluliikenne-pali/` | 404 | `localServiceTransportLinks.ts` |
| Ähtäri asiointiliikenne | `https://www.petripekkala.com/asiointiliikenne.html` | 404 | `localServiceTransportLinks.ts` |
| Pudasjärvi palveluliikenne | `https://www.pudasjarvi.fi/asuminen-ja-ymparisto/liikenneyhteydet/asiointiliikenne/` | 404 | `localServiceTransportLinks.ts` |
| Sonkajärvi asiointi- ja palveluliikenne | `https://www.sonkajarvi.fi/asuminen-ja-ymparisto/tiet-ja-liikenne/joukkoliikenne/` | 404 | `localServiceTransportLinks.ts` |
| www.juuka.fi | `https://www.juuka.fi/en/web/english` | 404 | `municipalityWebsiteLocales.ts` |
| www.juuka.fi | `https://www.juuka.fi/ru/web/russian` | 404 | `municipalityWebsiteLocales.ts` |
| www.rantasalmi.fi | `https://www.rantasalmi.fi/en/` | 404 | `municipalityWebsiteLocales.ts` |
| mantyharju.fi | `https://mantyharju.fi/sisalto/palvelut/kirjastopalvelut` | 404 | `seniorSurfGuidancePlaces.ts` |
| multia.fi | `https://multia.fi/asukkaille/kirjasto.html` | 404 | `seniorSurfGuidancePlaces.ts` |
| norrakyrkslatt.spfpension.fi | `https://norrakyrkslatt.spfpension.fi/textmodul/` | 404 | `seniorSurfGuidancePlaces.ts` |
| thefirma.fi | `https://thefirma.fi/?page_id=44` | 404 | `seniorSurfGuidancePlaces.ts` |
| tslturku.fi | `https://tslturku.fi/apupiste-nettitaitoja-kadesta-pitaen` | 404 | `seniorSurfGuidancePlaces.ts` |
| uusikaupunki.fi | `https://uusikaupunki.fi/fi/kirjaston-palvelut/kirjaston-digiopastus` | 404 | `seniorSurfGuidancePlaces.ts` |
| valkery.fi | `https://valkery.fi/digineuvonta/` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.elakeliitto.fi | `https://www.elakeliitto.fi/muut-viikottaiset-kerhot` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.grankulla.spfpension.fi | `https://www.grankulla.spfpension.fi/hobby/it_stod/` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.hanko.fi | `https://www.hanko.fi/kulttuuri_vapaa-aika_ja_nuoriso/kirjasto/aukioloajat_ja_yhteystiedot` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.hel.fi | `https://www.hel.fi/sote/toimipisteet-fi/aakkosittain/kamppi-pake` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.hel.fi | `https://www.hel.fi/sote/toimipisteet-fi/aakkosittain/munkkiniemi-pake` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.hel.fi | `https://www.hel.fi/sote/toimipisteet-fi/aakkosittain/pohjois-haaga-pake` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.hel.fi | `https://www.hel.fi/sote/toimipisteet-fi/aakkosittain/syystien-seniorikeskus/` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.huittinen.fi | `https://www.huittinen.fi/palvelut/kirjastopalvelut` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.hyvinkaa.fi | `https://www.hyvinkaa.fi/kulttuuri-ja-vapaa-aika/kirjasto/vierailut-ja-opetus/kirjaston-tietotekniikkaopastukset/` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.kauhava.fi | `https://www.kauhava.fi/palvelut/kirjasto_ja_tietopalvelut` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.keuruu.fi | `https://www.keuruu.fi/vapaa-aika-ja-kulttuuri/kirjasto/palvelut/asiakaskoneet-ja-digipalvelut` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.kouvola.fi | `https://www.kouvola.fi/kouvolankaupunki/asiointi/digituki-2/digituki-yhteisotiloissa/` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.laitila.fi | `https://www.laitila.fi/palvelut/kirjastopalvelut/` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.lohjansydan.fi | `https://www.lohjansydan.fi/toiminta/digitoiminta` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.mikkelinsetlementti.fi | `https://www.mikkelinsetlementti.fi/ikadigi/sdfghjk/` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.narpes.fi | `https://www.narpes.fi/fi/invanare/fritid-kultur/kirjasto/narpion-kirjastot` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.pargas.fi | `https://www.pargas.fi/sv/web/pargas/handledning-och-radgivning?inheritRedirect=true` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.sipoo.fi | `https://www.sipoo.fi/fi/kulttuuri_ja_vapaa-aika/kirjasto/kirjastot_ja_yhteystiedot/sipoon_paakirjasto` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.turku.fi | `https://www.turku.fi/monitori/digituki` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.tuulensuunpalvelukeskus.fi | `https://www.tuulensuunpalvelukeskus.fi/muut-palvelut/seniorit-surffaa` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.tuusula.fi | `https://www.tuusula.fi/sivu.tmpl?sivu_id=10054` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.utsjoki.fi | `https://www.utsjoki.fi/kuntalaiselle/kirjasto-kulttuuri-ja-vapaa-aika/kirjasto/` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.varha.fi | `https://www.varha.fi/fi/palvelut/hyvinvointikeskusten-palvelut-yli-65-vuotiaille` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.vora.fi | `https://www.vora.fi/ko-kulttuuri-ja-vapaa-aika/kirjasto/` | 404 | `seniorSurfGuidancePlaces.ts` |

## Vain http, piilotettu käyttäjältä (17)

Nämä eivät näy sovelluksessa lainkaan, koska `linkVisibility.ts` vaatii https:n. Sivu on siis hiljaisesti puuttunut. Etsi https-osoite tai korvaava sivu.

| Nimi | Osoite | HTTP | Lähdetiedosto |
| --- | --- | --- | --- |
| etela-pohjanmaa.elakeliitto.fi | `http://etela-pohjanmaa.elakeliitto.fi/yhdistykset/lapua/toimintakalenteri/` | 404 | `seniorSurfGuidancePlaces.ts` |
| kirjasto.kaustinen.fi | `http://kirjasto.kaustinen.fi/` | https_required | `seniorSurfGuidancePlaces.ts` |
| kirjasto.kustavi.fi | `http://kirjasto.kustavi.fi/palvelut.html` | https_required | `seniorSurfGuidancePlaces.ts` |
| kirjasto.lestijarvi.fi | `http://kirjasto.lestijarvi.fi/` | https_required | `seniorSurfGuidancePlaces.ts` |
| www.hameenkyro.fi | `http://www.hameenkyro.fi/palvelut/elamanlaatu/kirjasto/` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.kainuunelakelaisetry.fi | `http://www.kainuunelakelaisetry.fi/kajaani/` | https_required | `seniorSurfGuidancePlaces.ts` |
| www.lapinlahti.fi | `http://www.lapinlahti.fi/fi/Tietoa-kunnasta/Organisaatio/Osastot/Sivistysosasto/Kulttuuri--ja-nuorisopalvelut/Kirjasto` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.lemi.fi | `http://www.lemi.fi/fi/palvelut/kirjasto` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.lounakirjastot.fi | `http://www.lounakirjastot.fi/kirjastot/forssa/` | https_required | `seniorSurfGuidancePlaces.ts` |
| www.lounakirjastot.fi | `http://www.lounakirjastot.fi/kirjastot/jokioinen/` | https_required | `seniorSurfGuidancePlaces.ts` |
| www.lounakirjastot.fi | `http://www.lounakirjastot.fi/kirjastot/tammela/` | https_required | `seniorSurfGuidancePlaces.ts` |
| www.nivala.fi | `http://www.nivala.fi/palvelukanava/de4ed45c-b0e6-41ac-8d9d-108dc7938017` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.padasjoki.fi | `http://www.padasjoki.fi/fi/Palvelut/Kirjasto,-kulttuuri-ja-kansalaisopisto/Kirjasto` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.parainen.fi | `http://www.parainen.fi/web/tjanster/fi_FI/servicepunkten/` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.rautjarvi.fi | `http://www.rautjarvi.fi/fi/Palvelut/Sivistys,-nuoriso-ja-liikunta/Kirjasto/Aukioloajat` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.sauvo.fi | `http://www.sauvo.fi/fi/palvelut/alisivu-4/sauvon-kirjasto/` | 404 | `seniorSurfGuidancePlaces.ts` |
| www.suomussalmi.fi | `http://www.suomussalmi.fi/kirjasto` | 404 | `seniorSurfGuidancePlaces.ts` |

## Ohjaus uuteen osoitteeseen — päivitä ennen kuin ohjaus poistetaan (43)

Linkki toimii tänään, mutta osoittaa vanhaan osoitteeseen josta ohjataan eteenpäin. Ohjaukset katoavat usein sivustouudistuksessa.

| Nimi | Osoite | HTTP | Lähdetiedosto |
| --- | --- | --- | --- |
| Aboa Vetus & Ars Nova | `https://www.aboavetusarsnova.fi/` | 200 | `communityLinks.ts` |
| Suomen Hemofiliayhdistys | `https://www.hemofilia.fi/` | 200 | `communityLinks.ts` |
| Immuunipuutospotilaiden yhdistys Imppu | `https://www.imppu.fi/` | 200 | `communityLinks.ts` |
| Suomen kello- ja korumuseo | `https://www.kellomuseo.fi/` | 200 | `communityLinks.ts` |
| Luonnontieteellinen keskusmuseo LUOMUS | `https://www.luomus.fi/` | 206 | `communityLinks.ts` |
| Suomen merimuseo | `https://www.merimuseo.fi/` | 200 | `communityLinks.ts` |
| Arkkitehtuurimuseo | `https://www.mfa.fi/` | 200 | `communityLinks.ts` |
| Suomen Noonan-yhdistys | `https://www.noonan.fi/` | 200 | `communityLinks.ts` |
| Oulun taidemuseo | `https://www.ouka.fi/taidemuseo` | 200 | `communityLinks.ts` |
| Suomen pelimuseo | `https://www.pelimuseo.fi/` | 200 | `communityLinks.ts` |
| Sydänlapset ja -aikuiset | `https://www.sydanlapset.fi/` | 200 | `communityLinks.ts` |
| Suomen urheilumuseo | `https://www.urheilumuseo.fi/` | 200 | `communityLinks.ts` |
| Vantaan Muistiyhdistys ry | `https://www.vantaanmuisti.fi/fi/etusivu` | 200 | `communityLinks.ts` |
| Suomen työväenmuseo Werstas | `https://www.werstas.fi/` | 200 | `communityLinks.ts` |
| X (Twitter) | `https://twitter.com/` | 200 | `constants.tsx` |
| Google | `https://www.google.fi/` | 200 | `constants.tsx` |
| www.karkkilantienoo.fi | `https://www.karkkilantienoo.fi/` | 206 | `localNewspaperLinks.ts` |
| kainuunhyvinvointialue.fi | `https://kainuunhyvinvointialue.fi/` | 206 | `localServices.ts` |
| sata.fi | `https://sata.fi/` | 200 | `localServices.ts` |
| sata.fi | `https://sata.fi/ajankohtaista/` | 200 | `localServices.ts` |
| Helmet-kirjastot | `https://www.helmet.fi/` | 206 | `localServices.ts` |
| Oulun joukkoliikenne | `https://www.oulunjoukkoliikenne.fi/` | 200 | `localServices.ts` |
| Esport Oilers | `https://www.esportoilers.fi/` | 200 | `localSportsClubs.ts` |
| www.tyrnava.fi | `https://www.tyrnava.fi/en/home.html` | 206 | `municipalityWebsiteLocales.ts` |
| outlook.office365.com | `https://outlook.office365.com/owa/calendar/Vantaaaikuisopisto@eduvantaa.onmicrosoft.com/bookings/` | 200 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Entressen_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Haukilahden_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Ison_Omenan_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Kalajarven_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Karhusuon_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Kauklahden_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Kauniaisten_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Laajalahden_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Laaksolahden_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Lippulaivan_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Noykkion_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Saunalahden_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Sellon_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Tapiolan_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Tikkurilan_kirjasto/Tapahtumat` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Tikkurilan_kirjasto/Tapahtumat?s=pilviagentti*` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.helmet.fi | `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Viherlaakson_kirjasto` | 206 | `seniorSurfGuidancePlaces.ts` |
| www.maunula.net | `https://www.maunula.net/maunula-seura/asukastila-maunulan-mediapaja/` | 200 | `seniorSurfGuidancePlaces.ts` |

## Tarkistettava käsin (18)

Tarkistin sai aikakatkaisun, TLS-virheen tai vastauksen 200 jonka sisältö oli epäilyttävä. Osa näistä on todennäköisesti kunnossa.

| Nimi | Osoite | HTTP | Lähdetiedosto |
| --- | --- | --- | --- |
| Suomen Angelman-yhdistys | `https://www.angelman.fi/` | etimedout | `communityLinks.ts` |
| Designmuseo | `https://www.designmuseo.fi/` | und_err_connect_timeout | `communityLinks.ts` |
| Suomen fruktoosi-intolerantikot (HFI) | `https://www.hfi.fi/` | econnreset | `communityLinks.ts` |
| Suomen Ehlers-Danlos yhdistys (SEDY) | `https://www.sedy.fi/` | err_tls_cert_altname_invalid | `communityLinks.ts` |
| Härmän Liikenne reittiliikenne | `https://harmanliikenne.fi/reittiliikenne/` | etimedout | `localServices.ts` |
| Parkano palveluliikenne | `https://parkano.fi/palveluliikenne/` | etimedout | `localServiceTransportLinks.ts` |
| Porin Ässät | `https://assat.com/` | etimedout | `localSportsClubs.ts` |
| marttila.fi | `https://marttila.fi/` | unable_to_verify_leaf_signature | `municipalityWebsites.ts` |
| etelasavonha.fi | `https://etelasavonha.fi/asiointikanavat/monitoimijakeskus-omatori/` | etimedout | `seniorSurfGuidancePlaces.ts` |
| www.kuhmoinen.fi | `https://www.kuhmoinen.fi/tapahtumat/Liikuntatapahtumat/198%20-%20Tuolijumppa` | 200 | `localExerciseLinks.ts` |
| www.tervareitti.fi | `https://www.tervareitti.fi/` | 206 | `localNewspaperLinks.ts` |
| Utsjoen yhteydet | `https://exploreutsjoki.fi/yhteydet/` | 200 | `localServices.ts` |
| Kuhmoisten julkinen liikenne | `https://www.kuhmoinen.fi/asuminen%20ja%20ymp%C3%A4rist%C3%B6/kadut%20ja%20liikenne/julkinen%20liikenne/` | 200 | `localServices.ts` |
| Liikenne Rundgren reitit | `https://www.rundgrenoy.fi/` | 200 | `localServices.ts` |
| PK Keski-Uusimaa | `https://pkku.fi/` | 200 | `localSportsClubs.ts` |
| www.kuhmoinen.fi | `https://www.kuhmoinen.fi/` | 200 | `municipalityWebsites.ts` |
| www.kuhmoinen.fi | `https://www.kuhmoinen.fi/content/fi/1/373161/Digiopastus.html` | 200 | `seniorSurfGuidancePlaces.ts` |
| www.vanhustenturva.fi | `https://www.vanhustenturva.fi/toimintamme` | 200 | `seniorSurfGuidancePlaces.ts` |
