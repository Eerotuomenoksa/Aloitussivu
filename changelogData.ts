export type ChangelogWorktreeChange = {
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked' | 'unmerged';
  path: string;
};

export type ChangelogDeployment = {
  id: number;
  environment: string;
  createdAt: string;
  state: string;
  description: string;
  sha: string;
  shortSha: string;
  subject: string;
  url: string;
};

export type ChangelogCommit = {
  hash: string;
  date: string;
  version: string;
  changeType: 'major' | 'minor' | 'patch' | 'none';
  subject: string;
  tags: string[];
};

export const CHANGELOG_GENERATED_AT = "29.8.2026 klo 12.10";
export const CHANGELOG_VERSION = "0.75.0";
export const CHANGELOG_WORKTREE_SUMMARY: string[] = [];
export const CHANGELOG_DEPLOYMENTS: ChangelogDeployment[] = [];
export const CHANGELOG_RECENT_COMMITS: ChangelogCommit[] = [
  {
    "hash": "072251325c0e5a6fc3f6cbae7a2f1437005a0c42",
    "date": "2026-08-29",
    "version": "0.112.0",
    "changeType": "minor",
    "subject": "feat: valmistele version 0.75.0 julkaisu",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "d74dd8dde008dbe287df44603333e9af4141ab12",
    "date": "2026-08-28",
    "version": "0.111.18",
    "changeType": "patch",
    "subject": "docs: kirjaa 0.74.7 tuotantosavu ja 1.0-portti",
    "tags": []
  },
  {
    "hash": "7bc8b9f0633474d3a6bbc003e05c47956ba60bc3",
    "date": "2026-08-28",
    "version": "0.111.17",
    "changeType": "patch",
    "subject": "Korjaa REL-11 pehmeän avauksen P2-havainnot",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "5369e4da327b15e3d551ac22ae0cd580b2f70b90",
    "date": "2026-08-28",
    "version": "0.111.16",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 pehmeän avauksen GO",
    "tags": []
  },
  {
    "hash": "19247485928b2de13f6b90eae028c8a367d4895e",
    "date": "2026-08-28",
    "version": "0.111.15",
    "changeType": "patch",
    "subject": "Kirjaa lopullinen Firestore-siirto MariaDBhen",
    "tags": []
  },
  {
    "hash": "15ebebd64d217793cbf774dd0149caa72fb9a4ee",
    "date": "2026-08-28",
    "version": "0.111.14",
    "changeType": "patch",
    "subject": "Kirjaa admin-roolit ja Firestore-kuivaharjoitus",
    "tags": []
  },
  {
    "hash": "257803f1e70100044052098388fc070390d05522",
    "date": "2026-08-28",
    "version": "0.111.13",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 yksityisen tuotantojuuren asennus",
    "tags": []
  },
  {
    "hash": "4b735dbfacece1dee90b0753b3c1b2aa2c189ef4",
    "date": "2026-08-28",
    "version": "0.111.12",
    "changeType": "patch",
    "subject": "Hyväksy REL-11 tuotantopaketin esivienti",
    "tags": []
  },
  {
    "hash": "b48872f41b8cf5a513ed75232fc5cfb343a3f10e",
    "date": "2026-08-28",
    "version": "0.111.11",
    "changeType": "patch",
    "subject": "Kirjaa tuotantotietokannan yhteys ja esivienti",
    "tags": []
  },
  {
    "hash": "5132e62764c470780097c041cce674181981f909",
    "date": "2026-08-28",
    "version": "0.111.10",
    "changeType": "patch",
    "subject": "Lukitse korjattu REL-11 tuotantopaketti",
    "tags": []
  },
  {
    "hash": "6974967944fba248778cf28bd45088ddf4f2bd32",
    "date": "2026-08-28",
    "version": "0.111.9",
    "changeType": "patch",
    "subject": "Korjaa tuotantotietokannan palvelin",
    "tags": []
  },
  {
    "hash": "d92a43337eba23a10e25b4d536276c51cab2b283",
    "date": "2026-08-28",
    "version": "0.111.8",
    "changeType": "patch",
    "subject": "Turvaa REL-11 tuotantokonfiguraation SSH-vaihe",
    "tags": []
  },
  {
    "hash": "1ad87e209cd950cb5db6fd9f2937b80610d123cd",
    "date": "2026-08-28",
    "version": "0.111.7",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 version 0.74.6 staginghyväksyntä",
    "tags": []
  },
  {
    "hash": "f9ba6ee2b0dc2e3e365058970aa1cfc8cc63cbc7",
    "date": "2026-08-28",
    "version": "0.111.6",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 version 0.74.6 stagingbuild",
    "tags": []
  },
  {
    "hash": "39f54db591ca86eaf237064bc8972261082e479c",
    "date": "2026-08-28",
    "version": "0.111.5",
    "changeType": "patch",
    "subject": "Korjaa REL-11 stagingin versiotarkistus",
    "tags": []
  },
  {
    "hash": "b08b34fa17cd05c872d30aba23e568e5b43eabff",
    "date": "2026-08-28",
    "version": "0.111.4",
    "changeType": "patch",
    "subject": "Korjaa REL-11 stagingin SSH-jatko-ohje",
    "tags": []
  },
  {
    "hash": "d6aa8374925aa68877d8c90230fb876134ecae7d",
    "date": "2026-08-28",
    "version": "0.111.3",
    "changeType": "patch",
    "subject": "Hyväksy REL-11 tietokantakäyttäjän poikkeus",
    "tags": []
  },
  {
    "hash": "f3dee5187a1c7f770fb37b8e4de574a104098bfe",
    "date": "2026-08-27",
    "version": "0.111.2",
    "changeType": "patch",
    "subject": "Valmistele REL-11 huomisaamun pehmeä avaus",
    "tags": []
  },
  {
    "hash": "5856fa3d0717084ab574b042eabc7be836fb3626",
    "date": "2026-08-27",
    "version": "0.111.1",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 version 0.74.6 ehdokas",
    "tags": []
  },
  {
    "hash": "d010d29548732aaead153e5a6b4b3eb64e395400",
    "date": "2026-08-27",
    "version": "0.111.0",
    "changeType": "minor",
    "subject": "Paranna dynaamisten sisältöjen lataustiloja",
    "tags": []
  },
  {
    "hash": "5d8d9bd0b1473d36886a3edb6c920afc11271c13",
    "date": "2026-08-27",
    "version": "0.110.10",
    "changeType": "patch",
    "subject": "Valmistele REL-11 tuotantovaihto",
    "tags": []
  },
  {
    "hash": "2fbe38b18b7e919b6af15b3df8a656e39159dd64",
    "date": "2026-08-27",
    "version": "0.110.9",
    "changeType": "patch",
    "subject": "Kirjaa tuotannon esivienti ja tietokantavalmistelu",
    "tags": []
  },
  {
    "hash": "ccaea4d434df6fab63dbddf02931050d9a05e3cd",
    "date": "2026-08-27",
    "version": "0.110.8",
    "changeType": "patch",
    "subject": "Kirjaa WordPress-pohjan välitesti",
    "tags": []
  },
  {
    "hash": "ee91f9f49b94788bee40b96298405c9c5201cd52",
    "date": "2026-08-27",
    "version": "0.110.7",
    "changeType": "patch",
    "subject": "Päivitä WordPress-esittelyosoite ja testiaineisto",
    "tags": []
  },
  {
    "hash": "cee1f0804665c8d62cd88d047551379f3fcfef9d",
    "date": "2026-08-27",
    "version": "0.110.6",
    "changeType": "patch",
    "subject": "Ratkaise REL-11 PREF-02-tuotepäätös",
    "tags": []
  },
  {
    "hash": "1ffefd26a2cf41cd444f7e50518ff07a5dce99b0",
    "date": "2026-08-27",
    "version": "0.110.5",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 alustava no-go-päätös",
    "tags": []
  },
  {
    "hash": "e2fcd290ffaf480d3cf90f1980ef0d3e3330004f",
    "date": "2026-08-27",
    "version": "0.110.4",
    "changeType": "patch",
    "subject": "Valmistele REL-11 varmistus ja muutosikkuna",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "10ded36b76cf0598a05773193a7bbe874aafbdcf",
    "date": "2026-08-27",
    "version": "0.110.3",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 tuotantopolun paikalliskoe",
    "tags": []
  },
  {
    "hash": "3f6d9c6ff4039d88ae7751b6772b89d7f7d3bdc8",
    "date": "2026-08-27",
    "version": "0.110.2",
    "changeType": "patch",
    "subject": "Päivitä REL-11 tuotantopolun paketointi",
    "tags": []
  },
  {
    "hash": "8438ef4454d5a5dadce242b42bdf584460999d5a",
    "date": "2026-08-27",
    "version": "0.110.1",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 WordPressin välisavukoe",
    "tags": []
  },
  {
    "hash": "b1fc32a36a86813d560f4cb67daeaf144c098546",
    "date": "2026-08-27",
    "version": "0.110.0",
    "changeType": "minor",
    "subject": "Täsmennä WordPress-esittelysivun julkaisuohje",
    "tags": []
  },
  {
    "hash": "81614bd2770150fef1e6da9e1673a9cb2ba3ab01",
    "date": "2026-08-27",
    "version": "0.109.11",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 version 0.74.5 stagingvarmennus",
    "tags": []
  },
  {
    "hash": "eee706937cb82d148616672530160f0a5927a3c2",
    "date": "2026-08-27",
    "version": "0.109.10",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 version 0.74.5 stagingehdokas",
    "tags": []
  },
  {
    "hash": "d5c4ea9ac2b8080afadd569f4b2b3bb8c0b0aa50",
    "date": "2026-08-26",
    "version": "0.109.9",
    "changeType": "patch",
    "subject": "Piilota katkenneet NCSC-varoitukset turvallisesti",
    "tags": []
  },
  {
    "hash": "e57a67b9a964b4a6058f781903ed073bcdd59d8f",
    "date": "2026-08-26",
    "version": "0.109.8",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 version 0.74.4 stagingehdokas",
    "tags": []
  },
  {
    "hash": "7491266c4b25d01e76c2ef0cbb5395057afaa4f9",
    "date": "2026-08-26",
    "version": "0.109.7",
    "changeType": "patch",
    "subject": "Korjaa REL-11 vanhojen NCSC-rivien päivitys",
    "tags": []
  },
  {
    "hash": "f6dcae73cb5ea2e4eaa64d60a7678de5393558f8",
    "date": "2026-08-26",
    "version": "0.109.6",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 version 0.74.3 stagingpaketti",
    "tags": []
  },
  {
    "hash": "394ba2687cb89bde859d15bfd7e7020a2458a448",
    "date": "2026-08-26",
    "version": "0.109.5",
    "changeType": "patch",
    "subject": "Korjaa REL-11 neljä stagingin P1-havaintoa",
    "tags": []
  },
  {
    "hash": "5781e4f8ab9e766c5988b87d9c243bd9a3e3042e",
    "date": "2026-08-26",
    "version": "0.109.4",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 WordPressin lähtötason savukoe",
    "tags": []
  },
  {
    "hash": "cf9218f1eb8cb65ec7ab793c368a8e4f4eea4d1a",
    "date": "2026-08-26",
    "version": "0.109.3",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 stagingin seuraavat P1-testit",
    "tags": []
  },
  {
    "hash": "546694259ccc7d37571eea269c864ac59bd8ee93",
    "date": "2026-08-26",
    "version": "0.109.2",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 version 0.74.2 stagingvarmennus",
    "tags": []
  },
  {
    "hash": "e046759056d094c6c8aeb71031f442d20ae5855a",
    "date": "2026-08-26",
    "version": "0.109.1",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 testaajakiitoksen stagingpaketti",
    "tags": []
  },
  {
    "hash": "ee6f9ebf1f3dfd369dff0af6184ffc9b940a67fa",
    "date": "2026-08-26",
    "version": "0.109.0",
    "changeType": "minor",
    "subject": "Lisää Tietoa-ikkunaan kiitokset testaajille",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "bfc12a9f916136a3634a2335154b1e229f10fed1",
    "date": "2026-08-26",
    "version": "0.108.19",
    "changeType": "patch",
    "subject": "Erota REL-11 korjauspaketti palvelimella",
    "tags": []
  },
  {
    "hash": "d4353d8aa9167a29f5d04dbfa5f241f20d159eca",
    "date": "2026-08-26",
    "version": "0.108.18",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 fokuskorjauksen stagingpaketti",
    "tags": []
  },
  {
    "hash": "fe313d8ee3e5b392654b924890c0a10b4862600d",
    "date": "2026-08-26",
    "version": "0.108.17",
    "changeType": "patch",
    "subject": "Korjaa Google-haun mikrofonin näkyvä fokus",
    "tags": []
  },
  {
    "hash": "59b08311e16d10d986786ec5018b11400a6a90f9",
    "date": "2026-08-26",
    "version": "0.108.16",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 stagingin UI- ja A11Y-uusintatesti",
    "tags": []
  },
  {
    "hash": "6a1b83374d9f7515a10fa672f409b563d1d86c8b",
    "date": "2026-08-26",
    "version": "0.108.15",
    "changeType": "patch",
    "subject": "Vahvista REL-11 stagingvienti ja smoke",
    "tags": []
  },
  {
    "hash": "32b797936437a3919c9f22728f41f6db8693f85b",
    "date": "2026-08-26",
    "version": "0.108.14",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 stagingehdokas ja vientiohje",
    "tags": []
  },
  {
    "hash": "375efac68d1d57229b8dce8a222376aa5e90e0e4",
    "date": "2026-08-26",
    "version": "0.108.13",
    "changeType": "patch",
    "subject": "Estä paketointi muuttuvasta Git-tilasta",
    "tags": []
  },
  {
    "hash": "4e5c799248c4134b6070585a35b5e1e4145bbdac",
    "date": "2026-08-26",
    "version": "0.108.12",
    "changeType": "patch",
    "subject": "Lisaa REL-11 stagingpaketin rakennus",
    "tags": []
  },
  {
    "hash": "065de105ed52960a3ed7c22c8db879aa48a759fa",
    "date": "2026-08-26",
    "version": "0.108.11",
    "changeType": "patch",
    "subject": "REL-11: OPS-04 osittain PASS + korjaus REL11-OPS-01-havaintoon",
    "tags": []
  },
  {
    "hash": "f934777f7ef7f4aff51566b1494bf6cfc87f1a99",
    "date": "2026-08-26",
    "version": "0.108.10",
    "changeType": "patch",
    "subject": "REL-11: paivita paikallislehdet HTTPS-osoitteisiin",
    "tags": []
  },
  {
    "hash": "bbf55af2a7ecf6bc57eb86a0d535a300bea686ce",
    "date": "2026-08-26",
    "version": "0.108.9",
    "changeType": "patch",
    "subject": "REL-11: OPS-03 Firestore-deltan kuivaharjoitus - osittain PASS",
    "tags": []
  },
  {
    "hash": "5650c0e0ddc129fde4b92383b44cf7045b9d7feb",
    "date": "2026-08-26",
    "version": "0.108.8",
    "changeType": "patch",
    "subject": "REL-11: OPS-01/OPS-02 vahvistettu PASS (elava SSH-yhteys Cloudcityyn)",
    "tags": []
  },
  {
    "hash": "22612d91b29c2389ff6794022a1981c1f4b722f1",
    "date": "2026-08-26",
    "version": "0.108.7",
    "changeType": "patch",
    "subject": "Vahvista ERR-08 ja ERR-09 PASS elavalla stagingilla (Eeron curl-tarkistukset)",
    "tags": []
  },
  {
    "hash": "d8d76b933c56f85fadcebb4f626808db7ad00bd0",
    "date": "2026-08-26",
    "version": "0.108.6",
    "changeType": "patch",
    "subject": "Vahvista ERR-05 PASS elavalla stagingilla, ERR-08/09 tyokalurajoite pysyva",
    "tags": []
  },
  {
    "hash": "8b5f0f1e3770dca82869519712c518867338a32c",
    "date": "2026-08-26",
    "version": "0.108.5",
    "changeType": "patch",
    "subject": "Kirjaa ERR-05/07/08/09 ja OPS-osion tila: tekninen esto stagingpaasyyn",
    "tags": []
  },
  {
    "hash": "9297d1b31f267250d854b01b6801481dad1b6ce8",
    "date": "2026-08-26",
    "version": "0.108.4",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 DATA/ADMIN/ERR-testien tulokset API-sopimustasolla (26.8.2026)",
    "tags": []
  },
  {
    "hash": "e56af527257ac8d60d44044f8072c7c8101a098d",
    "date": "2026-08-26",
    "version": "0.108.3",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 CORE-01..12-testien tulokset (26.8.2026)",
    "tags": []
  },
  {
    "hash": "4eec02d07ee9444261311e40be2ce723824beeaa",
    "date": "2026-08-26",
    "version": "0.108.2",
    "changeType": "patch",
    "subject": "Vahvista A11Y-03 kuvakaappauksella, kirjaa testiajurin getComputedStyle-virhe",
    "tags": []
  },
  {
    "hash": "0e4b2c1e71a1cbfc35c0add33d2f495bfc50df9e",
    "date": "2026-08-26",
    "version": "0.108.1",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 teema-, asetus- ja saavutettavuustestien tulokset (26.8.2026)",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "bd492c4cb0cb76f388188838114b6ddb87db480f",
    "date": "2026-08-26",
    "version": "0.108.0",
    "changeType": "minor",
    "subject": "Lisaa fokusrengas ylatunnisteen Palaute/Ohje/Tietoa/Asetukset-painikkeisiin (REL11-A11Y-02)",
    "tags": []
  },
  {
    "hash": "22be3e303f23ba6b79efd7d181a0339927ad6f45",
    "date": "2026-08-26",
    "version": "0.107.6",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 korjauksen commit-tunniste paivakirjaan",
    "tags": []
  },
  {
    "hash": "886f54f97ff5d8b4c16feba5fc81bab297c273c7",
    "date": "2026-08-26",
    "version": "0.107.5",
    "changeType": "patch",
    "subject": "Korjaa Asetukset-ikkunan leikkautuminen ja nappaimistosaavutettavuus (REL11-UI-01, REL11-A11Y-01)",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "4f79109df984491d04361d4f43a174715f2570e7",
    "date": "2026-08-26",
    "version": "0.107.4",
    "changeType": "patch",
    "subject": "Kirjaa REL-11 näkymämatriisin tulokset",
    "tags": []
  },
  {
    "hash": "55b95b280811f081677b0c5ffced9883e1d01d6a",
    "date": "2026-08-26",
    "version": "0.107.3",
    "changeType": "patch",
    "subject": "Valmistele REL-11 julkaisuportin testimatriisi",
    "tags": []
  },
  {
    "hash": "dee81522c0af72d68eb37cf10e316d3991135f6a",
    "date": "2026-08-26",
    "version": "0.107.2",
    "changeType": "patch",
    "subject": "Jäädytä REL-10 julkaisukandidaatti",
    "tags": []
  },
  {
    "hash": "b28578557e5a42a273432feb4fde23cf47e36195",
    "date": "2026-08-26",
    "version": "0.107.1",
    "changeType": "patch",
    "subject": "Korjaa REL-10 paketin tarkistussumma",
    "tags": []
  },
  {
    "hash": "a852438ba309a7e06d69ac10056ae077f4b74f63",
    "date": "2026-08-26",
    "version": "0.107.0",
    "changeType": "minor",
    "subject": "Lisää REL-10 staging-julkaisukandidaatin paketointi",
    "tags": []
  },
  {
    "hash": "7a72e9a14e81a037d7bfe13bdcba536a546a85e1",
    "date": "2026-08-26",
    "version": "0.106.1",
    "changeType": "patch",
    "subject": "Hyväksy REL-10 WordPress-esittelyteksti",
    "tags": []
  },
  {
    "hash": "34c4fe7ae86455a8493ebe472c250aa78a833760",
    "date": "2026-08-25",
    "version": "0.106.0",
    "changeType": "minor",
    "subject": "Valmistele Cloudcity-julkaisu ja REL-10 tuotantopolku",
    "tags": []
  },
  {
    "hash": "2c0c9e717256934685f9d4f30c0481e081b0599e",
    "date": "2026-08-20",
    "version": "0.105.1",
    "changeType": "patch",
    "subject": "Korjaa testipalautteen lähetysvahvistus",
    "tags": []
  },
  {
    "hash": "8a6d09610f185be9081f8df05b476672381dfff7",
    "date": "2026-08-17",
    "version": "0.105.0",
    "changeType": "minor",
    "subject": "Testauspalaute takaisin näkyviin ja aktiiviseksi",
    "tags": []
  },
  {
    "hash": "06b6307ed525b3c39e485664a29304209bf8b2d6",
    "date": "2026-08-14",
    "version": "0.104.0",
    "changeType": "minor",
    "subject": "tarkistettu paikalliset uutislähteet, 225 kuntaa löydetty niiden äärelle",
    "tags": []
  },
  {
    "hash": "590d2e0cfee701b7ebc184d29971803e2dca5394",
    "date": "2026-08-14",
    "version": "0.103.0",
    "changeType": "minor",
    "subject": "väriteemojen asetukset kuvakkeet ja nimeäminen",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "0b8448bf0d68fe98572bcd537f4fbe503f5f4b74",
    "date": "2026-08-14",
    "version": "0.102.0",
    "changeType": "minor",
    "subject": "Viimeistele alatunniste ja Tietoa-ikkuna",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "0286fe37b9d148ef8137669544cb16c677db6cd8",
    "date": "2026-08-14",
    "version": "0.101.0",
    "changeType": "minor",
    "subject": "Viimeistele julkaisunäkymä ja testausaineistot",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "1e4c032c2f40ef835ddf6344c424e541a960c52f",
    "date": "2026-08-13",
    "version": "0.100.0",
    "changeType": "minor",
    "subject": "123 kpl kuntien seniori sivua lähelläsi osioon",
    "tags": []
  },
  {
    "hash": "b1811ea17bbbf66c6efc26223a4272c981f8d106",
    "date": "2026-08-13",
    "version": "0.99.0",
    "changeType": "minor",
    "subject": "poista Google-haun turha otsikko",
    "tags": []
  },
  {
    "hash": "d89b73f27b4614eab8db5ed797649c365b55f27c",
    "date": "2026-08-13",
    "version": "0.98.2",
    "changeType": "patch",
    "subject": "viimeistele elokuun päivitykset ja muutosloki",
    "tags": []
  },
  {
    "hash": "147bbd2be015b6421b0b24054436479af2ecfc03",
    "date": "2026-08-12",
    "version": "0.98.1",
    "changeType": "patch",
    "subject": "päivitä muutosloki palautekorjauksilla",
    "tags": []
  },
  {
    "hash": "17981e4f343d0e8552c0c503c510b077b3e52948",
    "date": "2026-08-12",
    "version": "0.98.0",
    "changeType": "minor",
    "subject": "selkeytä typografiaa ja hakutoimintoja palautteen perusteella",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "f0bfdc15d7eb6eba0680c6bf035f5748ca57f5b4",
    "date": "2026-08-12",
    "version": "0.97.1",
    "changeType": "patch",
    "subject": "päivitä muutosloki elokuun teemamuutoksilla",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "c1b91fe108606c1cec03a1dc41f2e49e5f74303a",
    "date": "2026-08-11",
    "version": "0.97.0",
    "changeType": "minor",
    "subject": "Teemojen valinta",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "b27eca71b708522225391d187a31d51c39bb080d",
    "date": "2026-08-10",
    "version": "0.96.1",
    "changeType": "patch",
    "subject": "väriteemojen tarkistus",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "de68231125364f836de45f42f511b8f20d52b1c0",
    "date": "2026-07-23",
    "version": "0.96.0",
    "changeType": "minor",
    "subject": "lisää suorituskyky- ja aluepäivitysten yhteenvedot",
    "tags": []
  },
  {
    "hash": "94213bba529aaaa8864aa40469c2ec21016b678d",
    "date": "2026-07-23",
    "version": "0.95.0",
    "changeType": "minor",
    "subject": "täydennä Länsi-Uudenmaan palveluliikennelinkkejä",
    "tags": []
  },
  {
    "hash": "4e59e67717072815bc0d6749e8c14e00bc1a3e47",
    "date": "2026-07-23",
    "version": "0.94.3",
    "changeType": "patch",
    "subject": "korjaa etusivun suorituskykyä ja virheenkestoa",
    "tags": []
  },
  {
    "hash": "28bb7965faccf86f7f88d53147279dde6ac363d8",
    "date": "2026-07-13",
    "version": "0.94.2",
    "changeType": "patch",
    "subject": "lähelläsi poistetaan turhat linkkien lukumäärä numerot",
    "tags": []
  },
  {
    "hash": "c5ccdc280ce1329a610ffeb7c00ccf80e149a416",
    "date": "2026-07-13",
    "version": "0.94.1",
    "changeType": "patch",
    "subject": "lähelläsi yksinkertaistamista, sekä pitkien linkkisanojen tarkistus",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "7c3d63ecfbe208abc70e23f3461d75e3a1a985b9",
    "date": "2026-07-13",
    "version": "0.94.0",
    "changeType": "minor",
    "subject": "uutislähteiden jatkotarkistukset",
    "tags": []
  },
  {
    "hash": "fab703f649097e283391d8be4d39875c60549391",
    "date": "2026-07-12",
    "version": "0.93.1",
    "changeType": "patch",
    "subject": "Päivitä alueellisten linkkien työpakettisuunnitelma",
    "tags": []
  },
  {
    "hash": "458579e58a96fe16dab34872ccf57e28426f397b",
    "date": "2026-07-12",
    "version": "0.93.0",
    "changeType": "minor",
    "subject": "Lisää uutisfeedien kattavuusraportti",
    "tags": []
  },
  {
    "hash": "b8a2cfa5666fcfe7b344d997a95828101d3c524e",
    "date": "2026-07-12",
    "version": "0.92.2",
    "changeType": "patch",
    "subject": "Lisää kuntien väkilukutausta linkkityöhön",
    "tags": []
  },
  {
    "hash": "653854f1a6c7e9a63cef910c9c1b2455ce5b156b",
    "date": "2026-07-12",
    "version": "0.92.1",
    "changeType": "patch",
    "subject": "Palveluliikenteen jatkoerä ja Satakunnan joukkoliikenne",
    "tags": []
  },
  {
    "hash": "a16c1ec0d0311041df2c395b980e32d3ce18eed5",
    "date": "2026-07-11",
    "version": "0.92.0",
    "changeType": "minor",
    "subject": "Alueelliset eläkejärjestöt läpi käyty",
    "tags": []
  },
  {
    "hash": "f134b5530ef219edac769567ab4790a88e4f243b",
    "date": "2026-07-10",
    "version": "0.91.1",
    "changeType": "patch",
    "subject": "linkkiluettelon tarkistus",
    "tags": []
  },
  {
    "hash": "c1afaf934faea42765b817a9bf40e7cb88b79fc5",
    "date": "2026-07-09",
    "version": "0.91.0",
    "changeType": "minor",
    "subject": "kuntien nettisivujen lisäys",
    "tags": []
  },
  {
    "hash": "ec7b1c7a40a5aab6cf9fc7eae9d4d0ad544d9a3a",
    "date": "2026-07-09",
    "version": "0.90.3",
    "changeType": "patch",
    "subject": "puuttuvia julkisen liikenteen linkkejä",
    "tags": []
  },
  {
    "hash": "33e6ecfb7dae1f84290c565ee7d9e072fc88fcf5",
    "date": "2026-07-09",
    "version": "0.90.2",
    "changeType": "patch",
    "subject": "Pohjaanmaan julkinen ja palveluliikenne",
    "tags": []
  },
  {
    "hash": "8ebd96834a99d1d16f3c6a8c29c2457d19100ff5",
    "date": "2026-07-09",
    "version": "0.90.1",
    "changeType": "patch",
    "subject": "heinakuun yllapito ja alueelliset linkit",
    "tags": []
  },
  {
    "hash": "be635fc38506ea96d3c88abc7b71470dabbbec02",
    "date": "2026-07-07",
    "version": "0.90.0",
    "changeType": "minor",
    "subject": "SEO & GEO & AEO optimointi",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "05df8a2b6175b3578545f81315d8844e6b039676",
    "date": "2026-07-07",
    "version": "0.89.0",
    "changeType": "minor",
    "subject": "optimointi osa 2",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "e65d3a983e57ec0b690add1fc958562675f485af",
    "date": "2026-07-06",
    "version": "0.88.0",
    "changeType": "minor",
    "subject": "sivun optimointi",
    "tags": []
  },
  {
    "hash": "bc3523f72d9becd035ee5222acc9ff847ef62568",
    "date": "2026-07-06",
    "version": "0.87.1",
    "changeType": "patch",
    "subject": "Täysi tarkistus",
    "tags": []
  },
  {
    "hash": "c4565d5dc4516ece9269c50b1169e0f5b6217183",
    "date": "2026-06-24",
    "version": "0.87.0",
    "changeType": "minor",
    "subject": "testauslomake sivustolle",
    "tags": []
  },
  {
    "hash": "20b626d084040b974bba48642af09b4c8eba1845",
    "date": "2026-06-22",
    "version": "0.86.2",
    "changeType": "patch",
    "subject": "kirjaa testipalautteen kasittelymalli",
    "tags": []
  },
  {
    "hash": "0fdd9b67c699ecf64dc6583b2c204eb34954c426",
    "date": "2026-06-22",
    "version": "0.86.1",
    "changeType": "patch",
    "subject": "viimeistele testausjakson nakyvat korjaukset",
    "tags": []
  },
  {
    "hash": "2e57302ce85d5c61401bdde662ad1c453cf9de70",
    "date": "2026-06-22",
    "version": "0.86.0",
    "changeType": "minor",
    "subject": "selkeyta aluepalveluiden desktop-nakyma",
    "tags": []
  },
  {
    "hash": "9af4ef6729abc61f5ab90ed16d703ac304435101",
    "date": "2026-06-17",
    "version": "0.85.0",
    "changeType": "minor",
    "subject": "Testaaja palautteen korjauksia",
    "tags": []
  },
  {
    "hash": "1f376b2a1f7e20efd68a6a5c918ae76030aab2db",
    "date": "2026-06-14",
    "version": "0.84.3",
    "changeType": "patch",
    "subject": "kunnan vaihto + huijausvaroitus + linkki-ilmoituksen kevyt suojaus",
    "tags": []
  },
  {
    "hash": "be25a490e948c8fa0277246f2de950c2b7f6a630",
    "date": "2026-06-14",
    "version": "0.84.2",
    "changeType": "patch",
    "subject": "puuttuvia julkisen liikenteen kuntia",
    "tags": []
  },
  {
    "hash": "87216675e15161e053261d5cf03a82c6e5421ee4",
    "date": "2026-06-14",
    "version": "0.84.1",
    "changeType": "patch",
    "subject": "alueelliset linkit alakategorioiksi ja matkahuolto fallback",
    "tags": []
  },
  {
    "hash": "42e684a8afa39280bbef8a3d96cb5942cd2bc993",
    "date": "2026-06-12",
    "version": "0.84.0",
    "changeType": "minor",
    "subject": "uudet footer logot",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "76347b01bca5d087f3971e7a6898f017c7ee3f3c",
    "date": "2026-06-12",
    "version": "0.83.2",
    "changeType": "patch",
    "subject": "muutosloki kuntoon",
    "tags": []
  },
  {
    "hash": "c42e6e95ca1ea094804438aeae0d1f4d07fc329f",
    "date": "2026-06-12",
    "version": "0.83.1",
    "changeType": "patch",
    "subject": "Saavuttettavuus tarkistus visu muutosten jälkeen",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "291a0d27887156d03f7deac6e64f0b10725be68e",
    "date": "2026-06-12",
    "version": "0.83.0",
    "changeType": "minor",
    "subject": "Visuaalinen muutos",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "7ed4c21e441273583ea90fa9aed912e2a375ce61",
    "date": "2026-06-12",
    "version": "0.82.0",
    "changeType": "minor",
    "subject": "reittioppaat, tooltip, tietoa headeriin, visuaalinen muutos ja palautelomakkeen tarkennukset",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "cf8b5418e7d18d0bcd98f0f54838c4b75e653b86",
    "date": "2026-06-12",
    "version": "0.81.1",
    "changeType": "patch",
    "subject": "lisätty alueellisia linkkejä ja palveluliikenteen linkit",
    "tags": []
  },
  {
    "hash": "eb622a352001dceeee06ab14fa500c11ce274458",
    "date": "2026-06-12",
    "version": "0.81.0",
    "changeType": "minor",
    "subject": "lisää käyttötilastojen selainkohtainen esto",
    "tags": []
  },
  {
    "hash": "d6c41420ecdd34b45e5dd414edc2f114bf04df6c",
    "date": "2026-06-12",
    "version": "0.80.5",
    "changeType": "patch",
    "subject": "palautejonon korjaus",
    "tags": []
  },
  {
    "hash": "285c4b6a44ed3745f6b5979ed80020b940bc91ab",
    "date": "2026-06-12",
    "version": "0.80.4",
    "changeType": "patch",
    "subject": "korjaa palautteen tallennus GitHub Pagesissa",
    "tags": []
  },
  {
    "hash": "5d1095c51928b96082d77850a88793bd1f283162",
    "date": "2026-06-12",
    "version": "0.80.3",
    "changeType": "patch",
    "subject": "uusi linkkien turvallisuustarkistus",
    "tags": []
  },
  {
    "hash": "8212a81dfcf862bb0f0e0d042bec0846f13eeea9",
    "date": "2026-06-11",
    "version": "0.80.2",
    "changeType": "patch",
    "subject": "päivitä muutosloki ja laajenna linkkitarkistusta",
    "tags": []
  },
  {
    "hash": "a27821476e5c9c7f91e42fdd6782efae19aa25ca",
    "date": "2026-06-11",
    "version": "0.80.1",
    "changeType": "patch",
    "subject": "linkkien täysi tarkistus ja kela taksit pois nostolinkeistä",
    "tags": []
  },
  {
    "hash": "d8d745de7862723e110570573c0cfa09c47b9f68",
    "date": "2026-06-10",
    "version": "0.80.0",
    "changeType": "minor",
    "subject": "kehitysjono lisätty",
    "tags": []
  },
  {
    "hash": "ee6e2e5853a2b668d0c17eeb4dddfc71a91223c2",
    "date": "2026-06-10",
    "version": "0.79.0",
    "changeType": "minor",
    "subject": "nimipäivä takaisin näkyviin",
    "tags": []
  },
  {
    "hash": "a72ec905ec647768bafdf97e8e95c798cf01d798",
    "date": "2026-06-09",
    "version": "0.78.0",
    "changeType": "minor",
    "subject": "sivuston muutokset",
    "tags": []
  },
  {
    "hash": "dfd7d8060e3480beb9a8c025ea2510293fe64ea4",
    "date": "2026-06-09",
    "version": "0.77.1",
    "changeType": "patch",
    "subject": "tarkistuksia",
    "tags": []
  },
  {
    "hash": "3df08bf75ab05e8bac6c1a791d70c9d2e8d91e0e",
    "date": "2026-06-08",
    "version": "0.77.0",
    "changeType": "minor",
    "subject": "Kela-taksien puhelinnumerot",
    "tags": []
  },
  {
    "hash": "1ce08b19a2763252d0f3dc110d6854457606fead",
    "date": "2026-06-08",
    "version": "0.76.0",
    "changeType": "minor",
    "subject": "yläsivun tiivistys",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "4f62db19534ca55967c1a500bceb8c11575c2dfc",
    "date": "2026-06-08",
    "version": "0.75.0",
    "changeType": "minor",
    "subject": "työnimen muutos",
    "tags": []
  },
  {
    "hash": "f47fe0f50da88b338e69b9a93e7c1a716dfb6c40",
    "date": "2026-06-03",
    "version": "0.74.2",
    "changeType": "patch",
    "subject": "Lisää muutoslokin visuaalisuustagi",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "3c9946a4168d7c05eb5ddedc282feb085f1ad6be",
    "date": "2026-06-03",
    "version": "0.74.1",
    "changeType": "patch",
    "subject": "Yhtenäistä Aurora-visuaalisuus ja päivitä muutosloki",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "b4be06f2aa5936820d454ce24b6e2a3b8f1f8168",
    "date": "2026-06-02",
    "version": "0.74.0",
    "changeType": "minor",
    "subject": "uusi sääkortti ja saavutettavuus tarkistukset",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "af4298174475ff9c55934093ba4476ca49c4451b",
    "date": "2026-06-02",
    "version": "0.73.0",
    "changeType": "minor",
    "subject": "Muutokset sivu päivitys ja tummien teemojen uudet värit",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "44bec77a5def0672defc7cb014224036036c89cc",
    "date": "2026-06-02",
    "version": "0.72.0",
    "changeType": "minor",
    "subject": "Uusi visuaalinen ilme Aurora ja mahdollisuus valita asetuksista värimaailma",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "65826beca2ed722ef53c68282de73db26f551004",
    "date": "2026-06-01",
    "version": "0.71.0",
    "changeType": "minor",
    "subject": "Sivun työnimi on vaihdettu",
    "tags": []
  },
  {
    "hash": "f224f36ffd055d08cd13b2046168ffd713f0cbc5",
    "date": "2026-05-31",
    "version": "0.70.0",
    "changeType": "minor",
    "subject": "Versio numeroinnin korjaus",
    "tags": []
  },
  {
    "hash": "ab84a59578e9ec6fe2fe1a34c728664bdf0396ce",
    "date": "2026-05-31",
    "version": "0.69.1",
    "changeType": "patch",
    "subject": "päivitä muutosloki",
    "tags": []
  },
  {
    "hash": "bcd8f3bfbebddafee65473f453ff23a125fae2ae",
    "date": "2026-05-31",
    "version": "0.69.0",
    "changeType": "minor",
    "subject": "lisätty luonnokset tietosuoja-selosteeseen ja saavutettavuusselosteeseen",
    "tags": []
  },
  {
    "hash": "bce6efa1be66086a44341549ed408513ba9a1058",
    "date": "2026-05-31",
    "version": "0.68.0",
    "changeType": "minor",
    "subject": "Saavutettavuus muutoksia",
    "tags": []
  },
  {
    "hash": "d8602a5be238d0096881b825fce6f310316a0189",
    "date": "2026-05-29",
    "version": "0.67.0",
    "changeType": "minor",
    "subject": "toinen kello",
    "tags": []
  },
  {
    "hash": "315d1ccb512ffe8c36be273625dd2bb7bdf8b62d",
    "date": "2026-05-29",
    "version": "0.66.3",
    "changeType": "patch",
    "subject": "päivitä linkki- ja paikallisuutistiedot",
    "tags": []
  },
  {
    "hash": "d51fb607b0534852e3ca78bafccf9118ab642be2",
    "date": "2026-05-29",
    "version": "0.66.2",
    "changeType": "patch",
    "subject": "päivitä linkkien tarkistus",
    "tags": []
  },
  {
    "hash": "5fcacdc0df66efe3e566abae564a9036a7046ee7",
    "date": "2026-05-29",
    "version": "0.66.1",
    "changeType": "patch",
    "subject": "päivitä ylläpidon turvallisuuskorjaukset",
    "tags": []
  },
  {
    "hash": "28f84d36c3ae7e4cd6c969592fe6916cb9a6a906",
    "date": "2026-05-28",
    "version": "0.66.0",
    "changeType": "minor",
    "subject": "käyttölaskuri päivitys",
    "tags": []
  },
  {
    "hash": "cb424a403fc2d7cdedad791f45287fcab782b217",
    "date": "2026-05-28",
    "version": "0.65.0",
    "changeType": "minor",
    "subject": "limit nameday test usage",
    "tags": []
  },
  {
    "hash": "a7cdeb6c94e3d0a4350be984c5de83564e570b4f",
    "date": "2026-05-28",
    "version": "0.64.4",
    "changeType": "patch",
    "subject": "avoid live crawls in pages deploy",
    "tags": []
  },
  {
    "hash": "aa19828197c588757b15977a2abc6d5dffa7f581",
    "date": "2026-05-28",
    "version": "0.64.3",
    "changeType": "patch",
    "subject": "fix pages firebase validation",
    "tags": []
  },
  {
    "hash": "e88ce72a06448f3ecb729f0d585354d5b16b09ae",
    "date": "2026-05-28",
    "version": "0.64.2",
    "changeType": "patch",
    "subject": "chore: update security cleanup and homepage groups",
    "tags": []
  },
  {
    "hash": "9af577252e9c8a4b0415b4c818616bb123f1ce8b",
    "date": "2026-05-27",
    "version": "0.64.1",
    "changeType": "patch",
    "subject": "security(P0-SEC-001): Tarkenna ihmistehtavien ohjeet",
    "tags": []
  },
  {
    "hash": "7ffe8c6ba3496546ed390f9e30d6c6c4014fb8e9",
    "date": "2026-05-27",
    "version": "0.64.0",
    "changeType": "minor",
    "subject": "security(P3-SEC-014): Kayta vakaata Gemini mallia",
    "tags": []
  },
  {
    "hash": "82f54014b5de189f4f8980d0b1e38f8536a77857",
    "date": "2026-05-27",
    "version": "0.63.0",
    "changeType": "minor",
    "subject": "security(P3-SEC-013): Valta innerHTML RSS tekstipurussa",
    "tags": []
  },
  {
    "hash": "b9a46f740e8cff8c5b1ab278512bd38e732addfd",
    "date": "2026-05-27",
    "version": "0.62.0",
    "changeType": "minor",
    "subject": "security(P3-SEC-012): Kayta crypto UUID tunnisteissa",
    "tags": []
  },
  {
    "hash": "ad1d8918fed21282afed961ab45469504d9c5d23",
    "date": "2026-05-27",
    "version": "0.61.3",
    "changeType": "patch",
    "subject": "security(P2-SEC-011): Lisaa budjettihalytys",
    "tags": []
  },
  {
    "hash": "a484c07f982796a4ded2093e3422214154dac23f",
    "date": "2026-05-27",
    "version": "0.61.2",
    "changeType": "patch",
    "subject": "security(P2-SEC-010): Pakota admin tilien 2FA",
    "tags": []
  },
  {
    "hash": "520bf1e27348481190d7d4116aed4ba5383d604d",
    "date": "2026-05-27",
    "version": "0.61.1",
    "changeType": "patch",
    "subject": "security(P1-SEC-006): Tiukenna hosting CSP",
    "tags": []
  },
  {
    "hash": "6e86159a040dd30064099cc0633505c8806ff440",
    "date": "2026-05-27",
    "version": "0.61.0",
    "changeType": "minor",
    "subject": "security(P1-SEC-005): Vaadi App Check kayttotilastoille",
    "tags": []
  },
  {
    "hash": "e738a694fe3455664a659056b80ed308130a7d9d",
    "date": "2026-05-27",
    "version": "0.60.0",
    "changeType": "minor",
    "subject": "security(P1-SEC-004): Pakota App Check geminiChatissa",
    "tags": []
  },
  {
    "hash": "852c092c6a01e858ffb74dd05bc9ea3ad322c44b",
    "date": "2026-05-27",
    "version": "0.59.3",
    "changeType": "patch",
    "subject": "security(P0-SEC-003): Rajaa Firebase API avain",
    "tags": []
  },
  {
    "hash": "e89ea594b1c80dbb1f9fad87ff051ce76159446a",
    "date": "2026-05-27",
    "version": "0.59.2",
    "changeType": "patch",
    "subject": "security(P0-SEC-002): Siirra tyohakemisto pois OneDrivesta",
    "tags": []
  },
  {
    "hash": "dcfe1c45cd2186cfb3bdbf285f846a0bf4d5bb41",
    "date": "2026-05-27",
    "version": "0.59.1",
    "changeType": "patch",
    "subject": "security(P0-SEC-001): Pyorayta functions salaisuudet",
    "tags": []
  },
  {
    "hash": "7bb4ebcf68ac11aa1e5d354ca5c8c788908af9b0",
    "date": "2026-05-26",
    "version": "0.59.0",
    "changeType": "minor",
    "subject": "sää vaihtuu paikkakunnan mukaan ja muut kunta tarkistukset manuaaliseen kunnan vaihtoon",
    "tags": []
  },
  {
    "hash": "47c4a3e76780f378046e949a2da1d23b598c3066",
    "date": "2026-05-26",
    "version": "0.58.0",
    "changeType": "minor",
    "subject": "laajennettu käyttötilastot sivuille",
    "tags": []
  },
  {
    "hash": "493907344c4e87b46b5e807f1efc6f60b09f46a3",
    "date": "2026-05-26",
    "version": "0.57.0",
    "changeType": "minor",
    "subject": "lisätty tilastointi sivu",
    "tags": []
  },
  {
    "hash": "0f0766d0ba33814c35788de8b5d2c53f55ac9313",
    "date": "2026-05-26",
    "version": "0.56.0",
    "changeType": "minor",
    "subject": "tietoturva parannuksia",
    "tags": []
  },
  {
    "hash": "643bb47e6ab0a22045a645d512755dda952d2702",
    "date": "2026-05-26",
    "version": "0.55.0",
    "changeType": "minor",
    "subject": "lisätty sukujutut ja poistettu tuplia",
    "tags": []
  },
  {
    "hash": "f6853c7eafbb3303646289d1cf15e8fff925be00",
    "date": "2026-05-25",
    "version": "0.54.0",
    "changeType": "minor",
    "subject": "digiup tool lisätty",
    "tags": []
  },
  {
    "hash": "14f3cd6f6d2743765b8c22d2572fae449633971b",
    "date": "2026-05-25",
    "version": "0.53.0",
    "changeType": "minor",
    "subject": "Lisätty alueellisia kirjastoja ja tukemassa sivu",
    "tags": []
  },
  {
    "hash": "d44c3c6c7854307ab63f00471a4fc5fa2633230b",
    "date": "2026-05-25",
    "version": "0.52.0",
    "changeType": "minor",
    "subject": "Lisätty äänen tunnistus Google hakuun ja Avustajaan, muokattu näkyvän kunnan toimintoja",
    "tags": []
  },
  {
    "hash": "82e9c3103692ab593cdaf4a313cf049db8f6864a",
    "date": "2026-05-22",
    "version": "0.51.0",
    "changeType": "minor",
    "subject": "Nimipäivät lisätty testaukseen",
    "tags": []
  },
  {
    "hash": "e97f3855810aae4cbd13653927eb2f00096ea00d",
    "date": "2026-05-22",
    "version": "0.50.0",
    "changeType": "minor",
    "subject": "lisätty symbolit alueellisiin palveluihin",
    "tags": []
  },
  {
    "hash": "35863b5f04184202813182f1a406844b21bacd94",
    "date": "2026-05-22",
    "version": "0.49.0",
    "changeType": "minor",
    "subject": "Luontosivusto.fi lisätty",
    "tags": []
  },
  {
    "hash": "97c4d8b150b437ff2d86b933ee732c085d18c21a",
    "date": "2026-05-22",
    "version": "0.48.1",
    "changeType": "patch",
    "subject": "Visuaalinen tarkistus",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "6cd99ae858e21f01d3bc7c24e27ecaa459d17b85",
    "date": "2026-05-22",
    "version": "0.48.0",
    "changeType": "minor",
    "subject": "ylläpidon varoitusten ja ilmoitusten käsittelyn korjaukset",
    "tags": []
  },
  {
    "hash": "c97a8449cf0e62d91dc964c8161fd1449dd5765a",
    "date": "2026-05-22",
    "version": "0.47.1",
    "changeType": "patch",
    "subject": "huijausvaroitusten ylläpidon toiminta ja tuplalinkkien käsittely",
    "tags": []
  },
  {
    "hash": "5c93fddcef2f3562feeba22e4b04276b6defd1e6",
    "date": "2026-05-22",
    "version": "0.47.0",
    "changeType": "minor",
    "subject": "Testaus palautetteen korjauksia",
    "tags": []
  },
  {
    "hash": "eef722e41e039b4500ba59b0e42ee22cb64aeb46",
    "date": "2026-05-20",
    "version": "0.46.0",
    "changeType": "minor",
    "subject": "poistettu tupla omakanta",
    "tags": []
  },
  {
    "hash": "9377458d2b3c129f7dcc14f7d22e3464b2c85482",
    "date": "2026-05-20",
    "version": "0.45.0",
    "changeType": "minor",
    "subject": "lisää käytettävyyttä mobiiliin",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "32123c5a2e3aeb178d6d885fcd360892c74949ad",
    "date": "2026-05-20",
    "version": "0.44.0",
    "changeType": "minor",
    "subject": "lisätty vähemmistöihin liittyviä linkkejä",
    "tags": []
  },
  {
    "hash": "b019f1dc54735d1b14acbe6d4e785e97f174718b",
    "date": "2026-05-20",
    "version": "0.43.0",
    "changeType": "minor",
    "subject": "mobiililiittymän tarkennuksia ja ulkomaiden käsittely",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "f78da66d316b4dd8523c7cd282113446a0848d5a",
    "date": "2026-05-19",
    "version": "0.42.0",
    "changeType": "minor",
    "subject": "värimaailmaa uusiksi ja esittelykierros",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "3647f916469b8469d5a2a397e16f174a9539ae2f",
    "date": "2026-05-19",
    "version": "0.41.0",
    "changeType": "minor",
    "subject": "sivuston esittely",
    "tags": []
  },
  {
    "hash": "b6951f7de6ad82564f4b31022982156eff031a38",
    "date": "2026-05-19",
    "version": "0.40.0",
    "changeType": "minor",
    "subject": "Saavutettavuuden parannuksia ja nimen muutos",
    "tags": []
  },
  {
    "hash": "79db8e4a6461267e27616fddfcfe829fe6e76465",
    "date": "2026-05-19",
    "version": "0.39.5",
    "changeType": "patch",
    "subject": "laajennettaan paikallisten teatterien ja museoiden näkyvyyttä paikallisliikenteen alueen mukaisiin kuntiin",
    "tags": []
  },
  {
    "hash": "8a49ccef1e4aa6d562bd12d4149716df8902a025",
    "date": "2026-05-19",
    "version": "0.39.4",
    "changeType": "patch",
    "subject": "linkkilistaan museo ja teatteri sarake",
    "tags": []
  },
  {
    "hash": "5c2cc751895792d356c39aa715097df19ae5aed6",
    "date": "2026-05-18",
    "version": "0.39.3",
    "changeType": "patch",
    "subject": "Korjattu ilmoitetun linkin piilotus",
    "tags": []
  },
  {
    "hash": "b097239bbf0dc7d99169edcf067a3048f66179b7",
    "date": "2026-05-18",
    "version": "0.39.2",
    "changeType": "patch",
    "subject": "korjattu huijausvaroitusten hakua",
    "tags": []
  },
  {
    "hash": "f263effbe6db46c258e1f13fe87c895f58038685",
    "date": "2026-05-18",
    "version": "0.39.1",
    "changeType": "patch",
    "subject": "Alakategoriat lisätty, lisätty huijausvaroitukset ja korjattu tekoälyn näkyminen laatikoiden päällä",
    "tags": []
  },
  {
    "hash": "751584bc50782a26ac3193dc9f897d80aac2c8a4",
    "date": "2026-05-12",
    "version": "0.39.0",
    "changeType": "minor",
    "subject": "Selkeytetty puhelinnumeron ja linkin eroa kategoria näkymässä",
    "tags": []
  },
  {
    "hash": "2896f483d513fbb0de259fc2fe037c3844f1e117",
    "date": "2026-05-12",
    "version": "0.38.1",
    "changeType": "patch",
    "subject": "Lisää versiot muutoslokiin",
    "tags": []
  },
  {
    "hash": "c6ee191d0a187c51b9ff992970b372efb5fe455e",
    "date": "2026-05-12",
    "version": "0.38.0",
    "changeType": "minor",
    "subject": "Puhelinnumerot lisätty 35  ja versionumerointi",
    "tags": []
  },
  {
    "hash": "b03bd630df085f5b3724916aa02fd3afa46ed4dc",
    "date": "2026-05-12",
    "version": "0.37.2",
    "changeType": "patch",
    "subject": "lisätty 152 alueellista liikuntapaikka linkkiä",
    "tags": []
  },
  {
    "hash": "84a8861b6688f3f8ed3b97c3e7a0701668856cb9",
    "date": "2026-05-12",
    "version": "0.37.1",
    "changeType": "patch",
    "subject": "Päivitä muutosloki",
    "tags": []
  },
  {
    "hash": "899318babdf949f10bfea7189db6637a345ed293",
    "date": "2026-05-12",
    "version": "0.37.0",
    "changeType": "minor",
    "subject": "väri muutoksia",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "b995b0538ce132d9b6559b2ad7b5dd293af184c1",
    "date": "2026-05-11",
    "version": "0.36.0",
    "changeType": "minor",
    "subject": "sään paikkaa vaihdettu takaisin headeriin ja huijausvaroitusten määrä max 2kpl",
    "tags": []
  },
  {
    "hash": "2eeea59d71d758ab420b0454746aff1818468eb0",
    "date": "2026-05-11",
    "version": "0.35.0",
    "changeType": "minor",
    "subject": "Muutokset",
    "tags": []
  },
  {
    "hash": "0d557441cc41361cf4078dff093e84e38c4e54de",
    "date": "2026-05-11",
    "version": "0.34.3",
    "changeType": "patch",
    "subject": "Tupla linkkien poistoja ja alueellisten linkkien näkyvyys, lisätty myös paikallisia urheiluseuroja",
    "tags": []
  },
  {
    "hash": "bb547c7ebb9331b5a5f947b50d8aba0d756cb068",
    "date": "2026-05-08",
    "version": "0.34.2",
    "changeType": "patch",
    "subject": "Paikalliset linkit ja hakupäivitykset",
    "tags": []
  },
  {
    "hash": "e2fe1b4c2593e9f1db47710070c000b1a7c03909",
    "date": "2026-05-08",
    "version": "0.34.1",
    "changeType": "patch",
    "subject": "ilmoita linkki lähetä-nappulan korjaus ja alueellisten linkkien näkyvyys",
    "tags": []
  },
  {
    "hash": "4578fb7091e7ebb23cf5214e9c59474b8087942d",
    "date": "2026-05-08",
    "version": "0.34.0",
    "changeType": "minor",
    "subject": "Huijausvaroitusten tarkennukset",
    "tags": []
  },
  {
    "hash": "b75d9b8c630ea216c1e1e5e5cc8c7247cb8a74e2",
    "date": "2026-05-08",
    "version": "0.33.1",
    "changeType": "patch",
    "subject": "muutosloki tarkennus",
    "tags": []
  },
  {
    "hash": "360ea3d3dd76c6a4612efdaa9257db3c5827eeb6",
    "date": "2026-05-08",
    "version": "0.33.0",
    "changeType": "minor",
    "subject": "käyttöliittymän siivousta",
    "tags": []
  },
  {
    "hash": "e0b8a689187e142e03c2103e0511bbeb41c44abd",
    "date": "2026-05-08",
    "version": "0.32.2",
    "changeType": "patch",
    "subject": "koodi tarkistus",
    "tags": []
  },
  {
    "hash": "39d2d6c53df90afbadb0bf0ec704d0ab802cc001",
    "date": "2026-05-07",
    "version": "0.32.1",
    "changeType": "patch",
    "subject": "Lehtilinkit",
    "tags": []
  },
  {
    "hash": "59898548a2d2ce91bb20eb60fecac320cc68b9bb",
    "date": "2026-05-07",
    "version": "0.32.0",
    "changeType": "minor",
    "subject": "Huijausvaroitukset",
    "tags": []
  },
  {
    "hash": "73c16755f3cdc9e7ccfa80339ef9363484da81e7",
    "date": "2026-05-07",
    "version": "0.31.1",
    "changeType": "patch",
    "subject": "secrets",
    "tags": []
  },
  {
    "hash": "2222e5e511815ba3928dd5653e77296b6123d556",
    "date": "2026-05-07",
    "version": "0.31.0",
    "changeType": "minor",
    "subject": "Huijausvaroitukset toimii ja on etusivulla",
    "tags": []
  },
  {
    "hash": "8cd1a097e22536e18a62bfdc7e9e7aac0ff1a408",
    "date": "2026-05-07",
    "version": "0.30.1",
    "changeType": "patch",
    "subject": "Päivitä muutosloki",
    "tags": []
  },
  {
    "hash": "b452f10203d293c54622c4b8a192525240eb9d04",
    "date": "2026-05-07",
    "version": "0.30.0",
    "changeType": "minor",
    "subject": "Firebase määritykset ja uusi kategoria Kotihoito-palvelut",
    "tags": []
  },
  {
    "hash": "0fc8aae40dbe0cccbe0035448024f751b1bd107d",
    "date": "2026-05-07",
    "version": "0.29.0",
    "changeType": "minor",
    "subject": "tuplien poistoja",
    "tags": []
  },
  {
    "hash": "ae4d9c472a1bfc5aab1d011837adbc0fe0c70718",
    "date": "2026-05-07",
    "version": "0.28.0",
    "changeType": "minor",
    "subject": "Lisätty Kategoriat Museot, Potilasyhdistykset ja Eläkeyhdistykset sekä huijausvaroitukset",
    "tags": []
  },
  {
    "hash": "32e24dddf9eb3f7ea40cf2dcca6c98bdc34989c2",
    "date": "2026-05-05",
    "version": "0.27.3",
    "changeType": "patch",
    "subject": "Linkkien tarkituksia ja poistoja\"",
    "tags": []
  },
  {
    "hash": "aa461854769845c67f590aea737be76da0f291c5",
    "date": "2026-05-05",
    "version": "0.27.2",
    "changeType": "patch",
    "subject": "Haettiin kieliversioihin sopivat linkit",
    "tags": []
  },
  {
    "hash": "15a60ac9961cac77076f942593c51ed331ad61f9",
    "date": "2026-05-05",
    "version": "0.27.1",
    "changeType": "patch",
    "subject": "Lisää ylläpidon työkalut ja Firebase-linkkiehdotukset",
    "tags": []
  },
  {
    "hash": "154d3e775ec4af6db48dc64f426a844b092afbf0",
    "date": "2026-05-05",
    "version": "0.27.0",
    "changeType": "minor",
    "subject": "kieliversiot on lisätty käyttöliittymään Suomi, ruotsi, englanti, ukraina, eesti, venäjä ja saame",
    "tags": []
  },
  {
    "hash": "b64d8c43c4c485c0908bcd4810bd3ec403c00ab4",
    "date": "2026-05-04",
    "version": "0.26.0",
    "changeType": "minor",
    "subject": "\"kieliversiot on lisätty käyttöliittymään Suomi, ruotsi, englanti, ukraina, eesti, venäjä ja saame\"",
    "tags": []
  },
  {
    "hash": "851cc8b4e3f70bf524a28d25ffdfb68610ea1da0",
    "date": "2026-05-04",
    "version": "0.25.4",
    "changeType": "patch",
    "subject": "poistettu Google haku tyyliset linkit",
    "tags": []
  },
  {
    "hash": "08ce9a87434f1da24c112a1bed71c86899eab3a1",
    "date": "2026-05-04",
    "version": "0.25.3",
    "changeType": "patch",
    "subject": "hsl.fi alueellisiin linkkeihin",
    "tags": []
  },
  {
    "hash": "7e7fd27f6c551d1249600d11ae6961b61b6323ef",
    "date": "2026-05-04",
    "version": "0.25.2",
    "changeType": "patch",
    "subject": "Linkki luettelo lisätty",
    "tags": []
  },
  {
    "hash": "6c55f1f54b902f19b6cc7eed8a0cc3497d0d02e7",
    "date": "2026-05-04",
    "version": "0.25.1",
    "changeType": "patch",
    "subject": "Lisää palvelualueet ja korjaa muutosloki",
    "tags": []
  },
  {
    "hash": "2c19aa029d1b3abeaa9710cf29da361d5589d718",
    "date": "2026-05-04",
    "version": "0.25.0",
    "changeType": "minor",
    "subject": "elementit -10%, poistettu tuplana olevat kunnan sivut alueellisista linkeistä, lisätty pirkkalainen uutiset feed",
    "tags": []
  },
  {
    "hash": "aeed58215bd6da00dae353c3118bfbf47a6abb94",
    "date": "2026-04-30",
    "version": "0.24.1",
    "changeType": "patch",
    "subject": "Poistettu google haku linkkejä",
    "tags": []
  },
  {
    "hash": "4716962d88022672767a9e8b914cdc17afbd40f4",
    "date": "2026-04-30",
    "version": "0.24.0",
    "changeType": "minor",
    "subject": "Kello piilota ja näytä",
    "tags": []
  },
  {
    "hash": "186c74cc4924c08dae0e77586ab1c2d00edbfbb5",
    "date": "2026-04-30",
    "version": "0.23.0",
    "changeType": "minor",
    "subject": "66 uutisfeediä lisätty",
    "tags": []
  },
  {
    "hash": "a6fe7ee9dd10f3dfc6be238655a208ee8402e7cd",
    "date": "2026-04-30",
    "version": "0.22.0",
    "changeType": "minor",
    "subject": "Lisätty 120 paikallislehteä ja uusi kategoria",
    "tags": []
  },
  {
    "hash": "e376ccb5ed28d063c30aece4cdb1146ed61a1f47",
    "date": "2026-04-30",
    "version": "0.21.0",
    "changeType": "minor",
    "subject": "lisätty asetukset valikko, missä voi piilotttaa ja näyttää toimintoja",
    "tags": []
  },
  {
    "hash": "157ae8f63f5be05e382bdec0ef69860986f28f60",
    "date": "2026-04-30",
    "version": "0.20.2",
    "changeType": "patch",
    "subject": "Add theatre member links",
    "tags": []
  },
  {
    "hash": "cbe4f8d4ffd114250a3abbb8e4e58c751bb11467",
    "date": "2026-04-30",
    "version": "0.20.1",
    "changeType": "patch",
    "subject": "Add approved link workflow and new links",
    "tags": []
  },
  {
    "hash": "f26af5d59108e2d284f861ae857097fa985105a1",
    "date": "2026-04-30",
    "version": "0.20.0",
    "changeType": "minor",
    "subject": "siirretty ilmoita linkistä nappulaa",
    "tags": []
  },
  {
    "hash": "3f14e72e3aed4e1e6c4f64974f04ffb72f9c699b",
    "date": "2026-04-30",
    "version": "0.19.1",
    "changeType": "patch",
    "subject": "Update deploy.yml",
    "tags": []
  },
  {
    "hash": "ba43fd438b351414afb39ac28ff4fd77f7099bbb",
    "date": "2026-04-30",
    "version": "0.19.0",
    "changeType": "minor",
    "subject": "muotoiluja yläriville",
    "tags": []
  },
  {
    "hash": "93ed1b53ba9fb781e1be2d9ad42ef2ce3668fefd",
    "date": "2026-04-30",
    "version": "0.18.0",
    "changeType": "minor",
    "subject": "srk poistettu",
    "tags": []
  },
  {
    "hash": "1d054d9a21e1ce4e620580a24bec5e033992aacf",
    "date": "2026-04-30",
    "version": "0.17.0",
    "changeType": "minor",
    "subject": "lisätty seurakunnat",
    "tags": []
  },
  {
    "hash": "5b2123294b58758a2457d6b31d021818ca2eb6d0",
    "date": "2026-04-30",
    "version": "0.16.2",
    "changeType": "patch",
    "subject": "lisätty beta teksti ja linkki muutoslokiin",
    "tags": []
  },
  {
    "hash": "52a5969808d8536596d6f3c923c0ba96b9bb2fa9",
    "date": "2026-04-30",
    "version": "0.16.1",
    "changeType": "patch",
    "subject": "muutosloki lisätty",
    "tags": []
  },
  {
    "hash": "3459ef3d54a07518525195600ea9db4986841ad7",
    "date": "2026-04-30",
    "version": "0.16.0",
    "changeType": "minor",
    "subject": "Lisätty ehdotettuja linkkejä",
    "tags": []
  },
  {
    "hash": "74e507d03d87f16e8b49021494d2f45817cbaef9",
    "date": "2026-04-30",
    "version": "0.15.1",
    "changeType": "patch",
    "subject": "lisätty linkkien tarkistamine, uusien ilmoitus toiminto ja vanhentuneen linkin ilmoitus",
    "tags": []
  },
  {
    "hash": "c9e69fd758ba3f96532c3feac5a4f399b1fbc750",
    "date": "2026-04-30",
    "version": "0.15.0",
    "changeType": "minor",
    "subject": "lisätty oma kunta",
    "tags": []
  },
  {
    "hash": "be951b415e16da4134d81958978488cda1706f90",
    "date": "2026-04-30",
    "version": "0.14.0",
    "changeType": "minor",
    "subject": "lisätty liputuspäivät ja teemapäivät",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "f8fa06653076ce4e6a4b9022de79cc07a04abdbf",
    "date": "2026-04-30",
    "version": "0.13.0",
    "changeType": "minor",
    "subject": "Lähimmät opastuspaikat",
    "tags": []
  },
  {
    "hash": "f8230405efbcb3994fb9a08877d3cfbd042399b4",
    "date": "2026-04-30",
    "version": "0.12.0",
    "changeType": "minor",
    "subject": "muutettu kuntatiedon sijaintia",
    "tags": []
  },
  {
    "hash": "5489a2343b8d9b231a2d305515f376569ce6c452",
    "date": "2026-04-30",
    "version": "0.11.0",
    "changeType": "minor",
    "subject": "zoom myös pienennys",
    "tags": []
  },
  {
    "hash": "87f72925dd9e4a2d57230a4dc647c5ce386e3904",
    "date": "2026-04-30",
    "version": "0.10.0",
    "changeType": "minor",
    "subject": "lisätty uutiset",
    "tags": []
  },
  {
    "hash": "642e7754422c5c68a4a8820700a22a5ab6f010ac",
    "date": "2026-04-30",
    "version": "0.9.1",
    "changeType": "patch",
    "subject": "Paikalliset linkit",
    "tags": []
  },
  {
    "hash": "758cf5b3b450c7abb6416fdcaeb58f18d16cb2a0",
    "date": "2026-04-26",
    "version": "0.9.0",
    "changeType": "minor",
    "subject": "Lisätty ääniohjaus ja parannettu käyttöliittymää. Ääniohjauksella käyttäjät voivat nyt navigoida sovelluksessa ja suorittaa toimintoja äänikomennoilla, mikä parantaa saavutettavuutta ja käyttökokemusta. Käyttöliittymään on lisätty uusia elementtejä ja parannettu vanhoja, jotta sovellus olisi entistä intuitiivisempi ja visuaalisesti miellyttävämpi. Näiden muutosten myötä sovellus tarjoaa entistä paremman käyttökokemuksen kaikille käyttäjille.",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "2626f6fed8c52ec20d1c41c8c75cda36b78fe4b7",
    "date": "2026-04-26",
    "version": "0.8.0",
    "changeType": "minor",
    "subject": "koodi korjauksia",
    "tags": []
  },
  {
    "hash": "49b3b7fbd2ea631338eca097a6371dcace0017a5",
    "date": "2026-04-26",
    "version": "0.7.1",
    "changeType": "patch",
    "subject": "feat: Update app name and links",
    "tags": []
  },
  {
    "hash": "e738e3f55815c672604e75ac6491be310b0d3f1b",
    "date": "2026-02-23",
    "version": "0.7.0",
    "changeType": "minor",
    "subject": "feat: Refactor app entry point and metadata",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "ff97135e84cd7f7f32c626a67d1bf430fe329744",
    "date": "2026-02-09",
    "version": "0.6.0",
    "changeType": "minor",
    "subject": "feat(App): Add aria-label to theme toggle button",
    "tags": []
  },
  {
    "hash": "4fa08ca995ab216231a07de027f0d4a8ff4515ec",
    "date": "2026-02-09",
    "version": "0.5.1",
    "changeType": "patch",
    "subject": "fix(Clock): Remove static greeting and simplify layout",
    "tags": []
  },
  {
    "hash": "05dfff44a2f67b943517351c50c755ad33ed3c42",
    "date": "2026-02-09",
    "version": "0.5.0",
    "changeType": "minor",
    "subject": "feat: Implement dynamic font size scaling",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "c290e0577010617675a4d01c4ed213df5daba687",
    "date": "2026-02-09",
    "version": "0.4.0",
    "changeType": "minor",
    "subject": "feat: Improve UI and Gemini integration",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "9bc43bb0241b9fcb5d164c0418194e8ae85c2ffb",
    "date": "2026-02-09",
    "version": "0.3.0",
    "changeType": "minor",
    "subject": "feat: Introduce daily quotes and improve UI components",
    "tags": [
      "Visuaalisuus"
    ]
  },
  {
    "hash": "745890bafb84120cd5e0b9608170ee5a962851dd",
    "date": "2026-02-09",
    "version": "0.2.0",
    "changeType": "minor",
    "subject": "feat: Initialize Seniorin Aloitussivu project",
    "tags": []
  },
  {
    "hash": "480a9078b67b61ca32368fdbae4171778f1c3cbd",
    "date": "2026-02-09",
    "version": "0.1.1",
    "changeType": "patch",
    "subject": "Initial commit",
    "tags": []
  }
];
