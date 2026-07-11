# Kuntien väkiluku ja alueellisten linkkien tulkintatausta

Päivitetty: 12.7.2026

Lähde: Tilastokeskus, Kuntien avainluvut, `Väkiluku, 2025`. Taulu on päivitetty 13.4.2026. Väkiluku tarkoittaa vuoden lopussa vakinaisesti alueella asuvaa väestöä.

Koneellinen JSON: `outputs/municipality-population-context.json`
CSV: `docs/kuntien-vakiluku-linkkitausta.csv`

## Tulkinta alueellisten linkkien hakuun

Pieni väkiluku ei todista, ettei palvelua ole, mutta se muuttaa hakutyön odotusarvoa. Erittäin pienissä kunnissa julkinen liikenne voi olla kutsu-, asiointi- tai taksipohjaista, ja paikallisuutiset voivat tulla seutu- tai maakuntalehdestä. Siksi puuttuva kuntakohtainen linkki pitää tulkita eri tavalla kuin suuressa kaupungissa: ensin etsitään virallinen oma lähde, sitten seudullinen tai maakunnallinen lähde, ja vasta sen jälkeen kirjataan, että kuntakohtaista linkkiä ei löytynyt.

## Väkilukuluokat ja linkkikattavuus

| Luokka | Väkiluku | Kuntia | Julkinen fallback | Palveluliikenne puuttuu | Uutissyöte puuttuu | Seudullisen mallin todennäköisyys |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| erittäin pieni | 0-1 999 | 54 | 15 | 32 | 53 | erittäin suuri |
| pieni | 2 000-4 999 | 90 | 31 | 30 | 79 | suuri |
| pienehkö | 5 000-9 999 | 68 | 16 | 24 | 55 | kohtalainen |
| keskisuuri | 10 000-19 999 | 42 | 8 | 11 | 28 | kohtalainen tai pieni |
| suuri | 20 000-49 999 | 33 | 9 | 8 | 28 | pieni |
| erittäin suuri | 50 000+ | 21 | 2 | 8 | 21 | hyvin pieni |

## Käytännön priorisointi

1. Suurissa ja keskisuurissa kunnissa puuttuva palveluliikenne- tai uutissyötelinkki kannattaa tarkistaa aktiivisesti, koska oma tai selkeä seudullinen sivu on todennäköisempi.
2. Pienissä ja erittäin pienissä kunnissa hyväksyttävä lopputulos voi olla virallinen seudullinen, maakunnallinen, kutsutaksi-, asiointiliikenne- tai maakuntalehtitason linkki.
3. Jos pienelle kunnalle ei löydy omaa paikallislehteä tai RSS-syötettä, etsi ensin seutulehti, maakuntalehti, kunnan uutiset-sivu ja hyvinvointialueen uutiset.
4. Älä lisää kuntakohtaista linkkiä vain siksi, että kunnassa on puute. Linkin pitää edelleen perustua löydettyyn lähteeseen.

## Kunnat väkiluvun mukaan

| Kunta | Hyvinvointialue | Väkiluku 2025 | Luokka | Julkinen liikenne | Palveluliikenne | Uutissyöte |
| --- | --- | ---: | --- | --- | --- | --- |
| Sottunga | Ahvenanmaa | 101 | erittäin pieni | ok-regional | missing | missing |
| Kökar | Ahvenanmaa | 211 | erittäin pieni | ok-regional | missing | missing |
| Kumlinge | Ahvenanmaa | 271 | erittäin pieni | ok-regional | missing | missing |
| Lumparland | Ahvenanmaa | 371 | erittäin pieni | ok-regional | missing | missing |
| Brändö | Ahvenanmaa | 430 | erittäin pieni | ok-regional | missing | missing |
| Vårdö | Ahvenanmaa | 465 | erittäin pieni | ok-regional | missing | missing |
| Föglö | Ahvenanmaa | 512 | erittäin pieni | ok-regional | missing | missing |
| Geta | Ahvenanmaa | 512 | erittäin pieni | ok-regional | missing | missing |
| Lestijärvi | Keski-Pohjanmaan hyvinvointialue | 656 | erittäin pieni | ok-regional | missing | missing |
| Luhanka | Keski-Suomen hyvinvointialue | 695 | erittäin pieni | ok-own | ok-own | missing |
| Hailuoto | Pohjois-Pohjanmaan hyvinvointialue | 912 | erittäin pieni | ok-own | missing | missing |
| Pelkosenniemi | Lapin hyvinvointialue | 932 | erittäin pieni | fallback-national | ok-own | missing |
| Eckerö | Ahvenanmaa | 961 | erittäin pieni | ok-regional | missing | missing |
| Kustavi | Varsinais-Suomen hyvinvointialue | 972 | erittäin pieni | ok-regional | missing | missing |
| Savukoski | Lapin hyvinvointialue | 974 | erittäin pieni | fallback-national | ok-own | missing |
| Halsua | Keski-Pohjanmaan hyvinvointialue | 975 | erittäin pieni | ok-regional | missing | missing |
| Kivijärvi | Keski-Suomen hyvinvointialue | 1 001 | erittäin pieni | ok-regional | missing | missing |
| Sund | Ahvenanmaa | 1 018 | erittäin pieni | ok-regional | missing | missing |
| Merijärvi | Pohjois-Pohjanmaan hyvinvointialue | 1 031 | erittäin pieni | ok-own | missing | missing |
| Utsjoki | Lapin hyvinvointialue | 1 112 | erittäin pieni | ok-own | missing | missing |
| Kyyjärvi | Keski-Suomen hyvinvointialue | 1 129 | erittäin pieni | ok-regional | missing | missing |
| Karijoki | Etelä-Pohjanmaan hyvinvointialue | 1 134 | erittäin pieni | ok-own | missing | missing |
| Kannonkoski | Keski-Suomen hyvinvointialue | 1 137 | erittäin pieni | ok-regional | missing | missing |
| Ristijärvi | Kainuun hyvinvointialue | 1 158 | erittäin pieni | fallback-national | ok-own | missing |
| Siikainen | Satakunnan hyvinvointialue | 1 229 | erittäin pieni | ok-regional | missing | missing |
| Kaskinen | Pohjanmaan hyvinvointialue | 1 248 | erittäin pieni | ok-regional | missing | missing |
| Oripää | Varsinais-Suomen hyvinvointialue | 1 264 | erittäin pieni | ok-regional | missing | missing |
| Enonkoski | Etelä-Savon hyvinvointialue | 1 273 | erittäin pieni | ok-regional | ok-own | missing |
| Multia | Keski-Suomen hyvinvointialue | 1 386 | erittäin pieni | fallback-national | ok-own | missing |
| Tervo | Pohjois-Savon hyvinvointialue | 1 388 | erittäin pieni | fallback-national | ok-own | missing |
| Rautavaara | Pohjois-Savon hyvinvointialue | 1 398 | erittäin pieni | fallback-national | ok-own | missing |
| Kinnula | Keski-Suomen hyvinvointialue | 1 472 | erittäin pieni | ok-regional | missing | missing |
| Hammarland | Ahvenanmaa | 1 644 | erittäin pieni | ok-regional | missing | missing |
| Juupajoki | Pirkanmaan hyvinvointialue | 1 663 | erittäin pieni | fallback-national | ok-own | missing |
| Jämijärvi | Satakunnan hyvinvointialue | 1 663 | erittäin pieni | ok-regional | missing | missing |
| Miehikkälä | Kymenlaakson hyvinvointialue | 1 664 | erittäin pieni | fallback-national | ok-own | missing |
| Kihniö | Pirkanmaan hyvinvointialue | 1 670 | erittäin pieni | ok-regional | missing | missing |
| Pyhäntä | Pohjois-Pohjanmaan hyvinvointialue | 1 678 | erittäin pieni | fallback-national | ok-own | missing |
| Myrskylä | Itä-Uudenmaan hyvinvointialue | 1 692 | erittäin pieni | fallback-national | ok-own | missing |
| Taivassalo | Varsinais-Suomen hyvinvointialue | 1 707 | erittäin pieni | ok-regional | ok-own | missing |
| Pukkila | Itä-Uudenmaan hyvinvointialue | 1 720 | erittäin pieni | ok-regional | missing | missing |
| Enontekiö | Lapin hyvinvointialue | 1 769 | erittäin pieni | ok-regional | ok-own | missing |
| Isojoki | Etelä-Pohjanmaan hyvinvointialue | 1 771 | erittäin pieni | fallback-national | ok-own | missing |
| Soini | Etelä-Pohjanmaan hyvinvointialue | 1 772 | erittäin pieni | fallback-national | ok-own | missing |
| Vesanto | Pohjois-Savon hyvinvointialue | 1 787 | erittäin pieni | fallback-national | ok-own | missing |
| Saltvik | Ahvenanmaa | 1 802 | erittäin pieni | ok-regional | missing | missing |
| Rääkkylä | Pohjois-Karjalan hyvinvointialue | 1 830 | erittäin pieni | fallback-national | ok-own | missing |
| Marttila | Varsinais-Suomen hyvinvointialue | 1 890 | erittäin pieni | ok-regional | missing | missing |
| Pyhäranta | Varsinais-Suomen hyvinvointialue | 1 892 | erittäin pieni | ok-regional | ok-own | missing |
| Pomarkku | Satakunnan hyvinvointialue | 1 893 | erittäin pieni | ok-regional | missing | missing |
| Keitele | Pohjois-Savon hyvinvointialue | 1 922 | erittäin pieni | ok-regional | ok-own | ok-own |
| Kuhmoinen | Pirkanmaan hyvinvointialue | 1 979 | erittäin pieni | ok-own | ok-own | missing |
| Hyrynsalmi | Kainuun hyvinvointialue | 1 984 | erittäin pieni | fallback-national | ok-own | missing |
| Korsnäs | Pohjanmaan hyvinvointialue | 1 984 | erittäin pieni | ok-regional | missing | missing |
| Lumijoki | Pohjois-Pohjanmaan hyvinvointialue | 2 018 | pieni | ok-regional | missing | missing |
| Hirvensalmi | Etelä-Savon hyvinvointialue | 2 023 | pieni | fallback-national | ok-own | missing |
| Humppila | Kanta-Hämeen hyvinvointialue | 2 074 | pieni | ok-own | missing | missing |
| Puumala | Etelä-Savon hyvinvointialue | 2 081 | pieni | fallback-national | ok-own | missing |
| Karvia | Satakunnan hyvinvointialue | 2 133 | pieni | ok-regional | missing | missing |
| Lemland | Ahvenanmaa | 2 139 | pieni | ok-regional | missing | missing |
| Koski Tl | Varsinais-Suomen hyvinvointialue | 2 144 | pieni | ok-regional | missing | missing |
| Ypäjä | Kanta-Hämeen hyvinvointialue | 2 186 | pieni | ok-own | ok-own | missing |
| Vehmaa | Varsinais-Suomen hyvinvointialue | 2 263 | pieni | ok-regional | missing | missing |
| Evijärvi | Etelä-Pohjanmaan hyvinvointialue | 2 267 | pieni | fallback-national | ok-own | missing |
| Tuusniemi | Pohjois-Savon hyvinvointialue | 2 270 | pieni | ok-regional | ok-own | missing |
| Toivakka | Keski-Suomen hyvinvointialue | 2 307 | pieni | ok-regional | ok-own | missing |
| Sulkava | Etelä-Savon hyvinvointialue | 2 310 | pieni | ok-regional | ok-own | ok-own |
| Puolanka | Kainuun hyvinvointialue | 2 322 | pieni | ok-regional | missing | missing |
| Muonio | Lapin hyvinvointialue | 2 323 | pieni | ok-regional | ok-own | missing |
| Kärsämäki | Pohjois-Pohjanmaan hyvinvointialue | 2 324 | pieni | fallback-national | ok-own | missing |
| Alavieska | Pohjois-Pohjanmaan hyvinvointialue | 2 384 | pieni | fallback-national | ok-own | missing |
| Utajärvi | Pohjois-Pohjanmaan hyvinvointialue | 2 399 | pieni | ok-regional | missing | missing |
| Hartola | Päijät-Hämeen hyvinvointialue | 2 401 | pieni | fallback-national | ok-own | missing |
| Konnevesi | Keski-Suomen hyvinvointialue | 2 404 | pieni | ok-regional | missing | ok-own |
| Lapinjärvi | Itä-Uudenmaan hyvinvointialue | 2 430 | pieni | fallback-national | ok-own | missing |
| Reisjärvi | Pohjois-Pohjanmaan hyvinvointialue | 2 476 | pieni | ok-own | ok-own | missing |
| Vaala | Pohjois-Pohjanmaan hyvinvointialue | 2 544 | pieni | fallback-national | ok-own | missing |
| Punkalaidun | Pirkanmaan hyvinvointialue | 2 546 | pieni | ok-own | missing | missing |
| Kaavi | Pohjois-Savon hyvinvointialue | 2 547 | pieni | ok-regional | ok-own | missing |
| Perho | Keski-Pohjanmaan hyvinvointialue | 2 547 | pieni | ok-regional | missing | missing |
| Vimpeli | Etelä-Pohjanmaan hyvinvointialue | 2 554 | pieni | ok-regional | ok-own | missing |
| Finström | Ahvenanmaa | 2 625 | pieni | ok-regional | missing | missing |
| Padasjoki | Päijät-Hämeen hyvinvointialue | 2 656 | pieni | ok-regional | ok-own | missing |
| Simo | Lapin hyvinvointialue | 2 701 | pieni | ok-regional | ok-own | missing |
| Lappajärvi | Etelä-Pohjanmaan hyvinvointialue | 2 704 | pieni | ok-regional | ok-own | missing |
| Toholampi | Keski-Pohjanmaan hyvinvointialue | 2 750 | pieni | ok-regional | missing | missing |
| Virolahti | Kymenlaakson hyvinvointialue | 2 751 | pieni | fallback-national | ok-own | missing |
| Posio | Lapin hyvinvointialue | 2 826 | pieni | fallback-national | ok-own | missing |
| Merikarvia | Satakunnan hyvinvointialue | 2 834 | pieni | ok-regional | missing | missing |
| Tervola | Lapin hyvinvointialue | 2 837 | pieni | ok-regional | ok-own | missing |
| Lemi | Etelä-Karjalan hyvinvointialue | 2 878 | pieni | ok-own | missing | missing |
| Heinävesi | Pohjois-Karjalan hyvinvointialue | 2 888 | pieni | fallback-national | ok-own | ok-own |
| Rautjärvi | Etelä-Karjalan hyvinvointialue | 2 888 | pieni | fallback-national | ok-own | ok-own |
| Veteli | Keski-Pohjanmaan hyvinvointialue | 2 912 | pieni | ok-regional | missing | missing |
| Rautalampi | Pohjois-Savon hyvinvointialue | 2 928 | pieni | ok-regional | ok-own | missing |
| Pyhäjoki | Pohjois-Pohjanmaan hyvinvointialue | 2 938 | pieni | ok-own | missing | missing |
| Paltamo | Kainuun hyvinvointialue | 2 941 | pieni | fallback-national | ok-own | missing |
| Sauvo | Varsinais-Suomen hyvinvointialue | 2 957 | pieni | ok-regional | ok-own | ok-own |
| Savitaipale | Etelä-Karjalan hyvinvointialue | 3 094 | pieni | ok-own | ok-own | missing |
| Pello | Lapin hyvinvointialue | 3 146 | pieni | ok-own | ok-own | missing |
| Rantasalmi | Etelä-Savon hyvinvointialue | 3 219 | pieni | fallback-national | ok-own | missing |
| Salla | Lapin hyvinvointialue | 3 231 | pieni | fallback-national | ok-own | missing |
| Vieremä | Pohjois-Savon hyvinvointialue | 3 295 | pieni | ok-regional | ok-own | missing |
| Kuortane | Etelä-Pohjanmaan hyvinvointialue | 3 306 | pieni | fallback-national | ok-own | missing |
| Sysmä | Päijät-Hämeen hyvinvointialue | 3 367 | pieni | fallback-national | ok-own | missing |
| Petäjävesi | Keski-Suomen hyvinvointialue | 3 511 | pieni | ok-regional | ok-own | missing |
| Karstula | Keski-Suomen hyvinvointialue | 3 514 | pieni | fallback-national | ok-own | missing |
| Sonkajärvi | Pohjois-Savon hyvinvointialue | 3 521 | pieni | ok-regional | ok-own | missing |
| Ranua | Lapin hyvinvointialue | 3 530 | pieni | fallback-national | ok-own | missing |
| Taivalkoski | Pohjois-Pohjanmaan hyvinvointialue | 3 555 | pieni | fallback-national | ok-own | missing |
| Uurainen | Keski-Suomen hyvinvointialue | 3 651 | pieni | ok-own | ok-own | missing |
| Ylitornio | Lapin hyvinvointialue | 3 673 | pieni | fallback-national | ok-own | missing |
| Pihtipudas | Keski-Suomen hyvinvointialue | 3 676 | pieni | ok-regional | ok-own | missing |
| Tohmajärvi | Pohjois-Karjalan hyvinvointialue | 3 869 | pieni | ok-own | ok-own | missing |
| Pielavesi | Pohjois-Savon hyvinvointialue | 3 873 | pieni | ok-regional | missing | ok-own |
| Aura | Varsinais-Suomen hyvinvointialue | 3 937 | pieni | ok-regional | missing | missing |
| Polvijärvi | Pohjois-Karjalan hyvinvointialue | 3 942 | pieni | fallback-national | ok-own | missing |
| Ruovesi | Pirkanmaan hyvinvointialue | 3 995 | pieni | fallback-national | ok-own | missing |
| Kolari | Lapin hyvinvointialue | 4 001 | pieni | ok-regional | ok-own | missing |
| Kärkölä | Päijät-Hämeen hyvinvointialue | 4 052 | pieni | fallback-national | ok-own | missing |
| Juuka | Pohjois-Karjalan hyvinvointialue | 4 059 | pieni | ok-own | missing | missing |
| Kaustinen | Keski-Pohjanmaan hyvinvointialue | 4 074 | pieni | ok-regional | missing | missing |
| Joutsa | Keski-Suomen hyvinvointialue | 4 079 | pieni | ok-own | ok-own | missing |
| Parikkala | Etelä-Karjalan hyvinvointialue | 4 235 | pieni | fallback-national | ok-own | ok-own |
| Isokyrö | Etelä-Pohjanmaan hyvinvointialue | 4 261 | pieni | ok-regional | missing | missing |
| Ilomantsi | Pohjois-Karjalan hyvinvointialue | 4 293 | pieni | fallback-national | ok-own | missing |
| Luumäki | Etelä-Karjalan hyvinvointialue | 4 304 | pieni | ok-own | missing | missing |
| Hankasalmi | Keski-Suomen hyvinvointialue | 4 436 | pieni | ok-regional | missing | missing |
| Urjala | Pirkanmaan hyvinvointialue | 4 440 | pieni | ok-regional | ok-own | ok-own |
| Joroinen | Pohjois-Savon hyvinvointialue | 4 494 | pieni | fallback-national | ok-own | missing |
| Vesilahti | Pirkanmaan hyvinvointialue | 4 532 | pieni | ok-regional | ok-own | ok-own |
| Pyhäjärvi | Pohjois-Pohjanmaan hyvinvointialue | 4 551 | pieni | fallback-national | ok-own | ok-own |
| Taipalsaari | Etelä-Karjalan hyvinvointialue | 4 574 | pieni | ok-own | missing | missing |
| Teuva | Etelä-Pohjanmaan hyvinvointialue | 4 574 | pieni | ok-own | missing | missing |
| Sievi | Pohjois-Pohjanmaan hyvinvointialue | 4 585 | pieni | ok-own | missing | missing |
| Nousiainen | Varsinais-Suomen hyvinvointialue | 4 667 | pieni | ok-regional | missing | missing |
| Askola | Itä-Uudenmaan hyvinvointialue | 4 677 | pieni | ok-regional | missing | missing |
| Ruokolahti | Etelä-Karjalan hyvinvointialue | 4 679 | pieni | ok-own | ok-own | missing |
| Siikajoki | Pohjois-Pohjanmaan hyvinvointialue | 4 723 | pieni | fallback-national | ok-own | missing |
| Jokioinen | Kanta-Hämeen hyvinvointialue | 4 795 | pieni | ok-own | ok-own | missing |
| Siikalatva | Pohjois-Pohjanmaan hyvinvointialue | 4 861 | pieni | fallback-national | ok-own | missing |
| Nakkila | Satakunnan hyvinvointialue | 4 890 | pieni | ok-regional | missing | missing |
| Pornainen | Keski-Uudenmaan hyvinvointialue | 4 919 | pieni | fallback-national | ok-own | missing |
| Kangasniemi | Etelä-Savon hyvinvointialue | 4 952 | pieni | ok-regional | ok-own | ok-own |
| Pyhtää | Kymenlaakson hyvinvointialue | 5 016 | pienehkö | ok-regional | missing | missing |
| Ähtäri | Etelä-Pohjanmaan hyvinvointialue | 5 121 | pienehkö | ok-own | ok-own | missing |
| Kannus | Keski-Pohjanmaan hyvinvointialue | 5 246 | pienehkö | ok-regional | missing | missing |
| Inkoo | Länsi-Uudenmaan hyvinvointialue | 5 391 | pienehkö | ok-regional | missing | missing |
| Maalahti | Pohjanmaan hyvinvointialue | 5 392 | pienehkö | ok-regional | missing | missing |
| Juva | Etelä-Savon hyvinvointialue | 5 569 | pienehkö | fallback-national | ok-own | ok-own |
| Viitasaari | Keski-Suomen hyvinvointialue | 5 695 | pienehkö | ok-regional | ok-own | ok-own |
| Tammela | Kanta-Hämeen hyvinvointialue | 5 777 | pienehkö | ok-own | ok-own | missing |
| Jomala | Ahvenanmaa | 5 817 | pienehkö | ok-regional | missing | missing |
| Luoto | Pohjanmaan hyvinvointialue | 5 955 | pienehkö | ok-own | ok-own | missing |
| Parkano | Pirkanmaan hyvinvointialue | 6 011 | pienehkö | fallback-national | ok-own | missing |
| Kristiinankaupunki | Pohjanmaan hyvinvointialue | 6 113 | pienehkö | ok-regional | ok-own | missing |
| Virrat | Pirkanmaan hyvinvointialue | 6 126 | pienehkö | fallback-national | ok-own | missing |
| Pälkäne | Pirkanmaan hyvinvointialue | 6 146 | pienehkö | fallback-national | ok-own | missing |
| Vöyri | Pohjanmaan hyvinvointialue | 6 185 | pienehkö | ok-own | missing | missing |
| Siuntio | Länsi-Uudenmaan hyvinvointialue | 6 192 | pienehkö | ok-regional | missing | missing |
| Säkylä | Satakunnan hyvinvointialue | 6 221 | pienehkö | ok-regional | missing | missing |
| Kruunupyy | Pohjanmaan hyvinvointialue | 6 268 | pienehkö | ok-regional | missing | missing |
| Haapavesi | Pohjois-Pohjanmaan hyvinvointialue | 6 298 | pienehkö | ok-own | missing | ok-own |
| Iitti | Päijät-Hämeen hyvinvointialue | 6 329 | pienehkö | fallback-national | ok-own | missing |
| Kemiönsaari | Varsinais-Suomen hyvinvointialue | 6 340 | pienehkö | ok-regional | missing | missing |
| Outokumpu | Pohjois-Karjalan hyvinvointialue | 6 365 | pienehkö | fallback-national | ok-own | ok-own |
| Rusko | Varsinais-Suomen hyvinvointialue | 6 381 | pienehkö | ok-regional | missing | missing |
| Haapajärvi | Pohjois-Pohjanmaan hyvinvointialue | 6 441 | pienehkö | ok-own | missing | missing |
| Tyrnävä | Pohjois-Pohjanmaan hyvinvointialue | 6 470 | pienehkö | ok-regional | ok-own | missing |
| Suonenjoki | Pohjois-Savon hyvinvointialue | 6 549 | pienehkö | ok-regional | ok-own | missing |
| Harjavalta | Satakunnan hyvinvointialue | 6 565 | pienehkö | ok-regional | missing | missing |
| Kokemäki | Satakunnan hyvinvointialue | 6 583 | pienehkö | ok-regional | missing | ok-own |
| Ikaalinen | Pirkanmaan hyvinvointialue | 6 704 | pienehkö | fallback-national | ok-own | missing |
| Oulainen | Pohjois-Pohjanmaan hyvinvointialue | 6 832 | pienehkö | fallback-national | ok-own | missing |
| Kemijärvi | Lapin hyvinvointialue | 6 919 | pienehkö | fallback-national | ok-own | missing |
| Suomussalmi | Kainuun hyvinvointialue | 6 957 | pienehkö | ok-regional | missing | missing |
| Kittilä | Lapin hyvinvointialue | 6 973 | pienehkö | fallback-national | ok-own | missing |
| Mäntyharju | Etelä-Savon hyvinvointialue | 7 034 | pienehkö | ok-regional | ok-own | missing |
| Pudasjärvi | Pohjois-Pohjanmaan hyvinvointialue | 7 168 | pienehkö | fallback-national | ok-own | missing |
| Inari | Lapin hyvinvointialue | 7 244 | pienehkö | ok-own | ok-own | missing |
| Kiuruvesi | Pohjois-Savon hyvinvointialue | 7 255 | pienehkö | ok-regional | ok-own | ok-own |
| Kuhmo | Kainuun hyvinvointialue | 7 300 | pienehkö | ok-regional | missing | ok-own |
| Uusikaarlepyy | Pohjanmaan hyvinvointialue | 7 391 | pienehkö | ok-regional | missing | missing |
| Mynämäki | Varsinais-Suomen hyvinvointialue | 7 424 | pienehkö | ok-regional | ok-own | missing |
| Laihia | Pohjanmaan hyvinvointialue | 7 534 | pienehkö | ok-regional | missing | missing |
| Loppi | Kanta-Hämeen hyvinvointialue | 7 574 | pienehkö | ok-own | ok-own | ok-own |
| Keminmaa | Lapin hyvinvointialue | 7 576 | pienehkö | ok-regional | ok-own | missing |
| Hanko | Länsi-Uudenmaan hyvinvointialue | 7 620 | pienehkö | ok-regional | missing | missing |
| Asikkala | Päijät-Hämeen hyvinvointialue | 7 841 | pienehkö | ok-regional | ok-own | missing |
| Hausjärvi | Kanta-Hämeen hyvinvointialue | 7 862 | pienehkö | ok-own | ok-own | missing |
| Pöytyä | Varsinais-Suomen hyvinvointialue | 7 903 | pienehkö | ok-regional | ok-own | missing |
| Sodankylä | Lapin hyvinvointialue | 8 095 | pienehkö | fallback-national | ok-own | missing |
| Karkkila | Länsi-Uudenmaan hyvinvointialue | 8 274 | pienehkö | fallback-national | ok-own | ok-own |
| Somero | Varsinais-Suomen hyvinvointialue | 8 339 | pienehkö | ok-regional | ok-own | ok-own |
| Laitila | Varsinais-Suomen hyvinvointialue | 8 400 | pienehkö | ok-regional | ok-own | ok-own |
| Nurmes | Pohjois-Karjalan hyvinvointialue | 8 760 | pienehkö | ok-own | ok-own | missing |
| Saarijärvi | Keski-Suomen hyvinvointialue | 8 763 | pienehkö | ok-regional | missing | missing |
| Muhos | Pohjois-Pohjanmaan hyvinvointialue | 8 767 | pienehkö | ok-regional | missing | missing |
| Lapinlahti | Pohjois-Savon hyvinvointialue | 8 803 | pienehkö | ok-regional | ok-own | missing |
| Orivesi | Pirkanmaan hyvinvointialue | 8 858 | pienehkö | ok-regional | ok-own | ok-own |
| Eurajoki | Satakunnan hyvinvointialue | 8 920 | pienehkö | ok-regional | missing | missing |
| Leppävirta | Pohjois-Savon hyvinvointialue | 8 924 | pienehkö | ok-regional | ok-own | missing |
| Alajärvi | Etelä-Pohjanmaan hyvinvointialue | 8 982 | pienehkö | ok-regional | ok-own | missing |
| Keuruu | Keski-Suomen hyvinvointialue | 9 014 | pienehkö | fallback-national | ok-own | missing |
| Mänttä-Vilppula | Pirkanmaan hyvinvointialue | 9 109 | pienehkö | fallback-national | ok-own | missing |
| Hattula | Kanta-Hämeen hyvinvointialue | 9 346 | pienehkö | ok-regional | missing | missing |
| Kitee | Pohjois-Karjalan hyvinvointialue | 9 397 | pienehkö | fallback-national | ok-own | missing |
| Närpiö | Pohjanmaan hyvinvointialue | 9 538 | pienehkö | ok-regional | ok-own | missing |
| Huittinen | Satakunnan hyvinvointialue | 9 546 | pienehkö | ok-regional | ok-own | missing |
| Masku | Varsinais-Suomen hyvinvointialue | 9 612 | pienehkö | ok-regional | ok-own | missing |
| Ii | Pohjois-Pohjanmaan hyvinvointialue | 9 755 | pienehkö | ok-regional | ok-own | missing |
| Lieksa | Pohjois-Karjalan hyvinvointialue | 9 846 | pienehkö | ok-own | ok-own | ok-own |
| Liminka | Pohjois-Pohjanmaan hyvinvointialue | 10 116 | keskisuuri | ok-regional | missing | missing |
| Sotkamo | Kainuun hyvinvointialue | 10 161 | keskisuuri | fallback-national | ok-own | ok-own |
| Hämeenkyrö | Pirkanmaan hyvinvointialue | 10 249 | keskisuuri | fallback-national | ok-own | ok-own |
| Nivala | Pohjois-Pohjanmaan hyvinvointialue | 10 300 | keskisuuri | fallback-national | ok-own | ok-own |
| Kauniainen | Länsi-Uudenmaan hyvinvointialue | 10 318 | keskisuuri | ok-regional | missing | missing |
| Alavus | Etelä-Pohjanmaan hyvinvointialue | 10 634 | keskisuuri | fallback-national | ok-own | missing |
| Muurame | Keski-Suomen hyvinvointialue | 10 646 | keskisuuri | ok-regional | ok-own | missing |
| Eura | Satakunnan hyvinvointialue | 11 005 | keskisuuri | ok-regional | missing | missing |
| Paimio | Varsinais-Suomen hyvinvointialue | 11 284 | keskisuuri | ok-regional | ok-own | ok-own |
| Pedersören kunta | Pohjanmaan hyvinvointialue | 11 289 | keskisuuri | ok-regional | ok-own | missing |
| Maarianhamina - Mariehamn | Ahvenanmaa | 11 957 | keskisuuri | ok-regional | missing | missing |
| Liperi | Pohjois-Karjalan hyvinvointialue | 11 980 | keskisuuri | ok-regional | missing | missing |
| Kalajoki | Pohjois-Pohjanmaan hyvinvointialue | 12 155 | keskisuuri | ok-own | missing | ok-own |
| Ulvila | Satakunnan hyvinvointialue | 12 339 | keskisuuri | ok-regional | missing | missing |
| Ilmajoki | Etelä-Pohjanmaan hyvinvointialue | 12 405 | keskisuuri | ok-regional | missing | ok-own |
| Kauhajoki | Etelä-Pohjanmaan hyvinvointialue | 12 429 | keskisuuri | fallback-national | ok-own | missing |
| Kankaanpää | Satakunnan hyvinvointialue | 12 508 | keskisuuri | ok-regional | ok-own | missing |
| Lapua | Etelä-Pohjanmaan hyvinvointialue | 13 927 | keskisuuri | ok-regional | ok-own | missing |
| Loviisa | Itä-Uudenmaan hyvinvointialue | 14 196 | keskisuuri | ok-own | ok-own | ok-own |
| Parainen | Varsinais-Suomen hyvinvointialue | 14 712 | keskisuuri | ok-regional | ok-own | ok-own |
| Uusikaupunki | Varsinais-Suomen hyvinvointialue | 14 783 | keskisuuri | ok-regional | ok-own | ok-own |
| Kuusamo | Pohjois-Pohjanmaan hyvinvointialue | 14 800 | keskisuuri | ok-own | ok-own | missing |
| Kauhava | Etelä-Pohjanmaan hyvinvointialue | 14 909 | keskisuuri | ok-regional | ok-own | missing |
| Kontiolahti | Pohjois-Karjalan hyvinvointialue | 15 060 | keskisuuri | ok-regional | ok-own | missing |
| Loimaa | Varsinais-Suomen hyvinvointialue | 15 124 | keskisuuri | ok-regional | ok-own | ok-own |
| Ylivieska | Pohjois-Pohjanmaan hyvinvointialue | 15 274 | keskisuuri | ok-own | missing | missing |
| Orimattila | Päijät-Hämeen hyvinvointialue | 15 575 | keskisuuri | ok-regional | ok-own | missing |
| Janakkala | Kanta-Hämeen hyvinvointialue | 15 867 | keskisuuri | ok-regional | ok-own | missing |
| Forssa | Kanta-Hämeen hyvinvointialue | 16 307 | keskisuuri | ok-own | ok-own | missing |
| Akaa | Pirkanmaan hyvinvointialue | 16 429 | keskisuuri | ok-regional | ok-own | ok-own |
| Pieksämäki | Etelä-Savon hyvinvointialue | 17 124 | keskisuuri | fallback-national | ok-own | missing |
| Äänekoski | Keski-Suomen hyvinvointialue | 17 492 | keskisuuri | ok-regional | ok-own | missing |
| Heinola | Päijät-Hämeen hyvinvointialue | 17 694 | keskisuuri | ok-regional | ok-own | missing |
| Laukaa | Keski-Suomen hyvinvointialue | 18 808 | keskisuuri | ok-regional | ok-own | ok-own |
| Jämsä | Keski-Suomen hyvinvointialue | 19 020 | keskisuuri | ok-own | ok-own | missing |
| Hamina | Kymenlaakson hyvinvointialue | 19 113 | keskisuuri | fallback-national | ok-own | missing |
| Kemi | Lapin hyvinvointialue | 19 339 | keskisuuri | ok-regional | ok-own | missing |
| Varkaus | Pohjois-Savon hyvinvointialue | 19 433 | keskisuuri | ok-regional | ok-own | ok-own |
| Kurikka | Etelä-Pohjanmaan hyvinvointialue | 19 441 | keskisuuri | fallback-national | ok-own | missing |
| Pietarsaari | Pohjanmaan hyvinvointialue | 19 657 | keskisuuri | ok-own | ok-own | ok-own |
| Kempele | Pohjois-Pohjanmaan hyvinvointialue | 19 702 | keskisuuri | ok-regional | missing | missing |
| Mustasaari | Pohjanmaan hyvinvointialue | 19 792 | keskisuuri | ok-regional | missing | missing |
| Iisalmi | Pohjois-Savon hyvinvointialue | 20 205 | suuri | ok-regional | ok-own | missing |
| Naantali | Varsinais-Suomen hyvinvointialue | 20 390 | suuri | ok-regional | ok-own | missing |
| Lieto | Varsinais-Suomen hyvinvointialue | 20 732 | suuri | ok-regional | ok-own | missing |
| Valkeakoski | Pirkanmaan hyvinvointialue | 20 762 | suuri | ok-regional | missing | missing |
| Tornio | Lapin hyvinvointialue | 20 823 | suuri | ok-regional | ok-own | missing |
| Mäntsälä | Keski-Uudenmaan hyvinvointialue | 20 861 | suuri | ok-own | missing | missing |
| Siilinjärvi | Pohjois-Savon hyvinvointialue | 21 348 | suuri | ok-regional | ok-own | missing |
| Pirkkala | Pirkanmaan hyvinvointialue | 21 373 | suuri | ok-regional | ok-own | ok-own |
| Hollola | Päijät-Hämeen hyvinvointialue | 22 775 | suuri | ok-regional | ok-own | missing |
| Sipoo | Itä-Uudenmaan hyvinvointialue | 23 006 | suuri | ok-regional | missing | missing |
| Sastamala | Pirkanmaan hyvinvointialue | 23 332 | suuri | fallback-national | ok-own | missing |
| Raahe | Pohjois-Pohjanmaan hyvinvointialue | 23 413 | suuri | fallback-national | ok-own | missing |
| Imatra | Etelä-Karjalan hyvinvointialue | 24 345 | suuri | ok-regional | missing | missing |
| Lempäälä | Pirkanmaan hyvinvointialue | 25 041 | suuri | ok-regional | ok-own | ok-own |
| Raisio | Varsinais-Suomen hyvinvointialue | 26 036 | suuri | ok-regional | ok-own | missing |
| Raasepori | Länsi-Uudenmaan hyvinvointialue | 26 856 | suuri | ok-regional | missing | missing |
| Riihimäki | Kanta-Hämeen hyvinvointialue | 28 555 | suuri | ok-own | ok-own | missing |
| Vihti | Länsi-Uudenmaan hyvinvointialue | 28 852 | suuri | fallback-national | ok-own | missing |
| Savonlinna | Etelä-Savon hyvinvointialue | 31 008 | suuri | fallback-national | ok-own | missing |
| Ylöjärvi | Pirkanmaan hyvinvointialue | 33 658 | suuri | ok-regional | ok-own | ok-own |
| Kangasala | Pirkanmaan hyvinvointialue | 34 379 | suuri | ok-regional | ok-own | ok-own |
| Kajaani | Kainuun hyvinvointialue | 36 370 | suuri | fallback-national | ok-own | missing |
| Nokia | Pirkanmaan hyvinvointialue | 36 571 | suuri | ok-regional | ok-own | missing |
| Kaarina | Varsinais-Suomen hyvinvointialue | 36 675 | suuri | ok-regional | ok-own | ok-own |
| Kerava | Vantaan ja Keravan hyvinvointialue | 38 767 | suuri | ok-regional | missing | missing |
| Rauma | Satakunnan hyvinvointialue | 38 773 | suuri | ok-regional | ok-own | missing |
| Kirkkonummi | Länsi-Uudenmaan hyvinvointialue | 41 725 | suuri | ok-regional | missing | missing |
| Tuusula | Keski-Uudenmaan hyvinvointialue | 42 479 | suuri | ok-regional | missing | missing |
| Nurmijärvi | Keski-Uudenmaan hyvinvointialue | 45 333 | suuri | fallback-national | ok-own | missing |
| Lohja | Länsi-Uudenmaan hyvinvointialue | 45 435 | suuri | fallback-national | ok-own | missing |
| Järvenpää | Keski-Uudenmaan hyvinvointialue | 46 944 | suuri | fallback-national | ok-own | missing |
| Hyvinkää | Keski-Uudenmaan hyvinvointialue | 47 015 | suuri | fallback-national | ok-own | missing |
| Kokkola | Keski-Pohjanmaan hyvinvointialue | 48 338 | suuri | ok-own | ok-own | missing |
| Kotka | Kymenlaakson hyvinvointialue | 50 029 | erittäin suuri | ok-regional | missing | missing |
| Salo | Varsinais-Suomen hyvinvointialue | 50 339 | erittäin suuri | ok-regional | ok-own | missing |
| Mikkeli | Etelä-Savon hyvinvointialue | 51 551 | erittäin suuri | fallback-national | ok-own | missing |
| Porvoo | Itä-Uudenmaan hyvinvointialue | 51 863 | erittäin suuri | fallback-national | ok-own | missing |
| Rovaniemi | Lapin hyvinvointialue | 66 191 | erittäin suuri | ok-regional | missing | missing |
| Seinäjoki | Etelä-Pohjanmaan hyvinvointialue | 67 283 | erittäin suuri | ok-regional | ok-own | missing |
| Hämeenlinna | Kanta-Hämeen hyvinvointialue | 68 614 | erittäin suuri | ok-regional | ok-own | missing |
| Vaasa | Pohjanmaan hyvinvointialue | 71 209 | erittäin suuri | ok-regional | ok-own | missing |
| Lappeenranta | Etelä-Karjalan hyvinvointialue | 73 241 | erittäin suuri | ok-regional | ok-own | missing |
| Kouvola | Kymenlaakson hyvinvointialue | 77 625 | erittäin suuri | ok-regional | ok-own | missing |
| Joensuu | Pohjois-Karjalan hyvinvointialue | 79 129 | erittäin suuri | ok-regional | ok-own | missing |
| Pori | Satakunnan hyvinvointialue | 83 010 | erittäin suuri | ok-regional | missing | missing |
| Lahti | Päijät-Hämeen hyvinvointialue | 121 832 | erittäin suuri | ok-regional | missing | missing |
| Kuopio | Pohjois-Savon hyvinvointialue | 126 572 | erittäin suuri | ok-regional | ok-own | missing |
| Jyväskylä | Keski-Suomen hyvinvointialue | 149 895 | erittäin suuri | ok-regional | ok-own | missing |
| Turku | Varsinais-Suomen hyvinvointialue | 209 633 | erittäin suuri | ok-regional | ok-own | missing |
| Oulu | Pohjois-Pohjanmaan hyvinvointialue | 217 469 | erittäin suuri | ok-regional | ok-own | missing |
| Vantaa | Vantaan ja Keravan hyvinvointialue | 252 956 | erittäin suuri | ok-regional | missing | missing |
| Tampere | Pirkanmaan hyvinvointialue | 263 337 | erittäin suuri | ok-regional | missing | missing |
| Espoo | Länsi-Uudenmaan hyvinvointialue | 325 716 | erittäin suuri | ok-regional | missing | missing |
| Helsinki | Helsingin kaupunki | 694 392 | erittäin suuri | ok-regional | missing | missing |
