import type { ResumeEntry, Education, Course, Language, Localized } from "@/lib/types";

/**
 * Currículo estruturado — fonte única da página /curriculo.
 *
 * Atualiza o PDF de maio/2025, que parou no estágio na Unimed e no BjrBot.
 * A mudança que importa: os dois sites em produção viraram uma entrada de
 * experiência própria, em vez de continuarem escondidos como "projeto
 * pessoal". Trabalho entregue para um negócio em funcionamento é experiência,
 * mesmo sem carteira assinada — e omitir isso é o que fazia o currículo
 * antigo vender menos do que o candidato entrega.
 */

export const summary: Localized<string> = {
  "pt-BR":
    "Estudante de Ciência da Computação (formatura em 2027) com dois produtos web em produção, atendendo clientes reais. Trabalho de ponta a ponta: converso com quem tem o problema, defino escopo, construo em TypeScript/Next.js e mantenho no ar depois de publicado. Busco vaga de desenvolvedor — estágio, júnior ou trainee.",
  en: "Computer Science student (graduating 2027) with two web products in production serving real clients. I work end to end: I talk to whoever owns the problem, define scope, build it in TypeScript/Next.js and keep it running after launch. Looking for a developer role — internship, junior or trainee.",
};

export const experience: ResumeEntry[] = [
  {
    role: {
      "pt-BR": "Desenvolvedor web (projetos por conta própria)",
      en: "Web developer (independent projects)",
    },
    organization: "NYO Telecom · Meteoros Rock Band",
    location: "Remoto — Bauru, SP",
    startDate: "2026-06",
    endDate: null,
    bullets: {
      "pt-BR": [
        "Publiquei e mantenho dois sites em produção: nyotelecom.com.br (provedor de internet, no ar desde 11/08/2026) e bandameteoros.com.br.",
        "Site do provedor em quatro idiomas — português, inglês, espanhol e chinês — com trilhas separadas para cliente residencial e empresarial e captura de leads em Supabase.",
        "Site da banda com agenda de shows (exportação para calendário em .ics) e loja com carrinho e fechamento de pedido, desenhado a partir da tela de celular.",
        "PageSpeed 95 no celular e 100 no desktop no site da banda, sustentado por 67 testes unitários e 7 fluxos de ponta a ponta rodando em desktop e celular.",
        "Levantei requisito direto com o dono do negócio, priorizei escopo e cuidei do deploy, do domínio e da manutenção depois da publicação.",
      ],
      en: [
        "Shipped and maintain two production sites: nyotelecom.com.br (internet provider, live since 2026-08-11) and bandameteoros.com.br.",
        "The provider site ships in four languages — Portuguese, English, Spanish and Chinese — with separate tracks for home and business customers and lead capture persisted to Supabase.",
        "The band site has a tour agenda (with .ics calendar export) and a store with cart and order checkout, designed phone-screen first.",
        "PageSpeed 95 mobile / 100 desktop on the band site, backed by 67 unit tests and 7 end-to-end flows running on both desktop and mobile.",
        "Gathered requirements directly with the business owner, prioritized scope, and handled deploy, domain and post-launch maintenance.",
      ],
    },
  },
  {
    role: {
      "pt-BR": "Estagiário de TI — Suporte e Infraestrutura",
      en: "IT Intern — Support and Infrastructure",
    },
    organization: "Unimed Bauru",
    location: "Bauru, SP",
    startDate: "2025-04",
    endDate: "2025-09",
    bullets: {
      "pt-BR": [
        "Suporte técnico a usuários em ambiente hospitalar, com alto volume de chamados e exigência de resposta rápida.",
        "Manutenção preventiva e corretiva de hardware — desktops, impressoras, periféricos — e de cabeamento de rede.",
        "Operação em ambiente Windows corporativo com Active Directory, onde aprendi na prática o peso de processo, documentação e segurança.",
        "A visão de infraestrutura que veio daí ajuda diretamente no desenvolvimento: entender a máquina do outro lado muda como se escreve o software.",
      ],
      en: [
        "Technical support for users in a hospital environment, with high ticket volume and tight response expectations.",
        "Preventive and corrective hardware maintenance — desktops, printers, peripherals — and network cabling.",
        "Worked in a corporate Windows environment with Active Directory, learning first-hand what process, documentation and security really cost.",
        "That infrastructure perspective feeds straight back into development: understanding the machine on the other end changes how you write software.",
      ],
    },
  },
];

export const education: Education[] = [
  {
    degree: {
      "pt-BR": "Bacharelado em Ciência da Computação",
      en: "B.Sc. in Computer Science",
    },
    institution: "Faculdades Integradas de Bauru (FIB)",
    startDate: "2024-01",
    endDate: "2027-12",
  },
];

const CURSO_EM_VIDEO: Localized<string> = {
  "pt-BR": "Curso em Vídeo",
  en: "Curso em Vídeo",
};

export const courses: Course[] = [
  {
    name: { "pt-BR": "Python do Zero ao Avançado", en: "Python from Zero to Advanced" },
    provider: CURSO_EM_VIDEO,
    detail: {
      "pt-BR": "3 módulos × 40h — concluído entre 2024 e 2025",
      en: "3 modules × 40h — completed between 2024 and 2025",
    },
  },
  {
    name: { "pt-BR": "JavaScript", en: "JavaScript" },
    provider: CURSO_EM_VIDEO,
    detail: { "pt-BR": "40h — em andamento", en: "40h — in progress" },
  },
  {
    name: {
      "pt-BR": "Inteligência Artificial e LLMs",
      en: "Artificial Intelligence and LLMs",
    },
    provider: {
      "pt-BR": "Estudo autodidata",
      en: "Self-directed study",
    },
    detail: {
      "pt-BR":
        "API da Anthropic (Claude), engenharia de prompt e integração de IA em aplicações",
      en: "Anthropic (Claude) API, prompt engineering and integrating AI into applications",
    },
  },
];

export const languages: Language[] = [
  {
    name: { "pt-BR": "Português", en: "Portuguese" },
    level: { "pt-BR": "Nativo", en: "Native" },
  },
  {
    name: { "pt-BR": "Inglês", en: "English" },
    level: {
      "pt-BR": "Intermediário — leitura fluente de documentação técnica",
      en: "Intermediate — fluent reading of technical documentation",
    },
  },
];

/**
 * Caminho do PDF gerado por `npm run resume:pdf`, um por idioma.
 *
 * O nome do arquivo carrega o nome do candidato de propósito: ele vira o
 * anexo no e-mail e o item na pasta de downloads do recrutador, onde
 * "curriculo.pdf" é o décimo arquivo com esse nome e some.
 */
export const RESUME_PDF: Localized<string> = {
  "pt-BR": "/curriculo-bryan-souto.pdf",
  en: "/resume-bryan-souto.pdf",
};
