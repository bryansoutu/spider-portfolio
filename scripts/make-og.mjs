/**
 * Gera a imagem de compartilhamento (Open Graph).
 *
 * É o que aparece quando alguém cola o link no WhatsApp, no LinkedIn ou no
 * Telegram. Sem ela, cada plataforma escolhe sozinha o que mostrar — e no caso
 * deste site escolhia o ícone da Vercel, porque era o que estava à mão. O link
 * de um portfólio chegava com a marca da hospedagem em vez da do dono.
 *
 * 1200×630 é a medida que todas as plataformas aceitam sem recortar. Abaixo de
 * 300×200 o WhatsApp ignora, e proporções diferentes de 1.91:1 são cortadas
 * pelas laterais ou pelo topo.
 *
 * O texto é desenhado em SVG e rasterizado aqui, uma vez, e o PNG resultante é
 * versionado. Rodar: npm run og
 */
import sharp from "sharp";
import { join } from "node:path";

const RAIZ = join(import.meta.dirname, "..");
const L = 1200;
const A = 630;

/** Uma teia de canto, no mesmo desenho do fundo do site. */
function teia(cx, cy, raio, a0, abertura) {
  const RAIOS = 11;
  const ANEIS = 7;
  const passo = abertura / RAIOS;
  const partes = [];

  for (let i = 0; i <= RAIOS; i++) {
    const a = a0 + i * passo;
    partes.push(
      `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * raio}" y2="${cy + Math.sin(a) * raio}" stroke="#ffffff" stroke-opacity="0.10" stroke-width="1"/>`
    );
  }

  for (let k = 1; k <= ANEIS; k++) {
    const r = raio * Math.pow(k / ANEIS, 1.35);
    let d = "";
    for (let i = 0; i < RAIOS; i++) {
      const a1 = a0 + i * passo;
      const a2 = a1 + passo;
      const am = a1 + passo / 2;
      const rc = r * 0.86;
      const x1 = cx + Math.cos(a1) * r;
      const y1 = cy + Math.sin(a1) * r;
      const x2 = cx + Math.cos(a2) * r;
      const y2 = cy + Math.sin(a2) * r;
      if (i === 0) d += `M ${x1} ${y1} `;
      d += `Q ${cx + Math.cos(am) * rc} ${cy + Math.sin(am) * rc} ${x2} ${y2} `;
    }
    partes.push(
      `<path d="${d}" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>`
    );
  }
  return partes.join("");
}

const FUNDO = `
<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}">
  <rect width="${L}" height="${A}" fill="#0a0a0a"/>
  ${teia(-40, -40, 720, 0, Math.PI / 2)}
  ${teia(L + 40, A + 40, 560, Math.PI, Math.PI / 2)}

  <!-- Brilho vermelho atrás do retrato, o mesmo do hero. -->
  <defs>
    <radialGradient id="brilho">
      <stop offset="0%" stop-color="#e23b30" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#e23b30" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="930" cy="315" r="300" fill="url(#brilho)"/>

  <g font-family="Segoe UI, Helvetica Neue, Arial, sans-serif">
    <line x1="80" y1="150" x2="128" y2="150" stroke="#e23b30" stroke-width="2"/>
    <text x="144" y="157" fill="#f06a60" font-size="22" letter-spacing="5" font-family="Consolas, monospace">PORTFÓLIO</text>

    <text x="80" y="268" fill="#ffffff" font-size="90" font-weight="600" letter-spacing="-2">Bryan Souto</text>

    <text x="80" y="330" fill="#c9c9c9" font-size="30">Desenvolvedor full-stack</text>
    <text x="80" y="374" fill="#8f8f8f" font-size="26">Construo produtos e coloco no ar</text>

    <g font-family="Consolas, monospace" font-size="21" letter-spacing="2">
      <text x="80" y="470" fill="#e23b30" font-size="34" font-weight="600">2</text>
      <text x="80" y="500" fill="#9a9a9a">PRODUTOS NO AR</text>

      <text x="330" y="470" fill="#e23b30" font-size="34" font-weight="600">112</text>
      <text x="330" y="500" fill="#9a9a9a">TESTES</text>

      <text x="530" y="470" fill="#e23b30" font-size="34" font-weight="600">98</text>
      <text x="530" y="500" fill="#9a9a9a">PAGESPEED</text>
    </g>

    <circle cx="86" cy="558" r="6" fill="#4ade80"/>
    <text x="104" y="565" fill="#9a9a9a" font-size="20" font-family="Consolas, monospace" letter-spacing="2">
      DISPONÍVEL PARA VAGAS DE DESENVOLVEDOR
    </text>
  </g>
</svg>`;

/* O retrato, recortado em círculo com a mesma borda fina do site. */
const D = 380;
const mascara = Buffer.from(
  `<svg width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="#fff"/></svg>`
);

const retrato = await sharp(join(RAIZ, "src", "assets", "bryan-face.webp"))
  .resize(D, D, { fit: "cover", position: "top" })
  .composite([{ input: mascara, blend: "dest-in" }])
  .png()
  .toBuffer();

const aro = Buffer.from(
  `<svg width="${D + 16}" height="${D + 16}">
     <circle cx="${(D + 16) / 2}" cy="${(D + 16) / 2}" r="${D / 2 + 6}"
             fill="none" stroke="#e23b30" stroke-opacity="0.55" stroke-width="2"/>
   </svg>`
);

await sharp(Buffer.from(FUNDO))
  .composite([
    { input: aro, left: 930 - (D + 16) / 2, top: 315 - (D + 16) / 2 },
    { input: retrato, left: 930 - D / 2, top: 315 - D / 2 },
  ])
  .png({ quality: 90 })
  .toFile(join(RAIZ, "public", "og.png"));

const { size } = await sharp(join(RAIZ, "public", "og.png")).metadata();
console.log(`✓ public/og.png  1200×630  (${Math.round((size ?? 0) / 1024)} KB)`);
