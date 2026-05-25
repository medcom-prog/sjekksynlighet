import { Link } from "react-router-dom";
import {
  Activity,
  Anchor,
  ArrowRight,
  Bot,
  BookText,
  CheckCircle2,
  Code2,
  FileSearch,
  Gauge,
  GitMerge,
  Map as MapIcon,
  MessageCircle,
  Network,
  Shield,
  ShieldCheck,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { ScanForm } from "@/components/ScanForm";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CHECK_DEFINITIONS, type CheckId } from "@/lib/checks";
import { FadeUp } from "@/components/FadeUp";

/**
 * Semantisk ikon per sjekk. Velger ikoner som visualiserer hva sjekken
 * faktisk gjør — heartbeat for «svarer», tag for «skiltet», kode for
 * «visittkort», skjold for «gjesteliste», map for «kart» osv. Holder
 * grid-en visuelt rik istedenfor 10 like ikoner.
 */
const CHECK_ICON: Record<CheckId, LucideIcon> = {
  reachable: Activity,
  meta: Tag,
  schema_org: Code2,
  key_schemas: BookText,
  robots_ai: Shield,
  sitemap: MapIcon,
  llms_txt: MessageCircle,
  www_redirect: GitMerge,
  same_as: Network,
  canonical_resolves: Anchor,
};

const FAQS: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "Hva sjekker dere egentlig?",
    a: (
      <>
        Vi kjører ti tekniske kontroller mot domenet ditt: HTTP-respons,
        title- og meta-tag, canonical, JSON-LD-skjema, robots.txt med tilgang
        for elleve AI-crawlere, sitemap.xml, llms.txt, www↔apex 301-redirect,
        sameAs til Brønnøysund/Proff/1881 og at canonical-URL faktisk
        resolver. Hver sjekk gir mellom 0 og 10 poeng.
      </>
    ),
  },
  {
    q: "Er sjekken gratis?",
    a: (
      <>
        Ja, helt gratis. Ingen konto, ingen kredittkort. Vi spør om e-post
        for å sende deg resultatet, og om telefon (valgfritt) hvis du ønsker
        oppfølging.
      </>
    ),
  },
  {
    q: "Hvor lang tid tar sjekken?",
    a: <>Mellom 8 og 20 sekunder, avhengig av hvor raskt nettsiden din svarer.</>,
  },
  {
    q: "Hva skjer med dataene mine?",
    a: (
      <>
        E-post, telefon, domene og resultat lagres i en sikker database. Vi
        bruker dataene til å sende deg resultatet og eventuelt kontakte deg
        med oppfølgingstilbud. Full GDPR-policy ligger på{" "}
        <Link to="/personvern" className="text-accent underline-offset-4 hover:underline">
          personvernsiden
        </Link>
        . Du kan kreve sletting når som helst.
      </>
    ),
  },
  {
    q: "Blir jeg ringt opp?",
    a: (
      <>
        Bare hvis du legger inn telefonnummer. Da kan vi ringe for å gå
        gjennom resultatet og foreslå tiltak. Du får resultatet på e-post
        uansett om du legger ved telefon eller ikke.
      </>
    ),
  },
  {
    q: "Hva er forskjellen på SEO og AEO?",
    a: (
      <>
        SEO handler om å rangere høyt i klassiske Google-treff. AEO (Answer
        Engine Optimization) handler om å bli sitert direkte av AI-svarmotorer
        som ChatGPT, Gemini, Perplexity og Google AI Overviews. AEO bruker
        mange av samme signaler som SEO — schema, sitemap, lastetid — men
        prioriterer annerledes.
      </>
    ),
  },
  {
    q: "Hvorfor lager dere dette gratis?",
    a: (
      <>
        Fordi vi mener tekniske AEO-grunnsteiner bør være offentlig
        tilgjengelig kunnskap, ikke en konsulent-svart boks. Hvis du vil ha
        hjelp til å tette gapene resultatet viser, kan du svare på e-posten du
        får.
      </>
    ),
  },
];

const STEPS = [
  {
    icon: Bot,
    title: "Du skriver inn domenet",
    body:
      "Vi trenger bare nettsiden, e-posten din og eventuelt telefon. Ingen registrering, ingen passord.",
  },
  {
    icon: FileSearch,
    title: "Vi kjører ti tekniske sjekker",
    body:
      "Schema, robots.txt for AI-crawlere, sitemap, canonical, llms.txt, www-redirect og mer — i parallell mot ditt live-domene.",
  },
  {
    icon: Gauge,
    title: "Du får en score og topp-5 mangler",
    body:
      "Resultatet er klart med en gang, og en kopi sendes til e-posten din. Du ser konkret hva som mangler og hvorfor det betyr noe.",
  },
] as const;

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="container relative pt-10 pb-14 sm:pt-14 sm:pb-20 lg:pt-20">
        {/* Decorative blob behind hero — subtle warmth that respects
            the brand palette without competing with content */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden"
        >
          <div className="absolute left-1/2 top-[-80px] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-3xl" />
          <div className="absolute right-[-120px] top-[40px] h-[280px] w-[420px] rounded-full bg-accent-soft/[0.10] blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div className="flex flex-col gap-6">
            <FadeUp immediate delay={0} as="div" className="flex items-center gap-3">
              <span
                aria-hidden
                className="relative inline-flex h-2 w-2"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/55">
                Gratis<span className="mx-2 text-foreground/25">/</span>
                30 sek<span className="mx-2 text-foreground/25">/</span>
                Ingen registrering
              </span>
            </FadeUp>

            <FadeUp immediate delay={80} as="h1" className="text-balance font-display text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.02em] sm:text-5xl lg:text-[3.5rem]">
              Hvor synlig er nettsiden din i{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-accent">ChatGPT</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-2.5 -skew-x-6 rounded-sm bg-accent/15"
                />
              </span>{" "}
              og Google?
            </FadeUp>

            <FadeUp immediate delay={160}>
              <p
                data-quick-answer
                className="quick-answer"
              >
                <strong>Som EU-kontroll for nettsiden din.</strong> Vi prøver
                å lese siden slik ChatGPT og Google gjør det, og forteller deg
                i klartekst hva de ikke finner. Du får en score, en topp-5-
                liste og forklaring uten teknisk-prat — alt på 30 sekunder.
              </p>
            </FadeUp>

            <FadeUp immediate delay={240} as="ul" className="grid gap-2.5 text-[15px] text-foreground/75">
              {[
                "Ti sjekker mot din live-nettside",
                "Score 0–100 i klartekst",
                "Topp-5 mangler med praktisk fiks-guide",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-good/15">
                    <CheckCircle2 className="h-3 w-3 text-good" aria-hidden />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </FadeUp>
          </div>

          {/* FORM CARD — tighter, slightly tilted-feeling shadow */}
          <FadeUp immediate delay={320} className="relative">
            <div
              aria-hidden
              className="absolute -inset-2 rounded-[28px] bg-gradient-to-br from-accent/20 via-transparent to-accent-soft/20 blur-2xl"
            />
            <div className="relative rounded-3xl border border-border/80 bg-card/95 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_-8px_rgba(13,148,136,0.15),0_30px_60px_-30px_rgba(13,148,136,0.35)] sm:p-7 backdrop-blur">
              <div className="mb-5 flex items-baseline justify-between gap-3 border-b border-border/60 pb-4">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Start din gratis sjekk
                </h2>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  ~30 sek
                </span>
              </div>
              <ScanForm autoFocus />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative border-y border-border/70 bg-white py-16 sm:py-20">
        <SectionDivider position="top" />
        <div className="container mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Slik fungerer det"
            title="Fra domene til score på 30 sekunder"
            sub="Ingen API-nøkler å sette opp, ingen browser-utvidelser å installere. Vi gjør alt arbeidet på serveren vår."
          />
          <ol className="mt-12 grid gap-5 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <FadeUp
                key={s.title}
                as="li"
                delay={i * 100}
                className="group relative isolate overflow-hidden rounded-2xl border border-border bg-background p-7 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_12px_32px_-16px_rgba(13,148,136,0.3)]"
              >
                {/* Editorial backdrop-numeral. Sitter i hjørnet og rotert
                    litt for liv. select-none + pointer-events-none så det
                    aldri kommer i veien for interaksjon. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -top-6 -z-10 select-none font-display text-[9rem] font-bold leading-none tracking-tighter text-accent/[0.07] transition-colors duration-300 group-hover:text-accent/[0.12]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-inset ring-accent/15 transition-colors group-hover:bg-accent/15">
                  <s.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="relative mt-6 font-display text-lg font-semibold leading-tight">
                  {s.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-foreground/65">
                  {s.body}
                </p>
              </FadeUp>
            ))}
          </ol>
        </div>
        <SectionDivider position="bottom" />
      </section>

      {/* STAT BAND — visuelt avbrudd med ekte tall fra artikkelmaterialet
          vårt. Dark bakgrunn for å bryte cream-rytmen og gi siden mer
          dybde og puls. */}
      <section className="relative overflow-hidden bg-foreground py-20 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, hsl(var(--accent) / 0.18) 0px, transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--accent-soft) / 0.14) 0px, transparent 55%)",
          }}
        />
        <div className="container relative mx-auto max-w-5xl">
          <FadeUp className="mb-12 max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-soft/80">
              <span aria-hidden className="mr-2 inline-block h-px w-6 align-middle bg-accent-soft/40" />
              Hvorfor det haster
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-background sm:text-[2.5rem]">
              Du er ikke lenger i én søkemotor. Du er i fem.
            </h2>
          </FadeUp>
          <div className="grid gap-12 sm:grid-cols-2 sm:gap-16">
            <FadeUp delay={120}>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[5.5rem] font-bold leading-none tracking-tight text-accent-soft sm:text-[6.5rem]">
                  47
                </span>
                <span className="font-display text-3xl font-semibold text-accent-soft/60 sm:text-4xl">
                  %
                </span>
              </div>
              <p className="mt-4 max-w-sm text-balance text-[15px] leading-relaxed text-background/75">
                av norske Google-treff har AI Overviews på toppen som ofte
                erstatter trafikken til de organiske resultatene.
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-background/35">
                Per mai 2026
              </p>
            </FadeUp>
            <FadeUp delay={220}>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[5.5rem] font-bold leading-none tracking-tight text-accent-soft sm:text-[6.5rem]">
                  35
                </span>
                <span className="font-display text-3xl font-semibold text-accent-soft/60 sm:text-4xl">
                  %
                </span>
              </div>
              <p className="mt-4 max-w-sm text-balance text-[15px] leading-relaxed text-background/75">
                av norske nettsøk skjer nå direkte i ChatGPT, Perplexity
                og Gemini. Brukerne ser aldri en Google-side.
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-background/35">
                Industri-data 2026
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* WHAT WE CHECK */}
      <section id="hva-vi-sjekker" className="container mx-auto max-w-6xl py-16 sm:py-24">
        <SectionHeader
          eyebrow="Hva vi sjekker"
          title="Ti AEO-signaler — forklart i klartekst"
          sub="Hver sjekk her er noe AI-motorer som ChatGPT og Gemini bryr seg om. Ikke noe teknisk-prat — bare hva det betyr for at kunder skal finne deg."
        />
        <ol className="mt-12 grid gap-4 sm:grid-cols-2">
          {CHECK_DEFINITIONS.map((c, i) => {
            const Icon = CHECK_ICON[c.id];
            return (
              <FadeUp
                key={c.id}
                as="li"
                delay={(i % 2) * 70 + Math.floor(i / 2) * 50}
                className="group relative isolate flex flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:bg-card/60 hover:shadow-[0_16px_36px_-18px_rgba(13,148,136,0.28)] sm:p-6"
              >
                {/* Tallet flyter som backdrop-numeral, samme editorial-
                    grep som Steps-kortene for visuell sammenheng. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-1 -top-2 -z-10 select-none font-display text-[5.5rem] font-bold leading-none tracking-tighter text-accent/[0.06] transition-colors duration-300 group-hover:text-accent/[0.10]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-inset ring-accent/20 transition-all duration-200 group-hover:bg-accent group-hover:text-accent-foreground group-hover:ring-accent">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                </div>
                <h3 className="relative font-display text-[15px] font-semibold leading-tight text-foreground sm:text-base">
                  {c.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-foreground/65">
                  {c.plain.what}
                </p>
                <div className="relative mt-4 flex items-center justify-between gap-2 border-t border-border/50 pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/45">
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden className="h-1 w-1 rounded-full bg-accent/70" />
                    {c.effort.timeToFix}
                  </span>
                  <span>{c.effort.difficulty}</span>
                </div>
              </FadeUp>
            );
          })}
        </ol>
      </section>

      {/* FAQ */}
      <section className="relative border-t border-border/70 bg-white py-16 sm:py-24">
        <SectionDivider position="top" />
        <div className="container mx-auto max-w-3xl">
          <SectionHeader
            eyebrow="Vanlige spørsmål"
            title="Korte, ærlige svar"
            sub="Mangler noe? Send en e-post til hei@sjekksynlighet.no — vi svarer innen samme dag."
          />
          <FadeUp>
            <Accordion
              type="single"
              collapsible
              className="mt-10 overflow-hidden rounded-2xl border border-border bg-background/80 px-5 backdrop-blur sm:px-7"
            >
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeUp>
        </div>
      </section>

      {/* CLOSER */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        {/* Stor halo-gradient bak hele seksjonen for å løfte CTA-en
            uten å bytte bakgrunnsfarge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent/[0.10] via-accent-soft/[0.06] to-transparent blur-3xl" />
        </div>

        <FadeUp className="container relative mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
            <span aria-hidden className="mr-2 inline-block h-px w-6 align-middle bg-accent/40" />
            Sjekken er gratis
            <span aria-hidden className="ml-2 inline-block h-px w-6 align-middle bg-accent/40" />
          </p>
          <h2 className="mt-4 font-display text-[2.25rem] font-semibold leading-[1.05] tracking-tight sm:text-[3rem]">
            Du vet på 30 sekunder hva som <span className="text-accent">mangler</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-foreground/65 sm:text-lg">
            Skroll opp, fyll inn domenet, og se nøyaktig hvilke AEO-grunnsteiner
            siden din har og hvilke som mangler. Resultatet kommer også på e-post.
          </p>
          <a
            href="#main"
            className="group mt-9 inline-flex items-center gap-2.5 rounded-2xl bg-foreground px-7 py-4 text-[15px] font-semibold text-background shadow-[0_2px_4px_rgba(0,0,0,0.08),0_16px_36px_-16px_rgba(15,20,25,0.5)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-accent hover:scale-[1.03] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08),0_24px_48px_-16px_hsl(var(--accent)/0.55)] active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Start gratis sjekk
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
          </a>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-foreground/40">
            Ingen registrering · Ingen kredittkort · Resultatet ditt for evig
          </p>
        </FadeUp>
      </section>
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  // Scroll-trigget stagger på eyebrow/title/sub. Hele headeren glir
  // inn rytmisk når brukeren scroller seksjonen i view, så ingen
  // section noensinne føles «død» ved første introduksjon.
  return (
    <div className="mx-auto max-w-2xl text-center">
      <FadeUp as="p" delay={0} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        <span aria-hidden className="h-px w-6 bg-accent/40" />
        {eyebrow}
        <span aria-hidden className="h-px w-6 bg-accent/40" />
      </FadeUp>
      <FadeUp as="h2" delay={80} className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </FadeUp>
      {sub ? (
        <FadeUp as="p" delay={160} className="mx-auto mt-4 max-w-xl text-pretty text-foreground/70">
          {sub}
        </FadeUp>
      ) : null}
    </div>
  );
}

/**
 * Tynn linje med en sentral teal-prikk. Brukes som myk dekor i toppen
 * og bunnen av "bånd"-seksjoner — gir visuell rytme uten å bruke en
 * hard divider. Pointer-events-none og aria-hidden.
 */
function SectionDivider({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 ${
        position === "top" ? "-top-3" : "-bottom-3"
      } flex justify-center`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent/30 ring-4 ring-background" />
    </div>
  );
}
