# Veilige formulierintegratie — nog niet geactiveerd

De huidige versie doet alleen lokale validatie. Geen fetch, cookies, localStorage,
sessionStorage, analytics of verzending. De lanceringsknop heet “Houd mij op de hoogte”,
met een direct erboven geplaatste, gekoppelde previewmelding: je wordt nog niet aangemeld.
Ook na geldige invoer staat uitdrukkelijk dat er niets is verstuurd of opgeslagen.
De honeypot is voorbereid; dit is geen vervanging voor server-side spambescherming.
GitHub Pages kan zelf geen aanmeldingen verwerken.

## Contract voor een toekomstige backend

Implementeer een HTTPS POST-endpoint buiten GitHub Pages. Kies de leverancier en
gegevensverwerking afzonderlijk; dit project introduceert geen betaalde dienst.
Gebruik `docs/lead.schema.json` voor validatie van de JSON-body. Voorbeeld:

```json
{
  "name": "Voorbeeldondernemer",
  "company": "Voorbeeldbedrijf",
  "email": "ondernemer@example.com",
  "permission": true,
  "website": "",
  "privacyVersion": "VERSIE-VAN-DE-GEPUBLICEERDE-VERKLARING"
}
```

Server: valideer en trim alle velden opnieuw, begrens requestgrootte, pas rate limiting
toe en controleer de honeypot. Controleer toegestane origins, bescherm cookie-authenticatie
tegen CSRF indien van toepassing, gebruik TLS en bewaar secrets uitsluitend server-side.
Log geen volledige berichten of persoonsgegevens. Bepaal toegang en bewaartermijnen.
Leg de geaccepteerde privacyversie en servertijd vast; vertrouw niet op een clienttijd.
Gebruik een idempotency key om dubbel verzenden bij retries te voorkomen.

Retourneer pas HTTP 201 met `{ "accepted": true, "reference": "opaque-id" }` wanneer
de aanmelding duurzaam is opgeslagen. Verstuur een eventuele bevestigingsmail vanuit
de backend; presenteer mailbezorging niet als zeker op basis van een API-acceptatie.
Validatiefouten: 422 met veldnamen en veilige foutcodes. Rate limit: 429 met Retry-After.
Tijdelijke storing: 503. Geef nooit stacktraces of geheimen terug.

## Frontend activeren

1. Publiceer de echte privacyverklaring, bevestigde bedrijfsgegevens en contactmogelijkheid.
2. Vervang previewteksten en toestemming door de goedgekeurde live tekst met privacylink.
   De lanceringsvariant vraagt naam, e-mailadres en optionele bedrijfsnaam. De optionele
   phone/message-velden in het schema zijn alleen voor een latere uitgebreide contactvariant.
3. Voeg POST-transport toe ná lokale validatie; houd de velden intact bij fouten.
4. Zet de knop tijdens verzending op disabled en het formulier op aria-busy.
5. Toon alleen na een gecontroleerde 201 + accepted:true een ontvangstbevestiging.
6. Bij timeout: meld dat ontvangst niet bevestigd kon worden; gebruik dezelfde idempotency
   key bij een retry. Bij 422/429/503: toon begrijpelijke fouten met herstelmogelijkheid.
7. Test succes, servervalidatie, spam, dubbele klik, offline, timeout, malformed response,
   rate limiting en serverstoring. Een generieke 200 of een resolved fetch is geen succesbewijs.

Het formulier blijft in preview totdat deze stappen zijn uitgevoerd. Er staat bewust
geen invulbare endpoint-URL of API-sleutel in de productie-JavaScript.
