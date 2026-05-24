---
title: "robots.txt og AI-crawlere: hvem du bør slippe inn på siden din"
slug: "robots-txt-ai-crawlere"
meta_title: "robots.txt for AI-crawlere: GPTBot, ClaudeBot, PerplexityBot og flere"
meta_description: "ChatGPT, Claude og Perplexity bruker hver sin crawler for å lese nettsiden din. Vi forklarer hvem de er, hvilke som er viktigst, og hvordan du slipper dem inn riktig."
published_at: "2026-05-25"
updated_at: "2026-05-25"
keyword: "robots.txt AI crawlere"
author: "shad"
topic: "ai-crawlere"
---

> **Kort fortalt:** AI-modeller har egne crawlere som heter ting som GPTBot, ClaudeBot og PerplexityBot. De er adskilt fra Googlebot, og de leser kun siden din hvis du eksplisitt slipper dem inn via robots.txt. En `User-agent: *`-policy holder ikke. Du må nevne hver bot ved navn.

Det er to vanlige misforståelser om robots.txt og AI-crawlere som vi rydder opp i hver eneste audit. Først: «vi har `Allow: /` for alle, så vi er åpne for alt». Det er ikke nok. Andre: «vi blokkerer AI-bots fordi vi ikke vil bli trent på». Det blokkerer også svaret om bedriften din. Begge er feil i 2026.

## Hvorfor det finnes så mange AI-crawlere

I 2024 var det stort sett bare GPTBot. I 2026 er det over et dusin AI-crawlere som hver representerer en separat tjeneste. De viktigste for norske bedrifter:

- **GPTBot** (OpenAI). Brukes til å trene fremtidige ChatGPT-modeller. Crawler-en lagrer innholdet for treningsformål, ikke for live svar.
- **OAI-SearchBot** (OpenAI). Brukes av ChatGPT Search-funksjonen for å hente live svar. Hvis du blokkerer denne, blir du *aldri* sitert i ChatGPT-svar med web-tilgang.
- **ClaudeBot og Claude-User** (Anthropic). Tilsvarende for Claude. ClaudeBot er trenings-crawler, Claude-User henter live for samtaler.
- **PerplexityBot og Perplexity-User** (Perplexity). Perplexity er i praksis en ren AEO-motor som *kun* siterer kilder med korrekt schema og åpne robots.txt.
- **Google-Extended** (Google). Brukes av Gemini og AI Overviews. Adskilt fra Googlebot, så du kan teknisk si ja til Google-søk men nei til Gemini. De fleste bør si ja til begge.
- **anthropic-ai, CCBot, Bytespider, Meta-ExternalAgent, MistralAI-User**. Mindre brukt i Norge per nå, men kjapt voksende. Worth å slippe inn.

Alle disse bruker hver sin User-agent-streng i robots.txt-lookupen. Hvis du ikke nevner GPTBot ved navn, vil GPTBot tolke det som «ingen eksplisitt policy, jeg trekker meg unna for å være på sikre siden». Du blir ikke crawlet.

## Hva en korrekt robots.txt ser ut som

En minimal robots.txt for en bedrift som vil bli sitert av alle major AI-motorer:

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: MistralAI-User
Allow: /

Sitemap: https://www.dittfirma.no/sitemap.xml
```

Det er ikke vakkert, men det er hva som teller. Hver eksplisitt `User-agent: <navn>`-blokk forteller den spesifikke crawler-en at den er ønsket. Den øverste `User-agent: *` fanger opp de bot-ene vi ikke har eksplisitt nevnt.

:::technical
For utviklere: tre subtile fallgruver vi ser i robots.txt-audits:

1. **Konflikten mellom `*` og spesifikk bot.** En `User-agent: *` med `Disallow: /admin` *blir overstyrt* hvis du har en `User-agent: GPTBot` med `Allow: /` (uten noen Disallow). GPTBot vil tolke det som «alt er åpent, inkludert /admin» selv om du ikke mente det. Best practice: gjenta Disallow-direktivene i hver spesifikke User-agent-blokk.

2. **Crawl-delay funker ikke.** GPTBot, ClaudeBot og PerplexityBot ignorerer `Crawl-delay`-direktivet. Hvis du vil throttle dem, må du gjøre det server-side via rate limiting eller `429 Too Many Requests`-responser.

3. **Kapitalisering teller.** `gptbot` og `GPTBot` er forskjellig for noen parsere. Bruk alltid den eksakte capitalization OpenAI/Anthropic/Perplexity dokumenterer. Vi har sett kunder bruke `Gptbot` og bli totalt usynlige for GPTBot fordi parseren gjorde streng-sammenligning, ikke case-insensitiv match.

For å validere riktig: bruk `curl -A "GPTBot" https://dittfirma.no/robots.txt` for å simulere hver crawler. Eller bruk [robots-txt-tester](https://technicalseo.com/tools/robots-txt/) som har profiler for hver AI-bot.
:::

## Skal du noensinne blokkere en AI-crawler?

Det korte svaret: nesten aldri. Det lange svaret: det avhenger av forretningsmodellen.

**Slipp inn hvis** du selger noe, leverer en tjeneste, eller vil ha leads. Da er det ren oppside å bli sitert av AI-svarmotorer. Hver sitering er gratis markedsføring til en høyt-kvalifisert leser.

**Vurder å blokkere hvis** innholdet ditt er ditt primære produkt. Eksempel: en bransje-database som folk betaler for å bruke. Hvis ChatGPT siterer dataene dine i svar uten å sende trafikk, undergraver det betalingsmodellen.

**Aldri blokker** hvis du bare er bekymret for «trening på data». Det er en bekymring som høres legitim ut, men i praksis: GPTBot trener uansett på data den finner andre steder (kopier på andre nettsider, sosiale poster, omtaler). Det du oppnår med å blokkere er at *bare* du blir usynlig i ChatGPT-svar, mens konkurrentene som ikke blokkerer fortsatt blir sitert. Det er en tap-tap.

Den eneste sluttoppskriften: blokker hvis du selger innholdet, slipp inn ellers.

## Sjekk hva du har akkurat nå

Du kan se din egen robots.txt på `https://dittfirma.no/robots.txt`. Hvis du ser en linje med `User-agent: GPTBot` etterfulgt av `Allow: /`, er du gode. Hvis du bare ser `User-agent: *`, er du sannsynligvis usynlig for noen av AI-motorene fordi de tolker den brede policyen som tvetydig.

[Vi sjekker dette automatisk i AEO-grunnmurs-sjekken](/) og forteller deg hvilke av de 11 AI-bot-ene som er eksplisitt nevnt, hvilke som mangler, og hvilke som er blokkert.

Det er den ene sjekken vi ser flest bedrifter feile på, og det er også en av de raskeste å fikse. Tre minutter i robots.txt og du har plutselig 11 nye crawlere som leser bedriften din.

Hvis du vil ha hele konteksten på hvorfor dette er en del av AEO-grunnmuren, [forklarer vi her hvordan AI-modeller faktisk velger hvem de skal sitere](/artikler/slik-blir-sitert-av-chatgpt) og hvilken rolle robots.txt spiller i den prosessen.
