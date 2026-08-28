import { profile, PENDING } from "@/content/profile";
import { summary } from "@/content/resume";
import { LOCALE } from "@/lib/locale";
import { Section } from "./Section";

/**
 * Sobre reaproveita o resumo do currículo em vez de manter uma bio própria.
 *
 * Duas biografias sobre a mesma pessoa divergem na primeira atualização — e a
 * que ninguém lembra de atualizar é justamente a que o recrutador lê.
 */
export function About() {
  return (
    <Section id="sobre" label="Sobre">
      <p
        data-reveal
        className="reveal mt-6 text-xl leading-relaxed md:text-2xl"
      >
        {summary[LOCALE]}
      </p>
    </Section>
  );
}

/**
 * Contato — sem formulário, por decisão.
 *
 * Um formulário exigiria backend, antispam e um caminho de falha silenciosa
 * (a mensagem que "foi enviada" e nunca chegou) para entregar menos que um
 * link direto. O recrutador já tem o cliente de e-mail aberto; o melhor que o
 * site faz é sair da frente.
 *
 * Link ainda pendente não é renderizado. Item de menu que leva a lugar nenhum
 * custa mais confiança do que a ausência dele — hoje é o caso do LinkedIn.
 */
export function Contact() {
  const links = profile.links.filter(
    (link) => link.href !== PENDING && link.id !== "email"
  );

  return (
    <Section id="contato" label="Contato" className="mx-auto max-w-3xl px-6 py-28 text-center">
      <a
        data-reveal
        href={`mailto:${profile.email}`}
        className="reveal link-web mt-6 inline-block text-2xl font-medium break-all md:text-4xl"
      >
        {profile.email}
      </a>

      <div
        data-reveal
        className="reveal mt-12 flex flex-wrap items-center justify-center gap-8 font-mono text-[0.65rem] tracking-[0.3em] uppercase"
      >
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="link-web text-muted-foreground hover:text-foreground"
          >
            {link.label}
          </a>
        ))}
      </div>
    </Section>
  );
}
