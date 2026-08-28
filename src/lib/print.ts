import { useEffect, useState } from "react";

/**
 * Verdadeiro quando a página está sendo impressa — ou quando alguém pediu a
 * versão inteira pela URL.
 *
 * Existe por causa de uma armadilha nova: as seções agora nascem fechadas, e
 * conteúdo fechado é conteúdo que não vai para o papel. O currículo colapsado
 * imprimiria uma folha com dois botões.
 *
 * São dois gatilhos, porque são dois caminhos diferentes:
 *
 *   - `beforeprint` cobre o Ctrl+P e o botão "Imprimir" do site. O evento roda
 *     ANTES da caixa de impressão, e o React tem tempo de reabrir tudo.
 *     `afterprint` desliga de novo quando a caixa fecha.
 *   - `?full=1` cobre o gerador de PDF, que chama `page.pdf()` do Chromium
 *     direto. Esse caminho não dispara `beforeprint`, então esperar por ele
 *     produziria em silêncio um PDF sem currículo dentro. Como aqui não há
 *     `afterprint` para desligar, o parâmetro é lido uma vez e vale para
 *     sempre — é uma URL que existe só para a máquina imprimir.
 *
 * O `afterprint` não é detalhe: sem ele, o currículo reabria na impressão e
 * FICAVA aberto, com o botão "Fechar" sem efeito nenhum — o estado do botão
 * dizia uma coisa e a tela mostrava outra, porque `aberto || imprimindo`
 * continuava verdadeiro pelo segundo termo.
 */
export function usePrintMode(): boolean {
  const forcado =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("full") === "1";

  const [printing, setPrinting] = useState(forcado);

  useEffect(() => {
    if (forcado) return;

    const abrir = () => setPrinting(true);
    const fechar = () => setPrinting(false);

    window.addEventListener("beforeprint", abrir);
    window.addEventListener("afterprint", fechar);
    return () => {
      window.removeEventListener("beforeprint", abrir);
      window.removeEventListener("afterprint", fechar);
    };
  }, [forcado]);

  return printing;
}
