# Yhdistyslinkkien uudelleentarkistus 30.8.2026

Tarkistuksen kohteena olivat korjauslistan 39 vanhaa, yksilöllistä `communityLinks.ts`-verkkotunnusta. Niihin liittyi 40 sovelluksen linkkiriviä, koska `alopecia.fi` oli käytössä sekä Etelä- että Pohjois-Suomen yhdistyksellä. Joukossa oli yhdistysten lisäksi kolme museolinkkiä.

## Tulos

- Kaikille 40 linkkiriville löytyi luotettava korvaava sivu.
- 39 korvaavaa osoitetta vastasi teknisessä GET-tarkistuksessa HTTP 200.
- Suomen Amyloidoosiyhdistyksen oma sivu vastasi tarkistusasiakkaalle HTTP 403, mutta sivu avautui hakukoneen selaintarkistuksessa ja sen sisältö, yhteystiedot sekä yhdistyksen nimi varmistettiin. Tämä on bottisuojaus, ei rikkinäinen linkki.
- Yhtään yhdistystä ei piilotettu listalta. Vanhoja kuolleita osoitteita ei jäänyt `communityLinks.ts`-tiedostoon.
- Chiari-yhdistyksen uusi oma sivu löytyi, mutta sen TLS-kättely epäonnistui Windowsin ja tuotantotarkistuksen käyttämällä tavalla. Siksi käyttäjälle annetaan Neuroliiton ajantasainen jäsenyhdistyssivu eikä teknisesti epäluotettavaa omaa osoitetta.

Tekninen tarkistus tehtiin selainmaisella käyttäjätunnisteella, uudelleenohjaukset sallien ja 20 sekunnin aikarajalla. Sisällöllinen varmistus perustui ensisijaisesti yhdistyksen omaan sivuun ja toissijaisesti nykyiseen kattojärjestöön, kuten HARSOon, Neuroliittoon, Iholiittoon, Tukiliittoon tai viralliseen museotoimijaan.

## Korvaukset

| Nimi | Vanha osoite | Uusi luotettava sivu | Peruste |
| --- | --- | --- | --- |
| AH-potilaat | `ah-potilaat.fi` | [ah-potilaat.org](https://www.ah-potilaat.org/) | Yhdistyksen oma nykyinen sivu; myös HARSO linkittää tähän. |
| Aivolisäke-potilasyhdistys Sella | `aivolisake.fi` | [sellanet.com](https://sellanet.com/) | Yhdistyksen oma nykyinen sivu. |
| Suomen Akustikusneurinoomayhdistys | `akustikusneurinooma.fi` | [akustikusneurinoomayhdistys.com](https://www.akustikusneurinoomayhdistys.com/) | Yhdistyksen oma nykyinen sivu; HARSO-varmennus. |
| Suomen albinismiyhdistys | `albinismi.fi` | [albinismiyhdistys.omasivu.fi](https://albinismiyhdistys.omasivu.fi/) | Yhdistyksen oma nykyinen sivu; HARSO-varmennus. |
| Etelä-Suomen Alopecia- ja Vitiligoyhdistys | `alopecia.fi` | [Etelä-Suomi](https://www.alopeciavitiligo.fi/yhdistykset/etela-suomi/) | Kahden yhdistyksen ylläpitämän nykyisen sivuston oma yhdistyssivu. |
| Pohjois-Suomen Alopecia- ja Vitiligoyhdistys | `alopecia.fi/pohjois-suomi` | [Pohjois-Suomi](https://www.alopeciavitiligo.fi/yhdistykset/pohjois-suomi/) | Kahden yhdistyksen ylläpitämän nykyisen sivuston oma yhdistyssivu. |
| ALS-tutkimuksen tuki | `als-tutkimus.fi` | [alstuttu.org](https://www.alstuttu.org/) | Yhdistyksen oma nykyinen sivu. |
| Suomen Amyloidoosiyhdistys | `amyloidoosi.fi` | [suomenamyloidoosiyhdistys.fi](https://suomenamyloidoosiyhdistys.fi/) | Oma nykyinen sivu; sisältö ja yhteystiedot varmistettu bottisuojauksesta huolimatta. |
| Autistien ja Rett-henkilöiden Tuki ry | `autistienettutuki.fi` | [Rett Finland ry](https://www.rettfinland.fi/) | Nykyinen yhdistysnimi ja oma sivu; HARSO-varmennus. Nimi päivitettiin sovellukseen. |
| Suomen CF-yhdistys | `cf-yhdistys.fi` | [Suomen CF-yhdistys](https://www.hengitysyhdistys.fi/suomencf/) | Hengitysyhdistyksen ylläpitämä nykyinen yhdistyssivu. |
| Suomen Chiari- ja syringomyeliayhdistys | `chiari.fi` | [Neuroliiton jäsenyhdistykset](https://neuroliitto.fi/yhdistykset/jasenyhdistykset/) | Neuroliiton ajantasainen jäsenyhdistyssivu. Oma uusi domain löytyi, mutta sen TLS ei toimi luotettavasti. |
| Suomen Dystoniayhdistys | `dystonia.fi` | [dystoniayhdistys.com](https://dystoniayhdistys.com/) | Yhdistyksen oma nykyinen sivu. |
| Suomen EB-yhdistys | `eb-yhdistys.fi` | [Iholiiton EB-yhdistyssivu](https://www.iholiitto.fi/eb-yhdistys/) | Iholiiton ylläpitämä yhdistyksen oma sivu. |
| Erityislasten Omaiset ELO | `elory.fi` | [erityislastenomaiset.fi](https://erityislastenomaiset.fi/) | Yhdistyksen oma nykyinen sivu. |
| Suomen Fabry-yhdistys | `fabry.fi` | [fabry.neuroliitto.fi](https://fabry.neuroliitto.fi/) | Neuroliiton palvelussa oleva yhdistyksen oma sivu; HARSO-varmennus. |
| Frax | `frax.fi` | [fraxry.wordpress.com](https://fraxry.wordpress.com/) | HARSO ry:n nykyisin linkittämä yhdistyksen sivu. |
| FSHD-yhdistys | `fshd.fi` | [fshdfinland.org](https://fshdfinland.org/) | Yhdistyksen oma nykyinen sivu. |
| GNAO1 Tuki | `gnao1tuki.fi` | [gnao1.fi](https://www.gnao1.fi/) | Yhdistyksen oma sivu; HARSO-varmennus. |
| Suomen HHT/Osler-yhdistys | `hhtosler.fi` | [hht-osler.fi](https://hht-osler.fi/) | Yhdistyksen oma nykyinen sivu; HARSO-varmennus. |
| Ihoyhdistys | `ihoyhdistys.fi` | [Iholiiton Ihoyhdistyssivu](https://www.iholiitto.fi/ihoyhdistys/) | Iholiiton ylläpitämä yhdistyksen oma sivu. |
| ITP Suomi | `itpsuomi.fi` | [ITP – Verenvuotosairaudet ry](https://verenvuotosairaudet.fi/verenvuototaudit/itp-eli-immuuni-trombosytopenia/) | ITP Suomi yhdistyi Verenvuotosairaudet ry:hyn; nimi päivitettiin sovellukseen. |
| Suomen Kampurajalkayhdistys | `kampurajalkayhdistys.fi` | [skyry.org](https://www.skyry.org/) | Yhdistyksen oma nykyinen sivu. |
| Karpatiat | `karpatiat.fi` | [Sydänliiton Karpatiat-sivu](https://sydan.fi/karpatiat/) | Sydänliiton ylläpitämä nykyinen yhdistyssivu. |
| Marfan ja sen kaltaiset sairaudet ry | `marfanyhdistys.fi` | [marfan.fi](https://www.marfan.fi/) | Yhdistyksen oma nykyinen sivu; HARSO-varmennus. |
| Suomen MG-yhdistys | `mg-yhdistys.fi` | [suomenmg-yhdistys.fi](https://www.suomenmg-yhdistys.fi/) | Yhdistyksen oma nykyinen sivu. |
| Mitokondrioyhdistys | `mitokondrioyhdistys.fi` | [mitokondrioyhdistys.neuroliitto.fi](https://mitokondrioyhdistys.neuroliitto.fi/) | Neuroliiton palvelussa oleva yhdistyksen oma sivu. |
| Suomen NF-yhdistys | `nf-yhdistys.fi` | [snf.fi](https://www.snf.fi/) | Yhdistyksen oma nykyinen sivu; HARSO-varmennus. |
| OUKALI ry | `oukali.fi` | [oukali-lihastautiyhdistys.com](https://www.oukali-lihastautiyhdistys.com/) | Yhdistyksen oma nykyinen sivu. |
| Suomen Palovammayhdistys | `palovammayhdistys.fi` | [Iholiiton Palovammayhdistyssivu](https://www.iholiitto.fi/jasenjarjestot/palovammayhdistys/) | Iholiiton ylläpitämä yhdistyksen oma sivu. |
| Suomen PANS/PANDAS | `panspandas.fi` | [panspandas.wordpress.com](https://panspandas.wordpress.com/) | Yhdistyksen oma nykyinen sivu. |
| Suomen PWS-yhdistys | `pws.fi` | [pws-yhdistys.fi](https://www.pws-yhdistys.fi/) | Yhdistyksen oma nykyinen sivu; HARSO-varmennus. |
| Suomen Sklerodermayhdistys | `skleroderma.fi` | [sklero.org](https://www.sklero.org/) | Yhdistyksen oma nykyinen sivu. |
| Suomen Sotos-perheiden tukiyhdistys | `sotos.fi` | [Sotosin oireyhtymä – Tukiliitto](https://www.tukiliitto.fi/diagnoosit/sotosin-oireyhtyma/) | Tukiliiton ylläpitämä ajantasainen tieto- ja vertaistukisivu; nimi päivitettiin vastaamaan kohdetta. |
| SUHUPO | `suhupo.fi` | [halkio.com](https://www.halkio.com/) | Yhdistyksen oma nykyinen sivu. |
| Valoihottumayhdistys | `valoihottuma.fi` | [valoihottuma.allergia.fi](https://valoihottuma.allergia.fi/) | Allergia-, iho- ja astmaliiton palvelussa oleva yhdistyksen oma sivu. |
| Suomen Vaskuliittiyhdistys | `vaskuliitti.fi` | [vaskuliittiyhdistys.fi](https://www.vaskuliittiyhdistys.fi/) | Yhdistyksen oma nykyinen sivu. |
| Waldenström Finland ry | `waldenstrom.fi` | [wmfin.fi](https://www.wmfin.fi/) | Yhdistyksen oma nykyinen sivu; HARSO-varmennus. |

## Samassa korjausjonossa olleet museot

Nämä kolme eivät kuulu 39 yhdistysverkkotunnukseen, mutta ne tarkistettiin ja korjattiin samalla, koska ne olivat samoissa `communityLinks.ts`-poistoriveissä.

| Nimi | Vanha osoite | Uusi luotettava sivu | Peruste |
| --- | --- | --- | --- |
| Pohjanmaan museo | `pohjanmaanmuseo.fi` | [Vaasan kaupungin Pohjanmaan museo](https://www.vaasa.fi/koe-ja-nae/kulttuuria-vaasassa-ja-seudulla/vaasan-museot/pohjanmaan-museo/) | Vaasan kaupungin virallinen nykyinen museosivu. |
| Suomen mediamuseo Rupriikki | `rupriikki.fi` | [Postimuseon ja Tampereen historiallisten museoiden vastuumuseotehtävä](https://www.postimuseo.fi/tiedotteet/postimuseo-ja-tampereen-historialliset-museot-saivat-yhdessa-valtakunnallisen-vastuumuseotehtavan/) | Virallinen, teknisesti toimiva sivu vahvistaa Rupriikin nykyisen vastuumuseotehtävän. |
| Satakunnan museo | `satakuntamuseo.fi` | [satakunnanmuseo.pori.fi](https://satakunnanmuseo.pori.fi/) | Porin kaupungin virallinen nykyinen museosivu. |

## Ylläpidon jatkotoimi

Korvaukset ovat nyt mukana samassa automaattisessa tarkistuksessa kuin muut katalogilinkit. HTTP 403/429 luokitellaan varoitukseksi eikä sitä piiloteta. Vain toistuvat, varmat viat kuten DNS-virhe, TLS-virhe, 404/410 tai verkkotunnuksen kauppapaikka voivat johtaa automaattiseen estoon; joukkovirhekatkaisin estää oman verkkovian leviämisen linkkiestoiksi.
