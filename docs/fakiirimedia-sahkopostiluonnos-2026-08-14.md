# Sähköpostiluonnos Fakiirimedialle

**Lähetettävä:** perjantaina 14.8.2026  
**Vastaanottaja:** Fakiirimedian nimetty SeniorSurf-/Cloudcity-ylläpitoyhteyshenkilö  
**Vastaus pyydetään:** maanantaina 17.8.2026 klo 12 mennessä  
**Lähettäjä:** SeniorSurf-tuotevastuu

## Aihe

SeniorSurf.fi/aloitussivu – Cloudcity-toteutuksen tekninen koordinointi

## Viesti

Hei,

valmistelemme uutta **Seniorin aloitussivu** -palvelua julkaistavaksi Cloudcityssä osoitteessa:

`https://seniorsurf.fi/aloitus/`

Tavoitejulkaisu on tiistai 1.9.2026 ja ehdoton takaraja torstai 3.9.2026. Nykyinen `seniorsurf.fi`-pääsivusto toimii WordPressillä, eikä Aloitussivun toteutus saa häiritä sen toimintaa, tietokantaa, lisäosia, teemaa, ylläpitoa, välimuistia tai reititystä.

Pyydämme Fakiirimediaa nimeämään teknisen yhteyshenkilön ja vahvistamaan seuraavat asiat:

1. Mihin fyysiseen hakemistoon `/aloitus/` voidaan turvallisesti kohdistaa niin, että toteutus pysyy erillään WordPressistä?
2. Voidaanko Aloitussivulle tehdä erillinen, pääsyrajattu staging-hakemisto tai staging-osoite?
3. Mitkä PHP-versio, MariaDB-versio, PDO MySQL-, JSON-, OpenSSL- ja cURL-laajennukset, Composer, cron sekä SSH/SFTP ovat käytettävissä?
4. Voidaanko Aloitussivulle luoda oma staging- ja tuotantotietokanta sekä omat käyttäjät ilman oikeuksia WordPressin tietokantaan?
5. Vaatiiko `/aloitus/` muutoksen WordPressin pääjuuren `.htaccess`-sääntöihin? Ensisijainen tavoite on välttää pääjuuren muutos. Jos muutos tarvitaan, pyydämme varmistusta, tarkkaa diffiä ja palautusohjetta ennen toteutusta.
6. Miten LiteSpeedin tai WordPressin välimuistista rajataan pois `/aloitus/api/`, mutta sallitaan Aloitussivun hashattujen staattisten resurssien pitkä välimuisti?
7. Miten WordPressin tiedosto- ja tietokantavarmistus sekä mahdollisen `.htaccess`-muutoksen palautus tehdään ennen staging- ja tuotantomuutosta?
8. Missä Aloitussivun palvelinpuolen salaisuudet, lokit ja suojatut palauteliitteet voidaan säilyttää julkisen web-juuren ulkopuolella?
9. Mitkä arkipäivän muutosikkunat sopivat stagingille tiistaihin 25.8. ja tuotantojulkaisulle tiistaina 1.9.?
10. Kuka Fakiirimediassa hyväksyy WordPressin ennen/jälkeen-savukokeen ja toimii kiireellisen palautuksen yhteyshenkilönä?

Työ tehdään vain maanantaista perjantaihin. Viikonlopuille ei suunnitella muutoksia, hyväksyntöjä tai julkaisuja.

Ehdotamme lyhyttä teknistä läpikäyntiä maanantaina 17.8. Fakiirimedian, SeniorSurfin ja toteuttajan kesken. Sen tuloksena lukitaan hakemistot, tietokannat, varmistukset, reititys, välimuisti, muutosikkunat ja palautusvastuut.

Ystävällisin terveisin,

[Nimi]  
SeniorSurf  
[Sähköposti]  
[Puhelin]

## Lähetyksen jälkeen kirjattava

- vastaanottajan nimi ja rooli;
- lähetysaika;
- vastauksen määräaika;
- sovittu tapaaminen tai avoin muistutus;
- mahdolliset tekniset rajoitteet REL-01-paketin riippuvuuksiksi.
