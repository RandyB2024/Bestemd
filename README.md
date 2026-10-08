# Bestemd — Cinematic Launch Experience

Een Nederlandstalige digitale première in acht scènes. Introductie gepland voor begin
2027; de definitieve datum is niet vastgesteld. Statische HTML, CSS en JavaScript,
geschikt voor GitHub Pages. Geen frameworks, buildstap, externe fonts of productiescripts.

## Het verhaal

1. Opening: verandering, Bestemd en begin 2027 meteen zichtbaar, zonder verplichte intro.
2. Dagelijkse realiteit: vijf typografische woorden, met een korte desktop-scrollsequentie.
3. Het kan anders: rust, inzicht en vooruitgang; calculator optioneel uitklapbaar.
4. Mijn Bestemming: de aangeleverde portaalafbeelding met een link naar volledig formaat.
5. Het menselijke vertrekpunt: jouw leven, KISS en het financiële ABC.
6. De originele promotiefilm, met een eigen premièreposter en native bediening.
7. Begin 2027: een rustige horizon, geen countdown naar een verzonnen datum.
8. Interesse: het formulier onderaan, expliciet als niet-verzendende preview.

## Merk en visie

Het originele logo blijft volledig opaak en in de originele kleuren. Een lichte,
afgeronde merkplaat met warme rand maakt het leesbaar op de donkere scènes.
Het bronbestand is niet bewerkt. Ook de MP4 blijft ongewijzigd.

“Jij neemt je leven serieus. Wij dus ook.”
“Wij zijn geen standaard administratiekantoor. We doen wel ál je financiën.”
KISS = Keep It Super Simple. A = Altijd evenwicht; B = Buffer opbouwen;
C = Creatie van waarde in je onderneming en je mooiste droomleven.
Deze positionering is door de opdrachtgever aangeleverd en wordt als visie gepresenteerd.

## Bestanden

- index.html: acht scènes, semantiek en launchmetadata.
- styles.css: nachtblauw/licht-regie, merkplaten en afzonderlijke mobiele compositie.
- script.js: event-driven scroll, navigatie, afbeeldingspreview, video, calculator, formulier.
- assets/portal-preview.png: ongewijzigde, door de opdrachtgever aangeleverde preview.
- assets/logo.webp en assets/bestemd-film.mp4: ongewijzigde originele media.
- assets/video-poster.svg: lokale poster; de MP4 heeft preload=none.
- assets/launch-social.svg en .png: eigen lichte Open Graph-compositie (1200 × 630).
- docs/storyboard.md: ontwerp, regie en technische keuzes.
- docs/form-integration.md en docs/lead.schema.json: contract voor toekomstige verwerking.
- docs/quality-report.md: uitgevoerde controles en beperkingen.
- tests/browser.cjs: reproduceerbare browsercontroles.

## Preview en tests

Serveer de map bijvoorbeeld met `python -m http.server 4178` en open localhost:4178.
Met Node, Playwright en Chrome: `node tests/browser.cjs`.
Zet NODE_PATH indien Playwright elders is geïnstalleerd. TEST_OUTPUT bepaalt de map
voor screenshots en testresultaten (standaard de genegeerde map test-results).
Met BROWSER_CHANNEL=msedge draait dezelfde suite in Microsoft Edge.

Scrollwaarden volgen de positie, niet een timer. requestAnimationFrame wordt alleen
op gebeurtenissen ingepland, met één frame tegelijk en alleen voor nabije scènes.
De desktop-pin werkt uitsluitend boven 900px breed én 700px hoog. Op mobiel, zonder
JavaScript en bij reduced motion blijft alles in de gewone documentvolgorde.
De beweging kan ook handmatig worden uitgezet in de footer.

## Grenzen voor livegang

Het formulier doet alleen lokale validatie. De knop “Houd mij op de hoogte” is direct
gekoppeld aan een previewmelding en geeft nooit een succesvolle aanmelding aan.
Voor echte registratie zijn een veilige backend, privacyverklaring en bevestigde
contact- en bedrijfsgegevens nodig. Het portaal is een concept met demonstratiegegevens.

De tekst onder de video vat het merkverhaal samen en is geen woordelijk transcript.
Geverifieerde ondertiteling/audiodescriptie ontbreekt nog. De controles zijn geen
volledige WCAG-certificering of veldmeting van Core Web Vitals.

Werk publiceren via review van de featurebranch. DNS/Cloudflare is niet aangepast;
de actuele CNAME-configuratie op main is behouden.
