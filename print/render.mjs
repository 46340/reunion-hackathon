// Renders every [data-shot] element of the given print pages to out/<name>.png (2x).
// usage: node render.mjs badge.html stickers.html ...   (needs the site served on :8091)
import { chromium } from "/Users/sapek/gpc-pw/node_modules/playwright/index.mjs";
import { mkdirSync } from "node:fs";
const out = new URL("./out/", import.meta.url).pathname; mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: 3600, height: 2000 }, deviceScaleFactor: 2 });
for (const page of process.argv.slice(2)) {
  await p.goto(`http://localhost:8091/print/${page}`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  await p.evaluate(() => { document.documentElement.style.background = document.body.style.background = "transparent"; document.querySelectorAll(".wall").forEach((w) => (w.style.background = "transparent")); });
  for (const el of await p.$$("[data-shot]")) {
    const name = await el.getAttribute("data-shot");
    await el.screenshot({ path: `${out}${name}.png`, animations: "disabled", omitBackground: true }); console.log(name);
  }
}
await b.close();
