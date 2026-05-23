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
      <section className="container relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-7">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Helt gratis · Ingen
              registrering
            </span>

            <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Hvor synlig er nettsiden din i{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-accent">ChatGPT</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-2 -skew-x-6 rounded-sm bg-accent/15"
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
              liste over hva som mangler. Tar 30 sekunder.
            </p>

            <ul className="grid gap-2.5 text-sm text-muted-foreground sm:text-[15px]">
              {[
                "Ti tekniske sjekker mot live-domene",
                "Score 0–100 med fem nivåer",
                "Topp-5 mangler med konkrete forslag",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-good" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FORM CARD */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-accent/15 via-transparent to-accent-soft/15 blur-xl"
            />
            <div className="relative rounded-3xl border border-border bg-card p-6 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(13,148,136,0.25)] sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="font-display text-lg font-semibold">
                  Start din gratis sjekk
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-good/10 px-2.5 py-1 text-xs font-medium text-good">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-good" />
                  Live nå
                </span>
              </div>
              <ScanForm autoFocus />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border/60 bg-white/40 py-16 sm:py-20">
        <div className="container mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Slik fungerer det"
            title="Fra domene til score på 30 sekunder"
            sub="Ingen API-nøkler å sette opp, ingen browser-utvidelser å installere. Vi gjør alt arbeidet på serveren vår."
          />
          <ol className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="relative flex flex-col gap-4 rounded-2xl border border-border bg-background/60 p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <s.icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs font-bold text-accent/70">
                    0{i + 1}
                  </span>
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
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
              className="group relative flex gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md sm:p-6"
            >
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-xs font-bold text-accent"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-[15px] font-semibold text-foreground sm:text-base">
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {c.what}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-white/40 py-16 sm:py-24">
        <div className="container mx-auto max-w-3xl">
          <SectionHeader
            eyebrow="Vanlige spørsmål"
            title="Korte, ærlige svar"
            sub="Mangler noe? Send en e-post til hei@sjekksynlighet.no — vi svarer innen samme dag."
          />
          <Accordion
            type="single"
            collapsible
            className="mt-10 rounded-2xl border border-border bg-card px-5 sm:px-8"
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
      <section className="container mx-auto max-w-3xl py-16 text-center sm:py-24">
        <ShieldCheck className="mx-auto h-10 w-10 text-accent/70" aria-hidden />
        <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
          Klar til å se hvor du står?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
          Skroll opp og fyll inn domenet. Du får en score og en konkret tiltakliste på 30 sekunder — alt kommer også på e-posten din.
        </p>
        <a
          href="#main"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-soft"
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
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {sub ? (
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          {sub}
        </p>
      ) : null}
    </div>
  );
}
