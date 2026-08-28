import { profile, PENDING } from "@/content/profile";
import { summary } from "@/content/resume";
import { ui } from "@/content/ui";
import { useLocale } from "@/lib/locale";
import { Section } from "./Section";

/**
 * Sobre reaproveita o resumo do currículo em vez de manter uma bio própria.
 *
 * Duas biografias sobre a mesma pessoa divergem na primeira atualização — e a
 * que ninguém lembra de atualizar é justamente a que o recrutador lê.
 */
export function About() {
  const { t } = useLocale();

  return (
    <Section id="sobre" label={t(ui.nav.sobre)}>
      <p
        data-reveal
        className="reveal mt-8 text-xl leading-relaxed text-foreground/95 md:text-2xl"
      >
        {t(summary)}
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
 * Link ainda pendente não é renderizado. Item que leva a lugar nenhum custa
 * mais confiança do que a ausência dele.
 */
export function Contact() {
  const { t } = useLocale();
  const links = profile.links.filter(
    (link) => link.href !== PENDING && link.id !== "email"
  );

  return (
    <Section
      id="contato"
      label={t(ui.nav.contato)}
      className="mx-auto max-w-3xl scroll-mt-24 px-6 py-24 md:py-32"
    >
      <p data-reveal className="reveal mt-8 text-base text-foreground/90 md:text-lg">
        {t(ui.contact.intro)}
      </p>

      <a
        data-reveal
        href={`mailto:${profile.email}`}
        className="reveal link-web mt-6 inline-block text-2xl font-medium break-all md:text-4xl"
      >
        {profile.email}
      </a>

      <div data-reveal className="reveal mt-12 flex flex-wrap items-center gap-8">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="label-sm link-web text-muted-foreground"
          >
            {link.label} ↗
          </a>
        ))}
      </div>
    </Section>
  );
}
