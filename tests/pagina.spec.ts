import { test, expect, type Page } from "@playwright/test";

/**
 * O básico: a página abre, abre inteira, e não grita no console.
 *
 * Parece pouco até lembrar que este site já foi ao ar com uma tela preta em
 * desenvolvimento por causa de um `process.env` esquecido. Falha de módulo em
 * SPA não deixa rastro na tela: o HTML responde 200, o `<div id="root">` fica
 * vazio, e só o console sabe. Por isso o console é assertado, e não observado.
 */

/** Coleta erros de console e exceções não tratadas durante a visita. */
function vigiarErros(page: Page): string[] {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") erros.push(`console: ${m.text()}`);
  });
  return erros;
}

test("a página monta, tem conteúdo e não registra erro", async ({ page }) => {
  const erros = vigiarErros(page);

  const resposta = await page.goto("/?lang=pt-BR");
  expect(resposta?.status()).toBe(200);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bryan Souto");

  /*
   * A raiz precisa ter FILHOS, não só existir. Uma SPA quebrada devolve a
   * casca com a div vazia, e um teste que só procura `#root` passa feliz.
   */
  const filhos = await page.locator("#root > *").count();
  expect(filhos).toBeGreaterThan(0);

  expect(erros, `erros no console:\n${erros.join("\n")}`).toEqual([]);
});

test("todas as seções da navegação existem na página", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  for (const id of ["topo", "sobre", "projetos", "faco", "habilidades", "curriculo", "contato"]) {
    await expect(page.locator(`#${id}`), `seção #${id}`).toHaveCount(1);
  }

  /*
   * Menu que aponta para âncora inexistente é o defeito mais silencioso de
   * página única: o clique não faz nada e ninguém reporta.
   */
  const destinos = await page.locator("header nav a").evaluateAll((as) =>
    as.map((a) => a.getAttribute("href"))
  );
  for (const href of destinos) {
    expect(href).toMatch(/^#/);
    await expect(page.locator(href!), `destino ${href}`).toHaveCount(1);
  }
});

test("não existe rolagem horizontal em nenhuma largura", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  // 320px é o iPhone SE de primeira geração — o piso que ainda aparece nos logs.
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(250);
    const vaza = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(vaza, `rolagem horizontal em ${width}px`).toBe(false);
  }
});

test("a abertura sai da frente em menos de três segundos", async ({ page }) => {
  /*
   * Com movimento reduzido a cortina nem aparece; aqui o teste precisa do
   * caminho normal, que é o que 99% das visitas recebem.
   */
  await page.emulateMedia({ reducedMotion: "no-preference" });

  const inicio = Date.now();
  await page.goto("/?lang=pt-BR");

  /*
   * O teto do componente é 2,2s. Três segundos dá folga para a máquina de
   * teste sem deixar passar a regressão que importa: a de 2026-08-27, quando
   * o contador de ticks era estrangulado em aba de segundo plano e a cortina
   * ficava mais de dez segundos na frente da página.
   */
  await expect(page.getByText(/tecendo a teia/i)).toBeHidden({ timeout: 3000 });
  expect(Date.now() - inicio).toBeLessThan(3000);
});

test("rolar durante a abertura não segura a cortina", async ({ page }) => {
  /*
   * A regressão que este teste tranca (28/08/2026).
   *
   * A cortina ficava de pé para sempre para quem rolasse a página enquanto ela
   * carregava. O `onDone` era criado na renderização do pai; o pai re-renderiza
   * a cada rolagem, porque guarda a seção ativa do menu e o tamanho do
   * cabeçalho; o efeito do Loader dependia daquele callback, então cada rolagem
   * limpava o intervalo e o teto e recomeçava o relógio do zero.
   *
   * O detalhe cruel é que ninguém percebe programando: só acontece se a pessoa
   * mexer na página durante os primeiros segundos, que é exatamente o que um
   * visitante impaciente faz — e um recrutador com trinta abas abertas é a
   * definição de visitante impaciente.
   */
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?lang=pt-BR");

  const cortina = page.locator("#root .fixed.inset-0.z-50");
  const inicio = Date.now();
  let saiuEm: number | null = null;

  /*
   * A rolagem precisa continuar ENQUANTO se observa, e por mais tempo que o
   * teto de 2,2s do componente.
   *
   * A primeira versão deste teste rolava e só então esperava — e passava com o
   * defeito presente, porque assim que a rolagem parava o relógio corria
   * inteiro sem ser reiniciado. O defeito só aparece com o dedo ainda na roda.
   */
  for (let i = 0; i < 32 && saiuEm === null; i++) {
    await page.mouse.wheel(0, 90);
    await page.waitForTimeout(110);
    if ((await cortina.count()) === 0) saiuEm = Date.now() - inicio;
  }

  expect(
    saiuEm,
    "a cortina continuou de pé enquanto a página era rolada"
  ).not.toBeNull();
  expect(saiuEm!, `saiu em ${saiuEm}ms`).toBeLessThan(2600);

  /*
   * E a página precisa estar CLICÁVEL depois disso. A cortina é `fixed
   * inset-0 z-50`: enquanto estiver montada, ela intercepta todo clique da
   * página sem nenhum sinal visual de que é ela que está no caminho.
   */
  const botao = page.locator("#projetos > ul > li").first().locator("button[aria-controls]");
  await botao.scrollIntoViewIfNeeded();
  await botao.click();
  await expect(botao).toHaveAttribute("aria-expanded", "true");
});
