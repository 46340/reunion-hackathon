# Builds en.html from index.html: same markup, English text. Every pair must match at least once.
# Run after every index.html edit: python3 make_en.py
import html, json, pathlib, re, sys
root = pathlib.Path(__file__).parent

def sync_faq(page):
    """FAQPage JSON-LD rebuilt from the visible FAQ, so the schema always matches the page word for word (Google requires it)."""
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', page, re.S)
    graph = json.loads(m.group(1))
    qa = re.findall(r'<summary class="q">(.*?)</summary><div class="a">(.*?)</div></details>', page)
    faq = next(x for x in graph["@graph"] if x["@type"] == "FAQPage")
    faq["mainEntity"] = [{"@type": "Question", "name": html.unescape(q),
                          "acceptedAnswer": {"@type": "Answer", "text": html.unescape(re.sub(r"<[^>]+>", "", a))}} for q, a in qa]
    return page.replace(m.group(1), json.dumps(graph, ensure_ascii=False))

s = sync_faq((root / "index.html").read_text())
(root / "index.html").write_text(s)
LD_PL = '"description": "48 godzin pracy nad wyzwaniami firm i instytucji. 100 uczestników, Warszawa, 5–7 lutego 2027.", "url": "https://www.reunion-hackathon.pl/"'
LD_EN = '"description": "48 hours of work on challenges from companies and institutions. 100 participants, Warsaw, 5–7 February 2027.", "url": "https://www.reunion-hackathon.pl/en.html"'
T = [
 ('<html lang="pl">', '<html lang="en">'),
 ('<title>Hackathon AI Warszawa 2027 | Reunion Hackathon, 5–7 lutego</title>', '<title>AI Hackathon Warsaw 2027 | Reunion Hackathon, 5–7 February</title>'),
 ('content="48-godzinny hackathon AI w Warszawie, 5–7 lutego 2027. 100 miejsc dla polskich studentów i absolwentów z zagranicy. Udział bezpłatny, rekrutacja wkrótce."', 'content="48-hour AI hackathon in Warsaw, 5–7 February 2027, for Polish students and graduates of universities abroad. 100 places, free, selection by application."'),
 ('<link rel="canonical" href="https://www.reunion-hackathon.pl/">', '<link rel="canonical" href="https://www.reunion-hackathon.pl/en.html">'),
 ('<meta property="og:locale" content="pl_PL">\n<meta property="og:locale:alternate" content="en_GB">', '<meta property="og:locale" content="en_GB">\n<meta property="og:locale:alternate" content="pl_PL">'),
 ('<meta property="og:url" content="https://www.reunion-hackathon.pl/">', '<meta property="og:url" content="https://www.reunion-hackathon.pl/en.html">'),
 ('<meta property="og:title" content="Reunion Hackathon · Warszawa · 5–7 lutego 2027">', '<meta property="og:title" content="Reunion Hackathon · Warsaw · 5–7 February 2027">'),
 ('content="REUNION HACKATHON, Warszawa, 5–7.02.2027"', 'content="REUNION HACKATHON, Warsaw, 5–7.02.2027"'),
 (LD_PL, LD_EN),
 ('<a class="lang" href="en.html" hreflang="en" lang="en" aria-label="English version">EN</a>', '<a class="lang" href="./" hreflang="pl" lang="pl" aria-label="Wersja polska">PL</a>'),
 ('>Przejdź do treści<', '>Skip to content<'),
 ('aria-label="Organizator: Global Polish Student Society"', 'aria-label="Organiser: Global Polish Student Society"'),
 ('Aplikuj wkrótce<', 'Apply soon<'),
 ('aria-label="Główna"', 'aria-label="Main"'),
 ('>Tracki<', '>Tracks<'), ('>Rekrutacja<', '>Recruitment<'), ('>Partnerzy<', '>Partners<'), ('>Zespół<', '>Team<'),
 ('title="Odliczanie do startu: Warszawa, 5–7 lutego 2027"', 'title="Countdown to the start: Warsaw, 5–7 February 2027"'),
 ('48 godzin pracy nad wyzwaniami firm i <em>instytucji.</em>', '48 hours of work on challenges from companies and <em>institutions.</em>'),
 ('<p class="theme">Transformacja AI</p>', '<p class="theme">AI Transformation</p>'),
 ('title="Intro: tablica Reunion Hackathon"', 'title="Intro: Reunion Hackathon board"'),
 ('alt="Sala pełna ludzi przy laptopach, jedna czerwona kurtka"', 'alt="A room full of people at laptops, one red jacket"'),
 ('  uczestnicy:', '  participants:'), ('  godziny:', '  hours:'), ('  miasto: <span class="s">"Warszawa"</span>', '  city: <span class="s">"Warsaw"</span>'), ('  spolecznosc:', '  community:'),
 ('Budujemy Polskę, do której warto <em>wracać.</em>', 'Building a Poland worth <em>coming back to.</em>'),
 ('Najlepsi polscy studenci z zagranicy wracają, żeby tworzyć w Polsce.', 'The best Polish students abroad come back to build in Poland.'),
 ('Organizator · <a', 'Organiser · <a'),
 ('Stawiamy na <em>jakość,</em> a nie na liczbę.', 'We go for <em>quality,</em> not numbers.'),
 ('<b>Szwecja</b>', '<b>Sweden</b>'), ('<b>Dania</b>', '<b>Denmark</b>'), ('<b>Wielka Brytania</b>', '<b>United Kingdom</b>'), ('<b>Niderlandy</b>', '<b>Netherlands</b>'),
 ('<b>Szwajcaria</b>', '<b>Switzerland</b>'), ('<b>Włochy</b>', '<b>Italy</b>'), ('<b>Hiszpania</b>', '<b>Spain</b>'),
 (' stud.</span>', ' students</span>'),
 ('WAW · Warszawa', 'WAW · Warsaw'),
 ('W tych siedmiu krajach studiuje łącznie ponad 12 tys. polskich studentów. Źródła: Eurostat 2024, Nuffic i HESA 2024/25.', 'More than 12,000 Polish students study in these seven countries. Sources: Eurostat 2024, Nuffic and HESA 2024/25.'),
 ('Reunion Hackathon to 48-godzinny hackathon AI w Warszawie, 5–7 lutego 2027, dla 100 polskich studentów i absolwentów zagranicznych uczelni. Udział jest bezpłatny.', 'Reunion Hackathon is a 48-hour AI hackathon in Warsaw, 5–7 February 2027, for 100 Polish students and graduates of universities abroad. Taking part is free.'),
 ('"description": "Sieć polskich studentów za granicą."', '"description": "Network of Polish students abroad."'),
 ('<span class="mono">Organizator</span>', '<span class="mono">Organiser</span>'),
 ('Sieć polskich studentów za granicą · Inspiruj · Jednocz · Wracaj', 'Network of Polish students abroad · Inspire · Unite · Return'),
 ('Kula ziemska: z siedmiu krajów trasy prowadzą do Warszawy', 'Globe: routes lead from seven countries to Warsaw'),
 ('<h2 class="title x">Transformacja AI.</h2>', '<h2 class="title x">AI Transformation.</h2>'),
 ('Jeden temat: jak AI zmienia produkty, procesy i <i>całe branże.</i>', 'One theme: how AI changes products, processes and <i>whole industries.</i>'),
 ('Graf gałęzi: cztery ścieżki odchodzą od main i łączą się na demo day', 'Branch graph: four tracks leave main and merge on demo day'),
 ('>ai/ludzie<', '>ai/people<'), ('>ai/firma<', '>ai/business<'), ('>ai/panstwo<', '>ai/gov<'), ('>twoje-wyzwanie<', '>your-challenge<'),
 ('<h3>AI dla ludzi</h3>', '<h3>AI for people</h3>'), ('<h3>AI w firmie</h3>', '<h3>AI in business</h3>'), ('<h3>AI w państwie</h3>', '<h3>AI in government</h3>'),
 ('>Ścieżka partnerska<', '>Partner track<'),
 ('<h3>Twoje wyzwanie</h3>', '<h3>Your challenge</h3>'),
 ('Jedna ze ścieżek może być Twoja.', 'One of the tracks can be yours.'),
 ('>Napisz do nas<', '>Get in touch<'),
 ('48 godzin. Od pomysłu do <em>demo.</em>', '48 hours. From idea to <em>demo.</em>'),
 ('alt="Logo GPSS"', 'alt="GPSS logo"'),
 ('aria-label="48 godzin: otwarcie, praca, finał"', 'aria-label="48 hours: opening, work, final"'),
 ('>OTWARCIE<', '>OPENING<'), ('>PRACA<', '>WORK<'), ('>FINAŁ<', '>FINAL<'),
 ('title="Tablica odlotów z planem wydarzenia" aria-hidden="true" tabindex="-1"', 'title="Departure board with the event plan" aria-hidden="true" tabindex="-1"'),
 ('<ol class="sr-only" aria-label="Plan wydarzenia"><li>Piątek, 16:00: rejestracja</li><li>Piątek, 17:00: gala otwarcia</li><li>Piątek, 19:00: znajdź swój zespół</li><li>Piątek, 20:00: start kodowania</li><li>Sobota, 12:00: warsztat pitchu</li><li>Niedziela, godzina do ogłoszenia: zamknięcie zgłoszeń</li><li>Niedziela, godzina do ogłoszenia: prezentacje</li><li>Niedziela, 13:30: lunch</li><li>Niedziela, 15:30: gala zamknięcia</li><li>Niedziela, 17:00: networking</li></ol>',
  '<ol class="sr-only" aria-label="Event plan"><li>Friday, 16:00: registration</li><li>Friday, 17:00: opening gala</li><li>Friday, 19:00: find your team</li><li>Friday, 20:00: coding starts</li><li>Saturday, 12:00: pitch workshop</li><li>Sunday, time to be announced: submissions close</li><li>Sunday, time to be announced: presentations</li><li>Sunday, 13:30: lunch</li><li>Sunday, 15:30: closing gala</li><li>Sunday, 17:00: networking</li></ol>'),
 ('data-lines="DZ GODZ  PROGRAM|PT 16:00 REJESTRACJA|PT 17:00 GALA OTWARCIA|PT 19:00 ZNAJDŹ SWÓJ ZESPÓŁ|PT 20:00 START KODOWANIA|SB 12:00 WARSZTAT PITCHU|ND --:-- ZAMKNIĘCIE ZGŁOSZEŃ|ND --:-- PREZENTACJE|ND 13:30 LUNCH|ND 15:30 GALA ZAMKNIĘCIA|ND 17:00 NETWORKING"',
  'data-lines="DAY TIME PROGRAMME|FR 16:00 REGISTRATION|FR 17:00 OPENING GALA|FR 19:00 FIND YOUR TEAM|FR 20:00 CODING STARTS|SA 12:00 PITCH WORKSHOP|SU --:-- SUBMISSIONS CLOSE|SU --:-- PRESENTATIONS|SU 13:30 LUNCH|SU 15:30 CLOSING GALA|SU 17:00 NETWORKING"'),
 ('data-lines-m="PIĄTEK 5.02|16:00 REJESTRACJA|17:00 GALA|19:00 ZESPOŁY|20:00 KODOWANIE|SOBOTA 6.02|12:00 WARSZTAT|NIEDZIELA 7.02|--:-- ODDANIE|--:-- PREZENTACJE|13:30 LUNCH|15:30 FINAŁ|17:00 NETWORKING"',
  'data-lines-m="FRIDAY 5 FEB|16:00 CHECK-IN|17:00 GALA|19:00 FIND A TEAM|20:00 CODING|SATURDAY 6 FEB|12:00 WORKSHOP|SUNDAY 7 FEB|--:-- SUBMISSION|--:-- PITCHES|13:30 LUNCH|15:30 FINAL|17:00 NETWORKING"'),
 ('>5 lutego<', '>5 February<'), ('<h3>Piątek</h3>', '<h3>Friday</h3>'), ('Otwarcie<i>', 'Opening<i>'), ('Praca<i>', 'Work<i>'), ('<i>od 20:00</i>', '<i>from 20:00</i>'),
 ('>6 lutego<', '>6 February<'), ('<h3>Sobota</h3>', '<h3>Saturday</h3>'), ('<i>całą dobę</i>', '<i>round the clock</i>'),
 ('>7 lutego<', '>7 February<'), ('<h3>Niedziela</h3>', '<h3>Sunday</h3>'), ('<i>do oddania</i>', '<i>until submission</i>'), ('Finał<i>', 'Final<i>'),
 ('>Zdjęcie miejsca<', '>Venue photo<'), ('<p class="label">Miejsce</p>', '<p class="label">Venue</p>'), ('<h3 style="margin-top:14px">Warszawa</h3>', '<h3 style="margin-top:14px">Warsaw</h3>'),
 ('W Warszawie, 5–7 lutego 2027. Dokładną lokalizację ogłosimy przed startem rekrutacji.', 'In Warsaw, 5–7 February 2027. We will announce the exact venue before applications open.'),
 ('>Nazwa miejsca<', '>Venue name<'), ('<span class="mono">Adres</span>', '<span class="mono">Address</span>'), ('>Dojazd<', '>Getting there<'),
 ('<div class="thin">miejsc</div>', '<div class="thin">places</div>'),
 ('<h2 class="title">Szukamy stu osób.</h2>', '<h2 class="title">We are looking for 100 people.</h2>'),
 ('Studenci i świeżo upieczeni absolwenci. Możesz aplikować solo albo z zespołem.', 'Students and recent graduates. You can apply solo or with a team.'),
 ('>SELEKCJA APLIKACYJNA<', '>SELECTION BY APPLICATION<'), ('>UDZIAŁ BEZPŁATNY<', '>FREE TO TAKE PART<'), ('>SOLO LUB ZESPOŁOWO<', '>SOLO OR AS A TEAM<'), ('>STUDENCI I ABSOLWENCI<', '>STUDENTS AND GRADUATES<'),
 ('Szukamy stu osób. Zgłoś się? <span class="dim">[T/n]</span>', 'We are looking for 100 people. Apply? <span class="dim">[Y/n]</span>'),
 ('Zbuduj to <em>z nami.</em>', 'Build it <em>with us.</em>'),
 ('<i>Pierwszy raz w jednej sali w Warszawie.</i>', '<i>In one room in Warsaw for the first time.</i>'),
 ('Twoje wyzwanie w&nbsp;najlepszych rękach', 'Your challenge in the best hands'),
 ('Przez 48 godzin zespoły z topowych uczelni prototypują rozwiązanie konkretnego problemu Twojej firmy.', 'For 48 hours, teams from top universities prototype a solution to a specific problem your company has.'),
 ('Kontakt, zanim zdecydują', 'Meet them before they decide'),
 ('Ci ludzie wybierają między Londynem, Zurychem a Warszawą. To Ty zdecydujesz, gdzie pojadą.', 'These people are choosing between London, Zurich and Warsaw. You decide where they go.'),
 ('Fast track do zespołu', 'Fast track to your team'),
 ('Staże, mentoring i rekrutacja dla zwycięzców, z Twoją firmą jako fundatorem nagrody.', 'Internships, mentoring and hiring for the winners, with your company funding the prize.'),
 ('Partner Założycielski', 'Founding Partner'),
 ('Współtworzysz format od pierwszej edycji, z prawem pierwszeństwa na kolejne lata.', 'You shape the format from the first edition, with first refusal in the years ahead.'),
 ('aria-label="Uczelnie"', 'aria-label="Universities"'),
 ('<p class="label">Pakiety</p>', '<p class="label">Packages</p>'), ('Dotychczasowi partnerzy GPSS', 'Past GPSS partners'), ('Cztery poziomy współpracy.', 'Four levels of partnership.'),
 ('Sponsor Tytularny', 'Title Sponsor'), ('1 miejsce, wyłączność', '1 place, exclusive'), ('Partner Ścieżki', 'Track Partner'), ('Maks. 3, po jednej ścieżce', 'Max. 3, one track each'),
 ('Partner Wspierający', 'Supporting Partner'), ('Liczba otwarta', 'Open number'), ('Wyłącznie startupy i scale-upy do 50 osób', 'Only startups and scale-ups up to 50 people'),
 ('Kontakt dla partnerów', 'Partner contact'),
 ('subject=Reunion%20Hackathon%20-%20deck%20partnerski">Napisz po deck partnerski<', 'subject=Reunion%20Hackathon%20-%20partner%20deck">Ask for the partner deck<'),
 ('Kto za tym stoi.', 'Who is behind it.'),
 ('Pytania i <em>odpowiedzi.</em>', 'Questions and <em>answers.</em>'),
 ('Kto może aplikować?', 'Who can apply?'),
 ('Polscy studenci i absolwenci uczelni zagranicznych, głównie kierunków informatycznych, AI/ML, inżynieryjnych i data science. Wybieramy na podstawie aplikacji. Dokładne kryteria opublikujemy razem z formularzem.',
  'Polish students and graduates of universities abroad, mainly in computer science, AI/ML, engineering and data science. We select based on applications. We will publish the exact criteria together with the form.'),
 ('Ile kosztuje udział?', 'How much does it cost?'),
 ('Udział jest bezpłatny. Liczba miejsc jest ograniczona do 100, obowiązuje selekcja aplikacyjna.', 'Taking part is free. Places are limited to 100, with selection by application.'),
 ('Czy muszę mieć zespół?', 'Do I need a team?'),
 ('Nie. Możesz aplikować solo, zespoły można też sformować na miejscu podczas otwarcia.', 'No. You can apply solo, and teams can also form on site during the opening.'),
 ('Czy trzeba umieć programować?', 'Do I need to code?'),
 ('Rdzeniem wydarzenia jest praca nad prototypem, ale dobre zespoły potrzebują też designu i biznesu. Liczy się to, co wnosisz do projektu.', 'The core of the event is building a prototype, but good teams also need design and business. What counts is what you bring to the project.'),
 ('Czy pracujemy w nocy?', 'Do we work at night?'),
 ('Tak. Sala jest otwarta przez całą dobę, od startu w piątek o 20:00 do oddania projektów w niedzielę.', 'Yes. The room is open round the clock, from the start on Friday at 20:00 until projects are submitted on Sunday.'),
 ('Jak wygląda prezentacja projektu?', 'How does the project presentation work?'),
 ('Każdy zespół ma 3 minuty na pitch i 2 minuty na pytania jury. W sobotę w południe robimy warsztat z pitchowania.', 'Each team has 3 minutes for the pitch and 2 minutes for questions from the jury. On Saturday at noon we run a pitching workshop.'),
 ('Kiedy rusza rekrutacja?', 'When do applications open?'),
 ('Wkrótce. Formularz pojawi się na tej stronie, obserwuj też kanały <a href="https://globalpolsoc.com" target="_blank" rel="noopener">GPSS</a>.', 'Soon. The form will appear on this page. Also follow the <a href="https://globalpolsoc.com" target="_blank" rel="noopener">GPSS</a> channels.'),
 ('Kiedy i gdzie odbywa się wydarzenie?', 'When and where is the event?'),
 ('Czy organizator pokrywa dojazd i nocleg?', 'Does the organiser cover travel and accommodation?'),
 ('Szczegóły logistyki przekażemy zakwalifikowanym uczestnikom.', 'We will share the logistics with accepted participants.'),
 ('Jak zostać partnerem?', 'How do I become a partner?'),
 ('Napisz na <a href="mailto:maks.rokosz@globalpolsoc.com">maks.rokosz@globalpolsoc.com</a>. Odeślemy deck partnerski z pakietami, świadczeniami i stawkami. Nie udostępniamy go do pobrania.',
  'Write to <a href="mailto:maks.rokosz@globalpolsoc.com">maks.rokosz@globalpolsoc.com</a>. We will send you the partner deck with packages, benefits and rates. It is not available for download.'),
 ('W jakim języku jest wydarzenie?', 'What language is the event in?'),
 ('Po polsku. Część warsztatów i materiałów może być po angielsku.', 'Polish. Some workshops and materials may be in English.'),
 ('Bądź na sali, kiedy się zacznie.', 'Be in the room when it starts.'),
 ('>Formularz wkrótce<', '>Form coming soon<'),
 ('aria-label="Global Polish Student Society, strona organizatora"', 'aria-label="Global Polish Student Society, organiser\'s website"'),
 ('<span class="lbl">Organizator</span>', '<span class="lbl">Organiser</span>'),
 ('>Regulamin (wersja robocza)<', '>Terms (draft)<'), ('>Polityka prywatności<', '>Privacy policy<'),
 ('Reunion Hackathon, Warszawa, 5–7 lutego 2027</p>', 'Reunion Hackathon, Warsaw, 5–7 February 2027</p>'),
]
for a, b in T:
    if a not in s: sys.exit(f"MISSING: {a[:90]}")
    s = s.replace(a, b)
s = sync_faq(s)
(root / "en.html").write_text(s)
# leftovers: diacritics, or Polish words without them
POLISH = re.compile(r"\b(Tracki|Rekrutacja|Partnerzy|Zespół|Organizator|Miejsce|Pakiety|Warszawa|lutego|Aplikuj|Kontakt|Napisz|godzin|miejsc|wkrótce)\b")
for n, line in enumerate(s.splitlines(), 1):
    hits = sorted(set(re.findall(r"[\w-]*[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ][\w-]*", line)) | set(POLISH.findall(line)))
    if hits: print(n, hits)
