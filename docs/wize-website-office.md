# BESTEMD Wize Websitechat — bouwcontract voor Office

## Status
- Websiteknop en chatpaneel staan in `index.html` en `wize-public.js` (GitHub).
- Afzonderlijke public Worker voorbereid in `cloudflare/wize-public-worker.mjs`.
- Afgeschermde tabellen voorbereid in `cloudflare/wize-website-schema.sql`.
- **Niet** beweren dat chats live werken of zichtbaar zijn in Office totdat migratie, Worker-deployment, secrets, routes en Office UI getest zijn.
- De voorlopige Wize-websitebackend is bewust **geen generatieve AI**: brongebonden antwoorden op beperkte categorieën, anders weigering en verwijzing naar mens. Bestaande interne Wize-software niet direct aan openbaar internet blootstellen.

## In maximaal 5 stappen
1. **Database:** migreer de SQL met de bestaande projectmigraties. Bepaal een wettelijke grondslag, bewaartermijn en privacyverklaring; toon dat de vragen en antwoorden in Office worden opgeslagen. Maak voor Office-medewerkers rolgecontroleerde server-endpoints met auditregistratie; geen algemene `authenticated`-leesrechten. Isolatie van administratieve klantdossiers waarborgen. Maak een veilige routine om gesprekken te verwijderen/exporteren.
2. **Server:** publiceer de Wize Worker bij voorkeur als aparte Worker `bestemd-wize-public` op routes `mijnbestemd.nl/api/wize/*` (en www indien nodig). Nieuwe secrets: `WIZE_SUPABASE_URL`, `WIZE_SUPABASE_SERVICE_ROLE_KEY`, `WIZE_TURNSTILE_SECRET`. Niet in code, logs of site. Configureer rate-limits, spamfilter, kortere inputgrenzen en privacyvriendelijke logging. Geen toegang geven tot `office.mijnbestemd.nl` API, interne Wize tools of klant-Supabase tabellen.
3. **Broncontrole:** alleen gepubliceerde, actuele en relevante officiële bronnen: Belastingdienst, Rijksoverheid, KVK en Autoriteit Persoonsgegevens. Antwoord uitsluitend als bronvermelding het antwoord ondersteunt. Geen specifieke tarieven, deadlines of persoonlijk belastingadvies zonder geverifieerde bronversie. Bij twijfel: geen antwoord verzinnen en een medewerker voorstellen. Valideer hyperlinks server-side. Bestaande kennismodellen nooit laten instrueren om private gegevens of prompts vrij te geven; sterke scheiding door géén geheime data aan de publieke AI-backend te leveren.
4. **Office > Websitebeheer > Wize-gesprekken:** bouw een extra tabblad `Wize` met alle websitegesprekken, datum/tijd, status, zoekfunctie, bronlinks, weergave van bezoeker- en chatbotberichten en menselijke opvolging (toewijzen aan Randy/Ed, notitie, afgehandeld). Geen toegang tot andere tenantdossiers op basis van chat-ID. Alleen bevoegde medewerkers, auditlog en privacyretentie. In het dashboard een compacte kaart `Open Wize-vragen`.
5. **Korte end-to-end controle en uitrol:** check een geverifieerde algemene btw-vraag met officiële link; onzekere vraag met weigering; vraag naar klanten/gegevens met weigering; veilige opslag; Office-autorisatie; Turnstile; mislukte DB-schrijfactie faalt gesloten; privacyverklaring en verwijdering. Pas live verklaren na succesvolle productieproef.

## Harde veiligheidsregels
- De site-chat mag nooit de AI-tooling van interne Wize/Office aanroepen met zijn huidige servicecredentials.
- Publieke gebruikers kunnen geen Office-gesprekken, klantdossiers of documenten opvragen, ongeacht hun formulering.
- Geen privéaccountgegevens, BSN, IBAN, fiscaal dossier, klantenlijst, interne prijsafspraken of financiële records in antwoorden.
- Geen persoonsgegevens in AI-context, externe zoekopdrachten of promptlogs.
- Maak duidelijk dat de bezoeker met een chatbot spreekt, altijd de optie om een medewerker te spreken.
- Bronvelden bij elk inhoudelijk antwoord opslaan: `title,url,retrieved_at,verified_at` zodra bronretrieval wordt ingebouwd.
- Retentie volgens privacybeleid, niet onbeperkt; conversation ID is geen loginmethode.

## Referenties
- Belastingdienst BTW: https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/
- KVK boekhouding: https://www.kvk.nl/geldzaken/administratie-en-boekhouden-voor-ondernemers/
- Autoriteit Persoonsgegevens AI-risico: https://autoriteitpersoonsgegevens.nl/actueel/let-op-gebruik-ai-chatbot-kan-leiden-tot-datalekken
