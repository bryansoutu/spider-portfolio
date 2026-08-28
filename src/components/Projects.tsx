import { useId, useState } from "react";

import { projects } from "@/content/projects";
import { ui } from "@/content/ui";
import { useLocale } from "@/lib/locale";
import type { Project } from "@/lib/types";
import { Section } from "./Section";


/**
 * Projetos.
 *
 * A seção tem DOIS pesos, e a diferença é a coisa mais importante daqui.
 *
 * Antes, os quatro projetos eram quatro linhas de texto idênticas. Um site de
 * provedor de internet atendendo clientes reais e um script de automação
 * arquivado tinham exatamente a mesma aparência — e quem rola rápido, que é
 * todo mundo, não descobria a diferença. O trabalho que mais prova competência
 * ficava escondido no meio de uma lista uniforme.
 *
 * Agora:
 *
 *   DESTAQUE — os que estão no ar e têm endereço para visitar. Cartão grande,
 *   com a CAPTURA À VISTA (não mais atrás de um clique), selo "No ar" em
 *   vermelho e o botão de visitar preenchido. São os dois produtos com cliente
 *   real do outro lado; é o que um recrutador precisa ver nos primeiros
 *   segundos.
 *
 *   OS DEMAIS — linhas compactas, como a seção inteira era. Continuam com
 *   tudo: resultado à vista, problema e caminho atrás do clique.
 *
 * O critério é `liveUrl`, e não o campo `featured`: destaque aqui significa
 * "dá para ir lá e ver funcionando agora". O BjrBot é `featured: true` e não
 * tem para onde mandar ninguém; este portfólio está no ar mas linkar para ele
 * mesmo seria um círculo.
 */
/*
 * As capturas, em todas as larguras geradas por `npm run images`.
 *
 * O `import.meta.glob` evita dezoito linhas de import — são quatro imagens em
 * três ou quatro tamanhos cada — e mantém o hash de conteúdo no nome do
 * arquivo, que é o que permite o cache eterno em `/assets`.
 *
 * Só a pasta `responsivo/` entra. Os arquivos de 1600px ao lado continuam no
 * repositório como FONTE, e ficam de fora do pacote justamente por não serem
 * importados por ninguém.
 */
const CAPTURAS = import.meta.glob("../assets/projects/responsivo/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function conjunto(base: string, larguras: number[]) {
  const url = (largura: number) => {
    const chave = Object.keys(CAPTURAS).find((k) => k.endsWith(`/${base}-${largura}.webp`));
    if (!chave) {
      throw new Error(`captura ausente: ${base}-${largura}.webp — rode npm run images`);
    }
    return CAPTURAS[chave]!;
  };

  return {
    /* O `src` é a MENOR: é o que navegador antigo, sem srcset, vai buscar. */
    src: url(larguras[0]!),
    srcSet: larguras.map((l) => `${url(l)} ${l}w`).join(", "),
  };
}

const LARGURAS_WIDE = [480, 640, 960, 1400];
const LARGURAS_TALL = [320, 480, 640];

/*
 * `sizes` diz ao navegador quanto ESPAÇO a imagem vai ocupar, antes de o CSS
 * existir — é com isso que ele escolhe a largura certa do `srcset`. Errar aqui
 * é pior que não ter srcset nenhum: ele baixa a versão errada com convicção.
 *
 * O cartão em destaque põe a captura numa coluna de ~1,15/2,15 da faixa a
 * partir de 1024px; abaixo disso ela ocupa a largura toda.
 */
const SIZES_WIDE = "(min-width: 1280px) 660px, (min-width: 1024px) 52vw, 100vw";
const SIZES_TALL = "(min-width: 640px) 320px, 100vw";

const SHOTS: Record<string, { wide: ReturnType<typeof conjunto>; tall: ReturnType<typeof conjunto> }> = {
  "nyo-telecom": {
    wide: conjunto("nyo-desktop", LARGURAS_WIDE),
    tall: conjunto("nyo-mobile", LARGURAS_TALL),
  },
  meteoros: {
    wide: conjunto("meteoros-desktop", LARGURAS_WIDE),
    tall: conjunto("meteoros-mobile", LARGURAS_TALL),
  },
};

/** O `+` que gira 45° e vira `×` ao abrir. */
function Mais({ aberto }: { aberto: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block transition-transform duration-300 ${aberto ? "rotate-45" : ""}`}
    >
      +
    </span>
  );
}

/** Problema e caminho — o miolo que abre, igual nos dois formatos. */
function Detalhes({ project, id }: { project: Project; id: string }) {
  const { t } = useLocale();

  return (
    <dl id={id} className="disclosure-body mt-8 grid gap-6 sm:grid-cols-2">
      <div>
        <dt className="label-sm text-web-strong">{t(ui.projects.problem)}</dt>
        <dd className="corpo mt-2 text-foreground/85">{t(project.problem)}</dd>
      </div>
      <div>
        <dt className="label-sm text-web-strong">{t(ui.projects.solution)}</dt>
        <dd className="corpo mt-2 text-foreground/85">{t(project.solution)}</dd>
      </div>
    </dl>
  );
}

function CartaoDestaque({ project }: { project: Project }) {
  const { t } = useLocale();
  const [aberto, setAberto] = useState(false);
  const painelId = useId();
  const shots = SHOTS[project.slug];

  return (
    <li
      data-reveal
      className="reveal group border border-border transition-colors duration-300 hover:border-web/50"
    >
      {/*
       * Em telas largas a captura fica ao lado do texto, e não empilhada. É o
       * que faz o cartão parecer um produto e não um post de blog — e o espaço
       * horizontal sobrando era justamente o desperdício de 1920px.
       */}
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        {shots && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t(ui.projects.live)}: ${project.title}`}
            className="relative block overflow-hidden border-b border-border lg:border-b-0 lg:border-r"
          >
            <img
              src={shots.wide.src}
              srcSet={shots.wide.srcSet}
              sizes={SIZES_WIDE}
              width={1400}
              height={875}
              alt=""
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
            />
            {/*
             * O selo fica SOBRE a imagem, não ao lado do título. É o primeiro
             * elemento colorido que o olho encontra ao chegar na seção, e diz
             * a única coisa que diferencia estes dois dos outros: existe, está
             * de pé, dá para visitar.
             */}
            <span className="label-sm absolute top-4 left-4 flex items-center gap-2 bg-web px-3 py-1.5 text-background">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-background/70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-background" />
              </span>
              {t(ui.projects.status.live)}
            </span>
          </a>
        )}

        <div className="flex flex-col justify-center p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="titulo-projeto font-medium">{project.title}</h3>
            <span className="label-sm text-muted-foreground">{project.year}</span>
          </div>

          <p className="label-sm mt-3 text-muted-foreground/80">
            {project.stack.join(" · ")}
          </p>

          <p className="corpo mt-5 text-foreground/90">{t(project.outcome)}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="label-sm w-full border border-web bg-web px-5 py-3 text-center text-background transition-opacity hover:opacity-85 sm:w-auto sm:py-2.5"
            >
              {t(ui.projects.live)} ↗
            </a>

            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="label-sm link-web px-1 text-muted-foreground"
              >
                {t(ui.projects.repo)} ↗
              </a>
            )}

            <button
              type="button"
              aria-expanded={aberto}
              aria-controls={painelId}
              onClick={() => setAberto((v) => !v)}
              className="label-sm flex w-full items-center justify-center gap-2 border border-border px-4 py-3 text-muted-foreground transition-colors hover:border-web hover:text-web-strong sm:ml-auto sm:w-auto sm:py-2.5"
            >
              {aberto ? t(ui.projects.close) : t(ui.projects.open)}
              <Mais aberto={aberto} />
            </button>
          </div>
        </div>
      </div>

      {aberto && (
        <div className="border-t border-border px-6 pt-2 pb-8 sm:px-8">
          <Detalhes project={project} id={painelId} />

          {shots && (
            <figure className="mt-8">
              <img
                src={shots.tall.src}
                srcSet={shots.tall.srcSet}
                sizes={SIZES_TALL}
                width={640}
                height={1385}
                alt=""
                loading="lazy"
                decoding="async"
                className="max-h-[420px] w-full border border-border object-cover object-top sm:max-w-xs"
              />
              <figcaption className="label-sm mt-3 text-muted-foreground/70">
                {t(ui.projects.mobileShot)}
              </figcaption>
            </figure>
          )}
        </div>
      )}
    </li>
  );
}

function LinhaCompacta({ project }: { project: Project }) {
  const { t } = useLocale();
  const [aberto, setAberto] = useState(false);
  const painelId = useId();

  return (
    <li data-reveal className="reveal group border-b border-border py-8 md:px-2">
      <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h3 className="titulo-bloco font-medium transition-transform duration-300 group-hover:translate-x-1.5">
            {project.title}
          </h3>
          <p className="label-sm mt-2 text-muted-foreground/80">
            {project.stack.join(" · ")}
          </p>
        </div>

        <span className="label-sm shrink-0 text-muted-foreground">
          {t(ui.projects.status[project.status])} · {project.year}
        </span>
      </div>

      <p className="corpo mt-4 max-w-2xl text-foreground/85">{t(project.outcome)}</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7">
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
          className="label-sm flex w-full items-center justify-center gap-2 border border-border px-4 py-3 text-muted-foreground transition-colors hover:border-web hover:text-web-strong sm:ml-auto sm:w-auto sm:py-2"
        >
          {aberto ? t(ui.projects.close) : t(ui.projects.open)}
          <Mais aberto={aberto} />
        </button>
      </div>

      {aberto && <Detalhes project={project} id={painelId} />}
    </li>
  );
}

export function Projects() {
  const { t } = useLocale();

  const destaques = projects.filter((p) => p.status === "live" && p.liveUrl);
  const demais = projects.filter((p) => !(p.status === "live" && p.liveUrl));

  return (
    <Section
      id="projetos"
      label={t(ui.nav.projetos)}
      className="mx-auto w-full max-w-4xl scroll-mt-24 px-6 py-16 sm:py-24 md:py-32 xl:max-w-6xl xl:px-8 2xl:max-w-7xl"
    >
      <ul className="mt-10 grid gap-8 xl:gap-10">
        {destaques.map((project) => (
          <CartaoDestaque key={project.slug} project={project} />
        ))}
      </ul>

      {demais.length > 0 && (
        <>
          <h3 data-reveal className="reveal mt-20 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-border print:hidden" />
            <span className="label text-muted-foreground">{t(ui.projects.tambem)}</span>
          </h3>

          <ul className="mt-8 border-t border-border">
            {demais.map((project) => (
              <LinhaCompacta key={project.slug} project={project} />
            ))}
          </ul>
        </>
      )}
    </Section>
  );
}
