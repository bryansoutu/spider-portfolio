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

/*
 * O RETRATO precisa de enquadramento, não só de redimensionamento.
 *
 * O original tem o fundo recortado, proporção 1199x1312, e a cabeça ocupa uma
 * fatia maior do quadro que a foto anterior. Um `cover` para 768x768 cortaria
 * o cabelo pelo topo — o `cover` centraliza, e o que sobra sai dos dois lados.
 *
 * Os números abaixo saíram de medir o canal alfa linha a linha:
 *
 *   topo do cabelo     y = 7    (primeira linha com pixel opaco)
 *   centro do rosto    x ≈ 610  (centro do conteúdo na altura da cabeça e do
 *                                pescoço: 601 em y=340, 621 em y=760)
 *   ombros             a partir de y ≈ 900 o conteúdo ocupa a largura inteira
 *
 * O RECORTE É SIMÉTRICO AO ROSTO, e é isso que resolve o problema que a
 * primeira tentativa teve. Antes eu montei uma moldura mais larga que a foto
 * para reproduzir a proporção de cabeça da versão anterior — e sobrou
 * transparência nas laterais, que dentro do círculo do hero virava um vazio
 * preto embaixo, com os ombros sem alcançar as bordas.
 *
 * Como o rosto está a 610 da esquerda e a 589 da direita, o maior quadrado
 * simétrico possível tem 2 × 589 = 1178 de lado, recortado a partir de x=21.
 * Assim o rosto fica no centro exato e a faixa dos ombros, que ocupa a largura
 * toda da foto, cobre o quadrado de ponta a ponta.
 *
 * A cabeça fica ~7% maior que na versão anterior. É consequência de a foto ser
 * mais fechada, e o círculo cheio vale mais que a proporção antiga.
 */
const LADO = 1178;
const RECORTE_X = 21;
const MARGEM_TOPO = 40;

/*
 * Duas passagens, e não uma cadeia só: o `sharp` aplica o `resize` ANTES do
 * `composite`, então numa cadeia única a moldura já estaria com 768px quando a
 * foto de 1178px chegasse — e ele recusa compor algo maior que o destino.
 */
const moldura = await sharp({
  create: {
    width: LADO,
    height: LADO,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    {
      input: await sharp(await readFile(join(ASSETS, "bryan-face.png")))
        .extract({
          left: RECORTE_X,
          top: 0,
          width: LADO,
          height: LADO - MARGEM_TOPO,
        })
        .png()
        .toBuffer(),
      left: 0,
      top: MARGEM_TOPO,
    },
  ])
  .png()
  .toBuffer();

const retrato = await sharp(moldura)
  .resize(768, 768)
  .webp({ quality: 86, effort: 6 })
  .toBuffer();

await writeFile(join(ASSETS, "bryan-face.webp"), retrato);
console.log(
  `✓ bryan-face.png → bryan-face.webp  ` +
    `${(statSync(join(ASSETS, "bryan-face.png")).size / 1024).toFixed(0)} KB → ` +
    `${(retrato.length / 1024).toFixed(0)} KB`
);

/* A máscara é uma foto comum, sem recorte: `cover` basta. */
const mascara = await sharp(await readFile(join(ASSETS, "spider-mask.jpg")))
  .resize(768, 768, { fit: "cover" })
  .webp({ quality: 86, effort: 6 })
  .toBuffer();

await writeFile(join(ASSETS, "spider-mask.webp"), mascara);
console.log(
  `✓ spider-mask.jpg → spider-mask.webp  ` +
    `${(statSync(join(ASSETS, "spider-mask.jpg")).size / 1024).toFixed(0)} KB → ` +
    `${(mascara.length / 1024).toFixed(0)} KB`
);

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
