# Reunion Hackathon · strona wydarzenia

Statyczna strona one-page. Czysty HTML, CSS i vanilla JS. Bez frameworków, bez build stepu, bez zależności.
Jedyny zasób zewnętrzny to Google Fonts. Cała reszta (grafika, ikony, celownik) to inline SVG.

```
reunion-hackathon/
├── index.html
├── styles.css
├── main.js
├── assets/
│   ├── favicon.svg
│   ├── og-image.svg
│   ├── og-image.png
│   └── logos/              logotypy uczelni do pasa w sekcji Misja
│       ├── imperial.svg
│       ├── oxford.svg
│       ├── cambridge.svg
│       ├── ucl.svg
│       ├── lse.svg
│       ├── warwick.svg
│       ├── eth.svg
│       ├── tudelft.svg
│       ├── bocconi.svg
│       └── ie.svg
├── scripts/
│   ├── fetch-logos.js      pobieranie logotypow, uruchamiane recznie
│   ├── logo-sources.md     skad pochodzi kazdy plik i na jakiej licencji
│   └── logo-manifest.json  cache metadanych, zeby ponowny przebieg nie gubil raportu
└── README.md
```

Katalog `scripts/` nie jest czescia strony. Przy deployu wrzucasz `index.html`,
`styles.css`, `main.js` i `assets/`; `scripts/` i `README.md` mozesz pominac.

---

## 1. Deploy na Cloudflare Pages (drag & drop)

1. Zaloguj się na [dash.cloudflare.com](https://dash.cloudflare.com).
2. W menu bocznym wybierz **Workers & Pages**, potem przycisk **Create**.
3. Zakładka **Pages**, sekcja **Upload assets**, przycisk **Get started**.
4. Wpisz nazwę projektu, np. `reunion-hackathon`, i kliknij **Create project**.
5. Przeciągnij **cały folder `reunion-hackathon`** na pole uploadu.
   Ważne: przeciągasz folder z plikami, nie archiwum ZIP. `index.html` musi wylądować w katalogu głównym uploadu.
6. Kliknij **Deploy site**. Po chwili dostaniesz adres `nazwa-projektu.pages.dev`.
7. Otwórz ten adres i sprawdź stronę.

### Aktualizacja po zmianach

Wejdź w projekt, zakładka **Deployments**, przycisk **Create new deployment**, i wrzuć folder jeszcze raz.
Każdy upload tworzy nową wersję, poprzednie zostają dostępne i można się na nie cofnąć.

---

## 2. Własna domena

1. W projekcie Pages otwórz zakładkę **Custom domains**, kliknij **Set up a domain**.
2. Wpisz docelową domenę, np. `reunionhackathon.pl` albo `hackathon.polsoc.eu`.
3. Jeśli domena jest już w Cloudflare (na tym samym koncie), rekord DNS dopisze się sam. Zatwierdź i gotowe.
4. Jeśli domena jest u innego rejestratora, masz dwie drogi:
   - przenieść całą domenę do Cloudflare (zmiana serwerów nazw u rejestratora), albo
   - dodać u rejestratora rekord `CNAME` wskazujący na `nazwa-projektu.pages.dev`
     (dla domeny głównej użyj rekordu `ALIAS` lub `ANAME`, jeśli rejestrator go wspiera).
5. Certyfikat HTTPS Cloudflare wystawia automatycznie, zwykle w kilka minut.
6. Na koniec w `index.html` odkomentuj i uzupełnij tag `<link rel="canonical">` docelowym adresem.

---

## 3. CONFIG: co edytować

Wszystkie zmienne treści siedzą w jednym obiekcie na górze `main.js`. Nic więcej nie trzeba ruszać.

| Klucz | Typ | Co robi |
|---|---|---|
| `APPLY_URL` | tekst | Link do formularza rekrutacyjnego. **Pusty**: wszystkie przyciski Aplikuj są nieaktywne i pokazują "Formularz wkrótce". **Ustawiony**: przyciski stają się aktywnymi linkami otwieranymi w nowej karcie. |
| `PARTNER_EMAIL` | tekst | Adres, na który prowadzi przycisk "Zostań partnerem" (mailto z gotowym tematem "Reunion Hackathon · partnerstwo"). Pusty: przycisk nieaktywny. |
| `CONTACT_EMAIL` | tekst | Mail kontaktowy w stopce. Pusty: link "Kontakt" się nie pojawia. |
| `INSTAGRAM_URL` | tekst | Link do Instagrama w stopce. Pusty: link się nie pojawia. |
| `LINKEDIN_URL` | tekst | Link do LinkedIna w stopce. Pusty: link się nie pojawia. |
| `SHOW_TEAM` | true/false | Włącza sekcję Zespół i jej link w nawigacji. |
| `SHOW_PRIZE_POOL` | true/false | Dokłada segment "· 100K PLN W NAGRODACH" do linii statystyk w hero. |
| `TEAM` | tablica | Wpisy osób w sekcji Zespół. Format opisany niżej. |

**Do potwierdzenia przed publikacją:** `PARTNER_EMAIL` jest ustawiony na `maksrokosz@icloud.com`.
Sprawdź, czy to docelowy adres kontaktowy dla partnerów.

---

## 4. Sekcja Zespół

Sekcja jest **włączona** i wypełniona ośmioma placeholderami. Siedzi między Partnerami a FAQ,
link „Zespół" pojawia się w nawigacji automatycznie.

Żeby wstawić prawdziwe dane, podmień wpisy w tablicy `TEAM` w `main.js`:

```js
{
  name: "Imię Nazwisko",
  role: "Lead",                    // mono, czerwony, pod nazwiskiem
  university: "Imperial College London",
  bio: "Dwa krótkie zdania.",      // opis pod uczelnią
  linkedin: "https://linkedin.com/in/xxx",  // pusty tekst: ikona się nie pojawi
  photo: "assets/team/imie-nazwisko.jpg"    // pusty tekst: kółko z numerem
}
```

Puste `photo` rysuje okrągłą zaślepkę z numerem porządkowym (`01` do `08`), więc siatka trzyma
rytm, zanim dojdą portrety. Możesz podmieniać zdjęcia pojedynczo, w dowolnej kolejności.

Sekcja chowa się, jeśli ustawisz `SHOW_TEAM: false` **albo** wyczyścisz tablicę `TEAM`.
Liczba osób jest dowolna, siatka sama się układa (4 kolumny na desktopie, 3 na tablecie,
2 na telefonie, 1 poniżej 420 px).

### Zdjęcia

- Katalog: `assets/team/` (trzeba go założyć, nie ma go w repo).
- Format: JPG lub WebP, kwadrat 1:1, minimum **1000 x 1000 px**.
- **Kadr wyśrodkowany**: zdjęcia są przycinane do koła, więc twarz musi być na środku,
  z zapasem na bokach. To zmiana względem kwadratowych kadrów.
- Waga: warto zejść poniżej 200 KB na zdjęcie, żeby nie psuć wyniku Lighthouse.
- Strona sama nakłada filtr czarno-biały, który znika po najechaniu kursorem. Wrzucaj kolorowe oryginały.

---

## 5. Gdzie podmienić "Luty 2027" na konkretną datę

Data występuje w **pięciu** miejscach. Podmień wszystkie:

| Plik | Miejsce |
|---|---|
| `index.html` | `<title>` w sekcji `<head>` |
| `index.html` | `<meta property="og:title">` |
| `index.html` | `<meta name="twitter:title">` |
| `index.html` | kicker w hero: `WARSZAWA · LUTY 2027 · EDYCJA 01` |
| `assets/og-image.svg` | tekst `WARSZAWA · LUTY 2027` |

Po zmianie w `og-image.svg` trzeba wygenerować od nowa `assets/og-image.png` (patrz niżej).
Rok w stopce (`© 2026`) i w hero to osobne wartości, sprawdź je przy okazji.

### Regeneracja og-image.png

`og-image.png` powstało z `og-image.svg` przez headless Chrome i to jest plik podpięty w meta tagach
(serwisy społecznościowe nie renderują SVG w podglądach linków). Po edycji SVG:

```bash
# wrapper.html: <div style="width:1200px;height:630px">…zawartość og-image.svg…</div>
# plus <link> do Google Fonts, żeby zaciągnąć Playfair Display i JetBrains Mono
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 \
  --virtual-time-budget=8000 \
  --screenshot=assets/og-image.png "file:///pelna/sciezka/wrapper.html"
```

Alternatywnie: otwórz SVG w Figmie lub dowolnym edytorze i wyeksportuj PNG 1200 x 630.
Jeśli podmienisz tylko SVG i zapomnisz o PNG, podgląd linku pokaże starą grafikę.

---

## 6. Cloudflare Web Analytics

Analityki domyślnie nie ma. Strona nie ustawia żadnych ciasteczek i nie ładuje żadnych skryptów śledzących.

1. W panelu Cloudflare wejdź w **Analytics & Logs**, potem **Web Analytics**.
2. Kliknij **Add a site**, podaj adres strony i skopiuj wygenerowany snippet.
3. W `index.html`, na końcu sekcji `<head>`, znajdź komentarz:

```html
<!-- Cloudflare Web Analytics: wklej tutaj snippet z panelu Cloudflare
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "TWOJ_TOKEN"}'></script>
-->
```

4. Usuń znaczniki komentarza i wklej `token` z panelu.
5. Wgraj stronę ponownie na Pages.

Jeśli strona stoi na Cloudflare Pages z własną domeną, analitykę można też włączyć jednym przełącznikiem
w ustawieniach projektu, bez dotykania kodu.

---

## Logotypy uczelni

Pas w sekcji Misja pokazuje prawdziwe logotypy, nie nazwy. Pliki leżą w `assets/logos/`
i pobiera je skrypt:

```
node scripts/fetch-logos.js
```

Skrypt jest idempotentny: pomija każdy plik, który już istnieje, więc bezpiecznie
uruchamiać go wielokrotnie. Żeby pobrać jakiś logotyp od nowa, skasuj jego plik i puść
skrypt ponownie. Kolejność źródeł: oficjalna strona identyfikacji wizualnej uczelni,
potem Wikimedia Commons, na końcu lokalne repozytorium en.wikipedia. Skrypt nie zgaduje
adresów: najpierw odpytuje źródło o realny adres pliku, potem pobiera i weryfikuje, czy
to poprawny obraz o niezerowym rozmiarze (dla PNG minimum 400 px szerokości).

**Zanim strona pójdzie na produkcję, trzeba zweryfikować prawa do każdego logotypu.**
Pełna lista z użytymi adresami i licencjami jest w `scripts/logo-sources.md`. Licencja
pliku na Wikimedia Commons nie znosi praw do znaku towarowego ani wymogów księgi znaku
danej uczelni, a trzy pliki pochodzą z zasobów niewolnych (fair use).

Brakujący plik nie psuje layoutu: `main.js` podmienia taki element na nazwę uczelni
zapisaną monospace, pas trzyma wysokość i konsola zostaje czysta.

Logotypy lecą w oryginalnych barwach uczelni. Wcześniej pas był odbarwiony
(`grayscale(1) contrast(1.1)` przy `opacity: .55`) i rozjaśniał się dopiero na hover —
to zdjęto, bo pas miał ożywiać stronę, a nie chować się w tle. Barwy siedzą w samych
plikach SVG, więc w `styles.css` nie ma już żadnego filtra na `.logos__img`.
Uwaga przy podmianie pliku: logotyp z nieprzezroczystym białym tłem odetnie się
prostokątem od papieru `#F2EDE4`. Obecne dziesięć plików jest czyste — białe wypełnienia
siedzą wewnątrz herbów, nie pod całym znakiem.

---

## Paleta

Wszystkie kolory siedzą w `:root` w `styles.css`.

| Zmienna | Wartość | Zastosowanie |
|---|---|---|
| `--paper` | `#F2EDE4` | tło strony |
| `--ink` | `#17130E` | tekst główny, nagłówki, punkty miast |
| `--ink-60` | `rgba(23, 19, 14, 0.60)` | tekst drugorzędny |
| `--ink-25` | `rgba(23, 19, 14, 0.251)` | krzyż celownika |
| `--ink-14` | `rgba(23, 19, 14, 0.1412)` | linie i ramki 1px |
| `--red` | `#BD0001` | Signal Red: kickery, tarcza, przyciski |
| `--red-hover` | `#8F0001` | hover |

Kontrasty na papierze `#F2EDE4`: `--ink` 15,7:1, `--ink-60` 4,6:1, `--red` 5,7:1,
`--red-hover` 8,3:1, tekst na czerwonym przycisku 5,7:1. Cała typografia przechodzi WCAG AA.

Pięciostopniowa skala pierścieni celownika (`.102` do `.0588`) i wartości alfy
(`.60`, `.251`, `.1412`) pochodzą z decku partnerskiego.

> **Uwaga.** Wcześniejsza wersja strony używała `--paper: #F5F2EC` i `--red: #D2202F`,
> wyciągniętych ze strumieni PDF decku partnerskiego. Obecne wartości `#F2EDE4` i `#BD0001`
> przyszły z briefu jako wiążące. Jeśli deck jest nadrzędny, to jest jedno miejsce do cofnięcia.

### Sygnet

Sygnet to oficjalny znak z nagłówka decku partnerskiego (str. 2, lewy górny róg), odrysowany
z geometrii zmierzonej na renderze PDF w 600 dpi: okrąg o promieniu środkowym `22.13`
w polu `48x48`, grubość kreski `3.75`, zaokrąglone końce. Łuk atramentowy `#17130E` bierze
lewą stronę (172°), łuk czerwony `#D2202F` prawą (131°), przerwy u góry i u dołu mają po 28,5°.
Punkt zbiorki to koło `r=4.39` przesunięte o `3.72` w prawo od środka — to przesunięcie jest
w oryginale, nie jest błędem odrysu.

> **Uwaga.** Sygnet trzyma czerwień decku `#D2202F`, a reszta strony jedzie na `--red: #BD0001`
> z briefu. Te dwie czerwienie stoją obok siebie w nawigacji (znak vs. przycisk APLIKUJ)
> i różnicę widać. Do ujednolicenia trzeba zdecydować, który dokument jest nadrzędny.

Zmiana palety w jednym miejscu (`:root`) przemalowuje całą stronę. Poza tym kolory są jeszcze
zapisane na sztywno w trzech miejscach, bo to samodzielne pliki SVG i inline sygnety:
`assets/favicon.svg`, `assets/og-image.svg` oraz sygnet w `index.html` (nav i stopka),
plus `<meta name="theme-color">`. Wszystkie są już zaktualizowane, łącznie z rastrowym
`assets/og-image.png`, wyrenderowanym na nowo z `assets/og-image.svg` w 1200x630.

Uwaga na krój: `assets/og-image.svg` używa Playfair Display i JetBrains Mono, a strona
Archivo i IBM Plex Mono. Obraz OG i strona nie mówią więc tym samym krojem. Renderując
`og-image.png` trzeba mieć te dwa fonty wczytane, inaczej wyjdzie zastępczy szeryf.

---

## Uwagi techniczne

- **Dostępność:** widoczne stany focus, link pomijający nawigację, `aria-expanded` na burgerze, semantyczne sekcje.
- **prefers-reduced-motion:** wyłącza obrót tarczy celownika, puls środka, migający kursor
  i przewijanie pasa logotypów (pas staje się statycznym, wyśrodkowanym rzędem).
- **Typografia:** Archivo na nagłówki i tekst, IBM Plex Mono na etykiety. Playfair Display 900
  wyłącznie na wielkie liczby statystyk i numery porządkowe kart (`--font-numeral`).
- **RWD:** punkty łamania 1024 px, 900 px, 720 px, 460 px i 420 px. Poniżej 720 px celownik
  przechodzi pod tekst hero, a pasek czasu w agendzie obraca się w pion. Brak poziomego
  przewijania w zakresie 360 px do 1920 px.
- **Celownik:** 8 miast, każde na właściwym azymucie od Warszawy (Sztokholm 350°, Kopenhaga
  304°, Londyn 268°, Delft 256°, Zurych 242°, Mediolan 232°, Madryt 234°). Promień rośnie
  z dystansem, ale nie liniowo — pozycje punktów są stylizowane, nie kartograficzne
  (metodologia w `brand/brand-book.html`, str. 5). Etykieta to nazwa miasta plus
  `<tspan class="radar__stat">` z liczbą polskich studentów w danym kraju (Eurostat
  `educ_uoe_mobs02` 2024 dla Szwecji/Danii/Szwajcarii/Hiszpanii; Nuffic i HESA/Jisc 2024/25
  dla Niderlandów i UK, bo Eurostat przestał je tak raportować po 2019). Oxford, Londyn,
  Delft i Mediolan dodatkowo dzielą krajową liczbę wagą wg wielkości uczelni — Oxford
  i Mediolan wyszły na tyle cienkie, że są grubo zaokrąglone („ok. 40", „ok. 30").
  Pełne źródła i wzór w brand booku, str. 5.
  Poniżej 720 px liczby się chowają: to one są najdłuższą częścią etykiety i bez tego
  KOPENHAGA i MEDIOLAN wychodziły poza lewą krawędź viewBoxa. Same nazwy mieszczą się
  wszystkie, więc żaden punkt nie zostaje bez podpisu.
  Sztokholm jako jedyny ma etykietę po prawej stronie punktu: `.hero__title` wylewa się poza
  swój box (jednowyrazowe "HACKATHON" nie ma gdzie się złamać) i w okolicach 1300 px wchodził
  na tę etykietę z lewej strony.
- **Pas logotypów:** przewija się bez przerwy, także pod kursorem. Nie zatrzymuje się na hover,
  bo zatrzymanie przy przypadkowym najechaniu czytało się jak zacięcie animacji.
- **Ścieżki tematyczne:** cztery, celowo bez nazw do czasu ogłoszenia partnerów. W markupie
  są jako `.slot` z kreskowaną ramką, czyli zarezerwowane miejsca, nie zapowiedzi. Liczba
  ścieżek pojawia się też w licznikach pod agendą; przy zmianie trzeba poprawić oba miejsca.
- **Ograniczenia znakowe:** w treści i w kodzie nie używamy długich myślników. Separator to `·`, zwykły łącznik lub przecinek.
- Strona działa też otwarta bezpośrednio z pliku (`file://`), bez serwera.
