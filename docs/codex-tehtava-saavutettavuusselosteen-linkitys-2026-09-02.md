# SA-01: Saavutettavuusselosteen linkitys SeniorSurfin omaan selosteeseen

**Kollegien huomio 2.9.2026:** Aloitussivun saavutettavuusseloste pitäisi johtaa SeniorSurfin omaan selosteeseen.

**Tila:** P2, riippuvainen T-04:stä. Voidaan tehdä rinnakkain TS-05:n kanssa.

## Konteksti

Aloitussivulla on erityisesti tälle sivulle laadittu saavutettavuusseloste (408 rivia, `saavutettavuus.tsx`), koska sivulla omat vaatimukset:
- Isot painikkeet
- Tekstikoon säätö
- Rauhallinen visuaalinen rakenne
- Seniorikäyttäjien tarpeet

**BUT:** Käyttäjän pitäisi löytää myös **SeniorSurfin yleiset saavutettavuusvaatimukset** pääselosteesta.

## Mitä lisätään

**saavutettavuus.tsx, navigaatio-osio (rivin 367 jälkeen):**

Nykyinen:
```typescript
<a href="./index.html" className={pageNavLinkClass}>{copy.backHome}</a>
<a href={getLocalizedPublicPageHref('tietosuoja', language)} className={pageNavLinkClass}>{copy.privacy}</a>
```

Muutetaan:
```typescript
<a href="./index.html" className={pageNavLinkClass}>{copy.backHome}</a>
<a href={getLocalizedPublicPageHref('tietosuoja', language)} className={pageNavLinkClass}>{copy.privacy}</a>
<a 
  href="https://seniorsurf.fi/seniorsurf/saavutettavuusseloste/" 
  className={pageNavLinkClass}
  target="_blank"
  rel="noreferrer"
>
  {t('seniorSurfAccessibilityStatement')} {/* tai suora teksti */}
</a>
```

**Kieliversiot:** Lisää 3 versiota (fi, sv, en):
- Suomi: "SeniorSurfin saavutettavuusseloste"
- Ruotsi: "SeniorSurfs tillgänglighetsredogörelse"
- Englanti: "SeniorSurf Accessibility Statement"

## Lisäksi (riippuvainen TS-05:stä)

**tietosuoja.tsx** saa saman linkkityksen omaan pääselosteeseen:
- Linkki: `https://seniorsurf.fi/seniorsurf/tietosuojaseloste/`
- Teksti: "SeniorSurfin tietosuojaseloste" (jne.)

## Testaus

- [ ] Kieliversiot näkyvät oikein (fi/sv/en)
- [ ] Linkit toimivat (external links avautuvat uuteen ikkunaan)
- [ ] Navigaatio-osio on selkeä ja luettava

## Tiedostot

- `saavutettavuus.tsx` — Pää-muutos
- `i18n.tsx` — Kieliversiot (jos käytetään t()-funktiota)
- `tietosuoja.tsx` — Samanlainen muutos (TS-05 yhteydessä)

---

**Liittyvät tehtävät:** TS-05 (tietosuoja-sivun linkitys), T-04 (paikkakunta-luokittelu, P1 riippuvuus)

## Lisäksi: Bullet point -muotoilu saavutettavuusselosteessa

**Havaintojen perusteella** saavutettavuusselosteessa käytetään joissakin kohdissa `list(...)` -funktioita, mutta kaikkialla ei ole riittävää listamuotoilua. 

**Korjaus:** Tarkista `saavutettavuus.tsx` kaikki luettelot ja varmista että ne käyttävät `list()`-funktiota (bullet points) eivät pelkkää tekstiä.

**Esimerkki:**

❌ Nykyinen (teksti):
```typescript
paragraph('Sivustolla on paljon saavutettavuutta tukevia ratkaisuja, kuten suuret painikkeet, selkeä rakenne, tekstikoon säätö...')
```

✅ Korjattu (lista):
```typescript
list(
  'suuret painikkeet',
  'selkeä rakenne',
  'tekstikoon säätö',
  'pääsisältöön hyppäämisen linkki',
  'kuvaavat nimet painikkeille'
)
```

**Tarkistettavat kohdat:**
- Rivi ~52: "Sivustolla on paljon saavutettavuutta tukevia ratkaisuja" → muuta listaksi
- Rivi ~67: "Sivun asetuksista käyttäjä voi" → tarkista onko lista
- Kaikki muut kuvaukset joissa on luetteloitu asioita → muuta listoiksi

**Testaus:**
- Saavutettavuusseloste näyttää selkeästi jäsennellyt listat (bullet points)
- Ruudunlukija lukee ne oikein
