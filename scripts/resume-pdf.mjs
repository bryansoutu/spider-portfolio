/**
 * Gera o PDF do currículo a partir da própria página.
 *
 * A alternativa seria manter um .docx à parte e exportar dali — foi assim que
 * o currículo antigo do Bryan parou em maio de 2025 enquanto o trabalho
 * continuava. Aqui só existe uma fonte: `src/content/resume.ts`. O site
 * renderiza, o Chromium imprime, e os dois não têm como divergir.
 *
 * Agora saem DOIS arquivos, um por idioma. O site ganhou seletor de idioma, e
 * um recrutador que lê a página em inglês e baixa um PDF em português recebe um
 * documento que não consegue avaliar.
 *
 * A página é carregada com dois parâmetros que existem só para este script:
 *
 *   ?lang=  fixa o idioma sem depender do que está guardado no navegador.
 *   ?full=1 abre o currículo, que na tela nasce fechado. Sem ele o PDF sairia
 *           com o resumo e dois botões — e o botão é justamente o que o
 *           `@media print` esconde, então seria uma folha quase vazia.
 *
 * O `?full=1` existe porque `page.pdf()` NÃO dispara `beforeprint`, que é o
 * evento em que o site se reabre sozinho no Ctrl+P.
 *
 * Uso: npm run resume:pdf   (faz o build, sobe o preview e gera os arquivos)
 */
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const ROOT = join(import.meta.dirname, "..");
const PORT = 4319;
const SAIDAS = [
  { lang: "pt-BR", arquivo: "curriculo-bryan-souto.pdf" },
  { lang: "en", arquivo: "resume-bryan-souto.pdf" },
];

const server = spawn(
  process.execPath,
  [join(ROOT, "node_modules", "vite", "bin", "vite.js"), "preview", "--port", String(PORT)],
  { cwd: ROOT, stdio: ["ignore", "pipe", "inherit"] }
);

server.stdout.setEncoding("utf8");
server.stdout.on("data", (chunk) => process.stdout.write(chunk));

/*
 * Esperar pela porta responder, e não por uma frase no stdout: a mensagem do
 * Vite vem com códigos de cor no meio e muda entre versões. A porta ou
 * responde ou não — não há como interpretar isso errado.
 */
async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // ainda subindo
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`preview não respondeu em ${timeoutMs / 1000}s`);
}

await waitForServer(`http://localhost:${PORT}/`);

const browser = await chromium.launch();
try {
  const page = await browser.newPage();

  for (const { lang, arquivo } of SAIDAS) {
    await page.goto(`http://localhost:${PORT}/?lang=${lang}&full=1`, {
      waitUntil: "networkidle",
    });

    /*
     * A abertura leva ~2s e cobre a página inteira. Sem esperar por ela, o PDF
     * sai com a tela de carregamento — que é justamente o que o `@media print`
     * esconde, então o arquivo sairia em branco.
     */
    await page.waitForSelector("#curriculo", { state: "visible" });
    await page.waitForTimeout(3500);

    /*
     * Trava de segurança contra a falha mais cara deste script: gerar um PDF
     * bonito e vazio. Se o currículo não abriu, é melhor quebrar o build agora
     * do que descobrir pelo recrutador.
     */
    const linhas = await page.locator("#curriculo-corpo li").count();
    if (linhas < 5) {
      throw new Error(
        `currículo não abriu em ${lang} (${linhas} itens) — confira ?full=1`
      );
    }

    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    await writeFile(join(ROOT, "public", arquivo), pdf);
    console.log(`✓ public/${arquivo}  (${(pdf.length / 1024).toFixed(0)} KB)`);
    await page.emulateMedia({ media: "screen" });
  }
} finally {
  await browser.close();
  server.kill();
}
