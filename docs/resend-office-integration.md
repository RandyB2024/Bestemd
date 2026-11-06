# BESTEMD website: Resend + Office koppeling

Status 6 november 2026: technische broncode voor Cloudflare Worker, browserformulieren en een testpagina is aanwezig. Productie is **niet** geactiveerd: Resend API key, DNS/verificatie en Worker-deployment ontbreken.

## Bestaande site
- Openbare website: `RandyB2024/Bestemd`, `index.html` op GitHub Pages via Cloudflare.
- Nieuwe reviewpagina: `resend-preview/index.html` (nog geen productieformulieren).
- Browserformuliercode: `resend-forms.js`.
- API-servercode: `cloudflare/website-intake-worker.mjs`.
- De bestaande nieuwsbrief-aanmelding op de huidige homepage via EmailJS is ongewijzigd gelaten om niet werkende formulieren te voorkomen.

## Serveractivering
1. Maak bij Resend een API key aan met zo beperkt mogelijke rechten voor e-mailverzending.
2. Verifieer `mijnbestemd.nl` als afzenddomein bij Resend (SPF/DKIM, en passend DMARC-beleid). Stel `RESEND_FROM` in, bijvoorbeeld `BESTEMD <website@mijnbestemd.nl>`.
3. Maak een aparte Cloudflare Worker voor de intake en voeg `RESEND_API_KEY` uitsluitend toe als **secret**. Zet `NOTIFY_TO=info@mijnbestemd.nl`.
4. Stel de Worker Routes in: `mijnbestemd.nl/api/website/intake` en `www.mijnbestemd.nl/api/website/intake`. De domeinen moeten hiervoor via de Cloudflare proxy lopen. Gebruik hiervoor geen bestaande Office/Portal Worker.
5. Zet Cloudflare WAF/rate limits/Turnstile op de publieke route voordat echte klantformulieren openstaan. Controleer Resend aflevering met één proefaanvraag. Pas daarna de nieuwe formulieren in de publieke homepage toe.
6. API-antwoord geeft acceptatie door Resend aan; dit is niet hetzelfde als definitieve inboxaflevering of opslag in Office.

**Nooit de API key in ChatGPT, GitHub, HTML of JavaScript plakken.** Gebruik Cloudflare Secrets.

## Formulier-API
`POST /api/website/intake` JSON:
- `type`: `book`, `training`, `contact`, `newsletter_subscribe`, `newsletter_unsubscribe`.
- `name`, `email`, `phone`, `company`, `address`, `postcode`, `city`, `quantity`, `training`, `message`, afhankelijk van type.
- `consent`: boolean, behalve bij afmeldverzoeken.
- `website`: lege honeypot.
Succesrespons: `{ok:true,reference:"uuid",notice:"..."}`.
Geen betalingen; boek is **aanvraag**; traject is **interesse**, geen automatische boeking of contract.
Nieuwsbrief-events zijn voorlopig **verzoeken**. Automatische inschrijving en afmelding zijn nog niet geïmplementeerd.

## BESTEMD Office: gewenste verdere koppeling
- Leg ontvangen formulierverzoeken duurzaam server-side vast vóór of transactioneel met verzending, onafhankelijk van Resend.
- Aparte intake-tabel met UUID, bron, type, status, data, timestamps, consentversie en interne dossierlink.
- Koppel op gecontroleerde manier aan prospect-/klantdossier; tenant-/ondernemingsisolatie, rollen en audit trails.
- Boekbestellingen: aantallen, afleveradres, kosten/verzendkosten, status, betaling later, leveringen, notities, communicatie.
- Trajecten: gekozen programma, nieuwe aanmeldingen, planning, status, taken en opvolging.
- Contact: inbox met toewijzing aan medewerker, status en replies via `info@mijnbestemd.nl`.
- Nieuwsbrief: opt-in registratie en bewijs, dubbele opt-in ter overweging, veilige unieke afmeldlink/token, suppressielijst en export.
- Geen automatisch verlenen van klantportaaltoegang bij vrijblijvende aanvraag. Pas na akkoord en prospect-naar-klantproces.
- Server-side idempotency, spamfilter, verificatie, bewaartermijnen, AVG, RLS en observability.

## Privacy/veiligheid
Geen vertrouwelijke persoonsgegevens in GET-links, browserlog of plaintext analytics. Gebruik mailtemplates die HTML escapen, veilige secrets en webhook-signatureverificatie. De Cloudflare Worker is een tussenstap; Office wordt bron van waarheid. Publiceer heldere privacyverklaring en verwerkingstermijnen.
