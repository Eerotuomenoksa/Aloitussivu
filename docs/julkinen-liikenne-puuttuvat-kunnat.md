# Julkisen liikenteen puuttuvat kuntalinkit

Päivitetty: 14.6.2026

Tämä raportti listaa kunnat, joille Aloitussivun nykyisestä alueellisesta datasta ei löytynyt omaa tai seudullista `Julkinen liikenne` -linkkiä ennen Matkahuollon fallback-korjausta.

Tarkistus tehtiin vertaamalla kuntarekisterin 308 kuntaa `localServices.ts`-tiedoston `publicTransport`-merkintöihin ja seudullisiin joukkoliikennealueisiin.

## Yhteenveto

- Kuntia yhteensä: 308
- Julkinen liikenne merkittynä ennen korjausta: 67
- Julkinen liikenne puuttui ennen korjausta: 241
- Korjaus: jos kunnalle ei löydy omaa tai seudullista julkisen liikenteen linkkiä, näytetään `Matkahuollon reittiopas`.
- HSL-alueella näytetään sekä HSL:n palvelusivu että erillinen HSL Reittiopas -linkki.

Matkahuollon reittiopas valittiin yleiseksi fallbackiksi, koska Matkahuolto kuvaa sen palveluna, josta löytyvät aikataulu- ja reittitiedot kotiovelta määränpäähän sekä häiriö- ja poikkeustiedot.

## Puuttuneet kunnat hyvinvointialueittain

### Ahvenanmaa, 1 kunta

Maarianhamina - Mariehamn

### Etelä-Karjalan hyvinvointialue, 7 kuntaa

Lemi, Luumäki, Parikkala, Rautjärvi, Ruokolahti, Savitaipale, Taipalsaari

### Etelä-Pohjanmaan hyvinvointialue, 18 kuntaa

Alajärvi, Alavus, Evijärvi, Ilmajoki, Isojoki, Isokyrö, Karijoki, Kauhajoki, Kauhava, Kuortane, Kurikka, Lappajärvi, Lapua, Seinäjoki, Soini, Teuva, Vimpeli, Ähtäri

### Etelä-Savon hyvinvointialue, 11 kuntaa

Enonkoski, Hirvensalmi, Juva, Kangasniemi, Mikkeli, Mäntyharju, Pieksämäki, Puumala, Rantasalmi, Savonlinna, Sulkava

### Itä-Uudenmaan hyvinvointialue, 5 kuntaa

Askola, Lapinjärvi, Myrskylä, Porvoo, Pukkila

### Kainuun hyvinvointialue, 8 kuntaa

Hyrynsalmi, Kajaani, Kuhmo, Paltamo, Puolanka, Ristijärvi, Sotkamo, Suomussalmi

### Kanta-Hämeen hyvinvointialue, 11 kuntaa

Forssa, Hattula, Hausjärvi, Humppila, Hämeenlinna, Janakkala, Jokioinen, Loppi, Riihimäki, Tammela, Ypäjä

### Keski-Pohjanmaan hyvinvointialue, 8 kuntaa

Halsua, Kannus, Kaustinen, Kokkola, Lestijärvi, Perho, Toholampi, Veteli

### Keski-Suomen hyvinvointialue, 15 kuntaa

Joutsa, Jämsä, Kannonkoski, Karstula, Keuruu, Kinnula, Kivijärvi, Konnevesi, Kyyjärvi, Luhanka, Multia, Pihtipudas, Saarijärvi, Uurainen, Viitasaari

### Keski-Uudenmaan hyvinvointialue, 5 kuntaa

Hyvinkää, Järvenpää, Mäntsälä, Nurmijärvi, Pornainen

### Kymenlaakson hyvinvointialue, 5 kuntaa

Hamina, Kotka, Miehikkälä, Pyhtää, Virolahti

### Lapin hyvinvointialue, 21 kuntaa

Enontekiö, Inari, Kemi, Kemijärvi, Keminmaa, Kittilä, Kolari, Muonio, Pelkosenniemi, Pello, Posio, Ranua, Rovaniemi, Salla, Savukoski, Simo, Sodankylä, Tervola, Tornio, Utsjoki, Ylitornio

### Länsi-Uudenmaan hyvinvointialue, 6 kuntaa

Hanko, Inkoo, Karkkila, Lohja, Raasepori, Vihti

### Pirkanmaan hyvinvointialue, 12 kuntaa

Hämeenkyrö, Ikaalinen, Juupajoki, Kihniö, Kuhmoinen, Mänttä-Vilppula, Parkano, Punkalaidun, Pälkäne, Ruovesi, Sastamala, Virrat

### Pohjanmaan hyvinvointialue, 14 kuntaa

Kaskinen, Korsnäs, Kristiinankaupunki, Kruunupyy, Laihia, Luoto, Maalahti, Mustasaari, Närpiö, Pedersören kunta, Pietarsaari, Uusikaarlepyy, Vaasa, Vöyri

### Pohjois-Karjalan hyvinvointialue, 10 kuntaa

Heinävesi, Ilomantsi, Juuka, Kitee, Lieksa, Nurmes, Outokumpu, Polvijärvi, Rääkkylä, Tohmajärvi

### Pohjois-Pohjanmaan hyvinvointialue, 22 kuntaa

Alavieska, Haapajärvi, Haapavesi, Hailuoto, Kalajoki, Kuusamo, Kärsämäki, Merijärvi, Nivala, Oulainen, Pudasjärvi, Pyhäjoki, Pyhäjärvi, Pyhäntä, Raahe, Reisjärvi, Sievi, Siikajoki, Siikalatva, Taivalkoski, Vaala, Ylivieska

### Pohjois-Savon hyvinvointialue, 17 kuntaa

Iisalmi, Joroinen, Kaavi, Keitele, Kiuruvesi, Lapinlahti, Leppävirta, Pielavesi, Rautalampi, Rautavaara, Sonkajärvi, Suonenjoki, Tervo, Tuusniemi, Varkaus, Vesanto, Vieremä

### Päijät-Hämeen hyvinvointialue, 10 kuntaa

Asikkala, Hartola, Heinola, Hollola, Iitti, Kärkölä, Lahti, Orimattila, Padasjoki, Sysmä

### Satakunnan hyvinvointialue, 15 kuntaa

Eura, Eurajoki, Harjavalta, Huittinen, Jämijärvi, Kankaanpää, Karvia, Kokemäki, Merikarvia, Nakkila, Pomarkku, Rauma, Siikainen, Säkylä, Ulvila

### Varsinais-Suomen hyvinvointialue, 20 kuntaa

Aura, Kemiönsaari, Koski Tl, Kustavi, Laitila, Loimaa, Marttila, Masku, Mynämäki, Nousiainen, Oripää, Parainen, Pyhäranta, Pöytyä, Salo, Sauvo, Somero, Taivassalo, Uusikaupunki, Vehmaa

## Seuraava tarkempi työ

Matkahuolto-fallback korjaa sen, että kunnalle ei jää tyhjää julkisen liikenteen kohtaa. Seuraavassa tarkemmassa vaiheessa nämä kunnat kannattaa käydä seutu kerrallaan läpi ja korvata fallback paikallisella tai seudullisella reittioppaalla silloin, kun sellainen löytyy.
