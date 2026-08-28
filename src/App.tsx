import { useEffect, useState } from "react";

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
      {loading && <Loader onDone={() => setLoading(false)} />}
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
       */}
      <header
        className={`sticky top-0 z-30 flex items-center justify-between gap-4 bg-background/80 px-5 backdrop-blur-md transition-all duration-300 md:px-12 print:hidden ${
          rolou
            ? "border-b border-border py-2.5"
            : "border-b border-transparent py-5 md:py-7"
        }`}
      >
        {/*
         * A assinatura. Some no celular quando a barra encolhe: em 320px, o
         * menu e o seletor de idioma valem mais que um atalho para o topo que
         * já existe como primeiro item do próprio menu.
         */}
        <a
          href="#topo"
          aria-label={t(ui.a11y.toTop)}
          className={`hidden shrink-0 font-semibold tracking-[0.12em] text-web-strong transition-all duration-300 hover:opacity-80 sm:block ${
            rolou ? "text-xl md:text-2xl" : "text-3xl md:text-4xl"
          }`}
        >
          BS
        </a>

        <nav
          aria-label={t(ui.a11y.mainNav)}
          className={`no-scrollbar -mx-1 flex min-w-0 flex-1 overflow-x-auto px-1 transition-all duration-300 sm:justify-end ${
            rolou ? "gap-x-4 sm:gap-x-6" : "gap-x-5 sm:gap-x-8"
          }`}
        >
          {NAV.map((id) => {
            const atual = ativa === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                aria-current={atual ? "true" : undefined}
                className={`link-web shrink-0 font-mono uppercase transition-all duration-300 ${
                  rolou
                    ? "text-[0.68rem] tracking-[0.14em]"
                    : "text-[0.8rem] tracking-[0.18em]"
                } ${atual ? "text-web-strong" : "text-muted-foreground"}`}
              >
                {t(ui.nav[id])}
              </a>
            );
          })}
        </nav>

        <LocaleSwitch />
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
