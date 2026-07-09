# Artefaktien säilytyslinjaus 8.7.2026

Tämä linjaus koskee projektissa näkyviä raportteja, renderöintejä, väliaikaistiedostoja ja Office-aineistoja.

## Versionhallintaan kuuluvat

| Aineisto | Linja |
| --- | --- |
| Sovelluskoodi, skriptit ja lähdedata | Säilytetään normaalisti versionhallinnassa |
| `docs/*.md` ja harkitut dokumentit | Säilytetään, kun ne kuvaavat päätöksiä, tarkistuksia tai julkaisuvalmistelua |
| `outputs/regional-link-coverage.json` | Säilytetään, koska se on koneellinen pari alueellisten linkkien raportille |
| Valitut lopulliset esitys- ja auditointitiedostot `docs/`-kansiossa | Säilytetään vain, kun ne ovat tarkoituksellisia julkaisu- tai päätösaineistoja |

## Paikallisiksi rajatut

| Aineisto | Linja |
| --- | --- |
| `tmp/` | Paikallinen väliaikaistieto, ei versionhallintaan |
| Tavalliset `outputs/`-kuvakaappaukset, renderöinnit, previewt ja välitulosteet | Paikallisia tuotoksia, ei versionhallintaan |
| Playwright-, Lighthouse-renderöinti- ja PDF-poimintojen välitulokset | Paikallisia, ellei erikseen valita raporttiliitteeksi |
| `docs/Lighthouse/` | Paikallinen Lighthouse-aineisto, ei viedä GitHubiin |

Tämän perusteella `.gitignore` rajaa `tmp/`-kansion, `docs/Lighthouse/`-kansion ja tavalliset `outputs/`-artefaktit pois, mutta sallii `outputs/regional-link-coverage.json`-raportin versionhallinnassa.

## Päätöstä vaativat

| Aineisto | Päätös |
| --- | --- |
| Root-tason Office-tiedostot, kuten `SROI_Aloitussivu.xlsx` ja palaveriagenda | Päätä, ovatko ne projektin lähdedokumentteja vai paikallista valmisteluaineistoa |
| Uudet esitykset ja PDF:t | Lisää versionhallintaan vain, jos ne ovat lopullisia ja tarkoitettu jaettaviksi |

## Käytännön toimintamalli

1. Luo pysyvä dokumentti `docs/`-kansioon, jos aineisto selittää päätöksen tai julkaisun.
2. Pidä suuret välitulokset `outputs/`- tai `tmp/`-kansiossa.
3. Lisää repoihin vain valitut lopulliset raportit ja esitykset.
4. Jos tiedosto sisältää henkilötietoja, salaisuuksia, keskeneräisiä sopimustietoja tai sisäistä valmistelua, älä lisää sitä versionhallintaan ennen erillistä päätöstä.
