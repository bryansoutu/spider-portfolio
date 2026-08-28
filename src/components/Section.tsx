/**
 * Casca de seção: um rótulo mono espaçado e o conteúdo embaixo.
 *
 * O rótulo continua sendo o único elemento de hierarquia do site — não existe
 * título grande em seção nenhuma além do nome no hero. É o que mantém a página
 * quieta: o olho desce pelo conteúdo, não por uma sequência de manchetes.
 *
 * O que mudou foi o peso dele. Era cinza sobre preto a 10px, e cinco seções
 * seguidas de rótulo cinza não marcam divisão nenhuma — a página parecia um
 * documento contínuo. Agora leva um traço vermelho na frente e corpo de 16px
 * (18px em tela larga): a mesma discrição, mas com um ponto onde o olho engata
 * ao rolar.
 *
 * Um tamanho só para todas as seções, e não dois. Rótulo maior em umas e menor
 * em outras cria uma hierarquia que não existe — "O que eu faço" não é mais
 * importante que "Projetos", e sugerir isso com tipografia confunde o
 * caminho de leitura.
 */
export function Section({
  id,
  label,
  children,
  className = "mx-auto w-full max-w-3xl scroll-mt-24 px-6 py-16 sm:py-24 md:py-32 xl:max-w-4xl xl:px-8",
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-label`} className={`scroll-mt-24 ${className}`}>
      <h2 id={`${id}-label`} data-reveal className="reveal flex items-center gap-3">
        <span aria-hidden="true" className="h-px w-12 bg-web print:hidden" />
        <span className="rotulo-secao text-web-strong">{label}</span>
      </h2>
      {children}
    </section>
  );
}
