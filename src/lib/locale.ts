import type { Locale } from "./types";

/**
 * O idioma que o site renderiza.
 *
 * O conteúdo em `src/content/` continua tipado como `Localized<T>` — ou seja,
 * cada texto já existe em português E inglês, e o compilador recusa a
 * compilação se faltar uma tradução. O que ainda não existe é o seletor de
 * idioma e a rota `/en`.
 *
 * Manter os dois idiomas nos dados, mesmo publicando um só, é o que faz o
 * inglês voltar a ser um dia de trabalho em vez de uma reescrita: quando o
 * seletor entrar, esta constante vira um estado e nada mais muda.
 */
export const LOCALE: Locale = "pt-BR";
