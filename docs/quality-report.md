# Kwaliteitscontrole — frisse Bestemd-website

9 oktober 2026. Google Chrome en Microsoft Edge, geautomatiseerde browsercontrole en visuele inspectie.

- Alle acht secties op 320, 375, 390, 580, 768, 850, 1024, 1440 en 1920px: geen overflow.
- Desktop- en mobiele screenshots bekeken; originele kleurenlogo zonder filters.
- Navigatie, toetsenbord/Escape, interne links en lokale assets werken.
- Aangeleverde portaalafbeelding laadt en opent correct op volledig formaat.
- Scrollonthulling is omkeerbaar. Geen vastgezette secties.
- Calculator: standaardwaarden, nul, maximum en fractionele waarden correct.
- Formulier: lege/ongeldige invoer, toestemming en honeypot gecontroleerd; geen
  verzending, lokale opslag of valse succesmelding bij geldige invoer.
- Originele video daadwerkelijk afgespeeld: 65,97s, 910 × 512 pixels. Geen MP4-download
  vóór afspelen, ook niet na scrollen langs de videosectie.
- Geen JS-fouten, mislukte assets of externe verzoeken.
- Reduced motion, handmatig uitzetten en de no-JS-fallback gecontroleerd.
- Vertraagde mobiele Chrome-labtest: 6× CPU, 1,6Mbps en 150ms latency. CLS 0,
  LCP circa 2,89s in Chrome en 2,50s in Edge; circa 98kB initiële overdracht. Beide hadden CLS 0. Dit zijn labwaarden, geen veld-CWV.

Geen fysieke Safari- of screenreaderaudit. Gecontroleerde ondertiteling/audiodescriptie
ontbreekt. Backend, privacyverklaring en bevestigde contactgegevens zijn vereist voor
werkelijke registratie. De PNG-preview is 1,82 MB en wordt lazy-loaded.

Publicatiecontrole staat los van de browser-QA. Bij aanvang toonde HTTP op het domein
nog de oude homepage; HTTPS gaf een hostname mismatch voor het certificaat. DNS is
niet gewijzigd. GitHub Pages moet de gecontroleerde versie vanaf main publiceren.
