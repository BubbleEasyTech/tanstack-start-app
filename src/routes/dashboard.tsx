import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

interface Row {
  id: string;
  submitter_name: string;
  submitter_email: string | null;
  boy_name: string | null;
  girl_name: string | null;
  message: string | null;
  created_at: string;
}

function DashboardPage() {
  const { t, lang } = useT();
  const nav = useNavigate();
  const { user, role, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/login" });
    else if (role && role !== "owner") nav({ to: "/names" });
  }, [user, role, loading, nav]);

  useEffect(() => {
    if (role !== "owner") return;
    setFetching(true);
    supabase
      .from("suggestions")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        setFetching(false);
        if (error) console.error(error);
        else setRows((data ?? []) as Row[]);
      });
  }, [role]);

  const exportCsv = () => {
    const headers = ["Date", "Name", "Email", "Boy", "Girl", "Message"];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          new Date(r.created_at).toISOString(),
          r.submitter_name,
          r.submitter_email ?? "",
          r.boy_name ?? "",
          r.girl_name ?? "",
          r.message ?? "",
        ]
          .map((v) => escape(String(v)))
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `name-suggestions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (d: string) => new Date(d).toLocaleString(lang === "es" ? "es-CL" : "en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">{t("dashboard.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
          <Button onClick={exportCsv} variant="outline" disabled={!rows.length}>
            <Download className="mr-2 h-4 w-4" />
            {t("dashboard.export")}
          </Button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("dashboard.col.date")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.col.from")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.col.email")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.col.boy")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.col.girl")}</th>
                  <th className="px-4 py-3 font-medium">{t("dashboard.col.message")}</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t("dashboard.empty")}</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t border-border/60">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{fmt(r.created_at)}</td>
                      <td className="px-4 py-3 font-medium">{r.submitter_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.submitter_email ?? "—"}</td>
                      <td className="px-4 py-3 font-display">{r.boy_name ?? "—"}</td>
                      <td className="px-4 py-3 font-display">{r.girl_name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.message ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
