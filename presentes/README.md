# Loja Oficial de Presentes dos Noivos

Página de presentes simbólicos do casamento de **Camila & William** (24 de novembro de 2026).
O convidado escolhe um presente, ajusta o valor se quiser e o botão abre o WhatsApp com a
mensagem pronta. **Nenhum pagamento é processado aqui** e nenhum dado do convidado é guardado.

- Página: <https://williammacarini.github.io/convite-casamento/presentes/>
- QR Code impresso no convite: `assets/qr-mimos.svg`
- Seção no convite floral: `#mimos` em `../floral/index.html`

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `index.html` | Os 35 presentes, a capa, os filtros e os textos, além do sprite de ilustrações. Cada presente é um `<article class="mimo">`. |
| `style.css` | Identidade visual: papel de algodão, flores em aquarela e as cores do convite. |
| `script.js` | **Configuração** (números, fecho da mensagem), filtros, busca e valor livre. |
| `assets/qr-mimos.svg` | QR Code que aponta para esta página (gerado localmente). |
| `validar-mimos.mjs` | Verificação automatizada da página e da integração com o convite. |

Fontes, textura de papel e flores vêm de `../floral/assets/`, os mesmos arquivos do convite.

## Configurar o WhatsApp

Tudo fica no topo de `script.js`:

```js
var CONFIG = {
  casal: 'Camila & William',
  whatsMimos: '5547999334946',      // botão "Chamar o William"
  whatsAlternativo: '5547992769491', // botão "Chamar a Camila"
  fecho: 'Que essa nova fase seja cheia de amor, felicidade e muitas histórias boas! ❤️',
  convite: '../floral/'
};
```

O número é sempre **código do país + DDD + número, só dígitos** (Brasil: `55` + `47` + número).
Os números atuais vieram do convite oficial: William `5547999334946` e Camila `5547992769491`.

Depois de trocar o número, rode uma vez:

```bash
node ferramentas/preencher-links-mimos.mjs
```

Isso regrava os links direto no HTML, para a página continuar funcionando mesmo sem JavaScript.
O JavaScript atualiza os links sozinho em tempo de execução, então sem esse passo só quem estiver
com o JavaScript desligado veria o número antigo.

## Mensagem enviada

Os botões **Chamar o William** e **Chamar a Camila** abrem `https://wa.me/<numero>?text=<mensagem>` com:

> Oi, noivos! Quero presentear vocês com \*Nome do mimo\*, no valor sugerido de R$ 180.
> Que essa nova fase seja cheia de amor, felicidade e muitas histórias boas! ❤️

Se o convidado usar **Quero dar outro valor**, a mensagem passa a dizer `no valor de R$ 300` e o
botão principal vira `Chamar o William · R$ 300`.

## Editar a lista de presentes

Cada presente é um bloco assim, dentro de `index.html`:

```html
<article class="mimo" data-categoria="comidas" data-nome="Costela do Noivo" data-valor="180">
  <div class="mimo-topo"><span class="mimo-icone mimo-icone--comidas" aria-hidden="true"><svg class="mimo-svg" aria-hidden="true" focusable="false"><use href="#ico-costela"></use></svg></span><span class="mimo-selo">Mais pedido</span></div>
  <h3 class="mimo-nome">Costela do Noivo</h3>
  <p class="mimo-desc">Descrição engraçada e carinhosa.</p>
  <p class="mimo-valor">Valor sugerido <strong>R$ 180</strong></p>
  <div class="mimo-acoes">
    <a class="btn btn--mimo" data-wa data-destino="william" href="#">Chamar o William</a>
    <a class="btn btn--mimo-alt" data-wa data-destino="camila" href="#">Chamar a Camila</a>
    <button class="btn btn--texto mimo-outro" type="button" aria-expanded="false">Quero dar outro valor</button>
  </div>
  <div class="mimo-campo" hidden>
    <label for="valor-exemplo">Seu valor (R$) <span>opcional, é só uma sugestão</span></label>
    <input type="number" id="valor-exemplo" min="1" step="5" inputmode="numeric" placeholder="180">
  </div>
</article>
```

Regras rápidas:

- `data-categoria`: `comidas`, `viagens`, `casa`, `brincadeiras`, `romanticos` ou `premium`.
- `data-valor`: número puro, sem pontos (o `R$` é escrito à mão no texto).
- `data-favorito="sim"` cria o selo **Mais pedido** e entra no filtro ❤️.
- `data-nome` precisa ser igual ao nome mostrado no `<h3>`: é ele que vai na mensagem e escolhe a ilustração.
- A ilustração vem do sprite no topo do arquivo: o `<use href="#ico-...">` do card aponta para um `<symbol id="ico-...">`. Para trocar o desenho de um presente, mude o `href` do card ou o conteúdo do símbolo (viewBox 0 0 64 64, traço de 2,3 na cor verde).
- O `id` do campo de valor precisa ser único na página.
- Depois de qualquer edição, rode `node ferramentas/preencher-links-mimos.mjs`.
- O total de presentes aparece no texto da seção de filtros (procure por `id="totalMimos"`).

## Como gerar o QR Code

O QR é gerado localmente, sem serviço externo e sem dependências:

```bash
node ferramentas/gerar-qrcode.mjs \
  --url "https://williammacarini.github.io/convite-casamento/presentes/" \
  --out presentes/assets/qr-mimos.svg
```

- Sai um SVG (fundo `#fffaf1` e módulos `#254a3c`, as cores do convite), com margem de 4 módulos.
- Correção de erro **M (15%)** e versão escolhida automaticamente (esta URL usa a versão 4, 33×33).
- Para conferir se o QR está legível, decodifique o arquivo com qualquer leitor de QR Code do
  celular. Durante o desenvolvimento ele foi validado com o framework Vision (macOS), que leu
  exatamente a URL acima.
- Se mudar o endereço da página, gere de novo e substitua o arquivo: o convite usa esse mesmo
  arquivo em `../presentes/assets/qr-mimos.svg`.

## Verificar antes de publicar

```bash
python3 -m http.server 8899        # na raiz do projeto
node presentes/validar-mimos.mjs   # 8 verificações: links, filtros, valor livre, responsivo e QR
```

As prévias ficam em `presentes/previas/` (pasta local, fora do site publicado).

## O que ainda depende de vocês

1. **Nome da loja**: hoje é "Loja Oficial de Presentes dos Noivos". Alternativas: *Presentes & Maré*,
   *Carrinho de Presentes C&W*, *Loja de Presentes do Nosso Casamento*.
2. **Número que recebe**: cada presente tem os dois botões (William e Camila), então o convidado escolhe.
3. **Pix ou conta**: se quiserem facilitar a contribuição, é só informar a chave para colocarmos
   um texto na página. Nada foi inventado aqui.
4. **Valores**: as faixas atuais vão de R$ 20 a R$ 500. Se quiserem limitar ou trocar algum mimo,
   é uma linha por mimo.
