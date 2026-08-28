import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number };
type Ripple = { x: number; y: number; born: number };

/**
 * O fundo.
 *
 * A versão anterior era a malha de pontos ligados que qualquer site de
 * portfólio tem: bonita, genérica, e sem nada a ver com o tema. Num site cujo
 * carregamento se chama "tecendo a teia", o fundo não desenhava teia nenhuma.
 *
 * Agora são três camadas, e a separação existe por custo, não por estética:
 *
 *   1. TEIAS ANCORADAS (estáticas) — presas nos cantos, com raios e espirais
 *      que cedem entre um raio e outro, como teia de verdade. Elas são
 *      desenhadas UMA vez num canvas fora da tela e depois só copiadas.
 *      Redesenhar 3 teias de 13 raios × 9 anéis a 60fps queimaria o celular
 *      para produzir exatamente a mesma imagem.
 *   2. MALHA VIVA — os pontos que se movem e se ligam. É a camada que responde
 *      ao mouse.
 *   3. LUZ DO CURSOR — um halo vermelho fraco sob o ponteiro, que é o que faz
 *      as duas camadas de cima parecerem reagir a quem está ali.
 *
 * O parallax move as teias mais devagar que a página. É o que dá profundidade
 * sem custar um pixel a mais: a camada já está pronta, só muda onde é colada.
 */

/** Distância em que dois pontos ainda se enxergam. */
const LIGACAO = 150;
/** Alcance do cursor sobre a malha. */
const ALCANCE = 230;
const DURACAO_ONDA = 900;

function desenharTeia(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  raio: number,
  anguloInicial: number,
  abertura: number
) {
  const RAIOS = 13;
  const ANEIS = 9;
  const passo = abertura / RAIOS;

  ctx.lineWidth = 0.7;

  // Os raios que saem da âncora.
  ctx.strokeStyle = "rgba(255,255,255,0.13)";
  for (let i = 0; i <= RAIOS; i++) {
    const a = anguloInicial + i * passo;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * raio, cy + Math.sin(a) * raio);
    ctx.stroke();
  }

  /*
   * Os anéis. Cada trecho entre dois raios é uma curva que cede na direção do
   * centro — é essa barriga que diferencia uma teia de um alvo de tiro. O
   * fator 0.86 é o quanto o ponto de controle é puxado para dentro.
   */
  for (let k = 1; k <= ANEIS; k++) {
    const r = raio * Math.pow(k / ANEIS, 1.35);
    ctx.strokeStyle = "rgba(255,255,255," + (0.05 + (k / ANEIS) * 0.07).toFixed(3) + ")";
    ctx.beginPath();
    for (let i = 0; i < RAIOS; i++) {
      const a1 = anguloInicial + i * passo;
      const a2 = a1 + passo;
      const x1 = cx + Math.cos(a1) * r;
      const y1 = cy + Math.sin(a1) * r;
      const x2 = cx + Math.cos(a2) * r;
      const y2 = cy + Math.sin(a2) * r;
      const am = a1 + passo / 2;
      const rc = r * 0.86;
      if (i === 0) ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cx + Math.cos(am) * rc, cy + Math.sin(am) * rc, x2, y2);
    }
    ctx.stroke();
  }

  /*
   * Duas gotas de orvalho por teia, em vermelho. São os únicos pontos de cor
   * do fundo — e existem porque a teia inteira em cinza sumia na visão
   * periférica. Um ponto vermelho não some.
   */
  const gotas: Array<[number, number]> = [
    [3, 6],
    [9, 4],
  ];
  for (const [ia, ik] of gotas) {
    const a = anguloInicial + ia * passo + passo / 2;
    const r = raio * Math.pow(ik / ANEIS, 1.35) * 0.93;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    const brilho = ctx.createRadialGradient(x, y, 0, x, y, 9);
    brilho.addColorStop(0, "rgba(232,62,48,0.55)");
    brilho.addColorStop(1, "rgba(232,62,48,0)");
    ctx.fillStyle = brilho;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function WebBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let scrollY = window.scrollY;
    const mouse = { x: -9999, y: -9999 };
    let nodes: Node[] = [];
    let ondas: Ripple[] = [];

    /* A camada estática mora no seu próprio canvas, fora da tela. */
    const teias = document.createElement("canvas");
    const tctx = teias.getContext("2d");

    const montarTeias = (dpr: number) => {
      if (!tctx) return;
      teias.width = w * dpr;
      teias.height = h * dpr;
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tctx.clearRect(0, 0, w, h);

      const lado = Math.max(w, h);
      // Ancoradas nos cantos, viradas para dentro — teia de quina de parede.
      desenharTeia(tctx, -20, -20, lado * 0.55, 0, Math.PI / 2);
      desenharTeia(tctx, w + 20, h * 0.32, lado * 0.42, Math.PI * 0.62, Math.PI * 0.76);
      if (h > 900) {
        desenharTeia(tctx, w * 0.12, h + 40, lado * 0.38, Math.PI * 1.15, Math.PI * 0.7);
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /*
       * Menos pontos em tela pequena. O laço de ligação é quadrático, e o
       * celular que abre este site é o mesmo que precisa dos 95 de PageSpeed
       * que o hero anuncia logo acima.
       */
      const teto = w < 640 ? 55 : 120;
      const count = Math.min(teto, Math.max(30, Math.round((w * h) / 15000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 0.8 + Math.random() * 1.1,
      }));

      montarTeias(dpr);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    /*
     * Clicar dá um puxão na teia. É o único efeito daqui que responde a uma
     * ação deliberada, e não à passagem do mouse — e é a primeira coisa que
     * alguém tenta ao perceber que o fundo é vivo.
     */
    const onDown = (e: PointerEvent) => {
      ondas.push({ x: e.clientX, y: e.clientY, born: performance.now() });
      if (ondas.length > 4) ondas.shift();
    };

    const draw = () => {
      const agora = performance.now();
      ctx.clearRect(0, 0, w, h);

      /*
       * Parallax: a teia sobe a pouco menos de um terço da velocidade da
       * página, e é colada duas vezes em sequência. Sem a segunda cópia o
       * fundo esvaziaria a partir dos projetos — a página tem sete seções.
       */
      if (tctx && h > 0) {
        const desloc = -((scrollY * 0.28) % h);
        ctx.globalAlpha = 0.85;
        ctx.drawImage(teias, 0, desloc, w, h);
        ctx.drawImage(teias, 0, desloc + h, w, h);
        ctx.globalAlpha = 1;
      }

      // Halo do cursor, por baixo da malha.
      if (mouse.x > -9000) {
        const halo = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, ALCANCE);
        halo.addColorStop(0, "rgba(226,59,48,0.10)");
        halo.addColorStop(1, "rgba(226,59,48,0)");
        ctx.fillStyle = halo;
        ctx.fillRect(mouse.x - ALCANCE, mouse.y - ALCANCE, ALCANCE * 2, ALCANCE * 2);
      }

      for (const n of nodes) {
        if (!semMovimento) {
          n.x += n.vx;
          n.y += n.vy;
        }
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // A onda do clique empurra os pontos para fora ao passar por eles.
        for (const onda of ondas) {
          const t = (agora - onda.born) / DURACAO_ONDA;
          if (t > 1) continue;
          const d = Math.hypot(n.x - onda.x, n.y - onda.y);
          const frente = t * 320;
          if (Math.abs(d - frente) < 40 && d > 1) {
            const forca = (1 - t) * 0.9;
            n.x += ((n.x - onda.x) / d) * forca;
            n.y += ((n.y - onda.y) / d) * forca;
          }
        }
      }
      ondas = ondas.filter((o) => agora - o.born < DURACAO_ONDA);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LIGACAO) {
            ctx.strokeStyle = "rgba(255,255,255," + ((1 - d / LIGACAO) * 0.2).toFixed(3) + ")";
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        const perto = dm < ALCANCE;
        if (perto) {
          const forca = 1 - dm / ALCANCE;
          ctx.strokeStyle = "rgba(226,59,48," + (forca * 0.55).toFixed(3) + ")";
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        ctx.fillStyle = perto
          ? "rgba(255,120,110," + (0.4 + (1 - dm / ALCANCE) * 0.6).toFixed(3) + ")"
          : "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // O anel do clique, por cima de tudo.
      for (const onda of ondas) {
        const t = (agora - onda.born) / DURACAO_ONDA;
        ctx.strokeStyle = "rgba(226,59,48," + ((1 - t) * 0.45).toFixed(3) + ")";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(onda.x, onda.y, t * 320, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  );
}
