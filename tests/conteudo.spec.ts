import { test, expect } from "@playwright/test";

import { botaoDoMenu } from "./apoio";

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

  /*
   * Fechado, o corpo do currículo fica ESCONDIDO, e não ausente.
   *
   * Ele está sempre no DOM de propósito: `window.print()` é síncrono, e
   * depender de o React re-renderizar a tempo fazia a folha sair em branco.
   * Fechado é `display: none` na tela e `block` no `@media print` — CSS puro,
   * sem corrida possível.
   */
  const corpo = page.locator("#curriculo-corpo");
  await expect(corpo).toBeHidden();

  await page.getByRole("button", { name: /abrir o currículo completo/i }).click();
  await expect(corpo).toBeVisible();
  await page.getByRole("button", { name: /fechar o currículo/i }).click();
  await expect(corpo).toBeHidden();

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
  await expect(corpo).toBeHidden();

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

test("a folha sai com o currículo mesmo sem o React reagir a tempo", async ({ page }) => {
  /*
   * A regressão de 28/08: "imprimir tá em branco".
   *
   * A causa era uma corrida que NÃO aparecia nos testes. O currículo se
   * reabria no evento `beforeprint`, mas `window.print()` é síncrono: o evento
   * dispara, o React agenda a re-renderização, e o navegador já tirou a foto
   * da página antes de ela acontecer. Como o `@media print` esconde tudo que
   * não é currículo, e o currículo ainda não tinha sido renderizado, saía uma
   * folha com o rótulo "Currículo" e mais nada.
   *
   * O teste antigo passava porque disparava o evento e esperava 400ms — todo o
   * tempo do mundo para o React. O usuário não dá esse tempo.
   *
   * Este teste reproduz o pior caso de propósito: entra no modo de impressão
   * SEM disparar `beforeprint`, ou seja, com o React parado no estado fechado.
   * Só passa se o conteúdo do papel vier do CSS, sem depender de renderização.
   */
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await expect(page.locator("#curriculo-corpo")).toBeHidden();

  await page.emulateMedia({ media: "print" });

  const folha = await page.evaluate(() => {
    const corpo = document.querySelector("#curriculo-corpo");
    return {
      display: corpo ? getComputedStyle(corpo).display : "AUSENTE",
      itens: document.querySelectorAll("#curriculo-corpo li").length,
      texto: document.body.innerText,
    };
  });

  expect(folha.display, "o currículo não aparece no papel").not.toBe("none");
  expect(folha.itens, "o papel saiu sem os itens do currículo").toBeGreaterThan(10);

  // E o documento tem de dizer de quem é.
  expect(folha.texto).toContain("Bryan Williams Souto Silva");
  expect(folha.texto).toContain("bryanwilliams.s.silva@gmail.com");
  expect(folha.texto).toContain("Unimed Bauru");

  // Nada do site fora do currículo pode ir junto para a folha.
  expect(folha.texto).not.toContain("Tecendo a teia");
  expect(folha.texto.toLowerCase()).not.toContain("baixar em pdf");
});

test("no celular a navegação abre num menu, sem cortar palavra", async ({ page }) => {
  /*
   * A outra queixa de 28/08: "o cabeçalho tá cortado zoado".
   *
   * Os seis itens não cabem em 375px. Eles ficavam numa faixa rolável que
   * cortava "HABILIDADES" no meio da palavra — 284px de conteúdo escondido,
   * sem nenhum sinal de que dava para arrastar. Lê-se como layout quebrado.
   */
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  const botao = botaoDoMenu(page);
  await expect(botao).toBeVisible();
  await expect(botao).toHaveAttribute("aria-expanded", "false");

  await botao.click();
  await expect(botao).toHaveAttribute("aria-expanded", "true");

  const itens = page.locator("#menu-celular a");
  await expect(itens).toHaveCount(6);

  /*
   * Nenhum item pode passar da borda da tela — é exatamente o que a faixa
   * rolável fazia.
   */
  const vazam = await itens.evaluateAll((as) =>
    as.filter((a) => a.getBoundingClientRect().right > window.innerWidth + 1).length
  );
  expect(vazam, "item de menu passando da borda da tela").toBe(0);

  // Escolher um item leva à seção E fecha o menu.
  await page.getByRole("link", { name: "Contato", exact: true }).click();
  await page.waitForTimeout(700);
  await expect(botao).toHaveAttribute("aria-expanded", "false");
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
});

test("no celular os botões do currículo não se atropelam", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/?lang=pt-BR");
  await page.locator("#curriculo").scrollIntoViewIfNeeded();

  const botoes = page.locator("#curriculo a[download], #curriculo button");
  const caixas = await botoes.evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width) };
    })
  );

  expect(caixas.length).toBeGreaterThanOrEqual(3);

  /*
   * Empilhados, começam todos na mesma coluna e têm a mesma largura. Antes,
   * dois dividiam uma linha e o terceiro caía sozinho empurrado para a
   * direita por um `ml-auto` — três larguras e três alinhamentos diferentes.
   */
  const esquerdas = new Set(caixas.map((c) => c.l));
  const larguras = new Set(caixas.map((c) => c.w));
  expect(esquerdas.size, `alinhamentos diferentes: ${[...esquerdas].join(", ")}`).toBe(1);
  expect(larguras.size, `larguras diferentes: ${[...larguras].join(", ")}`).toBe(1);

  for (const c of caixas) {
    expect(c.r, "botão passando da borda da tela").toBeLessThanOrEqual(360);
  }
});
