import { test, expect } from "@playwright/test";

/**
 * Idioma.
 *
 * O conteúdo existe em português e inglês desde o começo, e o compilador
 * recusa o build se faltar tradução — isso o TypeScript garante. O que ele NÃO
 * garante é o que estes testes cobrem: que a troca chegue à tela, que o
 * documento anuncie o idioma certo, e que a escolha sobreviva a um recarregar.
 */

test("abre em português quando o navegador é pt-BR", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "pt-BR" });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.getByRole("heading", { level: 1 }).waitFor();

  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  // `exact` porque o logo "BS" também aponta para o topo, com o rótulo
  // acessível "Voltar ao início".
  await expect(page.getByRole("link", { name: "Início", exact: true })).toBeVisible();
  await ctx.close();
});

test("abre em inglês quando o navegador não é português", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "de-DE" });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.getByRole("heading", { level: 1 }).waitFor();

  /*
   * O alemão é escolhido de propósito: não é português nem inglês. Testar com
   * `en-US` esconderia a falha de o site simplesmente devolver o padrão em vez
   * de decidir de fato.
   */
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
  await ctx.close();
});

test("o parâmetro ?lang= manda mais que o navegador", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "en-US" });
  const page = await ctx.newPage();
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  // É deste parâmetro que o gerador de PDF depende para fixar o idioma.
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await ctx.close();
});

test("o seletor troca o idioma e a escolha sobrevive ao recarregar", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await expect(page.getByRole("link", { name: "Projetos" })).toBeVisible();

  await page.getByRole("button", { name: "EN", exact: true }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("link", { name: "Work" })).toBeVisible();
  await expect(page.getByRole("button", { name: "EN", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  /*
   * Recarrega SEM o parâmetro. Se a escolha não tivesse sido guardada, a
   * página voltaria a decidir pelo navegador e o teste pegaria isso.
   */
  await page.goto("/");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("o conteúdo do currículo também troca de idioma", async ({ page }) => {
  await page.goto("/?lang=pt-BR&full=1");
  await page.locator("#curriculo-corpo").waitFor();
  await expect(page.getByRole("heading", { name: "Experiência" })).toBeVisible();

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible();

  /*
   * O PDF muda junto. Um recrutador que lê a página em inglês e baixa um
   * currículo em português recebe um documento que não consegue avaliar.
   */
  await expect(page.getByRole("link", { name: /download pdf/i })).toHaveAttribute(
    "href",
    "/resume-bryan-souto.pdf"
  );
});
