# Kwaliteitscontrole — Bestemd 2.0

Uitgevoerd op 8 oktober 2026 in headless Google Chrome en Microsoft Edge.

- Negen viewportbreedtes: 320, 375, 390, 580, 768, 850, 1024, 1440 en 1920 px.
  Geen horizontale overflow gemeten. Desktop- en mobiele screenshots visueel bekeken.
- Alle interne navigatiedoelen bestaan; mobiel menu opent/sluit, Escape werkt en
  kiezen van een navigatielink sluit het menu.
- Calculator: standaard 6 uur × 40% = 2,4 uur/week, 10,4 uur/maand, 124,8 uur/jaar.
  Ook nul, maximum (25 uur × 80%) en fractionele invoer gecontroleerd.
- Formulier: lege velden, alleen spaties, onjuist e-mailadres en toestemming gecontroleerd.
  Geldige invoer meldt uitdrukkelijk dat niets is verstuurd of opgeslagen.
  Geen POST/verzendverzoek, localStorage of sessionStorage aangetroffen.
- Originele MP4 daadwerkelijk afgespeeld: 65,97 seconden, 910 × 512 pixels.
  Geen autoplay; preload=none. Geen compressie of vervanging van het origineel.
- Geen JavaScript-fouten, HTTP-fouten of externe netwerkverzoeken tijdens de tests.
- Reduced motion schakelt animaties en smooth scrolling uit.
- Zonder JavaScript blijven inhoud en navigatie zichtbaar en is de formulierknop disabled.
- Origineel logo, originele video en CNAME zijn identiek aan de basiscommit.

## Grenzen van de controle

Dit is geen formele WCAG-audit. Er is geen fysieke iOS/Safari-test of screenreaderaudit
uitgevoerd. De video heeft nog geen geverifieerde ondertiteling/audiodescriptie.
Er is geen backend, dus server-side spamfiltering en daadwerkelijke verwerking zijn
nog niet te testen. Het integratiecontract beschrijft de benodigde vervolgstappen.
De toekomstige digitale dienstverlening wordt uitsluitend als concept gepresenteerd.

Reproduceerbare test: tests/browser.cjs. Geen productieframework of buildstap toegevoegd.
