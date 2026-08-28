import type { Localized } from "@/lib/types";

export interface Capability {
  id: string;
  name: Localized<string>;
  description: Localized<string>;
}

/**
 * "O que eu faço" — capacidades técnicas, não serviços de freela.
 *
 * O alvo é vaga de emprego, então cada item responde à pergunta do tech lead:
 * "o que essa pessoa consegue assumir sozinha na minha equipe?" Todas as
 * descrições apontam para trabalho que já existe (RN-01), sem promessa vaga.
 */
export const capabilities: Capability[] = [
  {
    id: "frontend",
    name: { "pt-BR": "Front-end", en: "Front-end" },
    description: {
      "pt-BR":
        "Interfaces em React e Next.js com TypeScript estrito, responsivas do celular ao monitor largo e acessíveis por teclado. Componentes tipados, sem estado global desnecessário.",
      en: "Interfaces in React and Next.js with strict TypeScript, responsive from phone to wide monitor and fully keyboard-accessible. Typed components, no needless global state.",
    },
  },
  {
    id: "backend",
    name: { "pt-BR": "Back-end e dados", en: "Back-end and data" },
    description: {
      "pt-BR":
        "Rotas de servidor, validação de entrada com Zod e persistência — no site da NYO, a captura de leads grava em Supabase. Também SQL Server e MongoDB da formação.",
      en: "Server routes, input validation with Zod and persistence — on the NYO site, lead capture writes to Supabase. Plus SQL Server and MongoDB from my coursework.",
    },
  },
  {
    id: "automacao",
    name: { "pt-BR": "Automação", en: "Automation" },
    description: {
      "pt-BR":
        "Scripts em Python que assumem tarefa repetitiva de ponta a ponta, com tratamento dos estados inesperados e log de cada execução para saber onde parou.",
      en: "Python scripts that take over a repetitive task end to end, handling unexpected states and logging every run so you know where it stopped.",
    },
  },
  {
    id: "performance",
    name: {
      "pt-BR": "Performance e acessibilidade",
      en: "Performance and accessibility",
    },
    description: {
      "pt-BR":
        "PageSpeed 95 no celular e 100 no desktop no site da banda. Contraste medido antes de escolher a paleta, navegação por teclado e respeito a prefers-reduced-motion.",
      en: "PageSpeed 95 mobile and 100 desktop on the band's site. Contrast measured before picking the palette, keyboard navigation, and prefers-reduced-motion respected.",
    },
  },
  {
    id: "entrega",
    name: { "pt-BR": "Do requisito ao deploy", en: "From requirement to deploy" },
    description: {
      "pt-BR":
        "Converso com quem tem o problema, transformo em escopo, construo, testo e publico — depois cuido do domínio e da manutenção. Dois sites no ar seguem esse caminho.",
      en: "I talk to whoever owns the problem, turn it into scope, build, test and ship it — then handle the domain and maintenance. Two live sites came out of this path.",
    },
  },
];
