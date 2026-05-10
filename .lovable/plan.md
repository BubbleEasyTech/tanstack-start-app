## Baby Name Suggestions App

A simple bilingual (EN/ES) web app where friends and family can submit a boy and a girl name suggestion for your sister's baby. You see everything; your sister sees only the anonymized names.

### Pages

1. **`/` — Public suggestion form**
   - Fields: Your name, optional email, boy name suggestion, girl name suggestion, optional short message.
   - Validation with zod (trim, length limits, at least one of boy/girl required).
   - Success state thanking the submitter.
   - Language toggle in header (EN default, ES available), persisted in localStorage.

2. **`/login` — Private login** (email + password)
   - Two roles: `owner` (you — sees everything) and `sister` (sees anonymized list only).

3. **`/dashboard` — Owner view** (you)
   - Table of all submissions: submitter name, email, boy name, girl name, message, date.
   - Search + sort, CSV export.

4. **`/names` — Sister view** (anonymous)
   - Two columns: Boy names / Girl names.
   - No submitter info, no email, no date — just the names (with optional duplicate count badge).
   - Both you and sister can access this page; sister cannot access `/dashboard`.

### Data model (Lovable Cloud)

- `suggestions` table: `id`, `submitter_name`, `submitter_email` (nullable), `boy_name` (nullable), `girl_name` (nullable), `message` (nullable), `created_at`.
- `user_roles` table with enum `app_role` (`owner`, `sister`) + `has_role()` security-definer function (per the user-roles security pattern).
- RLS:
  - Anyone (anon) can `INSERT` into `suggestions`.
  - Only `owner` can `SELECT` full rows.
  - `sister` reads names through a server function that returns only `boy_name` / `girl_name` arrays (no PII ever leaves the server for her session).

### Internationalization

- Lightweight in-house i18n: a `translations.ts` dictionary with `en` / `es` keys and a `useT()` hook reading from a `LanguageContext`. No extra libraries.
- All user-facing strings (form labels, validation messages, dashboard headers, toasts) translated.
- `<html lang>` updates with the selected language.

### Design

- Soft, warm baby-shower aesthetic: muted pastel palette (sage + blush + cream), rounded cards, generous whitespace, a tasteful display font for headings paired with a clean sans for body. All colors as semantic tokens in `src/styles.css` (oklch).

### Out of scope (per your answers)

- Gifts / Wise integration — skipped for now, can be added later.
- Thank-you / gift-giver list — skipped.

### Technical notes

- TanStack Start with file-based routes under `src/routes/`.
- Lovable Cloud enabled for auth + Postgres + RLS.
- Owner & sister accounts: after Cloud is enabled you'll sign up both accounts, then I'll grant roles via a one-time SQL insert.
- Anonymized names fetched via a `createServerFn` that selects only the name columns — submitter identity never reaches your sister's browser.
