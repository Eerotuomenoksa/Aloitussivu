# Elokuun ensimmaisen viikon tyopaketti 3.-9.8.2026

Paivays: 22.6.2026

## Viikon tavoite

Elokuun ensimmaisen viikon tavoite on muuttaa kesakuun testaus ja heinakuun kevyt yllapito selkeaksi julkaisua ohjaavaksi paatoslistaksi.

Viikon lopussa pitaa olla tiedossa:

1. Mitka palautteet korjataan ennen 6.10.2026 julkaisua.
2. Mitka ideat siirtyvat jatkokehitykseen.
3. Mitka asiat poistetaan, piilotetaan tai rajataan pois ensimmaisesta julkaisusta.
4. Mita paatoksia tarvitaan viela nimestä, osoitteesta, yllapidosta, tietosuojasta ja saavutettavuudesta.

Tama ei ole viela iso toteutusviikko. Toteutus alkaa vasta, kun palautteet ja julkaisun rajaus on paatetty.

## Lahtotila

Lahtotilaksi oletetaan:

- Kesakuun julkinen testaus on paattynyt.
- Heinakuussa on tehty vain kevyt yllapito ja kriittiset korjaukset.
- Kehitysjono, linkki-ilmoitukset ja mahdolliset suorat testipalautteet ovat kertyneet eri lahteisiin.
- Nykyinen roadmap jakaa elokuun alun kahteen pakettiin:
  - WP1: testitulosten koonti 1.-6.8.2026
  - WP2: julkaisun rajaus 5.-9.8.2026

## Viikon onnistumisen maaritelma

Viikko on onnistunut, jos sunnuntaina 9.8.2026:

- kaikki tunnetut testipalautteet on koottu yhteen listaan
- palautteet on luokiteltu P1/P2/P3/jatkokehitys/ei toteuteta -mallilla
- julkaisuun pakolliset korjaukset on erotettu mukavista mutta ei pakollisista ideoista
- nimen, osoitteen, yllapitoprosessin, tietosuojan ja saavutettavuuden paatoskohdat on kirjattu
- elokuun seuraavan viikon toteutuspaketti voidaan aloittaa ilman arvailua

## Rajaus

Viikolla tehdaan:

- palautteiden koonti
- linkki-ilmoitusten ja kehitysjonon tarkistus
- P1/P2/P3-luokittelu
- julkaisun rajaus
- paatoslista ihmisille
- toteutusjonon valmistelu

Viikolla ei viela tehda:

- Cloudcity-siirtoa
- uutta tietokantaa
- isoa visuaalista uudistusta
- taysimittaista linkkiauditointia
- saavutettavuusselosteen lopullista julkaisua
- tietosuojaselosteen lopullista julkaisua ilman vahvistettuja yhteystietoja

## Prioriteettiluokitus

Käytä palautteille seuraavaa mallia:

| Luokka | Merkitys | Esimerkki | Ennen julkaisua |
| --- | --- | --- | --- |
| P1 | Estaa tai rikkoo kayton | sivu ei lataudu, palaute ei tallennu, mobiili ei kayttokelpoinen | korjataan |
| P2 | Selva kaytettavyys- tai luottamusongelma | palvelu loytyy huonosti, teksti harhaanjohtaa, yllapito ei pysty kasittelemaan ilmoitusta | yleensa korjataan |
| P3 | Hyodyllinen parannus | parempi teksti, yksittainen linkkilisays, pieni visuaalinen hienosaato | korjataan jos mahtuu |
| Jatkokehitys | Hyva idea, mutta ei julkaisun ehto | uusi iso toiminto, laaja integraatio, uusi sisaltokokonaisuus | siirretaan |
| Ei toteuteta | Ei sovi rajaukseen tai aiheuttaa liikaa haittaa | liian laaja, tietosuojariski, ei kohderyhman tarve | perustellaan |

## Lahteet, jotka kaydaan lapi

1. Julkinen kehitysjono: `kehitysjono.html`
2. Yllapidon linkki-ilmoitukset: `ehdotukset.html`
3. Palautelomakkeen tallennukset ja mahdolliset liitteet
4. Testaajilta suoraan tulleet viestit
5. Opastustilanteiden havainnot
6. Kesakuun ja heinakuun aikana kirjatut dokumentit:
   - `docs/ensi-viikon-tyopaketti-2026-06-22.md`
   - `docs/keskeneraiset-tyot-valmiiksi-2026-06-18.md`
   - `docs/elokuun-julkaisusuunnitelma.md`
   - `docs/julkaisuroadmap-2026-10-06.md`
   - `TODO_HUMAN.md`

## Paivakohtainen suunnitelma

### Maanantai 3.8.2026: aineiston kokoaminen

Tavoite: kaikki palaute loytyy yhdesta tyolistasta.

Tehtavat:

1. Tarkista kehitysjono ja kirjaa palautteiden tila.
2. Tarkista yllapidon linkki-ilmoitukset.
3. Kokoa suorat testipalautteet samaan listaan.
4. Merkitse jokaiselle havainnolle lahde, paivays, kunta/laite jos tiedossa ja lyhyt kuvaus.
5. Erottele bugit, kaytettavyys, sisalto, saavutettavuus, tekniset asiat ja uudet ideat.

Hyvaksyttava lopputulos:

- yksi palautekooste on olemassa
- mikaan tunnettu palautelahde ei ole kokonaan tarkistamatta
- epaselvat palautteet on merkitty `tarvitsee tarkennusta`

Arvio:

- ihmisen aktiivinen aika: 1-2 h
- Codex-/toteutusaika: 1-2 h

### Tiistai 4.8.2026: ensimmainen priorisointi

Tavoite: palautemassa muuttuu paatoskelpoiseksi.

Tehtavat:

1. Luokittele kaikki havainnot P1/P2/P3/jatkokehitys/ei toteuteta -mallilla.
2. Merkitse jokaiselle P1/P2-havainnolle ehdotettu korjaustapa.
3. Merkitse jokaiselle jatkokehitysidealle, mihin vaiheeseen se sopii.
4. Nosta epaselvat tai ristiriitaiset asiat erilliseen paatoslistaan.
5. Tarkista, onko jokin havainto jo korjattu kesakuussa.

Hyvaksyttava lopputulos:

- P1/P2-lista on alustavasti valmis
- P3- ja jatkokehityslista eivat sotke julkaisun minimirajausta
- `ei toteuteta` -kohdille on lyhyt perustelu

Arvio:

- ihmisen aktiivinen aika: 1-2 h
- Codex-/toteutusaika: 1-2 h

### Keskiviikko 5.8.2026: julkaisun minimirajaus

Tavoite: paatetaan, mita ensimmaiseen julkaisuun oikeasti tarvitaan.

Tehtavat:

1. Valitse julkaisuun pakolliset korjaukset.
2. Valitse korjaukset, jotka tehdaan vain jos aikaa ja energiaa jaa.
3. Kirjaa asiat, joita ei tehda ennen 6.10.2026 julkaisua.
4. Tee poistettavien tai piilotettavien asioiden lista:
   - testilinkit
   - keskeneraiset kokeilut
   - vain yllapidolle tarkoitetut linkit
   - epaselvat palvelulinkit
5. Tarkista, etta rajaus sopii elokuun ja syyskuun roadmapiin.

Hyvaksyttava lopputulos:

- julkaisuun pakollinen lista on lyhyt ja realistinen
- julkaisuun kuulumattomat asiat on nimetty
- seuraava toteutuspaketti voidaan muodostaa listasta

Arvio:

- ihmisen aktiivinen aika: 1-1,5 h
- Codex-/toteutusaika: 1-2 h

### Torstai 6.8.2026: paatospaketti ihmisille

Tavoite: isot paatokset eivat jaa teknisen listan sisaan piiloon.

Tehtavat:

1. Kirjaa paatoskysymykset viidesta aiheesta:
   - nimi
   - lopullinen osoite tai polku
   - yllapitoprosessi ja yllapitolinkkien nakyvyys
   - tietosuoja- ja saavutettavuusyhteystiedot
   - Firebase/Cloudcity-suunta
2. Tee jokaisesta kohdasta suositus, ei pelkkaa avointa kysymysta.
3. Merkitse, kuka paattaa ja mihin mennessa.
4. Paivita `TODO_HUMAN.md`, jos paatos vaatii Eeron tai muun henkilon vahvistusta.

Hyvaksyttava lopputulos:

- paatospaketti on valmis kaytavaksi lapi ihmisten kanssa
- paatoskohdat eivat esta P1/P2-korjausten aloittamista, ellei kyse ole nimestä, osoitteesta tai tietosuojasta

Arvio:

- ihmisen aktiivinen aika: 1-2 h
- Codex-/toteutusaika: 1-2 h

### Perjantai 7.8.2026: toteutusjonon lukitus

Tavoite: seuraavan viikon koodaus voidaan aloittaa hallitusti.

Tehtavat:

1. Muunna P1/P2-havainnot toteutettaviksi tehtaviksi.
2. Jaa tehtavat pieniin commit-koreihin:
   - kayttoliittyma
   - sisalto ja linkit
   - yllapito ja palaute
   - saavutettavuuden pikakorjaukset
   - dokumentit ja viestinta
3. Merkitse jokaiselle korille testit:
   - `npx vite build`
   - valikoitu selaintesti
   - tarvittaessa mobiilin leveys
   - tarvittaessa admin-/yllapitopolku
4. Paivita elokuun roadmapin ensimmainen toteutuspaketti.

Hyvaksyttava lopputulos:

- seuraavalle viikolle on toteutuskelpoinen P1/P2-tyojono
- jokaisella korilla on omat tiedostot, testit ja valmiin maaritelma

Arvio:

- ihmisen aktiivinen aika: 1-1,5 h
- Codex-/toteutusaika: 1-2 h

### Lauantai-sunnuntai 8.-9.8.2026: kevyt sulku

Tavoite: viikko ei jaa levälleen.

Tehtavat:

1. Tarkista, etta dokumentit ovat yhtenaiset.
2. Aja tarvittaessa:

   ```powershell
   npx vite build
   ```

3. Kirjaa viikon lopputulos:
   - P1/P2-lista
   - paatoskohdat
   - siirretyt asiat
   - seuraavan viikon ensimmainen toteutuskori
4. Commitoi ja pushaa dokumenttikori, jos muutokset ovat valmiit.

Hyvaksyttava lopputulos:

- viikko paattyy yhteen selkeaan koontiin
- maanantaina 10.8.2026 voidaan aloittaa toteutus ilman uutta selvityskierrosta

Arvio:

- ihmisen aktiivinen aika: 0,5-1 h
- Codex-/toteutusaika: 0,5-1 h

## Tuotokset

Viikon lopussa pitaisi syntya ainakin nama:

1. `docs/elokuun-palautekooste-2026.md`
2. `docs/elokuun-p1-p2-korjauslista-2026.md`
3. paivitetty `docs/elokuun-julkaisusuunnitelma.md`
4. paivitetty `TODO_HUMAN.md`
5. tarvittaessa paivitetty `docs/julkaisuroadmap-2026-10-06.md`

## Paatokset, joita ei pida ohittaa

Naita ei kannata jattaa Codexin arvattavaksi:

1. Virallinen nimi: jatketaanko nimella `Aloitussivu`.
2. Osoite: `seniorsurf.fi/aloitussivu`, oma domain vai valiaikainen julkaisuosoite.
3. Yllapitolinkit: nakyvatko `Ylläpito`, `Kehitysjono`, `Linkkiluettelo` ja `Muutosloki` julkisessa navigaatiossa.
4. Tietosuoja: rekisterinpitäjä ja yhteydenotto-osoite.
5. Saavutettavuus: palautekanava ja vastuuhenkilo.
6. Tuotantopolku: Firebase jatkaa valiaikaisesti vai valmistellaanko Cloudcity-siirto ennen julkaisua.

## Seuraavan viikon aloituspiste

Maanantaina 10.8.2026 aloitetaan ensimmainen toteutuskori vain, jos P1/P2-lista on hyvaksytty.

Suositeltu ensimmainen kori:

```text
korjaa testipalautteen P1/P2-kaytettavyysasiat
```

Jos paatoksia puuttuu, ensimmainen kori on sen sijaan:

```text
lukitse julkaisun rajaus ja paatoskohdat
```

## Riskit

| Riski | Vaikutus | Vastatoimi |
| --- | --- | --- |
| Palautteita on paljon ja ne ovat hajallaan | priorisointi venyy | kokoa ensin kaikki, paata vasta sitten |
| P3-ideat vievat tilan P1/P2-korjauksilta | julkaisu viivastyy | pidä julkaisun minimirajaus erillaan |
| Nimi, osoite tai yllapitovastuu jaa auki | tekstit ja toteutus haarautuvat | tee suositus ja maarita paatospäivä |
| Cloudcity-keskustelu alkaa liian aikaisin | viikko muuttuu tekniseksi selvitykseksi | kirjaa kysymykset, siirra toteutus syyskuun pakettiin |
| Saavutettavuus ja tietosuoja jaavat loppukuuhun liian isoina | julkaisuriski kasvaa | nosta P1-havainnot heti elokuun alussa |

