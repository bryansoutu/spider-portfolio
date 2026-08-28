import { useId, useMemo, useState } from "react";

import {
  skills,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  LEVEL_LABELS,
} from "@/content/skills";
import { softSkills } from "@/content/soft-skills";
import { capabilities } from "@/content/capabilities";
import { ui } from "@/content/ui";
import type { SkillCategory, SkillLevel } from "@/lib/types";
import { useLocale } from "@/lib/locale";
import { Section } from "./Section";

/**
 * O nível vira uma marca visual E o rótulo escrito, nunca só a marca.
 *
 * O site tem uma cor agora, e seria fácil usá-la para ranquear: vermelho =
 * sólido, cinza = aprendendo. Não é o que ela faz aqui. Vermelho marca o que
 * é interativo e o que orienta a leitura; se ele também significasse "nível
 * alto", passaria a significar duas coisas, e quem lê teria de adivinhar qual
 * delas em cada lugar.
 *
 * A distinção de nível continua sendo peso da borda mais o rótulo por extenso
 * ao lado — exigência da WCAG 1.4.1 e, aqui, também de honestidade: nível
 * inflado custa a vaga na entrevista técnica, não ganha ela.
 */
const LEVEL_STYLE: Record<SkillLevel, string> = {
  solido: "border-foreground/55 text-foreground",
  confortavel: "border-border text-foreground/85",
  aprendendo: "border-dashed border-border text-muted-foreground",
};

export function Capabilities() {
  const { t } = useLocale();

  return (
    <Section
      id="faco"
      label={t(ui.nav.faco)}
      className="mx-auto max-w-4xl scroll-mt-24 px-6 py-24 md:py-32"
    >
      <ul className="mt-10 border-t border-border">
        {capabilities.map((capability, i) => (
          <li
            key={capability.id}
            data-reveal
            className="reveal group flex flex-col gap-3 border-b border-border py-8 md:flex-row md:gap-10 md:px-4"
          >
            <span
              aria-hidden="true"
              className="font-mono text-sm tracking-[0.18em] text-web/70 uppercase transition-colors duration-300 group-hover:text-web-strong md:w-16 md:shrink-0"
            >
              [ {String.fromCharCode(97 + i)} ]
            </span>
            <div>
              <h3 className="text-2xl font-medium transition-transform duration-300 group-hover:translate-x-1.5 md:text-3xl">
                {t(capability.name)}
              </h3>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground/85 md:text-lg">
                {t(capability.description)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Um botão de filtro. Mesmo desenho do seletor de idioma, de propósito. */
function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={`label-sm border px-3 py-1.5 transition-colors ${
        ativo
          ? "border-web bg-web text-background"
          : "border-border text-muted-foreground hover:border-web/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Uma afirmação sobre como o Bryan trabalha, com a evidência atrás de um
 * clique.
 *
 * Afirmação e evidência continuam juntas e nessa ordem — separá-las devolveria
 * o problema que a seção existe para resolver, adjetivo sem fato atrás. O que
 * mudou é que as seis evidências não abrem todas de uma vez: eram seis
 * parágrafos densos em sequência, e parágrafo que ninguém lê não prova nada.
 */
function SoftSkillRow({
  label,
  evidence,
}: {
  label: string;
  evidence: string;
}) {
  const [aberto, setAberto] = useState(false);
  const painelId = useId();

  return (
    <li data-reveal className="reveal border-b border-border">
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls={painelId}
        onClick={() => setAberto((v) => !v)}
        className="group flex w-full items-center gap-4 py-6 text-left md:px-4"
      >
        <span className="flex-1 text-lg font-medium transition-transform duration-300 group-hover:translate-x-1.5 md:text-xl">
          {label}
        </span>
        <span
          aria-hidden="true"
          className={`text-2xl text-web transition-transform duration-300 ${
            aberto ? "rotate-45" : "group-hover:scale-125"
          }`}
        >
          +
        </span>
      </button>

      {aberto && (
        <p
          id={painelId}
          className="disclosure-body max-w-3xl pb-7 text-base leading-relaxed text-foreground/85 md:px-4 md:text-lg"
        >
          {evidence}
        </p>
      )}
    </li>
  );
}

export function Skills() {
  const { t } = useLocale();
  const [categoria, setCategoria] = useState<SkillCategory | "tudo">("tudo");
  const [soDomino, setSoDomino] = useState(true);

  /*
   * A lista tem 28 itens em cinco categorias. Aberta de uma vez, é uma parede
   * de caixinhas em que "TypeScript sólido" e "Linux aprendendo" têm
   * exatamente o mesmo peso visual — e a conclusão que o recrutador tira de
   * uma parede é "essa pessoa listou tudo que já viu na vida".
   *
   * Então o padrão mostra só o que ele sustenta numa entrevista técnica, e o
   * resto fica a um clique. A contagem ao lado ("12 / 28") deixa explícito que
   * há mais: filtro que esconde sem avisar é filtro que mente.
   */
  const visiveis = useMemo(
    () =>
      skills.filter(
        (s) =>
          (categoria === "tudo" || s.category === categoria) &&
          (!soDomino || s.level === "solido")
      ),
    [categoria, soDomino]
  );

  return (
    <Section
      id="habilidades"
      label={t(ui.nav.habilidades)}
      className="mx-auto max-w-4xl scroll-mt-24 px-6 py-24 md:py-32"
    >
      <div data-reveal className="reveal mt-10 flex flex-wrap items-center gap-2">
        <Chip ativo={categoria === "tudo"} onClick={() => setCategoria("tudo")}>
          {t(ui.skills.all)}
        </Chip>
        {CATEGORY_ORDER.map((c) => (
          <Chip key={c} ativo={categoria === c} onClick={() => setCategoria(c)}>
            {t(CATEGORY_LABELS[c])}
          </Chip>
        ))}
      </div>

      <div
        data-reveal
        className="reveal mt-4 flex flex-wrap items-center justify-between gap-3"
      >
        <button
          type="button"
          aria-pressed={!soDomino}
          onClick={() => setSoDomino((v) => !v)}
          className="label-sm link-web text-muted-foreground"
        >
          {soDomino ? t(ui.skills.showAll) : t(ui.skills.showCore)}
        </button>

        <p aria-live="polite" className="label-sm text-muted-foreground/80">
          {t(ui.skills.counter)} {visiveis.length} / {skills.length}
        </p>
      </div>

      {/*
       * Estado vazio. "Dados" não tem nenhum item marcado como sólido — com o
       * filtro ligado por padrão, clicar nessa categoria devolvia uma área em
       * branco sem explicação, que se lê como bug.
       */}
      {visiveis.length === 0 && (
        <p className="mt-8 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
          {t(ui.skills.empty)}{" "}
          <button
            type="button"
            onClick={() => setSoDomino(false)}
            className="link-web text-web-strong"
          >
            {t(ui.skills.showAll)}
          </button>
        </p>
      )}

      <ul className="mt-8 flex flex-wrap gap-2">
        {visiveis.map((skill) => (
          <li
            key={skill.name}
            className={`border px-3.5 py-2 font-mono text-sm transition-colors ${LEVEL_STYLE[skill.level]}`}
          >
            {skill.name}
            {/*
             * Com o filtro padrão ligado, TODOS os itens visíveis são sólidos —
             * e escrever "sólido" nove vezes em sequência não informa nada, só
             * dobra a largura de cada caixa. O rótulo continua no DOM para quem
             * usa leitor de tela: some da vista, não da leitura.
             */}
            <span
              className={
                soDomino
                  ? "sr-only"
                  : "label-sm ml-2 text-muted-foreground"
              }
            >
              {t(LEVEL_LABELS[skill.level])}
            </span>
          </li>
        ))}
      </ul>

      <h3 data-reveal className="reveal mt-24 flex items-center gap-3">
        <span aria-hidden="true" className="h-px w-12 bg-web print:hidden" />
        <span className="font-mono text-base tracking-[0.22em] text-web-strong uppercase md:text-lg">
          {t(ui.skills.howIWork)}
        </span>
      </h3>

      <ul className="mt-8 border-t border-border">
        {softSkills.map((skill) => (
          <SoftSkillRow
            key={skill.id}
            label={t(skill.label)}
            evidence={t(skill.evidence)}
          />
        ))}
      </ul>
    </Section>
  );
}
