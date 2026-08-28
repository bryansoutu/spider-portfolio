import { useState } from "react";

import { profile, PENDING } from "@/content/profile";
import {
  summary,
  experience,
  education,
  courses,
  languages,
} from "@/content/resume";
import { ui } from "@/content/ui";
import { formatMonth, formatRange } from "@/lib/dates";
import { useLocale } from "@/lib/locale";
import { usePrintMode } from "@/lib/print";
import { Section } from "./Section";

/**
 * Currículo.
 *
 * Fica na própria página, e não numa rota separada, porque o site é de uma
 * página só. O bloco é imprimível: a folha de estilo de impressão esconde tudo
 * que não é currículo e devolve fundo branco. Quem clicar em "Imprimir" recebe
 * o documento, não a página inteira em tinta preta — e é dali que sai o PDF.
 *
 * Ordem deliberada: o que prova trabalho entregue vem antes do que prova
 * estudo.
 *
 * NOVIDADE E ARMADILHA: o corpo do currículo agora nasce fechado. São quatro
 * listas longas no meio de uma página que já tem sete seções, e quem quer o
 * documento quase sempre quer o PDF, não a leitura na tela.
 *
 * Só que conteúdo fechado é conteúdo que não vai para o papel.
 *
 * A primeira solução foi reabrir o bloco no evento `beforeprint`, e ela TINHA
 * UMA CORRIDA que só aparecia no navegador de verdade: `window.print()` é
 * síncrono. O evento dispara, o React agenda a re-renderização — e o navegador
 * já tirou a foto da página para imprimir antes de ela acontecer. Resultado:
 * folha em branco, com o rótulo "Currículo" e mais nada, porque o `@media
 * print` esconde tudo que não é currículo e o currículo não tinha sido
 * renderizado ainda.
 *
 * Isso não aparecia em teste: disparar o evento e esperar 400ms dá ao React
 * todo o tempo do mundo. O usuário não dá.
 *
 * A solução agora não depende de tempo nenhum: **o corpo do currículo está
 * SEMPRE no DOM**. Fechado, ele é `display: none` na tela e volta a `block` no
 * `@media print`, por CSS puro. Não há estado para atualizar, não há corrida
 * para perder — se a folha for impressa, o conteúdo está lá.
 *
 * `usePrintMode()` continua, mas só para conforto: reabrir na tela durante a
 * pré-visualização, e atender o `?full=1` do gerador de PDF.
 */
export function Resume() {
  const { locale, t } = useLocale();
  const [aberto, setAberto] = useState(false);
  const imprimindo = usePrintMode();
  const mostrar = aberto || imprimindo;

  const arquivo =
    locale === "en" ? "/resume-bryan-souto.pdf" : "/curriculo-bryan-souto.pdf";

  return (
    <Section
      id="curriculo"
      label={t(ui.nav.curriculo)}
      className="resume-print mx-auto w-full max-w-3xl scroll-mt-24 px-6 py-16 sm:py-24 md:py-32 xl:max-w-4xl xl:px-8"
    >
      {/*
       * No celular os três viram uma coluna, cada um ocupando a linha inteira.
       *
       * Antes eram `flex-wrap` com `ml-auto` no terceiro: em 375px os dois
       * primeiros dividiam uma linha e o terceiro caía sozinho na seguinte,
       * empurrado para a direita pelo `ml-auto` — três larguras diferentes,
       * três alinhamentos diferentes, encostando na borda.
       */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap print:hidden">
        <a
          href={arquivo}
          download
          className="label-sm w-full border border-web bg-web px-5 py-3 text-center text-background transition-opacity hover:opacity-85 sm:w-auto sm:py-2.5"
        >
          {t(ui.resume.download)} ↓
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="label-sm w-full border border-border px-5 py-3 text-muted-foreground transition-colors hover:border-web hover:text-web-strong sm:w-auto sm:py-2.5"
        >
          {t(ui.resume.print)}
        </button>
        <button
          type="button"
          aria-expanded={mostrar}
          aria-controls="curriculo-corpo"
          onClick={() => setAberto((v) => !v)}
          className="label-sm flex w-full items-center justify-center gap-2 border border-border px-5 py-3 text-muted-foreground transition-colors hover:border-web hover:text-web-strong sm:ml-auto sm:w-auto sm:py-2.5"
        >
          {mostrar ? t(ui.resume.collapse) : t(ui.resume.expand)}
          <span
            aria-hidden="true"
            className={`transition-transform duration-300 ${mostrar ? "rotate-45" : ""}`}
          >
            +
          </span>
        </button>
      </div>

      {/*
       * `mt-14` na tela, zero no papel. O documento abria colado nos botões,
       * como se fosse continuação deles em vez de outra coisa; impresso, os
       * botões não existem e a margem só empurraria o nome para o meio da
       * primeira folha.
       */}
      <div
        id="curriculo-corpo"
        className={
          mostrar
            ? "disclosure-body mt-14 print:mt-0 print:animate-none"
            : "hidden print:block"
        }
      >
        {/*
         * Cabeçalho que só existe no papel. Na tela ele seria repetição do
         * hero, que está a uma rolagem daqui; impresso, é a única coisa que
         * diz de quem é o documento — um currículo que chega sem nome e sem
         * contato é papel em branco com texto.
         */}
        <header className="hidden print:block">
          <h1 className="text-2xl font-semibold">{profile.name}</h1>
          <p className="mt-1 text-sm">{t(profile.headline)}</p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px]">
            <li>{profile.location}</li>
            <li>{profile.email}</li>
            <li>{profile.phone}</li>
            {profile.links
              .filter(
                (l) =>
                  l.href !== PENDING && l.id !== "email" && l.id !== "whatsapp",
              )
              .map((l) => (
                <li key={l.id}>{l.display ?? l.href}</li>
              ))}
          </ul>
        </header>

        {/*
         * O resumo vem DEPOIS do cabeçalho, e não antes.
         *
         * Ele ficava acima do bloco que abre, o que na tela não incomodava.
         * No papel virava um documento que começa com um parágrafo solto e
         * só então diz de quem é — e o resumo já aparece na seção "Sobre",
         * a uma rolagem daqui, então na tela ele era repetição.
         */}
        <p className="corpo text-foreground/90 print:mt-6 print:text-[0.95rem]">
          {t(summary)}
        </p>

        <h3 className="label-sm mt-12 text-web-strong print:mt-8 print:text-black">
          {t(ui.resume.experience)}
        </h3>
        <ol className="mt-6 border-t border-border">
          {experience.map((entry) => (
            <li
              key={`${entry.organization}-${entry.startDate}`}
              className="border-b border-border py-8"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h4 className="text-[clamp(1.15rem,0.6vw+1rem,1.5rem)] font-medium print:text-lg">
                  {t(entry.role)}
                </h4>
                <span className="label-sm text-muted-foreground">
                  {formatRange(
                    entry.startDate,
                    entry.endDate,
                    locale,
                    t(ui.resume.present),
                  )}
                </span>
              </div>

              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {entry.organization}
                {entry.location && ` · ${entry.location}`}
              </p>

              <ul className="mt-4 space-y-2">
                {t(entry.bullets).map((bullet) => (
                  <li
                    key={bullet}
                    className="corpo relative pl-5 text-foreground/85 print:text-[0.9rem] before:absolute before:left-0 before:text-web before:content-['—']"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <h3 className="label-sm mt-14 text-web-strong print:text-black">
          {t(ui.resume.education)}
        </h3>
        <ul className="mt-6 border-t border-border">
          {education.map((entry) => (
            <li
              key={entry.institution}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border py-6"
            >
              <span>
                <span className="font-medium">{t(entry.degree)}</span>
                <span className="mt-1 block font-mono text-xs text-muted-foreground">
                  {entry.institution}
                </span>
              </span>
              <span className="label-sm text-muted-foreground">
                {formatMonth(entry.startDate, locale)} —{" "}
                {formatMonth(entry.endDate, locale)}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="label-sm mt-14 text-web-strong print:text-black">
          {t(ui.resume.courses)}
        </h3>
        <ul className="mt-6 border-t border-border">
          {courses.map((course) => (
            <li
              key={t(course.name)}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border py-6"
            >
              <span>
                <span className="font-medium">{t(course.name)}</span>
                <span className="mt-1 block font-mono text-xs text-muted-foreground">
                  {t(course.provider)}
                </span>
              </span>
              <span className="max-w-xs text-right font-mono text-xs text-muted-foreground">
                {t(course.detail)}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="label-sm mt-14 text-web-strong print:text-black">
          {t(ui.resume.languages)}
        </h3>
        <ul className="mt-6 border-t border-border">
          {languages.map((language) => (
            <li
              key={t(language.name)}
              className="corpo flex flex-wrap items-baseline gap-x-4 border-b border-border py-5 print:text-[0.9rem]"
            >
              <span className="font-medium">{t(language.name)}</span>
              <span className="text-muted-foreground">{t(language.level)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
