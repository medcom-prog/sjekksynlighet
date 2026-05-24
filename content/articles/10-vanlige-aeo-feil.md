---
title: "10 vanlige AEO-feil norske bedrifter gjør (og hvor lett de er å fikse)"
slug: "10-vanlige-aeo-feil"
meta_title: "10 vanlige AEO-feil norske bedrifter gjør i 2026"
meta_description: "De ti mest vanlige feilene vi ser i norske AEO-audits, fra glemte AI-bots i robots.txt til tom Person-schema. Med tid-til-fiks for hver."
published_at: "2026-05-25"
updated_at: "2026-05-25"
keyword: "vanlige AEO-feil"
author: "shad"
topic: "aeo-grunnlag"
---

> **Kort fortalt:** De ti mest vanlige AEO-feilene vi finner i audits er nesten alle 15-30-minutters-fiks. De fleste handler om manglende eksplisitt tillatelse til AI-bots, manglende sameAs-graf eller manglende første-paragraf-Quick-Answer. Ingen av dem krever omskrivning av nettsiden. Bare små, riktige grep på de riktige stedene.

Vi har kjørt over 60 AEO-audits på norske bedrifter de siste 12 månedene. Det er overraskende stort overlapp i hva som mangler. Her er de ti mest repetitive feilene, sortert etter hvor enkelt det er å fikse.

## 1. Ingen eksplisitt Allow for GPTBot, ClaudeBot eller PerplexityBot i robots.txt

Den klart vanligste feilen. robots.txt har bare `User-agent: *` og en `Allow: /`. AI-bots tolker det som tvetydig og hopper ofte over deg.

**Fiks (5 minutter):** Legg til eksplisitt `User-agent: GPTBot` etterfulgt av `Allow: /`, og gjenta for ClaudeBot, OAI-SearchBot, Claude-User, PerplexityBot, Google-Extended, CCBot, og 4-5 andre. Hele detaljen er i [robots.txt-pillaren vår](/artikler/robots-txt-ai-crawlere).

## 2. Ingen sameAs-lenker til Brønnøysund eller Proff

`Organization`-schemaet ditt sier «Vi er Acme AS», men AI-modellen har ingen måte å verifisere at du er en ekte norsk bedrift. Brønnøysund-, Proff- og 1881-lenker er det sterkeste signalet du kan gi.

**Fiks (10 minutter):** Finn ditt org-nummer, bygg URL-ene til Brønnøysund (`brreg.no/enhet/<orgnr>`), Proff (søk på navnet ditt) og 1881 (søk). Legg dem som array i `sameAs`-feltet i Organization-schemaet.

## 3. Ingen Quick Answer-blokk øverst på pillar-sider

Hovedsiden din starter med «Vi er Norges ledende leverandør av X. Med over 20 års erfaring...». AI-modeller plukker første-blokk-innhold med 74 prosent rate, så de plukker det du sier først. Hvis det er en intro, blir det aldri sitert.

**Fiks (15 minutter per side):** Skriv om første 60-80 ord til å svare direkte på hovedspørsmålet til siden. «Vi leverer X til norske bedrifter. Det betyr Y. Hvis du lurer på Z, er svaret W.» Pakk det inn i en `<div class="quick-answer">` så schema-en kan peke på det via `speakable.cssSelector`.

## 4. Ingen llms.txt ved nettsidens rot

Mange norske bedrifter har ikke hørt om llms.txt. Det er en standard fra 2024 som AI-modeller leser FØRST for å forstå hva siden handler om.

**Fiks (10 minutter):** Lag en fil `llms.txt` ved rot med navn, en setnings beskrivelse, og liste over hovedseksjoner med URL-er. Følger [llmstxt.org-specen](https://llmstxt.org/).

## 5. Apex og www peker ikke konsekvent (eller bruker 307 i stedet for 301)

`dittfirma.no` og `www.dittfirma.no` lever begge som separate URL-er. AI-modeller behandler dem som to ulike entiteter og splitter equity-en.

**Fiks (5 minutter i Vercel/CDN):** Velg én kanonisk variant (vanligvis www). 301-redirect den andre dit. Ikke 307. 307 er midlertidig og Google og AI-bots tolker det som «kanskje kommer den tilbake». 301 er permanent.

## 6. Canonical-tagger peker på domener som ikke resolver

Ofte sett etter migrering: canonical peker på `dittfirma.no/page` men det domenet er ennå ikke aktivt. Canonical brukes av AI-bots til å forstå hvilken URL som er sannheten. En død URL betyr at hele siden anses som ufullstendig.

**Fiks (5 minutter):** Kjør canonical-URL gjennom curl. Den må returnere 2xx. Hvis ikke, oppdater til en URL som faktisk svarer.

## 7. FAQPage-schema med fyll-spørsmål, ikke ekte kundespørsmål

«Hva er prisen?» og «Hvor finner jeg deg?» er fyll. AI-modeller plukker FAQ-svar bokstavelig. Hvis FAQ-en din ikke svarer på det folk faktisk lurer på, blir den ikke brukt.

**Fiks (30 minutter):** Spør salgs- eller kundeservice-teamet ditt om de fem-syv vanligste spørsmålene de får i pre-salg. Skriv FAQ rundt dem. Marker opp med `FAQPage`-schema. Hvert spørsmål blir en separat siterings-mulighet.

## 8. Person-schema mangler helt eller har bare navn

Forfatter-attribusjon på blogginnlegg er bare `<p>Skrevet av Ola Nordmann</p>`. AI-modeller har ingen måte å vekte hvor mye de stoler på forfatteren.

**Fiks (20 minutter per forfatter):** Lag `Person`-schema med `name`, `jobTitle`, `worksFor` (peker til Organization), `knowsAbout` (array av tema), `sameAs` (LinkedIn). E-E-A-T-grunnmuren ferdig.

## 9. Inkonsistent NAP (Name, Address, Phone) på tvers av kilder

Telefonnummer formatert som `+47 22 33 44 55` på nettsiden, `22334455` i schema, `(22) 33 44 55` i GBP. AI-modeller leser disse som ulike numre. De flagger som ufullstendig og prioriterer deg ned.

**Fiks (15 minutter):** Velg ett format. Bruk det overalt. Brønnøysund, Proff, 1881, GBP, schema, nettside, sosiale profiler. Identisk.

## 10. Ingen ItemList eller HowTo-schema på prosess-sider

Sider som forklarer «slik fungerer det» eller «slik gjør du X» har bra innhold men ingen schema-markup. AI-modeller siterer HowTo-strukturer med 3-4 ganger så høy rate som tilsvarende flytetekst.

**Fiks (20 minutter per side):** Identifiser stegene på siden. Legg til `HowTo`-schema med `step`-array, hver med `name` og `text`. AI-modeller kan nå plukke hele steget som én sitering.

## Hva alle ti har til felles

Det er små grep. Ingen krever omskriving. Ingen krever ny design. Ingen krever ny utvikler. Hver enkelt tar 5-30 minutter, og de fleste norske bedrifter har minst halvparten av dem ufiksede.

Den enkleste måten å vite hvilke som gjelder deg: [kjør en gratis AEO-sjekk](/) på domenet ditt. Vi ser etter alle ti og forteller deg eksplisitt hvilke som mangler.

For mer dybde på hvorfor disse signalene betyr noe på et arkitektur-nivå, har [hovedguiden vår til AEO](/artikler/hva-er-aeo) hele kontekstrammen.
