#!/usr/bin/env node
/* Reunion Hackathon · pobieranie logotypow uczelni
   Node 18+, wbudowany fetch, zero zaleznosci zewnetrznych.

   Uruchomienie:  node scripts/fetch-logos.js
   Wynik:         assets/logos/<slug>.<svg|png>  oraz  scripts/logo-sources.md

   Zasada: zadnego zgadywania adresow plikow. Skrypt najpierw odpytuje zrodlo
   (strona brandowa uczelni, potem API Wikimedia Commons), wyciaga realne adresy
   plikow, dopiero potem pobiera i weryfikuje zawartosc. Plik, ktory nie jest
   poprawnym obrazem albo jest pusty, zostaje odrzucony i skrypt idzie dalej.

   Skrypt jest idempotentny: istniejacy plik logotypu pomija bez ruchu sieciowego. */

const fs = require("fs");
const path = require("path");

const ROOT     = path.resolve(__dirname, "..");
const OUT_DIR  = path.join(ROOT, "assets", "logos");
const REPORT   = path.join(__dirname, "logo-sources.md");
const MIN_PNG_WIDTH = 400;
const UA = "reunion-hackathon-logo-fetch/1.0 (static event site; contact: gpss)";
const MIN_INTERVAL_MS = 1300;  // odstep miedzy zapytaniami, API Wikimedia dlawi serie
const MAX_RETRIES = 5;

/* Uczelnie. `brand` to strona identyfikacji wizualnej, nie adres pliku:
   skrypt sam wyciaga z niej linki do grafik. `wiki` to tytul artykulu,
   z ktorego bierzemy liste plikow przez API. */
const TARGETS = [
  { slug: "imperial",  name: "Imperial College London",
    brand: ["https://www.imperial.ac.uk/brand-style-guide/visual-identity/logo/"],
    wiki: "Imperial College London",
    prefixes: ["imperial college london", "imperial college", "imperial"] },
  { slug: "oxford",    name: "University of Oxford",
    brand: ["https://communications.admin.ox.ac.uk/communications-resources/visual-identity/identity-guidelines/logo"],
    wiki: "University of Oxford",
    prefixes: ["university of oxford", "oxford university"] },
  { slug: "cambridge", name: "University of Cambridge",
    brand: ["https://www.cam.ac.uk/brand-resources/about-the-logo"],
    wiki: "University of Cambridge",
    prefixes: ["university of cambridge", "cambridge university"] },
  { slug: "eth",       name: "ETH Zurich",
    brand: ["https://ethz.ch/en/the-eth-zurich/organisation/corporate-communications/corporate-design.html"],
    wiki: "ETH Zurich",
    prefixes: ["eth zurich", "eth z rich", "eth"] },
  { slug: "ucl",       name: "University College London",
    brand: ["https://www.ucl.ac.uk/brand/brand-essentials/ucl-logo"],
    wiki: "University College London",
    prefixes: ["ucl", "university college london"] },
  { slug: "lse",       name: "London School of Economics",
    brand: ["https://info.lse.ac.uk/staff/services/communications-division/brand-and-visual-identity"],
    wiki: "London School of Economics",
    prefixes: ["lse", "london school of economics"] },
  { slug: "tudelft",   name: "Delft University of Technology",
    brand: ["https://www.tudelft.nl/en/house-style"],
    wiki: "Delft University of Technology",
    prefixes: ["delft university of technology", "tu delft", "technische universiteit delft"] },
  { slug: "warwick",   name: "University of Warwick",
    brand: ["https://warwick.ac.uk/services/communications/visualidentity/logo/"],
    wiki: "University of Warwick",
    prefixes: ["university of warwick", "warwick university"] },
  { slug: "bocconi",   name: "Bocconi University",
    brand: ["https://www.unibocconi.it/en"],
    wiki: "Bocconi University",
    prefixes: ["bocconi university", "universita bocconi", "universita commerciale luigi bocconi", "bocconi"] },
  { slug: "ie",        name: "IE University",
    brand: ["https://www.ie.edu/university/"],
    wiki: "IE University",
    /* Sam skrot "ie" jest za krotki na prefiks, zlapalby przypadkowe pliki. */
    prefixes: ["ie university", "ie business school"] }
];

/* Nazwa pliku musi ZACZYNAC sie od nazwy uczelni. Bez tego wyszukiwarka Commons
   podsuwa herby pojedynczych kolegiow ("Arms PembrokeCollege Cambridge") albo
   logotypy jednostek zaleznych ("Warwick Business School logo"), ktore wygladaja
   na trafienie, a nia nie sa. */
function normalizeTitle(title) {
  return title
    .replace(/^File:/i, "")
    .replace(/\.[a-z0-9]+$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/* Jednostki zalezne i wydawnictwa: nosza nazwe uczelni, ale to inny znak. */
const SUB_ORG = /\b(press|business school|medical school|law school|students union|su|union|society|hospital|nhs|boat club|rugby|football|fc|amateur|racing|punting|examinations|international|alumni|library|museum|department|faculty|conservatoire|forum|chair|mun|tedx|ideas|brookes|azad)\b/;

/* Skany z serwisow agregujacych logotypy, np. *-Logo.wine.svg */
const SCRAPED = /\bwine\b/;

function matchesInstitution(title, target) {
  const norm = normalizeTitle(title);
  const prefix = target.prefixes.find(p => norm === p || norm.startsWith(p + " "));
  if (!prefix) return false;
  const rest = norm.slice(prefix.length).trim();
  if (SUB_ORG.test(rest)) return false;
  if (SCRAPED.test(norm)) return false;
  return true;
}

/* --- pomocnicze ----------------------------------------------------------- */

const log = (...a) => console.log(...a);

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* API Wikimedia odbija seryjne zapytania kodem 429, wiec kazde wyjscie na siec
   idzie przez wspolna kolejke z minimalnym odstepem i wykladniczym ponawianiem. */
let lastCall = 0;
async function throttle() {
  const wait = MIN_INTERVAL_MS - (Date.now() - lastCall);
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
}

async function get(url, asBuffer) {
  let delay = 1500;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    await throttle();
    let res;
    try {
      res = await fetch(url, {
        headers: { "User-Agent": UA, "Accept": asBuffer ? "*/*" : "text/html,application/json" },
        redirect: "follow"
      });
    } catch (e) {
      if (attempt === MAX_RETRIES) throw e;
      await sleep(delay); delay *= 2; continue;
    }
    if (res.ok) return asBuffer ? Buffer.from(await res.arrayBuffer()) : res.text();
    /* 429 i 5xx sa przejsciowe, reszta nie ma sensu ponawiac */
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
      const retryAfter = parseInt(res.headers.get("retry-after") || "0", 10);
      await sleep(retryAfter > 0 ? Math.min(retryAfter, 30) * 1000 : delay);
      delay *= 2;
      continue;
    }
    throw new Error("HTTP " + res.status);
  }
  throw new Error("wyczerpane proby");
}

async function getJson(url) { return JSON.parse(await get(url, false)); }

/* --- weryfikacja pobranego pliku ------------------------------------------ */

/* Rozmiar PNG czytamy z naglowka IHDR, a przy okazji typ koloru:
   6 i 4 niosa kanal alfa, 3 moze miec przezroczystosc w chunku tRNS. */
function inspectPng(buf) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 33 || !buf.subarray(0, 8).equals(sig)) return null;
  const width  = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25];
  const alpha = colorType === 4 || colorType === 6 ||
                (colorType === 3 && buf.includes("tRNS"));
  return { width, height, alpha };
}

function inspectSvg(buf) {
  const head = buf.subarray(0, 4096).toString("utf8");
  if (!/<svg[\s>]/i.test(head)) return null;
  const text = buf.toString("utf8");
  const vb = text.match(/viewBox\s*=\s*["']\s*[-\d.]+[,\s]+[-\d.]+[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (vb) return { width: parseFloat(vb[1]), height: parseFloat(vb[2]), alpha: true };
  const w = text.match(/<svg[^>]*\swidth\s*=\s*["']([\d.]+)/i);
  const h = text.match(/<svg[^>]*\sheight\s*=\s*["']([\d.]+)/i);
  return { width: w ? parseFloat(w[1]) : 0, height: h ? parseFloat(h[1]) : 0, alpha: true };
}

/* Zwraca opis pliku albo null, jesli to nie jest uzyteczny obraz. */
function verify(buf, ext) {
  if (!buf || buf.length === 0) return null;
  if (ext === "svg") {
    const info = inspectSvg(buf);
    if (!info || buf.length < 200) return null;
    return info;
  }
  const info = inspectPng(buf);
  if (!info) return null;
  if (info.width < MIN_PNG_WIDTH) return null;
  return info;
}

/* --- zrodlo 1: strona brandowa uczelni ------------------------------------ */

/* Z HTML wyciagamy kazdy adres konczacy sie na .svg lub .png i zostawiamy te,
   ktore wygladaja na logotyp. Zadnego zgadywania sciezek. */
function extractImageUrls(html, baseUrl) {
  const out = new Set();
  const re = /(?:src|href|data-src|content)\s*=\s*["']([^"']+\.(?:svg|png))(?:\?[^"']*)?["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try { out.add(new URL(m[1], baseUrl).toString()); } catch { /* pomijamy smiecie */ }
  }
  const srcset = /srcset\s*=\s*["']([^"']+)["']/gi;
  while ((m = srcset.exec(html)) !== null) {
    m[1].split(",").forEach(part => {
      const u = part.trim().split(/\s+/)[0];
      if (/\.(svg|png)(\?|$)/i.test(u)) {
        try { out.add(new URL(u.split("?")[0], baseUrl).toString()); } catch { /* jw. */ }
      }
    });
  }
  return [...out];
}

const NOISE = /(sprite|icon|favicon|social|share|arrow|chevron|placeholder|spinner|pixel|banner|cookie|twitter|facebook|instagram|linkedin|youtube)/i;

function scoreCandidate(url, target) {
  const u = url.toLowerCase();
  if (NOISE.test(u)) return -1;
  let s = 0;
  if (u.endsWith(".svg")) s += 6;
  if (/logo/.test(u)) s += 5;
  if (/wordmark|logotype|lockup/.test(u)) s += 3;
  if (/crest|arms|shield|seal/.test(u)) s += 1;
  if (target.prefixes.some(k => u.includes(k.replace(/\s+/g, "")) || u.includes(k.replace(/\s+/g, "_")) || u.includes(k.replace(/\s+/g, "-")))) s += 4;
  return s;
}

async function fromBrandSite(target) {
  const found = [];
  for (const page of target.brand) {
    let html;
    try { html = await get(page, false); }
    catch (e) { log(`    brand ${page} nieosiagalne (${e.message})`); continue; }
    extractImageUrls(html, page).forEach(u => {
      const s = scoreCandidate(u, target);
      if (s >= 9) found.push({ url: u, score: s, origin: page, repo: "strona uczelni", license: "niepodana, prawdopodobnie zastrzezona" });
    });
  }
  return found.sort((a, b) => b.score - a.score).slice(0, 6);
}

/* --- zrodlo 2: Wikimedia Commons ------------------------------------------ */

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

const FILE_OK  = /(logo|wordmark|crest|coat[ _]of[ _]arms|arms|shield|seal)/i;
const FILE_BAD = /(commons-logo|wikimedia|wiktionary|edit-icon|ambox|question_book|red_pencil|padlock|flag_of|map_of|location_map|\.ogg|\.pdf|\.gif|\.jpe?g|\.webp|\.tiff?)/i;

async function fileInfo(api, fileTitle) {
  const url = api + "?action=query&format=json&formatversion=2&prop=imageinfo" +
    "&iiprop=url|size|mime|extmetadata&iiurlwidth=800&titles=" + encodeURIComponent(fileTitle);
  const data = await getJson(url);
  const page = data?.query?.pages?.[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) return null;
  const meta = ii.extmetadata || {};
  const strip = v => (v ? String(v).replace(/<[^>]*>/g, "").trim() : "");
  return {
    title: fileTitle,
    mime: ii.mime,
    url: ii.url,
    thumburl: ii.thumburl,
    width: ii.width,
    height: ii.height,
    descriptionurl: ii.descriptionurl,
    license: strip(meta.LicenseShortName?.value) || strip(meta.UsageTerms?.value) || "nieokreslona",
    author: strip(meta.Artist?.value) || "nieokreslony"
  };
}

async function fromCommons(target) {
  const titles = new Set();

  /* pliki uzyte w artykule na Wikipedii */
  try {
    const data = await getJson(WIKI_API + "?action=query&format=json&formatversion=2&prop=images&imlimit=250&titles=" +
      encodeURIComponent(target.wiki));
    (data?.query?.pages?.[0]?.images || []).forEach(i => titles.add(i.title));
  } catch (e) { log(`    wikipedia prop=images nie zadzialalo (${e.message})`); }

  /* wyszukiwarka Commons w przestrzeni plikow */
  try {
    const data = await getJson(COMMONS_API + "?action=query&format=json&formatversion=2&list=search&srnamespace=6&srlimit=25&srsearch=" +
      encodeURIComponent(target.name + " logo"));
    (data?.query?.search || []).forEach(i => titles.add(i.title));
  } catch (e) { log(`    commons search nie zadzialalo (${e.message})`); }

  /* Czesc uczelni trzyma logotyp pod goła nazwa ("University of Oxford.svg"),
     bez slowa "logo" w tytule. Dokladne trafienie w nazwe uczelni traktujemy
     wiec tak samo jak jawny logotyp. */
  const isLogoLike = t =>
    target.prefixes.some(pfx => normalizeTitle(t) === pfx) || FILE_OK.test(t);

  const shortlist = [...titles].filter(t =>
    isLogoLike(t) && !FILE_BAD.test(t) && matchesInstitution(t, target));

  const out = [];
  for (const t of shortlist) {
    /* Commons ma wiekszosc plikow, ale logotypy niewolne (fair use) siedza
       lokalnie na en.wikipedia. Sprawdzamy oba repozytoria i zapisujemy,
       ktore odpowiedzialo, bo od tego zalezy sytuacja prawna pliku. */
    let info = null, repo = "Wikimedia Commons";
    try { info = await fileInfo(COMMONS_API, t); } catch { /* ponizej */ }
    if (!info) {
      try { info = await fileInfo(WIKI_API, t); repo = "en.wikipedia, plik niewolny"; }
      catch { continue; }
    }
    if (!info) continue;
    if (!/svg|png/.test(info.mime || "")) continue;

    const isSvg = /svg/.test(info.mime);
    let url = info.url;
    if (!isSvg && info.width < MIN_PNG_WIDTH) continue;
    if (!isSvg && info.width > 1600 && info.thumburl) url = info.thumburl;

    /* Pas logotypow jest poziomy, wiec szeroki lockup bije kwadratowy herb. */
    const ratio = info.height ? info.width / info.height : 1;
    let score = 5 + (isSvg ? 6 : 0);
    if (/logo/i.test(t)) score += 5;
    if (ratio >= 2) score += 4;
    else if (ratio >= 1.4) score += 2;

    out.push({
      url, score, repo,
      origin: info.descriptionurl || "https://commons.wikimedia.org/wiki/" + encodeURIComponent(t),
      license: info.license,
      author: info.author,
      title: t
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 8);
}

/* --- pobranie jednej uczelni ---------------------------------------------- */

/* Bez manifestu ponowny przebieg pomijalby istniejace pliki i gubil ich
   metadane, przez co raport praw robilby sie pusty. */
const MANIFEST = path.join(__dirname, "logo-manifest.json");

function readManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST, "utf8")); } catch { return {}; }
}

function existingFile(slug) {
  for (const ext of ["svg", "png"]) {
    const p = path.join(OUT_DIR, slug + "." + ext);
    if (fs.existsSync(p) && fs.statSync(p).size > 0) return p;
  }
  return null;
}

async function handle(target, manifest) {
  const have = existingFile(target.slug);
  if (have) {
    const remembered = manifest[target.slug];
    log(`  ${target.slug}: plik juz istnieje (${path.basename(have)}), pomijam`);
    return { ...target, ...(remembered || {}), status: "pominieto", file: path.basename(have) };
  }

  log(`  ${target.slug}: szukam zrodla`);
  let candidates = await fromBrandSite(target);
  if (candidates.length) log(`    strona brandowa: ${candidates.length} kandydatow`);
  const commons = await fromCommons(target);
  log(`    commons: ${commons.length} kandydatow`);
  candidates = candidates.concat(commons);

  for (const c of candidates) {
    const ext = /\.svg(\?|$)/i.test(c.url) ? "svg" : "png";
    let buf;
    try { buf = await get(c.url, true); }
    catch (e) { log(`    odrzucone ${c.url} (${e.message})`); continue; }

    const info = verify(buf, ext);
    if (!info) { log(`    odrzucone ${c.url} (nie przechodzi weryfikacji obrazu)`); continue; }

    const file = target.slug + "." + ext;
    fs.writeFileSync(path.join(OUT_DIR, file), buf);
    log(`    OK ${file} · ${info.width}x${info.height} · ${buf.length} B`);
    return {
      ...target, status: "pobrano", file, url: c.url, origin: c.origin,
      repo: c.repo || "nieokreslone",
      format: ext.toUpperCase(), bytes: buf.length,
      dims: `${Math.round(info.width)}x${Math.round(info.height)}`,
      ratio: info.height ? (info.width / info.height).toFixed(2) : "?",
      alpha: info.alpha ? "tak" : "nie/nieznane",
      license: c.license || "nieokreslona"
    };
  }

  log(`    BRAK: zadne zrodlo nie dalo poprawnego pliku`);
  return { ...target, status: "brak", file: "", url: "", origin: "", license: "" };
}

/* --- raport --------------------------------------------------------------- */

function writeReport(rows) {
  const line = r => "| " + [
    r.name,
    r.file || "brak (pas degraduje sie do nazwy)",
    r.format || "brak",
    r.dims || "brak",
    r.alpha || "brak",
    r.repo || "brak",
    r.url ? `[plik](${r.url})` : "brak",
    r.origin ? `[opis](${r.origin})` : "brak",
    r.license || "brak"
  ].join(" | ") + " |";

  const md = `# Logotypy uczelni: zrodla i prawa

Wygenerowane przez \`scripts/fetch-logos.js\`. Ostatni przebieg: ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC.

> **Uwaga prawna.** Ponizsza tabela dokumentuje, skad pochodzi kazdy plik, a nie to,
> ze wolno go opublikowac. Logotypy uczelni to znaki towarowe. Licencja pliku na
> Wikimedia Commons (czesto "public domain" z uwagi na prosty ksztalt) nie znosi praw
> do znaku towarowego ani wymogow ksiegi znaku danej uczelni. Przed publikacja strony
> kazda pozycja wymaga osobnej weryfikacji: albo zgody uczelni, albo usuniecia.
> Do czasu weryfikacji pas logotypow nadaje sie wylacznie do wersji roboczej.

| Uczelnia | Plik | Format | Wymiary | Alfa | Repozytorium | Uzyty URL | Opis pliku | Licencja pliku |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.map(line).join("\n")}

## Kolejnosc zrodel

1. Oficjalna strona identyfikacji wizualnej uczelni: skrypt pobiera HTML i wyciaga
   z niego realne adresy plikow SVG i PNG, po czym filtruje je pod katem nazwy.
   Wiekszosc uczelni trzyma pliki brandowe za logowaniem albo w archiwach ZIP,
   wiec ta sciezka czesto nie zwraca nic i to jest zachowanie oczekiwane.
2. Wikimedia Commons przez API: lista plikow z artykulu na Wikipedii oraz
   wyszukiwanie w przestrzeni nazw plikow, potem \`prop=imageinfo\` po realny adres.
3. Lokalne repozytorium en.wikipedia, tylko dla plikow, ktorych nie ma na Commons.
   Tam trafiaja logotypy **niewolne**, trzymane na zasadzie fair use. Kazdy taki
   plik ma w kolumnie "Repozytorium" adnotacje \`plik niewolny\` i wymaga
   bezwzglednie zgody uczelni albo usuniecia przed publikacja.

Nazwa pliku musi zaczynac sie od nazwy uczelni. Bez tej reguly wyszukiwarka
Commons podsuwa herby pojedynczych kolegiow i logotypy jednostek zaleznych
(wydawnictw, szkol biznesu, samorzadow studenckich), ktore wygladaja na trafienie,
a nim nie sa. Przy rownej reszcie wygrywa plik SVG i lockup o proporcjach
poziomych, bo pas logotypow jest poziomy.

Kazdy pobrany plik przechodzi weryfikacje: niezerowy rozmiar, poprawny naglowek
(sygnatura PNG albo element \`<svg>\`), a dla PNG szerokosc minimum ${MIN_PNG_WIDTH} px.
Plik, ktory nie przechodzi, jest odrzucany, a skrypt probuje kolejnego kandydata.
`;
  fs.writeFileSync(REPORT, md);
}

/* --- main ----------------------------------------------------------------- */

(async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  log("Pobieranie logotypow uczelni do assets/logos/\n");

  const manifest = readManifest();
  const rows = [];
  for (const t of TARGETS) rows.push(await handle(t, manifest));

  rows.forEach(r => {
    if (r.status === "brak") { delete manifest[r.slug]; return; }
    manifest[r.slug] = {
      file: r.file, url: r.url, origin: r.origin, repo: r.repo,
      format: r.format, dims: r.dims, ratio: r.ratio, alpha: r.alpha, license: r.license
    };
  });
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

  writeReport(rows);

  const done = rows.filter(r => r.status === "pobrano").length;
  const skip = rows.filter(r => r.status === "pominieto").length;
  const miss = rows.filter(r => r.status === "brak");
  log(`\nPobrane: ${done} · pominiete: ${skip} · nieudane: ${miss.length}`);
  if (miss.length) log("Bez pliku: " + miss.map(r => r.slug).join(", "));
  log(`Raport: scripts/logo-sources.md`);
})();
