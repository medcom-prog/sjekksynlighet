import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowRight, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const FormSchema = z.object({
  domain: z
    .string()
    .trim()
    .min(3, "Skriv inn et domene, f.eks. minbedrift.no")
    .refine(
      (v) => /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.replace(/^https?:\/\//i, "").replace(/\/.*$/, "")),
      "Domenet ser ikke ut til å være gyldig",
    ),
  email: z.string().trim().toLowerCase().email("E-postadressen ser ikke gyldig ut"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[+\d\s()-]{6,20}$/.test(v),
      "Telefonnummer kan kun inneholde siffer, mellomrom og + ( ) -",
    ),
  name: z.string().trim().optional(),
  firma: z.string().trim().optional(),
});

export type ScanFormValues = z.infer<typeof FormSchema>;

type FieldErrors = Partial<Record<keyof ScanFormValues, string>>;

function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

export function ScanForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrors({});

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    const values: ScanFormValues = {
      domain: String(fd.get("domain") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? "") || undefined,
      name: String(fd.get("name") ?? "") || undefined,
      firma: String(fd.get("firma") ?? "") || undefined,
    };

    const parsed = FormSchema.safeParse(values);
    if (!parsed.success) {
      const fe: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof ScanFormValues | undefined;
        if (k && !fe[k]) fe[k] = issue.message;
      }
      setErrors(fe);
      setSubmitting(false);
      return;
    }

    const cleaned: ScanFormValues = {
      ...parsed.data,
      domain: normalizeDomain(parsed.data.domain),
    };

    navigate("/sjekker", { state: cleaned });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4"
      noValidate
      aria-describedby="form-intro"
    >
      <p id="form-intro" className="sr-only">
        Skjema for å starte en gratis synlighetscheck. Domene og e-post er
        obligatorisk. Telefonnummer er valgfritt.
      </p>

      <Field
        id="domain"
        label="Domenet ditt"
        hint="F.eks. minbedrift.no — uten https:// eller stier"
        error={errors.domain}
      >
        <div className="relative">
          <Globe
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="domain"
            name="domain"
            type="text"
            inputMode="url"
            autoComplete="url"
            autoFocus={autoFocus}
            placeholder="minbedrift.no"
            required
            className="pl-10"
            aria-invalid={!!errors.domain}
          />
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="email" label="E-post" hint="Vi sender deg resultatet" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="navn@bedrift.no"
            required
            aria-invalid={!!errors.email}
          />
        </Field>
        <Field
          id="phone"
          label={
            <>
              Telefon{" "}
              <span className="ml-1 font-normal text-muted-foreground">(valgfritt)</span>
            </>
          }
          hint="For oppfølging hvis du ønsker det"
          error={errors.phone}
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+47 98 76 54 32"
            aria-invalid={!!errors.phone}
          />
        </Field>
      </div>

      <details className="group rounded-xl border border-dashed border-border bg-background/40 px-4 py-3 text-sm">
        <summary className="cursor-pointer select-none text-muted-foreground transition-colors group-hover:text-foreground">
          Legg til navn og firma (valgfritt)
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Navn">
            <Input id="name" name="name" type="text" autoComplete="name" placeholder="Ola Nordmann" />
          </Field>
          <Field id="firma" label="Firma">
            <Input
              id="firma"
              name="firma"
              type="text"
              autoComplete="organization"
              placeholder="Bedriften AS"
            />
          </Field>
        </div>
      </details>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="mt-2 w-full"
      >
        {submitting ? "Starter sjekken …" : "Kjør gratis sjekk"}
        {!submitting && <ArrowRight className="h-5 w-5" aria-hidden />}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Ingen registrering. Resultatet er klart på under 30 sekunder.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: React.ReactNode;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-warn">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
