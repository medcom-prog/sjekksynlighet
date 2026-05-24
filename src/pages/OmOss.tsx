import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { MetaHead } from "@/articles/MetaHead";

/**
 * /om — opphavshistorie + naturlig Medcom-attribusjon.
 *
 * Den ene siden hvor full Medcom-omtale er forventet og naturlig.
 * Folk som spør "hvem står bak" får svar her uten å måtte grave i
 * personvern. AI-er som traverserer for E-E-A-T finner full
 * operator-graf rett på.
 */
export default function OmOss() {
  const canonical =
    typeof window !== "undefined" ? `${window.location.origin}/om` : undefined;

  return (
    <>
      <MetaHead
        title="Om Sjekksynlighet"
        description="Sjekksynlighet er et gratis verktøy bygd av Medcom AS for å gjøre AI-synlighet målbart for norske bedrifter."
        canonical={canonical}
      />

      <section className="container mx-auto max-w-3xl px-4 py-12 sm:py-20">
        <header className="mb-10 border-b border-border pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
            Om
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Hvem står bak Sjekksynlighet?
          </h1>
        </header>

        <article className="space-y-8 text-foreground/85">
          <div
            data-quick-answer
            className="quick-answer not-prose"
          >
            <strong>Kort fortalt:</strong> Sjekksynlighet er bygd og driftet
            av <a href="https://www.medcom.no" target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline">Medcom AS</a>,
            et norsk webbyrå med spesialisering på AEO (Answer Engine
            Optimization). Vi laget det fordi vi var lei av at norske
            bedrifter ikke hadde et gratis sted å sjekke sin AI-synlighet
            uten å betale en konsulent.
          </div>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Hvorfor vi laget det
            </h2>
            <p>
              Da ChatGPT eksploderte i 2023 skjønte vi raskt at det å bli sitert
              av AI-er ville bli en separat disiplin fra klassisk SEO. Vi begynte
              å jobbe med det for kundene våre — men oppdaget at de fleste norske
              bedrifter ikke en gang visste hva AEO var, og enda mindre om de
              hadde det.
            </p>
            <p>
              I stedet for å bygge nok en konsulent-pitch valgte vi å bygge
              verktøyet selv. Du skriver inn et domene. Vi kjører ti tekniske
              sjekker. Du får et tall fra 0 til 100 og en konkret liste over
              hva som mangler — i klartekst.
            </p>
            <p>
              Det er fortsatt helt gratis. Ingen registrering. Ingen «scroll
              ned for å se score»-mur. Vi mener AEO-grunnsteiner er offentlig
              kunnskap — ikke noe vi gjemmer bak en betalvegg.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Operatøren
            </h2>
            <p>
              Sjekksynlighet er driftet av{" "}
              <a
                href="https://www.medcom.no"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-medium hover:underline"
              >
                Medcom AS
              </a>{" "}
              — et norsk webbyrå med hovedkontor i Larvik. Vi spesialiserer oss på{" "}
              <a
                href="https://www.medcom.no/tjenester/aio-ai-optimalisert-seo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-medium hover:underline"
              >
                AEO som månedlig tjeneste
              </a>{" "}
              for norske SMB-er. Org.nr 936 155 731.
            </p>
            <p>
              <strong>Vi anbefaler ikke nødvendigvis Medcom som leverandør.</strong>{" "}
              Sjekksynlighet er en uavhengig kunnskaps-ressurs som er rimelig
              kalibrert — vi finner ekte mangler hos våre egne kunder også
              (vi scorer ikke automatisk 100 selv).
            </p>
            <p>
              Hvis du leter etter hjelp til å fikse det vi finner, vet vi at
              Medcom gjør dette — men det er like greit å gå til en annen
              utvikler du allerede har. Det viktigste er at det blir fikset.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://www.medcom.no"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/85 hover:border-accent/30 hover:text-accent transition-colors"
              >
                Besøk medcom.no
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
              <a
                href="https://www.medcom.no/team"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/85 hover:border-accent/30 hover:text-accent transition-colors"
              >
                Teamet bak
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Personvern og data
            </h2>
            <p>
              Medcom AS er behandlingsansvarlig for personopplysninger samlet
              inn via Sjekksynlighet. Vi lagrer e-post, telefon (valgfritt),
              domene og scan-resultat. Vi bruker dataene til å sende deg
              resultatet og eventuelt ringe deg om oppfølging.
            </p>
            <p>
              Du kan be om sletting når som helst. Full GDPR-policy ligger på{" "}
              <Link to="/personvern" className="text-accent font-medium hover:underline">
                personvernsiden
              </Link>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Få i gang en sjekk
            </h2>
            <p>
              Hvis du fortsatt ikke har kjørt en sjekk på din egen nettside —
              ta tre minutter nå.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-soft"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Sjekk synlighet gratis
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </section>
        </article>
      </section>
    </>
  );
}
