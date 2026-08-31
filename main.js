/* Reunion Hackathon
   Wszystko, co zmienne, ustawiasz w CONFIG poniżej. Reszta pliku jest generyczna. */

const CONFIG = {
  APPLY_URL: "",
  PARTNER_EMAIL: "maksrokosz@icloud.com", // TODO potwierdzić przed publikacją
  CONTACT_EMAIL: "",
  INSTAGRAM_URL: "",
  LINKEDIN_URL: "",
  SHOW_TEAM: true,
  SHOW_PRIZE_POOL: false,
  // 8 placeholderow do podmiany. Puste photo rysuje kolo z numerem porzadkowym.
  // bio: dwa krotkie zdania. Zdjecia: kwadrat min 1000x1000, kadr wysrodkowany (obcinane do kola).
  TEAM: [
    { name: "Imię Nazwisko", role: "Lead", university: "Uczelnia", bio: "Dwa krótkie zdania opisu. Tu wpisz, za co odpowiada ta osoba i co wnosi do wydarzenia.", linkedin: "", photo: "" },
    { name: "Imię Nazwisko", role: "Partnerships", university: "Uczelnia", bio: "Dwa krótkie zdania opisu. Tu wpisz, za co odpowiada ta osoba i co wnosi do wydarzenia.", linkedin: "", photo: "" },
    { name: "Imię Nazwisko", role: "Program", university: "Uczelnia", bio: "Dwa krótkie zdania opisu. Tu wpisz, za co odpowiada ta osoba i co wnosi do wydarzenia.", linkedin: "", photo: "" },
    { name: "Imię Nazwisko", role: "Operations", university: "Uczelnia", bio: "Dwa krótkie zdania opisu. Tu wpisz, za co odpowiada ta osoba i co wnosi do wydarzenia.", linkedin: "", photo: "" },
    { name: "Imię Nazwisko", role: "Marketing", university: "Uczelnia", bio: "Dwa krótkie zdania opisu. Tu wpisz, za co odpowiada ta osoba i co wnosi do wydarzenia.", linkedin: "", photo: "" },
    { name: "Imię Nazwisko", role: "Community", university: "Uczelnia", bio: "Dwa krótkie zdania opisu. Tu wpisz, za co odpowiada ta osoba i co wnosi do wydarzenia.", linkedin: "", photo: "" },
    { name: "Imię Nazwisko", role: "Tech", university: "Uczelnia", bio: "Dwa krótkie zdania opisu. Tu wpisz, za co odpowiada ta osoba i co wnosi do wydarzenia.", linkedin: "", photo: "" },
    { name: "Imię Nazwisko", role: "Finance", university: "Uczelnia", bio: "Dwa krótkie zdania opisu. Tu wpisz, za co odpowiada ta osoba i co wnosi do wydarzenia.", linkedin: "", photo: "" }
  ]
};

const LI_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">' +
  '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.6 8.65 23 10.6 23 14v7h-4v-6.2c0-1.5-.03-3.4-2.07-3.4-2.07 0-2.39 1.62-2.39 3.3V21h-4V9z"/></svg>';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

function external(node, href) {
  node.href = href;
  node.target = "_blank";
  node.rel = "noopener";
}

/* Przyciski Aplikuj: aktywny link albo stan "wkrótce".
   Przycisk w nawigacji nigdy nie zmienia etykiety, zostaje kotwicą do sekcji rekrutacji. */
function setupApply() {
  document.querySelectorAll("[data-apply]").forEach(function (btn) {
    if (CONFIG.APPLY_URL) {
      external(btn, CONFIG.APPLY_URL);
      btn.textContent = btn.dataset.label;
    } else if (!btn.hasAttribute("data-apply-nav")) {
      btn.classList.replace("btn--primary", "btn--disabled");
      btn.removeAttribute("href");
      btn.setAttribute("aria-disabled", "true");
      btn.textContent = "Formularz wkrótce";
    }
  });
}

/* Czwarty segment linii statystyk w hero */
function setupPrizePool() {
  const stats = document.getElementById("stats");
  if (CONFIG.SHOW_PRIZE_POOL && stats) {
    stats.append(" · ", el("span", "", "100K PLN W NAGRODACH"));
  }
}

/* Przycisk w sekcji Partnerzy i duzy kafelek w Trackach. Bez adresu kafelek
   zostaje kotwica do sekcji, a przycisk przechodzi w stan nieaktywny. */
function setupPartnerCta() {
  document.querySelectorAll("[data-partner]").forEach(function (cta) {
    if (CONFIG.PARTNER_EMAIL) {
      cta.href = "mailto:" + CONFIG.PARTNER_EMAIL +
        "?subject=" + encodeURIComponent("Reunion Hackathon · partnerstwo");
    } else if (cta.classList.contains("btn")) {
      cta.classList.replace("btn--primary", "btn--disabled");
      cta.removeAttribute("href");
      cta.setAttribute("aria-disabled", "true");
    }
  });
}

/* Linki w stopce renderują się wyłącznie dla niepustych wartości z CONFIG */
function setupFooterLinks() {
  const list = document.getElementById("footer-links");
  if (!list) return;
  const mail = CONFIG.CONTACT_EMAIL ? "mailto:" + CONFIG.CONTACT_EMAIL : "";
  [["Instagram", CONFIG.INSTAGRAM_URL, true],
   ["LinkedIn", CONFIG.LINKEDIN_URL, true],
   ["Kontakt", mail, false]].forEach(function (item) {
    if (!item[1]) return;
    const a = el("a", "", item[0]);
    if (item[2]) { external(a, item[1]); } else { a.href = item[1]; }
    const li = el("li");
    li.appendChild(a);
    list.appendChild(li);
  });
}

/* Bez zdjecia rysujemy kolo z numerem porzadkowym, zeby siatka trzymala rytm
   zanim dojda prawdziwe portrety. */
function avatar(person, i) {
  if (!person.photo) {
    const slot = el("div", "team__photo team__photo--empty",
      String(i + 1).padStart(2, "0"));
    slot.setAttribute("aria-hidden", "true");
    return slot;
  }
  const img = el("img", "team__photo");
  img.src = person.photo;
  img.alt = person.name;
  img.loading = "lazy";
  img.width = img.height = 400;
  return img;
}

function teamCard(person, i) {
  const card = el("li", "team__member");
  card.appendChild(avatar(person, i));

  card.appendChild(el("p", "team__name", person.name));
  if (person.role) card.appendChild(el("p", "team__role", person.role));
  if (person.university) card.appendChild(el("p", "team__uni", person.university));
  if (person.bio) card.appendChild(el("p", "team__bio", person.bio));

  if (person.linkedin) {
    const link = el("a", "team__li");
    external(link, person.linkedin);
    link.setAttribute("aria-label", "LinkedIn: " + person.name);
    link.innerHTML = LI_ICON;
    card.appendChild(link);
  }
  return card;
}

/* Sekcja zespołu i jej link w nawigacji pojawiają się tylko przy SHOW_TEAM i niepustej tablicy */
function setupTeam() {
  const section = document.getElementById("zespol");
  const grid = document.getElementById("team-grid");
  if (!CONFIG.SHOW_TEAM || !CONFIG.TEAM.length || !section || !grid) return;

  CONFIG.TEAM.forEach(function (person, i) { grid.appendChild(teamCard(person, i)); });
  section.hidden = false;
  const navItem = document.querySelector(".nav-team");
  if (navItem) navItem.hidden = false;
}

/* Pas logotypow. Brakujacy albo uszkodzony plik degraduje sie do nazwy uczelni:
   przegladarka zostawilaby w tym miejscu pusta ramke z ikona bledu, a pas ma
   trzymac wysokosc niezaleznie od tego, ilu plikow brakuje. */
function setupLogos() {
  document.querySelectorAll(".logos__item img").forEach(function (img) {
    function degrade() {
      const item = img.parentNode;
      if (!item) return;
      const name = img.alt || item.getAttribute("aria-label") || "";
      if (!name) { img.remove(); return; }
      img.replaceWith(el("span", "logos__fallback", name));
    }
    img.addEventListener("error", degrade);
    /* obrazek moglby zdazyc sie wywalic, zanim ten skrypt sie wykona */
    if (img.complete && img.naturalWidth === 0) degrade();
  });
}

function setupBurger() {
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  if (!burger || !menu) return;

  function setOpen(open) {
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }

  burger.addEventListener("click", function () {
    setOpen(!menu.classList.contains("is-open"));
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
}

setupApply();
setupPrizePool();
setupPartnerCta();
setupFooterLinks();
setupTeam();
setupLogos();
setupBurger();
