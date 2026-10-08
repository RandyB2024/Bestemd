# Kwaliteitscontrole — Bestemd cinematic launch

Uitgevoerd op 8 oktober 2026 in Google Chrome en Microsoft Edge (headless).

## Functioneel en responsive

- Acht scènes, met Bestemd en de geplande introductie begin 2027 direct in de opening.
- Alle scènes op 320, 375, 390, 580, 768, 850, 1024, 1440 en 1920px gecontroleerd:
  geen horizontale overflow. Desktop- en mobiele screenshots gemaakt en bekeken.
- Alle navigatiedoelen en lokale assets gecontroleerd, inclusief social image en poster.
- Mobiel menu: openen, Escape, focus terug naar menuknop en sluiten bij navigatie.
- Desktop-scrolldrama: vooruit en terug naar dezelfde positie geven exact dezelfde
  woordkleuren en transformaties. Alle woorden blijven zichtbaar. Mobiel heeft geen pin.
- Portaal: twee fictieve weergaven, met toetsenbord bedienbaar. Geen schijnportaalacties.
- Logo: originele kleuren, geen filter/transparantie, op een opaak licht merkvlak.
- Visie: leven als vertrekpunt, KISS en de drie ABC-onderdelen aanwezig.
- Calculator uitklapbaar: standaard 6 uur × 40% geeft 2,4 uur/week, 10,4 uur/maand
  en 124,8 uur/jaar. Ook nul, maximum en fractionele invoer gecontroleerd.
- Formulier: leeg, spaties, ongeldig e-mailadres, toestemming, geldige preview en
  honeypot getest. Geen verzending, opslag of valse aanmeldbevestiging.
- Film via afspeelknop daadwerkelijk afgespeeld: 65,97 seconden, 910 × 512 pixels.
  Geen MP4-download vóór afspelen, ook niet tijdens scrollen langs de film.
- Geen JavaScript-fouten, mislukte assetverzoeken of externe netwerkverzoeken.
- Reduced motion en handmatige bewegingsschakelaar: animaties en pin uitgeschakeld.
  Ook wijzigen van de systeemvoorkeur tijdens gebruik getest.
- Zonder JS: navigatie, alle scènes, beide portaalweergaven en native video bereikbaar.
  Formulierknop is uitgeschakeld; Enter verzendt geen gegevens.

## Vertraagde mobiele labmeting

Viewport 390 × 844, CPU 6× vertraagd, download 1,6 Mbit/s, latency 150ms.
Chrome na de navigatiefix: CLS 0; LCP circa 2,09 seconden.
Edge, definitieve merkplaat: CLS 0; LCP circa 2,55 seconden; initiële overdracht
circa 114 kB inclusief HTML. Geen videoverzoek. Vier long tasks tijdens laden.

De eerdere mobiele navigatieverspringing is opgelost met een statische CSS-basis
plus noscript-fallback. Dit zijn losse labmetingen, geen veld-Core-Web-Vitals.
De Edge-LCP ligt rond de grens van 2,5 seconden; echte apparaten en hosting kunnen afwijken.

## Integriteit en beperkingen

Origineel logo en MP4 zijn ongewijzigd. Geen externe productiedependencies toegevoegd.
De actuele CNAME-configuratie op main is behouden; DNS/Cloudflare niet aangepast.

Geen fysieke smartphone-, Safari- of screenreaderaudit uitgevoerd. Geen volledige
WCAG 2.2 AA-conformiteitsclaim: geverifieerde ondertiteling/audiodescriptie ontbreekt.
De backend bestaat nog niet; het contract staat in docs/form-integration.md. Privacy-
en bevestigde bedrijfs-/contactgegevens moeten worden toegevoegd voordat registratie opent.

Reproduceerbaar via tests/browser.cjs; screenshots en cinematic-test-results.json
worden naar TEST_OUTPUT geschreven.
