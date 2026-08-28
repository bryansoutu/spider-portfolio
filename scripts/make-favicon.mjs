/**
 * Gera os ícones do site a partir de um único SVG.
 *
 * A fonte da verdade é `public/favicon.svg`. Tudo o mais aqui é derivado dele,
 * porque ícone mantido à mão em quatro tamanhos é ícone que fica diferente em
 * três deles na primeira vez que alguém mexe.
 *
 * Saem:
 *   favicon.ico          32 e 16 px, para o pedido automático que todo
 *                        navegador faz em /favicon.ico
 *   apple-touch-icon.png 180 px, o ícone de quando alguém salva o site na tela
 *                        inicial do iPhone
 *
 * Uso: npm run favicon
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const RAIZ = join(import.meta.dirname, "..");
const FONTE = join(RAIZ, "public", "favicon.svg");

/**
 * Embrulha PNGs num contêiner .ico.
 *
 * O formato aceita PNG inteiro dentro dele desde o Windows Vista, então não é
 * preciso escrever bitmap cru: basta o cabeçalho de diretório apontando para
 * onde cada imagem começa. São 6 bytes de cabeçalho e 16 por imagem.
 */
function montarIco(imagens) {
  const cabecalho = Buffer.alloc(6);
  cabecalho.writeUInt16LE(0, 0); // reservado
  cabecalho.writeUInt16LE(1, 2); // 1 = ícone
  cabecalho.writeUInt16LE(imagens.length, 4);

  let deslocamento = 6 + imagens.length * 16;
  const entradas = imagens.map(({ tamanho, png }) => {
    const e = Buffer.alloc(16);
    // 0 significa 256; nenhum tamanho aqui chega lá, mas a regra é do formato.
    e.writeUInt8(tamanho >= 256 ? 0 : tamanho, 0);
    e.writeUInt8(tamanho >= 256 ? 0 : tamanho, 1);
    e.writeUInt8(0, 2); // paleta
    e.writeUInt8(0, 3); // reservado
    e.writeUInt16LE(1, 4); // planos
    e.writeUInt16LE(32, 6); // bits por pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(deslocamento, 12);
    deslocamento += png.length;
    return e;
  });

  return Buffer.concat([cabecalho, ...entradas, ...imagens.map((i) => i.png)]);
}

const imagens = [];
for (const tamanho of [32, 16]) {
  imagens.push({
    tamanho,
    png: await sharp(FONTE).resize(tamanho, tamanho).png().toBuffer(),
  });
}
await writeFile(join(RAIZ, "public", "favicon.ico"), montarIco(imagens));

await sharp(FONTE)
  .resize(180, 180)
  .png()
  .toFile(join(RAIZ, "public", "apple-touch-icon.png"));

console.log("✓ public/favicon.ico  (32 + 16)");
console.log("✓ public/apple-touch-icon.png  (180)");
