# Bestemd — website 2.0

Nederlandstalige statische website voor GitHub Pages, met het bestaande domein
`https://mijnbestemd.nl/`. Geen framework, buildstap, externe fonts of productiedependencies.

## Opbouw

- `index.html`: bezoekersreis, semantische inhoud en metadata.
- `styles.css`: visuele tokens, componenten, responsive indeling en reduced motion.
- `script.js`: mobiele navigatie, tijdwinstcalculator en eerlijke formulierpreview.
- `assets/logo.webp` en `assets/bestemd-film.mp4`: originele, ongewijzigde media.
- `assets/video-poster.svg`: lichte lokale videoposter; video laadt pas op verzoek.
- `docs/form-integration.md` en `docs/lead.schema.json`: toekomstig backendcontract.
- `tests/browser.cjs`: reproduceerbare browsertests met Playwright en lokale HTTP-server.

## Lokaal bekijken

Serveer deze map met een lokale statische HTTP-server, bijvoorbeeld `python -m http.server 4173`.
Open vervolgens `http://localhost:4173`. Rechtstreeks openen van index.html werkt ook,
maar HTTP heeft de voorkeur voor mediagedrag en tests.

## Verificatie

Met Node, Playwright en Chrome beschikbaar: `node tests/browser.cjs`.
Als Playwright elders staat, zet `NODE_PATH` op de map met node_modules.
`TEST_OUTPUT` bepaalt waar screenshots en test-results.json worden opgeslagen.
Standaard is dit de genegeerde map test-results. Met `BROWSER_CHANNEL=msedge`
kan dezelfde controle in Edge worden uitgevoerd.

De suite controleert rekenvoorbeelden, nul- en grenswaarden, negen schermbreedtes,
ankers, mobiele navigatie, Escape, validatie, ontbreken van verzending/opslag,
werkelijke videoweergave, netwerk- en JS-fouten, reduced motion en JavaScript uit.

## Status bij oplevering

Dienstverlening en klantportaal zijn in voorbereiding. De dashboardcijfers zijn
expliciet fictief. De calculator is een indicatie op basis van instelbare aannames,
geen onderbouwde besparingsclaim. Het formulier verstuurt en bewaart niets: de knop
controleert alleen de invoer en bevestigt nooit een aanmelding.

Er zijn geen bevestigde contactgegevens, juridische gegevens of privacyverklaring
in de repository. Deze zijn niet verzonnen. Voeg ze toe voordat de aanmelding opent,
en voer de integratiestappen in docs/form-integration.md uit.

De film blijft in originele kwaliteit. De tekst onder de film vat de merkvisie samen;
het is geen woordelijk transcript. Een geverifieerde ondertiteling/audiodescriptie is
nog niet aanwezig. Er wordt daarom geen volledige WCAG 2.2 AA-conformiteit geclaimd.

Publiceer pas na review van de featurebranch. CNAME en DNS/Cloudflare zijn niet gewijzigd.
