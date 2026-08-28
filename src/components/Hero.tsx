import { useRef, useState } from "react";

import { profile } from "@/content/profile";
import { ui } from "@/content/ui";
import { useLocale } from "@/lib/locale";
import { WalkingSpider } from "./WalkingSpider";
import faceAsset from "@/assets/bryan-face.webp";
import maskAsset from "@/assets/spider-mask.webp";

/**
 * Hero: retrato com a teia girando em volta, nome, headline e o sinal de
 * disponibilidade.
 *
 * Os três números respondem antes da pergunta que o recrutador faz nos
 * primeiros segundos ("esse cara já entregou alguma coisa?"), e todos foram
 * conferidos no código dos projetos, não escritos de memória.
 *
 * O retrato troca pela máscara ao passar o mouse. O efeito existia desde o
 * esboço do Lovable e quase ninguém o encontrava: nada na tela dizia que
 * aquela imagem respondia. Agora há uma linha embaixo dela — interação que
 * ninguém descobre é código que não faz nada.
 */
const STATS = [
  { value: "2", label: ui.hero.stats.produtos },
  { value: "4", label: ui.hero.stats.idiomas },
  { value: "95", label: ui.hero.stats.pagespeed },
] as const;

export function Hero() {
  const { t } = useLocale();
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const portraitRef = useRef<HTMLDivElement>(null);

  const onPointerMove = (e: React.PointerEvent) => {
    const el = portraitRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTilt({
      x: ((e.clientY - r.top) / r.height - 0.5) * -14,
      y: ((e.clientX - r.left) / r.width - 0.5) * 14,
    });
  };

  return (
    <section
      id="topo"
      className="relative flex min-h-[82vh] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center"
    >
      {/*
       * O território das aranhas: a caixa desta seção, e nada além dela.
       *
       * Ficam como PRIMEIRO filho e sem z-index, então tudo que vem depois —
       * retrato, nome, headline — é pintado por cima. É o que as mantém no
       * fundo em vez de por cima do texto. O `overflow-hidden` da seção apara
       * qualquer perna que passe da borda.
       *
       * São duas, com números diferentes de propósito: duas iguais no mesmo
       * ritmo leem como uma animação repetida; uma maior e mais lenta ao lado
       * de uma menor e mais rápida lê como dois bichos.
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <WalkingSpider tamanho={24} velocidade={40} />
        <WalkingSpider tamanho={17} velocidade={58} />
      </div>

      {/*
       * Todo o conteúdo num invólucro com z-10.
       *
       * A camada das aranhas é `absolute`, e o CSS pinta elemento posicionado
       * ACIMA de irmão em fluxo normal, não importa a ordem no HTML. Sem esta
       * camada explícita por cima, as aranhas andariam sobre o seu nome em vez
       * de atrás dele.
       */}
      <div className="relative z-10 flex w-full flex-col items-center">
        <p data-reveal className="reveal label text-muted-foreground">
          {t(ui.hero.eyebrow)}
        </p>

        <div
          ref={portraitRef}
          onPointerMove={onPointerMove}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => {
            setHover(false);
            setTilt({ x: 0, y: 0 });
          }}
          /*
           * Toque também alterna. Em celular não existe hover, e é de celular
           * que vem a maior parte das visitas — sem isto o efeito não existiria
           * para quase ninguém.
           */
          onClick={() => setHover((v) => !v)}
          className={`portrait-ring group relative mt-8 h-64 w-64 md:h-80 md:w-80 ${hover ? "mask-glow" : ""}`}
          style={{
            transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-full bg-background">
            <img
              src={faceAsset}
              alt={`${profile.name}`}
              className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 ${
                hover ? "scale-95 opacity-0 blur-sm" : "scale-100 opacity-100"
              }`}
            />
            <img
              src={maskAsset}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full object-cover object-center brightness-[1.15] contrast-110 transition-all duration-500 ${
                hover
                  ? "scale-[1.45] opacity-100"
                  : "scale-[1.6] opacity-0 blur-sm"
              }`}
            />
          </div>
        </div>

        <p
          aria-hidden="true"
          className={`label-sm mt-4 transition-colors duration-300 ${
            hover ? "text-web-strong" : "text-muted-foreground/70"
          }`}
        >
          {t(ui.hero.portraitHint)}
        </p>

        <h1
          data-reveal
          className="reveal mt-8 text-5xl font-semibold tracking-tight md:text-7xl"
        >
          {profile.shortName}
        </h1>

        <p
          data-reveal
          className="reveal mt-5 max-w-xl text-base leading-relaxed text-foreground/90 md:text-lg"
        >
          {t(profile.headline)}
        </p>

        <p data-reveal className="reveal label-sm mt-4 text-muted-foreground">
          {profile.location}
        </p>

        <div
          data-reveal
          className="reveal label-sm mt-10 flex items-center gap-3 text-foreground/90"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-web opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-web" />
          </span>
          {t(ui.hero.available)}
        </div>

        <dl
          data-reveal
          className="reveal mt-14 flex flex-wrap justify-center divide-x divide-border border-y border-border"
        >
          {STATS.map((stat) => (
            <div key={stat.value} className="min-w-[8.5rem] px-7 py-5 sm:px-10">
              <dt className="sr-only">{t(stat.label)}</dt>
              <dd>
                <span className="block text-3xl font-semibold text-web-strong md:text-4xl">
                  {stat.value}
                </span>
                <span className="label-sm mt-2 block text-muted-foreground">
                  {t(stat.label)}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
