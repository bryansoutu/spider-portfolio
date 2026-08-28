import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { LOCALES, type Locale, type Localized } from "./types";

/**
 * Idioma do site.
 *
 * Era uma constante: o conteúdo já existia em português e inglês desde o
 * começo, mas a página renderizava só `pt-BR`. Manter os dois idiomas nos
 * dados era exatamente a aposta de que ligar o inglês seria um seletor, e não
 * uma reescrita — é o que este arquivo cobra.
 *
 * Ordem de decisão do idioma inicial:
 *
 *   1. `?lang=` na URL — usado pelo gerador de PDF, que precisa fixar o idioma
 *      sem depender de nada guardado no navegador.
 *   2. O que a pessoa escolheu da última vez (localStorage).
 *   3. O idioma do navegador: qualquer `pt-*` cai em português, o resto em
 *      inglês. Um recrutador de fora abre o site já em inglês sem clicar.
 */
const STORAGE_KEY = "spider-portfolio:locale";

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

function detectLocale(): Locale {
  if (typeof window === "undefined") return "pt-BR";

  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (isLocale(fromUrl)) return fromUrl;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    /* modo privado pode recusar o storage; o idioma do navegador resolve */
  }

  return window.navigator.language?.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /**
   * Lê um valor localizado no idioma atual.
   *
   * Genérico porque nem todo conteúdo traduzido é uma string: os bullets de
   * cada cargo do currículo são `Localized<string[]>`. Fixar em `string`
   * obrigaria a ler aquele campo à mão, fora deste caminho — que é onde a
   * tradução some sem ninguém perceber.
   */
  t: <T,>(entry: Localized<T>) => T;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  /*
   * O `lang` do documento não é decoração: é o que faz o leitor de tela
   * trocar de voz e o navegador oferecer tradução da página certa. Trocar o
   * texto para inglês e deixar `lang="pt-BR"` no HTML faz o VoiceOver ler
   * inglês com fonética portuguesa.
   */
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* sem storage, a escolha vale só para esta visita */
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: <T,>(entry: Localized<T>) => entry[locale] }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale precisa estar dentro de <LocaleProvider>");
  return ctx;
}
