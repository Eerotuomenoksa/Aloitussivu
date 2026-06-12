# Tyotuntiseuranta

Paivitetty: 12.6.2026

Tama dokumentti seuraa Aloitussivu-projektin toteutunutta ja arvioitua tyomaaraa. Seuranta erottaa kaksi eri asiaa:

- ihmisen aktiivinen tyo: paatokset, ohjaus, sisallon tarkistus, kasintestaus, priorisointi, hyvaksynta ja palaverit
- Codex-/toteutusaika: koodaus, dokumentointi, linkkiajojen ja tarkistusten suoritus, buildit, testit, selvitykset ja raporttien muodostus

Luvut ovat arvioita, koska projektissa ei ole ollut alusta asti kellotettua tuntikirjanpitoa. Arvio perustuu git-historiaan, tehtyihin tyokokonaisuuksiin, dokumentoituihin tyopaketteihin ja keskustelussa tehtyihin tehtaviin. Jatkossa uudet tyot kannattaa kirjata tahan heti saman paivan aikana, jotta arvio tarkentuu toteumaksi.

## Nykyinen yhteenveto

| Aikavali | Commitit | Paasisalto | Ihmisen aktiivinen aika | Codex-/toteutusaika | Luotettavuus |
| --- | ---: | --- | ---: | ---: | --- |
| 9.2.-23.2.2026 | 8 | ensimmainen prototyyppi, perusrakenne, UI, Gemini-integraatio, fontti- ja saavutettavuusalku | 4-8 h | 10-20 h | keskitaso |
| 26.4.-30.4.2026 | 26 | paikalliset linkit, uutiset, opastuspaikat, liputuspaivat, linkki-ilmoitukset, muutosloki, asetukset, paikallislehdet ja feedit | 12-22 h | 35-70 h | keskitaso |
| 4.5.-31.5.2026 | 85 | kieliversiot, Firebase-yllapito, huijausvaroitukset, linkkilistat, paikalliset liikunta- ja palvelulinkit, saavutettavuus, tietosuoja, tilastointi, tietoturvakorjaukset | 45-80 h | 110-230 h | keskitaso |
| 1.6.-12.6.2026 | 22 | visuaalinen ilme, kela-taksit, kehitysjono, linkkien turvallisuustarkistus, palautejonon korjaukset, kayttotilastojen selainkohtainen esto, alueellisten linkkien alakategoriat ja huijausvaroituksen modaaliparannus | 14-29 h | 42-98 h | keskitaso |
| **Yhteensa 12.6.2026 asti** | **141** | toteutettu pilotti, yllapito, linkkitarkistus, dokumentaatio ja useita testauksen aikaisia korjauksia | **75-139 h** | **197-418 h** | arvio |

## Miten tunteja tulkitaan

Ihmisen aktiivinen aika ei tarkoita sita, kuinka kauan Codex on tehnyt toita taustalla. Se tarkoittaa aikaa, jolloin ihminen joutuu kayttamaan omaa asiantuntija-aikaansa: antamaan ohjeet, tekemaan paatokset, testaamaan, lukemaan tulokset ja hyvaksymaan muutokset.

Codex-/toteutusaika sisaltaa myos sellaiset tyot, jotka olisivat perinteisesti kehittajan tyoaikaa: koodimuutokset, skriptien ajot, linkkien tarkistukset, dokumenttien laadinta, buildit ja selvitykset. Tama aika ei ole sama asia kuin ihmisen kalenteriaika, koska suuri osa siita voi tapahtua valvottuna taustatyona.

Jos raportointiin tarvitaan varovainen yksi luku, kannattaa kayttaa valia:

- ihminen: noin 100 h
- Codex/toteutus: noin 300 h

Jos raportointiin tarvitaan kustannus- tai resurssisuunnittelua, suositus on kayttaa vaihteluvakia, ei pelkkaa keskiarvoa.

## Tyokokonaisuudet

| Kokonaisuus | Ihminen | Codex/toteutus | Kuvaus |
| --- | ---: | ---: | --- |
| Perusprototyyppi ja etusivu | 8-15 h | 20-45 h | React/Vite-rakenne, UI, haku, kello, fonttikoko, ensimmainen avustajaintegraatio |
| Paikallisuus ja linkkisisallot | 18-35 h | 55-120 h | kunnat, paikallislehdet, uutisfeedit, kirjastot, liikunta, Kela-taksit, palveluliikenne |
| Yllapito ja palaute | 10-20 h | 25-60 h | linkkiehdotukset, palautejono, yllapitokayttoliittyma, Firestore-korjaukset |
| Turvallisuus ja linkkitarkistus | 12-25 h | 45-110 h | linkkien turvallisuustarkistus, manuaalinen tarkistuslista, piilotukset, domain- ja sisaltotarkistukset |
| Saavutettavuus, tietosuoja ja dokumentaatio | 12-25 h | 30-75 h | tietosuoja- ja saavutettavuusluonnokset, esitykset, roadmap, ohjeet |
| Visuaalisuus, kieliversiot ja kaytettavyys | 13-25 h | 35-85 h | Aurora-ilme, kieliversiot, mobiilikorjaukset, asetukset, opastuskierros |

## Paivittamisen malli

Jokaisen isomman tyorupeaman jalkeen lisataan rivi alla olevaan lokiin ja paivitetaan yhteenveto.

Kirjausperiaate:

1. Kirjaa paivamaara ja lyhyt tehtavan nimi.
2. Arvioi ihmisen aktiivinen aika 0,25 tunnin tarkkuudella, jos mahdollista.
3. Arvioi Codex-/toteutusaika erikseen. Mukaan voi laskea pitkien ajojen, linkkitarkistusten, buildien ja selvitysten keston.
4. Merkitse, onko tunti toteuma, arvio vai karkea arvio.
5. Kirjaa todisteeksi commit, PR, tiedosto, skriptiajo tai muu viite.

## Tuntikirjausloki

| Paiva | Tehtava | Ihminen | Codex/toteutus | Tyyppi | Todiste tai viite | Huomio |
| --- | --- | ---: | ---: | --- | --- | --- |
| 2026-02-09-2026-02-23 | Prototyypin alku ja ensimmainen toimiva kokonaisuus | 4-8 h | 10-20 h | arvio | 8 commitia | Ei kellotettua dataa |
| 2026-04-26-2026-04-30 | Paikalliset linkit, uutiset, muutosloki ja ensimmainen yllapitomalli | 12-22 h | 35-70 h | arvio | 26 commitia | Sisaltaa paljon sisaltotyon automatisointia |
| 2026-05-04-2026-05-31 | Toukokuun laaja kehitysjakso | 45-80 h | 110-230 h | arvio | 85 commitia | Sisaltaa Firebase-, tietoturva-, saavutettavuus- ja linkkityota |
| 2026-06-01-2026-06-12 | Kesakuun testauskorjaukset ja linkkien turvallisuustyo | 14-29 h | 42-98 h | arvio | 22 commitia | Sisaltaa myos pitkia linkkiajoja, dokumentointia, visuaalisia tarkistuksia ja paikallisuusmallin kokeiluja |
| 2026-06-12 | Akaan Toijalan Nayttamon lisays teatterilistalle | 0,25 h | 0,5 h | arvio | constants.tsx, vite build | Linkki varmistettu HTTP 200 -vastauksella; taysi linkkiajo aikakatkaistiin |
| 2026-06-12 | Visuaalinen muutos ja saavutettavuustarkistus | 0,75-1,25 h | 2-4 h | arvio | commitit 291a0d2 ja c42e6e9, vite build, kontrastilaskenta | Sisaltaa Clauden visuaalisen muutoksen commitoinnin, tekstikontrastien parannukset ja build-varmistuksen |
| 2026-06-12 | Lahellasi-osion alueelliset linkit alakategorioiksi | 0,5-1 h | 1,5-3 h | arvio | App.tsx, components/RegionalServicesPanel.tsx, localServices.ts, Playwright-pistokokeet | Ensin kokeiltiin kaikkia alueellisia linkkeja suorina, sitten isot kaupungit tiivistettiin alakategorioihin |
| 2026-06-12 | Huijausvaroituksen modaalin parannus | 0,25-0,5 h | 0,75-1,5 h | arvio | components/ScamAlertsBanner.tsx, i18n.tsx, vite build | Modaali suurennettiin, tekstikokoja kasvatettiin ja Lue lisaa -linkki lisattiin aina |
| 2026-06-12 | Muutoslokin ja tyolokin paivitys | 0,25 h | 0,5 h | arvio | changelogData.ts, docs/tyotuntiseuranta.md, docs/tyotuntiseuranta.csv | Paivitettiin uusimpien kokeilujen ja korjausten tilanne muutoslokiin ja tuntiseurantaan |

## Yllapidon suositus

Tata dokumenttia kannattaa paivittaa aina, kun tehdaan commit tai selkea tyopaketti. Jos commit-viesti on esimerkiksi `palautejonon korjaus`, lisataan lokiin yksi rivi: mita tehtiin, paljonko ihmisen aktiivista aikaa kului ja paljonko Codex-/toteutusaikaa arvioidaan kuluneen.

Tarkempi malli voidaan myohemmin automatisoida niin, etta skripti hakee commitit ja muodostaa alustavan rivin. Ihmisen tunti ja luokittelu taytyy silti vahvistaa kasin, koska git ei tieda paljonko aikaa meni paatoksiin, testaukseen tai tulosten lukemiseen.
