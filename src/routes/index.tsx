import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useT } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const schema = z
  .object({
    submitter_name: z.string().trim().min(1).max(100),
    submitter_email: z.string().trim().email().max(255).optional().or(z.literal("")),
    boy_name: z.string().trim().max(60).optional().or(z.literal("")),
    girl_name: z.string().trim().max(60).optional().or(z.literal("")),
    message: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .refine((d) => (d.boy_name && d.boy_name.length > 0) || (d.girl_name && d.girl_name.length > 0), {
    path: ["boy_name"],
  });

function HomePage() {
  const { t } = useT();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const raw = {
      submitter_name: String(fd.get("submitter_name") ?? ""),
      submitter_email: String(fd.get("submitter_email") ?? ""),
      boy_name: String(fd.get("boy_name") ?? ""),
      girl_name: String(fd.get("girl_name") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      if (!raw.boy_name && !raw.girl_name) {
        setErrors({ boy_name: t("form.error.atLeastOne") });
      } else {
        const errs: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const k = issue.path[0] as string;
          errs[k] = issue.code === "too_big" ? t("form.error.tooLong") : issue.code === "invalid_string" ? t("form.error.email") : t("form.error.required");
        }
        setErrors(errs);
      }
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("suggestions").insert({
      submitter_name: parsed.data.submitter_name,
      submitter_email: parsed.data.submitter_email || null,
      boy_name: parsed.data.boy_name || null,
      girl_name: parsed.data.girl_name || null,
      message: parsed.data.message || null,
    });
    setLoading(false);

    if (error) {
      toast.error(t("form.error.generic"));
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <section className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            {t("app.tagline")}
          </span>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{t("app.title")}</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {t("form.intro")}
          </p>
        </section>

        {submitted ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
              <Heart className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold">{t("form.success.title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("form.success.body")}</p>
            <Button className="mt-6" onClick={() => setSubmitted(false)}>
              {t("form.success.again")}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
          >
            <Field label={t("form.yourName")} error={errors.submitter_name}>
              <Input name="submitter_name" required maxLength={100} />
            </Field>
            <Field label={t("form.yourEmail")} error={errors.submitter_email}>
              <Input name="submitter_email" type="email" maxLength={255} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={`👦 ${t("form.boyName")}`} error={errors.boy_name}>
                <Input name="boy_name" maxLength={60} />
              </Field>
              <Field label={`👧 ${t("form.girlName")}`} error={errors.girl_name}>
                <Input name="girl_name" maxLength={60} />
              </Field>
            </div>
            <Field label={t("form.message")} error={errors.message}>
              <Textarea name="message" rows={3} maxLength={500} />
            </Field>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? t("form.submitting") : t("form.submit")}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
