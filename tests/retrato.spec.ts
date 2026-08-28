import { test, expect } from "@playwright/test";

/**
 * O retrato do hero — foto que vira máscara.
 *
 * Duas queixas de 28/08, as duas só no celular:
 *
 *   "o tocar na imagem tá meio bugado" — o navegador dispara eventos de
 *   ponteiro de mouse também no toque, por compatibilidade. Um toque virava
 *   `pointerenter` (liga a máscara) seguido de `click` (alterna de volta):
 *   piscava e não mudava nada.
 *
 *   "quando segura dá pra baixar a imagem" — o menu do sistema, que é o padrão
 *   de qualquer <img> e aparece justamente no gesto de quem achou que o
 *   primeiro toque não funcionou.
 */

const retrato = (p: import("@playwright/test").Page) =>
  p.getByRole("button", { name: /alternar entre a foto e a máscara/i });

test("no toque, alterna e fica — e alterna de volta no toque seguinte", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  const botao = retrato(page);
  await expect(botao).toHaveAttribute("aria-pressed", "false");

  await botao.tap();
  await expect(
    botao,
    "o primeiro toque não ligou a máscara (mouse e toque brigando?)"
  ).toHaveAttribute("aria-pressed", "true");

  await botao.tap();
  await expect(botao).toHaveAttribute("aria-pressed", "false");

  await botao.tap();
  await expect(botao).toHaveAttribute("aria-pressed", "true");

  await ctx.close();
});

test("segurar o dedo não oferece a imagem para download", async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  const estilos = await retrato(page).evaluate((el) => {
    const botao = getComputedStyle(el);
    const img = getComputedStyle(el.querySelector("img")!);
    return {
      callout: botao.webkitTouchCallout ?? "",
      selecao: botao.userSelect,
      cliqueNaImagem: img.pointerEvents,
      arrastavel: (el.querySelector("img") as HTMLImageElement).draggable,
    };
  });

  /*
   * O dedo tem de acertar sempre o BOTÃO, nunca a <img> por baixo. Sem alvo de
   * imagem, o navegador não tem o que oferecer para salvar.
   */
  expect(estilos.cliqueNaImagem).toBe("none");
  expect(estilos.selecao).toBe("none");
  expect(estilos.arrastavel).toBe(false);

  await ctx.close();
});

test("o retrato é alcançável e acionável pelo teclado", async ({ page }) => {
  /*
   * Era uma `div` com `onClick`: sem foco, sem papel, invisível para quem
   * navega por teclado — que é justamente quem não tem como passar o mouse.
   */
  await page.goto("/?lang=pt-BR");
  await page.getByRole("heading", { level: 1 }).waitFor();

  const botao = retrato(page);
  await botao.focus();
  await expect(botao).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(botao).toHaveAttribute("aria-pressed", "true");
});
