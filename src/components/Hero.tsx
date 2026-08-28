import { useRef, useState } from "react";

import { profile } from "@/content/profile";
import { LOCALE } from "@/lib/locale";
import faceAsset from "@/assets/bryan-face.webp";
import maskAsset from "@/assets/spider-mask.webp";

/**
 * Hero: retrato com a teia girando em volta, nome, headline e o sinal de
 * disponibilidade. Marcação e classes são as do Lovable — o que mudou foi só
 * de onde vêm os textos.
 *
 * Os três números entraram depois. Eles respondem antes da pergunta que o
 * recrutador faz nos primeiros segundos ("esse cara já entregou alguma
 * coisa?"), e todos foram conferidos no código dos projetos, não escritos de
 * memória.
 */
const STATS = [
  { value: "2", label: "produtos no ar" },
  { value: "4", label: "idiomas publicados" },
  { value: "95", label: "PageSpeed no celular" },
] as const;

export function Hero() {
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
    <section className="flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
      <p
        data-reveal
        className="reveal font-mono text-[0.65rem] tracking-[0.5em] text-muted-foreground uppercase"
      >
        Portfólio
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
            alt={`Retrato de ${profile.name}`}
            className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 ${
              hover ? "scale-95 opacity-0 blur-sm" : "scale-100 opacity-100"
            }`}
          />
          <img
            src={maskAsset}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover object-center brightness-[1.15] contrast-110 transition-all duration-500 ${
              hover ? "scale-[1.45] opacity-100" : "scale-[1.6] opacity-0 blur-sm"
            }`}
          />
        </div>
      </div>

      <h1
        data-reveal
        className="reveal mt-12 text-5xl font-semibold tracking-tight md:text-7xl"
      >
        {profile.shortName}
      </h1>

      <p
        data-reveal
        className="reveal mt-4 max-w-xl text-sm text-muted-foreground md:text-base"
      >
        {profile.headline[LOCALE]}
      </p>

      <p
        data-reveal
        className="reveal mt-3 font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase"
      >
        {profile.location}
      </p>

      <div
        data-reveal
        className="reveal mt-10 flex items-center gap-3 font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground uppercase"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/60 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground" />
        </span>
        Disponível para vagas de desenvolvedor
      </div>

      <dl
        data-reveal
        className="reveal mt-14 flex flex-wrap justify-center divide-x divide-border border-y border-border"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="min-w-[8rem] px-7 py-5 sm:px-10">
            <dt className="sr-only">{stat.label}</dt>
            <dd>
              <span className="block text-3xl font-semibold md:text-4xl">
                {stat.value}
              </span>
              <span className="mt-2 block font-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground uppercase">
                {stat.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
