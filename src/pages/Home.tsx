import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileSearch,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { ScanForm } from "@/components/ScanForm";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CHECK_DEFINITIONS } from "@/lib/checks";

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
    icon: Sparkles,
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
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/25 bg-white/70 px-3 py-1 text-xs font-semibold text-accent shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Gratis · 30 sekunder · Ingen registrering
            </span>

            <h1 className="text-balance font-display text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.02em] sm:text-5xl lg:text-[3.5rem]">
              Hvor synlig er nettsiden din i{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-accent">ChatGPT</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-2.5 -skew-x-6 rounded-sm bg-accent/15"
                />
              </span>{" "}
              og Google?
            </h1>

            <p
              data-quick-answer
              className="quick-answer"
            >
              <strong>Kort fortalt:</strong> Vi henter forsiden din og kjører
              ti tekniske kontroller for å se hvor godt AI-motorer som
              ChatGPT, Perplexity og Google AI Overviews kan lese den.{" "}
              Du får en score fra 0 til 100, en kopi på e-post og en konkret
              liste over hva som mangler.
            </p>

            <ul className="grid gap-2.5 text-[15px] text-foreground/75">
              {[
                "Ti tekniske sjekker mot live-domene",
                "Score 0–100 med fem nivåer",
                "Topp-5 mangler med konkrete forslag",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-good/15">
                    <CheckCircle2 className="h-3 w-3 text-good" aria-hidden />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FORM CARD — tighter, slightly tilted-feeling shadow */}
          <div className="relative">
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
          </div>
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
              <li
                key={s.title}
                className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_8px_24px_-12px_rgba(13,148,136,0.25)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/15">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <span className="font-mono text-xs font-bold tracking-wider text-accent">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold leading-tight">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/65">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
        <SectionDivider position="bottom" />
      </section>

      {/* WHAT WE CHECK */}
      <section id="hva-vi-sjekker" className="container mx-auto max-w-6xl py-16 sm:py-24">
        <SectionHeader
          eyebrow="Hva vi sjekker"
          title="De ti tekniske AEO-signalene som faktisk teller"
          sub="Hver sjekk er hentet fra ekte revisjoner av norske nettsider og oppdaterte AI-crawler-spesifikasjoner."
        />
        <ol className="mt-12 grid gap-4 sm:grid-cols-2">
          {CHECK_DEFINITIONS.map((c, i) => (
            <li
              key={c.id}
              className="group relative flex gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_8px_24px_-12px_rgba(13,148,136,0.2)] sm:p-6"
            >
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-[13px] font-bold text-accent ring-1 ring-inset ring-accent/20 transition-colors group-hover:bg-accent/15"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-[15px] font-semibold text-foreground sm:text-base">
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/65">
                  {c.what}
                </p>
              </div>
            </li>
          ))}
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
        </div>
      </section>

      {/* CLOSER */}
      <section className="container mx-auto max-w-3xl py-20 text-center sm:py-28">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-inset ring-accent/20">
          <ShieldCheck className="h-7 w-7 text-accent" aria-hidden />
        </div>
        <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Klar til å se hvor du står?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-foreground/70">
          Skroll opp og fyll inn domenet. Du får en score og en konkret tiltakliste på 30 sekunder — alt kommer også på e-posten din.
        </p>
        <a
          href="#main"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05),0_8px_24px_-12px_hsl(var(--accent)/0.65)] transition-colors hover:bg-accent-soft"
        >
          Start sjekken
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
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
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        <span aria-hidden className="h-px w-6 bg-accent/40" />
        {eyebrow}
        <span aria-hidden className="h-px w-6 bg-accent/40" />
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {sub ? (
        <p className="mx-auto mt-4 max-w-xl text-pretty text-foreground/70">
          {sub}
        </p>
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
