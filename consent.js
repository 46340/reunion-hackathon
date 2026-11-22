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
    .rh-consent { position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 60; max-width: 560px; margin-inline: auto;
      background: #141210; color: #fff; border: 1px solid rgba(255,255,255,.18); padding: 16px 20px;
      font: 400 15px/1.5 "Barlow", system-ui, sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,.3); }
    .rh-consent p { margin: 0 0 12px; }
    .rh-consent a { color: #fff; text-decoration: underline; }
    .rh-consent .row { display: flex; gap: 8px; flex-wrap: wrap; }
    .rh-consent button { min-height: 44px; padding: 0 20px; font: 600 15px "Barlow", system-ui, sans-serif; cursor: pointer;
      border: 1px solid #fff; background: transparent; color: #fff; }
    .rh-consent button.yes { background: #C8102E; border-color: #C8102E; }
    .rh-consent button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }`;
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
    box.innerHTML = `<p>${T.text} <a href="/polityka-prywatnosci.html#par-8">${T.more}</a></p>
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

  const v = read();
  if (v === "granted") grant();
  else if (v !== "denied") show();
})();
