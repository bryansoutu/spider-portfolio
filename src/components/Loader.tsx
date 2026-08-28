import { useEffect, useState } from "react";

/**
 * A abertura: a teia sendo tecida enquanto a página entra.
 *
 * Duas correções sobre a versão original, e as duas vêm do mesmo defeito.
 *
 * A original avançava um pedaço aleatório A CADA TICK de um `setInterval` de
 * 140ms. O Chrome estrangula timers em aba de segundo plano — o intervalo cai
 * para ~1 tick por segundo — então a abertura de 2 segundos virava 10 ou mais.
 * Quem abre o link em nova aba (o gesto mais comum que existe com um link de
 * portfólio) voltava e encontrava a cortina ainda de pé.
 *
 * 1. O progresso passou a ser medido em TEMPO DECORRIDO, não em ticks. Se o
 *    navegador der um tick só, esse tick já calcula a posição certa.
 * 2. Existe um teto absoluto. Se nem isso acontecer, a cortina sai sozinha —
 *    porque nenhuma animação de entrada vale uma página que não abre.
 */
const DURACAO_MS = 2000;
const TETO_MS = 4000;

export function Loader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const inicio = Date.now();

    const id = window.setInterval(() => {
      const valor = Math.min(100, ((Date.now() - inicio) / DURACAO_MS) * 100);
      setProgress(valor);

      if (valor >= 100) {
        window.clearInterval(id);
        window.setTimeout(() => setHiding(true), 250);
        window.setTimeout(onDone, 900);
      }
    }, 80);

    const teto = window.setTimeout(() => {
      setHiding(true);
      onDone();
    }, TETO_MS);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(teto);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        hiding ? "opacity-0" : "opacity-100"
      }`}
    >
      <svg viewBox="0 0 100 100" className="h-24 w-24 animate-[spin_6s_linear_infinite]">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line
            key={a}
            x1="50"
            y1="50"
            x2={50 + 46 * Math.cos((a * Math.PI) / 180)}
            y2={50 + 46 * Math.sin((a * Math.PI) / 180)}
            stroke="currentColor"
            strokeWidth="0.7"
            className="text-foreground/60"
          />
        ))}
        {[14, 24, 34, 44].map((r) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.7"
            className="text-foreground/40"
          />
        ))}
      </svg>
      <p className="mt-8 font-mono text-xs tracking-[0.4em] text-muted-foreground uppercase">
        Tecendo a teia
      </p>
      <div className="mt-4 h-px w-56 overflow-hidden bg-border">
        <div
          className="h-full bg-foreground transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
