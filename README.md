# Reunion Hackathon · www.reunion-hackathon.pl

Strona Reunion Hackathon (Warszawa, 5–7 lutego 2027), design „Lotnisko”: czerwień i biel, tablica split-flap jako intro i odliczanie, REUNION HACKATHON w kroju Big Shoulders, globus 3D z łukami z 7 krajów, kod jako drugi motyw. Czysty HTML, CSS i JS, bez build stepu. Każdy push na `main` wdraża stronę na Vercel.

Na każdym adresie poza `www.reunion-hackathon.pl` Vercel wysyła `X-Robots-Tag: noindex` (`vercel.json`), więc podgląd nie trafia do Google, a docelowa domena będzie indeksowana od razu po podpięciu.

## Wersja angielska

`en.html` powstaje z `index.html`: `python3 make_en.py` po każdej zmianie w `index.html` (skrypt kończy się błędem, gdy któregoś tekstu nie znajdzie). Tablice dostają `lang=en` z `main.js`.

## SEO

`robots.txt`, `sitemap.xml` (PL + EN z hreflang), `llms.txt`, w `<head>` canonical, hreflang, Open Graph i dane strukturalne `Event` (JSON-LD). Obrazek podglądu linku: `assets/og-image.jpg` (1200 x 630), źródło w `print/social.html` (`og-image`), render: `node print/render.mjs social.html`, potem `sips -Z 1200 -s format jpeg print/out/og-image.png --out assets/og-image.jpg`.

## Do zrobienia

1. `regulamin.html` to szkic: uzupełnić pola [DO UZUPEŁNIENIA], dać do sprawdzenia prawnikowi, potem usunąć `<meta name="robots" content="noindex">`.
2. Google Search Console: weryfikacja domeny (rekord DNS TXT u aftermarket.pl), zgłosić `sitemap.xml`; Bing Webmaster Tools: import z Search Console.
3. Google Analytics dopiero z banerem zgody na cookies (polityka prywatności już to opisuje).

Materiały do druku: `print/` (render: `node print/render.mjs <plik>.html`, wyniki w `print/out/`, nie trafiają na stronę).
