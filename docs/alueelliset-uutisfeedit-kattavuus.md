# Alueellisten uutisfeedien kattavuus

Päivitetty: 12.7.2026

Tämä raportti erottaa kolme uutislähdetyyppiä:

- paikallislehden RSS-/feed-linkki tiedostosta `localNewspaperFeeds.ts` tai kuntakohtaisesta `localServices.ts`-määrittelystä
- kunnan oma uutisvirta tiedostosta `municipalityNewsFeeds.ts` tai tiedoston `localServices.ts` kuntakohtaisista `rssFeeds`-riveistä, kun syötteen hosti on kunnan oma palveluhosti
- hyvinvointialueen uutislinkki tiedoston `localServices.ts` `wellbeingAreaNewsUrls`-kartasta

Koneellinen JSON-raportti: `outputs/regional-news-feed-coverage.json`
Kuntakohtainen CSV-taulukko: `docs/alueelliset-uutisfeedit-kattavuus.csv`

## Yhteenveto

| Mittari | Kuntia |
| --- | ---: |
| Kuntia yhteensä | 308 |
| Paikallislehden uutisfeed | 45 |
| Kunnan oma uutisvirta | 170 |
| Jokin oma uutisvirta, eli paikallislehti tai kunta | 214 |
| Ei omaa uutisvirtaa, mutta hyvinvointialueen uutislinkki on saatavilla | 94 |
| Ei mitään uutislähdettä datassa | 0 |

## Kunnat, joilla on paikallislehden uutisfeed

| Kunta | Hyvinvointialue | Lähde |
| --- | --- | --- |
| Akaa | Pirkanmaan hyvinvointialue | [Akaan Seutu](https://akaanseutu.fi/feed/) |
| Haapavesi | Pohjois-Pohjanmaan hyvinvointialue | [Haapavesi (lehti)](https://www.haapavesi-lehti.fi/feed) |
| Heinävesi | Pohjois-Karjalan hyvinvointialue | [Heinäveden Lehti](https://www.heinavedenlehti.fi/feed/rss) |
| Hämeenkyrö | Pirkanmaan hyvinvointialue | [Hämeenkyrön Sanomat](https://hameenkyronsanomat.fi/feed/) |
| Ilmajoki | Etelä-Pohjanmaan hyvinvointialue | [Ilmajoki-lehti](https://www.ilmajoki-lehti.fi/feed/) |
| Juva | Etelä-Savon hyvinvointialue | [Juvan Lehti](https://www.juvanlehti.fi/feed/rss) |
| Kaarina | Varsinais-Suomen hyvinvointialue | [Kaarina-lehti](https://www.kaarina-lehti.fi/feed/)<br>[Kunnallislehti Paimio-Sauvo-Kaarina](https://www.kuntsari.fi/feed/) |
| Kalajoki | Pohjois-Pohjanmaan hyvinvointialue | [Kalajoen Seutu](https://kalajoenseutu.net/feed/) |
| Kangasala | Pirkanmaan hyvinvointialue | [Kangasalan Sanomat](https://kangasalansanomat.fi/feed/) |
| Kangasniemi | Etelä-Savon hyvinvointialue | [Kangasniemen Kunnallislehti](https://www.kangasniemenlehti.fi/feed/rss) |
| Karkkila | Länsi-Uudenmaan hyvinvointialue | [Karkkilan Tienoo](https://www.karkkilalainen.fi/feed/rss) |
| Keitele | Pohjois-Savon hyvinvointialue | [Pielavesi-Keitele](https://www.pielavesi-keitele.fi/feed/rss) |
| Kiuruvesi | Pohjois-Savon hyvinvointialue | [Kiuruvesi-lehti](https://kiuruvesilehti.fi/feed/) |
| Kokemäki | Satakunnan hyvinvointialue | [Kokemäkeläinen](http://kokemakelainen.net/feed/) |
| Konnevesi | Keski-Suomen hyvinvointialue | [Laukaa-Konnevesi](https://www.laukaa-konnevesi.fi/feed/rss) |
| Kuhmo | Kainuun hyvinvointialue | [Kuhmolainen](https://www.kuhmolainen.fi/feed) |
| Laitila | Varsinais-Suomen hyvinvointialue | [Laitilan Sanomat](https://www.laitilansanomat.fi/feed/) |
| Laukaa | Keski-Suomen hyvinvointialue | [Laukaa-Konnevesi](https://www.laukaa-konnevesi.fi/feed/rss) |
| Lempäälä | Pirkanmaan hyvinvointialue | [Lempäälän-Vesilahden Sanomat](https://lvs.fi/feed/) |
| Lieksa | Pohjois-Karjalan hyvinvointialue | [Lieksan Lehti](https://www.lieksanlehti.fi/feed/rss) |
| Loimaa | Varsinais-Suomen hyvinvointialue | [Loimaan Lehti](https://www.loimaanlehti.fi/feed/) |
| Loppi | Kanta-Hämeen hyvinvointialue | [Lopen Lehti](https://www.lopenlehti.fi/feed/rss) |
| Loviisa | Itä-Uudenmaan hyvinvointialue | [Loviisan Sanomat](https://www.loviisansanomat.fi/feed/rss) |
| Nivala | Pohjois-Pohjanmaan hyvinvointialue | [Nivala (lehti)](https://www.nivala-lehti.fi/feed) |
| Orivesi | Pirkanmaan hyvinvointialue | [Oriveden Sanomat](https://orivedensanomat.fi/feed/) |
| Oulu | Pohjois-Pohjanmaan hyvinvointialue | [Kaleva: Oulun seutu](https://kaleva.fi/feedit/rss/managed-listing/oulun-seutu/) |
| Outokumpu | Pohjois-Karjalan hyvinvointialue | [Outokummun Seutu](https://www.outokummunseutu.fi/feed/rss) |
| Paimio | Varsinais-Suomen hyvinvointialue | [Kunnallislehti Paimio-Sauvo-Kaarina](https://www.kuntsari.fi/feed/) |
| Parainen | Varsinais-Suomen hyvinvointialue | [Pargas Kungörelser - Paraisten Kuulutukset](https://www.pku.fi/feed/) |
| Parikkala | Etelä-Karjalan hyvinvointialue | [Parikkalan-Rautjärven Sanomat](https://www.prsanomat.fi/feed/rss) |
| Pielavesi | Pohjois-Savon hyvinvointialue | [Pielavesi-Keitele](https://www.pielavesi-keitele.fi/feed/rss) |
| Pietarsaari | Pohjanmaan hyvinvointialue | [Pietarsaaren Sanomat](https://www.pietarsaarensanomat.fi/feed) |
| Pirkkala | Pirkanmaan hyvinvointialue | [Pirkkalainen](https://pirkkalainen.fi/feed/) |
| Pyhäjärvi | Pohjois-Pohjanmaan hyvinvointialue | [Pyhäjärven Sanomat](https://pyhajarvensanomat.fi/feed/) |
| Rautjärvi | Etelä-Karjalan hyvinvointialue | [Parikkalan-Rautjärven Sanomat](https://www.prsanomat.fi/feed/rss) |
| Sauvo | Varsinais-Suomen hyvinvointialue | [Kunnallislehti Paimio-Sauvo-Kaarina](https://www.kuntsari.fi/feed/) |
| Somero | Varsinais-Suomen hyvinvointialue | [Somero (lehti)](https://www.somerolehti.fi/feed/) |
| Sotkamo | Kainuun hyvinvointialue | [Sotkamo-lehti](https://www.sotkamolehti.fi/feed) |
| Sulkava | Etelä-Savon hyvinvointialue | [Sulkava-lehti](https://sulkavalehti.fi/feed/) |
| Urjala | Pirkanmaan hyvinvointialue | [Urjalan Sanomat](https://urjalansanomat.fi/feed/) |
| Uusikaupunki | Varsinais-Suomen hyvinvointialue | [Uudenkaupungin Sanomat](https://www.uudenkaupunginsanomat.fi/feed/) |
| Varkaus | Pohjois-Savon hyvinvointialue | [Warkauden Lehti](https://www.warkaudenlehti.fi/feed/rss) |
| Vesilahti | Pirkanmaan hyvinvointialue | [Lempäälän-Vesilahden Sanomat](https://lvs.fi/feed/) |
| Viitasaari | Keski-Suomen hyvinvointialue | [Viitasaaren Seutu](https://www.viitasaarenseutu.fi/feed/rss) |
| Ylöjärvi | Pirkanmaan hyvinvointialue | [Ylöjärven Uutiset](https://ylojarvenuutiset.fi/feed/) |

## Kunnat, joilla on kunnan oma uutisvirta

| Kunta | Hyvinvointialue | Lähde |
| --- | --- | --- |
| Alavieska | Pohjois-Pohjanmaan hyvinvointialue | [Alavieska uutiset](https://www.alavieska.fi/rss.xml) |
| Asikkala | Päijät-Hämeen hyvinvointialue | [Asikkala uutiset](https://asikkala.fi/feed/) |
| Askola | Itä-Uudenmaan hyvinvointialue | [Askola uutiset](https://askola.fi/feed/) |
| Brändö | Ahvenanmaa | [Brändö uutiset](https://www.brando.ax/feed/) |
| Enonkoski | Etelä-Savon hyvinvointialue | [Enonkoski uutiset](https://enonkoski.fi/feed/) |
| Espoo | Länsi-Uudenmaan hyvinvointialue | [Espoon uutiset](https://www.espoo.fi/fi/rss/news)<br>[Espoon artikkelit](https://www.espoo.fi/fi/rss/articles) |
| Eura | Satakunnan hyvinvointialue | [Eura uutiset](https://www.eura.fi/feed/) |
| Finström | Ahvenanmaa | [Finström uutiset](https://www.finstrom.ax/rss.xml) |
| Haapajärvi | Pohjois-Pohjanmaan hyvinvointialue | [Haapajärvi uutiset](https://www.haapajarvi.fi/rss.xml) |
| Hailuoto | Pohjois-Pohjanmaan hyvinvointialue | [Hailuoto uutiset](https://hailuoto.fi/feed/) |
| Halsua | Keski-Pohjanmaan hyvinvointialue | [Halsua uutiset](https://halsua.fi/feed/) |
| Hamina | Kymenlaakson hyvinvointialue | [Hamina uutiset](https://www.hamina.fi/feed/) |
| Hankasalmi | Keski-Suomen hyvinvointialue | [Hankasalmi uutiset](https://hankasalmi.fi/feed/) |
| Hanko | Länsi-Uudenmaan hyvinvointialue | [Hanko uutiset](https://hanko.fi/feed/) |
| Harjavalta | Satakunnan hyvinvointialue | [Harjavalta uutiset](https://www.harjavalta.fi/feed/) |
| Hartola | Päijät-Hämeen hyvinvointialue | [Hartola uutiset](https://hartola.fi/feed/) |
| Hattula | Kanta-Hämeen hyvinvointialue | [Hattula uutiset](https://hattula.fi/feed/) |
| Heinola | Päijät-Hämeen hyvinvointialue | [Heinola uutiset](https://www.heinola.fi/feed/) |
| Helsinki | Helsingin kaupunki | [Helsingin uutiset](https://www.hel.fi/fi/uutiset) |
| Hirvensalmi | Etelä-Savon hyvinvointialue | [Hirvensalmi uutiset](https://www.hirvensalmi.fi/feed/) |
| Huittinen | Satakunnan hyvinvointialue | [Huittinen uutiset](https://www.huittinen.fi/feed/) |
| Hyrynsalmi | Kainuun hyvinvointialue | [Hyrynsalmi uutiset](https://hyrynsalmi.fi/feed/) |
| Hämeenlinna | Kanta-Hämeen hyvinvointialue | [Hämeenlinna uutiset](https://www.hameenlinna.fi/feed/) |
| Ii | Pohjois-Pohjanmaan hyvinvointialue | [Ii uutiset](https://www.ii.fi/rss.xml) |
| Iisalmi | Pohjois-Savon hyvinvointialue | [Iisalmi uutiset](https://iisalmi.fi/feed/) |
| Ikaalinen | Pirkanmaan hyvinvointialue | [Ikaalinen uutiset](https://ikaalinen.fi/feed/) |
| Ilomantsi | Pohjois-Karjalan hyvinvointialue | [Ilomantsi uutiset](https://www.ilomantsi.fi/feed/) |
| Imatra | Etelä-Karjalan hyvinvointialue | [Imatra uutiset](https://www.imatra.fi/rss.xml) |
| Inkoo | Länsi-Uudenmaan hyvinvointialue | [Inkoo uutiset](https://www.inga.fi/feed/) |
| Isojoki | Etelä-Pohjanmaan hyvinvointialue | [Isojoki uutiset](https://isojoki.fi/feed/) |
| Janakkala | Kanta-Hämeen hyvinvointialue | [Janakkala uutiset](https://www.janakkala.fi/feed/) |
| Joensuu | Pohjois-Karjalan hyvinvointialue | [Joensuu uutiset](https://www.joensuu.fi/feed/) |
| Joroinen | Pohjois-Savon hyvinvointialue | [Joroinen uutiset](https://www.joroinen.fi/category/uutiset/feed/) |
| Joutsa | Keski-Suomen hyvinvointialue | [Joutsa uutiset](https://www.joutsa.fi/feed/) |
| Juuka | Pohjois-Karjalan hyvinvointialue | [Juuka uutiset](https://www.juuka.fi/feed/) |
| Juupajoki | Pirkanmaan hyvinvointialue | [Juupajoki uutiset](https://juupajoki.fi/feed/) |
| Jyväskylä | Keski-Suomen hyvinvointialue | [Jyväskylä uutiset](https://www.jyvaskyla.fi/rss.xml) |
| Järvenpää | Keski-Uudenmaan hyvinvointialue | [Järvenpää uutiset](https://www.jarvenpaa.fi/feed) |
| Kaavi | Pohjois-Savon hyvinvointialue | [Kaavi uutiset](https://kaavi.fi/feed/) |
| Kajaani | Kainuun hyvinvointialue | [Kajaani uutiset](https://kajaani.fi/feed/) |
| Kankaanpää | Satakunnan hyvinvointialue | [Kankaanpää uutiset](https://www.kankaanpaa.fi/feed/) |
| Kannonkoski | Keski-Suomen hyvinvointialue | [Kannonkoski uutiset](https://kannonkoski.fi/rss.xml) |
| Kannus | Keski-Pohjanmaan hyvinvointialue | [Kannus uutiset](https://kannus.fi/feed/) |
| Karijoki | Etelä-Pohjanmaan hyvinvointialue | [Karijoki uutiset](https://karijoki.fi/feed/) |
| Karstula | Keski-Suomen hyvinvointialue | [Karstula uutiset](https://karstula.fi/feed/) |
| Karvia | Satakunnan hyvinvointialue | [Karvia uutiset](https://karvia.fi/feed/) |
| Kaskinen | Pohjanmaan hyvinvointialue | [Kaskinen uutiset](https://kaskinen.fi/fi/rss.xml) |
| Kauhajoki | Etelä-Pohjanmaan hyvinvointialue | [Kauhajoki uutiset](https://kauhajoki.fi/feed/) |
| Kauhava | Etelä-Pohjanmaan hyvinvointialue | [Kauhava uutiset](https://kauhava.fi/feed/) |
| Kauniainen | Länsi-Uudenmaan hyvinvointialue | [Kauniainen uutiset](https://www.kauniainen.fi/feed/) |
| Kaustinen | Keski-Pohjanmaan hyvinvointialue | [Kaustinen uutiset](https://kaustinen.fi/feed/) |
| Kemi | Lapin hyvinvointialue | [Kemi uutiset](https://www.kemi.fi/feed/) |
| Kemijärvi | Lapin hyvinvointialue | [Kemijärvi uutiset](https://kemijarvi.fi/feed/) |
| Kempele | Pohjois-Pohjanmaan hyvinvointialue | [Kempele uutiset](https://kempele.fi/feed/) |
| Keuruu | Keski-Suomen hyvinvointialue | [Keuruu uutiset](https://keuruu.fi/feed/) |
| Kirkkonummi | Länsi-Uudenmaan hyvinvointialue | [Kirkkonummi uutiset](https://kyrkslatt.fi/feed/) |
| Kittilä | Lapin hyvinvointialue | [Kittilä uutiset](https://kittila.fi/rss.xml) |
| Kivijärvi | Keski-Suomen hyvinvointialue | [Kivijärvi uutiset](https://www.kivijarvi.fi/rss.xml) |
| Kokkola | Keski-Pohjanmaan hyvinvointialue | [Kokkola uutiset](https://www.kokkola.fi/feed/) |
| Kontiolahti | Pohjois-Karjalan hyvinvointialue | [Kontiolahti uutiset](https://www.kontiolahti.fi/feed/) |
| Korsnäs | Pohjanmaan hyvinvointialue | [Korsnäs uutiset](https://www.korsnas.fi/feed/) |
| Koski Tl | Varsinais-Suomen hyvinvointialue | [Koski Tl uutiset](https://koski.fi/feed/) |
| Kotka | Kymenlaakson hyvinvointialue | [Kotka uutiset](https://www.kotka.fi/feed/) |
| Kouvola | Kymenlaakson hyvinvointialue | [Kouvola uutiset](https://www.kouvola.fi/feed/) |
| Kuopio | Pohjois-Savon hyvinvointialue | [Kuopio uutiset](https://www.kuopio.fi/feed/) |
| Kuortane | Etelä-Pohjanmaan hyvinvointialue | [Kuortane uutiset](https://kuortane.fi/feed/) |
| Kurikka | Etelä-Pohjanmaan hyvinvointialue | [Kurikka uutiset](https://kurikka.fi/feed/) |
| Kustavi | Varsinais-Suomen hyvinvointialue | [Kustavi uutiset](https://kustavi.fi/feed/) |
| Kyyjärvi | Keski-Suomen hyvinvointialue | [Kyyjärvi uutiset](https://www.kyyjarvi.fi/rss.xml) |
| Kärkölä | Päijät-Hämeen hyvinvointialue | [Kärkölä uutiset](https://karkola.fi/feed/) |
| Kökar | Ahvenanmaa | [Kökar uutiset](https://www.kokar.ax/blog-feed.xml) |
| Lahti | Päijät-Hämeen hyvinvointialue | [Lahti uutiset](https://www.lahti.fi/feed/) |
| Laihia | Pohjanmaan hyvinvointialue | [Laihia uutiset](https://laihia.fi/feed/) |
| Lapinjärvi | Itä-Uudenmaan hyvinvointialue | [Lapinjärvi uutiset](https://lapinjarvi.fi/feed/) |
| Lappajärvi | Etelä-Pohjanmaan hyvinvointialue | [Lappajärvi uutiset](https://lappajarvi.fi/feed/) |
| Lemi | Etelä-Karjalan hyvinvointialue | [Lemi uutiset](https://lemi.fi/feed/) |
| Leppävirta | Pohjois-Savon hyvinvointialue | [Leppävirta uutiset](https://leppavirta.fi/feed/) |
| Lestijärvi | Keski-Pohjanmaan hyvinvointialue | [Lestijärvi uutiset](https://lestijarvi.fi/feed/) |
| Lieto | Varsinais-Suomen hyvinvointialue | [Lieto uutiset](https://www.lieto.fi/feed/) |
| Liminka | Pohjois-Pohjanmaan hyvinvointialue | [Liminka uutiset](https://www.liminka.fi/feed/) |
| Liperi | Pohjois-Karjalan hyvinvointialue | [Liperi uutiset](https://www.liperi.fi/feed/) |
| Lohja | Länsi-Uudenmaan hyvinvointialue | [Lohja uutiset](https://www.lohja.fi/feed/) |
| Luhanka | Keski-Suomen hyvinvointialue | [Luhanka uutiset](https://www.luhanka.fi/feed/) |
| Lumijoki | Pohjois-Pohjanmaan hyvinvointialue | [Lumijoki uutiset](https://www.lumijoki.fi/feed/) |
| Luoto | Pohjanmaan hyvinvointialue | [Luoto uutiset](https://larsmo.fi/feed/) |
| Masku | Varsinais-Suomen hyvinvointialue | [Masku uutiset](https://masku.fi/feed) |
| Merikarvia | Satakunnan hyvinvointialue | [Merikarvia uutiset](https://merikarvia.fi/feed/) |
| Mikkeli | Etelä-Savon hyvinvointialue | [Mikkeli uutiset](https://mikkeli.fi/feed/) |
| Muhos | Pohjois-Pohjanmaan hyvinvointialue | [Muhos uutiset](https://muhos.fi/feed/) |
| Mustasaari | Pohjanmaan hyvinvointialue | [Mustasaari uutiset](https://korsholm.fi/feed) |
| Muurame | Keski-Suomen hyvinvointialue | [Muurame uutiset](https://www.muurame.fi/feed/) |
| Mynämäki | Varsinais-Suomen hyvinvointialue | [Mynämäki uutiset](https://www.mynamaki.fi/feed/) |
| Myrskylä | Itä-Uudenmaan hyvinvointialue | [Myrskylä uutiset](https://myrskyla.fi/feed/) |
| Mäntsälä | Keski-Uudenmaan hyvinvointialue | [Mäntsälä uutiset](https://www.mantsala.fi/feed/) |
| Mäntyharju | Etelä-Savon hyvinvointialue | [Mäntyharju uutiset](https://www.mantyharju.fi/feed/) |
| Naantali | Varsinais-Suomen hyvinvointialue | [Naantali uutiset](https://www.naantali.fi/fi/news/rss.xml) |
| Nokia | Pirkanmaan hyvinvointialue | [Nokia uutiset](https://www.nokiankaupunki.fi/feed/) |
| Nousiainen | Varsinais-Suomen hyvinvointialue | [Nousiainen uutiset](https://nousiainen.fi/feed/) |
| Nurmes | Pohjois-Karjalan hyvinvointialue | [Nurmes uutiset](https://www.nurmes.fi/feed/) |
| Nurmijärvi | Keski-Uudenmaan hyvinvointialue | [Nurmijärvi uutiset](https://www.nurmijarvi.fi/feed/) |
| Närpiö | Pohjanmaan hyvinvointialue | [Närpiö uutiset](https://www.narpes.fi/feed/) |
| Orimattila | Päijät-Hämeen hyvinvointialue | [Orimattila uutiset](https://orimattila.fi/feed/) |
| Oripää | Varsinais-Suomen hyvinvointialue | [Oripää uutiset](https://oripaa.fi/feed/) |
| Oulainen | Pohjois-Pohjanmaan hyvinvointialue | [Oulainen uutiset](https://www.oulainen.fi/rss.xml) |
| Oulu | Pohjois-Pohjanmaan hyvinvointialue | [Oulun kaupungin uutiset](https://www.ouka.fi/news/feed?audience=All&region=All&topic=All) |
| Padasjoki | Päijät-Hämeen hyvinvointialue | [Padasjoki uutiset](https://www.padasjoki.fi/feed) |
| Parkano | Pirkanmaan hyvinvointialue | [Parkano uutiset](https://parkano.fi/feed/) |
| Pelkosenniemi | Lapin hyvinvointialue | [Pelkosenniemi uutiset](https://pelkosenniemi.fi/feed/) |
| Perho | Keski-Pohjanmaan hyvinvointialue | [Perho uutiset](https://perho.com/feed/) |
| Petäjävesi | Keski-Suomen hyvinvointialue | [Petäjävesi uutiset](https://www.petajavesi.fi/feed/) |
| Pieksämäki | Etelä-Savon hyvinvointialue | [Pieksämäki uutiset](https://www.pieksamaki.fi/feed/) |
| Pihtipudas | Keski-Suomen hyvinvointialue | [Pihtipudas uutiset](https://pihtipudas.fi/feed/) |
| Pomarkku | Satakunnan hyvinvointialue | [Pomarkku uutiset](https://www.pomarkku.fi/feed/) |
| Pori | Satakunnan hyvinvointialue | [Pori uutiset](https://www.pori.fi/feed/) |
| Pornainen | Keski-Uudenmaan hyvinvointialue | [Pornainen uutiset](https://pornainen.fi/feed/) |
| Porvoo | Itä-Uudenmaan hyvinvointialue | [Porvoo uutiset](https://www.porvoo.fi/feed/) |
| Posio | Lapin hyvinvointialue | [Posio uutiset](https://www.posio.fi/feed/) |
| Puolanka | Kainuun hyvinvointialue | [Puolanka uutiset](https://puolanka.fi/feed/) |
| Puumala | Etelä-Savon hyvinvointialue | [Puumala uutiset](https://puumala.fi/feed/) |
| Pyhtää | Kymenlaakson hyvinvointialue | [Pyhtää uutiset](https://pyhtaa.fi/fi/rss.xml) |
| Pyhäjoki | Pohjois-Pohjanmaan hyvinvointialue | [Pyhäjoki uutiset](https://www.pyhajoki.fi/rss.xml) |
| Pyhäntä | Pohjois-Pohjanmaan hyvinvointialue | [Pyhäntä uutiset](https://www.pyhanta.fi/rss.xml) |
| Pyhäranta | Varsinais-Suomen hyvinvointialue | [Pyhäranta uutiset](https://www.pyharanta.fi/feed/) |
| Pälkäne | Pirkanmaan hyvinvointialue | [Pälkäne uutiset](https://www.palkane.fi/feed/) |
| Raahe | Pohjois-Pohjanmaan hyvinvointialue | [Raahe uutiset](https://www.raahe.fi/rss.xml) |
| Raasepori | Länsi-Uudenmaan hyvinvointialue | [Raasepori uutiset](https://www.raseborg.fi/feed/) |
| Raisio | Varsinais-Suomen hyvinvointialue | [Raisio uutiset](https://raisio.fi/fi/rss.xml?q=/fi/rss.xml) |
| Rantasalmi | Etelä-Savon hyvinvointialue | [Rantasalmi uutiset](https://rantasalmi.fi/feed/) |
| Ranua | Lapin hyvinvointialue | [Ranua uutiset](https://ranua.fi/feed/) |
| Rauma | Satakunnan hyvinvointialue | [Rauma uutiset](https://www.rauma.fi/feed/) |
| Rautalampi | Pohjois-Savon hyvinvointialue | [Rautalampi uutiset](https://www.rautalampi.fi/feed/) |
| Reisjärvi | Pohjois-Pohjanmaan hyvinvointialue | [Reisjärvi uutiset](https://www.reisjarvi.fi/rss.xml) |
| Ruovesi | Pirkanmaan hyvinvointialue | [Ruovesi uutiset](https://www.ruovesi.fi/tiedotteet?rss=true) |
| Rusko | Varsinais-Suomen hyvinvointialue | [Rusko uutiset](https://rusko.fi/feed/) |
| Rääkkylä | Pohjois-Karjalan hyvinvointialue | [Rääkkylä uutiset](https://www.raakkyla.fi/feed/) |
| Salla | Lapin hyvinvointialue | [Salla uutiset](https://www.salla.fi/feed/) |
| Sastamala | Pirkanmaan hyvinvointialue | [Sastamala uutiset](https://sastamala.fi/feed/) |
| Savonlinna | Etelä-Savon hyvinvointialue | [Savonlinna uutiset](https://www.savonlinna.fi/feed/) |
| Seinäjoki | Etelä-Pohjanmaan hyvinvointialue | [Seinäjoki uutiset](https://www.seinajoki.fi/feed/) |
| Sievi | Pohjois-Pohjanmaan hyvinvointialue | [Sievi uutiset](https://www.sievi.fi/rss.xml) |
| Siikainen | Satakunnan hyvinvointialue | [Siikainen uutiset](https://siikainen.fi/feed/) |
| Siikajoki | Pohjois-Pohjanmaan hyvinvointialue | [Siikajoki uutiset](https://www.siikajoki.fi/rss.xml) |
| Siikalatva | Pohjois-Pohjanmaan hyvinvointialue | [Siikalatva uutiset](https://siikalatva.fi/feed/) |
| Siilinjärvi | Pohjois-Savon hyvinvointialue | [Siilinjärvi uutiset](https://siilinjarvi.fi/feed/) |
| Sipoo | Itä-Uudenmaan hyvinvointialue | [Sipoo uutiset](https://www.sipoo.fi/feed/) |
| Siuntio | Länsi-Uudenmaan hyvinvointialue | [Siuntio uutiset](https://www.siuntio.fi/feed/) |
| Suonenjoki | Pohjois-Savon hyvinvointialue | [Suonenjoki uutiset](https://suonenjoki.fi/feed/) |
| Sysmä | Päijät-Hämeen hyvinvointialue | [Sysmä uutiset](https://sysma.fi/feed/) |
| Säkylä | Satakunnan hyvinvointialue | [Säkylä uutiset](https://www.sakyla.fi/feed/) |
| Taivalkoski | Pohjois-Pohjanmaan hyvinvointialue | [Taivalkoski uutiset](https://taivalkoski.fi/feed/) |
| Tammela | Kanta-Hämeen hyvinvointialue | [Tammela uutiset](https://www.tammela.fi/rss.xml) |
| Tampere | Pirkanmaan hyvinvointialue | [Tampereen uutiset](https://www.tampere.fi/ajankohtaista/uutiset.xml)<br>[Tampereen artikkelit](https://www.tampere.fi/ajankohtaista/artikkelit.xml)<br>[Tampereen ilmoitukset](https://www.tampere.fi/ajankohtaista/ilmoitukset.xml) |
| Teuva | Etelä-Pohjanmaan hyvinvointialue | [Teuva uutiset](https://teuva.fi/feed/) |
| Toholampi | Keski-Pohjanmaan hyvinvointialue | [Toholampi uutiset](https://www.toholampi.fi/feed/) |
| Toivakka | Keski-Suomen hyvinvointialue | [Toivakka uutiset](https://www.toivakka.fi/feed/) |
| Tornio | Lapin hyvinvointialue | [Tornio uutiset](https://www.tornio.fi/feed/) |
| Tuusula | Keski-Uudenmaan hyvinvointialue | [Tuusula uutiset](https://tuusula.fi/feed/) |
| Ulvila | Satakunnan hyvinvointialue | [Ulvila uutiset](https://www.ulvila.fi/feed/) |
| Vaala | Pohjois-Pohjanmaan hyvinvointialue | [Vaala uutiset](https://www.vaala.fi/feed/) |
| Vaasa | Pohjanmaan hyvinvointialue | [Vaasa uutiset](https://www.vaasa.fi/feed/) |
| Vantaa | Vantaan ja Keravan hyvinvointialue | [Vantaan uutiset](https://www.vantaa.fi/fi/rss/topical/121)<br>[Vantaan tiedotteet](https://www.vantaa.fi/fi/rss/topical/119) |
| Vesanto | Pohjois-Savon hyvinvointialue | [Vesanto uutiset](https://vesanto.fi/feed/) |
| Veteli | Keski-Pohjanmaan hyvinvointialue | [Veteli uutiset](https://veteli.fi/feed/) |
| Vieremä | Pohjois-Savon hyvinvointialue | [Vieremä uutiset](https://vierema.fi/feed/) |
| Vihti | Länsi-Uudenmaan hyvinvointialue | [Vihti uutiset](https://www.vihti.fi/feed/) |
| Vimpeli | Etelä-Pohjanmaan hyvinvointialue | [Vimpeli uutiset](https://www.vimpeli.fi/rss.xml) |
| Virolahti | Kymenlaakson hyvinvointialue | [Virolahti uutiset](https://virolahti.fi/feed/) |
| Ylitornio | Lapin hyvinvointialue | [Ylitornio uutiset](https://ylitornio.fi/feed/) |
| Ylivieska | Pohjois-Pohjanmaan hyvinvointialue | [Ylivieska uutiset](https://www.ylivieska.fi/feed/) |
| Ypäjä | Kanta-Hämeen hyvinvointialue | [Ypäjä uutiset](https://ypaja.fi/feed/) |

## Kunnat ilman omaa uutisvirtaa

Näissä kunnissa ei ole datassa paikallislehden feediä eikä kunnan omaa uutisvirtaa. Käyttöliittymässä uutisten fallbackina voidaan silti näyttää hyvinvointialueen uutislinkki.

| Hyvinvointialue | Kuntia | Hyvinvointialueen uutislinkki | Kunnat ilman omaa uutisvirtaa |
| --- | --- | --- | --- |
| Ahvenanmaa | 13 | [Hyvinvointialueen uutiset](https://www.ahs.ax/nyheter) | Eckerö, Föglö, Geta, Hammarland, Jomala, Kumlinge, Lemland, Lumparland, Maarianhamina - Mariehamn, Saltvik, Sottunga, Sund, Vårdö |
| Etelä-Karjalan hyvinvointialue | 5 | [Hyvinvointialueen uutiset](https://www.ekhva.fi/hyvinvointialue/ajankohtaista/) | Lappeenranta, Luumäki, Ruokolahti, Savitaipale, Taipalsaari |
| Etelä-Pohjanmaan hyvinvointialue | 7 | [Hyvinvointialueen uutiset](https://www.hyvaep.fi/ajankohtaista/) | Alajärvi, Alavus, Evijärvi, Isokyrö, Lapua, Soini, Ähtäri |
| Itä-Uudenmaan hyvinvointialue | 1 | [Hyvinvointialueen uutiset](https://itauusimaa.fi/ajankohtaista/) | Pukkila |
| Kainuun hyvinvointialue | 3 | [Hyvinvointialueen uutiset](https://hyvinvointialue.kainuu.fi/tiedotteet) | Paltamo, Ristijärvi, Suomussalmi |
| Kanta-Hämeen hyvinvointialue | 5 | [Hyvinvointialueen uutiset](https://omahame.fi/uutiset) | Forssa, Hausjärvi, Humppila, Jokioinen, Riihimäki |
| Keski-Suomen hyvinvointialue | 6 | [Hyvinvointialueen uutiset](https://www.hyvaks.fi/uutiset) | Jämsä, Kinnula, Multia, Saarijärvi, Uurainen, Äänekoski |
| Keski-Uudenmaan hyvinvointialue | 1 | [Hyvinvointialueen uutiset](https://www.keusote.fi/ajankohtaista/) | Hyvinkää |
| Kymenlaakson hyvinvointialue | 1 | [Hyvinvointialueen uutiset](https://kymenhva.fi/kategoria/uutiset/) | Miehikkälä |
| Lapin hyvinvointialue | 12 | [Hyvinvointialueen uutiset](https://lapha.fi/ajankohtaista) | Enontekiö, Inari, Keminmaa, Kolari, Muonio, Pello, Rovaniemi, Savukoski, Simo, Sodankylä, Tervola, Utsjoki |
| Pirkanmaan hyvinvointialue | 6 | [Hyvinvointialueen uutiset](https://www.pirha.fi/ajankohtaista/pirha-nyt) | Kihniö, Kuhmoinen, Mänttä-Vilppula, Punkalaidun, Valkeakoski, Virrat |
| Pohjanmaan hyvinvointialue | 6 | [Hyvinvointialueen uutiset](https://pohjanmaanhyvinvointi.fi/tietoa-meista/ajankohtaista/uutiset/) | Kristiinankaupunki, Kruunupyy, Maalahti, Pedersören kunta, Uusikaarlepyy, Vöyri |
| Pohjois-Karjalan hyvinvointialue | 3 | [Hyvinvointialueen uutiset](https://www.siunsote.fi/ajankohtaista/) | Kitee, Polvijärvi, Tohmajärvi |
| Pohjois-Pohjanmaan hyvinvointialue | 6 | [Hyvinvointialueen uutiset](https://pohde.fi/ajankohtaista/) | Kuusamo, Kärsämäki, Merijärvi, Pudasjärvi, Tyrnävä, Utajärvi |
| Pohjois-Savon hyvinvointialue | 5 | [Hyvinvointialueen uutiset](https://pshyvinvointialue.fi/fi/ajankohtaiset) | Lapinlahti, Rautavaara, Sonkajärvi, Tervo, Tuusniemi |
| Päijät-Hämeen hyvinvointialue | 2 | [Hyvinvointialueen uutiset](https://paijatha.fi/ajankohtaista/) | Hollola, Iitti |
| Satakunnan hyvinvointialue | 3 | [Hyvinvointialueen uutiset](https://sata.fi/ajankohtaista/) | Eurajoki, Jämijärvi, Nakkila |
| Vantaan ja Keravan hyvinvointialue | 1 | [Hyvinvointialueen uutiset](https://vakehyva.fi/fi/ajankohtaista) | Kerava |
| Varsinais-Suomen hyvinvointialue | 8 | [Hyvinvointialueen uutiset](https://www.varha.fi/fi/ajankohtaista) | Aura, Kemiönsaari, Marttila, Pöytyä, Salo, Taivassalo, Turku, Vehmaa |

## Seuraava tarkistus

1. Etsi ensin puuttuville kunnille paikallislehden RSS-/Atom-syöte.
2. Jos lehdellä ei ole syötettä, etsi kunnan oma RSS, Atom, uutiset-sivu tai tiedotevirta.
3. Jos kunnalla ei ole omaa uutisvirtaa, hyvinvointialueen uutislinkki jää perustelluksi alueelliseksi fallbackiksi.
4. Älä lisää feedejä ilman toimivaa lähdeosoitetta ja selvää kuntakytkentää.
