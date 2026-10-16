// Renders the Brand Book: every board of sections/*.html to out/png/NN.png and the whole book to out/Reunion-Hackathon-Brand-Book.pdf.
// usage: python3 brand/book/optimize.py && node brand/book/render.mjs [section-file-filter]   (serves nothing itself: needs ~/reunion-hackathon on http://localhost:8091)
import { chromium } from "/Users/sapek/gpc-pw/node_modules/playwright/index.mjs";
import { readdirSync, mkdirSync, existsSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { bakeShadows } from "./bake.mjs";
const here = new URL(".", import.meta.url).pathname, out = here + "out/", filter = process.argv[2] || "";
mkdirSync(out + "png", { recursive: true }); mkdirSync(out + "pdf", { recursive: true });
const files = readdirSync(here + "sections").filter((f) => f.endsWith(".html")).sort();
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
// pictures come from the optimized cache (optimize.py) when there is a copy: same look, a fraction of the PDF size
const cache = here + "out/cache";
const cached = (route) => {
  const f = cache + decodeURIComponent(new URL(route.request().url()).pathname);
  if (!existsSync(f)) return route.continue();
  const body = readFileSync(f);
  return route.fulfill({ body, contentType: body[0] === 0xff && body[1] === 0xd8 ? "image/jpeg" : "image/png" });
};
// grain: Chrome rasterizes the SVG noise filter over every whole board in a PDF (megabytes of incompressible noise),
// so the same noise is captured once as a 2x PNG tile and every frame uses that tile as a repeating background instead
const tp = await b.newPage({ viewport: { width: 220, height: 220 }, deviceScaleFactor: 2 });
await tp.goto("http://localhost:8091/brand/book/sections/00-okladka.html");
await tp.setContent(`<link rel="stylesheet" href="http://localhost:8091/brand/book/book.css"><style>html,body{margin:0;background:none}.grain::after{opacity:1}</style><div class="grain" style="position:relative;width:220px;height:220px"></div>`, { waitUntil: "networkidle" });
const grain = await tp.locator(".grain").screenshot({ omitBackground: true }); await tp.close();
// bp: the same boards at 2x, only for baking shadows (bake.mjs)
const bp = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
for (const page of [p, bp]) {
  await page.route(/\.(png|jpe?g)(\?.*)?$/i, cached);
  await page.route("**/__grain.png", (route) => route.fulfill({ body: grain, contentType: "image/png" }));
  await page.addInitScript(() => addEventListener("DOMContentLoaded", () => {
    const s = document.createElement("style");
    s.textContent = '.grain::after{background:url("/__grain.png") 0 0/220px 220px repeat !important}';
    document.head.append(s);
  }));
}
const url = (f, start) => `http://localhost:8091/brand/book/sections/${f}?start=${start}`;
const settle = async () => { await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2200); };
let start = 1; const pdfs = [];
for (const f of files) {
  await p.goto(url(f, start), { waitUntil: "networkidle" });
  const n = await p.locator(".board").count();
  if (!filter || f.includes(filter)) {
    await settle();
    const boards = await p.$$(".board");
    for (let i = 0; i < boards.length; i++) await boards[i].screenshot({ path: `${out}png/${String(start + i).padStart(2, "0")}.png` });
    const pdf = `${out}pdf/${f.replace(".html", ".pdf")}`;
    await bakeShadows(p, bp, url(f, start));
    await p.pdf({ path: pdf + ".raw", width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true });
    execFileSync("python3", [here + "compress.py", pdf + ".raw", pdf]); rmSync(pdf + ".raw");
    console.log(`${f}: ${n} boards, pages ${start}-${start + n - 1}`);
  }
  pdfs.push(`${out}pdf/${f.replace(".html", ".pdf")}`); start += n;
}
await b.close();
if (!filter) { execFileSync("pdfunite", [...pdfs, out + "Reunion-Hackathon-Brand-Book.pdf"]); console.log(`book: ${start - 1} pages -> ${out}Reunion-Hackathon-Brand-Book.pdf`); }
