/* Shared pieces for the print proposals (poster, roll-up, T-shirt): extruded REUNION block, the hero globe grid
   with arcs from the 7 countries into Warsaw, and a still split-flap board from ../board.html. */
const Print = (() => {
  const extrude = (side, edge, shadow, n, k = 1) => {
    const l = [];
    for (let i = 1; i <= n; i++) l.push(`${(i * 0.55 * k).toFixed(2)}px ${(i * k).toFixed(2)}px 0 ${i === n ? edge : side}`);
    l.push(shadow);
    return l.join(",");
  };
  const block = (el, px, n = 26) => { el.style.fontSize = px + "px"; el.style.textShadow = extrude("#EBC9CC", "#6d0613", `${(px * .06).toFixed(0)}px ${(px * .11).toFixed(0)}px 0 rgba(20,16,10,.12)`, n, px / 150); };
  const blockRed = (el, px, n = 18) => { el.style.fontSize = px + "px"; el.style.textShadow = extrude("#EBC9CC", "#8a1020", "none", n, px / 150).replace(",none", ""); };

  // orthographic projection on the hero grid (r = 190 around 200,200), tilted so Europe sits on the dome
  let LON0 = 12, LAT0 = 5;
  const R = 190, rad = Math.PI / 180;
  const proj = (lat, lng) => {
    const x = R * Math.cos(lat * rad) * Math.sin((lng - LON0) * rad);
    const y = R * (Math.cos(LAT0 * rad) * Math.sin(lat * rad) - Math.sin(LAT0 * rad) * Math.cos(lat * rad) * Math.cos((lng - LON0) * rad));
    return [200 + x, 200 - y];
  };
  const CITIES = [["SZWECJA", 470, 59.33, 18.07], ["DANIA", 1400, 55.68, 12.57], ["WIELKA BRYTANIA", 2365, 51.51, -0.13], ["NIDERLANDY", 5960, 52.37, 4.9],
    ["SZWAJCARIA", 550, 47.37, 8.54], ["WŁOCHY", 980, 45.46, 9.19], ["HISZPANIA", 590, 40.42, -3.7]];
  // a flying great tit (sikorka), facing right, beak tip near (89, 25); drawn around its centre
  const TIT = (wingUp) => `<g transform="translate(-50 -30)">
    <path d="M30 31 L6 24 L9 31 L4 38 L30 36 Z" fill="#141210"/>
    <path d="M28 33 C30 20 52 17 68 22 C78 25 80 38 70 43 C56 49 34 46 28 33 Z" fill="#fff"/>
    <path d="M66 33 C62 38 56 43 47 45" fill="none" stroke="#141210" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="72" cy="25" r="11.5" fill="#141210"/><ellipse cx="74.5" cy="28.5" rx="6.4" ry="4.6" fill="#fff"/><circle cx="77" cy="21.5" r="1.6" fill="#fff"/>
    <path d="M83 22.5 L91 25 L83 27.5 Z" fill="#141210"/>
    ${wingUp ? '<path d="M40 27 C34 12 36 0 44 -6 C50 4 58 16 60 26 Z" fill="#EBC9CC" stroke="#141210" stroke-width="1.6"/><path d="M44 2 L50 22 M40 12 L47 25" stroke="#141210" stroke-width="1.2"/>'
             : '<path d="M40 34 C36 48 40 60 48 64 C52 54 58 44 60 36 Z" fill="#EBC9CC" stroke="#141210" stroke-width="1.6"/><path d="M45 58 L50 40 M41 48 L47 37" stroke="#141210" stroke-width="1.2"/>'}</g>`;
  // a swallow seen from below, nose to the right, like the one on Trepkowski's "Wracajcie"
  const SWALLOW = "M72 0 C70 -6 63 -10 55 -10 C49 -10 45 -8 39 -9 C44 -30 30 -62 -24 -90 C-8 -64 3 -36 10 -11 C0 -8 -14 -6 -24 -5 L-100 -30 L-44 0 L-100 26 L-24 5 C-14 6 0 8 10 11 C3 30 -6 52 -18 74 C26 54 42 28 39 9 C45 8 49 10 55 10 C63 10 70 6 72 0 Z";
  const swallow = (x, y, angle, s, fill = "#fff") => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${s})"><path d="${SWALLOW}" fill="${fill}"/></g>`;
  const tit = (x, y, angle, s, wingUp) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${s})">${TIT(wingUp)}</g>`;
  function globe({ stroke = "#fff", width = 7, arcs = true, labels = false, op = 1, arcColor = "#fff", labelColor = "#fff", lon0 = 12, lat0 = 5, birds = null, full = false } = {}) {
    LON0 = lon0; LAT0 = lat0;
    const WAW = proj(52.23, 21.01);
    let g = `<g fill="none" stroke="${stroke}" stroke-width="${width}" opacity="${op}"><circle cx="200" cy="200" r="190"/><ellipse cx="200" cy="200" rx="60" ry="190"/><ellipse cx="200" cy="200" rx="125" ry="190"/><path d="M200 10v380M10 200h380"/><ellipse cx="200" cy="200" rx="190" ry="60"/><ellipse cx="200" cy="200" rx="190" ry="125"/></g>`;
    const birdsOut = [];
    if (arcs) {
      CITIES.forEach(([name, n, lat, lng]) => {
        const [x, y] = proj(lat, lng), mx = (x + WAW[0]) / 2, my = Math.min(y, WAW[1]) - Math.hypot(WAW[0] - x, WAW[1] - y) * 0.45;
        g += `<path d="M${x} ${y} Q${mx} ${my} ${WAW[0]} ${WAW[1]}" fill="none" stroke="${arcColor}" stroke-width="1.6" stroke-linecap="round" ${birds ? 'stroke-dasharray="3 4" opacity=".8"' : ""}/><circle cx="${x}" cy="${y}" r="2.6" fill="${arcColor}"/>`;
        if (birds) {
          const i = CITIES.findIndex((c) => c[0] === name), t = birds.t[i % birds.t.length], u = 1 - t;
          const bx = u * u * x + 2 * u * t * mx + t * t * WAW[0], by = u * u * y + 2 * u * t * my + t * t * WAW[1];
          const dx = 2 * u * (mx - x) + 2 * t * (WAW[0] - mx), dy = 2 * u * (my - y) + 2 * t * (WAW[1] - my);
          birdsOut.push(tit(bx, by, Math.atan2(dy, dx) / rad * 0.7, birds.s[i % birds.s.length], i % 2 === 0));
        }
        if (labels) g += `<text x="${x - 5}" y="${y + 1.5}" text-anchor="end" font-family="IBM Plex Mono" font-size="5.2" letter-spacing=".4" fill="${labelColor}">${name} · ${String(n).replace(/\B(?=(\d{3})+$)/g, " ")}</text>`;
      });
      g += `<circle cx="${WAW[0]}" cy="${WAW[1]}" r="9" fill="none" stroke="${arcColor}" stroke-width="1.4" opacity=".6"/><circle cx="${WAW[0]}" cy="${WAW[1]}" r="4.4" fill="${arcColor}"/>`;
      if (labels) g += `<text x="${WAW[0] + 12}" y="${WAW[1] + 2}" font-family="IBM Plex Mono" font-weight="600" font-size="6.4" letter-spacing=".5" fill="${labelColor}">WAW · WARSZAWA</text>`;
    }
    return `<svg viewBox="0 0 400 400" aria-hidden="true">${g}${birdsOut.join("")}</svg>`;
  }

  // still split-flap board (static lines, red digits) sized exactly like the site does it
  function board(el, lines, cw, cols) {
    const rows = lines.length, center = (s) => (" ".repeat(Math.max(0, Math.floor((cols - s.length) / 2))) + s);
    const q = new URLSearchParams({ embed: 1, font: "Big Shoulders Display", cw, cols, reddigits: 1, t: 99999, lines: lines.map(center).join("|") });
    el.src = "../board.html?" + q;
    el.style.width = Math.ceil(cw * (cols + (cols - 1) * 0.15 + 3)) + "px";
    el.style.height = Math.ceil(cw * (rows * 1.3 + (rows - 1) * 0.42 + 2.7)) + 30 + "px";
  }
  return { block, blockRed, globe, board, tit, swallow, CITIES };
})();

// brand marks for the print kit: the Reunion mark (two arcs and a dot, as the favicon) and the GPSS planet
Print.mark = (a = "#fff", b = a) => `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M21.59 2.01 A22.13 22.13 0 0 0 23.40 46.12" fill="none" stroke="${a}" stroke-width="3.75" stroke-linecap="round"/><path d="M33.58 43.94 A22.13 22.13 0 0 0 32.84 3.72" fill="none" stroke="${b}" stroke-width="3.75" stroke-linecap="round"/><circle cx="27.72" cy="24" r="4.39" fill="${b}"/></svg>`;
Print.gpss = (tone = "white") => `<img src="../assets/logos/gpss-planet-${tone}.png" alt="Global Polish Student Society">`;
