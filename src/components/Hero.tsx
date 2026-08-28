import { useEffect, useRef, useState } from "react";

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

  /*
   * O aparelho tem mouse de verdade?
   *
   * Esta pergunta substituiu a anterior, que era "de que tipo é este
   * ponteiro?". A troca aconteceu porque a resposta antiga funcionava no
   * emulador e falhava em celular de verdade: `pointerType` no evento de
   * clique vem "touch" em um navegador, "" em outro, e alguns ainda disparam
   * eventos de mouse por compatibilidade depois do toque. Era um guarda que
   * dependia de detalhe de implementação de cada navegador.
   *
   * `(hover: hover) and (pointer: fine)` é a consulta que os navegadores
   * existem para responder, e é a mesma que o CSS usa. Celular responde não;
   * computador com mouse responde sim. A partir daí só há dois caminhos, e
   * nenhum depende de adivinhar o tipo do evento.
   *
   * Fica num estado que escuta mudanças: quem liga um mouse num tablet muda de
   * caminho sem recarregar a página.
   */
  const [temHover, setTemHover] = useState(
    () =>
      typeof window === "undefined" ||
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const ler = () => setTemHover(mq.matches);
    ler();
    mq.addEventListener("change", ler);
    return () => mq.removeEventListener("change", ler);
  }, []);

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
        {/*
         * A maior entra descendo por um fio; a menor já está lá, andando.
         *
         * As duas descendo ao mesmo tempo viraria uma cena — e cena pede que a
         * pessoa pare para assistir, o que é o contrário do que um portfólio
         * quer nos primeiros segundos. Uma desce, a outra já mora ali.
         *
         * O atraso de 1,9s é para ela não descer atrás da cortina de abertura,
         * que sai por volta de 1,5s.
         */}
        <WalkingSpider tamanho={24} velocidade={40} descer atrasoMs={1900} />
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
           * Só quem tem mouse recebe o efeito de passagem e o relevo. Num
           * aparelho de toque estes três nem são registrados — não há o que
           * brigar com o clique.
           */
          onPointerMove={
            temHover
              ? (e) => {
                  const el = portraitRef.current;
                  if (!el) return;
                  const r = el.getBoundingClientRect();
                  setTilt({
                    x: ((e.clientY - r.top) / r.height - 0.5) * -14,
                    y: ((e.clientX - r.left) / r.width - 0.5) * 14,
                  });
                }
              : undefined
          }
          onPointerEnter={temHover ? () => setHover(true) : undefined}
          onPointerLeave={
            temHover
              ? () => {
                  setHover(false);
                  setTilt({ x: 0, y: 0 });
                }
              : undefined
          }
          /*
           * O clique alterna e FICA — o "toca e muda, toca de novo e muda"
           * que se espera no celular.
           *
           * `detail === 0` identifica o clique vindo do TECLADO: o Enter num
           * botão gera um clique sintético, e sintético não tem contagem de
           * cliques. Sem essa condição, quem navega por teclado num
           * computador não conseguiria acionar o retrato, porque o caminho do
           * mouse ignora o clique de propósito.
           */
          onClick={(e) => {
            const doTeclado = e.detail === 0;
            if (!temHover || doTeclado) setHover((v) => !v);
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
                hover ? "scale-[1.02] opacity-0 blur-[2px]" : "scale-100 opacity-100"
              }`}
            />
            {/*
             * A máscara é posicionada para CAIR EM CIMA do rosto, e não só
             * aparecer por cima dele.
             *
             * O esboço do Lovable ampliava a máscara em 1,45× — daí a
             * impressão de que a imagem era grande demais. Não era: as duas
             * fotos têm 768×768 e cabeças de tamanho parecido (≈440px de
             * altura a dele, ≈465px a da máscara). Era só o zoom.
             *
             * Os números abaixo vêm de medir as duas imagens e fazer as linhas
             * dos olhos e a largura da cabeça coincidirem:
             *
             *   scale 1.02   iguala a altura das duas cabeças. Era 0,95 com a
             *                foto anterior; a atual é mais fechada e a cabeça
             *                ficou ~7% maior, então a máscara subiu junto
             *   translate    só vertical: o recorte da foto é simétrico ao
             *                rosto, então não há nada a corrigir na horizontal.
             *                O valor foi calibrado sobrepondo as duas imagens a
             *                50% de opacidade e conferindo se as lentes caem em
             *                cima dos olhos
             *
             * Nada é recortado no arquivo: os dois assets seguem intactos, em
             * resolução cheia. O ajuste é só transformação de CSS, que o
             * navegador aplica na GPU e sem perda.
             */}
            <img
              src={maskAsset}
              alt=""
              aria-hidden="true"
              draggable={false}
              className={`absolute inset-0 h-full w-full origin-center object-cover object-center brightness-[1.08] contrast-105 transition-all duration-500 ${
                hover
                  ? "translate-y-[5%] scale-[1.02] opacity-100"
                  : "translate-y-[5%] scale-[1.14] opacity-0 blur-sm"
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
          {t(temHover ? ui.hero.portraitHint : ui.hero.portraitHintTouch)}
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
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-disponivel opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-disponivel" />
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
