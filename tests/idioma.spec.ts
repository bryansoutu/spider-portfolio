import { test, expect } from "@playwright/test";

import { abrirMenuSePreciso, itemDeMenu } from "./apoio";

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
  await abrirMenuSePreciso(page);
  await expect(itemDeMenu(page, "Início")).toBeVisible();
  await ctx.close();
});

test("a primeira visita abre em português, seja qual for o navegador", async ({
  browser,
}) => {
  /*
   * Decisão de 28/08: o padrão é português, e NÃO o idioma do navegador.
   *
   * A versão anterior detectava — e errava para o caso comum. O público deste
   * site é vaga no Brasil, e qualquer navegador configurado em inglês (o que
   * não é raro em máquina de desenvolvedor) fazia um visitante brasileiro cair
   * na versão em inglês. Quem chega de fora é a exceção, e para a exceção
   * existe o seletor no cabeçalho, visível na primeira tela.
   *
   * As três línguas testadas cobrem o inglês, um terceiro idioma qualquer e o
   * próprio português.
   */
  for (const locale of ["en-US", "de-DE", "pt-BR"]) {
    const ctx = await browser.newContext({ locale });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.getByRole("heading", { level: 1 }).waitFor();

    await expect(
      page.locator("html"),
      `navegador em ${locale} deveria abrir em português`
    ).toHaveAttribute("lang", "pt-BR");

    await ctx.close();
  }
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
  await abrirMenuSePreciso(page);
  await expect(itemDeMenu(page, "Projetos")).toBeVisible();

  await page.getByRole("button", { name: "EN", exact: true }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await abrirMenuSePreciso(page);
  await expect(itemDeMenu(page, "Work")).toBeVisible();
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
