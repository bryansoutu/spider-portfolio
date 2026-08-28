# Segurança do portfólio

O que este site expõe, o que ele não expõe, e por que cada proteção existe.
Escrito para ser lido daqui a seis meses por alguém que vai mexer nos
cabeçalhos sem lembrar o motivo deles.

---

## Primeiro: o que este site NÃO é

Boa parte do que se ensina sobre segurança web não se aplica aqui, e fingir que
se aplica seria pior que não fazer nada — daria uma sensação de proteção contra
um ataque que não existe.

**Não há SQL injection possível.** Não porque esteja bem defendido: porque não
existe banco de dados, não existe servidor, não existe consulta. O site é um
monte de arquivos estáticos — HTML, CSS, JavaScript e imagens — servidos por
uma CDN. Não há nada atrás para injetar. A mesma lógica vale para:

| Ataque | Por que não se aplica |
|---|---|
| SQL / NoSQL injection | não há banco nem consulta |
| Injeção de comando | não há servidor executando nada |
| Autenticação quebrada | não há login, sessão nem cookie |
| CSRF | não há formulário, nem estado a alterar no servidor |
| Vazamento de dados | não há dado de terceiros; tudo que está no site é público de propósito |
| Upload malicioso | não há upload |
| IDOR | não há identificador de recurso nem controle de acesso |

Os contatos (e-mail, WhatsApp, LinkedIn, GitHub) são links diretos, não
formulários. Foi decisão de projeto e tem efeito colateral bom: sem formulário
não há campo de entrada, e sem campo de entrada não há para onde mandar
conteúdo hostil.

## O que sobra, e é onde o trabalho está

Três coisas de verdade:

1. **XSS** — se alguém conseguir fazer script de terceiro rodar nesta origem.
2. **Clickjacking** — embutir o site num iframe invisível para roubar cliques.
3. **Cadeia de suprimentos** — uma dependência comprometida no `npm install`.

### 1. Contra XSS

O código já não oferece o vetor clássico: não há `dangerouslySetInnerHTML`,
`innerHTML`, `eval` nem `new Function` em lugar nenhum do `src/`. Todo texto
passa pelo React, que escapa por padrão.

Em cima disso vem a **Content-Security-Policy** em `vercel.json`, que é a rede
de baixo — ela vale mesmo que um dia alguém escreva o código errado:

```
script-src 'self'
```

Sem `'unsafe-inline'` e sem `'unsafe-eval'`. Só executa JavaScript vindo de
arquivo desta origem. Script injetado numa string, num atributo `onerror=`, ou
por qualquer outro caminho, **não roda**.

Isso só é possível porque a página não tem nenhum script inline. Tinha um: a
linha que marcava `js-reveal` no `<html>` antes da primeira pintura. Ela foi
para o `main.tsx`, onde roda igualmente cedo — quando aquele módulo executa, o
`#root` ainda está vazio, então não há nada na tela para piscar. O ganho foi
poder fechar a política em vez de abrir exceção para ela.

**`style-src` continua com `'unsafe-inline'`, e isso é deliberado.** O React
escreve atributos `style` em elementos vivos: a posição das aranhas, a
inclinação do retrato, a largura da barra de progresso. Atributo de estilo cai
sob `style-src`, então fechá-lo quebraria o site. O risco é muito menor —
injeção de CSS não executa código; no pior caso desconfigura o visual.

### 2. Contra clickjacking

`frame-ancestors 'none'` na CSP, mais `X-Frame-Options: DENY` para navegadores
antigos que não leem a primeira. Ninguém consegue embutir este site num iframe
para sobrepor botões falsos.

### 3. Contra a cadeia de suprimentos

`npm audit` acusa **0 vulnerabilidades**. O site tem apenas duas dependências
de produção — `react` e `react-dom` — e nenhum script de terceiro carregado em
tempo de execução: nada de Google Fonts, nada de analytics, nada de CDN
externa. Confirmado no bundle final: as únicas URLs externas são destinos de
link (`github.com`, `linkedin.com`, `wa.me`), que a CSP nem governa.

`default-src 'self'` com `connect-src 'self'` sela isso: mesmo que uma
dependência comprometida tente mandar dados para fora, o navegador recusa a
conexão.

---

## Os cabeçalhos, um a um

| Cabeçalho | O que compra |
|---|---|
| `Content-Security-Policy` | o item acima — nenhum script de fora executa |
| `X-Content-Type-Options: nosniff` | o navegador não adivinha o tipo do arquivo e executa como script algo que não é |
| `X-Frame-Options: DENY` | clickjacking, para navegadores sem `frame-ancestors` |
| `Referrer-Policy: strict-origin-when-cross-origin` | ao clicar num link externo, o outro site vê só o domínio, não o caminho |
| `Permissions-Policy` | câmera, microfone, localização e mais doze recursos desligados — um portfólio não usa nenhum |
| `Strict-Transport-Security` | vem da Vercel; força HTTPS nas visitas seguintes |
| `Cross-Origin-Opener-Policy` | isola o contexto de navegação de janelas abertas |
| `Cross-Origin-Resource-Policy` | outros sites não podem carregar os recursos daqui |
| `base-uri 'none'` | ninguém reescreve a base das URLs relativas da página |
| `form-action 'none'` | o site não tem formulário; se um for injetado, não envia para lugar nenhum |

E nos links que abrem em nova aba, `rel="noopener noreferrer"` — sem
`noopener`, a página aberta recebe `window.opener` e pode reescrever a aba de
origem para uma cópia falsa. É o tabnabbing. Os navegadores novos já assumem
isso sozinhos, mas a proteção não pode depender da versão do navegador de quem
visita.

---

## Como conferir

```bash
npm run check:headers                      # confere o site no ar
npm run check:headers -- https://outro     # ou outro endereço
```

O script falha com código de saída 1 se algum cabeçalho sumir. **Isto não pode
virar um teste do Playwright junto com os outros**: os cabeçalhos vêm da borda
da Vercel, e o `vite preview` — contra o qual a suíte roda — serve os arquivos
sem nenhum deles. Um teste local passaria feliz com a produção completamente
desprotegida.

## O que continua sendo responsabilidade humana

Nenhum cabeçalho protege contra publicar por engano o que não devia. Vale
lembrar que o repositório é público:

- Não commitar `.env` (já está no `.gitignore`, junto com `.vercel`).
- Não colocar em `src/content/` nada que não possa ser lido por qualquer
  pessoa — o conteúdo do site é público por definição.
- O telefone e o e-mail estão no ar de propósito. É a escolha certa para um
  portfólio que existe para ser contatado, e o custo é receber spam.
