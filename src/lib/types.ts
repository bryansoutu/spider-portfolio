/**
 * Contratos de domínio do portfólio.
 *
 * Regra de dependência: este módulo não importa nada de `components/`.
 * Os dados existem sem a UI; a UI não existe sem os dados.
 */

export const LOCALES = ["pt-BR", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Texto que precisa existir em todos os idiomas.
 *
 * Usar `Record<Locale, T>` (e não `Partial`) é o que faz o TypeScript recusar
 * a compilação quando falta uma tradução. É a RN-06 (paridade de idiomas)
 * garantida pelo compilador em vez de por disciplina humana.
 */
export type Localized<T> = Record<Locale, T>;

export type ProjectStatus = "live" | "wip" | "archived";

export interface Project {
  slug: string;
  title: string;
  year: number;
  status: ProjectStatus;
  /** Qual dor existia antes. */
  problem: Localized<string>;
  /** O que foi construído. */
  solution: Localized<string>;
  /** Resultado — deve conter número, link ou artefato (RN-01). */
  outcome: Localized<string>;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  /** Destaque na home. Cases não destacados ficam na listagem completa. */
  featured: boolean;
}

/**
 * Níveis espelham o currículo real. Inflar aqui custa a vaga na entrevista
 * técnica, não ganha nada (RN-03).
 */
export type SkillLevel = "aprendendo" | "confortavel" | "solido";

export type SkillCategory =
  | "linguagens"
  | "frontend"
  | "backend"
  | "dados"
  | "ferramentas";

export interface Skill {
  name: string;
  level: SkillLevel;
  category: SkillCategory;
}

/**
 * Soft skill sem evidência é adjetivo. O campo `evidence` é obrigatório
 * de propósito: força cada afirmação a apontar para um fato verificável.
 */
export interface SoftSkill {
  id: string;
  label: Localized<string>;
  evidence: Localized<string>;
}

export interface ResumeEntry {
  role: Localized<string>;
  organization: string;
  location?: string;
  startDate: string; // YYYY-MM
  endDate: string | null; // null = atual
  bullets: Localized<string[]>;
}

export interface Education {
  degree: Localized<string>;
  institution: string;
  startDate: string;
  endDate: string;
}

export interface Course {
  name: Localized<string>;
  /**
   * Localizado mesmo quando é nome próprio que não se traduz ("Curso em
   * Vídeo"): há provedores que são descrição e não marca — "estudo
   * autodidata" precisa virar "self-directed study" em inglês.
   */
  provider: Localized<string>;
  detail: Localized<string>;
}

export interface Language {
  name: Localized<string>;
  level: Localized<string>;
}

export interface ContactLink {
  id: "email" | "linkedin" | "github" | "whatsapp";
  label: string;
  href: string;
  /** Texto exibido, quando diferente do label (ex.: telefone formatado). */
  display?: string;
}

export interface Profile {
  name: string;
  shortName: string;
  headline: Localized<string>;
  location: string;
  email: string;
  phone: string;
  links: ContactLink[];
}
