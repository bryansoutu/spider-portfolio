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
import { readFile, writeFile } from "node:fs/promises";
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
