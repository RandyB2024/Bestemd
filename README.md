# Bestemd — frisse onderneming, persoonlijke financiële richting

Nederlandstalige statische website voor GitHub Pages. Introductie gepland begin 2027.
Geen framework, externe fonts, productiedependencies of buildstap.

## Inhoud en vormgeving

De homepage opent met “Meer grip op je geld. Meer ruimte voor je leven.” Een lichte
basis, mintgroen, navy en een klein warm accent sluiten aan op het originele kleurenlogo.
Administratie, financieel inzicht en persoonlijke coaching worden direct uitgelegd.
Er zijn geen vastgezette scrollsecties; de pagina volgt een natuurlijke leesvolgorde.

Het levensdoel van de ondernemer staat centraal, met KISS en het ABC: evenwicht,
buffer en waardecreatie. De formulering is “Wij zijn geen standaard administratiekantoor.
We doen wel ál je financiën.” De dienstverlening wordt als in voorbereiding gepresenteerd.

De portaalpreview gebruikt exact de aangeleverde PNG van Mijn Bestemming, met lazy
loading en een link naar het originele formaat. Logo en video blijven ongewijzigd.
De calculator is optioneel uitklapbaar. De video heeft native bediening en preload=none.

## Bestandsoverzicht

- index.html, styles.css, script.js: inhoud, responsive vormgeving en interacties.
- assets/logo.webp, assets/bestemd-film.mp4: ongewijzigde originele media.
- assets/portal-preview.png: originele preview van de opdrachtgever (circa 1,82 MB).
- docs/form-integration.md en docs/lead.schema.json: toekomstige backendintegratie.
- docs/quality-report.md: controles en beperkingen.
- tests/browser.cjs: reproduceerbare tests met Playwright.

## Lokaal en testen

Start een statische HTTP-server in deze map, bijvoorbeeld `python -m http.server 4178`.
Test met `node tests/browser.cjs` als Node, Playwright en Chrome aanwezig zijn.
NODE_PATH kan naar elders geïnstalleerde Playwright wijzen. TEST_OUTPUT bepaalt de
screenshotmap. BROWSER_CHANNEL=msedge voert dezelfde suite in Microsoft Edge uit.

## Publicatie en beperkingen

GitHub Pages publiceert de productiebranch main. Alleen een featurebranch pushen
publiceert de site niet. De wijzigingen gaan na controle via een pull request naar main.
De actuele CNAME blijft behouden; DNS/Cloudflare worden niet aangepast.

Het formulier is nadrukkelijk een preview: geen verzending of opslag. Voor live
registratie zijn backend, privacyverklaring en bevestigde bedrijfsgegevens nodig.
Geverifieerde video-ondertiteling/audiodescriptie ontbreekt; geen volledige WCAG-claim.
