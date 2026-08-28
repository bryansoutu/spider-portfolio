import type { Locale } from "./types";

/**
 * Formatação de datas do currículo.
 *
 * As datas em `content/resume.ts` são strings "YYYY-MM" — sem dia, porque
 * currículo não tem dia. Construir um `Date` a partir delas exige `Date.UTC`:
 * `new Date("2026-06")` é interpretado como meia-noite UTC e, num fuso a
 * oeste de Greenwich (o nosso), volta para o mês anterior na renderização
 * local. "jun 2026" viraria "mai 2026" em silêncio.
 */
function toDate(value: string): Date {
  const [year, month] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

/**
 * "jun 2026" / "Jun 2026".
 *
 * Intl em pt-BR devolve "jun." com ponto; o ponto sai porque a linha do
 * currículo já usa travessão como separador e a pontuação dupla polui.
 */
export function formatMonth(value: string, locale: Locale): string {
  const month = new Intl.DateTimeFormat(locale, {
    month: "short",
    timeZone: "UTC",
  })
    .format(toDate(value))
    .replace(".", "");

  const capitalized = month.charAt(0).toUpperCase() + month.slice(1);

  return `${capitalized} ${value.slice(0, 4)}`;
}

/** "Jun 2026 — Atual" quando `end` é null. */
export function formatRange(
  start: string,
  end: string | null,
  locale: Locale,
  presentLabel: string
): string {
  const from = formatMonth(start, locale);
  const to = end === null ? presentLabel : formatMonth(end, locale);
  return `${from} — ${to}`;
}
