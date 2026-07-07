export type ShortcutGroup = {
  name: string;
  icon: string;
  categories: string[];
  zone: string;
  anchor: string;
  descriptionKey:
    | 'groupDescAsiointi'
    | 'groupDescRaha'
    | 'groupDescTerveys'
    | 'groupDescDigi'
    | 'groupDescUutiset'
    | 'groupDescKulttuuri'
    | 'groupDescLukeminen'
    | 'groupDescLiikkuminen'
    | 'groupDescVapaa';
};

export const shortcutGroups: ShortcutGroup[] = [
  {
    name: 'Asiointi ja viranomaiset',
    icon: '🏛️',
    categories: ['Julkiset palvelut', 'Oikeus', 'Puhelinnumerot', 'Turvallisuus'],
    zone: 'zone-asiointi',
    anchor: 'asiointi',
    descriptionKey: 'groupDescAsiointi',
  },
  {
    name: 'Raha ja ostaminen',
    icon: '🏦',
    categories: ['Pankit', 'Talous', 'Verkkokaupat', 'Ruoka'],
    zone: 'zone-raha',
    anchor: 'raha',
    descriptionKey: 'groupDescRaha',
  },
  {
    name: 'Terveys ja hoiva',
    icon: '🏥',
    categories: ['Terveys', 'Potilasyhdistykset', 'Kotihoito-palvelut', 'Koti'],
    zone: 'zone-terveys',
    anchor: 'terveys',
    descriptionKey: 'groupDescTerveys',
  },
  {
    name: 'Digi ja yhteydenpito',
    icon: '💻',
    categories: ['Apua digiin', 'Hakukoneet', 'Sähköposti', 'Sosiaalinen media', 'Sovellukset', 'Tekniikka'],
    zone: 'zone-digi',
    anchor: 'digi',
    descriptionKey: 'groupDescDigi',
  },
  {
    name: 'Uutiset ja tieto',
    icon: '📰',
    categories: ['Uutiset & Media', 'Lehdet', 'Sää', 'Tiede'],
    zone: 'zone-uutiset',
    anchor: 'uutiset',
    descriptionKey: 'groupDescUutiset',
  },
  {
    name: 'Kulttuuri ja taide',
    icon: '🎭',
    categories: ['Kulttuuri', 'Museot', 'Teatterit', 'Musiikki', 'Taiteet'],
    zone: 'zone-kulttuuri',
    anchor: 'kulttuuri',
    descriptionKey: 'groupDescKulttuuri',
  },
  {
    name: 'Lukeminen, kielet ja historia',
    icon: '📚',
    categories: ['Kirjallisuus', 'Kirjastot', 'Kielet', 'Sukututkimus'],
    zone: 'zone-lukeminen',
    anchor: 'lukeminen',
    descriptionKey: 'groupDescLukeminen',
  },
  {
    name: 'Liikkuminen ja ulkoilu',
    icon: '🚌',
    categories: ['Liikenne', 'Matkailu', 'Liikunta', 'Luonto', 'Urheilu'],
    zone: 'zone-liikkuminen',
    anchor: 'liikkuminen',
    descriptionKey: 'groupDescLiikkuminen',
  },
  {
    name: 'Vapaa-aika ja yhteisöt',
    icon: '🎈',
    categories: ['Vapaa-aika', 'Eläkeyhdistykset', 'Hengellisyys', 'Viihde'],
    zone: 'zone-vapaa',
    anchor: 'vapaa-aika',
    descriptionKey: 'groupDescVapaa',
  },
];
