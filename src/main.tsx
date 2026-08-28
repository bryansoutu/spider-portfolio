import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles.css";
import App from "./App";

/*
 * O projeto do Lovable roda em TanStack Start, com router, servidor e uma
 * camada de captura de erros própria dele. Nada disso é usado: o site tem
 * UMA página e nenhuma chamada de servidor. Aqui ele é montado direto, o que
 * mantém a tela idêntica e tira do caminho um roteador sem rotas.
 */
/*
 * Marca que o JavaScript está vivo. O CSS só esconde os elementos de entrada
 * quando esta classe existe — sem JS, a página nasce legível em vez de
 * invisível para sempre.
 *
 * Isto morava num `<script>` inline no index.html, para rodar antes da
 * primeira pintura. Aqui roda igualmente cedo, e sem o custo de segurança:
 * quando este módulo executa, `#root` ainda está vazio, então não há elemento
 * `.reveal` na página para piscar visível antes de a classe chegar. A árvore
 * do React só é criada na linha seguinte, já com a marca no lugar.
 *
 * O que se ganha: a página fica sem NENHUM script inline, e a política de
 * segurança pode recusar script inline por completo em vez de abrir exceção.
 */
document.documentElement.classList.add("js-reveal");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
