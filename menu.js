// Pure data logic: no DOM, no network. Turns the published CSV text into a menu.

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function toObjects(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const header = rows[0].map(h => h.trim());
  return rows.slice(1)
    .filter(r => r.some(c => c.trim() !== ''))
    .map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

// A lone `available` checkbox in an otherwise empty row is not an item.
const isEmptyItemRow = r => !r.number && !r.category_id && !r.name && !r.price_try;

/**
 * csv: { menu, categories, <lang>: text ... } (raw CSV text per tab)
 * Returns [{ id, titles: {lang: str}, items: [{ number, name, price, names: {lang: str}, descriptions: {lang: str} }] }]
 * `name` is the Menu-tab name; names[lang] is an optional translation that overrides it.
 * Lenient: bad rows are skipped and reported through warn(), never thrown.
 */
export function buildMenu(csv, languages, warn = () => {}) {
  const categories = toObjects(csv.categories).filter(c => c.category_id);
  // Per language: number -> { name, description }. Both are optional.
  const translations = {};
  for (const lang of languages) {
    translations[lang] = new Map();
    for (const r of toObjects(csv[lang] ?? '')) {
      if (r.number && !translations[lang].has(r.number)) {
        translations[lang].set(r.number, { name: r.name ?? '', description: r.description ?? '' });
      }
    }
  }

  const byCategory = new Map(categories.map(c => [c.category_id, {
    id: c.category_id,
    titles: Object.fromEntries(languages.map(l => [l, c[`title_${l}`] ?? ''])),
    items: [],
  }]));

  const seen = new Set();
  for (const r of toObjects(csv.menu)) {
    if (isEmptyItemRow(r)) continue;
    const where = `Menu row "${r.number || r.name || '?'}"`;
    if (!/^[1-9]\d*$/.test(r.number)) { warn(`${where}: number missing or invalid, skipped`); continue; }
    if (seen.has(r.number)) { warn(`${where}: duplicate number, skipped`); continue; }
    seen.add(r.number);
    if (r.available.toUpperCase() !== 'TRUE') continue;
    if (!r.name) { warn(`${where}: name missing, skipped`); continue; }
    const price = Number(r.price_try);
    if (r.price_try === '' || !Number.isFinite(price) || price < 0) { warn(`${where}: invalid price "${r.price_try}", hidden`); continue; }
    const category = byCategory.get(r.category_id);
    if (!category) { warn(`${where}: unknown category "${r.category_id}", skipped`); continue; }
    category.items.push({
      number: r.number,
      name: r.name,
      price,
      names: Object.fromEntries(languages.map(l => [l, translations[l].get(r.number)?.name ?? ''])),
      // '' = the tab has a row with an empty cell (show nothing); undefined = no row in that tab (fall back to English)
      descriptions: Object.fromEntries(languages.map(l => [l, translations[l].get(r.number)?.description])),
    });
  }
  return [...byCategory.values()].filter(c => c.items.length);
}

// Missing translation falls back to the first language (English), then to nothing.
export function pick(map, lang, fallbackLang) {
  return map[lang] || map[fallbackLang] || '';
}
