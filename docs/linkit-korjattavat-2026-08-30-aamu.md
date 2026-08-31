# Korjattavat linkit 2026-08-30

Muodostettu komennolla `node scripts/link-fix-list.mjs` mittausajon tuloksista. Havaintoja yhteensä 236.

Rivikohtainen lista: `docs/linkit-korjattavat-2026-08-30-aamu.csv`.

## Toimenpiteet

| Toimenpide | Kpl |
|---|---:|
| korjaa osoite | 58 |
| poista | 45 |
| päivitä ohjaus | 43 |
| päivitä HTTPS | 42 |
| tarkista käsin | 29 |
| poista tai korvaa | 17 |
| POISTA HETI | 2 |

## Lähdetiedostoittain

| Lähdetiedosto | Korjattavia |
|---|---:|
| `seniorSurfGuidancePlaces.ts` | 111 |
| `communityLinks.ts` | 65 |
| `localServices.ts` | 14 |
| `constants.tsx` | 12 |
| `localExerciseLinks.ts` | 9 |
| `localServiceTransportLinks.ts` | 9 |
| `municipalityWebsiteLocales.ts` | 4 |
| `municipalityWebsites.ts` | 3 |
| `localNewspaperLinks.ts` | 3 |
| `localSportsClubs.ts` | 3 |
| `localSeniorLinks.ts` | 2 |
| `municipalityNewsFeeds.ts` | 1 |

## Kiireelliset

| Nimi sovelluksessa | Nykyinen osoite | Vie oikeasti |
|---|---|---|
| Eläkeläisliittojen etujärjestö EETU ry | `https://www.eetu.fi/` | `https://sedo.com/search/details/?partnerid=324561&language=fi&domain=eetu.fi&origin=sales_` |
| Suomen PAH-potilasyhdistys | `https://www.pah.fi/` | `https://catcha.fi/verkkotunnukset/pah.fi` |

### `seniorSurfGuidancePlaces.ts` — 111 kpl

**poista** (2):

- www.fredrikabiblioteken.fi — `https://www.fredrikabiblioteken.fi/fi/library-page/kruunupyyn-p%C3%A4%C3%A4kirja`
- www.fredrikabiblioteken.fi — `https://www.fredrikabiblioteken.fi/fi/library-page/uudenkaarlepyyn-kaupunginkirj`

**korjaa osoite** (31):

- mantyharju.fi — `https://mantyharju.fi/sisalto/palvelut/kirjastopalvelut`
- multia.fi — `https://multia.fi/asukkaille/kirjasto.html`
- norrakyrkslatt.spfpension.fi — `https://norrakyrkslatt.spfpension.fi/textmodul/`
- thefirma.fi — `https://thefirma.fi/?page_id=44`
- tslturku.fi — `https://tslturku.fi/apupiste-nettitaitoja-kadesta-pitaen`
- uusikaupunki.fi — `https://uusikaupunki.fi/fi/kirjaston-palvelut/kirjaston-digiopastus`
- valkery.fi — `https://valkery.fi/digineuvonta/`
- www.elakeliitto.fi — `https://www.elakeliitto.fi/muut-viikottaiset-kerhot`
- www.grankulla.spfpension.fi — `https://www.grankulla.spfpension.fi/hobby/it_stod/`
- www.hanko.fi — `https://www.hanko.fi/kulttuuri_vapaa-aika_ja_nuoriso/kirjasto/aukioloajat_ja_yht`
- www.hel.fi — `https://www.hel.fi/sote/toimipisteet-fi/aakkosittain/kamppi-pake`
- www.hel.fi — `https://www.hel.fi/sote/toimipisteet-fi/aakkosittain/munkkiniemi-pake`
- www.hel.fi — `https://www.hel.fi/sote/toimipisteet-fi/aakkosittain/pohjois-haaga-pake`
- www.hel.fi — `https://www.hel.fi/sote/toimipisteet-fi/aakkosittain/syystien-seniorikeskus/`
- www.huittinen.fi — `https://www.huittinen.fi/palvelut/kirjastopalvelut`
- www.hyvinkaa.fi — `https://www.hyvinkaa.fi/kulttuuri-ja-vapaa-aika/kirjasto/vierailut-ja-opetus/kir`
- www.kauhava.fi — `https://www.kauhava.fi/palvelut/kirjasto_ja_tietopalvelut`
- www.keuruu.fi — `https://www.keuruu.fi/vapaa-aika-ja-kulttuuri/kirjasto/palvelut/asiakaskoneet-ja`
- www.kouvola.fi — `https://www.kouvola.fi/kouvolankaupunki/asiointi/digituki-2/digituki-yhteisotilo`
- www.laitila.fi — `https://www.laitila.fi/palvelut/kirjastopalvelut/`
- www.lohjansydan.fi — `https://www.lohjansydan.fi/toiminta/digitoiminta`
- www.mikkelinsetlementti.fi — `https://www.mikkelinsetlementti.fi/ikadigi/sdfghjk/`
- www.narpes.fi — `https://www.narpes.fi/fi/invanare/fritid-kultur/kirjasto/narpion-kirjastot`
- www.pargas.fi — `https://www.pargas.fi/sv/web/pargas/handledning-och-radgivning?inheritRedirect=t`
- www.sipoo.fi — `https://www.sipoo.fi/fi/kulttuuri_ja_vapaa-aika/kirjasto/kirjastot_ja_yhteystied`
- www.turku.fi — `https://www.turku.fi/monitori/digituki`
- www.tuulensuunpalvelukeskus.fi — `https://www.tuulensuunpalvelukeskus.fi/muut-palvelut/seniorit-surffaa`
- www.tuusula.fi — `https://www.tuusula.fi/sivu.tmpl?sivu_id=10054`
- www.utsjoki.fi — `https://www.utsjoki.fi/kuntalaiselle/kirjasto-kulttuuri-ja-vapaa-aika/kirjasto/`
- www.varha.fi — `https://www.varha.fi/fi/palvelut/hyvinvointikeskusten-palvelut-yli-65-vuotiaille`
- www.vora.fi — `https://www.vora.fi/ko-kulttuuri-ja-vapaa-aika/kirjasto/`

**päivitä HTTPS** (39):

- hausjarvi.fi — `http://hausjarvi.fi/palvelut/vapaa-aika-kulttuuri/kirjasto/` → `https://hausjarvi.fi/palvelut/vapaa-aika-kulttuuri/kirjasto/`
- heinavesi.fi — `http://heinavesi.fi/kirjasto` → `https://heinavesi.fi/kirjasto`
- kirjasto.pieksamaki.fi — `http://kirjasto.pieksamaki.fi/` → `https://kirjasto.pieksamaki.fi/`
- korsholm.spfpension.fi — `http://korsholm.spfpension.fi/` → `https://korsholm.spfpension.fi/`
- lestinreuma.reumaliitto.fi — `http://lestinreuma.reumaliitto.fi/` → `https://lestinreuma.reumaliitto.fi/`
- loppi.fi — `http://loppi.fi/palvelut/kulttuuri-ja-vapaa-aika/kirjasto/` → `https://loppi.fi/palvelut/kulttuuri-ja-vapaa-aika/kirjasto/`
- milstolpen.spfpension.fi — `http://milstolpen.spfpension.fi/` → `https://milstolpen.spfpension.fi/`
- narpes.spfpension.fi — `http://narpes.spfpension.fi/hem/` → `https://narpes.spfpension.fi/hem/`
- seutuopisto.pieksamaki.fi — `http://seutuopisto.pieksamaki.fi/` → `https://seutuopisto.pieksamaki.fi/`
- terjarv.spfpension.fi — `http://terjarv.spfpension.fi/start/` → `https://terjarv.spfpension.fi/start/`
- tervola.fi — `http://tervola.fi/vapaa-aika-ja-liikunta/kirjasto/kirjaston-palvelut/` → `https://tervola.fi/vapaa-aika-ja-liikunta/kirjasto/kirjaston-palvelut/`
- tietotupa.omasivu.fi — `http://tietotupa.omasivu.fi/tuki-vaaksyn-information-room/` → `https://tietotupa.omasivu.fi/tuki-vaaksyn-information-room/`
- vastanfjard.spfpension.fi — `http://vastanfjard.spfpension.fi/start/` → `https://vastanfjard.spfpension.fi/start/`
- www.aura.fi — `http://www.aura.fi/kirjasto/` → `https://www.aura.fi/kirjasto/`
- www.haapajarvi.fi — `http://www.haapajarvi.fi/kirjasto` → `https://www.haapajarvi.fi/kirjasto`
- www.hameenlinna.fi — `http://www.hameenlinna.fi/pysakki` → `https://www.hameenlinna.fi/pysakki`
- www.harjavalta.fi — `http://www.harjavalta.fi/kirjasto` → `https://www.harjavalta.fi/kirjasto`
- www.ii.fi — `http://www.ii.fi/kirjasto` → `https://www.ii.fi/kirjasto`
- www.ilomantsi.fi — `http://www.ilomantsi.fi/kirjasto` → `https://www.ilomantsi.fi/kirjasto`
- www.joutsa.fi — `http://www.joutsa.fi/vapaa-aika-ja-kulttuuri/kirjasto/` → `https://www.joutsa.fi/vapaa-aika-ja-kulttuuri/kirjasto/`
- www.juupajoki.fi — `http://www.juupajoki.fi/palvelut/kirjasto` → `https://www.juupajoki.fi/palvelut/kirjasto`
- www.kajaani.fi — `http://www.kajaani.fi/fi/kirjasto` → `https://www.kajaani.fi/fi/kirjasto`
- www.kumppanuustalokulma.fi — `http://www.kumppanuustalokulma.fi/` → `https://www.kumppanuustalokulma.fi/`
- www.kuusamo.fi — `http://www.kuusamo.fi/koe-ja-nae/kirjasto/kirjaston-toimipisteet/paakirjasto` → `https://www.kuusamo.fi/koe-ja-nae/kirjasto/kirjaston-toimipisteet/paakirjasto`
- www.mantsala.fi — `http://www.mantsala.fi/asukkaille/kirjasto` → `https://www.mantsala.fi/asukkaille/kirjasto`
- www.mynamaki.fi — `http://www.mynamaki.fi/kirjasto` → `https://www.mynamaki.fi/kirjasto`
- www.orivesi.fi — `http://www.orivesi.fi/fi/palvelut/kirjasto` → `https://www.orivesi.fi/fi/palvelut/kirjasto`
- www.oulainen.fi — `http://www.oulainen.fi/kirjasto` → `https://www.oulainen.fi/kirjasto`
- www.paimio.fi — `http://www.paimio.fi/kirjasto` → `https://www.paimio.fi/kirjasto`
- www.riihimaki.fi — `http://www.riihimaki.fi/kirjasto/` → `https://www.riihimaki.fi/kirjasto/`
- www.saarijarvi.fi — `http://www.saarijarvi.fi/palvelut/kirjasto` → `https://www.saarijarvi.fi/palvelut/kirjasto`
- www.salo.fi — `http://www.salo.fi/vapaaaikajamatkailu/kirjasto/` → `https://www.salo.fi/vapaaaikajamatkailu/kirjasto/`
- www.sastamalankylat.fi — `http://www.sastamalankylat.fi/vahahaara/` → `https://www.sastamalankylat.fi/vahahaara/`
- www.satakunnannakovammaiset.fi — `http://www.satakunnannakovammaiset.fi/` → `https://www.satakunnannakovammaiset.fi/`
- www.seniorijelppi.fi — `http://www.seniorijelppi.fi/palvelu.html` → `https://www.seniorijelppi.fi/palvelu.html`
- www.sysma.fi — `http://www.sysma.fi/kirjasto` → `https://www.sysma.fi/kirjasto`
- www.taivassalo.fi — `http://www.taivassalo.fi/vapaa-aika/kirjasto` → `https://www.taivassalo.fi/vapaa-aika/kirjasto`
- www.urjala.fi — `http://www.urjala.fi/vapaa-aika-ja-kulttuuri/kirjasto` → `https://www.urjala.fi/vapaa-aika-ja-kulttuuri/kirjasto`
- www.vantaa.fi — `http://www.vantaa.fi/hallinto_ja_talous/tietoa_vantaasta/vantaa-info` → `https://www.vantaa.fi/hallinto_ja_talous/tietoa_vantaasta/vantaa-info`

**poista tai korvaa** (17):

- etela-pohjanmaa.elakeliitto.fi — `http://etela-pohjanmaa.elakeliitto.fi/yhdistykset/lapua/toimintakalenteri/`
- kirjasto.kaustinen.fi — `http://kirjasto.kaustinen.fi/`
- kirjasto.kustavi.fi — `http://kirjasto.kustavi.fi/palvelut.html`
- kirjasto.lestijarvi.fi — `http://kirjasto.lestijarvi.fi/`
- www.hameenkyro.fi — `http://www.hameenkyro.fi/palvelut/elamanlaatu/kirjasto/`
- www.kainuunelakelaisetry.fi — `http://www.kainuunelakelaisetry.fi/kajaani/`
- www.lapinlahti.fi — `http://www.lapinlahti.fi/fi/Tietoa-kunnasta/Organisaatio/Osastot/Sivistysosasto/`
- www.lemi.fi — `http://www.lemi.fi/fi/palvelut/kirjasto`
- www.lounakirjastot.fi — `http://www.lounakirjastot.fi/kirjastot/forssa/`
- www.lounakirjastot.fi — `http://www.lounakirjastot.fi/kirjastot/jokioinen/`
- www.lounakirjastot.fi — `http://www.lounakirjastot.fi/kirjastot/tammela/`
- www.nivala.fi — `http://www.nivala.fi/palvelukanava/de4ed45c-b0e6-41ac-8d9d-108dc7938017`
- www.padasjoki.fi — `http://www.padasjoki.fi/fi/Palvelut/Kirjasto,-kulttuuri-ja-kansalaisopisto/Kirja`
- www.parainen.fi — `http://www.parainen.fi/web/tjanster/fi_FI/servicepunkten/`
- www.rautjarvi.fi — `http://www.rautjarvi.fi/fi/Palvelut/Sivistys,-nuoriso-ja-liikunta/Kirjasto/Aukio`
- www.sauvo.fi — `http://www.sauvo.fi/fi/palvelut/alisivu-4/sauvon-kirjasto/`
- www.suomussalmi.fi — `http://www.suomussalmi.fi/kirjasto`

**päivitä ohjaus** (19):

- outlook.office365.com — `https://outlook.office365.com/owa/calendar/Vantaaaikuisopisto@eduvantaa.onmicros` → `https://bookings.cloud.microsoft/book/Vantaaaikuisopisto@eduvantaa.onm`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Entressen_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Haukilahden_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Ison_Omenan_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Kalajarven_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Karhusuon_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Kauklahden_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Kauniaisten_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Laajalahden_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Laaksolahden_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Lippulaivan_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Noykkion_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Saunalahden_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Sellon_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Tapiolan_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Tikkurilan_kirjasto/Tapahtumat` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Tikkurilan_kirjasto/Tapahtumat` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.helmet.fi — `https://www.helmet.fi/fi-FI/Kirjastot_ja_palvelut/Viherlaakson_kirjasto` → `https://helmet.finna.fi/OrganisationInfo/Home`
- www.maunula.net — `https://www.maunula.net/maunula-seura/asukastila-maunulan-mediapaja/` → `https://kaupunginosat.fi/maunula/`

**tarkista käsin** (3):

- etelasavonha.fi — `https://etelasavonha.fi/asiointikanavat/monitoimijakeskus-omatori/`
- www.kuhmoinen.fi — `https://www.kuhmoinen.fi/content/fi/1/373161/Digiopastus.html`
- www.vanhustenturva.fi — `https://www.vanhustenturva.fi/toimintamme`

### `communityLinks.ts` — 65 kpl

**POISTA HETI** (2):

- Eläkeläisliittojen etujärjestö EETU ry — `https://www.eetu.fi/` → `https://sedo.com/search/details/?partnerid=324561&language=fi&domain=e`
- Suomen PAH-potilasyhdistys — `https://www.pah.fi/` → `https://catcha.fi/verkkotunnukset/pah.fi`

**poista** (40):

- AH-potilaat — `https://www.ah-potilaat.fi/`
- Aivolisäke-potilasyhdistys Sella — `https://www.aivolisake.fi/`
- Suomen Akustikusneurinoomayhdistys — `https://www.akustikusneurinooma.fi/`
- Suomen albinismiyhdistys — `https://www.albinismi.fi/`
- Etelä-Suomen Alopecia- ja Vitiligoyhdistys — `https://www.alopecia.fi/`
- Pohjois-Suomen Alopecia- ja Vitiligoyhdistys — `https://www.alopecia.fi/pohjois-suomi`
- ALS-tutkimuksen tuki — `https://www.als-tutkimus.fi/`
- Suomen Amyloidoosiyhdistys — `https://www.amyloidoosi.fi/`
- Autistien ja Rett-henkilöiden Tuki ry — `https://www.autistienettutuki.fi/`
- Suomen CF-yhdistys — `https://www.cf-yhdistys.fi/`
- Suomen Chiari- ja syringomyeliayhdistys — `https://www.chiari.fi/`
- Suomen Dystoniayhdistys — `https://www.dystonia.fi/`
- Suomen EB-yhdistys — `https://www.eb-yhdistys.fi/`
- Erityislasten Omaiset ELO — `https://www.elory.fi/`
- Suomen Fabry-yhdistys — `https://www.fabry.fi/`
- Frax — `https://www.frax.fi/`
- FSHD-yhdistys — `https://www.fshd.fi/`
- GNAO1 Tuki — `https://www.gnao1tuki.fi/`
- Suomen HHT/Osler-yhdistys — `https://www.hhtosler.fi/`
- Ihoyhdistys — `https://www.ihoyhdistys.fi/`
- ITP Suomi — `https://www.itpsuomi.fi/`
- Suomen Kampurajalkayhdistys — `https://www.kampurajalkayhdistys.fi/`
- Karpatiat — `https://www.karpatiat.fi/`
- Marfan ja sen kaltaiset sairaudet ry — `https://www.marfanyhdistys.fi/`
- Suomen MG-yhdistys — `https://www.mg-yhdistys.fi/`
- Mitokondrioyhdistys — `https://www.mitokondrioyhdistys.fi/`
- Suomen NF-yhdistys — `https://www.nf-yhdistys.fi/`
- OUKALI ry — `https://www.oukali.fi/`
- Suomen Palovammayhdistys — `https://www.palovammayhdistys.fi/`
- Suomen PANS/PANDAS — `https://www.panspandas.fi/`
- Pohjanmaan museo — `https://www.pohjanmaanmuseo.fi/`
- Suomen PWS-yhdistys — `https://www.pws.fi/`
- Suomen mediamuseo Rupriikki — `https://www.rupriikki.fi/`
- Satakunnan museo — `https://www.satakuntamuseo.fi/`
- Suomen Sklerodermayhdistys — `https://www.skleroderma.fi/`
- Suomen Sotos-perheiden tukiyhdistys — `https://www.sotos.fi/`
- SUHUPO — `https://www.suhupo.fi/`
- Valoihottumayhdistys — `https://www.valoihottuma.fi/`
- Suomen Vaskuliittiyhdistys — `https://www.vaskuliitti.fi/`
- Waldenström Finland ry — `https://www.waldenstrom.fi/`

**korjaa osoite** (5):

- Hämeen linna — `https://www.hameenlinna.fi/hameenlinna`
- Hämeenlinnan taidemuseo — `https://www.hameenlinna.fi/taidemuseo`
- Seurasaaren ulkomuseo — `https://www.kansallismuseo.fi/seurasaari`
- Oulun taidemuseo — `https://www.ouka.fi/oulun-taidemuseo`
- Rovaniemen taidemuseo — `https://www.rovaniemi.fi/taidemuseo`

**päivitä ohjaus** (14):

- Aboa Vetus & Ars Nova — `https://www.aboavetusarsnova.fi/` → `https://avan.fi/`
- Suomen Hemofiliayhdistys — `https://www.hemofilia.fi/` → `https://verenvuotosairaudet.fi/`
- Immuunipuutospotilaiden yhdistys Imppu — `https://www.imppu.fi/` → `https://immuunipuutospotilaidenyhdistys.fi/`
- Suomen kello- ja korumuseo — `https://www.kellomuseo.fi/` → `https://www.museokruunu.fi/`
- Luonnontieteellinen keskusmuseo LUOMUS — `https://www.luomus.fi/` → `https://www.helsinki.fi/fi/luomus`
- Suomen merimuseo — `https://www.merimuseo.fi/` → `https://www.kansallismuseo.fi/fi/suomenmerimuseo`
- Arkkitehtuurimuseo — `https://www.mfa.fi/` → `https://admuseo.fi/`
- Suomen Noonan-yhdistys — `https://www.noonan.fi/` → `https://www.noonansuomi.net/`
- Oulun taidemuseo — `https://www.ouka.fi/taidemuseo` → `https://ouluntaidemuseo.fi/`
- Suomen pelimuseo — `https://www.pelimuseo.fi/` → `https://www.vapriikki.fi/nayttelyt/suomen-pelimuseo-nayttelyt/`
- Sydänlapset ja -aikuiset — `https://www.sydanlapset.fi/` → `https://sydanlapsetjaaikuiset.fi/`
- Suomen urheilumuseo — `https://www.urheilumuseo.fi/` → `https://tahto.com/`
- Vantaan Muistiyhdistys ry — `https://www.vantaanmuisti.fi/fi/etusivu` → `https://muistiliitto.fi/muistiyhdistykset/vantaan-muistiyhdistys-ry/et`
- Suomen työväenmuseo Werstas — `https://www.werstas.fi/` → `https://www.tyovaenmuseo.fi/`

**tarkista käsin** (4):

- Suomen Angelman-yhdistys — `https://www.angelman.fi/`
- Designmuseo — `https://www.designmuseo.fi/`
- Suomen fruktoosi-intolerantikot (HFI) — `https://www.hfi.fi/`
- Suomen Ehlers-Danlos yhdistys (SEDY) — `https://www.sedy.fi/`

### `localServices.ts` — 14 kpl

**poista** (1):

- www.lansi-uusimaa.fi — `https://www.lansi-uusimaa.fi/`

**päivitä HTTPS** (3):

- Eepos-kirjastot — `http://eepos.finna.fi/` → `https://eepos.finna.fi/`
- Fredrikabiblioteken — `http://fredrika.finna.fi/` → `https://fredrika.finna.fi/`
- Lapin kirjasto — `http://lapinkirjasto.finna.fi/` → `https://lapinkirjasto.finna.fi/`

**päivitä ohjaus** (5):

- kainuunhyvinvointialue.fi — `https://kainuunhyvinvointialue.fi/` → `https://hyvinvointialue.kainuu.fi/`
- sata.fi — `https://sata.fi/` → `https://satakunnanhyvinvointialue.fi/`
- sata.fi — `https://sata.fi/ajankohtaista/` → `https://satakunnanhyvinvointialue.fi/ajankohtaista/`
- Helmet-kirjastot — `https://www.helmet.fi/` → `https://helmet.finna.fi/`
- Oulun joukkoliikenne — `https://www.oulunjoukkoliikenne.fi/` → `https://www.osl.fi/`

**tarkista käsin** (5):

- Härmän Liikenne reittiliikenne — `https://harmanliikenne.fi/reittiliikenne/`
- PIKI-kirjastot — `https://piki.fi/`
- Utsjoen yhteydet — `https://exploreutsjoki.fi/yhteydet/`
- Kuhmoisten julkinen liikenne — `https://www.kuhmoinen.fi/asuminen%20ja%20ymp%C3%A4rist%C3%B6/kadut%20ja%20liiken`
- Liikenne Rundgren reitit — `https://www.rundgrenoy.fi/`

### `constants.tsx` — 12 kpl

**päivitä ohjaus** (2):

- X (Twitter) — `https://twitter.com/` → `https://x.com/`
- Google — `https://www.google.fi/` → `https://www.google.com/`

**tarkista käsin** (10):

- Ryhmäteatteri — `https://ryhmateatteri.fi/`
- Lippu.fi — `https://www.lippu.fi/`
- Luontoon.fi — `https://www.luontoon.fi/`
- Ortodoksinen kirkko — `https://www.ort.fi/`
- Tjäreborg — `https://www.tjareborg.fi/`
- Zodiak – Uuden tanssin keskus — `https://www.zodiak.fi/`
- Huawei AppGallery — `https://appgallery.huawei.com/`
- Retkipaikka — `https://retkipaikka.fi/`
- WhatsApp Web — `https://web.whatsapp.com/`
- Tulospalvelu.fi — `https://www.tulospalvelu.fi/`

### `localExerciseLinks.ts` — 9 kpl

**korjaa osoite** (8):

- akaa.fi — `https://akaa.fi/tee-ja-viihdy/liikunta/erityisryhmien-liikunta/liikuntaryhmat/`
- kiuruvesi.fi — `https://kiuruvesi.fi/palvelut/liikunta-ja-ulkoilu/ohjatut-liikuntaryhmat-2024-20`
- lappeenranta.fi — `https://lappeenranta.fi/fi/kulttuuri-ja-liikunta/liikunta/ohjattu-liikunta/terve`
- www.kuopio.fi — `https://www.kuopio.fi/vapaa-aika-ja-hyvinvointi/liikkuva-kuopio/vertaisohjattu-l`
- www.petajavesi.fi — `https://www.petajavesi.fi/vapaa-aika-ja-kulttuuri/vapaa-ajan-palvelut2017/sovelt`
- www.pori.fi — `https://www.pori.fi/vapaa-aika/liikunta/ohjattu-liikunta/kesaliikunta/`
- www.pudasjarvi.fi — `https://www.pudasjarvi.fi/liikuntapalvelut/liikuntatarjonta/`
- www.savukoski.fi — `https://www.savukoski.fi/news-article/liikuntapalvelut/`

**tarkista käsin** (1):

- www.kuhmoinen.fi — `https://www.kuhmoinen.fi/tapahtumat/Liikuntatapahtumat/198%20-%20Tuolijumppa`

### `localServiceTransportLinks.ts` — 9 kpl

**korjaa osoite** (8):

- Kiuruvesi palveluliikenne — `https://kiuruvesi.fi/asuminen-ja-ymparisto/liikenne/palveluliikenne/`
- Lapinlahti asiointiliikenne — `https://lapinlahti.fi/liikenne/`
- Parikkala palveluliikenne — `https://parikkala.fi/asuminen-ja-ymparisto/joukkoliikenne/`
- Kuopio PALI-palveluliikenne — `https://vilkku.kuopio.fi/pali`
- Joroinen palveluliikenne — `https://www.joroinen.fi/asuminen-ja-ymparisto/liikenne/palveluliikenne-pali/`
- Ähtäri asiointiliikenne — `https://www.petripekkala.com/asiointiliikenne.html`
- Pudasjärvi palveluliikenne — `https://www.pudasjarvi.fi/asuminen-ja-ymparisto/liikenneyhteydet/asiointiliikenn`
- Sonkajärvi asiointi- ja palveluliikenne — `https://www.sonkajarvi.fi/asuminen-ja-ymparisto/tiet-ja-liikenne/joukkoliikenne/`

**tarkista käsin** (1):

- Parkano palveluliikenne — `https://parkano.fi/palveluliikenne/`

### `municipalityWebsiteLocales.ts` — 4 kpl

**korjaa osoite** (3):

- www.juuka.fi — `https://www.juuka.fi/en/web/english`
- www.juuka.fi — `https://www.juuka.fi/ru/web/russian`
- www.rantasalmi.fi — `https://www.rantasalmi.fi/en/`

**päivitä ohjaus** (1):

- www.tyrnava.fi — `https://www.tyrnava.fi/en/home.html` → `https://account.lianacloud.com/?iss=https%3A%2F%2Fauth.lianacloud.com%`

### `municipalityWebsites.ts` — 3 kpl

**poista** (1):

- www.vimpeli.fi — `https://www.vimpeli.fi/`

**tarkista käsin** (2):

- marttila.fi — `https://marttila.fi/`
- www.kuhmoinen.fi — `https://www.kuhmoinen.fi/`

### `localNewspaperLinks.ts` — 3 kpl

**korjaa osoite** (1):

- www.kaleva.fi — `https://www.kaleva.fi/oulun-seutu/`

**päivitä ohjaus** (1):

- www.karkkilantienoo.fi — `https://www.karkkilantienoo.fi/` → `https://www.karkkilalainen.fi/`

**tarkista käsin** (1):

- www.tervareitti.fi — `https://www.tervareitti.fi/`

### `localSportsClubs.ts` — 3 kpl

**päivitä ohjaus** (1):

- Esport Oilers — `https://www.esportoilers.fi/` → `https://oilers.fi/`

**tarkista käsin** (2):

- Porin Ässät — `https://assat.com/`
- PK Keski-Uusimaa — `https://pkku.fi/`

### `localSeniorLinks.ts` — 2 kpl

**korjaa osoite** (2):

- www.pudasjarvi.fi — `https://www.pudasjarvi.fi/asuminen-ja-ymparisto/seniorit/`
- www.riihimaki.fi — `https://www.riihimaki.fi/ela-ja-voi-hyvin/hyvinvointi/aktiivisuutta-arkeen/avoin`

### `municipalityNewsFeeds.ts` — 1 kpl

**poista** (1):

- www.vimpeli.fi — `https://www.vimpeli.fi/rss.xml`

