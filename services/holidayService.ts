import { CalendarEvent } from '../types';

const pad = (value: number) => String(value).padStart(2, '0');

const toDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const createDate = (year: number, month: number, day: number) => new Date(year, month - 1, day);

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getEasterSunday = (year: number) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return createDate(year, month, day);
};

const getNthWeekdayOfMonth = (year: number, month: number, weekday: number, nth: number) => {
  const date = createDate(year, month, 1);
  const offset = (weekday - date.getDay() + 7) % 7;
  return createDate(year, month, 1 + offset + (nth - 1) * 7);
};

const getLastWeekdayOfMonth = (year: number, month: number, weekday: number) => {
  const date = createDate(year, month + 1, 0);
  const offset = (date.getDay() - weekday + 7) % 7;
  return createDate(year, month, date.getDate() - offset);
};

const getSaturdayBetween = (year: number, month: number, startDay: number, endDay: number) => {
  for (let day = startDay; day <= endDay; day += 1) {
    const date = createDate(year, month, day);
    if (date.getDay() === 6) return date;
  }
  return createDate(year, month, startDay);
};

const getAllSaintsDay = (year: number) => {
  for (const date of [
    createDate(year, 10, 31),
    createDate(year, 11, 1),
    createDate(year, 11, 2),
    createDate(year, 11, 3),
    createDate(year, 11, 4),
    createDate(year, 11, 5),
    createDate(year, 11, 6),
  ]) {
    if (date.getDay() === 6) return date;
  }

  return createDate(year, 11, 1);
};

const fixed = (year: number, month: number, day: number, name: string, type: CalendarEvent['type'], flagType?: CalendarEvent['flagType']): CalendarEvent => ({
  date: toDateKey(createDate(year, month, day)),
  name,
  type,
  flagType,
});

const event = (date: Date, name: string, type: CalendarEvent['type'], flagType?: CalendarEvent['flagType']): CalendarEvent => ({
  date: toDateKey(date),
  name,
  type,
  flagType,
});

export const getCalendarEvents = (year: number): CalendarEvent[] => {
  const easter = getEasterSunday(year);
  const midsummerDay = getSaturdayBetween(year, 6, 20, 26);
  const midsummerEve = addDays(midsummerDay, -1);
  const allSaintsDay = getAllSaintsDay(year);

  return [
    fixed(year, 1, 1, 'Uudenvuodenpäivä', 'holiday'),
    fixed(year, 1, 6, 'Loppiainen', 'holiday'),
    fixed(year, 2, 3, 'Alvar ja Aino Aallon sekä arkkitehtuurin ja muotoilun päivä', 'flag', 'recommended'),
    fixed(year, 2, 5, 'J. L. Runebergin päivä', 'flag', 'established'),
    fixed(year, 2, 6, 'Saamelaisten kansallispäivä', 'flag', 'recommended'),
    fixed(year, 2, 28, 'Kalevalan päivä, suomalaisen kulttuurin päivä', 'flag', 'official'),
    fixed(year, 3, 19, 'Minna Canthin päivä, tasa-arvon päivä', 'flag', 'established'),
    fixed(year, 4, 8, 'Romanien kansallispäivä', 'flag', 'recommended'),
    fixed(year, 4, 9, 'Mikael Agricolan päivä, suomen kielen päivä', 'flag', 'established'),
    fixed(year, 4, 20, 'Evakkojen päivä', 'flag', 'recommended'),
    fixed(year, 4, 27, 'Kansallinen veteraanipäivä', 'flag', 'established'),
    event(addDays(easter, -2), 'Pitkäperjantai', 'holiday'),
    event(easter, 'Pääsiäispäivä', 'holiday'),
    event(addDays(easter, 1), 'Toinen pääsiäispäivä', 'holiday'),
    fixed(year, 5, 1, 'Vappu, suomalaisen työn päivä', 'flag', 'official'),
    fixed(year, 5, 9, 'Eurooppa-päivä', 'flag', 'established'),
    fixed(year, 5, 12, 'J. V. Snellmanin päivä, suomalaisuuden päivä', 'flag', 'established'),
    event(getNthWeekdayOfMonth(year, 5, 0, 2), 'Äitienpäivä', 'flag', 'official'),
    event(getNthWeekdayOfMonth(year, 5, 0, 3), 'Kaatuneiden muistopäivä', 'flag', 'official'),
    event(addDays(easter, 39), 'Helatorstai', 'holiday'),
    event(addDays(easter, 49), 'Helluntai', 'holiday'),
    fixed(year, 6, 4, 'Puolustusvoimain lippujuhlan päivä', 'flag', 'official'),
    event(midsummerEve, 'Juhannusaatto', 'holiday'),
    event(midsummerDay, 'Juhannuspäivä, Suomen lipun päivä', 'flag', 'official'),
    fixed(year, 7, 6, 'Eino Leinon päivä, runon ja suven päivä', 'flag', 'established'),
    fixed(year, 8, 9, 'Tove Janssonin ja suomalaisen taiteen päivä', 'flag', 'recommended'),
    event(getLastWeekdayOfMonth(year, 8, 6), 'Suomen luonnon päivä', 'flag', 'established'),
    fixed(year, 10, 1, 'Miina Sillanpään ja kansalaisvaikuttamisen päivä', 'flag', 'established'),
    fixed(year, 10, 10, 'Aleksis Kiven päivä, suomalaisen kirjallisuuden päivä', 'flag', 'established'),
    fixed(year, 10, 24, 'Yhdistyneiden kansakuntien päivä', 'flag', 'established'),
    event(allSaintsDay, 'Pyhäinpäivä', 'holiday'),
    fixed(year, 11, 6, 'Ruotsalaisuuden päivä', 'flag', 'official'),
    event(getNthWeekdayOfMonth(year, 11, 0, 2), 'Isänpäivä', 'flag', 'official'),
    fixed(year, 11, 20, 'Lapsen oikeuksien päivä', 'flag', 'established'),
    fixed(year, 12, 6, 'Itsenäisyyspäivä', 'flag', 'official'),
    fixed(year, 12, 8, 'Jean Sibeliuksen päivä, suomalaisen musiikin päivä', 'flag', 'established'),
    fixed(year, 12, 24, 'Jouluaatto', 'holiday'),
    fixed(year, 12, 25, 'Joulupäivä', 'holiday'),
    fixed(year, 12, 26, 'Tapaninpäivä', 'holiday'),
  ].sort((a, b) => a.date.localeCompare(b.date));
};

export const getTodayEvents = (date = new Date()) => {
  const key = toDateKey(date);
  return getCalendarEvents(date.getFullYear()).filter((item) => item.date === key);
};

export const getNextCalendarEvent = (date = new Date()) => {
  const today = toDateKey(date);
  const events = [
    ...getCalendarEvents(date.getFullYear()),
    ...getCalendarEvents(date.getFullYear() + 1),
  ];

  return events.find((item) => item.date > today) ?? null;
};
