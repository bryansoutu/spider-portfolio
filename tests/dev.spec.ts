import { test, expect } from "@playwright/test";
import { spawn, type ChildProcess } from "node:child_process";

/**
 * O servidor de DESENVOLVIMENTO monta a página?
 *
 * Este arquivo existe por causa de um defeito específico, e é o único do
 * projeto que não testa o build.
 *
 * Em 28/08/2026 o site não abria em `npm run dev`: tela preta, sem erro na
 * tela, sem aviso no terminal. A causa era uma linha herdada do projeto
 * Next.js, `process.env.NEXT_PUBLIC_SITE_URL`, numa constante que ninguém
 * usava. No build o Vite removia a constante por tree-shaking e nada
 * acontecia; em desenvolvimento não há remoção, `process` não existe no
 * navegador, o módulo estoura ao carregar e o React nunca monta.
 *
 * Toda a suíte roda contra o build — ou seja, toda ela passaria com o site
 * quebrado para quem está programando. Trinta segundos de teste evitam a
 * próxima meia hora procurando o servidor errado.
 */

const PORTA = 5199;
let servidor: ChildProcess;

test.beforeAll(async () => {
  servidor = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "--port", String(PORTA), "--strictPort"],
    { stdio: ["ignore", "pipe", "inherit"] }
  );
  servidor.stdout?.on("data", () => {});

  const limite = Date.now() + 60_000;
  while (Date.now() < limite) {
    try {
      const r = await fetch(`http://localhost:${PORTA}/`);
      if (r.ok) return;
    } catch {
      /* ainda subindo */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("o servidor de desenvolvimento não respondeu");
});

test.afterAll(() => {
  servidor?.kill();
});

test("em desenvolvimento a página monta e o console fica limpo", async ({ page }) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") erros.push(`console: ${m.text()}`);
  });

  await page.goto(`http://localhost:${PORTA}/?lang=pt-BR`);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bryan Souto", {
    timeout: 20_000,
  });
  expect(await page.locator("#root > *").count()).toBeGreaterThan(0);

  expect(erros, `erros em desenvolvimento:\n${erros.join("\n")}`).toEqual([]);
});
