// Preview and PDFKit draw Chrome's CSS shadows (luminosity soft masks) as grey boxes, so before printing every shadow becomes
// a transparent 2x PNG: box-shadows alone (the element itself stays vector), filtered elements whole (they are pictures anyway).
const PAD = 160; // px around the element: the largest shadow in the book (0 40px 42px) reaches about 125 px

const mark = () => {
  const whole = (e) => getComputedStyle(e).filter !== "none";
  const all = [...document.querySelectorAll(".board *")].filter((e) => { const s = getComputedStyle(e); return s.boxShadow !== "none" || s.filter !== "none"; });
  const list = all.filter((e) => !all.some((a) => a !== e && whole(a) && a.contains(e)));
  list.forEach((e, i) => { e.dataset.bake = i; e.dataset.bakeMode = whole(e) ? "whole" : "shadow"; });
  return list.length;
};

// bp: the same board page in a 2x context (same routes), p: the 1x page that gets printed
export async function bakeShadows(p, bp, url) {
  await bp.goto(url, { waitUntil: "networkidle" });
  await bp.evaluate(() => document.fonts.ready); await bp.waitForTimeout(1500);
  const n = await bp.evaluate(mark), n2 = await p.evaluate(mark);
  if (n !== n2) throw new Error(`bake: ${n} shadowed elements at 2x, ${n2} at 1x`);
  for (let i = 0; i < n; i++) {
    const clip = await bp.evaluate(([i, PAD]) => {
      const e = document.querySelector(`[data-bake="${i}"]`), board = e.closest(".board"), sel = `[data-bake="${i}"]`;
      board.scrollIntoView();
      const r = e.getBoundingClientRect(), b = board.getBoundingClientRect();
      const x = Math.max(b.left, Math.floor(r.left - PAD)), y = Math.max(b.top, Math.floor(r.top - PAD));
      const x2 = Math.min(b.right, Math.ceil(r.right + PAD)), y2 = Math.min(b.bottom, Math.ceil(r.bottom + PAD));
      const st = document.createElement("style"); st.id = "bake";
      st.textContent = "html,body{background:transparent !important} *{visibility:hidden !important}" + (e.dataset.bakeMode === "whole"
        ? `${sel},${sel} *{visibility:visible !important}`
        : `${sel}{visibility:visible !important;background:transparent !important;border-color:transparent !important;color:transparent !important;outline:none !important} ${sel}::before,${sel}::after{visibility:hidden !important}`);
      document.head.append(st);
      return { x, y, width: x2 - x, height: y2 - y, docX: x + scrollX, docY: y + scrollY };  // screenshot clips are viewport-relative
    }, [i, PAD]);
    if (clip.width < 1 || clip.height < 1) { await bp.evaluate(() => document.getElementById("bake").remove()); continue; }
    const png = await bp.screenshot({ clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height }, omitBackground: true });
    await bp.evaluate(() => document.getElementById("bake").remove());
    await p.evaluate(([i, src, c]) => {
      const e = document.querySelector(`[data-bake="${i}"]`), whole = e.dataset.bakeMode === "whole", img = new Image();
      let anchor = e;  // the picture goes next to the outermost transformed ancestor, so it is not rotated twice
      for (let a = e.parentElement; a && !a.classList.contains("board"); a = a.parentElement) if (getComputedStyle(a).transform !== "none") anchor = a;
      const z = getComputedStyle(anchor).zIndex;
      if (whole) { anchor.after(img); e.style.visibility = "hidden"; } else { anchor.before(img); e.style.boxShadow = "none"; }
      img.src = src; img.alt = "";
      Object.assign(img.style, { position: "absolute", margin: "0", padding: "0", border: "0", transform: "none", maxWidth: "none", pointerEvents: "none",
        width: c.width + "px", height: c.height + "px", zIndex: z });
      const cb = img.offsetParent || document.body, r = cb.getBoundingClientRect();
      img.style.left = c.docX - (r.left + scrollX) - cb.clientLeft + "px";
      img.style.top = c.docY - (r.top + scrollY) - cb.clientTop + "px";
    }, [i, "data:image/png;base64," + png.toString("base64"), clip]);
  }
  await p.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => {}))));
  return n;
}
