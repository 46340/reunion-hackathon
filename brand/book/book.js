/* Brand Book helpers: chapter head/foot on content boards, page numbers (?start=N from render.mjs), extruded words (data-px). */
(() => {
  const Q = new URLSearchParams(location.search), start = +(Q.get("start") || 1);
  const MARK = (a = "#141210", b = "#C8102E") => `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M21.59 2.01 A22.13 22.13 0 0 0 23.40 46.12" fill="none" stroke="${a}" stroke-width="3.75" stroke-linecap="round"/><path d="M33.58 43.94 A22.13 22.13 0 0 0 32.84 3.72" fill="none" stroke="${b}" stroke-width="3.75" stroke-linecap="round"/><circle cx="27.72" cy="24" r="4.39" fill="${b}"/></svg>`;
  // still split-flap board (static lines), sized like the site does it; board.html lives at the site root
  const board = (el, lines, cw, cols, red = true) => {
    const rows = lines.length, center = (t) => " ".repeat(Math.max(0, Math.floor((cols - t.length) / 2))) + t;
    const q = new URLSearchParams({ embed: 1, font: "Big Shoulders Display", cw, cols, t: 99999, lines: lines.map(center).join("|") });
    if (red) q.set("reddigits", 1);
    el.src = "../../../board.html?" + q;
    el.style.width = Math.ceil(cw * (cols + (cols - 1) * 0.15 + 3)) + "px";
    el.style.height = Math.ceil(cw * (rows * 1.3 + (rows - 1) * 0.42 + 2.7)) + 30 + "px";
  };
  window.Book = { MARK, board, VERSION: "Wersja 01 · październik 2026" };
  document.querySelectorAll(".board").forEach((b, i) => {
    const n = String(start + i).padStart(2, "0"), chapter = b.dataset.chapter || document.body.dataset.chapter || "";
    if (b.classList.contains("content")) {
      b.insertAdjacentHTML("afterbegin", `<div class="head"><span class="t">Reunion Hackathon · Brand Book</span><span class="r">${chapter}${MARK()}</span></div>`);
      b.insertAdjacentHTML("beforeend", `<div class="foot"><span>${Book.VERSION}</span><span>${n}</span></div>`);
    }
    b.dataset.page = n;
  });
  const lock = `${MARK("#fff", "#fff")}Reunion Hackathon<span class="by"><img src="../../../assets/logos/gpss-planet-white.png" alt=""><span>Global Polish Student Society</span></span>`;
  document.querySelectorAll(".lockup:empty").forEach((el) => (el.innerHTML = lock));
  document.querySelectorAll(".divider .ver:empty").forEach((el) => (el.innerHTML = "Wersja 01<br>październik 2026"));
  const go = () => document.querySelectorAll("[data-px]").forEach((el) => typeof Print !== "undefined" && Print.block(el, +el.dataset.px));
  document.fonts.ready.then(go);
})();
