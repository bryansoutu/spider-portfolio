import {
  skills,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  LEVEL_LABELS,
} from "@/content/skills";
import { softSkills } from "@/content/soft-skills";
import { capabilities } from "@/content/capabilities";
import type { SkillLevel } from "@/lib/types";
import { LOCALE } from "@/lib/locale";
import { Section } from "./Section";

/**
 * O nível vira uma marca visual E o rótulo escrito, nunca só a marca.
 *
 * A paleta é monocromática, então não há matiz para diferenciar três níveis —
 * a distinção é opacidade e traço da borda. Quem não percebe a diferença
 * continua lendo "Sólido" por extenso ao lado, que é a exigência da WCAG 1.4.1
 * e, aqui, também a exigência de honestidade: nível inflado custa a vaga na
 * entrevista técnica, não ganha ela.
 */
const LEVEL_STYLE: Record<SkillLevel, string> = {
  solido: "border-foreground/50 text-foreground",
  confortavel: "border-border text-foreground/80",
  aprendendo: "border-dashed border-border text-muted-foreground",
};

export function Capabilities() {
  return (
    <Section id="faco" label="O que eu faço" className="mx-auto max-w-4xl px-6 py-28">
      <ul className="mt-10 border-t border-border">
        {capabilities.map((capability, i) => (
          <li
            key={capability.id}
            data-reveal
            className="reveal group flex flex-col gap-3 border-b border-border py-8 md:flex-row md:gap-10 md:px-4"
          >
            <span
              aria-hidden="true"
              className="font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase md:w-16 md:shrink-0"
            >
              [ {String.fromCharCode(97 + i)} ]
            </span>
            <div>
              <h3 className="text-xl font-medium transition-transform duration-300 group-hover:translate-x-2">
                {capability.name[LOCALE]}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {capability.description[LOCALE]}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Skills() {
  return (
    <Section id="habilidades" label="Habilidades" className="mx-auto max-w-4xl px-6 py-28">
      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        {CATEGORY_ORDER.map((category) => {
          const items = skills.filter((s) => s.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category} data-reveal className="reveal">
              <h3 className="border-b border-border pb-3 font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase">
                {CATEGORY_LABELS[category][LOCALE]}
              </h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {items.map((skill) => (
                  <li
                    key={skill.name}
                    className={`border px-2.5 py-1.5 font-mono text-xs ${LEVEL_STYLE[skill.level]}`}
                  >
                    {skill.name}
                    <span className="ml-2 text-[0.6rem] tracking-[0.15em] text-muted-foreground uppercase">
                      {LEVEL_LABELS[skill.level][LOCALE]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <h3
        data-reveal
        className="reveal mt-24 font-mono text-xs tracking-[0.4em] text-muted-foreground uppercase"
      >
        Como eu trabalho
      </h3>

      <ul className="mt-10 border-t border-border">
        {softSkills.map((skill) => (
          <li
            key={skill.id}
            data-reveal
            className="reveal group border-b border-border py-8 md:px-4"
          >
            {/*
             * Afirmação e evidência sempre juntas, nessa ordem. Separá-las —
             * lista de qualidades aqui, provas ali — devolveria o problema
             * que a seção existe para resolver: adjetivo sem fato atrás.
             */}
            <p className="font-medium transition-transform duration-300 group-hover:translate-x-2">
              {skill.label[LOCALE]}
            </p>
            <p className="mt-2 max-w-3xl font-mono text-xs leading-relaxed text-muted-foreground">
              {skill.evidence[LOCALE]}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
