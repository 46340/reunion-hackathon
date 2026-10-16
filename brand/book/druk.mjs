// true-size print PDFs with 3 mm bleed. usage: node brand/book/druk.mjs [filter]   (posters, signs, certificates; needs :8091)
import { chromium } from "/Users/sapek/gpc-pw/node_modules/playwright/index.mjs";
import { stripBlurredShadows } from "./noblur.mjs";
const OUT = new URL("out/druk/", import.meta.url).pathname, B = 3, F = process.argv[2] || "";
const J = [
  ["poster.html", "plakat-50x70", "plakat-50x70-druk", [500, 700]],
  ["signage.html", "plakat-agenda", "plakat-agenda-A2-druk", [420, 594]],
  ["rollup.html", "rollup-85x200", "rollup-85x200-druk", [850, 2000]],
  ["signage.html", "znak-reg", "znak-rejestracja-100x30-druk", [1000, 300]],
  ["signage.html", "znak-hall", "znak-sala-glowna-100x30-druk", [1000, 300]],
  ["signage.html", "znak-quiet", "znak-strefa-ciszy-100x30-druk", [1000, 300]],
  ["signage.html", "znak-food", "znak-jedzenie-100x30-druk", [1000, 300]],
  ["signage.html", "stol-07", "stol-07-A5-druk", [210, 148]],
  ["signage.html", "stol-23", "stol-23-A5-druk", [210, 148]],
  ["diploma.html", "certyfikat-uczestnik", "certyfikat-uczestnik-A4-druk", [297, 210]],
  ["diploma.html", "certyfikat-zwyciezca", "certyfikat-zwyciezca-A4-druk", [297, 210]],
];
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: 2600, height: 2000 } });
await p.emulateMedia({ media: "screen" });
const load = async (page) => { await p.goto(`http://localhost:8091/print/${page}`, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500); };
for (const [page, shot, name, [tw, th]] of J) {
  if (F && !name.includes(F)) continue;
  await load(page);
  await p.evaluate(([shot, tw, th, B]) => {
    const el = document.querySelector(`[data-shot="${shot}"]`); let host = el.parentElement; const isBody = host === document.body;
    if (isBody) { host = document.createElement("div"); document.body.append(host); host.append(el); document.body.style.margin = "0"; }
    const W = el.offsetWidth, s = tw / W, bp = B / s;                 // s = mm per css px
    if (shot.startsWith("stol-")) { el.style.height = (W * th / tw) + "px"; el.style.boxShadow = "none"; }
    const H = el.offsetHeight, cw = tw / s + 2 * bp, ch = th / s + 2 * bp;
    let bg = getComputedStyle(el).backgroundColor;
    if (shot.startsWith("stol-")) bg = `linear-gradient(#C8102E ${bp + 64}px, #fff ${bp + 64}px)`;
    [...host.children].forEach((c) => { if (c !== el && c.tagName !== "SCRIPT") c.style.display = "none"; });
    document.querySelectorAll(".safe").forEach((n) => (n.style.display = "none"));
    el.style.overflow = "visible"; el.style.margin = "0";
    const st = document.createElement("style"); st.textContent = `@page{size:${tw + 2 * B}mm ${th + 2 * B}mm;margin:0}.grain::after{inset:-${bp}px !important}`; document.head.append(st);
    Object.assign(host.style, { display: "block", position: "absolute", left: 0, top: 0, margin: 0, padding: bp + "px", gap: 0, width: cw + "px", height: ch + "px", overflow: "hidden", background: bg, zoom: String(s / 0.26458333) });
    el.style.position = "relative"; el.style.flex = "none";
    Object.assign(document.documentElement.style, { background: shot.startsWith("stol-") ? "#fff" : bg, overflow: "hidden" }); document.body.style.background = isBody ? bg : "#fff";
    if (isBody) document.body.style.minHeight = "0";
    document.title = shot;
  }, [shot, tw, th, B]);
  for (const fr of p.frames()) await fr.evaluate(stripBlurredShadows);
  await p.waitForTimeout(400);
  await p.pdf({ path: `${OUT}${name}.pdf`, width: `${tw + 2 * B}mm`, height: `${th + 2 * B}mm`, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: "1" });
  console.log(name);
}
await b.close();
