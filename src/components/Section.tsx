/**
 * Casca de seção no padrão do Lovable: um rótulo mono minúsculo e muito
 * espaçado, e o conteúdo embaixo.
 *
 * O rótulo é o único elemento de hierarquia do site — não existe título
 * grande em seção nenhuma além do nome no hero. É o que mantém a página
 * quieta: o olho desce pelo conteúdo, não por uma sequência de manchetes.
 */
export function Section({
  id,
  label,
  children,
  className = "mx-auto max-w-3xl px-6 py-28",
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-label`} className={className}>
      <h2
        id={`${id}-label`}
        data-reveal
        className="reveal font-mono text-xs tracking-[0.4em] text-muted-foreground uppercase"
      >
        {label}
      </h2>
      {children}
    </section>
  );
}
