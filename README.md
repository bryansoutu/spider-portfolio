# spider-portfolio

Portfólio de Bryan Souto — fundo preto, teia desenhada em canvas e um vermelho
só de destaque.

**No ar:** https://bryansoutodev.vercel.app

Bilíngue (PT/EN), uma página, sem backend. O currículo é uma seção desta mesma
página, e o PDF é impresso dela.

## De onde veio

O visual nasceu de um esboço gerado no Lovable ("Spider Portfolio"). Estes
arquivos vieram de lá e foram evoluindo desde então:

- `src/styles.css` — o design system
- `src/components/WebBackground.tsx` — a teia em canvas
- `src/components/Loader.tsx` — a abertura "Tecendo a teia"

O Lovable gera o projeto em TanStack Start, com router, servidor e uma camada
própria de captura de erros. Nada disso é usado: o site tem uma página só e
nenhuma chamada de servidor, então ele roda em Vite puro.

O conteúdo é real e tipado em `src/content/` — nada aqui é texto de exemplo.

## Rodar

```bash
npm install
npm run dev         # http://localhost:5173
npm run build       # verifica tipos e gera dist/
npm run preview     # serve o build
npm test            # 82 testes, em desktop e celular
```

Geradores — todos derivam de uma fonte única, nenhum arquivo é mantido à mão:

```bash
npm run images      # .webp do retrato + capturas em várias larguras
npm run favicon     # .ico e apple-touch-icon a partir de public/favicon.svg
npm run og          # a imagem de compartilhamento, 1200x630
npm run resume:pdf  # os PDFs do currículo, nos dois idiomas, da própria página
```

## Publicar

```bash
npx vercel deploy --prod --yes --scope bryan-projects1
npm run check:headers   # confere os cabeçalhos de segurança NO AR
```

O `--scope` não é opcional: sem ele a CLI publica na conta pessoal em vez do
time onde os outros projetos vivem.

O `check:headers` é um script separado, e não um teste, porque os cabeçalhos
vêm da borda da Vercel — o servidor local não os aplica, e um teste local
passaria feliz com a produção desprotegida.

## Testes

82, em Chrome desktop e em celular, rodando contra o **build de produção** —
que é o artefato publicado. Um arquivo (`tests/dev.spec.ts`) faz o contrário e
sobe o servidor de desenvolvimento, porque este projeto já teve um defeito que
quebrava só em dev e passava batido no build.

Eles não cobrem "tudo": cobrem, um por um, os defeitos que este site já teve.
Cada teste carrega no comentário a data e o motivo.

Duas lições estão embutidas neles, e as duas custaram caro:

- **Testar o resultado visível, não a intenção do código.** Um teste que
  conferia `aria-pressed` passava verde enquanto a imagem não trocava no
  celular. Hoje ele mede a opacidade das duas imagens.
- **Não dar ao navegador um tempo que o usuário não dá.** Um teste esperava
  400ms depois de disparar `beforeprint`, e por isso não via que
  `window.print()` é síncrono e a folha saía em branco.

## Decisões que não devem ser desfeitas sem motivo

**O conteúdo é bilíngue nos dados.** Cada texto em `src/content/` existe em PT
e EN, e o compilador recusa a compilação se faltar uma tradução (`Localized<T>`
em `src/lib/types.ts`). A paridade de idiomas é garantida pelo tipo, não por
disciplina.

**O padrão é português, e não o idioma do navegador.** O público é vaga no
Brasil; quem chega de fora usa o seletor no cabeçalho. Detectar
automaticamente errava para o caso comum — navegador em inglês é frequente em
máquina de desenvolvedor.

**O currículo é uma seção, não uma rota.** O site é de uma página só; abrir um
roteador para um documento custaria mais do que entrega.

**O PDF é derivado da página, nunca um arquivo à parte.** É o conserto do
problema que fez o currículo anterior parar em maio de 2025: o documento era
separado, o trabalho continuou e ele não.

**O corpo do currículo fica sempre no DOM**, escondido por CSS quando fechado.
`window.print()` é síncrono: depender de o React reagir a tempo fazia a folha
sair em branco.

**Nível de habilidade sempre escrito por extenso.** A distinção visual é o
traço da borda; o rótulo textual é o que garante a leitura (WCAG 1.4.1).

**O vermelho marca o que é interativo, e só isso.** Ele não significa "nível
alto" nas habilidades — cor com dois sentidos obriga quem lê a adivinhar qual
vale em cada lugar. O verde existe num ponto só, o sinal de disponibilidade.

**Sem formulário de contato.** Exigiria backend, antispam e um caminho de
falha silenciosa — a mensagem que "foi enviada" e nunca chegou — para entregar
menos que um link direto.

## Segurança

`docs/seguranca.md` explica cada cabeçalho e por que ele existe — inclusive
por que SQL injection não se aplica aqui (não há banco, servidor nem
formulário) e o que sobra de risco real.

O resumo: `script-src 'self'`, sem `unsafe-inline` e sem `unsafe-eval`. Isso só
é possível porque a página não tem **nenhum** script inline.

## Armadilhas já pagas

Estão comentadas no código, no ponto exato onde importam. As que mais custaram:

- `overflow-x: hidden` no container raiz cria um contêiner de rolagem e
  **desliga** `position: sticky`. O cabeçalho subia junto com a página.
  Solução: `overflow-x: clip`.
- Um `process.env` herdado do Next.js quebrava a página **só em
  desenvolvimento** — no build o Vite removia a constante por tree-shaking, e
  em dev o módulo estourava ao carregar. Tela preta, sem erro visível.
- Limiar único para encolher o cabeçalho vira gangorra: encolher deslocava
  44px e a fronteira estava a 40px, então o efeito desfazia a própria causa.
  Solução: histerese, com limiares diferentes para ir e voltar.
- Callback recriado a cada render reinicia o efeito do filho. A cortina de
  abertura ficava de pé enquanto a pessoa rolasse a página.
- Centralizar com `translate(-50%)` **dentro** de um elemento que gira: ao
  virar 180°, o deslocamento inverte de sinal. A aranha aparecia pendurada ao
  lado do fio, não nele.
- `@media print` com `header { display: none }` escondia também o `<header>`
  de identificação DENTRO do currículo — o PDF saía sem nome nem contato.

## Documentação

- `docs/seguranca.md` — o que o site expõe e o que não expõe
- `docs/resumos/` — o diário do projeto, em linguagem simples

## O que falta

- Domínio próprio (hoje é o endereço `.vercel.app`)
