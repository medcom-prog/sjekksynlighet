# sjekksynlighet.no

Gratis AI-synlighetscheck for nettsider. Bruker skriver inn et domene,
vi kjører ti tekniske AEO/SEO-kontroller på under 30 sekunder, gir en
score (0–100) og en konkret tiltakliste.

Selvstendig, brand-separert verktøy. Medcom AS er navngitt
behandlingsansvarlig (GDPR-krav) men opererer ellers ikke synlig på
selve siden — leads ringes opp manuelt fra Medcom-portalen.

## Stack

- **Frontend:** Vite 5 + React 18 + TypeScript + Tailwind 3 + shadcn/Radix + React Router 6
- **Backend:** Vercel serverless (`api/scan.ts`) — Node-runtime, opp til 30 s
- **Database:** Supabase Postgres (samme prosjekt som medcom-portal: `bhwzzzzqxhejuqfpzejd`), egen tabell `synlighet_leads`
- **E-post:** Resend (egen API-key for sjekksynlighet.no)
- **Hosting:** Vercel (Frankfurt)

## Lokal utvikling

```bash
npm install
cp .env.example .env
# fyll inn RESEND_API_KEY og SUPABASE_SERVICE_ROLE_KEY for å teste full stack
npm run dev          # http://localhost:8080
npm run build        # produksjons-build + prerender
npm run typecheck    # tsc --noEmit
```

Når du tester API-en lokalt: Vite serverer kun frontend. Bruk
`vercel dev` eller deploy en preview til Vercel for å teste hele
flyten ende-til-ende.

## Miljøvariabler (Vercel Dashboard → Project Settings)

| Variabel | Hvor brukes | Hva |
|---|---|---|
| `SUPABASE_URL` | `api/scan.ts` | `https://bhwzzzzqxhejuqfpzejd.supabase.co` |
| `SUPABASE_ANON_KEY` | `api/scan.ts` | Anon-nøkkel (ikke service_role). INSERT håndheves via RLS-policy `anon insert leads` |
| `RESEND_API_KEY` | `api/scan.ts` | Egen Resend-konto for sjekksynlighet.no |
| `CONTACT_FROM_EMAIL` | `api/scan.ts` | `"Sjekksynlighet <noreply@sjekksynlighet.no>"` |
| `IP_HASH_SALT` | `api/scan.ts` | Tilfeldig streng for IP-hashing. Bør ikke endres etter produksjon |

> **OBS — Resend domeneverifisering:** Hvis sjekksynlighet.no ikke er
> verifisert i Resend ved første deploy, sett `CONTACT_FROM_EMAIL` til
> `"Sjekksynlighet <onboarding@resend.dev>"` midlertidig. **Aldri** bruk
> en @medcom.no-adresse — det bryter brand-separasjonen.

## Arkitektur — flyten

```
Bruker fyller form på /
        ↓ react-hook-form + zod (client-side validering)
/sjekker (loading-side) — viser progresjon mens scan kjører
        ↓ POST /api/scan { domain, email, phone?, name?, firma? }
api/scan.ts (Vercel serverless)
        ↓ rate-limit (5/IP/time) → 10 parallelle sjekker
        ↓ INSERT synlighet_leads (Supabase)
        ↓ Resend.send auto-reply
        ↓ returnerer { ok, scanId, score, issues[] }
/resultat?id=<scanId> — leser fra sessionStorage, viser gauge + topp-5
```

## De ti sjekkene

Spesifisert i [`src/lib/checks.ts`](src/lib/checks.ts), implementert i
[`api/scan.ts`](api/scan.ts):

1. Reachable (HTTP 200)
2. Title + meta description + canonical
3. Schema.org JSON-LD finnes
4. Nøkkel-skjema-typer (Org + WebSite + en av LocalBusiness/Service/...)
5. robots.txt har Allow for 11 AI-bots
6. sitemap.xml ferskt og komplett
7. llms.txt finnes
8. www↔apex 301 (ikke 307)
9. sameAs til Brønnøysund + Proff + 1881
10. Canonical-URL resolver

Hver sjekk gir 0–10 poeng. Total 100, fem tier-er (Kritisk/Svak/OK/God/Ypperste).

## AEO-grunnmur på sjekksynlighet.no selv

Vi skal selv score 85+/100. Implementert:

- Sitewide `@graph` i `index.html` (Organization + WebApplication + WebSite + WebPage + FAQPage med Speakable)
- `scripts/prerender-routes.mjs` lager `dist/personvern/index.html` med per-route schema
- `scripts/generate-sitemap.mjs` regenererer `public/sitemap.xml` med fresh lastmod hver build
- `public/robots.txt` med eksplisitt Allow for 20+ bots (11 AI + klassisk + sosiale)
- `public/llms.txt` strukturert per llmstxt.org-spec, under 500 linjer
- Quick Answer-blokk (`.quick-answer` + `data-quick-answer`) i hero og resultat
- WebPage + SpeakableSpecification med CSS-selectors mot H1 + quick-answer

## Vercel deploy

1. Importer GitHub-repo i Vercel Dashboard
2. Sett miljøvariablene over
3. Koble på sjekksynlighet.no-domene (apex) + bekreft DNS via Domeneshop
4. Sett apex som primær (ikke www) i Vercel → Domains → Redirect type = Permanent (301)
5. Verifiser at `https://sjekksynlighet.no/api/scan` svarer (POST med JSON)

## TODO etter første merge

- [ ] Resend: opprett egen konto + verifiser sjekksynlighet.no-domenet
- [ ] Generer en ekte `og-image.png` (1200x630) — i dag er bare `og-image.svg`
- [ ] Generér `favicon.ico` + `apple-touch-icon.png` fra `favicon.svg`
- [ ] (v2) Optimistisk UI på resultat-siden ved cache-miss — fetch fra Supabase
- [ ] (v2) Eksport av rapport som PDF
