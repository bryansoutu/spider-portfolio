import { useEffect, useState } from "react";

import { Loader } from "@/components/Loader";
import { WebBackground } from "@/components/WebBackground";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { Capabilities, Skills } from "@/components/Skills";
import { Resume } from "@/components/Resume";
import { About, Contact } from "@/components/Contact";
import { skills } from "@/content/skills";
import { profile } from "@/content/profile";

/**
 * A página. Estrutura, classes e efeitos são os do esboço gerado no Lovable;
 * o conteúdo é o real, tipado em `src/content/`.
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
  { id: "sobre", label: "Sobre" },
  { id: "projetos", label: "Projetos" },
  { id: "habilidades", label: "Habilidades" },
  { id: "curriculo", label: "Currículo" },
  { id: "contato", label: "Contato" },
] as const;

export default function App() {
  const [loading, setLoading] = useState(true);

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
     * Prazo de segurança. Se o observer nunca disparar — o Chrome o congela
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

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {loading && <Loader onDone={() => setLoading(false)} />}
      <WebBackground />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 print:hidden">
        <a href="#" className="font-mono text-xs tracking-[0.35em] uppercase">
          BS
        </a>
        <nav
          aria-label="Navegação principal"
          className="flex flex-wrap justify-end gap-x-6 gap-y-2 font-mono text-xs tracking-[0.2em] uppercase"
        >
          {NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="link-web">
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="relative z-10">
        <Hero />

        {/* Faixa de tecnologias — duplicada para o laço não ter emenda. */}
        <div
          aria-hidden="true"
          className="relative z-10 overflow-hidden border-y border-border py-5 print:hidden"
        >
          <div className="marquee flex w-max whitespace-nowrap">
            {[...marquee, ...marquee].map((skill, i) => (
              <span
                key={i}
                className="mx-6 font-mono text-sm tracking-[0.2em] text-muted-foreground uppercase"
              >
                {skill.name}
                <span className="ml-12 text-border">✦</span>
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

      <footer className="relative z-10 border-t border-border px-6 py-8 text-center font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase print:hidden">
        © {new Date().getFullYear()} {profile.name}
      </footer>
    </div>
  );
}
