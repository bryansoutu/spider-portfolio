import { projects } from "@/content/projects";
import { LOCALE } from "@/lib/locale";
import { Section } from "./Section";

import nyoDesktop from "@/assets/projects/nyo-desktop.webp";
import nyoMobile from "@/assets/projects/nyo-mobile.webp";
import meteorosDesktop from "@/assets/projects/meteoros-desktop.webp";
import meteorosMobile from "@/assets/projects/meteoros-mobile.webp";

/**
 * Projetos.
 *
 * As linhas são as do Lovable — divisória fina, o título deslizando para a
 * direita no hover, tipo à direita em mono. O que entrou por baixo foi a
 * estrutura problema → solução → resultado, que é a única coisa que
 * transforma "conheço React" em "resolvo problema".
 *
 * Só os dois projetos em produção mostram captura. BjrBot e este portfólio
 * não têm imagem que valha: um card grande e vazio chamaria atenção para o
 * buraco em vez de para o trabalho.
 */
const SHOTS: Record<string, { wide: string; tall: string }> = {
  "nyo-telecom": { wide: nyoDesktop, tall: nyoMobile },
  meteoros: { wide: meteorosDesktop, tall: meteorosMobile },
};

const STATUS_LABEL: Record<string, string> = {
  live: "No ar",
  wip: "Em construção",
  archived: "Arquivado",
};

export function Projects() {
  return (
    <Section id="projetos" label="Projetos" className="mx-auto max-w-4xl px-6 py-28">
      <ul className="mt-10 border-t border-border">
        {projects.map((project) => {
          const shots = SHOTS[project.slug];

          return (
            <li
              key={project.slug}
              data-reveal
              className="reveal group border-b border-border py-10 md:px-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                <div>
                  <h3 className="text-2xl font-medium transition-transform duration-300 group-hover:translate-x-2">
                    {project.title}
                  </h3>
                  <p className="mt-2 font-mono text-[0.65rem] tracking-[0.25em] text-muted-foreground/70 uppercase">
                    {project.stack.join(" · ")}
                  </p>
                </div>

                <span className="font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase">
                  {STATUS_LABEL[project.status]} · {project.year}
                </span>
              </div>

              <dl className="mt-6 grid gap-5 md:grid-cols-3">
                {(
                  [
                    ["O problema", project.problem[LOCALE]],
                    ["O que construí", project.solution[LOCALE]],
                    ["Resultado", project.outcome[LOCALE]],
                  ] as const
                ).map(([term, text]) => (
                  <div key={term}>
                    <dt className="font-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground uppercase">
                      {term}
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed text-foreground/85">
                      {text}
                    </dd>
                  </div>
                ))}
              </dl>

              {shots && (
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-[3fr_2fr]">
                  <div className="h-[180px] overflow-hidden border border-border sm:h-[260px]">
                    <img
                      src={shots.wide}
                      alt=""
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="hidden h-[260px] overflow-hidden border border-border sm:block">
                    <img
                      src={shots.tall}
                      alt=""
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </div>
              )}

              {(project.liveUrl || project.repoUrl) && (
                <div className="mt-6 flex flex-wrap gap-6 font-mono text-[0.65rem] tracking-[0.3em] uppercase">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-web"
                    >
                      Ver no ar
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-web text-muted-foreground hover:text-foreground"
                    >
                      Ver o código
                    </a>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
