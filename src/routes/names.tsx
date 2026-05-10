import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useT } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/names")({
  component: NamesPage,
});

interface Row {
  boy_name: string | null;
  girl_name: string | null;
  created_at: string;
}

function NamesPage() {
  const { t } = useT();
  const nav = useNavigate();
  const { user, role, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user || !role) return;
    setFetching(true);
    supabase.rpc("get_anonymous_names").then(({ data, error }) => {
      setFetching(false);
      if (error) {
        console.error(error);
        return;
      }
      setRows((data ?? []) as Row[]);
    });
  }, [user, role]);

  const boys = useMemo(() => collect(rows.map((r) => r.boy_name)), [rows]);
  const girls = useMemo(() => collect(rows.map((r) => r.girl_name)), [rows]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">{t("names.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("names.subtitle")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("names.count", { count: rows.length })}</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          <NameColumn title={`👦 ${t("names.boys")}`} items={boys} accent="sage" empty={fetching ? "…" : t("names.empty")} />
          <NameColumn title={`👧 ${t("names.girls")}`} items={girls} accent="blush" empty={fetching ? "…" : t("names.empty")} />
        </div>
      </main>
    </div>
  );
}

function collect(arr: (string | null)[]) {
  const map = new Map<string, number>();
  for (const v of arr) {
    if (!v) continue;
    const key = v.trim();
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function NameColumn({ title, items, accent, empty }: { title: string; items: { name: string; count: number }[]; accent: "sage" | "blush"; empty: string }) {
  const accentBg = accent === "sage" ? "bg-[var(--sage)]/30" : "bg-[var(--blush)]/40";
  return (
    <section className={`rounded-3xl border border-border bg-card p-6 shadow-sm`}>
      <h2 className={`mb-4 inline-block rounded-full ${accentBg} px-3 py-1 text-sm font-semibold`}>{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it) => (
            <li
              key={it.name}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-3 py-2"
            >
              <span className="font-display text-lg">{it.name}</span>
              {it.count > 1 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">×{it.count}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
