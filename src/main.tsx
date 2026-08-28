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
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
