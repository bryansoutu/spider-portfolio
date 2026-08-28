/**
 * Confere os cabeçalhos de segurança do site NO AR.
 *
 * Isto não pode ser um teste do Playwright junto com os outros: os cabeçalhos
 * vêm de `vercel.json`, que só existe na borda da Vercel. O `vite preview`,
 * contra o qual a suíte roda, serve os arquivos sem nenhum deles — um teste
 * local passaria feliz com a produção completamente desprotegida.
 *
 * Uso:
 *   npm run check:headers
 *   npm run check:headers -- https://outro-endereco
 */

const ALVO = process.argv[2] ?? "https://bryansoutodev.vercel.app";

/**
 * Cada regra tem um `porque` porque cabeçalho de segurança é o tipo de coisa
 * que alguém remove no futuro para "resolver" um problema, sem saber o que
 * estava sendo comprado.
 */
const REGRAS = [
  {
    header: "content-security-policy",
    exige: [
      ["script-src 'self'", "sem 'unsafe-inline': script injetado não executa, venha de onde vier"],
      ["object-src 'none'", "bloqueia <object> e <embed>, portas antigas de execução"],
      ["base-uri 'none'", "impede reescrever a base das URLs relativas da página"],
      ["frame-ancestors 'none'", "ninguém embute este site num iframe para enganar o visitante"],
      ["form-action 'none'", "o site não tem formulário; se aparecer um injetado, não envia"],
    ],
    proibe: [
      ["'unsafe-eval'", "eval em produção anula metade da política"],
      ["script-src 'self' 'unsafe-inline'", "liberar script inline devolve o XSS"],
    ],
  },
  {
    header: "x-content-type-options",
    igual: "nosniff",
    porque: "impede o navegador de adivinhar o tipo e executar como script algo que não é",
  },
  {
    header: "x-frame-options",
    igual: "DENY",
    porque: "clickjacking, para navegadores que ainda não leem frame-ancestors",
  },
  {
    header: "referrer-policy",
    igual: "strict-origin-when-cross-origin",
    porque: "os sites de terceiros não recebem o caminho completo de onde a pessoa veio",
  },
  {
    header: "strict-transport-security",
    contem: "max-age=",
    porque: "força HTTPS nas visitas seguintes, sem passar por http nem uma vez",
  },
  {
    header: "permissions-policy",
    contem: "geolocation=()",
    porque: "câmera, microfone e localização desligados — um portfólio não usa nenhum",
  },
];

const resposta = await fetch(ALVO, { redirect: "follow" });
const headers = Object.fromEntries(
  [...resposta.headers.entries()].map(([k, v]) => [k.toLowerCase(), v])
);

console.log(`\nCabeçalhos de ${ALVO}  (HTTP ${resposta.status})\n`);

let falhas = 0;
const anota = (ok, texto, porque) => {
  if (!ok) falhas++;
  console.log(`  ${ok ? "ok  " : "FALHA"}  ${texto}`);
  if (!ok && porque) console.log(`         ↳ ${porque}`);
};

for (const regra of REGRAS) {
  const valor = headers[regra.header];

  if (!valor) {
    anota(false, `${regra.header} — ausente`, regra.porque);
    continue;
  }
  if (regra.igual) {
    anota(valor.toLowerCase() === regra.igual.toLowerCase(), `${regra.header}: ${valor}`, regra.porque);
  }
  if (regra.contem) {
    anota(valor.includes(regra.contem), `${regra.header} contém "${regra.contem}"`, regra.porque);
  }
  for (const [trecho, porque] of regra.exige ?? []) {
    anota(valor.includes(trecho), `CSP exige "${trecho}"`, porque);
  }
  for (const [trecho, porque] of regra.proibe ?? []) {
    anota(!valor.includes(trecho), `CSP não pode ter "${trecho}"`, porque);
  }
}

/* O cache dos arquivos com hash no nome pode e deve ser eterno. */
const html = await resposta.text();
const asset = html.match(/\/assets\/[A-Za-z0-9._-]+\.js/)?.[0];
if (asset) {
  const r = await fetch(new URL(asset, ALVO));
  const cache = r.headers.get("cache-control") ?? "";
  anota(
    cache.includes("immutable"),
    `cache de ${asset}: ${cache || "(vazio)"}`,
    "o nome do arquivo já contém o hash do conteúdo; sem 'immutable' o navegador revalida à toa"
  );
}

console.log(
  falhas === 0
    ? "\n✓ todos os cabeçalhos no lugar\n"
    : `\n✗ ${falhas} problema(s)\n`
);
process.exit(falhas === 0 ? 0 : 1);
