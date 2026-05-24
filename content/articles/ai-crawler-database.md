---
title: "Databasen over AI-crawlere i 2026: hvem de er og hva de gjør"
slug: "ai-crawler-database"
meta_title: "AI-crawler-database 2026: 13 bots, hva de gjør, og hvordan du slipper dem inn"
meta_description: "Komplett oversikt over alle relevante AI-crawlere per mai 2026: GPTBot, ClaudeBot, PerplexityBot, Google-Extended og flere. Med User-agent, formål og policy."
published_at: "2026-05-25"
updated_at: "2026-05-25"
keyword: "AI crawler database 2026"
author: "shad"
topic: "ai-crawlere"
---

> **Kort fortalt:** Per mai 2026 er det 13 relevante AI-crawlere du bør vurdere policy for. De faller i tre kategorier: trenings-crawlere som lagrer innhold til fremtidig modell-trening, retrieval-crawlere som henter live svar, og hybrid-crawlere som gjør begge. Vi anbefaler at norske bedrifter slipper inn alle 13 med mindre du har en konkret grunn til ikke å.

Det er overraskende få oppdaterte oversikter over AI-crawlere på norsk i 2026. Her er hva vi vet, oppdatert mai 2026, sortert etter hvor viktig de er for typiske norske bedrifter.

## Kategori 1: Retrieval (live svar)

Disse henter innholdet ditt i sanntid når en bruker stiller et spørsmål. Hvis du blokkerer dem, blir du IKKE sitert i AI-svar med web-tilgang. Anbefalt å slippe inn for absolutt alle bedrifter som vil ha synlighet.

**OAI-SearchBot** (OpenAI)
- Brukes av: ChatGPT Search-funksjonen
- Lagrer ikke for trening, kun live
- User-agent inneholder: `OAI-SearchBot`
- Anbefaling: ALWAYS Allow

**Claude-User** (Anthropic)
- Brukes av: Claude.ai i samtaler hvor brukeren ber Claude søke
- User-agent inneholder: `Claude-User`
- Anbefaling: ALWAYS Allow

**PerplexityBot** og **Perplexity-User** (Perplexity)
- Brukes av: Perplexity.ai for live svar
- Perplexity er en ren AEO-motor, så blokkering betyr null synlighet der
- Anbefaling: ALWAYS Allow

**Google-Extended** (Google)
- Brukes av: Gemini-modellen og Google AI Overviews
- Adskilt fra Googlebot, så du kan ha en policy for tradisjonelt søk og en annen for AI
- Anbefaling: Allow (med mindre du har sterk grunn til ikke)

## Kategori 2: Trening (modell-bygging)

Disse lagrer innhold for å trene fremtidige AI-modeller. De har mer omdiskutert verdi: noen mener du bør beskytte innholdet ditt fra trening, andre mener inkludering i fremtidige modeller er en oppside.

**GPTBot** (OpenAI)
- Brukes av: OpenAI for å trene fremtidige ChatGPT-modeller
- User-agent inneholder: `GPTBot`
- Anbefaling: Allow med mindre innholdet er ditt primære produkt

**ClaudeBot** (Anthropic)
- Brukes av: Anthropic for å trene fremtidige Claude-modeller
- User-agent inneholder: `ClaudeBot`
- Anbefaling: Allow

**anthropic-ai** (Anthropic, legacy)
- Eldre Anthropic-crawler, fortsatt aktiv
- Anbefaling: Allow

**CCBot** (Common Crawl)
- Datasett som mange AI-modeller (Falcon, Llama, andre) trenes på
- User-agent inneholder: `CCBot`
- Anbefaling: Allow

## Kategori 3: Hybrid og store plattformer

**Bytespider** (ByteDance)
- Tjener TikToks AI-tjenester og fremtidige modeller
- Aktiv i Asia, mindre i Norge per nå
- Anbefaling: Allow med mindre du har sensitiv data

**Meta-ExternalAgent** (Meta)
- Tjener Llama-treningsdata og fremtidige Meta AI-modeller
- Brukes av Facebooks AI-svar i søkefunksjoner
- Anbefaling: Allow

**MistralAI-User** (Mistral)
- Brukes av Le Chat (Mistrals chat-tjeneste) for live svar
- Voksende bruk i Europa
- Anbefaling: Allow

**DuckAssistBot** (DuckDuckGo)
- Brukes av DuckDuckGos AI-svar
- Verifisert privacy-fokusert
- Anbefaling: Allow

**Diffbot**
- Teknisk crawler som lager strukturerte data for AI-modeller
- Brukes som data-pipeline av flere AI-leverandører
- Anbefaling: Allow

## Hva en korrekt robots.txt med alle 13 ser ut som

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

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: MistralAI-User
Allow: /

User-agent: DuckAssistBot
Allow: /

User-agent: Diffbot
Allow: /

Sitemap: https://dittfirma.no/sitemap.xml
```

Det er omtrent 30 linjer. Det tar 5 minutter å sette opp.

:::technical
For utviklere: tre subtile teknikaliteter:

**1. Konflikten mellom * og spesifikk bot.** En `User-agent: *` med `Disallow: /private` blir IKKE arvet av spesifikke User-agent-blokker. Hvis du har sensitive paths, må Disallow gjentas i hver bot-spesifikke blokk.

**2. Crawl-delay ignoreres.** GPTBot, ClaudeBot og PerplexityBot ignorerer `Crawl-delay`. Hvis du vil throttle dem, må du gjøre det server-side via rate limiting.

**3. Case-sensitivity varierer.** Bruk alltid eksakt capitalization som bot-leverandøren dokumenterer. `gptbot` vs `GPTBot` parses ulikt av enkelte mellomvare-stacks.

Test hver bot eksplisitt: `curl -A "GPTBot/1.0" https://dittfirma.no/robots.txt` skal returnere 200 med ditt innhold. Gjenta for hver av de 13.
:::

## Bots vi anbefaler å IKKE blokkere selv om du har lyst

Det er to bots som folk ofte misforstår og blokkerer i tro om at de gjør «noe ondskapsfullt»:

**AhrefsBot, SemrushBot, MJ12Bot, etc.** Disse er SEO-verktøy. De lagrer ikke direkte for AI-trening, men dataene deres ender opp som input til AI-modeller indirekte (via SEO-rapporter, backlink-datasett, etc). Blokkere dem skader rankings i tradisjonelt SEO uten å redde deg fra AI-trening.

**Googlebot.** Tradisjonell Googlebot er separat fra Google-Extended. Hvis du blokkerer Googlebot, faller du ut av Google totalt. Det er en sjelden bedrift som bevisst vil det.

## Hva som kommer i 2027

Nye AI-leverandører dukker opp månedlig. De vi følger med på:

- **xAI / Grok**: User-agent ennå ikke standardisert
- **DeepSeek**: voksende bruk, særlig i utviklerverktøy
- **Reka**: spesialisert AI for europeisk marked, sannsynlig egne crawlere på vei

Vi oppdaterer denne listen hver 3-6 måned. Sjekk publiseringsdato øverst på siden for hvor fersk versjonen du leser er.

## Hva du faktisk gjør neste 10 minutter

- Åpne `https://dittfirma.no/robots.txt` i nettleseren
- Hvis det ikke er en eksplisitt `User-agent: GPTBot`-blokk, mangler du dette
- Kopier malen over, tilpass for ditt domene, last opp
- Test med [vår gratis AEO-sjekk](/) som verifiserer at alle 13 er Allow-ed

Hvis du vil ha hele kontekstrammen på hvorfor disse bots betyr noe, er [hovedguiden vår til robots.txt og AI-crawlere](/artikler/robots-txt-ai-crawlere) der du bør starte. Den dekker hvorfor de er adskilte fra klassiske SEO-crawlere og hvorfor «Allow alle» ikke er det samme som å nevne hver enkelt ved navn.
