export default function Privacy() {
  const today = new Date().toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <header className="mb-10 border-b border-border pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
          Personvern
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Personvernerklæring for sjekksynlighet.no
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sist oppdatert: {today}
        </p>
      </header>

      <article className="prose prose-neutral max-w-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-12 [&_h2]:mb-3 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-2 [&_p]:leading-relaxed [&_p]:text-foreground/80 [&_li]:leading-relaxed [&_li]:text-foreground/80 [&_a]:text-accent [&_a]:underline-offset-2 hover:[&_a]:underline">
        <p
          data-quick-answer
          className="quick-answer not-prose"
        >
          <strong>Kort fortalt:</strong> Vi lagrer e-post, telefonnummer
          (valgfritt), domene, scan-resultat og en hashet IP når du kjører en
          sjekk. Vi bruker dataene til å sende deg resultatet og eventuelt
          kontakte deg om oppfølging. Du kan kreve sletting, innsyn, retting
          og dataportabilitet når som helst.
        </p>

        <h2>1. Behandlingsansvarlig</h2>
        <p>
          Behandlingsansvarlig for personopplysninger samlet inn via
          sjekksynlighet.no er <strong>Medcom AS</strong>, org.nr{" "}
          <strong>936 155 731</strong>, postadresse Almeveien 13, 3274 Larvik.
          Kontakt: <a href="mailto:post@medcom.no">post@medcom.no</a>.
        </p>
        <p>
          Sjekksynlighet er et selvstendig verktøy operert av Medcom AS. Det
          er ingen organisatorisk eller forretningsmessig kobling som krever
          ytterligere samtykker — Medcom AS er navngitt her fordi GDPR krever
          identifikasjon av behandlingsansvarlig juridisk enhet.
        </p>

        <h2>2. Hvilke opplysninger vi samler inn</h2>
        <p>Når du kjører en synlighetscheck samler vi inn:</p>
        <ul>
          <li>
            <strong>E-postadresse</strong> — for å sende deg resultatet og
            eventuell oppfølging.
          </li>
          <li>
            <strong>Telefonnummer</strong> (valgfritt) — for at vi kan ringe
            deg med tilbud om oppfølging eller tekniske tjenester.
          </li>
          <li>
            <strong>Navn og firma</strong> (valgfritt) — for å kunne
            personalisere kommunikasjon.
          </li>
          <li>
            <strong>Domenet du sjekker</strong> og hele resultatet av
            analysen, lagret som strukturert data.
          </li>
          <li>
            <strong>Hashet IP-adresse</strong> og user agent — for å
            håndheve rate-limit (maks 5 sjekker per IP per time) og for å
            kunne oppdage misbruk.
          </li>
          <li>
            <strong>Tidspunkt</strong> for når sjekken ble kjørt.
          </li>
        </ul>
        <p>
          Vi samler <em>ikke</em> inn cookies for analyse eller markedsføring.
          Vi bruker ingen tredjeparts trackere. Vi lagrer ingen kortdata,
          passord eller sensitive personopplysninger.
        </p>

        <h2>3. Hva vi bruker dataene til</h2>
        <ul>
          <li>
            <strong>Sende deg resultatet</strong> av sjekken på e-post.
          </li>
          <li>
            <strong>Kontakte deg per telefon</strong> hvis du har oppgitt
            telefonnummer, med tilbud om oppfølging eller relaterte
            tjenester.
          </li>
          <li>
            <strong>Forbedre verktøyet</strong> ved å analysere aggregerte
            mønstre (anonymisert) over hvilke tekniske mangler som er mest
            vanlige.
          </li>
          <li>
            <strong>Beskytte mot misbruk</strong> ved å håndheve rate-limit
            og oppdage skadelig bruk.
          </li>
        </ul>

        <h2>4. Rettslig grunnlag</h2>
        <p>
          Vi behandler personopplysningene basert på følgende grunnlag:
        </p>
        <ul>
          <li>
            <strong>Samtykke</strong> (GDPR art. 6 nr. 1 bokstav a) når du
            sender inn skjemaet — du samtykker da til at vi sender deg
            resultatet og kan kontakte deg ved oppgitt telefon.
          </li>
          <li>
            <strong>Berettiget interesse</strong> (GDPR art. 6 nr. 1
            bokstav f) for å håndheve rate-limit, opprettholde
            sikkerheten i tjenesten og forbedre den.
          </li>
        </ul>

        <h2>5. Hvor lenge vi lagrer dataene</h2>
        <ul>
          <li>
            <strong>Scan-resultater og kontaktdata:</strong> i opptil 24
            måneder, deretter slettes de automatisk. Vi sletter på
            forespørsel før det.
          </li>
          <li>
            <strong>Hashet IP og user agent:</strong> i 30 dager for
            rate-limit-formål, deretter slettes de.
          </li>
        </ul>

        <h2>6. Hvem som har tilgang</h2>
        <p>
          Bare ansatte i Medcom AS som er involvert i kundeoppfølging og
          drift av tjenesten har tilgang til dataene. Vi deler ikke
          personopplysninger med tredjeparter for markedsføringsformål.
        </p>
        <p>Databehandlere vi bruker:</p>
        <ul>
          <li>
            <strong>Supabase</strong> (Postgres-database, Frankfurt-region) —
            datalagring.
          </li>
          <li>
            <strong>Vercel</strong> (Frankfurt-region) — hosting av
            nettsiden og serverless functions.
          </li>
          <li>
            <strong>Resend</strong> (USA, EU-US Data Privacy Framework) —
            utsendelse av resultat-epost.
          </li>
        </ul>
        <p>
          Alle databehandlere har inngått databehandleravtale med Medcom AS i
          tråd med GDPR art. 28.
        </p>

        <h2>7. Dine rettigheter</h2>
        <p>Du har rett til:</p>
        <ul>
          <li>
            <strong>Innsyn</strong> i hvilke opplysninger vi har om deg
          </li>
          <li>
            <strong>Retting</strong> av feilaktige opplysninger
          </li>
          <li>
            <strong>Sletting</strong> av opplysninger («retten til å bli
            glemt»)
          </li>
          <li>
            <strong>Dataportabilitet</strong> — du kan be om å få dine data
            i et strukturert format
          </li>
          <li>
            <strong>Innsigelse</strong> mot behandlingen
          </li>
          <li>
            <strong>Trekke tilbake samtykke</strong> når som helst, uten at
            det påvirker tidligere behandling
          </li>
        </ul>
        <p>
          For å utøve rettighetene, send en e-post til{" "}
          <a href="mailto:post@medcom.no">post@medcom.no</a>. Vi svarer innen
          30 dager.
        </p>

        <h2>8. Klage til Datatilsynet</h2>
        <p>
          Du har rett til å klage til Datatilsynet på behandlingen. Kontakt
          dem på{" "}
          <a href="https://www.datatilsynet.no/" target="_blank" rel="noreferrer">
            datatilsynet.no
          </a>{" "}
          eller telefon 22 39 69 00.
        </p>

        <h2>9. Endringer i denne erklæringen</h2>
        <p>
          Vi kan endre denne erklæringen ved behov, f.eks. ved nye
          funksjoner eller endrede databehandlere. Vesentlige endringer
          varsles via e-post til registrerte brukere. Dato for siste
          oppdatering står øverst på siden.
        </p>
      </article>
    </section>
  );
}
