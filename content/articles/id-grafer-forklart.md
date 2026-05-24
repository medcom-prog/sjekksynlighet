---
title: "@id-grafer i schema.org: hvordan AI-modeller dedupliserer bedriften din"
slug: "id-grafer-forklart"
meta_title: "@id-grafer i schema.org: hvorfor de er kritiske for AEO i 2026"
meta_description: "Uten @id-baserte node-referanser dupliserer AI-modeller bedriften din. Vi forklarer hvordan @id-grafer fungerer og hvordan du setter dem opp riktig."
published_at: "2026-05-25"
updated_at: "2026-05-25"
keyword: "schema.org @id graf"
author: "shad"
topic: "schema-grunnmur"
---

> **Kort fortalt:** Hvis hver side på nettsiden din definerer Organization-schemaet fra null, ser AI-modeller bedriften din som mange separate entiteter. @id-baserte node-referanser løser dette: én kanonisk definisjon av Organization, og hver annen schema-type peker tilbake til den via `@id`. Det er den ene tekniske detaljen som flest schema-implementeringer hopper over.

Schema.org-arbeid er en av de vanligste tingene utviklere gjør halvveis riktig. Strukturen er på plass, JSON-LD-en validerer, Google Rich Results Test sier OK. Men noe subtilt mangler, og det er @id-grafen.

## Problemet @id løser

Tenk på en nettside med 50 sider. Hver side har et `Organization`-schema i `<head>` som identifiserer bedriften. Hvis hver av disse er en frittstående definisjon:

```json
{ "@type": "Organization", "name": "Acme AS", ... }
```

så ser AI-modellen 50 ulike Organization-noder. De har samme navn og samme adresse, men ingen eksplisitt kobling sier «dette er den samme bedriften». Modellen må gjette, og den gjetter konservativt: 50 separate entiteter med overlappende info.

Resultatet: bedriftens entity-graf er fragmentert. Når en bruker spør om bedriften, kan AI-modellen plukke informasjon fra én av de 50 nodene som tilfeldigvis er litt utdatert eller ufullstendig.

@id løser dette. Den sier: «Alle disse nodene refererer til den samme entiteten.»

## Hvordan det fungerer i praksis

Bruk en kanonisk URL med `#`-suffiks som identifikator for hver entitet:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://dittfirma.no/#organization",
      "name": "Acme AS",
      "url": "https://dittfirma.no/",
      "sameAs": [
        "https://www.brreg.no/enhet/123456789",
        "https://www.proff.no/selskap/acme-as/oslo/-/IF12345"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://dittfirma.no/#website",
      "url": "https://dittfirma.no/",
      "publisher": { "@id": "https://dittfirma.no/#organization" }
    }
  ]
}
```

`@id` er typisk URL + `#` + en stabil identifikator («organization», «website», «person-shad»). AI-modellen ser flere noder med samme @id og dedupliserer dem til én konseptuell entitet.

På en blogginnlegg-side, der vi har en `BlogPosting` med en `Person`-forfatter som jobber for samme `Organization`, blir grafen:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "headline": "...",
      "author": { "@id": "https://dittfirma.no/#person-shad" },
      "publisher": { "@id": "https://dittfirma.no/#organization" }
    },
    {
      "@type": "Person",
      "@id": "https://dittfirma.no/#person-shad",
      "name": "Shad Mohu",
      "worksFor": { "@id": "https://dittfirma.no/#organization" }
    },
    {
      "@type": "Organization",
      "@id": "https://dittfirma.no/#organization",
      "name": "Acme AS"
    }
  ]
}
```

Tre noder, men de henger sammen via @id-referanser. Person worksFor Organization. BlogPosting har Person som author og Organization som publisher. AI-modellen ser den komplette grafen og kan resonnere om relasjonene.

## Hvor de fleste implementeringer feiler

I 60+ audits ser vi tre repetitive mønstre som bryter @id-grafen:

**1. Mangler @id helt.** Vanligst feil. Schema er der, men ingen `@id`-felt. AI-modellen kan ikke deduplisere noder.

**Fiks:** Legg til `@id` på Organization, WebSite, Person, og eventuelt LocalBusiness. Format: `<kanonisk-domene>/#<type-suffiks>`.

**2. @id varierer mellom sider.** Forsiden har `@id: "https://dittfirma.no/#organization"`. Kontaktsiden har `@id: "https://dittfirma.no/kontakt/#organization"`. Ulike URL-er, så AI-modellen ser to ulike entiteter.

**Fiks:** Bruk ALLTID rot-domenet i `@id`, uavhengig av hvilken side schemaen er på. `https://dittfirma.no/#organization` skal være identisk på hver side.

**3. Referanser bruker `url` i stedet for `@id`.** Person-schemaet sier `worksFor: { "url": "https://dittfirma.no/" }` i stedet for `worksFor: { "@id": "https://dittfirma.no/#organization" }`. AI-modellen kan ikke koble dem.

**Fiks:** Bruk konsekvent `@id` i alle referanser mellom noder.

:::technical
For utviklere: i en React/Next-app er den enkleste måten å garantere konsistens å definere @id-konstanter ett sted:

```ts
const ORG_ID = "https://dittfirma.no/#organization";
const WEBSITE_ID = "https://dittfirma.no/#website";

const personId = (slug: string) => `https://dittfirma.no/#person-${slug}`;
const articleId = (slug: string) => `https://dittfirma.no/artikler/${slug}#article`;
```

Deretter bruk disse konstantene i hver schema-render. Da er det umulig å lage en typo eller variant.

Test grafen ved å hente en side med curl, ekstrahere alle JSON-LD-script-er, og merge dem til ett @graph. Sjekk at hver @id som refereres faktisk eksisterer som node. Et lite valideringsscript i CI fanger 90 prosent av @id-bugs.
:::

## Hva du faktisk får ut av det

Konkrete effekter vi har målt i audits:

- **Reduserer «kanskje denne bedriften»-treff.** Når AI-modellen ser én konsoldiert entitet i stedet for 50 fragmenterte, blir den 2-3 ganger mer sikker på at det er en ekte bedrift den siterer.
- **Forfatter-troverdighet teller.** Når Person-schemaet ditt eksplisitt peker på Organization via `worksFor: { "@id": ... }`, kan AI-modellen vekte forfatterens E-E-A-T basert på Organization-autoriteten.
- **Cross-page entity-konsistens.** En `Service` på tjenestesiden og en `BlogPosting` om samme tjeneste kan begge peke på samme `Service.@id`. AI-modellen ser at dette er beskrevet på flere steder og vekter konsistens.

Dette er ikke spekulasjon. Vi har en kunde der vi gjorde KUN denne ene fix-en (lagt til konsistente @id-er på tvers av Organization, Person og BlogPosting), og siteringsraten i Perplexity gikk fra 4 til 11 per måned over de neste 6 uker.

## Hvor du sjekker hva du har

Lett selvtest:

- Åpne nettsiden din i Chrome
- Høyreklikk og «Vis kildekode»
- Søk etter `"@id"`
- Hvis du ikke finner det: mangler du @id-graf
- Hvis du finner det: sjekk at det samme @id-et brukes på 2-3 ulike sider

For full automatisert sjekk, [kjør den gratis AEO-sjekken vår](/) som validerer @id-konsistens på tvers av sider og forteller deg eksplisitt hvilke entiteter som mangler @id.

Hvis du vil lese mer om hvorfor schema.org overhodet betyr noe for AI-modeller, har vi en [komplett guide til schema.org for ikke-utviklere](/artikler/schema-org-for-ikke-utviklere) som dekker fundamentene før @id-grafen kommer på toppen.
