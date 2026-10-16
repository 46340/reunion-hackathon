/* Reunion Hackathon v2
   1. extruded letter blocks (Trepkowski, Warszawa 1952)
   2. split-flap boards (board.html in an iframe: hero countdown, agenda template, intro)
   3. REUNION: just the word, nothing holds it (2026-10-12)
   4. intro: arrivals board lands on the hero board, once per session
   5. sticky bar, apply terminal, striped plane
*/
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const phone = () => innerWidth < 760;
const EN = document.documentElement.lang === "en";   // en.html is index.html with English text (make_en.py)
if (new URLSearchParams(location.search).has("shot")) document.documentElement.classList.add("shot");
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
scrollTo({ top: 0, behavior: "instant" });

// ---------------------------------------------------------------- 1. extrusion
function extrude(side, edge, shadow, n) {
  const l = [];
  for (let i = 1; i <= n; i++) l.push(`${i * 0.55}px ${i}px 0 ${i === n ? edge : side}`);
  l.push(shadow);
  return l.join(",");
}
const root = document.documentElement.style;
root.setProperty("--x-red", extrude("#DCD2C3", "#9c907d", "14px 26px 0 rgba(20,16,10,.08)", 16));
root.setProperty("--x-white", extrude("#EBC9CC", "#6d0613", "14px 26px 0 rgba(20,16,10,.16)", 16));
root.setProperty("--x-white-s", extrude("#EBC9CC", "#6d0613", "6px 12px 0 rgba(20,16,10,.14)", 7));
root.setProperty("--x-hero", extrude("#EBC9CC", "#6d0613", "22px 40px 0 rgba(20,16,10,.16)", 26));

// ---------------------------------------------------------------- console: a hello for the people who open DevTools
(function hello() {
  const banner = [
    "██████╗ ███████╗██╗   ██╗███╗   ██╗██╗ ██████╗ ███╗   ██╗",
    "██╔══██╗██╔════╝██║   ██║████╗  ██║██║██╔═══██╗████╗  ██║",
    "██████╔╝█████╗  ██║   ██║██╔██╗ ██║██║██║   ██║██╔██╗ ██║",
    "██╔══██╗██╔══╝  ██║   ██║██║╚██╗██║██║██║   ██║██║╚██╗██║",
    "██║  ██║███████╗╚██████╔╝██║ ╚████║██║╚██████╔╝██║ ╚████║",
    "╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝"
  ].join("\n");
  const days = Math.max(0, Math.ceil((Date.parse("2027-02-05T16:00:00+01:00") - Date.now()) / 86400000));
  const mono = "font-family: 'IBM Plex Mono', ui-monospace, monospace;";
  console.log(`%c${banner}`, `${mono} color: #C8102E; font-weight: 700; line-height: 1.05;`);
  console.log(EN ? `%cHACKATHON · WARSAW · 5–7 FEBRUARY 2027 · IN ${days} DAYS` : `%cHACKATHON · WARSZAWA · 5–7 LUTEGO 2027 · ZA ${days} DNI`, `${mono} color: #C8102E; font-weight: 600; letter-spacing: .2em;`);
  console.log(EN ? `%cIf you are looking in here, you fit in with us.%c\nWe are looking for 100 people from universities abroad: 48 hours of code, free to take part.` : `%cSkoro tu zaglądasz, pasujesz do nas.%c\nSzukamy stu osób z zagranicznych uczelni: 48 godzin kodu, udział bezpłatny.`,
    "font: 400 18px Georgia, serif;", `${mono} font-size: 12px;`);
  console.log(`%creturn(home);%c  →  ${location.origin}/${EN ? "en.html" : ""}#rekrutacja`, `${mono} color: #fff; background: #C8102E; padding: 2px 8px; font-weight: 700;`, `${mono} font-size: 12px;`);
  console.log(EN ? `%cA company? Let us build it together  →  ${location.origin}/en.html#kontakt` : `%cFirma? Zbudujmy to razem  →  ${location.origin}/#kontakt`, `${mono} font-size: 11px; color: #777;`);
})();

// ---------------------------------------------------------------- sound: split-flap clacks, off until the visitor turns it on
// The boards live in iframes; they call ReunionSound.flips(n) here, so one AudioContext (unlocked by a click) serves them all.
const ReunionSound = (() => {
  let ctx = null, flaps = [], on = true, next = 0;
  function flapBuffer() {   // one flap: the leaf slaps the stop ("tak") and settles a few ms later ("k"); woody, no ringing tone
    const sr = ctx.sampleRate, len = Math.floor(sr * 0.04), b = ctx.createBuffer(1, len, sr), d = b.getChannelData(0);
    const body = 850 + Math.random() * 550, settle = 0.006 + Math.random() * 0.006;
    let lp = 0, peak = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr, t2 = t - settle;
      lp += 0.45 * ((Math.random() * 2 - 1) - lp);   // noise without the hiss on top
      let x = Math.exp(-t / 0.0022) * lp + 0.5 * Math.exp(-t / 0.005) * Math.sin(2 * Math.PI * body * t);
      if (t2 > 0) x += 0.4 * (Math.exp(-t2 / 0.0015) * lp + 0.4 * Math.exp(-t2 / 0.003) * Math.sin(2 * Math.PI * body * 1.3 * t2));
      d[i] = x; peak = Math.max(peak, Math.abs(x));
    }
    for (let i = 0; i < len; i++) d[i] /= peak;
    return b;
  }
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      flaps = Array.from({ length: 8 }, flapBuffer);
    }
    return ctx.state === "suspended" ? ctx.resume().catch(() => {}) : Promise.resolve();
  }
  function flap(at, gain) {
    const src = ctx.createBufferSource(); src.buffer = flaps[Math.floor(Math.random() * flaps.length)];
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const g = ctx.createGain(); g.gain.value = gain * (0.55 + Math.random() * 0.45);
    src.connect(g).connect(ctx.destination); src.start(at);
  }
  function bell(at, f, gain) {   // one gong tone: fundamental plus a bell-like partial, struck and left to ring
    [[f, 1], [f * 2.76, 0.18], [f * 2, 0.12]].forEach(([hz, k]) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = hz;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(gain * k, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);
      o.connect(g).connect(ctx.destination); o.start(at); o.stop(at + 1.7);
    });
  }
  return {
    get on() { return on; },
    get running() { return !!ctx && ctx.state === "running"; },
    ensure,
    unmute() {   // an explicit "sound on" (the speaker button) also plays through the iPhone's silent switch (Safari's Audio Session API)
      try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { /* older browsers: silent switch wins */ }
      return ensure();
    },
    chime() {   // the airport "ding-dong" before an announcement
      if (!ctx || ctx.state === "closed") return;
      const now = ctx.currentTime + 0.05;
      bell(now, 659.25, 0.22); bell(now + 0.42, 523.25, 0.22);
    },
    flips(n) {
      if (!on || !ctx || ctx.state !== "running" || document.hidden) return;
      // a busy board is a rattle of separate flaps at uneven gaps; even gaps (and a tone in every click) hum like a buzzer
      const now = ctx.currentTime, gap = n > 8 ? 0.02 : 0.04;
      for (let i = 0; i < Math.min(n, 3); i++) {
        const at = Math.max(now + Math.random() * 0.016, next);
        if (at > now + 0.06) break;
        flap(at, 0.2);
        next = at + gap * (0.6 + Math.random() * 1.6);
      }
    },
  };
})();
window.ReunionSound = ReunionSound;

// no button: the intro rattles from the first tap, click or key (browsers block audio before that; creating the context
// earlier only prints a warning in the console, right under our hello)
function soundOn() {
  ["pointerdown", "keydown", "touchstart"].forEach((ev) => addEventListener(ev, ReunionSound.ensure, { once: true, passive: true }));
}

// ---------------------------------------------------------------- 2. boards
function boardSize(cw, cols, rows) {
  return { w: Math.ceil(cw * (cols + (cols - 1) * 0.15 + 3)), h: Math.ceil(cw * (rows * 1.3 + (rows - 1) * 0.42 + 2.7)) + 30 };
}
function sizeBoards() {
  $$("iframe.board").forEach((f) => {
    const m = phone();
    const cols = +((m && f.dataset.colsM) || f.dataset.cols);
    const countdown = f.dataset.mode === "countdown";
    const lines = countdown ? null : (m && f.dataset.linesM) || f.dataset.lines;
    const rows = countdown ? 5 : lines.split("|").length;
    const room = Math.min(+(f.dataset.maxw || 9999), (f.parentElement.clientWidth || innerWidth) - 8);
    let cw = Math.max(8, Math.min(+(f.dataset.cw || 34), Math.floor(room / (cols + (cols - 1) * 0.15 + 3))));
    // agenda leaves room for the rest of its section; on phones (the CSS phone layout) the page scrolls, so the board fills the column and stays readable
    if (!countdown && innerWidth > 700) cw = Math.max(8, Math.min(cw, Math.floor(innerHeight * +(f.dataset.hfrac || 0.33) / (rows * 1.3 + (rows - 1) * 0.42 + 2.7))));
    // hero fits one screen on desktop; a phone board fills the column (Safari's toolbars left so little height that it shrank to the 8 px minimum)
    if (countdown && !m) cw = Math.max(8, Math.min(cw, Math.floor(((document.documentElement.classList.contains("shot") ? 900 : innerHeight) - 500) / (rows * 1.3 + (rows - 1) * 0.42 + 2.7))));
    const { w, h } = boardSize(cw, cols, rows);
    f.style.width = w + "px";
    f.style.height = h + "px";
    const q = new URLSearchParams({ embed: 1, font: "Big Shoulders Display", cw, cols });
    if (EN) q.set("lang", "en");
    if (countdown) q.set("mode", "countdown");
    else { q.set("reddigits", 1); q.set("lines", lines); if (reduce) q.set("t", 99999); else { q.set("play", 1); if (!f.dataset.played) q.set("wait", 1); } }
    const src = "board.html?" + q;
    if (f.dataset.src === src) return;
    f.dataset.src = src;
    if (countdown || f.dataset.seen) f.src = src;
    else if (!f.preload) {
      // agenda board: building 308 tiles is the heavy part, so it happens while nothing moves (idle after the intro)
      // or a screen early at the latest; the tiles start flipping only once the board is on screen
      let shown = false, ready = false;
      const go = () => { if (shown && ready) { f.dataset.played = 1; f.contentWindow.postMessage({ type: "reunion-play" }, "*"); } };   // a board plays once, extra calls are ignored
      f.preload = () => {
        if (f.dataset.seen) return;
        f.dataset.seen = 1; f.src = f.dataset.src;
        f.addEventListener("load", () => { ready = true; go(); });   // also after a resize reloads it
      };
      lazy(f, f.preload, 0, "100% 0px");
      lazy(f, () => { shown = true; go(); });
    }
  });
}

function lazy(el, fn, threshold = 0.35, rootMargin = "0px") {
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); fn(); } }, { threshold, rootMargin }).observe(el);
}

// git graph draws itself, the 48h ruler fills from the left
function drawOnView() {
  if (reduce) return;
  const git = $$(".git svg").find((g) => g.getClientRects().length);   // the wide graph on screens, the tall one on phones
  if (git) {
    const strokes = $$("path, line", git), dots = $$("circle, text", git);
    strokes.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    dots.forEach((d) => (d.style.opacity = 0));
    lazy(git, () => {
      strokes.forEach((p, i) => p.animate([{ strokeDashoffset: p.style.strokeDashoffset }, { strokeDashoffset: 0 }],
        { duration: 1200, delay: i * 120, easing: "cubic-bezier(.6,0,.2,1)", fill: "forwards" }));
      dots.forEach((d, i) => d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 700 + i * 40, fill: "forwards" }));
    });
  }
  const snake = $$(".snake").find((s) => s.getClientRects().length);   // the agenda road draws itself from Friday to the final (wide or tall one)
  if (snake) {
    const pen = $(".snake-pen", snake), L = pen.getTotalLength();
    pen.style.strokeDasharray = L; pen.style.strokeDashoffset = L;
    lazy(snake, () => pen.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 1400, easing: "linear", fill: "forwards" }), 0.25);   // linear: the day plates wipe in on its timing (styles.css --d/--t)
  }
  const ruler = $(".ruler svg");
  if (ruler) {
    const bars = $$("rect", ruler);
    bars.forEach((b) => { b.style.transformBox = "fill-box"; b.style.transformOrigin = "left"; b.style.transform = "scaleX(0)"; });
    lazy(ruler, () => bars.forEach((b, i) => b.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: 900, delay: i * 250, easing: "cubic-bezier(.6,0,.2,1)", fill: "forwards" })));
  }
}

// ---------------------------------------------------------------- 4. intro
function reveal(drop) {
  scrollTo({ top: 0, behavior: "instant" });
  document.body.classList.remove("pre");
  setTimeout(() => $$("iframe.board").forEach((f) => f.preload && (window.requestIdleCallback || setTimeout)(f.preload)), drop ? 2000 : 600);
  if (drop && !reduce) {
    const keys = [{ transform: "translateY(-110vh)" }, { transform: "translateY(12px)", offset: 0.78 }, { transform: "translateY(-4px)", offset: 0.9 }, { transform: "none" }];
    const hang = $("#hang");
    hang.animate(keys, { duration: 1100, easing: "cubic-bezier(.3,0,.2,1)" });
  }
}
const SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/>';   // Feather volume-x / volume-2 (MIT)
const SPEAKER_OFF = SPEAKER + '<path d="m23 9-6 6M17 9l6 6"/></svg>';
const SPEAKER_ON = SPEAKER + '<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
const SILENCE = "data:audio/wav;base64,UklGRiwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQgAAACAgICAgICAgA==";   // 8 silent samples
// back from another page of the site (the legal pages, the PL/EN switch, the browser's back button): straight to the page, no intro
function cameFromSite() {
  if (performance.getEntriesByType("navigation")[0]?.type === "back_forward") return true;
  try { return new URL(document.referrer).origin === location.origin; } catch (e) { return false; }   // no referrer: a fresh visit
}
function intro() {
  const frame = $("#intro");
  if (reduce || new URLSearchParams(location.search).has("skip") || cameFromSite()) { frame.remove(); reveal(false); return; }   // plays on a fresh visit and on reload
  let src = "board.html?handoff=1&font=Big%20Shoulders%20Display" + (EN ? "&lang=en" : "");
  if (phone()) {   // phones: the intro board gets the hero board's tiles, so it flies onto it like on desktop instead of fading into a different board
    const h = new URLSearchParams($("#heroBoard").dataset.src.split("?")[1]);
    src += `&cols=${h.get("cols")}&cw=${h.get("cw")}`;
  }
  frame.src = src;
  // the gong and the flaps play from the start wherever the browser allows sound on entry; everywhere else the board is
  // silent until a tap (no page may play audio before one). While it is silent a crossed-out speaker sits in the corner:
  // tapping it turns the sound on without skipping, and it goes. A tap anywhere else turns the sound on too and
  // fast-forwards the board, so the gong and a quick clatter still play (Jev 0.80).
  let chimed = false;
  const chime = () => { if (!chimed) { chimed = true; ReunionSound.chime(); } };
  const spk = document.createElement("button");
  spk.type = "button"; spk.className = "snd"; spk.setAttribute("aria-label", EN ? "Turn sound on" : "Włącz dźwięk"); spk.innerHTML = SPEAKER_OFF;
  spk.addEventListener("click", () => {   // chime inside the tap: iOS only unlocks audio for sounds started in the gesture
    ReunionSound.unmute(); chime();
    spk.innerHTML = SPEAKER_ON; spk.classList.add("on"); setTimeout(() => spk.remove(), 700);
  });
  const tap = () => { ReunionSound.ensure(); chime(); spk.remove(); };   // on click (the event every browser, iOS too, accepts to start audio); no stopPropagation: the board fast-forwards on the same click
  // sound on entry only where the browser allows it. Starting an AudioContext anyway logs an autoplay warning, so ask first:
  // Firefox answers directly; elsewhere a silent 1 ms clip either plays (allowed) or is refused without a console message.
  const mayPlay = navigator.getAutoplayPolicy ? Promise.resolve(navigator.getAutoplayPolicy("audiocontext") === "allowed")
    : new Audio(SILENCE).play().then(() => true, () => false);
  mayPlay.then((ok) => { if (ok && !chimed) ReunionSound.ensure().then(() => { if (frame.isConnected && ReunionSound.running) { chime(); spk.remove(); } }); });
  setTimeout(() => { if (frame.isConnected && !ReunionSound.running && !chimed) document.body.append(spk); }, 150);
  const land = (e) => {
    if (!e.data || e.data.type !== "reunion-board-ready") return;
    removeEventListener("message", land);
    frame.contentWindow.postMessage({ type: "reunion-land" }, "*");
    const hb = $("#heroBoard").getBoundingClientRect(), from = e.data.rect;
    const done = () => { frame.remove(); spk.remove(); reveal(true); };
    const to = { left: hb.left, top: hb.top + 15, width: hb.width };
    const k = to.width / from.width, tx = to.left - from.left * k, ty = to.top - from.top * k;
    frame.animate([{ transform: "none" }, { transform: `translate(${tx}px, ${ty}px) scale(${k})` }],
                  { duration: 900, easing: "cubic-bezier(.65,0,.25,1)", fill: "forwards" }).onfinish = () => setTimeout(done, 60);
  };
  addEventListener("message", land);
  // click or key skips to the end
  const skip = () => { frame.remove(); spk.remove(); reveal(true); removeEventListener("message", land); };
  frame.addEventListener("load", () => { try { frame.contentWindow.addEventListener("keydown", skip, { once: true }); frame.contentWindow.addEventListener("click", tap, { capture: true, once: true }); } catch (e) { /* cross-origin */ } });
  addEventListener("keydown", skip, { once: true });
}

// ---------------------------------------------------------------- 5. extras
function plane(on) {  // Hilscher-style plane (fly by LOT, 1962): stripes with slanted ends, nose to the left
  const P = on === "red" ? { a: "#fff", b: "#8E0B20", c: "#141210", d: "#F1C9CE" } : { a: "#D9D0C3", b: "#C8102E", c: "#141210", d: "#9C968D" };
  const rows = [[110, 8, [[150, 640, "a"]]], [118, 7, [[92, 330, "b"], [352, 600, "a"], [622, 700, "b"]]],
    [125, 8, [[52, 262, "c"], [282, 522, "a"], [544, 762, "c"]]], [133, 8, [[34, 402, "a"], [422, 562, "b"], [582, 724, "d"]]],
    [141, 8, [[40, 202, "b"], [222, 642, "a"], [664, 744, "c"]]], [149, 8, [[72, 462, "d"], [482, 702, "c"]]]];
  const k = 14;
  const bars = rows.flatMap(([y, h, segs]) => segs.map(([a, b, c]) => `<path d="M${a + k} ${y}H${b + k}L${b} ${y + h}H${a}Z" fill="${P[c]}"/>`)).join("");
  return `<svg viewBox="0 0 800 200" aria-hidden="true"><path d="M330 150H520L470 184H290Z" fill="${P.c}"/>
    <path d="M610 112L702 22H764L742 112Z" fill="#141210"/><clipPath id="fin-${on}"><path d="M610 112L702 22H764L742 112Z"/></clipPath>
    <g clip-path="url(#fin-${on})"><rect x="600" y="62" width="180" height="11" fill="#fff"/><rect x="600" y="73" width="180" height="11" fill="#C8102E"/></g>
    <circle cx="728" cy="42" r="13" fill="#fff"/><path d="M724.6 31.6a10.4 10.4 0 0 0 .8 20.7" fill="none" stroke="#141210" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M730.2 50.9a10.4 10.4 0 0 0-.4-18.9" fill="none" stroke="#C8102E" stroke-width="2.2" stroke-linecap="round"/><circle cx="729" cy="42" r="2.2" fill="#C8102E"/>${bars}</svg>`;
}

function terminal() {  // types the command once the section is on screen, then asks
  const cmd = $("#cmd"); if (!cmd) return;
  const text = EN ? "reunion apply --edition 01" : "reunion apply --edycja 01", ask = $("#ask"), c1 = $("#c1");
  const done = () => { c1.style.display = "none"; ask.hidden = false; };
  if (reduce) { cmd.textContent = text; done(); return; }
  // reserve the finished terminal's height: typing and the question line must not push the page down mid-scroll (menu links would land short)
  const term = $("#term"), fit = () => {
    const was = [cmd.textContent, ask.hidden];
    term.style.minHeight = ""; cmd.textContent = text; ask.hidden = false;
    term.style.minHeight = term.offsetHeight + "px";
    [cmd.textContent, ask.hidden] = was;
  };
  fit(); addEventListener("resize", fit); document.fonts.ready.then(fit);
  new IntersectionObserver((es, o) => {
    if (!es[0].isIntersecting) return;
    o.disconnect();
    let i = 0;
    const tick = () => { cmd.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(tick, 70 + Math.random() * 60); else setTimeout(done, 400); };
    setTimeout(tick, 500);
  }, { threshold: 0.4 }).observe($("#term"));
  const big = $(".big100"), go = $("#go");
  go.addEventListener("mouseenter", () => (big.style.transform = "rotate(-4deg) scale(1.06)"));
  go.addEventListener("mouseleave", () => (big.style.transform = ""));
}

// endless CSS animations (the carets, the logo strip) pause while they are off screen, so a page left open costs no CPU
function pauseOffscreen() {
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("paused", !e.isIntersecting)));
  $$(".caret, .cursor, .unis-track").forEach((el) => io.observe(el));
}

function stickyBar() {
  const bar = $("#bar");
  // the bar's height drives where a menu link lands a section and how tall a section is (styles.css --barh)
  const barH = () => document.documentElement.style.setProperty("--barh", bar.offsetHeight + "px");
  barH(); addEventListener("resize", barH); document.fonts.ready.then(barH);
  new IntersectionObserver(([e]) => { bar.classList.toggle("on", !e.isIntersecting); bar.setAttribute("aria-hidden", e.isIntersecting); })
    .observe($(".hero-bottom"));
}

function faq() {
  const box = $(".qa"); if (!box) return;
  $$("details", box).forEach((d, i) => {
    d.classList.add("faq-row"); d.style.animationDelay = i * 60 + "ms";
    const sum = $("summary", d), ans = $(".a", d);
    sum.addEventListener("click", (e) => {
      if (reduce) return;
      e.preventDefault();
      const opening = !d.open;
      if (opening) d.open = true;
      const h = ans.scrollHeight;
      const a = ans.animate([{ height: opening ? "0px" : h + "px", opacity: opening ? 0 : 1 }, { height: opening ? h + "px" : "0px", opacity: opening ? 1 : 0 }],
                            { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
      if (!opening) a.onfinish = () => (d.open = false);
    });
  });
  if (!reduce) { box.style.visibility = "hidden"; lazy(box, () => { box.style.visibility = ""; box.classList.add("faq-in"); }, 0.2); }
}

// ---------------------------------------------------------------- run
$$(".plane-slot").forEach((el) => (el.innerHTML = plane(el.dataset.on)));
sizeBoards();
terminal();
stickyBar();
pauseOffscreen();
soundOn();
drawOnView();
// card 03 steps and the agenda day plates come in when they reach the screen (the plates follow the road: styles.css --d / --t)
if (!reduce) {
  [".days", ".benefits"].forEach((sel) => { const el = $(sel); if (el) { el.classList.add("pre-in"); lazy(el, () => el.classList.add("in"), 0.25); } });
}
faq();
document.fonts.ready.then(intro);
let resizeTimer, lastW = innerWidth;
addEventListener("resize", () => {
  if (phone() && innerWidth === lastW) return;   // iOS toolbars sliding in and out: resizing would reload the boards and replay the agenda
  lastW = innerWidth;
  clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { sizeBoards(); }, 150);
});
// ?measure: report which sections are taller than the screen (dev check, prints into <body data-fit>)
if (new URLSearchParams(location.search).has("measure")) setTimeout(() => {
  document.body.dataset.fit = $$("section.sec, header.hero").map((s) => `${s.id}:${Math.round(s.getBoundingClientRect().height)}`).join(" ");
}, 2500);
// ?solo=<section id>: show only that section (dev screenshots)
{ const id = new URLSearchParams(location.search).get("solo");
  if (id) { const st = document.createElement("style"); st.textContent = `body > *:not(main), main > *:not(#${id}), .bar { display: none !important; }`; document.head.appendChild(st); } }
