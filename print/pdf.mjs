// deck.html -> PDF (A4 landscape). usage: node pdf.mjs <out.pdf>
import { chromium } from "/Users/sapek/gpc-pw/node_modules/playwright/index.mjs";
const b = await chromium.launch(); const p = await b.newPage();
await p.goto("http://localhost:8091/print/deck.html", { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
await p.pdf({ path: process.argv[2], width: "297mm", height: "210mm", printBackground: true, preferCSSPageSize: true });
await b.close();
