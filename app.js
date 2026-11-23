// This file's own stamp (see index.html) is passed on, so all three scripts always come from the same release.
const stamp = new URL(import.meta.url).search;
const {
  TABS, LANGUAGES, DEFAULT_LANGUAGE, CURRENCIES, DEFAULT_CURRENCY, CURRENCY_KEY, SHOW_CURRENCY_SWITCH, SHOW_ITEM_NUMBERS, BANNER, SNAPSHOT_URL, CACHE_KEY, STAMP_KEY, tabUrl,
} = await import(`./config.js${stamp}`);
const { buildMenu, pick } = await import(`./menu.js${stamp}`);

const FETCH_TIMEOUT_MS = 8000;
const HEADER_OFFSET = 165;
const SELF_CHECK_GAP_MS = 60_000;
const SELF_RELOAD_GAP_MS = 120_000;

const readCurrency = () => {
  if (!SHOW_CURRENCY_SWITCH) return DEFAULT_CURRENCY;
  try {
    const saved = localStorage.getItem(CURRENCY_KEY);
    return saved in CURRENCIES ? saved : DEFAULT_CURRENCY;
  } catch { return DEFAULT_CURRENCY; }
};

const state = { raw: null, menu: [], lang: DEFAULT_LANGUAGE, currency: readCurrency(), activeId: null };

const pillsEl = document.getElementById('navPills');
const mainEl = document.querySelector('main');
const langSelect = document.getElementById('langSelect');
const bannerEl = document.getElementById('banner');
const currencyEl = document.getElementById('currencyToggle');

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

// Shown in the chosen currency; an item with no euro price stays in lira so it is never blank.
function priceText(item) {
  if (state.currency === 'eur' && item.priceEur !== null) return `${CURRENCIES.eur}${item.priceEur.toFixed(2)}`;
  return `${item.price}${CURRENCIES.try}`;
}

function drawCurrencyToggle() {
  currencyEl.hidden = !SHOW_CURRENCY_SWITCH || !state.menu.some(c => c.items.some(i => i.priceEur !== null));
  currencyEl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.currency === state.currency)));
}

function draw() {
  document.documentElement.lang = state.lang;
  drawBanner();
  drawCurrencyToggle();

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
      const name = item.names[state.lang] || item.name;
      info.append(el('div', 'item-title', SHOW_ITEM_NUMBERS ? `${item.number}. ${name}` : name));
      const desc = item.descriptions[state.lang] ?? item.descriptions[DEFAULT_LANGUAGE] ?? '';
      if (desc) info.append(el('div', 'item-desc desc-text', desc));

      const row = el('div', 'menu-item');
      row.append(info, el('div', 'price-tag', priceText(item)));
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

currencyEl.addEventListener('click', e => {
  const currency = e.target.closest('button')?.dataset.currency;
  if (!currency || currency === state.currency) return;
  state.currency = currency;
  try { localStorage.setItem(CURRENCY_KEY, currency); } catch { /* storage blocked */ }
  draw();
});

load();

// ---- self-check: reload once when this browser is showing an out-of-date copy of the site ----
// The host lets browsers reuse the page, stylesheet and scripts for 10 minutes, each on its own clock, and a
// phone brings an old tab back without asking the server at all. So: compare the files this page was built
// from with what the server has now, and if any differ, renew the stamp (new addresses) and reload.

const SITE_FILES = [location.pathname + location.search, ...['style.css', 'app.js', 'config.js', 'menu.js'].map(f => f + stamp)];
const fileTags = options => Promise.all(SITE_FILES.map(async file => {
  const res = await fetch(file, options);
  res.body?.cancel();
  return res.headers.get('etag') || res.headers.get('last-modified') || '';
}));

let runningTags = null;
let lastSelfCheck = 0;

async function selfCheck() {
  if (Date.now() - lastSelfCheck < SELF_CHECK_GAP_MS) return;
  lastSelfCheck = Date.now();
  try {
    // force-cache = the saved copies this page was just built from, without asking the server.
    runningTags ??= await fileTags({ cache: 'force-cache' });
    const liveTags = await fileTags({ method: 'HEAD', cache: 'no-store' });
    if ([...runningTags, ...liveTags].includes('')) return;
    if (liveTags.every((tag, i) => tag === runningTags[i])) return;
    const lastReload = parseInt(localStorage.getItem(STAMP_KEY), 36) || 0;
    if (Date.now() - lastReload < SELF_RELOAD_GAP_MS) return;
    localStorage.setItem(STAMP_KEY, Date.now().toString(36));
    location.reload();
  } catch { /* offline or storage blocked: keep showing what we have */ }
}

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') selfCheck(); });
window.addEventListener('pageshow', e => { if (e.persisted) selfCheck(); });
selfCheck();
