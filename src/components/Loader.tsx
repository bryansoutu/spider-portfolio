import { useEffect, useRef, useState } from "react";

import { ui } from "@/content/ui";
import { useLocale } from "@/lib/locale";

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
 *
 * TERCEIRA correção, encontrada pelos testes em 28/08/2026 e da mesma família
 * das outras duas: a cortina ficava de pé indefinidamente para quem rolasse a
 * página durante a abertura.
 *
 * O `onDone` chegava como arrow function criada na renderização do pai. O pai
 * guarda estado que muda a cada rolagem (a seção ativa no menu e o tamanho do
 * cabeçalho), então cada rolagem o re-renderizava, o `onDone` mudava de
 * identidade, o efeito abaixo era desmontado com ela — limpando o intervalo E
 * o teto — e recomeçava do zero, com `inicio` remarcado. Rolar segurava a
 * cortina; rolar sem parar a segurava para sempre.
 *
 * Por isso o callback vive num ref e o efeito não depende de nada. O relógio
 * começa uma vez e não pode mais ser reiniciado por decisão de quem chama.
 */
/*
 * 1,1s de abertura, com corte absoluto em 2,2s.
 *
 * Eram 2s e 4s. A conta que importa aqui não é estética: a abertura acontece
 * DEPOIS de a página já estar pronta, então cada milésimo dela é tempo em que
 * o visitante olha para uma cortina em vez do conteúdo que já existe atrás.
 * Num portfólio, quem abre o link decide em segundos se fica.
 *
 * Não vai a zero porque a animação é a única coisa do site que explica o tema
 * antes do conteúdo — mas 1,1s já lê como intenção, e 2s já lê como espera.
 */
const DURACAO_MS = 1100;
const TETO_MS = 2200;

export function Loader({ onDone }: { onDone: () => void }) {
  const { t } = useLocale();
  const [progress, setProgress] = useState(0);
  const [hiding, setHiding] = useState(false);

  /* Sempre o `onDone` mais recente, sem que trocá-lo reinicie o relógio. */
  const aoTerminar = useRef(onDone);
  aoTerminar.current = onDone;

  useEffect(() => {
    const inicio = Date.now();

    const id = window.setInterval(() => {
      const valor = Math.min(100, ((Date.now() - inicio) / DURACAO_MS) * 100);
      setProgress(valor);

      if (valor >= 100) {
        window.clearInterval(id);
        window.setTimeout(() => setHiding(true), 120);
        window.setTimeout(() => aoTerminar.current(), 440);
      }
    }, 80);

    const teto = window.setTimeout(() => {
      setHiding(true);
      aoTerminar.current();
    }, TETO_MS);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(teto);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
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
            className="text-web/70"
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
            className="text-foreground/35"
          />
        ))}
      </svg>
      <p className="label mt-8 text-muted-foreground">{t(ui.loader.weaving)}</p>
      <div className="mt-4 h-px w-56 overflow-hidden bg-border">
        <div
          className="h-full bg-web transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
