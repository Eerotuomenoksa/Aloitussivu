# Linkkien turvallisuustarkistuksen suunnitelma

Paivitetty: 2026-06-12

## Tavoite

Tavoitteena on varmistaa, etta Aloitussivulla naytettavat linkit ovat teknisesti toimivia, kayttajalle turvallisia ja sisalloltaan sita mita linkin nimi antaa ymmartaa. Tarkistus jaetaan kahteen tasoon:

1. Automaattinen tarkistus, joka ajetaan saannollisesti ja piilottaa riskilinkit heti.
2. Manuaalinen varmennus, jossa ihminen tarkistaa linkin aitouden ja kirjaa paatoksen jarjestelmaan.

Automaattinen tarkistus ei voi yksin todistaa, etta linkki on oikea ja luotettava. Se voi kuitenkin loytaa katkenneet linkit, vaarat protokollat, uudelleenohjaukset, sisaverkko-osoitteet, domainin poikkeamat ja muut riskimerkit.

## Toteutustila 2026-06-12

Toteutettu:
- `scripts/update-links.mjs` laskee riskipisteet jokaiselle linkille.
- Raportteihin lisattiin alkuperainen domain, lopullinen domain, domainin vaihtuminen, RDAP-signaali, sisaltosignaali, sivun otsikko, riskipisteet ja suositeltu toimenpide.
- Linkit piilotetaan nyt suosituksen `piilota` perusteella, ei pelkan HTTP-statuksen mukaan.
- `docs/linkit-manuaalinen-tarkistus.csv` muodostaa manuaalisen tarkistusjonon riskijarjestyksessa.
- `verifiedLinks.ts` toimii versionhallittuna manuaalisen varmennuksen rekisterina.
- RSS- ja uutisvirtalinkit seka `http://`-linkit ovat mukana tarkistuksessa.

Seuraavat jatkovaiheet:
- Yllapitokayttoliittyma manuaalisen varmennuksen kirjaamiseen ilman koodin muokkausta.
- Mahdollinen Safe Browsing -integraatio haitta- ja phishing-signaaliksi.
- Tarkempi organisaationimien vertailu RDAP-, sivusisalto- ja odotettu organisaatio -tietojen valilla.
- Ajastettu GitHub Actions -ajo, joka avaa tarkistusraportista PR:n.

## Nykyinen tilanne

Nykyinen tarkistus tehdään skriptilla `scripts/update-links.mjs`.

Skripti:
- keraa linkit sovelluksen lahdetiedostoista
- tarkistaa URL-muodon
- tarkistaa DNS-ratkaisun
- estaa paikalliset ja yksityiset IP-alueet
- tekee HTTP/HTTPS-tarkistuksen koko URL-polkuun
- merkitsee ei-HTTPS-linkit turvallisuushuomioksi
- tarkistaa myos RSS- ja uutisvirtalinkit
- kirjoittaa raportit tiedostoihin `docs/linkit.csv`, `docs/linkit-huomiot.csv` ja `docs/yllapito-linkkiloki.csv`
- kirjoittaa piilotettavat URL:t tiedostoon `linkHealth.ts`

Tarkistuksessa ei siis riita, etta domain on olemassa. Myos varsinainen alasivu ja polku tarkistetaan HTTP-pyynnolla. Jos domain toimii mutta alasivu on poistunut, siirtynyt tai palauttaa virhekoodin, linkki merkitään huomioon tai virheeseen.

## Automaattisen tarkistuksen kerrokset

### 1. Linkkien keruu

Kaikki linkit tulee kerata yhdesta tarkistusputkesta, jotta linkkiluettelon, etusivun ja alueellisten palveluiden valilla ei synny katveita.

Kerattavat lahteet:
- palvelukategoriat: `constants.tsx`
- alueelliset palvelut: `localServices.ts`
- kuntien sivut: `municipalityWebsites.ts`
- kuntien kieliversiot: `municipalityWebsiteLocales.ts`
- paikallislehdet: `localNewspaperLinks.ts`
- RSS- ja uutisvirrat: `localNewspaperFeeds.ts` ja `localServices.ts`
- paikalliset urheiluseurat: `localSportsClubs.ts`
- paikallinen ohjattu liikunta: `localExerciseLinks.ts`
- Kela-taksien tilausnumerot ja lahde-PDF: `localKelaTaxiNumbers.ts`
- sovelluksen omat ulkoiset linkit

Hyvaksyttava lopputulos:
- jokaisella linkkirivilla on nimi, URL, kategoria, osio ja lahdetiedosto
- raportissa erotetaan uniikit lahdelinkit ja kayttoliittyman kuntakohtaiset esiintymat
- sama URL voidaan esiintya monessa kunnassa, mutta tekninen tarkistus voidaan tehda kerran per uniikki URL

### 2. URL-rakenteen tarkistus

Jokaiselle URL:lle tarkistetaan:
- protokolla on `https://` tai `http://`
- URL ei sisalla kayttajatunnusta tai salasanaa
- URL ei osoita `localhost`-, `.local`-, `0.0.0.0`- tai sisaverkkokohteeseen
- URL voidaan jäsentää standardin URL-parserilla
- fragmentit, kuten `#kela-taksi-1`, eivat riko tarkistusta

Saanto:
- `https://` on normaali sallittu tila
- `http://` on turvallisuushuomio ja piilotetaan kayttajilta, ellei linkille ole tehty erillista poikkeuspaätosta
- muut protokollat, kuten `javascript:`, `file:`, `data:` ja `ftp:`, ovat virhe

### 3. DNS- ja IP-tarkistus

Domainista haetaan IP-osoitteet DNS:n kautta.

Automaattisesti huomioitavat riskit:
- DNS ei ratkea
- domain palautuu yksityiseen IP-alueeseen
- domain palautuu loopback-osoitteeseen
- domain palautuu link-local-osoitteeseen
- domain palautuu vain IPv6-osoitteeseen, jota tarkistusymparisto ei pysty kasittelemaan oikein

DNS-tarkistus kertoo vain, minne domain osoittaa. Se ei kerro, onko sivusto sisalloltaan oikea.

### 4. HTTP- ja HTTPS-tarkistus koko polulle

Jokaiselle URL:lle tehdään HTTP-pyynto.

Tarkistusjarjestys:
- ensin `HEAD`
- jos palvelin palauttaa esimerkiksi 400, 403 tai 405, kokeillaan kevytta `GET`-pyyntoa
- uudelleenohjauksia seurataan
- lopullinen URL kirjataan raporttiin
- HTTP-status kirjataan raporttiin

Hyvaksi tulkitaan:
- 200-399

Huomioon tai virheeseen menevat:
- 400-499
- 500-599
- aikakatkaisu
- TLS-virhe
- verkko- tai fetch-virhe
- liian monta uudelleenohjausta
- lopullinen URL siirtyy selvästi eri organisaation domainiin

Erityisesti 403 ja 429 voivat olla bottisuojausta eivatka aina tarkoita, etta linkki on rikki. Silti ne ovat hyvia yllapitohuomioita. Kayttajille naytettavissa linkeissa voidaan valita varovainen linja: piilotetaan ensin, palautetaan nakyviin manuaalisen varmennuksen jalkeen.

### 5. Uudelleenohjausten tarkistus

Automaattisesti kirjataan:
- alkuperainen URL
- lopullinen URL
- muuttuiko protokolla
- muuttuiko host
- muuttuiko rekisteroitava domain

Riskitasot:
- sama host, pieni polkumuutos: normaali
- sama organisaation domain, eri host: huomio
- eri domain, mutta tunnettu konserni tai viranomainen: manuaalinen tarkistus
- lyhytlinkki tai tuntematon valipalvelu: piilotus ja manuaalinen tarkistus
- HTTPS -> HTTP: piilotus

### 6. Sisallon perustarkistus

Automaattinen tarkistus voi hakea sivun otsikon ja pienen tekstikatkelman.

Tarkistettavat asiat:
- sivun `<title>`
- ensimmainen `h1`
- meta description
- canonical URL
- kieli
- onko sivu kirjautumis-, virhe-, parkkisivu- tai mainossivu
- sisaltaako sivu odotetun organisaation nimen

Esimerkki:
- linkin nimi: "Tampereen palvelut"
- odotettuja sanoja: Tampere, tampere.fi, kaupunki, palvelut
- jos sivu palauttaa kasinon, mainosdomainin tai tyhjan parkkisivun, linkki piilotetaan

Tama vaihe kannattaa toteuttaa erillisena jatkoparannuksena, koska pelkka tekstiosuma ei riita luotettavaan paatokseen. Se toimii parhaiten riskipisteytyksen osana.

### 7. Haitta- ja mainearviosignaalit

Mahdollisia lisatarkistuksia:
- Google Safe Browsing API
- Microsoft Defender SmartScreen -tyyppiset listat, jos saatavilla
- PhishTank tai vastaava avoin phishing-data
- Certificate Transparency -lokit
- DNSSEC-status
- domainin ika ja rekisterointipaiva

Naiden kaytossa pitaa huomioida:
- API-avaimet eivat saa vuotaa selaimeen
- tulokset voivat olla vanhentuneita tai puutteellisia
- yksikaan mainepalvelu ei saa yksin poistaa kriittista linkkia pysyvasti ilman lokia

### 8. Riskipisteytys

Jokaiselle linkille annetaan automaattinen tila:
- `ok`: teknisesti toimii eika riskimerkkeja
- `huomio`: toimii osittain tai vaatii yllapitajan silman
- `virhe`: ei toimi tai on teknisesti vaarallinen
- `piilotettu`: ei nay loppukayttajalle
- `manuaalisesti_varmennettu`: ihminen on tarkistanut linkin
- `poikkeus`: tiedossa oleva erikoistapaus, jolla on perustelu

Esimerkkipisteet:
- ei HTTPS: +40
- DNS ei ratkea: +80
- HTTP 404: +70
- HTTP 500: +60
- HTTP 403 tai 429: +30
- lopullinen domain muuttuu: +50
- sisalto ei vastaa odotettua nimea: +70
- domain uusi tai omistajatieto puutteellinen: +20
- domain palautuu yksityiseen IP-alueeseen: +100

Kayttajilta piilotetaan heti esimerkiksi pisteista 50 ylöspain, mutta yllapito voi palauttaa linkin manuaalisen varmennuksen jalkeen.

## Manuaalisen varmennuksen suunnitelma

### Tavoite

Manuaalinen varmennus todistaa, etta linkki on:
- teknisesti toimiva
- sisalloltaan oikea
- organisaation tai palvelun aidosti hallitsema
- kayttajan kannalta turvallinen
- nimetty sovelluksessa oikein

### Tarkistusroolit

Suositeltu malli:
- tarkistaja: tekee ensitarkistuksen ja kirjaa havainnot
- hyvaksyja: vahvistaa riskilliset tai korkean luottamuksen linkit
- yllapitaja: paattaa poikkeuksista ja palauttaa piilotetut linkit nakyviin

Kriittisille linkeille, kuten viranomaiset, terveys, pankki, tunnistautuminen, Kela, hätapalvelut ja tietoturva, tarvitaan kahden silman periaate.

### Manuaalisen tarkistuksen vaiheet

1. Avaa linkki puhtaassa selaimessa.
2. Tarkista, etta osoiterivin domain vastaa odotettua organisaatiota.
3. Tarkista, etta yhteys on HTTPS ja selaimen varmenne on kunnossa.
4. Tarkista sivun otsikko, logo, footer, yhteystiedot ja organisaation nimi.
5. Etsi sivustolta "Tietoa", "Yhteystiedot", "Saavutettavuus", "Tietosuoja" tai vastaava organisaatiotieto.
6. Vertaa linkin nimea sivuston sisaltoon.
7. Tarkista, ettei sivu ole parkkisivu, mainossivu, uudelleenmyyty domain tai hakukoneen tulossivu.
8. Tarkista, ettei sivu ohjaa odottamattomalle domainille.
9. Jos linkki on puhelinpalveluun, tarkista numero viralliselta sivulta.
10. Jos linkki on RSS-syote, tarkista, etta syote latautuu ja otsikot liittyvat oikeaan julkaisuun.
11. Kirjaa paatos jarjestelmaan.

### Manuaalisesti kirjattavat kentat

Jokaisesta manuaalisesti tarkistetusta linkista kannattaa tallentaa:
- URL
- normalisoitu URL
- linkin nimi
- kategoria
- lahdetiedosto tai lahdejarjestelma
- tarkistuksen tila
- tarkistaja
- tarkistuspäivä
- seuraava tarkistuspäivä
- tarkistustapa
- perustelu
- lopullinen URL uudelleenohjausten jalkeen
- havaittu organisaation nimi
- havaittu domain
- havaittu varmenteen subject/issuer, jos kirjataan
- domainin omistajuussignaali
- luottamustaso
- onko linkki nakyvissa
- mahdollinen poikkeuspaatos

Mahdolliset tilat:
- `pending`: odottaa tarkistusta
- `verified`: tarkistettu ja nakyvissa
- `blocked`: piilotettu
- `needs_review`: vaatii lisaselvitysta
- `exception`: poikkeuksena sallittu
- `retired`: poistettu kaytosta

### Luottamustasot

Ehdotettu asteikko:
- A: virallinen viranomaisen, kunnan, hyvinvointialueen tai tunnetun organisaation domain
- B: tunnettu jarjesto, yritys, lehti, kirjasto tai paikallinen toimija, jonka omistajuus ja sisalto vastaavat toisiaan
- C: sisalto vaikuttaa oikealta, mutta omistajuus- tai yhteystiedot ovat puutteellisia
- D: linkki toimii, mutta vaatii lisaselvitysta
- E: linkki ei ole turvallinen tai ei vastaa tarkoitusta

Kayttajille naytetaan vain A-C, ellei yllapitaja tee erillista poikkeusta.

### Manuaalisen tarkistuksen jono

Jono voidaan muodostaa automaattisesti:
- kaikki uudet linkit
- kaikki `huomio`- tai `virhe`-tilaiset linkit
- kaikki linkit, joiden domain vaihtui
- kaikki linkit, joita ei ole tarkistettu esimerkiksi 12 kuukauteen
- kaikki korkean riskin kategoriat 6 kuukauden valein
- kaikki `http://`-linkit
- kaikki linkit, joiden organisaatiosignaali muuttuu

### Tarkistusrytmi

Suositus:
- uudet linkit: ennen julkaisua
- viranomaiset, terveys, turvallisuus, pankit, tunnistautuminen: 3-6 kuukauden valein
- kunnat ja hyvinvointialueet: 6 kuukauden valein
- paikallislehdet, yhdistykset, harrastuslinkit: 12 kuukauden valein
- RSS-syötteet: automaattisesti viikoittain tai kuukausittain
- kaikki linkit: automaattinen tarkistus jokaisen julkaisun yhteydessa ja ajastettuna esimerkiksi viikoittain

## Kirjaaminen jarjestelmaan

### Kevyt malli

Kevyin malli on lisata repoihin tiedosto:

`verifiedLinks.ts`

Sisalto voisi olla esimerkiksi:

```ts
export const VERIFIED_LINKS = [
  {
    url: 'https://www.kela.fi',
    status: 'verified',
    confidence: 'A',
    verifiedAt: '2026-06-12',
    verifiedBy: 'yllapito',
    organization: 'Kela',
    evidence: 'Kelan virallinen sivusto, yhteystiedot ja sisalto vastaavat linkin nimea.',
    nextReviewAt: '2026-12-12',
  },
] as const;
```

Hyva puoli:
- helppo versionhallita
- muutokset nakyvat git-historiassa
- toimii ilman kirjautumista tai tietokantaa

Huono puoli:
- yllapitajan kayttoliittyma puuttuu
- manuaalinen muokkaus voi olla tyolasta

### Parempi malli

Parempi malli on yhdistaa:
- Firestore-kokoelma `verifiedLinks`
- yllapitosivu linkkien tarkastamiseen
- git-pohjainen eksportti julkaisuun

Tietomalli:

```ts
type VerifiedLink = {
  id: string;
  url: string;
  normalizedUrl: string;
  name: string;
  category: string;
  source: string;
  status: 'pending' | 'verified' | 'blocked' | 'needs_review' | 'exception' | 'retired';
  confidence: 'A' | 'B' | 'C' | 'D' | 'E';
  visible: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  nextReviewAt?: string;
  finalUrl?: string;
  organizationName?: string;
  domainOwnerSignal?: string;
  notes?: string;
  evidence?: string;
  createdAt: string;
  updatedAt: string;
};
```

Jarjestelma voisi:
- nayttaa automaattisen tarkistuksen tulokset
- antaa napin "Varmenna"
- antaa napin "Piilota"
- vaatia perustelun poikkeuksille
- tallentaa tarkistajan ja paivamaaran
- nayttaa seuraavan tarkistuksen erapaivan
- muodostaa listan vanhenevista varmennuksista

## Domainin omistajan tarkistaminen

### Voidaanko domainin omistaja tarkistaa julkisista tiedoista?

Osittain voidaan, mutta ei luotettavasti kaikille domaineille.

Kaytettavia lahteita:
- RDAP
- WHOIS
- Traficomin `.fi`-domainhaku
- DNS-tietueet
- varmenteen Certificate Transparency -lokit
- TLS-varmenteen subject/issuer
- organisaation omat sivut ja yhteystiedot
- viralliset rekisterit, kuten YTJ, yhdistysrekisteri tai viranomaisen oma domainlista

Rajoitukset:
- monet WHOIS/RDAP-tiedot on piilotettu tietosuojan takia
- rekisteroija voi olla palveluntarjoaja, ei varsinainen organisaatio
- sama organisaatio voi kayttaa useita domaineja
- alihankkija voi yllapitaa palvelua eri domainilla
- varmenne kertoo usein vain domainin hallinnasta, ei organisaation sisallon aitoudesta
- domain voi olla kaapattu tai sivusto voi olla murrettu, vaikka omistajatieto olisi oikea

Johtopaatos:
Domainin omistajatietoa voi kayttaa riskipisteytyksen signaalina, mutta sita ei kannata kayttaa yksin automaattiseen varmentamiseen.

### Miten omistajatietoa voidaan kayttaa automaattisesti?

Automaattinen prosessi:

1. Selvitetaan rekisteroitava domain, esimerkiksi `kela.fi`.
2. Haetaan RDAP/WHOIS-tiedot.
3. Haetaan DNS-tietueet ja nimipalvelimet.
4. Haetaan TLS-varmenteen tiedot ja Certificate Transparency -havainnot.
5. Haetaan sivun otsikko, footer ja organisaation nimi.
6. Verrataan niita odotettuun organisaatioon.
7. Annetaan linkille luottamussignaali.

Esimerkki automaattisesta signaalista:
- odotettu organisaatio: Kela
- domain: `kela.fi`
- sivulla esiintyy: Kela, Kansanelakelaitos
- varmenne on voimassa
- HTTPS toimii
- ei odottamattomia uudelleenohjauksia
- luottamussignaali: vahva

Toinen esimerkki:
- odotettu organisaatio: paikallislehti
- domain on vanha `http://`-osoite
- WHOIS ei kerro omistajaa
- sivu ohjaa mainosdomainiin
- luottamussignaali: heikko, piilotetaan

### Automaattisen varmentamisen saannot

Automaattisesti voidaan ehdottaa varmennusta vain, jos kaikki ehdot tayttyvat:
- HTTPS toimii
- HTTP-status on 200-399
- lopullinen domain vastaa alkuperaista tai tunnettua sallittua domainia
- sivun otsikko tai sisalto vastaa odotettua organisaatiota
- domain ei ole uusi tai muuten riskillinen
- domain ei ole tunnettu lyhytlinkki tai parkkisivu
- RDAP/WHOIS/DNS/TLS-signaalit eivat ole ristiriidassa

Silti tila olisi mieluummin:
- `auto_confident`

Ei suoraan:
- `verified`

Lopullinen `verified` kannattaa antaa ihmiselle, ainakin korkean riskin kategorioissa.

## Toteutussuunnitelma

### Vaihe 1 - Nykyisen automaattisen tarkistuksen vahvistaminen

Tehtavat:
- varmista, etta kaikki linkkiluettelon lahteet ovat mukana `update-links.mjs`-skriptissa
- raportoi erikseen uniikit URL:t ja kayttoliittyman esiintymat
- lisaa raporttiin lopullisen URL:n domainmuutos-sarake
- lisaa raporttiin `riskScore`
- lisaa raporttiin `recommendedAction`

Hyvaksymiskriteerit:
- tarkistuksen tulos kertoo, miksi linkki piilotettiin
- jokainen piilotettu linkki loytyy yllapitologiikasta
- linkkiluettelon 3000+ esiintymaa voidaan yhdistaa tarkistettuihin uniikkeihin URL:eihin

### Vaihe 2 - Sisallon kevyt automaattinen tarkistus

Tehtavat:
- hae sivun title, h1 ja meta description
- tunnista parkkisivut ja virhesivut
- vertaa sivun sisaltoa linkin nimeen ja kategoriaan
- tallenna sisaltosignaali raporttiin

Hyvaksymiskriteerit:
- selvasti vaarasisaltoiset sivut nousevat `needs_review`-tilaan
- raportissa nakyy lyhyt perustelu

### Vaihe 3 - Manuaalisen varmennuksen tietomalli

Tehtavat:
- luo `verifiedLinks.ts` tai Firestore-kokoelma `verifiedLinks`
- maarita tilat, luottamustasot ja seuraava tarkistuspäivä
- lisaa yllapitoraporttiin tieto, onko linkki manuaalisesti varmennettu

Hyvaksymiskriteerit:
- tarkistaja voi kirjata paatoksen
- poikkeuspaatos vaatii perustelun
- vanhentuvat tarkistukset listataan

### Vaihe 4 - Yllapitokayttoliittyma

Tehtavat:
- lisaa linkkien tarkistusjono yllapitosivulle
- nayta automaattisen tarkistuksen tulos, riskipisteet ja viimeisin tarkistus
- lisaa toiminnot: varmenna, piilota, merkitse lisaselvitettavaksi, tee poikkeus
- lisaa suodattimet: virheet, huomiot, uudet linkit, vanhentuvat varmennukset, korkean riskin kategoriat

Hyvaksymiskriteerit:
- yllapitaja pystyy kasittelemaan linkkeja ilman koodin muokkausta
- jokaisesta paatoksesta jaa loki

### Vaihe 5 - Domain- ja organisaatiosignaalit

Tehtavat:
- lisaa RDAP-haku
- lisaa Traficom `.fi`-domainhaun manuaalinen tarkistusohje tai mahdollinen integraatio, jos teknisesti ja kayttoehdoiltaan sallittu
- lisaa TLS-varmenteen ja Certificate Transparency -signaalit
- vertaa domainia odotettuun organisaatioon

Hyvaksymiskriteerit:
- raportissa nakyy organisaatiosignaali
- ristiriidat nostetaan manuaaliseen tarkistukseen
- jarjestelma ei merkitse linkkia lopullisesti varmistetuksi pelkan WHOIS/RDAP-tiedon perusteella

### Vaihe 6 - Ajastus ja julkaisuputki

Tehtavat:
- aja linkkitarkistus ennen jokaista buildia
- aja laajempi tarkistus ajastetusti esimerkiksi viikoittain
- tee GitHub Actions -tyo, joka avaa PR:n muuttuneista raporteista
- lisaa yllapitohalytys, jos piilotettujen linkkien maara kasvaa nopeasti

Hyvaksymiskriteerit:
- rikkinainen linkki ei jaa nakyviin seuraavaan julkaisuun
- yllapitaja saa listan uusista ongelmista
- muutoslokiin voidaan kirjata tarkistuksen yhteenveto

## Suositeltu paatosmalli

Automaattinen jarjestelma saa:
- piilottaa teknisesti vaaralliset tai toimimattomat linkit
- merkitä linkin huomioon
- ehdottaa manuaalista varmennusta
- antaa luottamussignaalin

Ihminen paattaa:
- onko linkki aidosti oikea
- palautetaanko 403/429-linkki nakyviin
- sallitaanko `http://`-linkki poikkeuksena
- onko domainin omistajatieto riittava
- mika on linkin seuraava tarkistuspaiva

## Tiivis vastaus domain-omistajuuden automaatioon

Domainin omistaja voidaan joissain tapauksissa tarkistaa julkisista tiedoista ja verrata sivuston sisaltoon. Se on hyodyllinen lisasignaali, mutta ei riita yksin todistamaan, etta linkki on varmasti aito.

Paras malli on yhdistaa:
- tekninen toimivuus
- HTTPS ja varmenne
- DNS/RDAP/WHOIS-signaalit
- sivun sisalto
- odotettu organisaatio
- manuaalinen tarkistus

Nain automaatio hoitaa suuren massan ja ihminen varmistaa ne tapaukset, joissa kayttajan turvallisuus tai organisaation aitous on oikeasti olennainen.
