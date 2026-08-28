import { useEffect, useRef } from "react";

/**
 * Uma aranha branca que anda pelo fundo da primeira tela.
 *
 * A versão anterior era `position: fixed`: ela andava sobre a JANELA, então
 * acompanhava a rolagem como um cursor e precisava de um `opacity: 0` para
 * sumir ao sair da home. Duas coisas erradas nisso — ela pertencia à tela e
 * não à página, e desaparecia no ar, sem ir a lugar nenhum.
 *
 * Agora é `position: absolute` dentro do próprio hero. O território dela é a
 * caixa da home, não o vidro do monitor: ao rolar, ela sai de cena pelo topo
 * junto com o resto da seção, como qualquer outro elemento. Não some — fica
 * para trás.
 *
 * O que se mantém:
 *
 *   1. `pointer-events: none`. Ela nunca rouba um clique.
 *   2. A posição é escrita direto no `style` do nó por `requestAnimationFrame`,
 *      sem estado do React. Um `setState` a 60fps re-renderizaria a página
 *      inteira sessenta vezes por segundo para mover vinte pixels.
 *   3. Some sob `prefers-reduced-motion`. Bicho andando na tela é exatamente
 *      o tipo de movimento que essa preferência existe para desligar.
 *
 * O andar é feito de trechos: escolhe um ponto, caminha até ele, para alguns
 * segundos, escolhe outro. Movimento contínuo e uniforme lê como ícone
 * deslizando; a pausa é o que lê como bicho.
 */

const PAUSA_MIN = 1400;
const PAUSA_MAX = 4200;
/** Folga para ela não encostar nas bordas da seção. */
const MARGEM = 40;

export function WalkingSpider({
  tamanho = 22,
  /** Pixels por segundo. Aranha correndo vira praga; devagar vira detalhe. */
  velocidade = 42,
}: {
  tamanho?: number;
  velocidade?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  /*
   * Posição e destino moram em refs, e não em variáveis do efeito.
   *
   * O laço é pausado quando a home sai da tela — não adianta gastar quadro
   * animando o que ninguém vê. Se o estado vivesse dentro do efeito, cada
   * pausa o reiniciaria, e a aranha reapareceria teleportada em outro canto
   * toda vez que a pessoa voltasse ao topo.
   */
  const pos = useRef<{ x: number; y: number } | null>(null);
  const alvo = useRef<{ x: number; y: number } | null>(null);
  const angulo = useRef(0);
  const paradaAte = useRef(0);

  useEffect(() => {
    const el = ref.current;
    const area = el?.parentElement;
    if (!el || !area) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let ultimo = performance.now();
    let rodando = false;

    const sortear = () => {
      const { width, height } = area.getBoundingClientRect();
      return {
        x: MARGEM + Math.random() * Math.max(1, width - MARGEM * 2),
        y: MARGEM + Math.random() * Math.max(1, height - MARGEM * 2),
      };
    };

    if (!pos.current) pos.current = sortear();
    if (!alvo.current) alvo.current = sortear();

    const passo = (agora: number) => {
      const dt = Math.min((agora - ultimo) / 1000, 0.05);
      ultimo = agora;

      const p = pos.current!;
      const a = alvo.current!;

      if (agora >= paradaAte.current) {
        const dx = a.x - p.x;
        const dy = a.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 3) {
          // Chegou: descansa e escolhe outro canto da seção.
          paradaAte.current =
            agora + PAUSA_MIN + Math.random() * (PAUSA_MAX - PAUSA_MIN);
          alvo.current = sortear();
        } else {
          const avanco = Math.min(velocidade * dt, dist);
          p.x += (dx / dist) * avanco;
          p.y += (dy / dist) * avanco;

          /*
           * O corpo aponta para onde ela vai. O SVG é desenhado olhando para
           * CIMA, daí o +90: `atan2` mede a partir do eixo x, e sem a correção
           * a aranha andaria de lado a viagem inteira.
           */
          const alvoAngulo = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

          /*
           * A curva é suavizada pelo caminho mais curto do círculo. Sem
           * normalizar a diferença para [-180, 180], a virada de 179° para
           * -179° faz o bicho rodopiar 358 graus no lugar.
           */
          const delta = ((alvoAngulo - angulo.current + 540) % 360) - 180;
          angulo.current += delta * Math.min(1, dt * 6);
        }
      }

      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${angulo.current}deg)`;
      el.dataset.andando = String(agora >= paradaAte.current);

      raf = requestAnimationFrame(passo);
    };

    const ligar = () => {
      if (rodando) return;
      rodando = true;
      ultimo = performance.now();
      raf = requestAnimationFrame(passo);
    };
    const desligar = () => {
      rodando = false;
      cancelAnimationFrame(raf);
    };

    /*
     * O laço só roda enquanto a home está em cena. Fora dela a aranha não é
     * escondida — ela simplesmente já não está na parte visível da página, e
     * animar o que está fora da tela é gastar bateria à toa.
     */
    const io = new IntersectionObserver(
      ([entrada]) => (entrada?.isIntersecting ? ligar() : desligar()),
      { threshold: 0 }
    );
    io.observe(area);

    /*
     * Se a seção encolher (giro do celular, janela redimensionada), o destino
     * pode cair fora dela e a aranha sairia andando para o vazio.
     */
    const ro = new ResizeObserver(() => {
      const { width, height } = area.getBoundingClientRect();
      const p = pos.current!;
      p.x = Math.min(p.x, Math.max(MARGEM, width - MARGEM));
      p.y = Math.min(p.y, Math.max(MARGEM, height - MARGEM));
      alvo.current = sortear();
    });
    ro.observe(area);

    return () => {
      desligar();
      io.disconnect();
      ro.disconnect();
    };
  }, [velocidade]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="spider pointer-events-none absolute top-0 left-0 print:hidden"
      style={{ willChange: "transform" }}
    >
      <svg
        width={tamanho}
        height={tamanho}
        viewBox="-24 -24 48 48"
        fill="none"
        stroke="white"
        strokeWidth="1.7"
        strokeLinecap="round"
        className="-translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_5px_rgba(255,255,255,0.45)]"
      >
        {/* Pernas da esquerda e da direita em fases opostas — é o que faz o
            movimento parecer caminhada e não deslize. */}
        <g className="spider-legs-l">
          <path d="M-4 -3 L-13 -12 L-18 -16" />
          <path d="M-5 -1 L-16 -4 L-21 -6" />
          <path d="M-5 2 L-16 5 L-20 9" />
          <path d="M-4 4 L-12 11 L-15 16" />
        </g>
        <g className="spider-legs-r">
          <path d="M4 -3 L13 -12 L18 -16" />
          <path d="M5 -1 L16 -4 L21 -6" />
          <path d="M5 2 L16 5 L20 9" />
          <path d="M4 4 L12 11 L15 16" />
        </g>

        {/*
          Abdome e cefalotórax, preenchidos para o bicho ter corpo.

          A listra preta cruza o abdome NA HORIZONTAL, pelo meio. É uma elipse
          achatada por cima da branca, e não um retângulo recortado: sem
          `clipPath` não há `id` no SVG — e `id` num componente que aparece
          duas vezes na página vira id duplicado, que é HTML inválido e faz o
          navegador escolher sozinho a qual dos dois cada referência aponta.
        */}
        <ellipse cx="0" cy="4.5" rx="5.2" ry="7" fill="white" stroke="none" />
        <ellipse cx="0" cy="4.5" rx="5" ry="1.5" fill="black" stroke="none" />
        <circle cx="0" cy="-3.5" r="3.6" fill="white" stroke="none" />
      </svg>
    </div>
  );
}
