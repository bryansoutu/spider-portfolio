import { test, expect } from "@playwright/test";

/**
 * Cabeçalho e navegação.
 *
 * Os dois defeitos cobertos aqui foram encontrados por observação, não por
 * raciocínio, e os dois eram invisíveis no código de quem os causou:
 *
 *   - `overflow-x: hidden` no container raiz criava um contêiner de rolagem, e
 *     `position: sticky` gruda no contêiner de rolagem mais próximo, não na
 *     janela. O cabeçalho subia junto com a página e sumia.
 *   - Um limiar único para encolher o cabeçalho virava gangorra perto da
 *     fronteira, porque encolher desloca 44px e o limiar estava a 40px: o
 *     efeito desfazia a própria causa, várias vezes por segundo.
 */

test("o cabeçalho continua na tela durante a rolagem", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  for (const y of [600, 1800, 4000]) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(400);

    const topo = await page
      .locator("header")
      .evaluate((el) => Math.round(el.getBoundingClientRect().top));

    expect(topo, `cabeçalho descolou com a página em ${y}px`).toBe(0);
  }
});

test("o cabeçalho encolhe ao rolar e não oscila na fronteira", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  const altura = () =>
    page.locator("header").evaluate((el) => Math.round(el.getBoundingClientRect().height));

  const noTopo = await altura();

  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(450);
  const rolado = await altura();
  expect(rolado, "o cabeçalho deveria encolher ao rolar").toBeLessThan(noTopo);

  /*
   * A varredura sobe e desce cruzando a faixa onde a gangorra acontecia. Duas
   * trocas de altura é o certo: encolheu uma vez, cresceu uma vez. Mais que
   * isso é o defeito de volta.
   */
  const alturas: number[] = [];
  for (const y of [0, 20, 40, 60, 90, 110, 140, 110, 90, 60, 40, 30, 10, 0]) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(400);
    alturas.push(await altura());
  }

  let trocas = 0;
  for (let i = 1; i < alturas.length; i++) if (alturas[i] !== alturas[i - 1]) trocas++;

  expect(trocas, `alturas observadas: ${alturas.join(" ")}`).toBeLessThanOrEqual(2);
});

test("clicar no menu leva à seção certa", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  /*
   * "Projetos", e não "Contato". O contato é a última seção: abaixo dela só há
   * o rodapé, então a página acaba antes de conseguir levá-la ao topo da tela.
   * O teste reprovava por causa do fim do documento, não do link.
   */
  await page.getByRole("link", { name: "Projetos", exact: true }).click();
  await page.waitForTimeout(700);

  const caixa = await page
    .locator("#projetos")
    .evaluate((el) => Math.round(el.getBoundingClientRect().top));

  /*
   * A seção precisa aparecer ABAIXO do cabeçalho fixo, não atrás dele — é para
   * isso que existe o `scroll-mt-24`. Um valor negativo aqui significa título
   * escondido sob a barra.
   */
  expect(caixa).toBeGreaterThanOrEqual(0);
  expect(caixa).toBeLessThan(200);
});

test("o item Início volta ao topo", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(400);

  await page.getByRole("link", { name: "Início", exact: true }).click();
  await page.waitForTimeout(900);

  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(200);
});
