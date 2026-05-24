---
title: "llms.txt-standarden: hva det er og hvorfor det betyr noe i 2026"
slug: "llms-txt-standarden"
meta_title: "llms.txt: standarden for AI-modeller, forklart enkelt"
meta_description: "llms.txt er en kort fil ved nettsidens rot som AI-modeller leser FØRST. Vi forklarer specen, viser et eksempel og forklarer hvorfor det blir obligatorisk."
published_at: "2026-05-25"
updated_at: "2026-05-25"
keyword: "llms.txt standarden"
author: "shad"
topic: "ai-crawlere"
---

> **Kort fortalt:** llms.txt er en plain-text fil ved rot på nettsiden din som AI-modeller leser før alt annet. Den gir en kort oppsummering av hva siden handler om og lister hovedseksjonene med URL-er. Per mai 2026 er det ennå ikke obligatorisk, men ChatGPT, Claude og Perplexity bruker den allerede hvis den finnes. Det tar 15 minutter å lage.

I 2024 publiserte den australske utvikleren Jeremy Howard et forslag til en ny webstandard: llms.txt. Tanken var enkel. AI-modeller trenger en strukturert «elevator pitch» av en nettside som er enklere å parse enn å crawle hele siden. På to år har det blitt en de-facto standard som de største AI-leverandørene har implementert støtte for.

## Hvorfor det trengs

AI-svarmotorer har et grunnleggende problem. Når noen spør «hva tilbyr Acme AS?», må modellen finne ut det fra Acmes nettside. Den kan crawle hele siden, men det er dyrt og treigt, og det meste av siden er navigasjon, footer, tracking-skript og repetitiv boilerplate.

llms.txt løser dette ved å gi en strukturert oppsummering. AI-modellen leser filen først, får oversikten, og bestemmer hvilke konkrete sider den må crawle for dypere innhold.

For norske bedrifter med begrenset crawler-budsjett (AI-bots bruker rate limiting per domene) betyr det at de viktigste sidene dine blir lest, ikke at AI-en bruker hele budsjettet på å snuble gjennom navigasjon og footer-kopi.

## Specen, kort versjon

Den fullstendige [llms.txt-specen](https://llmstxt.org/) er bare et par sider. Hovedregler:

- Filen heter `llms.txt` og ligger på rot: `https://dittfirma.no/llms.txt`
- Filen er Markdown
- Én H1 med bedriftsnavn
- Én blockquote-paragraf med kort beskrivelse (1-3 setninger)
- Valgfritt: introducerende paragrafer
- Seksjoner med H2, hver med liste av URL-er

Eksempel:

```
# Acme AS

> Acme leverer regnskap og rådgivning til norske bedrifter, med spesialisering på små og mellomstore selskaper i Oslo-området.

Vi er et autorisert regnskapsfirma med 22 ansatte. Etablert 2008.

## Tjenester

- [Regnskap](https://dittfirma.no/tjenester/regnskap): Månedlig regnskapsføring og årsoppgjør for AS og ENK
- [Lønn](https://dittfirma.no/tjenester/lonn): Lønnsadministrasjon og A-meldinger
- [Rådgivning](https://dittfirma.no/tjenester/radgivning): Strategi for skattlegging og selskapsstruktur

## Kunnskap

- [Hva koster regnskapsfører i Oslo](https://dittfirma.no/artikler/hva-koster-regnskap)
- [Slik velger du regnskapsbyrå](https://dittfirma.no/artikler/velge-regnskapsbyra)
- [Skattefradrag for små bedrifter 2026](https://dittfirma.no/artikler/skattefradrag-2026)

## Kontakt

- [Be om tilbud](https://dittfirma.no/kontakt)
- post@dittfirma.no
- +47 22 33 44 55
```

Det er hele filen. Maks 100-150 linjer. Mer er sjelden nyttig.

## Hvilke AI-modeller bruker det

Per mai 2026 har vi bekreftet at følgende AI-modeller leser llms.txt når den finnes:

- **ChatGPT** (OpenAI) leser den via OAI-SearchBot
- **Claude** (Anthropic) leser den via Claude-User
- **Perplexity** prioriterer den høyt i retrieval-rangering
- **Google AI Overviews** har eksperimentell støtte (uoffisielt bekreftet)
- **Gemini** leser den men vekter den lavere enn primær crawl

Det er ikke alle som bruker den ennå, men det vokser. På samme måte som robots.txt en gang var bare et forslag før det ble universell standard, er llms.txt på vei i samme retning.

## Hva du IKKE bør gjøre

Vi har sett noen mønstre i implementeringer som faktisk skader mer enn de hjelper:

**Skriv ikke en hel side i llms.txt.** Det er en oppsummering, ikke en kopi av nettsiden din. Hvis filen blir over 200 linjer, har du gjort feil. Kort er bedre.

**Bruk ikke marketing-prat.** «Vi er Norges ledende leverandør med 25 års erfaring og dedikerte spesialister.» AI-modeller filtrerer ut superlativer. Hold deg til faktum: hva du tilbyr, hvor du er, hva som er hovedsidene.

**Glem ikke å oppdatere den.** Hvis du legger til en ny tjeneste eller en ny pillar-artikkel, oppdater llms.txt. En stale fil er verre enn ingen fil. AI-modeller stoler mindre på sider som har inkonsistens mellom llms.txt og faktisk innhold.

**Ikke duplikat med sitemap.** llms.txt er IKKE en flat liste av alle URL-er. Det er kuratert oversikt av de viktigste sidene, gruppert etter tema. Sitemap.xml er den uttømmende listen for søkemotorer. De har ulike formål.

:::technical
For utviklere: hvordan generere llms.txt automatisk fra eksisterende innhold:

1. **Statiske sider:** Lag en JSON-konfigurasjon som lister kuraterte sider (forside, tjenester, viktige artikler) med beskrivelse. Bygg llms.txt fra det ved hver deploy.

2. **Dynamiske sider (blogg):** Generer en seksjon basert på de 10 mest populære artiklene (Google Analytics-data, eller manuelt sortert). Hver artikkel: tittel + URL + en setnings beskrivelse fra meta_description.

3. **Cache + revalidate:** llms.txt er en statisk fil for sluttbrukeren, men du kan regenerere den i en build-step eller en scheduled function. På Vercel: ISR med revalidate=86400 (daglig).

4. **Test:** `curl -A "Claude-User" https://dittfirma.no/llms.txt` skal returnere 200 og innholdet ditt. Sjekk Content-Type er `text/plain` eller `text/markdown`.

For Vercel/Vite-prosjekter: legg llms.txt i `public/` (Vite) eller `app/` (Next App Router). For Wordpress: legg den i WP-root manuelt eller via plugin.
:::

## Hva som kommer i 2027

llms.txt-specen utvikles fortsatt. Forslag som vurderes for v2:

- `llms-full.txt`-variant med utvidet innhold (full tekst på pillar-sider) for AI-modeller som vil ha mer kontekst uten å crawle
- Metadata-felter for last-updated og content-language
- Eksplisitt prising/produkt-data for e-handel

For nå er v1 stabil og dekker det fleste norske bedrifter trenger.

## Skal du legge til llms.txt nå eller vente?

Nå. Det tar 15 minutter, det skader ikke noe, og det blir lest av de største AI-modellene allerede.

For en konkret sjekk på om filen din ligger på rot og er korrekt formatert: [kjør den gratis AEO-sjekken vår](/). Vi tester for tilstedeværelse, format og lengde, og forteller deg om det er noe som mangler.

Hvis du vil ha hele konteksten på AI-bots og crawler-policy, dekker [robots.txt-pillaren vår](/artikler/robots-txt-ai-crawlere) hvem de er, hva de gjør, og hvordan llms.txt passer inn i den større puslespillet.
