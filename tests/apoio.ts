import type { Page } from "@playwright/test";

/**
 * Abre o menu do celular, se for o caso.
 *
 * Abaixo de 640px os seis itens de navegação ficam atrás de um botão — os
 * nomes não cabem em linha e a faixa rolável cortava "HABILIDADES" no meio da
 * palavra. Acima disso o menu é inline e este auxiliar não faz nada.
 *
 * Ele existe para os testes de navegação valerem nos dois formatos sem
 * duplicar cada um deles.
 */
export function botaoDoMenu(page: Page) {
  /*
   * Pelo `aria-controls`, e não pelo nome: o rótulo acessível do botão muda de
   * "Menu" para "Fechar o menu" quando ele abre, e um localizador por nome
   * deixa de encontrá-lo exatamente depois do clique que interessa.
   */
  return page.locator('button[aria-controls="menu-celular"]');
}

export async function abrirMenuSePreciso(page: Page) {
  const botao = botaoDoMenu(page);
  if (!(await botao.isVisible().catch(() => false))) return;

  /*
   * Só clica se estiver FECHADO. O botão alterna, então chamar este auxiliar
   * duas vezes no mesmo teste — o que acontece ao conferir o menu antes e
   * depois de trocar o idioma — fechava o que a primeira chamada abriu.
   */
  if ((await botao.getAttribute("aria-expanded")) === "true") return;

  await botao.click();
  await page.waitForTimeout(250);
}

/** O link de navegação que está realmente clicável no formato atual. */
export function itemDeMenu(page: Page, nome: string) {
  return page
    .getByRole("link", { name: nome, exact: true })
    .locator("visible=true")
    .first();
}
