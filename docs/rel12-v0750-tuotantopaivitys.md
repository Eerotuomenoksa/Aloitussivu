# REL-12: version 0.75.0 tuotantopäivitys

Tämä päivitys viedään käyttäjän omalla SSH-yhteydellä. Tuotannon nykyinen versio 0.74.7 säilytetään palautettavana hakemistona. WordPressin tiedostoihin tai tietokantaan ei kosketa.

## Päivityksen sisältö

- julkisten alasivujen ruotsin- ja englanninkieliset versiot
- ylläpidon siivous ja käytettävyysparannukset
- Aseta aloitussivuksi -painike ja ohjattu selainkohtainen polku
- yksityisyyttä säilyttävät käyttö- ja kasvumittarit
- additiivinen migraatio `003_usage_context_daily.sql`

## Julkaisuportti

Ennen siirtoa vaaditaan puhdas Git-työpuu, yksilöity commit, salaisuustarkistus, TypeScript-tarkistus, Cloudcity-tuotantobuild, PHP-sopimustestit ja ZIPin SHA-256-tiiviste.

Migraatio 003 luo vain uuden koostetaulun. Jos frontend palautetaan versioon 0.74.7, taulu voidaan jättää tietokantaan eikä olemassa olevaa dataa tarvitse muuttaa tai poistaa.

## Palvelinpolut

```text
/home/seniorsurffi/aloitus-production
/home/seniorsurffi/website.wp33403/aloitus
```

Nykyistä `/home/seniorsurffi/aloitus-production/secrets/config.php`-tiedostoa, lokeja, Firebase-avainten välimuistia tai suojattuja liitteitä ei korvata paketista.

## STOP-ehdot

Keskeytä ennen aktivointia, jos jokin seuraavista toteutuu:

- ZIPin SHA-256 ei täsmää paikalliseen arvoon
- ehdokkaan `build-info.json` ei ilmoita versiota 0.75.0 ja migraatiota 003
- palvelinpolun `realpath` ei ole täsmälleen odotettu
- nykyisestä julkisesta ja yksityisestä koodista ei synny palautuspakettia
- migraation jälkeen `schema_migrations`-rivi tai uusi taulu puuttuu
- health ei palauta `ok`, `up` ja `v1`

## Hyväksymiskokeet

Aktivoinnin jälkeen tarkistetaan etusivu, alasivujen kieliversiot, aloitussivuopas, palaute, linkki-ilmoitus, ylläpidon Google-kirjautuminen, käyttötilastot, health, tarkoituksellinen 404 sekä WordPressin keskeiset sivut.

P1-virhe käynnistää julkisen hakemiston palautuksen versioon 0.74.7. Migraatio 003 jätetään paikalleen, koska se on additiivinen eikä vanha sovellus käytä taulua.
