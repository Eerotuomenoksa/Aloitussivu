# Linkkien mittausajo 2026-08-30

Ajettu komennolla `node scripts/link-check-benchmark.mjs`. Mittaus ei muuta sovelluksen linkkinäkyvyyttä.

## Tulokset

| Mittari | Määrä |
|---|---:|
| Linkkejä tarkistettu | 2386 |
| Kunnossa (ok) | 2197 |
| Varoitus (bottisuojaus tms.) | 20 |
| Epäonnistui (failed) | 110 |
| Ohitettu, ei HTTPS (rejected) | 59 |
| Näistä HTTPS-versio toimii | 42 |
| Verkkotunnus vaihtui ohjauksessa | 44 |
| Sisältöhuomio (soft-404, parkkisivu, tyhjä) | 14 |

## Vastausajat (onnistuneet HTTPS-tarkistukset)

- mediaani 169 ms
- 90. persentiili 994 ms
- 99. persentiili 3054 ms
- hitain 10321 ms
- koko ajo 217 s rinnakkaisuudella 10

## Virhekoodit

- http_status_error: 58
- https_available: 42
- enotfound: 41
- access_limited: 20
- https_required: 17
- unable_to_verify_leaf_signature: 2
- etimedout: 2
- eai_again: 2
- server_error: 1
- und_err_connect_timeout: 1
- econnreset: 1
- timeout: 1
- err_tls_cert_altname_invalid: 1

## Cron-mitoitus

Tarkistettavia HTTPS-linkkejä koko katalogissa: 2327.

| Tarkistusväli | Kerran vrk | 4× vrk | Tunnin välein |
|---|---:|---:|---:|
| 7 vrk | 333 | 84 | 14 |
| 14 vrk | 167 | 42 | 7 |
| 30 vrk | 78 | 20 | 4 |

Taulukon luku on **vähimmäiserän koko** (`link_checks.batch_size`), jolla koko linkkimassa ehtii läpi annetussa ajassa. Lisää siihen vielä varaa uusintayrityksille: epäonnistuneet linkit tarkistetaan `retry_hours`-välein ja ne kuluttavat samaa erää.

Yhden tarkistuksen mediaanikesto oli 169 ms, joten peräkkäin ajettuna 7 linkin erä kestää tyypillisesti noin 1 s. Hitaimmillaan (99. persentiili) sama erä kestää noin 21 s.

### Uusintayritysten kuorma

Vikatilassa oli 4.7 % tarkistetuista, mikä koko katalogissa tarkoittaa noin 110 linkkiä.

- Kiinteällä `retry_hours = 24`: **110 ylimääräistä tarkistusta vuorokaudessa**.
- Porrastetulla uusinnalla (6 h → 24 h → 72 h → 7 vrk): noin **16 tarkistusta vuorokaudessa**.

Erän koon on katettava vakiokuorma **ja** uusinnat. Tunnin välein ajettuna tarvittava `batch_size` on vähintään `ceil((vakiokuorma + uusinnat) / 24)` ja siihen päälle noin 20 % varaa.
