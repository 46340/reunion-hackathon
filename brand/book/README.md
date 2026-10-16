# Reunion Hackathon · Brand Book

82 plansz 16:9 (1920 × 1080) w stylu brand booka ArtNovation. Każdy dział to jeden plik HTML w `sections/`, wspólny wygląd w `book.css`, pomocnicze funkcje w `book.js` (głowica i stopka plansz, numery stron, głębia liter `data-px`, tablica `Book.board`).

Odtworzenie (strona musi być serwowana na :8091):

```
cd ~/reunion-hackathon && python3 -m http.server 8091 &
node brand/book/render.mjs              # cała książka -> out/Reunion-Hackathon-Brand-Book.pdf + out/png/NN.png
node brand/book/render.mjs 05-elementy  # jeden dział (PDF w out/pdf/)
```

Lekka wersja do wysyłania (15 MB) powstaje z `out/png/` (PIL, 82 strony JPEG). Pełny PDF (wektorowy tekst, rendery 3x) ma ok. 140 MB.

Pliki do druku w skali 1:1 ze spadem 3 mm: `out/druk/` (bilet 203 × 82 mm w 7 miastach, identyfikatory, smycze, plakaty 50 × 70 i A2, roll-up 85 × 200, znaki 100 × 30, stojaki A5, arkusz naklejek A3, certyfikaty A4). Źródła: widoki `?view=print` w `print/pass.html` i `print/badge.html` oraz szablony w `print/`. Linii cięcia i znaczników cięcia brak: do ustalenia z drukarnią.

Zrzuty ekranu strony (prawdziwe, Playwright): `shots/`.

Zasady pisania plansz: tylko fakty ze strony i z `print/` (bez zmyślonych Pantone, cen, miejsca), po polsku, bez półpauz w zdaniach, twarda spacja po jednoliterowych wyrazach.
