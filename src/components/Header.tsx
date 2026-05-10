import { Link } from "@tanstack/react-router";
import { useT, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Baby } from "lucide-react";

export function Header() {
  const { t, lang, setLang } = useT();
  const { user, role } = useAuth();

  const langs: Lang[] = ["en", "es"];

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
            <Baby className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold">{t("app.title")}</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {role && (
            <Link
              to="/names"
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              {t("nav.names")}
            </Link>
          )}
          {role === "owner" && (
            <Link
              to="/dashboard"
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              {t("nav.dashboard")}
            </Link>
          )}

          <div className="ml-2 flex items-center gap-1 rounded-full bg-muted p-1">
            {langs.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase transition ${
                  lang === l ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => supabase.auth.signOut()}
              className="ml-1"
            >
              {t("nav.logout")}
            </Button>
          ) : (
            <Link to="/login" className="ml-1">
              <Button variant="ghost" size="sm">{t("nav.login")}</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
