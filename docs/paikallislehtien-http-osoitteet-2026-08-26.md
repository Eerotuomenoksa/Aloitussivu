# Paikallislehtien HTTP-osoitteet 26.8.2026

Tähän tiedostoon on siirretty paikallislehtien lähdeaineistosta löytyneet pelkkää salaamatonta `http://`-yhteyttä käyttäneet osoitteet. Ne eivät näy käyttäjille. Sovelluksen linkkinäkyvyys estää lisäksi automaattisesti kaikki `http://`-osoitteet, vaikka sellainen päätyisi myöhemmin johonkin muuhun linkkilähteeseen.

Toimiviksi käsin vahvistetut HTTPS-osoitteet päivitettiin suoraan aktiiviseen tiedostoon `localNewspaperLinks.ts`. Punkalaitumen Sanomien HTTP-sivu toimi käsintarkistuksessa, mutta se poistettiin näkyvistä, koska turvallista HTTPS-osoitetta ei annettu hyväksyttäväksi.

## Näkyvistä poistetut HTTP-osoitteet

| Nimi | Osoite | Lähde | Peruste |
| --- | --- | --- | --- |
| Elimäen Sanomat | `http://www.elimaensanomat.fi/index.html` | paikallislehtilista | Käsintarkistuksessa poistettavaksi merkitty |
| Jaakkiman Sanomat | `http://jaakkimansanomat.fi` | paikallislehtilista | HTTPS puuttuu |
| Kalajoen Seutu | `http://www.kalajoenseutu.net` | paikallislehtilista | Käsintarkistuksessa poistettavaksi merkitty |
| Kokemäkeläinen | `http://kokemakelainen.net/` | paikallislehtilista | Käsintarkistuksessa poistettavaksi merkitty |
| Kylänraitti | `http://www.veikkola.net` | paikallislehtilista | Käsintarkistuksessa poistettavaksi merkitty |
| Lakeuden Joutsen | `http://www.lakeudenjoutsen.fi` | paikallislehtilista | Käsintarkistuksessa poistettavaksi merkitty |
| Lakeuden Lehti | `http://www.maakuntalehdet.fi/lakeudenl_media.htm` | paikallislehtilista | Käsintarkistuksessa poistettavaksi merkitty |
| Lakeuden portti | `http://www.lakeudenportti.com/` | paikallislehtilista | Käsintarkistuksessa poistettavaksi merkitty |
| Maaselkä | `http://www.maaselkalehti.fi` | paikallislehtilista | Käsintarkistuksessa poistettavaksi merkitty |
| Pietarsaaren Sanomat | `http://www.pietarsaarensanomat.fi/` | paikallislehtilista | Ei mukana hyväksytyissä HTTPS-osoitteissa |
| Pohjois-Satakunta | `http://www.pohjoissatakuntalehti.fi` | paikallislehtilista | Käsintarkistuksessa poistettavaksi merkitty |
| Punkalaitumen Sanomat | `http://www.punkalaitumensanomat.fi` | paikallislehtilista | HTTP toimii, mutta salaamatonta osoitetta ei näytetä |
| Soisalon Seutu | `http://www.soisalonseutu.fi` | paikallislehtilista | Ei mukana hyväksytyissä HTTPS-osoitteissa |
| Teisko-Aitolahti | `http://www.ruovesi-lehti.fi/` | paikallislehtilista | Vanha päällekkäinen osoite poistettu; hyväksytty HTTPS-osoite säilyy nimellä Ruovesi (lehti) |
| Ykkössanomat | `http://www.ykkossanomat.fi/` | paikallislehtilista | Käsintarkistuksessa poistettavaksi merkitty |
| Kokemäkeläinen RSS | `http://kokemakelainen.net/feed/` | paikallisuutisvirrat | Käsintarkistuksessa poistettavaksi merkitty |

## Muut käsintarkistuksessa poistetut osoitteet

Nämä käyttivät HTTPS-yhteyttä tai niistä oli HTTPS-versio, mutta ne merkittiin silti poistettaviksi. Myös saman lehden uutisvirta poistettiin, jotta poistettu lähde ei lataudu taustalla.

| Nimi | Osoite | Toimi |
| --- | --- | --- |
| Kalajoen Seutu | `https://kalajoenseutu.net/` | Poistettu paikallislehtilistasta ja RSS-virta `https://kalajoenseutu.net/feed/` poistettu |
| Topikki | `https://topikki.fi/` | Poistettu paikallislehtilistasta |

## Jatkoperiaate

HTTP-osoite voidaan palauttaa näkyviin vain, kun samalle oikealle palvelulle on käsin vahvistettu turvallinen HTTPS-osoite. Tällöin aktiiviseen lähdeaineistoon lisätään HTTPS-osoite; tähän historiaan jäävää HTTP-osoitetta ei palauteta käyttöön.
