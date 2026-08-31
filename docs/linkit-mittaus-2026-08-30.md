# Linkkien mittausajo 2026-08-30

Ajettu komennolla `node scripts/link-check-benchmark.mjs`. Mittaus ei muuta sovelluksen linkkinäkyvyyttä.

## Tulokset

| Mittari | Määrä |
|---|---:|
| Linkkejä tarkistettu | 2376 |
| Kunnossa (ok) | 2326 |
| Varoitus (bottisuojaus tms.) | 20 |
| Epäonnistui (failed) | 13 |
| Ohitettu, ei HTTPS (rejected) | 17 |
| Näistä HTTPS-versio toimii | 0 |
| Verkkotunnus vaihtui ohjauksessa | 3 |
| Sisältöhuomio (soft-404, parkkisivu, tyhjä) | 14 |

## Vastausajat (onnistuneet HTTPS-tarkistukset)

- mediaani 209 ms
- 90. persentiili 1134 ms
- 99. persentiili 3336 ms
- hitain 10753 ms
- koko ajo 261 s rinnakkaisuudella 10

## Virhekoodit

- access_limited: 20
- https_required: 17
- timeout: 4
- http_status_error: 3
- unable_to_verify_leaf_signature: 2
- server_error: 1
- und_err_connect_timeout: 1
- econnreset: 1
- err_tls_cert_altname_invalid: 1

## Cron-mitoitus

Tarkistettavia HTTPS-linkkejä koko katalogissa: 2359.

| Tarkistusväli | Kerran vrk | 4× vrk | Tunnin välein |
|---|---:|---:|---:|
| 7 vrk | 337 | 85 | 15 |
| 14 vrk | 169 | 43 | 8 |
| 30 vrk | 79 | 20 | 4 |

Taulukon luku on **vähimmäiserän koko** (`link_checks.batch_size`), jolla koko linkkimassa ehtii läpi annetussa ajassa. Lisää siihen vielä varaa uusintayrityksille: epäonnistuneet linkit tarkistetaan `retry_hours`-välein ja ne kuluttavat samaa erää.

Yhden tarkistuksen mediaanikesto oli 209 ms, joten peräkkäin ajettuna 8 linkin erä kestää tyypillisesti noin 2 s. Hitaimmillaan (99. persentiili) sama erä kestää noin 27 s.

### Uusintayritysten kuorma

Vikatilassa oli 0.6 % tarkistetuista, mikä koko katalogissa tarkoittaa noin 13 linkkiä.

- Kiinteällä `retry_hours = 24`: **13 ylimääräistä tarkistusta vuorokaudessa**.
- Porrastetulla uusinnalla (6 h → 24 h → 72 h → 7 vrk): noin **2 tarkistusta vuorokaudessa**.

Erän koon on katettava vakiokuorma **ja** uusinnat. Tunnin välein ajettuna tarvittava `batch_size` on vähintään `ceil((vakiokuorma + uusinnat) / 24)` ja siihen päälle noin 20 % varaa.
