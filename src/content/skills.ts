import type { Skill, SkillCategory, Localized } from "@/lib/types";

/**
 * Habilidades técnicas.
 *
 * ATENÇÃO (RN-03): os níveis abaixo partem do currículo de 2025 e foram
 * ajustados para o que os projetos em produção comprovam — TypeScript, React
 * e Next.js deixaram de ser "estudo" quando dois produtos foram ao ar.
 *
 * Bryan deve revisar cada linha antes de publicar. Inflar aqui não ganha a
 * vaga: custa ela na entrevista técnica, onde a pergunta vem em cima do que
 * está escrito.
 */
export const skills: Skill[] = [
  // Linguagens
  { name: "TypeScript", level: "solido", category: "linguagens" },
  { name: "JavaScript", level: "solido", category: "linguagens" },
  { name: "Python", level: "confortavel", category: "linguagens" },
  { name: "Java", level: "confortavel", category: "linguagens" },
  { name: "C", level: "aprendendo", category: "linguagens" },
  { name: "C++", level: "aprendendo", category: "linguagens" },

  // Frontend
  { name: "React 19", level: "solido", category: "frontend" },
  { name: "Next.js (App Router)", level: "solido", category: "frontend" },
  { name: "Tailwind CSS", level: "solido", category: "frontend" },
  { name: "HTML semântico", level: "solido", category: "frontend" },
  { name: "CSS moderno", level: "solido", category: "frontend" },
  { name: "Acessibilidade (WCAG)", level: "confortavel", category: "frontend" },
  { name: "shadcn/ui", level: "confortavel", category: "frontend" },

  // Backend
  { name: "Node.js", level: "confortavel", category: "backend" },
  { name: "Server Components", level: "confortavel", category: "backend" },
  { name: "Zod", level: "confortavel", category: "backend" },
  { name: "Selenium", level: "confortavel", category: "backend" },
  { name: "APIs REST", level: "confortavel", category: "backend" },

  // Dados
  { name: "Supabase", level: "confortavel", category: "dados" },
  { name: "PostgreSQL", level: "aprendendo", category: "dados" },
  { name: "Microsoft SQL Server", level: "confortavel", category: "dados" },
  { name: "MongoDB", level: "aprendendo", category: "dados" },

  // Ferramentas
  { name: "Git / GitHub", level: "solido", category: "ferramentas" },
  { name: "Vercel", level: "solido", category: "ferramentas" },
  { name: "Vitest", level: "confortavel", category: "ferramentas" },
  { name: "Playwright", level: "confortavel", category: "ferramentas" },
  { name: "Windows / Active Directory", level: "confortavel", category: "ferramentas" },
  { name: "Linux", level: "aprendendo", category: "ferramentas" },
];

export const CATEGORY_LABELS: Record<SkillCategory, Localized<string>> = {
  linguagens: { "pt-BR": "Linguagens", en: "Languages" },
  frontend: { "pt-BR": "Front-end", en: "Front-end" },
  backend: { "pt-BR": "Back-end", en: "Back-end" },
  dados: { "pt-BR": "Dados", en: "Data" },
  ferramentas: { "pt-BR": "Ferramentas", en: "Tooling" },
};

/**
 * Rótulos honestos, sem escala de estrelinhas.
 *
 * Barra de progresso em skill é ruído: ninguém sabe o que "React 80%"
 * significa, e o número é sempre inventado. Três faixas nomeadas dizem mais
 * e não fingem precisão que não existe.
 */
export const LEVEL_LABELS: Record<Skill["level"], Localized<string>> = {
  solido: { "pt-BR": "Sólido", en: "Solid" },
  confortavel: { "pt-BR": "Confortável", en: "Comfortable" },
  aprendendo: { "pt-BR": "Aprendendo", en: "Learning" },
};

export const CATEGORY_ORDER: SkillCategory[] = [
  "linguagens",
  "frontend",
  "backend",
  "dados",
  "ferramentas",
];
