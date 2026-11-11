// The only file to edit when switching to a different Google Sheet.
// Sheet: File > Share > Publish to web > Entire document > CSV.
// The long id below is the one in the published link (.../d/e/<id>/pub).
export const SHEET_ID = '2PACX-1vRTMBhQx9cvGiAN3yY3eDNweXLPNbsxhxAAqS2d_3ts3aaJ5hiG7YB36HIq30iIBYjjFvsTiVY8Y5aU';

// Tab name -> gid (the number after #gid= in the Sheet's address bar for that tab).
export const TABS = {
  menu: '0',
  categories: '1836440014',
  en: '665784582',
  tr: '1778754526',
  pt: '1111658424',
};

export const LANGUAGES = ['en', 'tr', 'pt'];
export const DEFAULT_LANGUAGE = 'en';
export const CURRENCY_SYMBOL = '₺';

export const SNAPSHOT_URL = 'menu-snapshot.json';
export const CACHE_KEY = 'sabor-menu-v1';

export function tabUrl(tab) {
  return `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${TABS[tab]}&single=true&output=csv`;
}
