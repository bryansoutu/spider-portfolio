import type { SoftSkill } from "@/lib/types";

/**
 * Soft skills.
 *
 * O tipo obriga um `evidence` para cada `label` — de propósito. "Proativo" e
 * "trabalha bem em equipe" são adjetivos que todo currículo tem e nenhum
 * prova; o que convence é o fato que está atrás deles.
 *
 * Regra ao editar: se a evidência não puder ser conferida por alguém de fora
 * (link, número, artefato), a linha não entra.
 */
export const softSkills: SoftSkill[] = [
  {
    id: "cliente-nao-tecnico",
    label: {
      "pt-BR": "Traduzo requisito de quem não é técnico",
      en: "I translate requirements from non-technical people",
    },
    evidence: {
      "pt-BR":
        "Meus dois projetos em produção nasceram de conversas com donos de negócio, não de uma especificação pronta. O pedido chega como “preciso aparecer no Google” e sai como escopo, prioridade e tela.",
      en: "Both of my production projects came out of conversations with business owners, not from a finished spec. The ask arrives as “I need to show up on Google” and leaves as scope, priority and screens.",
    },
  },
  {
    id: "autonomia",
    label: {
      "pt-BR": "Destravo sozinho antes de pedir ajuda",
      en: "I unblock myself before asking for help",
    },
    evidence: {
      "pt-BR":
        "O BjrBot foi construído sem nenhum tutorial que cobrisse o caso. O caminho foi ler documentação, isolar a falha e testar hipótese por hipótese até o fluxo rodar inteiro.",
      en: "BjrBot was built with no tutorial covering the case. The path was reading docs, isolating the failure and testing one hypothesis at a time until the whole flow ran.",
    },
  },
  {
    id: "rigor-com-dado",
    label: {
      "pt-BR": "Não publico dado que não posso confirmar",
      en: "I don't publish data I can't confirm",
    },
    evidence: {
      "pt-BR":
        "No site da banda, todo conteúdo passa por um envelope que separa confirmado de pendente — informação não confirmada simplesmente não chega à tela. No site do provedor, inventar preço, prazo ou área de cobertura é proibido por escrito no repositório.",
      en: "On the band's site, all content goes through a wrapper separating confirmed from pending — unconfirmed information simply never reaches the screen. On the ISP site, inventing a price, deadline or coverage area is forbidden in writing in the repo.",
    },
  },
  {
    id: "usuario-final",
    label: {
      "pt-BR": "Projeto a partir de quem vai usar",
      en: "I design from the person who'll actually use it",
    },
    evidence: {
      "pt-BR":
        "A loja da banda foi desenhada a partir da tela pequena, porque a maior parte do público chega pelo link da bio do Instagram — e os testes de ponta a ponta rodam também no viewport de celular, não só no desktop.",
      en: "The band's store was designed small-screen first, because most of the audience arrives from the Instagram bio link — and the end-to-end tests run on a phone viewport too, not only desktop.",
    },
  },
  {
    id: "constancia",
    label: {
      "pt-BR": "Entrego ao longo do tempo, não em surto",
      en: "I ship over time, not in bursts",
    },
    evidence: {
      "pt-BR":
        "138 commits somando os dois projetos, distribuídos ao longo de meses, com os dois sites no ar e ainda recebendo manutenção. Site publicado é começo de trabalho, não fim.",
      en: "138 commits across both projects, spread over months, with both sites live and still under maintenance. Shipping a site is where the work starts, not where it ends.",
    },
  },
  {
    id: "aprendizado",
    label: {
      "pt-BR": "Aprendo no que o problema exige",
      en: "I learn whatever the problem requires",
    },
    evidence: {
      "pt-BR":
        "Meu currículo de 2025 dizia Python e Java. Quando o problema pediu web, aprendi TypeScript, React e Next.js e coloquei dois produtos em produção — incluindo um site em quatro idiomas.",
      en: "My 2025 résumé said Python and Java. When the problem called for web, I learned TypeScript, React and Next.js and shipped two products — including a site in four languages.",
    },
  },
];
