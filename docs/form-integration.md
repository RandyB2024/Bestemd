# EmailJS-aanmeldformulier

Het formulier verstuurt na validatie via HTTPS POST naar
https://api.emailjs.com/api/v1.0/email/send (zonder SDK of productiedependencies).
Configuratie in script.js:

- Service: `service_j8pr0cj`
- Template: `template_w90ddwo`
- Public key / user_id: `f81KMSvhtpl0TUM-6`

De public key is bedoeld voor de browser. Er wordt geen private key gebruikt.
De eigenaar beheert het mailontwerp in EmailJS; de website wijzigt dat niet.

## Template instellen

Stel in EmailJS To Email in op `{{to_email}}`: dit is het ingevulde bezoekersadres.
Let op: `reply_to` bevat momenteel eveneens het bezoekersadres. Stel Reply To in op het zakelijke antwoordadres zodra dat is bevestigd; dit adres is nog niet aangeleverd.
Gebruik het gekoppelde serviceadres als afzender; niet het bezoekersadres.
Beschikbare variabelen:

| Variabele | Inhoud |
| --- | --- |
| `{{name}}` | Naam |
| `{{email}}` | E-mailadres |
| `{{to_email}}` | Ingevuld bezoekersadres voor de bevestigingsmail |
| `{{company}}` | Bedrijfsnaam, leeg indien niet ingevuld |
| `{{reply_to}}` | E-mailadres voor beantwoorden |
| `{{from_name}}` / `{{from_email}}` | Aliassen van naam en e-mailadres |
| `{{permission}}` | Toestemmingstekst voor updates |
| `{{source}}` | Bestemd website — interesse in introductie |

Gebruik gewone dubbel-geaccolade variabelen voor bezoekersinvoer, geen ongeëscapete HTML.
Controleer dat de service verbonden is en de template is opgeslagen. Beperk toegestane
origins in het EmailJS-dashboard tot de daadwerkelijk gebruikte website-origins.
De frontend-honeypot en blokkering van dubbele submits zijn geen server-side spamfilter.
De website beheert geen mailinglijst of automatische afmelding; antwoorden en afmeldingen
worden door Bestemd verwerkt. De template stuurt de bevestiging naar de aanmelder. Een persoonlijke afmeldlink en database zijn nog niet aangesloten.

## Gedrag en verificatie

Alleen HTTP 200 met tekst `OK` geeft een bevestiging en wist de invoer. Dit bevestigt
acceptatie door EmailJS, niet uiteindelijke inboxbezorging. Bij fouten blijven gegevens
staan. Tijdens verzending zijn velden en knop geblokkeerd. Een timeout na 15 seconden
meldt onzekere ontvangst en herhaalt niets automatisch. Geen persoonsgegevens in logs
of browseropslag. Zonder JavaScript is verzenden uitgeschakeld.

`tests/browser.cjs` onderschept alle EmailJS-verzoeken en test payload, succes, validatie,
toestemming, dubbele submit, 400, 429, onverwachte response, offline, timeout en honeypot.
Deze tests verzenden geen echte mail en verifiëren niet de accountconfiguratie of bezorging.
Na het opslaan van het eigen mailontwerp kan de eigenaar één echte aanmelding controleren.

API-contract: https://www.emailjs.com/docs/rest-api/send/
Het oude lead.schema.json beschrijft een mogelijke eigen backend en wordt niet gebruikt
voor deze EmailJS-integratie.
