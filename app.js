import {
  TABS, LANGUAGES, DEFAULT_LANGUAGE, CURRENCY_SYMBOL, SHOW_ITEM_NUMBERS, BANNER, SNAPSHOT_URL, CACHE_KEY, tabUrl,
} from './config.js';
import { buildMenu, pick } from './menu.js';

const FETCH_TIMEOUT_MS = 8000;
const HEADER_OFFSET = 135;

const state = { raw: null, menu: [], lang: DEFAULT_LANGUAGE, activeId: null };

const pillsEl = document.getElementById('navPills');
const mainEl = document.querySelector('main');
const langSelect = document.getElementById('langSelect');
const bannerEl = document.getElementById('banner');

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---- data: live Sheet -> browser cache -> repo snapshot ----

async function fetchText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
    if (!res.ok) throw new Error(`${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchLive() {
  const names = Object.keys(TABS);
  const texts = await Promise.all(names.map(n => fetchText(tabUrl(n))));
  return Object.fromEntries(names.map((n, i) => [n, texts[i]]));
}

const readCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch { return null; }
};
const writeCache = raw => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(raw)); } catch { /* storage full or blocked */ }
};

// Returns true if `raw` produced a usable menu and was applied.
function apply(raw) {
  if (!raw || typeof raw.menu !== 'string') return false;
  const menu = buildMenu(raw, LANGUAGES, msg => console.warn('[menu]', msg));
  if (!menu.length) return false;
  state.raw = raw;
  state.menu = menu;
  if (!menu.some(c => c.id === state.activeId)) state.activeId = menu[0].id;
  draw();
  return true;
}

async function load() {
  const cached = readCache();
  const hadCache = cached ? apply(cached) : false;

  try {
    const live = await fetchLive();
    if (JSON.stringify(live) !== JSON.stringify(state.raw) && apply(live)) writeCache(live);
    else if (!state.raw) throw new Error('live menu was empty');
  } catch (err) {
    console.warn('[menu] live fetch failed:', err.message);
    if (hadCache) return;
    try {
      if (!apply(JSON.parse(await fetchText(SNAPSHOT_URL)))) throw new Error('snapshot empty');
    } catch (snapErr) {
      console.warn('[menu] snapshot failed:', snapErr.message);
      mainEl.replaceChildren(el('p', 'load-error', 'Menu could not be loaded. Please check your connection and refresh.'));
    }
  }
}

// ---- rendering (textContent only: Sheet content is never parsed as HTML) ----

const t = map => pick(map, state.lang, DEFAULT_LANGUAGE);

function drawBanner() {
  if (bannerEl) bannerEl.textContent = BANNER ? pick(BANNER, state.lang, DEFAULT_LANGUAGE) : '';
}

function draw() {
  document.documentElement.lang = state.lang;
  drawBanner();

  pillsEl.replaceChildren(...state.menu.map(cat => {
    const pill = el('button', 'pill' + (cat.id === state.activeId ? ' active' : ''));
    pill.append(el('span', 'pill-text', t(cat.titles) || cat.id));
    pill.addEventListener('click', () => scrollToCat(cat.id));
    return pill;
  }));

  mainEl.replaceChildren(...state.menu.map(cat => {
    const section = el('section');
    section.id = cat.id;

    const title = el('div', 'category-title');
    title.append(el('span', 'cat-text', t(cat.titles) || cat.id));

    const content = el('div', 'category-content');
    for (const item of cat.items) {
      const info = el('div', 'item-info');
      info.append(el('div', 'item-title', SHOW_ITEM_NUMBERS ? `${item.number}. ${item.name}` : item.name));
      const desc = t(item.descriptions);
      if (desc) info.append(el('div', 'item-desc desc-text', desc));

      const row = el('div', 'menu-item');
      row.append(info, el('div', 'price-tag', `${item.price}${CURRENCY_SYMBOL}`));
      content.append(row);
    }
    section.append(title, content);
    return section;
  }));
}

function scrollToCat(id) {
  state.activeId = id;
  pillsEl.querySelectorAll('.pill').forEach((p, i) => p.classList.toggle('active', state.menu[i].id === id));
  const target = document.getElementById(id);
  if (target) {
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET,
      behavior: 'smooth',
    });
  }
}

langSelect.addEventListener('change', () => {
  state.lang = langSelect.value;
  if (state.menu.length) draw();
  else drawBanner();
});

load();
