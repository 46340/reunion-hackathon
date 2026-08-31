# Logotypy uczelni: zrodla i prawa

Wygenerowane przez `scripts/fetch-logos.js`. Ostatni przebieg: 2026-08-30 11:44 UTC.

> **Uwaga prawna.** Ponizsza tabela dokumentuje, skad pochodzi kazdy plik, a nie to,
> ze wolno go opublikowac. Logotypy uczelni to znaki towarowe. Licencja pliku na
> Wikimedia Commons (czesto "public domain" z uwagi na prosty ksztalt) nie znosi praw
> do znaku towarowego ani wymogow ksiegi znaku danej uczelni. Przed publikacja strony
> kazda pozycja wymaga osobnej weryfikacji: albo zgody uczelni, albo usuniecia.
> Do czasu weryfikacji pas logotypow nadaje sie wylacznie do wersji roboczej.

| Uczelnia | Plik | Format | Wymiary | Alfa | Repozytorium | Uzyty URL | Opis pliku | Licencja pliku |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Imperial College London | imperial.svg | SVG | 800x220 | tak | Wikimedia Commons | [plik](https://upload.wikimedia.org/wikipedia/commons/d/de/Imperial_logo.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original) | [opis](https://commons.wikimedia.org/wiki/File:Imperial_logo.svg) | Public domain |
| University of Oxford | oxford.svg | SVG | 2251x662 | tak | Wikimedia Commons | [plik](https://upload.wikimedia.org/wikipedia/commons/2/2f/University_of_Oxford.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original) | [opis](https://commons.wikimedia.org/wiki/File:University_of_Oxford.svg) | Public domain |
| University of Cambridge | cambridge.svg | SVG | 66x14 | tak | en.wikipedia, plik niewolny | [plik](https://upload.wikimedia.org/wikipedia/en/2/2b/University_of_Cambridge_logo.svg?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=original) | [opis](https://en.wikipedia.org/wiki/File:University_of_Cambridge_logo.svg) | Fair use |
| ETH Zurich | eth.svg | SVG | 192x32 | tak | Wikimedia Commons | [plik](https://upload.wikimedia.org/wikipedia/commons/9/99/ETH_Z%C3%BCrich_Logo_black.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original) | [opis](https://commons.wikimedia.org/wiki/File:ETH_Z%C3%BCrich_Logo_black.svg) | Public domain |
| University College London | ucl.svg | SVG | 1394x391 | tak | strona uczelni | [plik](https://cdn.ucl.ac.uk/logos/ucl/ucl-logo--primary.svg) | [opis](https://www.ucl.ac.uk/brand/brand-essentials/ucl-logo) | niepodana, prawdopodobnie zastrzezona |
| London School of Economics | lse.svg | SVG | 234x80 | tak | Wikimedia Commons | [plik](https://upload.wikimedia.org/wikipedia/commons/c/c7/London_school_of_economics_logo_with_name.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original) | [opis](https://commons.wikimedia.org/wiki/File:London_school_of_economics_logo_with_name.svg) | CC BY-SA 4.0 |
| Delft University of Technology | tudelft.svg | SVG | 26x10 | tak | en.wikipedia, plik niewolny | [plik](https://upload.wikimedia.org/wikipedia/en/9/98/Delft_University_of_Technology_logo.svg?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=original) | [opis](https://en.wikipedia.org/wiki/File:Delft_University_of_Technology_logo.svg) | Fair use |
| University of Warwick | warwick.svg | SVG | 595x395 | tak | en.wikipedia, plik niewolny | [plik](https://upload.wikimedia.org/wikipedia/en/5/5b/University_of_Warwick_logo.svg?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=original) | [opis](https://en.wikipedia.org/wiki/File:University_of_Warwick_logo.svg) | PD |
| Bocconi University | bocconi.svg | SVG | 608x127 | tak | Wikimedia Commons | [plik](https://upload.wikimedia.org/wikipedia/commons/4/4c/Bocconi_University_Logo.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original) | [opis](https://commons.wikimedia.org/wiki/File:Bocconi_University_Logo.svg) | Public domain |
| IE University | ie.svg | SVG | 1397x452 | tak | Wikimedia Commons | [plik](https://upload.wikimedia.org/wikipedia/commons/a/a7/IE_Business_School_logo.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original) | [opis](https://commons.wikimedia.org/wiki/File:IE_Business_School_logo.svg) | Public domain |

## Kolejnosc zrodel

1. Oficjalna strona identyfikacji wizualnej uczelni: skrypt pobiera HTML i wyciaga
   z niego realne adresy plikow SVG i PNG, po czym filtruje je pod katem nazwy.
   Wiekszosc uczelni trzyma pliki brandowe za logowaniem albo w archiwach ZIP,
   wiec ta sciezka czesto nie zwraca nic i to jest zachowanie oczekiwane.
2. Wikimedia Commons przez API: lista plikow z artykulu na Wikipedii oraz
   wyszukiwanie w przestrzeni nazw plikow, potem `prop=imageinfo` po realny adres.
3. Lokalne repozytorium en.wikipedia, tylko dla plikow, ktorych nie ma na Commons.
   Tam trafiaja logotypy **niewolne**, trzymane na zasadzie fair use. Kazdy taki
   plik ma w kolumnie "Repozytorium" adnotacje `plik niewolny` i wymaga
   bezwzglednie zgody uczelni albo usuniecia przed publikacja.

Nazwa pliku musi zaczynac sie od nazwy uczelni. Bez tej reguly wyszukiwarka
Commons podsuwa herby pojedynczych kolegiow i logotypy jednostek zaleznych
(wydawnictw, szkol biznesu, samorzadow studenckich), ktore wygladaja na trafienie,
a nim nie sa. Przy rownej reszcie wygrywa plik SVG i lockup o proporcjach
poziomych, bo pas logotypow jest poziomy.

Kazdy pobrany plik przechodzi weryfikacje: niezerowy rozmiar, poprawny naglowek
(sygnatura PNG albo element `<svg>`), a dla PNG szerokosc minimum 400 px.
Plik, ktory nie przechodzi, jest odrzucany, a skrypt probuje kolejnego kandydata.
