// true-size passes, badges and lanyards with 3 mm bleed. usage: node brand/book/druk-pass.mjs   (needs :8091)
import { chromium } from "/Users/sapek/gpc-pw/node_modules/playwright/index.mjs";
import { stripBlurredShadows } from "./noblur.mjs";
import { execFileSync } from "node:child_process"; import { mkdirSync } from "node:fs"; import { tmpdir } from "node:os"; import { join } from "node:path";
const out = new URL("out/druk/", import.meta.url).pathname, tmp = join(tmpdir(), "rh-druk-pass/");
mkdirSync(out, { recursive: true }); mkdirSync(tmp, { recursive: true });
const SC = 96 / (25.4 * 4); // 4 px per mm design units -> true mm
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 700 } });
const page = async (url, w, h, file) => { await p.goto("http://localhost:8091/print/" + url, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  for (const fr of p.frames()) await fr.evaluate(stripBlurredShadows);
  await p.addStyleTag({ content: "@page{margin:0;size:auto}html,body{margin:0!important;padding:0!important;background:none!important;overflow:hidden}" });
  await p.pdf({ path: file, width: w + "mm", height: h + "mm", scale: SC, printBackground: true, pageRanges: "1" }); };
const seats = { LHR: "042", AMS: "017", CPH: "063", ZRH: "088", MXP: "005", MAD: "031", ARN: "074" };
const files = [];
for (const [c, s] of Object.entries(seats)) { const f = `${tmp}p-${c}.pdf`; await page(`pass.html?view=print&bleed=1&from=${c}&seat=${s}`, 209, 88, f); files.push(f); }
execFileSync("pdfunite", [...files, out + "bilet-karta-pokladowa-203x82-spad3.pdf"]);
for (const r of ["uczestnik", "zaloga", "mentor", "jury", "partner"]) await page(`badge.html?view=print&bleed=1&role=${r}`, 96, 136, `${out}identyfikator-${r}-90x130-spad3.pdf`);
for (const c of ["red", "ink", "white"]) await page(`badge.html?view=lanyard&bleed=1&c=${c}`, 286, 26, `${out}smycz-${c}-280x20-spad3.pdf`);
await b.close();
