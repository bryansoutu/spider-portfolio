import { defineConfig, devices } from "@playwright/test";

/**
 * Os testes rodam contra o BUILD DE PRODUÇÃO, servido pelo `vite preview`, e
 * não contra o servidor de desenvolvimento.
 *
 * A razão é um defeito real que este projeto já teve: uma linha com
 * `process.env`, resquício do Next.js, quebrava a página em desenvolvimento e
 * passava batido no build, porque o Vite removia a constante por tree-shaking.
 * O inverso também existe — código que funciona em dev e some no build.
 *
 * Testar o artefato que vai para a Vercel é a única forma de os testes
 * falharem pelas mesmas razões que o site falharia para o visitante. O teste
 * `dev.spec.ts` cobre o outro lado, exercitando o servidor de desenvolvimento.
 */
const PORT = 4173;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : [["list"]],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    /*
     * Reduzir movimento no navegador de teste.
     *
     * Não é conforto: é determinismo. A cortina de abertura, o fundo animado e
     * as aranhas rodam `requestAnimationFrame` sem parar, e uma página que
     * nunca fica quieta faz qualquer espera por estabilidade estourar. Com a
     * preferência ligada, o site desliga o próprio movimento — o mesmo caminho
     * que um visitante com sensibilidade a movimento percorre.
     *
     * Os testes que precisam do movimento ligado (as aranhas, a abertura)
     * sobrescrevem isso no próprio arquivo.
     */
    reducedMotion: "reduce",
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],

  webServer: {
    command: `npm run build && npx vite preview --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
