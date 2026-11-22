/* Cookie consent + Google tag (GA4 / Google Ads), Consent Mode v2 in advanced mode:
   the Google tag always loads (so Google can detect it) with all storage denied, i.e. no cookies and only cookieless pings;
   cookies start only after "Akceptuję" (privacy policy § 8).
   The choice is kept in localStorage; "Ustawienia cookies" in the footer reopens the banner. */
(() => {
  const KEY = "rh-consent";
  const en = document.documentElement.lang === "en";
  const T = en
    ? { text: "We use Google Analytics and Google Ads cookies to measure visits and ads, only if you agree.", more: "Privacy policy", yes: "Accept", no: "Reject", settings: "Cookie settings" }
    : { text: "Używamy plików cookies Google Analytics i Google Ads do mierzenia odwiedzin i reklam, tylko za Twoją zgodą.", more: "Polityka prywatności", yes: "Akceptuję", no: "Odrzucam", settings: "Ustawienia cookies" };

  const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch { /* private mode: ask again next visit */ } };

  // The Google tag itself and the consent defaults sit inline in each page's <head>.
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  const setConsent = (v) => gtag("consent", "update", { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v });
  const grant = () => setConsent("granted");
  const dropGoogleCookies = () => {
    document.cookie.split(";").map((c) => c.split("=")[0].trim()).filter((n) => /^(_ga|_gid|_gcl)/.test(n)).forEach((n) => {
      for (const d of ["", "; domain=" + location.hostname, "; domain=." + location.hostname.replace(/^www\./, "")])
        document.cookie = n + "=; max-age=0; path=/" + d;
    });
  };

  const css = document.createElement("style");
  css.textContent = `
    .rh-consent { position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 60; max-width: 420px;
      background: #FBF9F5; color: #141210; border-top: 4px solid #C8102E; padding: 20px 24px 24px;
      font: 400 15px/1.5 "Barlow", system-ui, sans-serif; box-shadow: 0 12px 32px rgba(20,18,16,.28); }
    .rh-consent .lbl { margin: 0 0 8px; font: 500 12px/1.4 "IBM Plex Mono", ui-monospace, monospace; letter-spacing: .22em; text-transform: uppercase; color: #C8102E; }
    .rh-consent p { margin: 0 0 16px; }
    .rh-consent a { color: #141210; text-decoration: underline; text-underline-offset: 3px; }
    .rh-consent .row { display: flex; gap: 8px; }
    .rh-consent button { flex: 1; min-height: 48px; padding: 0 16px; cursor: pointer; border: 1px solid #141210; background: transparent; color: #141210;
      font: 600 13px "IBM Plex Mono", ui-monospace, monospace; letter-spacing: .14em; text-transform: uppercase; }
    .rh-consent button.yes { background: #C8102E; border-color: #C8102E; color: #fff; }
    .rh-consent button:hover { filter: brightness(.92); }
    .rh-consent button:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
    @media (min-width: 701px) { .rh-consent { left: 24px; right: auto; bottom: 24px; } }`;
  document.head.append(css);

  let box = null;
  const choose = (v) => {
    save(v);
    if (v === "granted") grant();
    else { setConsent("denied"); dropGoogleCookies(); }
    box?.remove(); box = null;
  };
  const show = () => {
    if (box) return;
    box = document.createElement("div");
    box.className = "rh-consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", T.settings);
    box.innerHTML = `<p class="lbl">Cookies</p><p>${T.text} <a href="/polityka-prywatnosci.html#par-8">${T.more}</a></p>
      <div class="row"><button type="button" class="yes">${T.yes}</button><button type="button" class="no">${T.no}</button></div>`;
    box.querySelector(".yes").onclick = () => choose("granted");
    box.querySelector(".no").onclick = () => choose("denied");
    document.body.append(box);
  };

  const footer = document.querySelector("footer");
  if (footer) {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = T.settings;
    a.onclick = (e) => { e.preventDefault(); show(); };
    const policy = footer.querySelector('a[href*="polityka-prywatnosci"]');
    (policy ? policy.parentElement : footer).append(a);
  }

  // Conversion events for GA4 key events -> Google Ads conversions (sent cookieless until consent).
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    if (a.href.startsWith("mailto:")) gtag("event", "generate_lead", { method: "email", link_url: a.href.split("?")[0] });
    else if (/^\s*(Aplikuj|Apply)/i.test(a.textContent)) gtag("event", "apply_click", { link_url: a.href });
  });
  // sign_up (the main Google Ads conversion) is sent by aplikuj.html only after the server accepted the application.
  // First-touch attribution for that form: UTM tags, Google Ads click id, landing page, referrer; this tab only.
  try {
    if (!sessionStorage.getItem("rh-attr")) {
      const q = new URLSearchParams(location.search), attr = {};
      for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid"]) if (q.get(k)) attr[k] = q.get(k).slice(0, 300);
      attr.landing = location.pathname.slice(0, 300);
      if (document.referrer && !document.referrer.startsWith(location.origin)) attr.referrer = document.referrer.slice(0, 300);
      sessionStorage.setItem("rh-attr", JSON.stringify(attr));
    }
  } catch { /* storage blocked: the form sends no attribution */ }

  const v = read();
  if (v === "granted") grant();
  else if (v !== "denied") show();
})();
