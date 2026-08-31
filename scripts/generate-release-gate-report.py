from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "seniorin-aloitussivu-julkaisun-loppuportti-raportointipohja.pdf"

NAVY = colors.HexColor("#17324D")
GREEN = colors.HexColor("#287A57")
LIGHT_GREEN = colors.HexColor("#EAF4EF")
LIGHT_BLUE = colors.HexColor("#EAF1F7")
LIGHT_GREY = colors.HexColor("#F4F6F7")
MID_GREY = colors.HexColor("#66727E")
GRID = colors.HexColor("#AAB4BC")
RED = colors.HexColor("#9E2A2B")
WHITE = colors.white
BLACK = colors.HexColor("#17212B")


def register_fonts() -> tuple[str, str]:
    regular_candidates = [
        Path("C:/Windows/Fonts/arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    bold_candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    ]
    regular = next((path for path in regular_candidates if path.exists()), None)
    bold = next((path for path in bold_candidates if path.exists()), None)
    if regular is None or bold is None:
        raise RuntimeError("Arial- tai DejaVu Sans -fonttia ei löytynyt.")
    pdfmetrics.registerFont(TTFont("ReportRegular", str(regular)))
    pdfmetrics.registerFont(TTFont("ReportBold", str(bold)))
    return "ReportRegular", "ReportBold"


REGULAR, BOLD = register_fonts()
PAGE_COUNT = 5


def p(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(text, style)


styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    "ReportTitle",
    parent=styles["Title"],
    fontName=BOLD,
    fontSize=22,
    leading=26,
    textColor=NAVY,
    alignment=TA_LEFT,
    spaceAfter=4 * mm,
)
lead_style = ParagraphStyle(
    "Lead",
    parent=styles["BodyText"],
    fontName=REGULAR,
    fontSize=10.5,
    leading=14,
    textColor=BLACK,
    spaceAfter=3 * mm,
)
h1_style = ParagraphStyle(
    "H1",
    parent=styles["Heading1"],
    fontName=BOLD,
    fontSize=15,
    leading=18,
    textColor=NAVY,
    spaceBefore=2 * mm,
    spaceAfter=2.5 * mm,
)
h2_style = ParagraphStyle(
    "H2",
    parent=styles["Heading2"],
    fontName=BOLD,
    fontSize=11.5,
    leading=14,
    textColor=GREEN,
    spaceBefore=2 * mm,
    spaceAfter=2 * mm,
)
body_style = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontName=REGULAR,
    fontSize=9.2,
    leading=12,
    textColor=BLACK,
)
small_style = ParagraphStyle(
    "Small",
    parent=body_style,
    fontSize=8,
    leading=10,
    textColor=MID_GREY,
)
table_header_style = ParagraphStyle(
    "TableHeader",
    parent=body_style,
    fontName=BOLD,
    fontSize=8.2,
    leading=10,
    textColor=WHITE,
    alignment=TA_CENTER,
)
table_style = ParagraphStyle(
    "Table",
    parent=body_style,
    fontSize=8.1,
    leading=10,
)
table_bold_style = ParagraphStyle(
    "TableBold",
    parent=table_style,
    fontName=BOLD,
)
center_style = ParagraphStyle(
    "Center",
    parent=table_style,
    alignment=TA_CENTER,
)
status_style = ParagraphStyle(
    "Status",
    parent=body_style,
    fontName=BOLD,
    fontSize=9,
    leading=12,
)
field_label_style = ParagraphStyle(
    "FieldLabel",
    parent=small_style,
    fontName=BOLD,
    textColor=NAVY,
)


def page_header_footer(canvas, doc) -> None:
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 18 * mm, width, 18 * mm, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont(BOLD, 9.5)
    canvas.drawString(18 * mm, height - 11.5 * mm, "SENIORIN ALOITUSSIVU - 1.0.0 JULKAISUN LOPPUPORTTI")
    canvas.setFillColor(MID_GREY)
    canvas.setFont(REGULAR, 7.5)
    canvas.drawString(18 * mm, 10 * mm, "Tulostettava raportointipohja - versio 31.8.2026")
    canvas.drawRightString(width - 18 * mm, 10 * mm, f"Sivu {doc.page}/{PAGE_COUNT}")
    canvas.setStrokeColor(GRID)
    canvas.setLineWidth(0.4)
    canvas.line(18 * mm, 14 * mm, width - 18 * mm, 14 * mm)
    canvas.restoreState()


def info_box(title: str, lines: list[str], fill=LIGHT_BLUE) -> Table:
    contents = [p(f"<b>{title}</b>", body_style)]
    contents.extend(p(line, body_style) for line in lines)
    table = Table([[contents]], colWidths=[174 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), fill),
                ("BOX", (0, 0), (-1, -1), 0.8, NAVY),
                ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
            ]
        )
    )
    return table


def field_table(rows: list[tuple[str, str, str, str]]) -> Table:
    data = []
    for label_a, value_a, label_b, value_b in rows:
        data.append(
            [
                p(label_a, field_label_style),
                p(value_a or "________________________________", body_style),
                p(label_b, field_label_style),
                p(value_b or "________________________________", body_style),
            ]
        )
    table = Table(data, colWidths=[25 * mm, 62 * mm, 25 * mm, 62 * mm], rowHeights=[10 * mm] * len(data))
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LINEBELOW", (1, 0), (1, -1), 0.5, GRID),
                ("LINEBELOW", (3, 0), (3, -1), 0.5, GRID),
                ("LEFTPADDING", (0, 0), (-1, -1), 1.5 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 1.5 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 1 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1 * mm),
            ]
        )
    )
    return table


def checklist(rows: list[tuple[str, str, str]]) -> Table:
    data = [
        [
            p("ID", table_header_style),
            p("Tarkistus", table_header_style),
            p("Tulos", table_header_style),
            p("Todiste tai huomio", table_header_style),
        ]
    ]
    for item_id, test, evidence in rows:
        data.append(
            [
                p(item_id, table_bold_style),
                p(test, table_style),
                p("PASS [ ]<br/>FAIL [ ]<br/>N/A [ ]", center_style),
                p(evidence or "____________________________<br/>____________________________", table_style),
            ]
        )
    table = Table(data, colWidths=[14 * mm, 86 * mm, 29 * mm, 45 * mm], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("GRID", (0, 0), (-1, -1), 0.5, GRID),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GREY]),
                ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
                ("TOPPADDING", (0, 1), (-1, -1), 2.2 * mm),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 2.2 * mm),
                ("TOPPADDING", (0, 0), (-1, 0), 2.5 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 2.5 * mm),
            ]
        )
    )
    return table


def note_lines(label: str, count: int = 3) -> KeepTogether:
    rows = [[p(label, field_label_style)]]
    rows.extend([[p("&nbsp;", body_style)]] for _ in range(count))
    table = Table(rows, colWidths=[174 * mm], rowHeights=[6 * mm] + [8 * mm] * count)
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                ("LINEBELOW", (0, 1), (0, -1), 0.45, GRID),
                ("LEFTPADDING", (0, 0), (-1, -1), 1.5 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 1.5 * mm),
            ]
        )
    )
    return KeepTogether([table])


def findings_table() -> Table:
    data = [
        [
            p("ID", table_header_style),
            p("P1/P2/P3", table_header_style),
            p("Havainto", table_header_style),
            p("Omistaja", table_header_style),
            p("Tila ja määräaika", table_header_style),
        ]
    ]
    for _ in range(4):
        data.append(
            [
                p("________", table_style),
                p("________", center_style),
                p("", table_style),
                p("", table_style),
                p("", table_style),
            ]
        )
    table = Table(data, colWidths=[19 * mm, 24 * mm, 70 * mm, 28 * mm, 33 * mm], rowHeights=[9 * mm] + [12 * mm] * 4)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("GRID", (0, 0), (-1, -1), 0.5, GRID),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GREY]),
                ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
            ]
        )
    )
    return table


def signature_table() -> Table:
    data = [
        [p("Päätös", field_label_style), p("GO [   ]        NO-GO [   ]", status_style)],
        [p("Päätösaika", field_label_style), p("____.____.2026 klo ________ Europe/Helsinki", body_style)],
        [p("Hyväksyjä", field_label_style), p("________________________________________________________", body_style)],
        [p("Allekirjoitus", field_label_style), p("________________________________________________________", body_style)],
    ]
    table = Table(data, colWidths=[35 * mm, 139 * mm], rowHeights=[10 * mm, 9 * mm, 9 * mm, 10 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 1.1, NAVY),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, GRID),
                ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
            ]
        )
    )
    return table


def build_story() -> list:
    story: list = []

    story.append(Spacer(1, 5 * mm))
    story.append(p("Julkaisun loppuportin raportointipohja", title_style))
    story.append(
        p(
            "Täytä tämä lomake 1.9.2026 ennen version 1.0.0 aktivointia ja laajaa tiedotusta. "
            "Merkitse jokaiselle riville tulos ja lyhyt, todennettava näyttö. Älä kirjoita lomakkeeseen "
            "salaisuuksia, käyttäjäpalautteen sisältöä tai henkilötietoja.",
            lead_style,
        )
    )
    story.append(
        info_box(
            "Lähtötilanne 31.8.2026",
            [
                "1. WordPress-painike: AVOIN. Eero korjaa ja testaa 1.9. aamulla.",
                "2. KO-01-seloste: VALMIS KOODISSA. Nina hyväksyy tekstin; korjaus viedään tuotantoon.",
                "3. Palautetesti: PASS. Henkilötiedoton testi on tehty ja käsitelty ylläpidossa.",
                "4. Loppuportti: AVOIN. Tämän raportin kaikki P1-rivit ja päätös täytetään.",
            ],
            LIGHT_GREEN,
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(p("1. Muutosikkunan perustiedot", h1_style))
    story.append(
        field_table(
            [
                ("Päivä", "1.9.2026", "Kellonaika", ""),
                ("Testaaja", "", "Hyväksyjä", ""),
                ("Tuotantobuild", "REL-14-v0.77.9-af8a4b0f0b31", "Commit", "af8a4b0f0b31"),
                ("Uusi build", "", "Paketti SHA-256", ""),
                ("Koodivarmistus", "", "Tietokantavarmistus", ""),
                ("Rollback-polku", "", "Tiedotuksen aika", ""),
            ]
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(p("2. Ennakkoehdot", h1_style))
    story.append(
        checklist(
            [
                ("G-01", "WordPress-painikkeella on suora href osoitteeseen https://seniorsurf.fi/aloitus/.", "Tietokone + mobiili"),
                ("G-02", "KO-01-seloste on hyväksytty, tuotannossa ja näkyy kolmella kielellä.", "Hyväksyjä + build"),
                ("G-03", "Palautteen kirjoittava tuotantotesti on tehty ja testirivi käsitelty.", "PASS 31.8.2026"),
                ("G-04", "Avoimia P1-havaintoja on nolla.", "Havaintoloki"),
                ("G-05", "Nimetty riippumaton hyväksyjä on käytettävissä loppupäätökseen.", "Nimi raporttiin"),
            ]
        )
    )

    story.append(PageBreak())
    story.append(Spacer(1, 5 * mm))
    story.append(p("Julkiset polut, WordPress ja metatiedot", title_style))
    story.append(
        p(
            "Avaa sivut tavallisessa selaimessa ilman ylläpitäjän istuntoa. Kirjaa tulokseen myös "
            "testattu laite tai selaimen leveys. WP-05 ja WP-11 tehdään painikekorjauksen jälkeen.",
            lead_style,
        )
    )
    story.append(
        checklist(
            [
                ("R-01", "WP-05: /aloitussivu/ palauttaa 200 ja Avaa-painike avaa /aloitus/.", "URL + kellonaika"),
                ("R-02", "Esittelysivun painike toimii tietokoneella ja mobiilissa.", "Laite/selaimen leveys"),
                ("R-03", "WP-01-WP-04 ja WP-11: etusivu, sisältösivut, haku, wp-admin ja vertailumedia toimivat.", "HTTP + näkyvä sisältö"),
                ("R-04", "/aloitus/ palauttaa 200 eikä osoite vaihdu alidomainiin.", "HTTP + lopullinen URL"),
                ("R-05", "/aloitus ohjaa kerran 301:llä kanoniseen /aloitus/-osoitteeseen.", "Ohjausketju"),
                ("R-06", "/aloitus/api/v1/health palauttaa 200, ok/up/v1 ja Cache-Control: no-store.", "HTTP-otsikot + JSON"),
                ("R-07", "Puuttuva /aloitus/-alipolku näyttää Aloitussivun oman 404-sivun.", "HTTP 404 + otsikko"),
                ("R-08", "Canonical osoittaa täsmälleen https://seniorsurf.fi/aloitus/.", "HTML-head"),
                ("R-09", "Open Graph -otsikko, kuvaus, URL ja kuva ovat oikein.", "HTML-head + jaon esikatselu"),
                ("R-10", "sitemap.xml ja robots.txt sisältävät tuotannon oikeat julkiset polut.", "URL + sisältö"),
                ("R-11", "HTTPS ja keskeiset suojausotsikot vastaavat hyväksyttyä tuotantotasoa.", "CSP, HSTS, nosniff"),
            ]
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(note_lines("Sivun 2 lisähuomiot", 3))

    story.append(PageBreak())
    story.append(Spacer(1, 5 * mm))
    story.append(p("Tietosuoja, käytettävyys ja tuotannon toiminta", title_style))
    story.append(
        p(
            "KO-01:n kolmella kieliversiolla on sama tietosisältö. Testaa myös käytännön näkymät "
            "pienellä mobiilileveydellä ja suurella tekstikoolla.",
            lead_style,
        )
    )
    story.append(
        checklist(
            [
                ("R-12", "Suomenkielinen tietosuojasivu nimeää Open-Meteon, Nominatimin, rss2jsonin ja alloriginsin.", "Näkyvä teksti"),
                ("R-13", "Ruotsinkielisessä selosteessa ovat samat palvelut ja kotikunnan Nominatim-poikkeus.", "Näkyvä teksti"),
                ("R-14", "Englanninkielisessä selosteessa ovat samat palvelut ja kotikunnan Nominatim-poikkeus.", "Näkyvä teksti"),
                ("R-15", "Seloste kertoo koordinaattien ja IP-osoitteen välittymisestä sekä omasta tallennuksesta.", "Hyväksytty sanamuoto"),
                ("R-16", "320/375 px ja 200 % tekstikoko: ei vaakavieritystä tai leikkautuvia ohjaimia.", "Leveydet + kuvakaappaus"),
                ("R-17", "1280 px työpöytänäkymä: ydinosat, linkit ja alatunniste toimivat.", "Selain + kuvakaappaus"),
                ("R-18", "Näppäimistöjärjestys, näkyvä fokus, modaalien fokusrajaus ja Esc toimivat.", "Tab/Shift+Tab/Esc"),
                ("R-19", "Selainkonsolissa ei ole sovelluksen virheitä eikä estäviä varoituksia.", "Virheitä 0"),
                ("R-20", "Ylläpitäjän kirjautuminen ja yksityiset ylläpitonäkymät toimivat.", "Kirjautunut ylläpitäjä"),
                ("R-21", "Automaattinen linkkitarkistus on aktiivinen ja viimeisin ajo on hallitusti completed.", "Ajoaika + luvut"),
                ("R-22", "Palautteen valmismerkintä näkyy käsiteltynä eikä testisisältöä kopioida raporttiin.", "PASS 31.8.2026"),
            ]
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(note_lines("Sivun 3 lisähuomiot", 3))

    story.append(PageBreak())
    story.append(Spacer(1, 5 * mm))
    story.append(p("Havainnot ja GO/NO-GO-päätös", title_style))
    story.append(
        info_box(
            "Päätössääntö",
            [
                "GO vain, kun kaikki P1-rivit ovat PASS tai perustellusti N/A.",
                "Avoin P1 tarkoittaa NO-GO:ta. P2/P3-poikkeama tarvitsee omistajan ja määräajan.",
                "Versionosto 1.0.0 tehdään vasta hyväksytyn loppuportin jälkeen.",
            ],
            LIGHT_GREEN,
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(p("3. Avoimet havainnot", h1_style))
    story.append(findings_table())
    story.append(Spacer(1, 4 * mm))
    story.append(p("4. Päätöksen perustelu ja ehdot", h1_style))
    story.append(note_lines("Päätöksen perustelu", 2))
    story.append(Spacer(1, 2 * mm))
    story.append(note_lines("Hyväksytyt P2/P3-poikkeamat, omistajat ja määräajat", 1))
    story.append(Spacer(1, 4 * mm))
    story.append(signature_table())

    story.append(PageBreak())
    story.append(Spacer(1, 5 * mm))
    story.append(p("GO-päätöksen jälkeinen kirjaus", title_style))
    story.append(
        p(
            "Täytä tämä sivu vasta, kun riippumaton hyväksyjä on tehnyt GO-päätöksen. Tee vielä "
            "aktivoinnin jälkeinen smoke ennen laajan tiedotuksen lähettämistä.",
            lead_style,
        )
    )
    story.append(p("5. Julkaisutunnisteet", h1_style))
    story.append(
        field_table(
            [
                ("1.0.0 build", "", "Commit", ""),
                ("Paketti SHA-256", "", "Aktivointiaika", ""),
                ("Health", "", "Smoke", ""),
                ("Tiedotus GO", "", "Seuranta alkaa", ""),
            ]
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(p("6. Aktivoinnin jälkeinen smoke", h1_style))
    story.append(
        checklist(
            [
                ("P-01", "Tuotanto lataa päätöksessä yksilöidyn 1.0.0-buildin ja pääbundlen.", "Build + asset"),
                ("P-02", "Health palauttaa 200 sekä arvot ok/up/v1 ja no-store-otsakkeen.", "HTTP + JSON"),
                ("P-03", "WordPress-painike avaa /aloitus/-palvelun tietokoneella ja mobiilissa.", "Kaksi näkymää"),
                ("P-04", "Tietosuojasivut FI/SV/EN näyttävät hyväksytyn KO-01-tekstin.", "Kolme URLia"),
                ("P-05", "Selainkonsolissa ei ole estäviä virheitä ja ylläpito toimii.", "Virheitä 0"),
            ]
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(p("7. Tiedotus, seuranta ja palautus", h1_style))
    story.append(
        field_table(
            [
                ("Tiedotus lähti", "", "Vastuuhenkilö", ""),
                ("30 min seuranta", "", "60 min seuranta", ""),
            ]
        )
    )
    story.append(Spacer(1, 3 * mm))
    story.append(note_lines("Rollbackin käynnistyskriteeri, vastuuhenkilö ja käytetty palautuspolku", 2))

    return story


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=23 * mm,
        bottomMargin=18 * mm,
        title="Seniorin aloitussivu - julkaisun loppuportin raportointipohja",
        author="SeniorSurf",
        subject="Version 1.0.0 GO/NO-GO-raportointipohja",
    )
    document.build(build_story(), onFirstPage=page_header_footer, onLaterPages=page_header_footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
