import { useId, useState } from "react";

import { projects } from "@/content/projects";
import { ui } from "@/content/ui";
import { useLocale } from "@/lib/locale";
import type { Project } from "@/lib/types";
import { Section } from "./Section";

import nyoDesktop from "@/assets/projects/nyo-desktop.webp";
import nyoMobile from "@/assets/projects/nyo-mobile.webp";
import meteorosDesktop from "@/assets/projects/meteoros-desktop.webp";
import meteorosMobile from "@/assets/projects/meteoros-mobile.webp";

/**
 * Projetos.
 *
 * A estrutura problema → o que construí → resultado continua sendo o que
 * transforma "conheço React" em "resolvo problema". O que mudou é quando cada
 * parte aparece.
 *
 * Antes, os quatro projetos abriam os três parágrafos de uma vez, mais duas
 * capturas cada. Eram doze blocos de texto seguidos numa seção só, e o efeito
 * era o contrário do pretendido: com tudo aberto, nada tem destaque, e quem
 * chega rolando desiste antes de achar o que importa.
 *
 * Agora o cartão fechado mostra o que decide se vale continuar — nome, tipo de
 * trabalho, RESULTADO, e o link do site no ar. O problema e o caminho ficam
 * atrás de um clique, para quem se interessou. Nada foi removido; o que mudou
 * é a ordem em que se oferece.
 */
const SHOTS: Record<string, { wide: string; tall: string }> = {
  "nyo-telecom": { wide: nyoDesktop, tall: nyoMobile },
  meteoros: { wide: meteorosDesktop, tall: meteorosMobile },
};

function ProjectRow({ project }: { project: Project }) {
  const { t } = useLocale();
  const [aberto, setAberto] = useState(false);
  const painelId = useId();
  const shots = SHOTS[project.slug];

  return (
    <li data-reveal className="reveal group border-b border-border py-9 md:px-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h3 className="text-2xl font-medium transition-transform duration-300 group-hover:translate-x-1.5 md:text-3xl">
            {project.title}
          </h3>
          <p className="label-sm mt-2 text-muted-foreground/80">
            {project.stack.join(" · ")}
          </p>
        </div>

        <span className="label-sm shrink-0 text-muted-foreground">
          <span className={project.status === "live" ? "text-web-strong" : undefined}>
            {t(ui.projects.status[project.status])}
          </span>{" "}
          · {project.year}
        </span>
      </div>

      {/*
       * O resultado é a única das três partes que fica sempre à vista. É a que
       * responde "e daí?" — as outras duas explicam como se chegou nela.
       */}
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/90 md:text-lg">
        {t(project.outcome)}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="label-sm link-web text-web-strong"
          >
            {t(ui.projects.live)} ↗
          </a>
        )}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="label-sm link-web text-muted-foreground"
          >
            {t(ui.projects.repo)} ↗
          </a>
        )}

        <button
          type="button"
          aria-expanded={aberto}
          aria-controls={painelId}
          onClick={() => setAberto((v) => !v)}
          className="label-sm ml-auto flex items-center gap-2 border border-border px-4 py-2 text-muted-foreground transition-colors hover:border-web hover:text-web-strong"
        >
          {aberto ? t(ui.projects.close) : t(ui.projects.open)}
          <span
            aria-hidden="true"
            className={`transition-transform duration-300 ${aberto ? "rotate-45" : ""}`}
          >
            +
          </span>
        </button>
      </div>

      {aberto && (
        <div id={painelId} className="disclosure-body mt-8">
          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="label-sm text-web-strong">{t(ui.projects.problem)}</dt>
              <dd className="mt-2 text-base leading-relaxed text-foreground/85 md:text-lg">
                {t(project.problem)}
              </dd>
            </div>
            <div>
              <dt className="label-sm text-web-strong">{t(ui.projects.solution)}</dt>
              <dd className="mt-2 text-base leading-relaxed text-foreground/85 md:text-lg">
                {t(project.solution)}
              </dd>
            </div>
          </dl>

          {shots && (
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-[3fr_2fr]">
              <div className="h-[190px] overflow-hidden border border-border sm:h-[270px]">
                <img
                  src={shots.wide}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="hidden h-[270px] overflow-hidden border border-border sm:block">
                <img
                  src={shots.tall}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export function Projects() {
  const { t } = useLocale();

  return (
    <Section
      id="projetos"
      label={t(ui.nav.projetos)}
      className="mx-auto max-w-4xl scroll-mt-24 px-6 py-24 md:py-32"
    >
      <ul className="mt-10 border-t border-border">
        {projects.map((project) => (
          <ProjectRow key={project.slug} project={project} />
        ))}
      </ul>
    </Section>
  );
}
