# Storyboard — Bestemd / begin 2027

## Regie

Van een nachtblauwe horizon via de drukte van de dagelijkse praktijk naar licht,
financieel overzicht en een persoonlijk toekomstbeeld. De acht scènes blijven
in een gewone semantische HTML-volgorde. De bezoeker bepaalt het tempo.

## 01 — Opening

Direct merk, onderwerp en introductieperiode. Grote typografie links; subtiele
ellipsen en warm licht rechts. De originele logo-uiting op een opaak licht vlak,
met afgeronde hoeken, warme rand en rustige schaduw. Geen transparantie of kleurfilter.
De entree duurt circa 1,5 seconde, begint al leesbaar en blokkeert niets.

## 02 — De realiteit

Facturen, deadlines, administratie, belastingen, onduidelijkheid in een verspringende
typografische compositie. Op ruime desktops staat de scène kort vast (195svh totale
sectiehoogte). Een lichte horizontale verschuiving en kleuraccent volgen de scrollpositie.
Woorden blijven altijd zichtbaar en leesbaar. Terugscrollen geeft exact dezelfde waarden.
Mobiel heeft geen pin en slechts maximaal vier pixels horizontale beweging.

## 03 — De omslag

“Het kan anders” maakt plaats voor een warm lichte compositie. Rust, inzicht en
vooruitgang staan in redactionele regels. Geen featurecards. De calculator zit in een
native details-element en houdt de spanningsopbouw compact. Aannames blijven zichtbaar.

## 04 — De onthulling

Een lokale HTML-interface schuift maximaal 35px en schaalt van 96,5 naar 100 procent.
Mobiel: uitsluitend maximaal 12px verschuiving. Tekst blijft leesbaar. Financieel overzicht
of documenten/contact is te bekijken via echte knoppen met aria-controls/expanded.
De panels zijn expliciet fictief en hebben geen werkende portaalacties.
De grafiek gebruikt een schaal tot 30.000 euro en passende waarden, inclusief juni
24.800 euro omzet en 12.450 euro kosten. Geen willekeurige percentages of winstclaims.

## 05 — De mens en de bestemming

Het nieuwe vertrekpunt is het leven van de ondernemer. “Waar wil jij eigenlijk naartoe?”
komt vóór de financiële aanpak. De opdrachtgeversvisie wordt integraal meegenomen:
geen standaard administratiekantoor, wel ál je financiën; KISS en het ABC uit de coaching.
A: evenwicht tussen inkomsten en uitgaven. B: buffer voor onvoorzien en zonder inkomen.
C: waarde creëren in de onderneming en het mooiste droomleven.
De warme compositie gebruikt typografie en ruimte in plaats van verzonnen portretten.

## 06 — De film

Eigen premièreposter met “Dit is nog maar het begin”. Een echte afspeelknop en native
videobediening. De originele MP4 wordt niet vooraf gedownload. Fouten worden gemeld.
Geen autoplay. De pagina en navigatie blijven gewoon bereikbaar tijdens afspelen.

## 07 — De introductie

2027 als monumentale typografie boven een subtiele horizon. “Gepland voor begin 2027”
blijft zichtbaar. Er is geen exacte datum, aftelklok, kunstmatige urgentie of schaarste.

## 08 — De uitnodiging

Een persoonlijke uitnodiging, met naam, e-mail en optionele bedrijfsnaam. Previewstatus
staat zowel vóór als na de knop. Geen verzending of lokale opslag. Backendvoorbereiding
staat in een apart integratiecontract. De footer biedt ook een bewegingsschakelaar.

## Performance en fallback

Geen animatiebibliotheek, webfont, backgroundvideo of generatieve afbeelding.
Eén event-driven requestAnimationFrame; geometrie eerst lezen, daarna stijlen schrijven.
IntersectionObserver beperkt werk tot nabije scènes. Geen permanent render-loop.
Systeemvoorkeur voor reduced motion wordt ook tijdens gebruik gevolgd. Zonder JS zijn
alle scènes, beide portaalpanelen, native video en uitklapbare calculatorinformatie zichtbaar.
De mobiele navigatie gebruikt een noscript-fallback zonder initiële layoutverspringing.
