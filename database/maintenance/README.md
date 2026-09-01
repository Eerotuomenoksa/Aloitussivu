# Ylläpitokyselyt

Nämä eivät ole migraatioita. Niitä ei ajeta automaattisesti eikä kirjata `schema_migrations`-tauluun, ja ne voi ajaa useamman kerran.

## reset-usage-stats.sql — kävijätilastojen nollaus

Tyhjentää neljä käyttölukutaulua: `usage_daily`, `usage_page_daily`, `usage_link_daily` ja `usage_context_daily`. Tarkoitettu ajettavaksi kerran julkaisuaamuna, jotta tuotannon testiliikenne ei sekoitu oikeiden käyttäjien lukuihin.

**Ei koske** palautteisiin (`feedback_items`, `test_feedback_responses`), linkkeihin, ylläpitäjiin, huijausvaroituksiin eikä `audit_log`-tauluun.

### Ennen ajoa

Ota vedos. Nollaus on peruuttamaton, eikä poistettuja lukuja saa mistään takaisin.

```bash
mysqldump --host=dbtqq.db.cchosting.fi --user=TUOTANNON_KAYTTAJA -p \
  --single-transaction TUOTANNON_TIETOKANTA \
  usage_daily usage_page_daily usage_link_daily usage_context_daily \
  > ~/varmistus-kayttoluvut-$(date +%Y%m%d-%H%M).sql
```

### Ajo

```bash
mysql --host=dbtqq.db.cchosting.fi --user=TUOTANNON_KAYTTAJA -p \
  TUOTANNON_TIETOKANTA < reset-usage-stats.sql
```

`-p` ilman salasanaa on tahallinen: salasana kysytään piilotettuna eikä päädy komentohistoriaan.

Skripti tulostaa lopuksi rivimäärät. Kaikkien pitää olla 0.

### Ajankohta

`usage_date` kirjoitetaan UTC-aikaan (API asettaa `SET time_zone = '+00:00'` jokaiselle yhteydelle; palvelimen oma istunto on EEST, siihen ei saa luottaa). Suomen aikaa klo 03:00 ja 00:00 välillä ajettu nollaus osuu siis eri UTC-vuorokaudelle kuin ajaja olettaa. Aja aamulla klo 6 jälkeen, niin ongelmaa ei ole.

Nollauksen jälkeen kertyvät luvut alkavat nollasta heti seuraavasta sivulatauksesta. Sovellusta ei tarvitse käynnistää uudelleen eikä välimuisteja tyhjentää; ylläpitonäkymä lukee luvut suoraan tietokannasta.
