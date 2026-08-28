import { useCallback, useEffect, useState } from "react";

import { Loader } from "@/components/Loader";
import { WebBackground } from "@/components/WebBackground";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { Capabilities, Skills } from "@/components/Skills";
import { Resume } from "@/components/Resume";
import { About, Contact } from "@/components/Contact";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { skills } from "@/content/skills";
import { profile } from "@/content/profile";
import { ui } from "@/content/ui";
import { LocaleProvider, useLocale } from "@/lib/locale";

/**
 * A página. Estrutura, classes e efeitos vêm do esboço gerado no Lovable; o
 * conteúdo é o real, tipado em `src/content/`.
 *
 * Ordem das seções, e a razão de cada posição:
 *
 *  1. Hero       — quem é, o que faz, e três números como evidência
 *  2. Sobre      — a pessoa, em uma frase longa
 *  3. Projetos   — a prova
 *  4. O que faço — o que ele assume sozinho numa equipe
 *  5. Habilidades— o detalhe técnico, para quem chegou até aqui
 *  6. Currículo  — o documento, imprimível
 *  7. Contato    — o próximo passo
 */
const NAV = [
  "topo",
  "sobre",
  "projetos",
  "habilidades",
  "curriculo",
  "contato",
] as const;

/**
 * Marca no menu a seção em que a pessoa está.
 *
 * Numa página só, com sete seções e uma rolagem longa, o menu sem estado é
 * decoração: ele diz para onde dá para ir e nunca onde você está. O observador
 * usa uma faixa estreita no meio da tela (`-45% 0px`) em vez do elemento
 * inteiro — com a seção inteira valendo, duas ficam visíveis ao mesmo tempo na
 * maior parte da rolagem e o item ativo pisca entre elas.
 */
function useSecaoAtiva(ids: readonly string[]): string | null {
  const [ativa, setAtiva] = useState<string | null>(null);

  useEffect(() => {
    const alvos = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setAtiva(e.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    alvos.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return ativa;
}

/**
 * Verdadeiro assim que a página sai do topo. É o que encolhe o cabeçalho.
 *
 * São DOIS limiares, e não um — é a correção de um defeito real. Com um
 * limiar só, o cabeçalho encolhia acima de 40px e crescia abaixo de 40px, e
 * encolher tira 44px de altura do topo da página. Perto da fronteira isso
 * vira uma gangorra: cresce, o conteúdo desce, a posição volta a ficar abaixo
 * do limiar, encolhe de novo — várias vezes por segundo, cada volta animando
 * 300ms. Era o cabeçalho "aumentando e diminuindo bem rápido".
 *
 * Com histerese não há fronteira única: ele só encolhe passando de 96px e só
 * volta a crescer abaixo de 24px. Os 72px de folga entre os dois são maiores
 * que os 44px que a própria mudança desloca, então o efeito nunca consegue
 * desfazer a própria causa.
 */
const ENCOLHE_ACIMA_DE = 96;
const CRESCE_ABAIXO_DE = 24;

function useRolou(): boolean {
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const conferir = () => {
      const y = window.scrollY;
      setRolou((antes) => {
        if (!antes && y > ENCOLHE_ACIMA_DE) return true;
        if (antes && y < CRESCE_ABAIXO_DE) return false;
        return antes;
      });
    };
    conferir();
    window.addEventListener("scroll", conferir, { passive: true });
    return () => window.removeEventListener("scroll", conferir);
  }, []);

  return rolou;
}

/** A linha vermelha no topo, que anda com a rolagem. */
function ProgressoDeLeitura() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const atualizar = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    atualizar();
    window.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    return () => {
      window.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-40 h-[2px] bg-web transition-[width] duration-150 print:hidden"
      style={{ width: `${pct}%` }}
    />
  );
}

function Pagina() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const ativa = useSecaoAtiva(NAV);
  const rolou = useRolou();

  /*
   * Estável de propósito. Esta página re-renderiza a cada rolagem (menu ativo
   * e tamanho do cabeçalho moram aqui), e um callback recriado a cada vez
   * reiniciava o relógio da cortina de abertura.
   */
  const encerrarAbertura = useCallback(() => setLoading(false), []);

  /*
   * O menu do celular. Ele fecha sozinho quando a janela passa de 640px —
   * senão, girar o aparelho deixa o painel aberto por cima de uma barra que
   * já mostra os seis itens em linha, com o menu duplicado na tela.
   */
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const fechar = () => mq.matches && setMenuAberto(false);
    mq.addEventListener("change", fechar);
    return () => mq.removeEventListener("change", fechar);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        }
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));

    /*
     * Prazo de segurança. Se o observador nunca disparar — o Chrome o congela
     * em aba de segundo plano, e é o que acontece quando alguém abre o link
     * em nova aba e só volta nele depois — o que já está na tela aparece
     * assim mesmo.
     *
     * Só o que está VISÍVEL, e não tudo: revelar a página inteira de uma vez
     * mataria a animação das seções de baixo, que é o efeito inteiro.
     */
    const failsafe = window.setTimeout(() => {
      els.forEach((el) => {
        const { top, bottom } = el.getBoundingClientRect();
        if (top < window.innerHeight && bottom > 0) {
          el.classList.add("is-visible");
        }
      });
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [loading]);

  /*
   * A faixa lista só o que está declarado como sólido em content/skills.ts.
   * O esboço do Lovable trazia WebGL, Canvas e Figma escritos à mão — a faixa
   * é o lugar mais fácil de inflar um currículo, porque ninguém lê item por
   * item. Gerar do dado tipado fecha essa porta.
   */
  const marquee = skills.filter((s) => s.level === "solido");

  /*
   * `overflow-x-clip` na raiz, e não `hidden`.
   *
   * Os dois cortam o que vaza na horizontal, mas `hidden` transforma o
   * elemento em CONTÊINER DE ROLAGEM — e `position: sticky` gruda no contêiner
   * de rolagem mais próximo, não na janela. Como esta div tem a altura da
   * página inteira e não rola por dentro, o cabeçalho grudava num lugar que
   * sai da tela junto com o resto: subia 1200px e desaparecia, exatamente
   * como se não fosse sticky.
   *
   * `clip` corta igual sem criar contêiner de rolagem. É o motivo de o menu
   * acompanhar a página.
   */
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      {loading && <Loader onDone={encerrarAbertura} />}
      <WebBackground />
      <ProgressoDeLeitura />

      {/*
       * O cabeçalho tem dois tamanhos, e a rolagem decide qual.
       *
       * No topo ele é grande: a assinatura "BS" tem peso de marca e o menu
       * respira. Assim que a página desce, tudo encolhe e a barra vira uma
       * faixa fina — ela precisa continuar ali (é a única navegação de uma
       * página de seis mil pixels), mas não pode comer a tela para isso.
       *
       * A transição está em cada peça, e não num `height` no pai: animar
       * altura obriga o navegador a recalcular o layout da página inteira a
       * cada quadro, e é justamente durante a rolagem que ele menos tem sobra.
       *
       * NO CELULAR os seis itens não cabem: a faixa rolável cortava
       * "HABILIDADES" no meio da palavra, o que se lê como layout quebrado e
       * não como "arraste para o lado". Abaixo de 640px eles vão para um menu
       * que abre — que também é o único jeito de o item ativo ser visível sem
       * a pessoa ter de arrastar até ele.
       */}
      <header
        className={`sticky top-0 z-30 flex flex-col bg-background/80 backdrop-blur-md transition-all duration-300 print:hidden ${
          rolou || menuAberto
            ? "border-b border-border"
            : "border-b border-transparent"
        }`}
      >
        <div
          className={`flex items-center justify-between gap-4 px-5 transition-all duration-300 md:px-12 ${
            rolou ? "py-2.5" : "py-4 md:py-6"
          }`}
        >
          <a
            href="#topo"
            aria-label={t(ui.a11y.toTop)}
            className={`shrink-0 font-semibold tracking-[0.12em] text-web-strong transition-all duration-300 hover:opacity-80 ${
              rolou ? "text-xl md:text-2xl" : "text-2xl md:text-4xl"
            }`}
          >
            BS
          </a>

          <nav
            aria-label={t(ui.a11y.mainNav)}
            className={`hidden min-w-0 flex-1 justify-end transition-all duration-300 sm:flex ${
              rolou ? "gap-x-4 lg:gap-x-6" : "gap-x-5 lg:gap-x-8"
            }`}
          >
            {NAV.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={ativa === id ? "true" : undefined}
                className={`link-web shrink-0 font-mono uppercase transition-all duration-300 ${
                  rolou
                    ? "text-[0.68rem] tracking-[0.12em]"
                    : "text-[0.78rem] tracking-[0.16em]"
                } ${ativa === id ? "text-web-strong" : "text-muted-foreground"}`}
              >
                {t(ui.nav[id])}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <LocaleSwitch />

            <button
              type="button"
              aria-expanded={menuAberto}
              aria-controls="menu-celular"
              aria-label={menuAberto ? t(ui.a11y.closeMenu) : t(ui.a11y.menu)}
              onClick={() => setMenuAberto((v) => !v)}
              className="label-sm flex items-center gap-2 border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:border-web hover:text-web-strong sm:hidden"
            >
              {t(ui.a11y.menu)}
              {/* Duas barras que viram um X. */}
              <span aria-hidden="true" className="relative block h-3 w-3.5">
                <span
                  className={`absolute left-0 block h-px w-full bg-current transition-all duration-300 ${
                    menuAberto ? "top-1.5 rotate-45" : "top-0.5"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-px w-full bg-current transition-all duration-300 ${
                    menuAberto ? "top-1.5 -rotate-45" : "top-2.5"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {menuAberto && (
          <nav
            id="menu-celular"
            aria-label={t(ui.a11y.mainNav)}
            className="disclosure-body border-t border-border px-5 pb-4 sm:hidden"
          >
            <ul className="flex flex-col">
              {NAV.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={ativa === id ? "true" : undefined}
                    onClick={() => setMenuAberto(false)}
                    className={`label block border-b border-border/60 py-3.5 transition-colors ${
                      ativa === id ? "text-web-strong" : "text-muted-foreground"
                    }`}
                  >
                    {t(ui.nav[id])}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main className="relative z-10">
        <Hero />

        {/* Faixa de tecnologias — duplicada para o laço não ter emenda. */}
        <div
          aria-hidden="true"
          className="relative z-10 overflow-hidden border-y border-border py-4 print:hidden"
        >
          <div className="marquee flex w-max whitespace-nowrap">
            {[...marquee, ...marquee].map((skill, i) => (
              <span key={i} className="label-sm mx-6 text-muted-foreground">
                {skill.name}
                <span className="ml-12 text-web/60">✦</span>
              </span>
            ))}
          </div>
        </div>

        <About />
        <Projects />
        <Capabilities />
        <Skills />
        <Resume />
        <Contact />
      </main>

      <footer className="label-sm relative z-10 border-t border-border px-6 py-8 text-center text-muted-foreground print:hidden">
        © {new Date().getFullYear()} {profile.name}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <Pagina />
    </LocaleProvider>
  );
}
