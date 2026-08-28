import type { Project } from "@/lib/types";

/**
 * Cases no formato problema → solução → resultado.
 *
 * É a estrutura que um entrevistador usa (STAR). Força cada card a provar
 * valor em vez de listar tecnologia — e é o que separa "sei React" de
 * "coloquei no ar um produto que alguém usa".
 *
 * RN-01: todo `outcome` carrega número, link ou artefato verificável.
 * Os números abaixo foram conferidos no código e nos docs de cada projeto,
 * não escritos de memória. Onde não há número, não há afirmação.
 */
export const projects: Project[] = [
  {
    slug: "nyo-telecom",
    title: "NYO Telecom",
    year: 2026,
    status: "live",
    featured: true,
    problem: {
      "pt-BR":
        "Um provedor de internet em Barueri/Alphaville atendia clientes residenciais e empresariais sem um canal próprio para apresentar planos e receber contato — cada interessado dependia de ligação ou mensagem avulsa.",
      en: "An internet provider in Barueri/Alphaville served both home and business clients with no channel of its own to present plans and capture contacts — every lead depended on a phone call or a stray message.",
    },
    solution: {
      "pt-BR":
        "Site institucional com trilhas separadas para residencial e empresas, publicado em quatro idiomas (português, inglês, espanhol e chinês), com captura de leads persistida em Supabase e página de política de privacidade.",
      en: "Institutional site with separate tracks for residential and business plans, published in four languages (Portuguese, English, Spanish and Chinese), with lead capture persisted to Supabase and a privacy policy page.",
    },
    outcome: {
      "pt-BR":
        "No ar em nyotelecom.com.br desde 11/08/2026, em manutenção contínua: 74 commits e 228 arquivos versionados. É um negócio em funcionamento — o que sobe é o que o cliente vê.",
      en: "Live at nyotelecom.com.br since 2026-08-11 and still maintained: 74 commits across 228 tracked files. It's a running business — whatever ships is what customers see.",
    },
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "shadcn/ui",
      "Supabase",
      "Zod",
      "Vercel",
    ],
    liveUrl: "https://www.nyotelecom.com.br",
  },
  {
    slug: "meteoros",
    title: "Meteoros Rock Band",
    year: 2026,
    status: "live",
    featured: true,
    problem: {
      "pt-BR":
        "Uma banda de Piratininga/SP concentrava todo o público no Instagram e não tinha onde publicar a agenda de shows nem vender produtos — a maior parte dos acessos vem do link da bio, ou seja, de celular.",
      en: "A rock band from Piratininga, Brazil had its whole audience on Instagram and nowhere to publish tour dates or sell merch — most visits arrive from the bio link, which means from a phone.",
    },
    solution: {
      "pt-BR":
        "Site com agenda de shows (página própria por show e exportação para o calendário em .ics), loja com carrinho e fechamento de pedido, tudo desenhado a partir da tela pequena. Nenhum dado da banda pode ser inventado: o conteúdo passa por um envelope que só deixa valores confirmados chegarem à tela.",
      en: "Site with a tour agenda (a page per show plus .ics calendar export) and a store with cart and order checkout, designed small-screen first. No band data may be invented: content passes through a wrapper that lets only confirmed values reach the screen.",
    },
    outcome: {
      "pt-BR":
        "No ar em bandameteoros.com.br. PageSpeed 95 no celular e 100 no desktop. Coberto por 67 testes unitários e 7 fluxos de ponta a ponta executados em desktop e celular.",
      en: "Live at bandameteoros.com.br. PageSpeed 95 on mobile, 100 on desktop. Covered by 67 unit tests and 7 end-to-end flows run on both desktop and mobile viewports.",
    },
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "Zod",
      "Vitest",
      "Playwright",
      "Sharp",
    ],
    liveUrl: "https://bandameteoros.com.br",
  },
  {
    slug: "bjrbot",
    title: "BjrBot",
    year: 2025,
    status: "archived",
    featured: true,
    problem: {
      "pt-BR":
        "Um fluxo web repetitivo — login, navegação, fechamento de anúncios e resgate de itens — consumia tempo todos os dias e era exatamente o tipo de tarefa que uma máquina faz melhor que uma pessoa.",
      en: "A repetitive web flow — login, navigation, dismissing ads and claiming items — ate time every single day, and was exactly the kind of task a machine does better than a person.",
    },
    solution: {
      "pt-BR":
        "Bot em Python com Selenium que percorre o fluxo inteiro sozinho, trata os estados inesperados da página e grava logs estruturados de cada execução.",
      en: "A Python bot built with Selenium that walks the whole flow on its own, handles the page's unexpected states and writes structured logs for every run.",
    },
    outcome: {
      "pt-BR":
        "Desde 2025 executa sozinho as 5 etapas do fluxo, sem clique humano, e deixa log de cada rodada para eu saber onde parou quando a página muda. Construído sem tutorial que cobrisse o caso: foi onde aprendi na prática controle de fluxo, tratamento de exceções e manipulação de DOM por código.",
      en: "Since 2025 it runs all 5 steps of the flow on its own, with no human click, and logs every run so I know where it stopped when the page changes. Built with no tutorial covering the case: it's where I learned control flow, exception handling and DOM manipulation for real.",
    },
    stack: ["Python", "Selenium", "Automação web"],
  },
  {
    slug: "portfolio",
    title: "Este portfólio",
    year: 2026,
    status: "live",
    featured: false,
    problem: {
      "pt-BR":
        "Meus dois melhores trabalhos estavam no ar com clientes reais e não apareciam em lugar nenhum — nem no currículo, que ainda me descrevia só como estagiário de Python.",
      en: "My two best pieces of work were live with real clients and showed up nowhere — not even on my résumé, which still described me as a Python intern only.",
    },
    solution: {
      "pt-BR":
        "Portfólio bilíngue em que o conteúdo é dado tipado, não texto solto no meio da tela: cada frase existe em português E inglês, e o compilador recusa o build se faltar uma tradução. O currículo é uma seção desta mesma página, e o PDF é impresso dela — não existe um segundo arquivo para desatualizar.",
      en: "A bilingual portfolio where the content is typed data, not copy scattered through the markup: every sentence exists in Portuguese AND English, and the compiler refuses to build if a translation is missing. The résumé is a section of this same page, and the PDF is printed from it — there is no second file to fall out of date.",
    },
    outcome: {
      "pt-BR":
        "No ar e bilíngue, com seletor de idioma no cabeçalho. O retrato saiu de 5,9 MB para 71 KB (o mesmo círculo de 320px na tela), o contraste do vermelho foi medido antes de entrar, o teclado enxerga o foco em todo elemento clicável e todo o movimento desliga sob prefers-reduced-motion. São 38 testes de ponta a ponta rodando em desktop e celular contra o build de produção, e cada um deles tranca um defeito que este site já teve. A política de segurança recusa script inline e script de terceiro, e um script confere os cabeçalhos no ar a cada publicação. O código está aberto — é o próprio case.",
      en: "Live and bilingual, with a language switch in the header. The portrait went from 5.9 MB to 71 KB (same 320px circle on screen), the red's contrast was measured before it shipped, focus is visible on every clickable element, and all motion switches off under prefers-reduced-motion. There are 38 end-to-end tests running on desktop and mobile against the production build, each one locking down a defect this site actually had. The security policy refuses inline and third-party scripts, and a script checks the live headers on every release. The source is open — it is the case study.",
    },
    stack: ["Vite", "React 19", "TypeScript", "Tailwind CSS 4", "Canvas 2D"],
    /*
     * O resultado deste case termina com "o código está aberto — é o próprio
     * case", e até agora não havia link nenhum para conferir. Afirmação sem
     * como verificar é exatamente o que o site diz não fazer.
     */
    repoUrl: "https://github.com/bryansoutu/spider-portfolio",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
