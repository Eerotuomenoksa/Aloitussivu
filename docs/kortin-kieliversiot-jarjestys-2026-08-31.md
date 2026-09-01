# Opastuskortin kieliversiot — päätetty järjestys

Päivätty: 31.8.2026
Päättäjä: Eero Tuomenoksa
Koskee: `docs/a5-opastuskortti.pdf` ja sen tulevat kieliversiot
Liittyy: `docs/codex-tehtava-markkinointilinkit-src-2026-08-31.md` (MK-04)

## Lähtötilanne

Suomenkielinen A5-kortti on valmis ja menossa painoon torstaiksi 3.9.2026. Kysymys on, tehdäänkö siitä myös ruotsin- ja englanninkieliset versiot ja missä järjestyksessä.

Tarkistettu repositoriosta 31.8.2026:

- **Ruotsi ja englanti ovat sovelluksessa täysin käännetyt.** `i18n.tsx`:n molemmat merkkijonolohkot ovat `sv`- ja `en`-kielillä yhtä kattavat kuin suomessa (noin 320 riviä kummallakin).
- **Ukraina, viro, venäjä ja saame ovat tynkiä.** Toinen merkkijonolohko on näillä kielillä 15 riviä, kun suomessa ja ruotsissa se on yli 220. Käyttöliittymä on siis vain osittain käännetty.
- **Kielen voi valita vain sovelluksesta, ei osoitteesta.** `?lang=`-parametria ei ole; kieli tulee `localStorage`sta tai selaimen kieliasetuksesta.
- **Tuotteen nimestä ei ole yhtenäistä päätöstä.** `linkit-sv.html` käyttää nimeä *Seniorens startsida* ja `linkit-en.html* nimeä *Senior Start Page*, mutta `i18n.tsx`:n `pageTitle` on jokaisella kielellä `Seniorin aloitussivu`. Sovellus ei siis koskaan näytä käännettyä nimeä.

## Päätetty järjestys

### 1. Nyt, ennen torstaita 3.9. — vain suomeksi

Suomenkielinen kortti painoon sellaisenaan. Ei odoteta käännöksiä. Torstain tarve on suomenkielinen erä digiopastajille.

### 2. Viikko 36 — tekniset edellytykset

Codex toteuttaa tehtävän `docs/codex-tehtava-markkinointilinkit-src-2026-08-31.md` kokonaisuudessaan:

- MK-01…MK-03: `?src=`-arvojen täydennys ja `qr`:n poisto
- **MK-04: `?lang=`-parametri**

MK-04 on ehto kaikille käännetyille painomateriaaleille. Ilman sitä ruotsinkielisen kortin QR veisi lukijan sivulle hänen puhelimensa kielellä, ja kortti tarvitsisi ylimääräisen "vaihda kieli" -askeleen. Se askel on juuri se, jossa kohderyhmä putoaa kyydistä.

### 3. Ennen ruotsinkielistä korttia — nimipäätös

Päätettävä: käytetäänkö tuotteesta käännettyä nimeä (*Seniorens startsida*, *Senior Start Page*) vai suomenkielistä nimeä kaikilla kielillä.

Repo on tällä hetkellä itsensä kanssa ristiriidassa, joten päätös on tehtävä joka tapauksessa. Kun se on tehty, se viedään sekä `i18n.tsx`:n `pageTitle`- ja `homepageTitle`-riveille että kortteihin. Tämä on tuotepäätös, ei tekninen kysymys.

### 4. Viikko 37 alkaen — ruotsinkielinen kortti

Valmis viimeistään **28.9.**, jotta se ehtii Vanhustenviikolle 5.–11.10.2026.

- Claude tekee käännöksen suomenkielisestä kortista.
- **Ruotsinkielinen kollega tarkistaa tekstin ennen painoa.** Ikäystävällinen sävy on kielikohtainen asia, jota ei voi varmistaa kääntämällä. Painettua virhettä ei voi korjata.
- QR koodaa `/aloitus/?src=opastus&lang=sv`.

Perustelu ruotsille: käännös on valmis, yleisö on aito ja maantieteellisesti keskittynyt (Pohjanmaa, Turunmaa, Uusimaa), näillä alueilla on omat digiopastusverkostonsa, ja VTKL on kaksikielinen järjestö.

### 5. Lokakuu — arvio: englanti vai uk/et/ru

Englanninkielinen kortti **ei ole seuraava** ruotsin jälkeen automaattisesti. Ennen sitä arvioidaan, kumpi palvelee paremmin:

- **Englanti:** käännös on valmis, mutta yleisö on pieni ja hajanainen. Sivun arvo on Kelassa, kunnan busseissa ja paikallisissa palveluissa — hyvin suomalaista sisältöä.
- **Ukraina, viro, venäjä:** yleisö on todennäköisesti suurempi ja tarve konkreettisempi, mutta käännökset ovat kesken. Kortti ennen käännösten viimeistelyä veisi lukijan puolikkaalle sivulle, mikä on huonompi kuin ei korttia lainkaan.

Arvio tehdään lokakuussa, kun ruotsinkielinen kortti on ulkona ja `?src=`-datasta näkee, mitkä kanavat ylipäätään tuottavat.

## Periaate, joka ohjaa kaikkea yllä

**Käännetty kortti ei saa viedä käännöstä vaille jäävälle sivulle.** Kortti lupaa selkeyttä; jos luvattu kieli katoaa ensimmäisellä klikkauksella, lupaus rikkoutuu juuri sillä käyttäjällä, jolle kynnys oli korkein. Siksi tekniset edellytykset ja käännösten kattavuus ratkaistaan ennen painoa, ei sen jälkeen.
