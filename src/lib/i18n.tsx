import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "es";

const dict = {
  en: {
    "app.title": "Name the Baby",
    "app.tagline": "Help my sister pick the perfect name",
    "nav.suggest": "Suggest a name",
    "nav.names": "Name list",
    "nav.dashboard": "Dashboard",
    "nav.login": "Sign in",
    "nav.logout": "Sign out",
    "form.intro": "Suggest one boy name and one girl name (or just one). Only my sister will see the names — without knowing who suggested them.",
    "form.yourName": "Your name",
    "form.yourEmail": "Email (optional)",
    "form.boyName": "Boy name",
    "form.girlName": "Girl name",
    "form.message": "Message (optional)",
    "form.submit": "Send suggestion",
    "form.submitting": "Sending…",
    "form.success.title": "Thank you!",
    "form.success.body": "Your suggestion has been recorded. Want to add another?",
    "form.success.again": "Send another",
    "form.error.atLeastOne": "Please suggest at least one name.",
    "form.error.required": "Required",
    "form.error.email": "Invalid email",
    "form.error.tooLong": "Too long",
    "form.error.generic": "Something went wrong. Please try again.",
    "names.title": "Suggested names",
    "names.subtitle": "Anonymous list — pick your favorite",
    "names.boys": "Boy names",
    "names.girls": "Girl names",
    "names.empty": "No suggestions yet.",
    "names.count": "{count} suggestion(s)",
    "dashboard.title": "All suggestions",
    "dashboard.subtitle": "Full list with submitter info — only you see this",
    "dashboard.col.date": "Date",
    "dashboard.col.from": "From",
    "dashboard.col.email": "Email",
    "dashboard.col.boy": "Boy",
    "dashboard.col.girl": "Girl",
    "dashboard.col.message": "Message",
    "dashboard.export": "Export CSV",
    "dashboard.empty": "No suggestions yet.",
    "login.title": "Sign in",
    "login.subtitle": "For the family — to view the suggestion list",
    "login.email": "Email",
    "login.password": "Password",
    "login.submit": "Sign in",
    "login.signup": "Create account",
    "login.toggleSignup": "Need an account? Sign up",
    "login.toggleSignin": "Have an account? Sign in",
    "login.error": "Could not sign in. Check your email and password.",
    "login.signupError": "Could not create account.",
  },
  es: {
    "app.title": "Nombra al bebé",
    "app.tagline": "Ayuda a mi hermana a elegir el nombre perfecto",
    "nav.suggest": "Sugerir un nombre",
    "nav.names": "Lista de nombres",
    "nav.dashboard": "Panel",
    "nav.login": "Iniciar sesión",
    "nav.logout": "Cerrar sesión",
    "form.intro": "Sugiere un nombre de niño y uno de niña (o solo uno). Solo mi hermana verá los nombres — sin saber quién los sugirió.",
    "form.yourName": "Tu nombre",
    "form.yourEmail": "Correo (opcional)",
    "form.boyName": "Nombre de niño",
    "form.girlName": "Nombre de niña",
    "form.message": "Mensaje (opcional)",
    "form.submit": "Enviar sugerencia",
    "form.submitting": "Enviando…",
    "form.success.title": "¡Gracias!",
    "form.success.body": "Tu sugerencia ha sido registrada. ¿Quieres agregar otra?",
    "form.success.again": "Enviar otra",
    "form.error.atLeastOne": "Por favor sugiere al menos un nombre.",
    "form.error.required": "Requerido",
    "form.error.email": "Correo inválido",
    "form.error.tooLong": "Demasiado largo",
    "form.error.generic": "Algo salió mal. Inténtalo de nuevo.",
    "names.title": "Nombres sugeridos",
    "names.subtitle": "Lista anónima — elige tu favorito",
    "names.boys": "Nombres de niño",
    "names.girls": "Nombres de niña",
    "names.empty": "Aún no hay sugerencias.",
    "names.count": "{count} sugerencia(s)",
    "dashboard.title": "Todas las sugerencias",
    "dashboard.subtitle": "Lista completa con datos de quien sugirió — solo tú ves esto",
    "dashboard.col.date": "Fecha",
    "dashboard.col.from": "De",
    "dashboard.col.email": "Correo",
    "dashboard.col.boy": "Niño",
    "dashboard.col.girl": "Niña",
    "dashboard.col.message": "Mensaje",
    "dashboard.export": "Exportar CSV",
    "dashboard.empty": "Aún no hay sugerencias.",
    "login.title": "Iniciar sesión",
    "login.subtitle": "Para la familia — para ver la lista de sugerencias",
    "login.email": "Correo",
    "login.password": "Contraseña",
    "login.submit": "Iniciar sesión",
    "login.signup": "Crear cuenta",
    "login.toggleSignup": "¿No tienes cuenta? Regístrate",
    "login.toggleSignin": "¿Ya tienes cuenta? Inicia sesión",
    "login.error": "No se pudo iniciar sesión. Verifica tu correo y contraseña.",
    "login.signupError": "No se pudo crear la cuenta.",
  },
} as const;

type Key = keyof (typeof dict)["en"];

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null;
    if (stored === "en" || stored === "es") setLangState(stored);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = (k: Key, vars?: Record<string, string | number>) => {
    let s: string = dict[lang][k] ?? dict.en[k] ?? k;
    if (vars) for (const [key, val] of Object.entries(vars)) s = s.replace(`{${key}}`, String(val));
    return s;
  };

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useT() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useT must be used inside LanguageProvider");
  return ctx;
}
