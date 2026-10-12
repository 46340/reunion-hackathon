/* Section 02 globe, in the spirit of Cloudflare's network globe, in Reunion style: a dome of square dots on paper,
   faint graticule, the 7 countries in red-pink, Poland in red, split-flap tiles as city markers, thin arcs into Warsaw
   and a swallow (Trepkowski) flying each arc home. Three.js r128 + world-atlas TopoJSON, loaded after the page.
   Renders only while the section is on screen. */
(() => {
  const box = document.getElementById("globe3d");
  if (!box) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 760px)").matches;   // phones: fewer pixels, no MSAA, 30 fps
  const DPR = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);
  const WAW = { code: "WAW", lat: 52.23, lng: 21.01, dx: 30, dy: -12 };
  const CITIES = [
    // dx, dy: where the tile sits relative to the city dot (px), so neighbours never overlap
    { code: "ARN", lat: 59.33, lng: 18.07, dx: 0, dy: -14 }, { code: "CPH", lat: 55.68, lng: 12.57, dx: -22, dy: -10 }, { code: "LHR", lat: 51.51, lng: -0.13, dx: -26, dy: 0 }, { code: "AMS", lat: 52.37, lng: 4.9, dx: 0, dy: -14 },
    { code: "ZRH", lat: 47.37, lng: 8.54, dx: -26, dy: 0 }, { code: "MXP", lat: 45.46, lng: 9.19, dx: 26, dy: 6 }, { code: "MAD", lat: 40.42, lng: -3.7, dx: -26, dy: 0 },
  ];
  const SEVEN = new Set(["752", "208", "826", "528", "756", "380", "724"]);   // SE DK GB NL CH IT ES (ISO numeric)
  const PL = "616";
  const SWALLOW = "M72 0 C70 -6 63 -10 55 -10 C49 -10 45 -8 39 -9 C44 -30 30 -62 -24 -90 C-8 -64 3 -36 10 -11 C0 -8 -14 -6 -24 -5 L-100 -30 L-44 0 L-100 26 L-24 5 C-14 6 0 8 10 11 C3 30 -6 52 -18 74 C26 54 42 28 39 9 C45 8 49 10 55 10 C63 10 70 6 72 0 Z";

  const load = (src) => new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const v3 = (lat, lng, r) => {
    const phi = ((90 - lat) * Math.PI) / 180, th = ((lng + 180) * Math.PI) / 180;
    return new THREE.Vector3(-(r * Math.sin(phi) * Math.cos(th)), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
  };

  // land mask: equirectangular canvas, red channel encodes the group (255 Poland, 128 the seven, 40 other land)
  function mask(countries) {
    const w = 2048, h = 1024, cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d");
    const P = ([lng, lat]) => [((lng + 180) / 360) * w, ((90 - lat) / 180) * h];
    countries.features.forEach((f) => {
      const g = f.geometry; if (!g || f.id === "010") return;
      const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
      ctx.fillStyle = f.id === PL ? "rgb(255,0,0)" : SEVEN.has(f.id) ? "rgb(128,0,0)" : "rgb(40,0,0)";
      polys.forEach((poly) => {
        ctx.beginPath();
        poly.forEach((ring) => {   // unwrap rings that cross the antimeridian so they do not smear across the map
          let off = 0, prev = ring[0][0];
          ring.forEach(([lng, lat], i) => { if (lng - prev > 180) off -= 360; else if (lng - prev < -180) off += 360; prev = lng; const p = P([lng + off, lat]); i ? ctx.lineTo(...p) : ctx.moveTo(...p); });
        });
        ctx.fill("evenodd");
      });
    });
    const data = ctx.getImageData(0, 0, w, h).data;
    return (lat, lng) => { const x = Math.min(w - 1, Math.floor(((lng + 180) / 360) * w)), y = Math.min(h - 1, Math.floor(((90 - lat) / 180) * h)); return data[(y * w + x) * 4]; };
  }

  // square dots on a Fibonacci sphere, coloured by the mask; dots fade towards the limb like on Cloudflare's globe
  function dots(sample) {
    const N = 110000, pos = [], col = [], alp = [], siz = [], ga = Math.PI * (3 - Math.sqrt(5));
    const ink = [0.08, 0.07, 0.06], pink = [0.86, 0.36, 0.43], red = [0.78, 0.06, 0.18];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = ga * i, x = Math.cos(t) * r, z = Math.sin(t) * r;
      const lat = 90 - (Math.acos(y) * 180) / Math.PI, lng = (Math.atan2(z, -x) * 180) / Math.PI - 180;
      const g = sample(lat, lng < -180 ? lng + 360 : lng);
      if (g < 20) continue;
      pos.push(x, y, z);
      if (g > 200) { col.push(...red); alp.push(1); siz.push(2.3); }
      else if (g > 100) { col.push(...pink); alp.push(0.85); siz.push(2); }
      else { col.push(...ink); alp.push(0.62); siz.push(2); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    geo.setAttribute("alpha", new THREE.Float32BufferAttribute(alp, 1));
    geo.setAttribute("size", new THREE.Float32BufferAttribute(siz, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { dpr: { value: DPR }, k: { value: 1 } },
      vertexShader: `attribute vec3 color; attribute float alpha; attribute float size; uniform float dpr; uniform float k; varying vec3 vC; varying float vA;
        void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * position);
          float facing = dot(n, normalize(-mv.xyz)); vC = color; vA = alpha * smoothstep(0.0, 0.42, facing);
          gl_PointSize = size * k * dpr * (0.55 + 0.45 * smoothstep(0.0, 0.6, facing)); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec3 vC; varying float vA; void main() { if (vA < 0.02) discard; gl_FragColor = vec4(vC, vA); }`,
      transparent: true, depthWrite: false,
    });
    return new THREE.Points(geo, mat);
  }

  function graticule() {
    const pts = [], add = (a, b) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    for (let lat = -75; lat <= 75; lat += 15) for (let lng = -180; lng < 180; lng += 3) add(v3(lat, lng, 1.002), v3(lat, lng + 3, 1.002));
    for (let lng = -180; lng < 180; lng += 15) for (let lat = -87; lat < 87; lat += 3) add(v3(lat, lng, 1.002), v3(lat + 3, lng, 1.002));
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x141210, transparent: true, opacity: 0.06 }));
  }

  function arc(a, b) {   // great-circle-ish arc lifted above the surface
    const s = v3(a.lat, a.lng, 1), e = v3(b.lat, b.lng, 1), ang = s.angleTo(e), pts = [];
    for (let i = 0; i <= 64; i++) { const t = i / 64, p = s.clone().lerp(e, t); p.normalize().multiplyScalar(1 + Math.sin(t * Math.PI) * (0.02 + ang * 0.35)); pts.push(p); }
    return pts;
  }

  async function start() {
    await load("assets/vendor/three.min.js");
    await load("assets/vendor/topojson-client.min.js");
    const topo = await fetch("assets/vendor/countries-110m.json").then((r) => r.json());
    const sample = mask(topojson.feature(topo, topo.objects.countries));

    let bw = box.clientWidth, bh = box.clientHeight;   // read once (and on resize), not ~20 times a frame inside screen()
    const W = () => bw, H = () => bh;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, W() / H(), 0.1, 100);
    let scaleK = 1;   // dots and tiles shrink with the globe on small screens
    const fit = () => {   // dome: the sphere sits low, its lower part is cut by the frame line; portrait screens crop the sides too
      const v = Math.tan((camera.fov * Math.PI) / 360), half = camera.aspect >= 1 ? Math.max(0.6, 0.86 / camera.aspect) : 0.68 / camera.aspect;
      camera.position.set(0, 0, half / v);
      scaleK = Math.min(1, Math.max(0.5, H() / (2 * half) / 720));
    };
    fit();
    const renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true });
    renderer.setPixelRatio(DPR);
    renderer.setSize(W(), H());
    box.appendChild(renderer.domElement);

    const globe = new THREE.Group(); globe.position.y = -0.17; scene.add(globe);
    const occluder = new THREE.Mesh(new THREE.SphereGeometry(0.996, 48, 48), new THREE.MeshBasicMaterial({ color: 0xe8e0d3 }));
    occluder.renderOrder = -1; globe.add(occluder);
    globe.add(graticule());
    const points = dots(sample); globe.add(points);
    const applyK = () => { points.material.uniforms.k.value = scaleK; box.style.setProperty("--gk", scaleK.toFixed(2)); };
    applyK();
    const face = (lat, lng) => { const p = v3(lat, lng, 1); return { y: Math.atan2(-p.x, p.z), x: Math.atan2(p.y, Math.hypot(p.x, p.z)) }; };
    const base = face(30, 12); globe.rotation.order = "XYZ"; globe.rotation.y = base.y; globe.rotation.x = base.x;

    const red = new THREE.Color("#C8102E");
    const routes = CITIES.map((c, i) => {
      const pts = arc(c, WAW);
      globe.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.0013, 6, false), new THREE.MeshBasicMaterial({ color: red, transparent: true, opacity: 0.45 })));
      return { c, pts, delay: i * 1.6, dur: 3.6 + (i % 3) * 0.4 };
    });

    // HTML overlay: split-flap tiles for the cities and one swallow per route
    const layer = document.createElement("div"); layer.className = "g-layer"; box.appendChild(layer);
    const tile = (code, cls = "") => { const d = document.createElement("span"); d.className = "g-tile " + cls; d.textContent = code; layer.appendChild(d); return d; };
    const dot = () => { const d = document.createElement("i"); d.className = "g-dot"; layer.appendChild(d); return d; };
    const marks = [...CITIES.map((c) => ({ c, el: tile(c.code), d: dot() })), { c: WAW, el: tile("WAW", "waw"), d: dot() }];
    const wawEl = marks[marks.length - 1].el;
    routes.forEach((r) => {
      r.el = document.createElement("span"); r.el.className = "g-bird";
      r.el.innerHTML = `<svg viewBox="-110 -100 190 180" aria-hidden="true"><path d="${SWALLOW}"/></svg>`;
      layer.appendChild(r.el);
    });

    const tmp = new THREE.Vector3(), camDir = new THREE.Vector3();
    const screen = (local) => {   // local point on the globe -> [x, y, facing]
      tmp.copy(local).applyMatrix4(globe.matrixWorld);
      camDir.copy(camera.position).sub(tmp).normalize();
      const n = tmp.clone().sub(globe.position).normalize(), facing = n.dot(camDir);
      tmp.project(camera);
      return [(tmp.x * 0.5 + 0.5) * W(), (-tmp.y * 0.5 + 0.5) * H(), facing];
    };

    let drag = null, off = { x: 0, y: 0 };
    box.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y }; box.setPointerCapture(e.pointerId); });
    box.addEventListener("pointermove", (e) => { if (drag) { off.y = drag.ox + (e.clientX - drag.x) * 0.005; off.x = Math.max(-0.4, Math.min(0.4, drag.oy + (e.clientY - drag.y) * 0.003)); } });
    box.addEventListener("pointerup", () => (drag = null));

    let visible = false, raf = 0, t0 = performance.now(), landed = 0, scrolled = 0, drawn = 0;
    // the globe turns slowly, so 30 fps looks the same as 60 or 120 and costs a half or a quarter; while the page scrolls it keeps
    // turning but draws less often (15 fps phones, 20 fps desktop), so scrolling stays smooth and the globe never looks stuck
    addEventListener("scroll", () => (scrolled = performance.now()), { passive: true });
    const frame = (now) => {
      const gap = now - scrolled < 200 ? (small ? 66 : 50) : 31;
      if (visible && !reduce && !drag && now - drawn < gap) { raf = requestAnimationFrame(frame); return; }
      drawn = now;
      const t = (now - t0) / 1000;
      if (!drag) { off.x *= 0.95; off.y *= 0.95; }
      globe.rotation.y = base.y + off.y + (reduce ? 0 : Math.sin(t * 0.18) * 0.12);
      globe.rotation.x = base.x + off.x;
      globe.updateMatrixWorld();
      marks.forEach(({ c, el, d }) => {
        const [x, y, f] = screen(v3(c.lat, c.lng, 1.01)), o = f > 0.15 ? 1 : 0;
        el.style.transform = `translate(${(x + c.dx * scaleK).toFixed(1)}px, ${(y + c.dy * scaleK).toFixed(1)}px) translate(-50%, -50%)`;
        d.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
        el.style.opacity = d.style.opacity = o;
      });
      routes.forEach((r) => {
        if (reduce) { r.el.style.opacity = 0; return; }
        const cycle = r.dur + 7.5, k = ((t - r.delay) % cycle + cycle) % cycle / r.dur;
        if (t < r.delay || k > 1) { r.el.style.opacity = 0; return; }
        const i = Math.min(63, Math.floor(k * 64)), [x, y, f] = screen(r.pts[i]), [x2, y2] = screen(r.pts[i + 1]);
        const a = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI, s = 0.85 + Math.sin(k * Math.PI) * 0.15;
        r.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%) rotate(${a.toFixed(0)}deg) scale(${s.toFixed(2)})`;
        r.el.style.opacity = f > 0.1 ? Math.min(1, Math.sin(k * Math.PI) * 3) : 0;
        if (k > 0.97 && now - landed > 500) { landed = now; wawEl.classList.remove("land"); void wawEl.offsetWidth; wawEl.classList.add("land"); }
      });
      renderer.render(scene, camera);
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) raf = requestAnimationFrame(frame); }).observe(box);
    addEventListener("resize", () => { bw = box.clientWidth; bh = box.clientHeight; renderer.setSize(W(), H()); camera.aspect = W() / H(); fit(); applyK(); camera.updateProjectionMatrix(); frame(performance.now()); });
    frame(performance.now());
  }
  // load right after the page (local files, ~600 kB), so the globe is ready before anyone scrolls to it
  const go = () => start().catch((e) => { console.error("[globe]", e); box.classList.add("globe-failed"); });
  if (document.readyState === "complete") setTimeout(go, 300); else addEventListener("load", () => setTimeout(go, 300), { once: true });
})();
