// Downloads every published tab and writes menu-snapshot.json (the offline fallback).
// Run by .github/workflows/refresh-snapshot.yml; refuses to overwrite with a bad download.
import { writeFileSync } from 'node:fs';
import { TABS, tabUrl } from '../config.js';
import { buildMenu } from '../menu.js';
import { LANGUAGES } from '../config.js';

const raw = {};
for (const name of Object.keys(TABS)) {
  const res = await fetch(tabUrl(name));
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  raw[name] = await res.text();
}
const menu = buildMenu(raw, LANGUAGES, msg => console.warn(msg));
if (!menu.length) throw new Error('Downloaded menu is empty; keeping the old snapshot');
writeFileSync(new URL('../menu-snapshot.json', import.meta.url), JSON.stringify(raw, null, 1) + '\n');
console.log(`Snapshot written: ${menu.reduce((n, c) => n + c.items.length, 0)} items`);
