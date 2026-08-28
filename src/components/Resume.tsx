import { profile, PENDING } from "@/content/profile";
import {
  summary,
  experience,
  education,
  courses,
  languages,
} from "@/content/resume";
import { formatMonth, formatRange } from "@/lib/dates";
import { LOCALE } from "@/lib/locale";
import { Section } from "./Section";

/**
 * Currículo.
 *
 * Fica na própria página, e não numa rota separada, porque o site é de uma
 * página só — foi assim que o Lovable o desenhou, e abrir um roteador só para
 * um documento custaria mais do que entrega.
 *
 * O bloco é imprimível: a folha de estilo de impressão esconde tudo que não é
 * currículo e devolve fundo branco. Quem clicar em "Imprimir" recebe o
 * documento, não a página inteira em tinta preta — e é dali que sai o PDF.
 *
 * Ordem deliberada: o que prova trabalho entregue vem antes do que prova
 * estudo.
 */
export function Resume() {
  return (
    <Section
      id="curriculo"
      label="Currículo"
      className="resume-print mx-auto max-w-3xl px-6 py-28"
    >
      <div className="mt-8 flex flex-wrap gap-4 font-mono text-[0.65rem] tracking-[0.3em] uppercase print:hidden">
        <a
          href="/curriculo-bryan-souto.pdf"
          download
          className="border border-foreground/40 px-5 py-2.5 transition-colors hover:bg-foreground hover:text-background"
        >
          Baixar em PDF
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="border border-border px-5 py-2.5 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          Imprimir
        </button>
      </div>

      {/*
       * Cabeçalho que só existe no papel. Na tela ele seria repetição do
       * hero, que está a uma rolagem daqui; impresso, é a única coisa que
       * diz de quem é o documento — um currículo que chega sem nome e sem
       * contato é papel em branco com texto.
       */}
      <header className="hidden print:block">
        <h1 className="text-2xl font-semibold">{profile.name}</h1>
        <p className="mt-1 text-sm">{profile.headline[LOCALE]}</p>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px]">
          <li>{profile.location}</li>
          <li>{profile.email}</li>
          <li>{profile.phone}</li>
          {profile.links
            .filter((l) => l.href !== PENDING && l.id !== "email" && l.id !== "whatsapp")
            .map((l) => (
              <li key={l.id}>{l.display ?? l.href}</li>
            ))}
        </ul>
      </header>

      <p
        data-reveal
        className="reveal mt-10 leading-relaxed text-foreground/85 print:mt-6"
      >
        {summary[LOCALE]}
      </p>

      <h3 className="mt-16 font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase">
        Experiência
      </h3>
      <ol className="mt-6 border-t border-border">
        {experience.map((entry) => (
          <li
            key={`${entry.organization}-${entry.startDate}`}
            data-reveal
            className="reveal border-b border-border py-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h4 className="text-lg font-medium">{entry.role[LOCALE]}</h4>
              <span className="font-mono text-[0.65rem] tracking-[0.25em] text-muted-foreground uppercase">
                {formatRange(entry.startDate, entry.endDate, LOCALE, "Atual")}
              </span>
            </div>

            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {entry.organization}
              {entry.location && ` · ${entry.location}`}
            </p>

            <ul className="mt-4 space-y-2">
              {entry.bullets[LOCALE].map((bullet) => (
                <li
                  key={bullet}
                  className="relative pl-5 text-sm leading-relaxed text-foreground/85 before:absolute before:left-0 before:text-muted-foreground before:content-['—']"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <h3 className="mt-16 font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase">
        Formação
      </h3>
      <ul className="mt-6 border-t border-border">
        {education.map((entry) => (
          <li
            key={entry.institution}
            data-reveal
            className="reveal flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border py-6"
          >
            <span>
              <span className="font-medium">{entry.degree[LOCALE]}</span>
              <span className="mt-1 block font-mono text-xs text-muted-foreground">
                {entry.institution}
              </span>
            </span>
            <span className="font-mono text-[0.65rem] tracking-[0.25em] text-muted-foreground uppercase">
              {formatMonth(entry.startDate, LOCALE)} —{" "}
              {formatMonth(entry.endDate, LOCALE)}
            </span>
          </li>
        ))}
      </ul>

      <h3 className="mt-16 font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase">
        Cursos e estudos
      </h3>
      <ul className="mt-6 border-t border-border">
        {courses.map((course) => (
          <li
            key={course.name[LOCALE]}
            data-reveal
            className="reveal flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border py-6"
          >
            <span>
              <span className="font-medium">{course.name[LOCALE]}</span>
              <span className="mt-1 block font-mono text-xs text-muted-foreground">
                {course.provider[LOCALE]}
              </span>
            </span>
            <span className="max-w-xs text-right font-mono text-xs text-muted-foreground">
              {course.detail[LOCALE]}
            </span>
          </li>
        ))}
      </ul>

      <h3 className="mt-16 font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase">
        Idiomas
      </h3>
      <ul className="mt-6 border-t border-border">
        {languages.map((language) => (
          <li
            key={language.name[LOCALE]}
            data-reveal
            className="reveal flex flex-wrap items-baseline gap-x-4 border-b border-border py-5 text-sm"
          >
            <span className="font-medium">{language.name[LOCALE]}</span>
            <span className="text-muted-foreground">{language.level[LOCALE]}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
