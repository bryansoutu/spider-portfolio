# spider-portfolio

Portfólio de Bryan Souto — preto e branco, com a teia tecida em canvas.

**No ar:** https://spider-portfolio-lime.vercel.app

## De onde veio

O visual nasceu de um esboço gerado no Lovable ("Spider Portfolio"). Estes
arquivos são os originais de lá, sem alteração de estilo:

- `src/styles.css` — o design system inteiro
- `src/components/WebBackground.tsx` — a teia em canvas que segue o cursor
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

npm run images      # regenera os .webp a partir dos originais
npm run resume:pdf  # gera public/curriculo-bryan-souto.pdf da própria página
```

## Publicar

```bash
npx vercel deploy --prod --yes --scope bryan-projects1
```

O `--scope` não é opcional: sem ele a CLI publica na conta pessoal em vez do
time onde os outros projetos vivem.

## Decisões que não devem ser desfeitas sem motivo

**O conteúdo é bilíngue nos dados, publicado só em português.** Cada texto em
`src/content/` existe em PT e EN, e o compilador recusa a compilação se faltar
uma tradução (`Localized<T>` em `src/lib/types.ts`). O site renderiza o idioma
de `src/lib/locale.ts`. Ligar o inglês é acrescentar um seletor — não é
reescrever conteúdo.

**O currículo é uma seção, não uma rota.** O site é de uma página só; abrir um
roteador para um documento custaria mais do que entrega.

**O PDF é derivado da página, nunca um arquivo à parte.** É o conserto do
problema que fez o currículo anterior parar em maio de 2025: o documento era
separado, o trabalho continuou e ele não.

**Nível de habilidade sempre escrito por extenso.** A paleta é monocromática e
não sobra matiz para três níveis; a distinção visual é o traço da borda, mas o
rótulo textual é o que garante a leitura (WCAG 1.4.1).

**Sem formulário de contato.** Exigiria backend, antispam e um caminho de
falha silenciosa — a mensagem que "foi enviada" e nunca chegou — para entregar
menos que um link direto.

## Armadilhas já pagas

Estão comentadas no código, mas vale a lista:

- `@media print` com `header { display: none }` escondia também o `<header>`
  de identificação DENTRO do currículo — o PDF saía sem nome nem contato.
- Esconder com `visibility: hidden` mantém a altura: imprimia páginas em
  branco depois do documento.
- O container raiz tem fundo escuro, e sem zerá-lo o papel saía preto sobre
  preto.
- `.reveal` deixa o elemento invisível até o observador rodar. Sem JavaScript,
  ou com o observador congelado (o Chrome faz isso em aba de segundo plano), a
  página ficava em branco. Daí a classe `js-reveal` escrita no `<head>` e o
  prazo de segurança no `App.tsx`.
- O Loader contava ticks de `setInterval`. Em aba de segundo plano o Chrome
  estrangula timers e a abertura de 2s virava 10s ou mais. Hoje ele mede tempo
  decorrido e tem teto absoluto.

## O que falta

- Domínio próprio (hoje é o endereço `.vercel.app`)
- Versão em inglês (o conteúdo já existe)
- Repositório no GitHub
