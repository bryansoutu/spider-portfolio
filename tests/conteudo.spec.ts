import { test, expect } from "@playwright/test";

/**
 * Os blocos que abrem, e o currículo.
 *
 * Metade do conteúdo do site nasce fechado — foi a decisão que resolveu a
 * densidade. O risco que isso cria é específico: conteúdo fechado é conteúdo
 * que pode nunca abrir, e ninguém percebe, porque a página continua bonita.
 */

test("os projetos nascem fechados e abrem no clique", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  /*
   * O botão é buscado DENTRO da primeira linha, e pelo atributo, não pelo
   * texto.
   *
   * Buscar por texto aqui engana: quando a linha abre, o rótulo do botão muda
   * de "Como foi feito" para "Fechar", e um `getByRole(...).first()` — que o
   * Playwright reavalia a cada ação — passa a apontar para o botão do projeto
   * SEGUINTE, que continua fechado. O teste então clicava num projeto e
   * conferia outro, falhando com o site perfeitamente correto.
   */
  const linha = page.locator("#projetos > ul > li").first();
  const botao = linha.locator("button[aria-controls]");
  await botao.scrollIntoViewIfNeeded();

  /*
   * O alvo é o rótulo dentro da seção de projetos, não o texto "o problema"
   * solto na página: o resumo do Bryan contém a frase "converso com quem tem o
   * problema", e uma busca por texto livre casava com ela.
   */
  const rotulo = linha.locator("dt", { hasText: /^O problema$/ });

  await expect(botao).toHaveAttribute("aria-expanded", "false");
  await expect(rotulo).toHaveCount(0);

  await botao.click();

  await expect(botao).toHaveAttribute("aria-expanded", "true");
  await expect(rotulo).toBeVisible();

  await botao.click();
  await expect(botao).toHaveAttribute("aria-expanded", "false");
  await expect(rotulo).toHaveCount(0);
});

test("as habilidades filtram, contam e explicam o vazio", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.locator("#habilidades").scrollIntoViewIfNeeded();

  const itens = page.locator("#habilidades ul li");
  const parciais = await itens.count();
  expect(parciais).toBeGreaterThan(0);

  /*
   * O contador é o que impede o filtro de mentir: ele mostra só o nível
   * sólido por padrão, e sem o "9 / 28" à vista o visitante concluiria que a
   * lista inteira tem nove itens.
   */
  await expect(page.getByText(/mostrando \d+ \/ \d+/i)).toBeVisible();

  await page.getByRole("button", { name: "Dados", exact: true }).click();
  await expect(page.getByText(/nada que eu domine nesta categoria/i)).toBeVisible();

  // O próprio estado vazio oferece a saída.
  await page.getByRole("button", { name: /ver todas as habilidades/i }).last().click();
  await expect(page.getByText(/nada que eu domine nesta categoria/i)).toBeHidden();

  await page.getByRole("button", { name: "Tudo", exact: true }).click();
  const todas = await itens.count();
  expect(todas).toBeGreaterThan(parciais);
});

test("cada afirmação de 'como eu trabalho' abre a evidência", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.locator("#habilidades").scrollIntoViewIfNeeded();

  const linha = page.getByRole("button", { name: /destravo sozinho antes de pedir ajuda/i });
  await expect(linha).toHaveAttribute("aria-expanded", "false");

  await linha.click();
  await expect(linha).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText(/BjrBot foi construído sem nenhum tutorial/i)).toBeVisible();
});

test("o currículo abre, fecha, e volta a fechar depois de imprimir", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.locator("#curriculo").scrollIntoViewIfNeeded();

  const corpo = page.locator("#curriculo-corpo");
  await expect(corpo).toHaveCount(0);

  await page.getByRole("button", { name: /abrir o currículo completo/i }).click();
  await expect(corpo).toBeVisible();
  await page.getByRole("button", { name: /fechar o currículo/i }).click();
  await expect(corpo).toHaveCount(0);

  /*
   * O ciclo de impressão. O currículo se reabre sozinho no `beforeprint` para
   * que o papel não saia com dois botões e nada mais — e precisa VOLTAR a
   * fechar no `afterprint`.
   *
   * Sem a segunda metade, o defeito de 28/08 volta: o botão "Fechar" alterna
   * o estado dele, a condição `aberto || imprimindo` continua verdadeira pelo
   * segundo termo, e a tela não muda. Botão que diz uma coisa e faz outra.
   */
  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  await expect(corpo).toBeVisible();

  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await expect(corpo).toHaveCount(0);

  await page.getByRole("button", { name: /abrir o currículo completo/i }).click();
  await expect(corpo).toBeVisible();
});

test("?full=1 entrega o currículo aberto — é dele que sai o PDF", async ({ page }) => {
  await page.goto("/?lang=pt-BR&full=1");

  const corpo = page.locator("#curriculo-corpo");
  await expect(corpo).toBeVisible();

  /*
   * A contagem existe porque o modo de falha aqui é silencioso: um PDF gerado
   * de uma página que não abriu sai bonito, com o cabeçalho certo, e vazio por
   * dentro. O gerador tem a mesma trava.
   */
  expect(await corpo.locator("li").count()).toBeGreaterThan(10);
  await expect(page.getByRole("heading", { name: "Experiência" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Formação" })).toBeVisible();
});

test("os dois PDFs do currículo existem no servidor", async ({ request }) => {
  for (const arquivo of ["/curriculo-bryan-souto.pdf", "/resume-bryan-souto.pdf"]) {
    const r = await request.get(arquivo);
    expect(r.status(), arquivo).toBe(200);
    expect(r.headers()["content-type"], arquivo).toContain("pdf");
    // Um PDF de meia dúzia de bytes é um arquivo de erro com extensão .pdf.
    expect((await r.body()).length, arquivo).toBeGreaterThan(20_000);
  }
});

test("nenhum marcador de dado pendente chegou à tela", async ({ page }) => {
  await page.goto("/?lang=pt-BR&full=1");
  await page.getByRole("heading", { level: 1 }).waitFor();

  const texto = await page.locator("body").innerText();

  /*
   * `__PENDENTE__` é o marcador de dado que o Bryan ainda não forneceu, e
   * `exemplo.com` é o resto do esboço gerado no Lovable. Qualquer um dos dois
   * visível é conteúdo falso publicado.
   */
  expect(texto).not.toContain("__PENDENTE__");
  expect(texto.toLowerCase()).not.toContain("exemplo.com");
  expect(texto.toLowerCase()).not.toContain("lorem ipsum");
});
