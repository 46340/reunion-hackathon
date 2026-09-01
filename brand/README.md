# Brand Book

`reunion-hackathon-brand-book.pdf` — siedmiostronicowy opis systemu wizualnego strony.
Źródłem jest `brand-book.html` w tym katalogu.

## Po co to jest

Dokument ma być podawany dalej. Ktoś, kto buduje nowy plik pod to wydarzenie — deck,
plakat, landing, cokolwiek — ładuje PDF jako kontekst i ma komplet: kolory z kontrastami,
kroje z rolami i wagami, geometrię sygnetu, listę miast na celowniku oraz gotowy blok
`:root` do wklejenia. Strona 7 jest napisana pod to wprost.

## Zawartość

| Strona | Treść |
|---|---|
| 1 | Okładka |
| 2 | Sygnet — konstrukcja, geometria, gotowy SVG, zasady użycia |
| 3 | Kolory — próbki, tokeny, kontrasty WCAG, proporcje |
| 4 | Typografia — trzy kroje, skala, zasady |
| 5 | Celownik — osiem miast ze współrzędnymi, dystansami i punktami SVG, budowa |
| 6 | Komponenty i rytm — przyciski, siatka, logotypy, czego nie robić |
| 7 | Tokeny — CSS i link do krojów do skopiowania, dziesięć zasad |

## Regeneracja

```
cd brand
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=reunion-hackathon-brand-book.pdf \
  --virtual-time-budget=12000 \
  "file://$PWD/brand-book.html"
```

`--virtual-time-budget` jest konieczny: bez niego Chrome drukuje, zanim dojadą kroje
z Google Fonts, i cały dokument wychodzi na zastępczym szeryfie. Po renderze warto
sprawdzić `pdffonts` — wszystkie kroje muszą mieć `emb: yes`.

## Zasada aktualizacji

Wszystkie wartości w brand booku są przepisane ze `styles.css` i `index.html`.
Jeśli zmienisz paletę, skalę typograficzną albo listę miast na celowniku, popraw
`brand-book.html` i przerenderuj PDF — inaczej dokument zacznie kłamać.

Kontrasty na stronie 3 są policzone wg WCAG 2.1 względem papieru `#F2EDE4`,
a nie przepisane z oka. Dystanse i azymuty miast na stronie 5 są policzone po wielkim
okręgu z podanych współrzędnych.

Uwaga o celowniku: pozycje miast na tarczy są stylizowane, nie kartograficzne. Dystanse
zgadzają się z rzeczywistością (max odchylenie 1,3%), ale kierunki są korygowane do 20°,
żeby etykiety się nie nakładały, a promień nie jest proporcjonalny do kilometrów.
Dlatego tabela podaje wprost punkty `x, y` — przy odtwarzaniu przepisuje się je,
a nie wylicza.
