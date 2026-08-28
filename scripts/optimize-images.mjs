/**
 * Gera as versões web das imagens a partir dos originais do Lovable.
 *
 * Os originais ficam no repositório e NÃO são importados pelo código: eles são
 * a fonte de onde se regenera, do mesmo jeito que `src/content/resume.ts` é a
 * fonte do PDF. O que a página carrega são os derivados aqui embaixo.
 *
 * A conta que justifica isso: o retrato tem 2048x2048 e 5,7 MB para aparecer
 * dentro de um círculo de 320px. São 5,6 MB baixados para exibir 320 — e o
 * site anuncia "PageSpeed 95" como prova de competência.
 *
 * 768px e não 640: cobre tela retina com folga e ainda sobra para o leve zoom
 * do hover, sem chegar perto do peso do original.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ASSETS = join(import.meta.dirname, "..", "src", "assets");

const TARGETS = [
  { from: "bryan-face.png", to: "bryan-face.webp", size: 768 },
  { from: "spider-mask.jpg", to: "spider-mask.webp", size: 768 },
];

for (const { from, to, size } of TARGETS) {
  const input = join(ASSETS, from);
  const output = join(ASSETS, to);

  const buffer = await sharp(await readFile(input))
    .resize(size, size, { fit: "cover" })
    .webp({ quality: 86, effort: 6 })
    .toBuffer();

  await writeFile(output, buffer);

  const before = statSync(input).size;
  console.log(
    `✓ ${from} → ${to}  ${(before / 1024).toFixed(0)} KB → ${(buffer.length / 1024).toFixed(0)} KB`
  );
}

/*
 * ---------------------------------------------------------------------------
 * Capturas dos projetos, em várias larguras.
 *
 * As capturas têm 1600×1000 e aparecem num cartão de ~660px. Num celular, o
 * navegador baixava 1600px de imagem para desenhar 390 — o Lighthouse apontava
 * 272 KiB de desperdício, e era o maior item da lista.
 *
 * Aqui não há uma "melhor largura": depende da tela de quem chega. Então saem
 * várias, e o `srcset` no componente deixa o NAVEGADOR escolher, que é quem
 * sabe a largura da janela e a densidade da tela. Numa tela retina de celular
 * ele pega a de 960; num monitor comum, a de 640.
 *
 * Os arquivos de 1600px continuam no repositório como fonte, e não são
 * importados por código nenhum — é deles que estes derivados nascem.
 * ---------------------------------------------------------------------------
 */
const RESPONSIVAS = [
  { arquivo: "nyo-desktop.webp", larguras: [480, 640, 960, 1400] },
  { arquivo: "meteoros-desktop.webp", larguras: [480, 640, 960, 1400] },
  { arquivo: "nyo-mobile.webp", larguras: [320, 480, 640] },
  { arquivo: "meteoros-mobile.webp", larguras: [320, 480, 640] },
];

const ORIGEM = join(ASSETS, "projects");
const DESTINO = join(ORIGEM, "responsivo");
await mkdir(DESTINO, { recursive: true });

let antes = 0;
let depois = 0;

for (const { arquivo, larguras } of RESPONSIVAS) {
  const base = arquivo.replace(/\.webp$/, "");
  const entrada = await readFile(join(ORIGEM, arquivo));
  antes += statSync(join(ORIGEM, arquivo)).size;

  const partes = [];
  for (const largura of larguras) {
    const buffer = await sharp(entrada)
      .resize(largura, null, { withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toBuffer();

    await writeFile(join(DESTINO, `${base}-${largura}.webp`), buffer);
    depois += buffer.length;
    partes.push(`${largura}px=${(buffer.length / 1024).toFixed(0)}KB`);
  }

  console.log(`✓ ${arquivo}  →  ${partes.join("  ")}`);
}

console.log(
  `
  originais: ${(antes / 1024).toFixed(0)} KB` +
    `  ·  derivados somados: ${(depois / 1024).toFixed(0)} KB` +
    `
  (o navegador baixa UMA por imagem, não todas)`
);
