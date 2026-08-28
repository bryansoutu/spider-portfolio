import type { Localized } from "@/lib/types";

/**
 * Textos da interface — tudo que não é conteúdo do Bryan.
 *
 * Antes eles viviam cravados no meio do JSX em português. Enquanto o site
 * publicava um idioma só isso não custava nada; com o seletor de idioma no ar,
 * cada um viraria um `LOCALE === "en" ? ... : ...` espalhado por sete arquivos.
 *
 * Aqui eles seguem a mesma regra do resto: `Localized<string>`, com o
 * compilador recusando o build se faltar uma tradução.
 */
export const ui = {
  nav: {
    topo: { "pt-BR": "Início", en: "Home" },
    sobre: { "pt-BR": "Sobre", en: "About" },
    projetos: { "pt-BR": "Projetos", en: "Work" },
    faco: { "pt-BR": "O que eu faço", en: "What I do" },
    habilidades: { "pt-BR": "Habilidades", en: "Skills" },
    curriculo: { "pt-BR": "Currículo", en: "Résumé" },
    contato: { "pt-BR": "Contato", en: "Contact" },
  },

  hero: {
    eyebrow: { "pt-BR": "Portfólio", en: "Portfolio" },
    available: {
      "pt-BR": "Disponível para vagas de desenvolvedor",
      en: "Available for developer roles",
    },
    portraitHint: {
      "pt-BR": "Passe o mouse — ou toque",
      en: "Hover — or tap",
    },
    portraitHintTouch: {
      "pt-BR": "Toque para trocar",
      en: "Tap to switch",
    },
    portraitToggle: {
      "pt-BR": "Alternar entre a foto e a máscara",
      en: "Switch between the photo and the mask",
    },
    stats: {
      produtos: { "pt-BR": "produtos no ar", en: "products live" },
      testes: {
        "pt-BR": "testes automatizados",
        en: "automated tests",
      },
      pagespeed: { "pt-BR": "PageSpeed no celular", en: "PageSpeed on mobile" },
    },
  },

  projects: {
    status: {
      live: { "pt-BR": "No ar", en: "Live" },
      wip: { "pt-BR": "Em construção", en: "In progress" },
      archived: { "pt-BR": "Arquivado", en: "Archived" },
    },
    problem: { "pt-BR": "O problema", en: "The problem" },
    solution: { "pt-BR": "O que construí", en: "What I built" },
    outcome: { "pt-BR": "Resultado", en: "Outcome" },
    open: { "pt-BR": "Como foi feito", en: "How it was built" },
    close: { "pt-BR": "Fechar", en: "Close" },
    live: { "pt-BR": "Ver no ar", en: "Visit site" },
    repo: { "pt-BR": "Ver o código", en: "View code" },
    tambem: { "pt-BR": "Também construí", en: "Also built" },
    mobileShot: { "pt-BR": "No celular", en: "On mobile" },
  },

  skills: {
    all: { "pt-BR": "Tudo", en: "All" },
    showAll: { "pt-BR": "Ver todas as habilidades", en: "Show every skill" },
    showCore: { "pt-BR": "Ver só o que eu domino", en: "Show only what I'm solid in" },
    counter: { "pt-BR": "mostrando", en: "showing" },
    howIWork: { "pt-BR": "Como eu trabalho", en: "How I work" },
    evidenceHint: { "pt-BR": "Ver a evidência", en: "See the evidence" },
    empty: {
      "pt-BR": "Nada que eu domine nesta categoria — o que tenho aqui ainda está em construção.",
      en: "Nothing I'm solid in under this category — what I have here is still in progress.",
    },
  },

  resume: {
    download: { "pt-BR": "Baixar em PDF", en: "Download PDF" },
    print: { "pt-BR": "Imprimir", en: "Print" },
    expand: { "pt-BR": "Abrir o currículo completo", en: "Open the full résumé" },
    collapse: { "pt-BR": "Fechar o currículo", en: "Close the résumé" },
    experience: { "pt-BR": "Experiência", en: "Experience" },
    education: { "pt-BR": "Formação", en: "Education" },
    courses: { "pt-BR": "Cursos e estudos", en: "Courses and study" },
    languages: { "pt-BR": "Idiomas", en: "Languages" },
    present: { "pt-BR": "Atual", en: "Present" },
  },

  contact: {
    intro: {
      "pt-BR": "Aberto a conversa sobre vaga, projeto ou estágio.",
      en: "Open to conversations about roles, projects or internships.",
    },
  },

  loader: {
    weaving: { "pt-BR": "Tecendo a teia", en: "Weaving the web" },
  },

  locale: {
    switchLabel: { "pt-BR": "Idioma do site", en: "Site language" },
  },

  a11y: {
    mainNav: { "pt-BR": "Navegação principal", en: "Main navigation" },
    toTop: { "pt-BR": "Voltar ao início", en: "Back to top" },
    menu: { "pt-BR": "Menu", en: "Menu" },
    closeMenu: { "pt-BR": "Fechar o menu", en: "Close menu" },
  },
} satisfies Record<string, unknown>;

/** Atalho: `t(ui.nav.sobre, locale)`. */
export function t(entry: Localized<string>, locale: keyof Localized<string>) {
  return entry[locale];
}
