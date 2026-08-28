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
/*
 * Os três números que respondem, antes da pergunta, o que o recrutador quer
 * saber nos primeiros segundos: essa pessoa entrega? com que cuidado?
 *
 * "4 idiomas publicados" ficou aqui até 28/08 e saiu por AMBIGUIDADE, não por
 * ser falso. Colado em "2 produtos no ar", ele se lia como atributo pessoal —
 * "fala 4 idiomas" — e o currículo, três telas abaixo, diz português nativo e
 * inglês intermediário. O número existia para gerar confiança e gastava
 * confiança. A informação continua no site, com contexto, dentro do case da
 * NYO, onde ninguém confunde.
 *
 * Os 112 testes foram contados nos repositórios em 28/08/2026: 74 casos na
 * Meteoros (67 unitários + 7 de ponta a ponta) e 38 neste portfólio, que
 * rodam em dois formatos e dão 76 execuções. A NYO não tem testes, e por isso
 * não entra na conta.
 *
 * Ao mexer nestes números: conferir de novo, não estimar. É o primeiro lugar
 * onde alguém percebe que um portfólio arredonda para cima.
 */
const STATS = [
  { value: "2", label: ui.hero.stats.produtos },
  { value: "112", label: ui.hero.stats.testes },
  { value: "95", label: ui.hero.stats.pagespeed },
] as const;

export function Hero() {
  const { t } = useLocale();
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const portraitRef = useRef<HTMLButtonElement>(null);
  /* Qual ponteiro encostou por último: separa dedo de mouse no clique. */
  const ultimoPonteiro = useRef<string>("mouse");

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

        <button
          type="button"
          ref={portraitRef}
          aria-pressed={hover}
          aria-label={t(ui.hero.portraitToggle)}
          /*
           * Os três eventos abaixo valem SÓ para o mouse.
           *
           * O navegador dispara eventos de ponteiro de mouse também no toque,
           * por compatibilidade com sites antigos. Um toque virava
           * `pointerenter` (liga a máscara) seguido de `click` (alterna de
           * volta): piscava e não mudava nada.
           */
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const el = portraitRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            setTilt({
              x: ((e.clientY - r.top) / r.height - 0.5) * -14,
              y: ((e.clientX - r.left) / r.width - 0.5) * 14,
            });
          }}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") setHover(true);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType !== "mouse") return;
            setHover(false);
            setTilt({ x: 0, y: 0 });
          }}
          onPointerDown={(e) => {
            ultimoPonteiro.current = e.pointerType;
          }}
          /*
           * O clique alterna e FICA — o "toca e muda, toca de novo e muda"
           * que se espera no celular. Com mouse ele não faz nada, senão
           * desfaria no primeiro clique o que a passagem acabou de fazer.
           *
           * O tipo vem do PRÓPRIO evento, não do último ponteiro guardado. É
           * o que faz o teclado funcionar: o clique sintético do Enter tem
           * `pointerType` vazio, enquanto o ref ainda diria "mouse" — nenhum
           * ponteiro encostou. O ref fica como reserva para navegador que não
           * entrega `pointerType` no clique.
           */
          onClick={(e) => {
            const tipo =
              "pointerType" in e.nativeEvent
                ? (e.nativeEvent as PointerEvent).pointerType
                : ultimoPonteiro.current;
            if (tipo !== "mouse") setHover((v) => !v);
          }}
          className={`portrait-ring sem-toque-longo group relative mt-8 h-[clamp(13rem,24vw,22rem)] w-[clamp(13rem,24vw,22rem)] ${hover ? "mask-glow" : ""}`}
          style={{
            transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-full bg-background">
            <img
              src={faceAsset}
              alt=""
              draggable={false}
              className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 ${
                hover ? "scale-95 opacity-0 blur-sm" : "scale-100 opacity-100"
              }`}
            />
            <img
              src={maskAsset}
              alt=""
              aria-hidden="true"
              draggable={false}
              className={`absolute inset-0 h-full w-full object-cover object-center brightness-[1.15] contrast-110 transition-all duration-500 ${
                hover ? "scale-[1.45] opacity-100" : "scale-[1.6] opacity-0 blur-sm"
              }`}
            />
          </div>
        </button>

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
          className="titulo-hero reveal mt-8 font-semibold tracking-tight"
        >
          {profile.shortName}
        </h1>

        <p
          data-reveal
          className="corpo-destaque reveal mt-5 max-w-2xl text-foreground/90"
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
                <span className="block text-[clamp(1.9rem,2.2vw,3rem)] font-semibold text-web-strong">
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
