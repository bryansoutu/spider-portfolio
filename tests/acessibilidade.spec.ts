import { test, expect } from "@playwright/test";

/**
 * Acessibilidade e integridade dos links.
 *
 * O site tem 100 de acessibilidade no Lighthouse, e isso cobre menos do que
 * parece — a ferramenta detecta um subconjunto dos problemas. O que está aqui
 * são as regras que este site em particular pode quebrar sem ninguém ver, por
 * causa do que ele é: uma página só, escura, com metade do conteúdo atrás de
 * botões que abrem.
 */

test("existe exatamente um h1 e a hierarquia não pula nível", async ({ page }) => {
  await page.goto("/?lang=pt-BR&full=1");
  await page.getByRole("heading", { level: 1 }).waitFor();

  /*
   * Contar os h1 VISÍVEIS, e não os do DOM.
   *
   * A página tem dois no HTML: o nome no hero e o cabeçalho do currículo, que
   * nasce com `display: none` e só aparece no papel. Na tela vale o primeiro;
   * na impressão o hero é escondido e vale o segundo. Nunca há dois ao mesmo
   * tempo para quem lê, e elemento com `display: none` nem entra na árvore de
   * acessibilidade — contar nós crus reprovaria uma marcação correta.
   */
  const h1Visiveis = await page
    .locator("h1")
    .evaluateAll((els) => els.filter((el) => (el as HTMLElement).offsetParent !== null).length);
  expect(h1Visiveis).toBe(1);

  const niveis = await page
    .locator("h1, h2, h3, h4")
    .evaluateAll((els) =>
      els
        .filter((el) => (el as HTMLElement).offsetParent !== null)
        .map((el) => Number(el.tagName[1]))
    );

  /*
   * Leitor de tela navega por títulos. Pular de h2 para h4 faz o ouvinte
   * pensar que perdeu um trecho da página.
   */
  for (let i = 1; i < niveis.length; i++) {
    expect(
      niveis[i] - niveis[i - 1],
      `salto de h${niveis[i - 1]} para h${niveis[i]}`
    ).toBeLessThanOrEqual(1);
  }
});

test("todo link que abre em nova aba está protegido", async ({ page }) => {
  await page.goto("/?lang=pt-BR&full=1");
  await page.getByRole("heading", { level: 1 }).waitFor();

  const externos = await page.locator('a[target="_blank"]').evaluateAll((as) =>
    as.map((a) => ({ href: a.getAttribute("href"), rel: a.getAttribute("rel") ?? "" }))
  );

  expect(externos.length).toBeGreaterThan(0);
  for (const { href, rel } of externos) {
    /*
     * Sem `noopener`, a página aberta recebe `window.opener` e pode reescrever
     * a aba de origem para onde quiser — o ataque de tabnabbing. Os navegadores
     * novos já assumem isso sozinhos; escrever continua sendo o certo, porque a
     * proteção não pode depender da versão do navegador do recrutador.
     */
    expect(rel, `link para ${href}`).toContain("noopener");
    expect(rel, `link para ${href}`).toContain("noreferrer");
  }
});

test("os links externos vão para os destinos reais do Bryan", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.locator("#contato").scrollIntoViewIfNeeded();

  const hrefs = await page
    .locator("#contato a")
    .evaluateAll((as) => as.map((a) => a.getAttribute("href")));

  expect(hrefs).toContain("mailto:bryanwilliams.s.silva@gmail.com");
  expect(hrefs).toContain("https://github.com/bryansoutu");
  expect(hrefs).toContain("https://www.linkedin.com/in/bryansouto/");
  expect(hrefs).toContain("https://wa.me/5514988372000");
});

test("toda imagem tem alternativa textual declarada", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  const semAlt = await page
    .locator("img")
    .evaluateAll((imgs) =>
      imgs.filter((i) => i.getAttribute("alt") === null).map((i) => i.getAttribute("src"))
    );

  /*
   * `alt=""` é válido e é o certo para imagem decorativa — declara "ignore
   * isto". O que não pode é o atributo AUSENTE, que faz o leitor de tela ler
   * o nome do arquivo em voz alta.
   */
  expect(semAlt, `imagens sem atributo alt: ${semAlt.join(", ")}`).toEqual([]);
});

test("os controles que abrem conteúdo se anunciam corretamente", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  const controles = await page.locator("[aria-expanded]").evaluateAll((els) =>
    els.map((el) => ({
      tag: el.tagName,
      expandido: el.getAttribute("aria-expanded"),
      controla: el.getAttribute("aria-controls"),
      nome: el.textContent?.trim().slice(0, 40),
    }))
  );

  expect(controles.length).toBeGreaterThan(5);
  for (const c of controles) {
    expect(c.tag, `${c.nome} deveria ser <button>`).toBe("BUTTON");
    expect(["true", "false"]).toContain(c.expandido);
    expect(c.controla, `${c.nome} sem aria-controls`).toBeTruthy();
  }
});

test("dá para chegar ao currículo só com o teclado", async ({ page }) => {
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  /*
   * Percorre a ordem de tabulação até encontrar o botão que abre o currículo e
   * o aciona com Enter. Se ele não fosse alcançável — um `div` com `onClick`,
   * por exemplo — o laço terminaria sem nunca achá-lo.
   */
  let achou = false;
  for (let i = 0; i < 60 && !achou; i++) {
    await page.keyboard.press("Tab");
    const rotulo = await page.evaluate(
      () => document.activeElement?.textContent?.trim() ?? ""
    );
    if (/abrir o currículo completo/i.test(rotulo)) {
      achou = true;
      await page.keyboard.press("Enter");
    }
  }

  expect(achou, "o botão do currículo não foi alcançado pelo teclado").toBe(true);
  await expect(page.locator("#curriculo-corpo")).toBeVisible();
});

test("as aranhas são decorativas e não roubam clique", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.waitForTimeout(1500);

  const aranhas = page.locator("#topo .spider");
  await expect(aranhas).toHaveCount(2);

  const info = await aranhas.evaluateAll((els) =>
    els.map((el) => ({
      escondido: el.getAttribute("aria-hidden"),
      cliques: getComputedStyle(el).pointerEvents,
    }))
  );

  for (const a of info) {
    // Leitor de tela não deve anunciar "imagem" no meio da apresentação.
    expect(a.escondido).toBe("true");
    expect(a.cliques).toBe("none");
  }
});

test("com movimento reduzido, nada de conteúdo fica invisível", async ({ page }) => {
  // Este é o cenário em que `.reveal` poderia deixar a página em branco.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  const invisiveis = await page.locator("[data-reveal]").evaluateAll((els) =>
    els.filter((el) => Number(getComputedStyle(el).opacity) < 0.9).length
  );

  expect(invisiveis, "elementos presos em opacidade zero").toBe(0);
  await expect(page.locator("#topo .spider")).toHaveCount(2);
});
