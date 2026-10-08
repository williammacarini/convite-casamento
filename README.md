# Convite de Casamento — Camila & William

Convite digital elegante com animação de **carta se abrindo** (envelope com selo de cera),
100% gratuito e sem dependências externas. Basta abrir o `index.html` no navegador.

## Dados do casamento

| | |
|---|---|
| **Noivos** | Camila & William |
| **Data** | 24 de novembro de 2026 |
| **Cerimônia** | 16h30 (recomendado chegar com antecedência) |
| **Jantar** | a partir das 18h00 |
| **Local** | Porto a Porto Restaurante |
| **Endereço** | Ribeirão da Ilha, Florianópolis – SC |
| **Traje** | Esporte Chique / Formal |

### Recepção
- **Entrada, pratos principais e doces: incluídos**, sem custo adicional
- **Escolha prévia do prato** feita na confirmação de presença
- **Doces** por **Meu Confeito**, doceria da Camila
- **Bebidas cobradas à parte**
- Consumos fora do menu definido pelos noivos poderão ter custo adicional
- **Estacionamento** ao lado e em frente ao restaurante

### Prazo de confirmação
24 de outubro de 2026 (um mês antes).

---

## Como visualizar

**Opção 1 — abrir direto (mais simples)**

Dê um duplo clique em `index.html`.

**Opção 2 — servidor local**

Útil para testar no celular pela mesma rede Wi-Fi:

```bash
cd convite-casamento
python3 -m http.server 8899
```

Depois acesse: <http://127.0.0.1:8899>

---

## Estrutura

```
convite-casamento/
├── index.html        → estrutura da página
├── style.css         → todo o design (envelope, carta, seções)
├── script.js         → animação de abertura, contagem regressiva, RSVP
├── convite.ics       → arquivo "adicionar à agenda"
└── imagens/
    ├── cerimonia.jpg → foto da cerimônia (capa)
    └── salao.jpg     → foto do salão/recepção
```

---

## O que editar

Quase tudo o que muda está no topo do **`script.js`**, no bloco `CONFIG`:

```js
var CONFIG = {
  // Ordem de exibição: Camila & William
  noiva: 'Camila Cristina Goncalves',
  noivo: 'William Prussak Macarini',
  // Nomes juntos, já na ordem de exibição
  casal: 'Camila & William',
  casalCompleto: 'Camila Cristina Goncalves e William Prussak Macarini',
  dataISO: '2026-11-24T16:30:00-03:00',   // cerimônia às 16h30
  local: 'Porto a Porto Restaurante',
  endereco: 'Ribeirão da Ilha, Florianópolis - SC',
  whatsWilliam: '5547999334946',   // William (47) 99933-4946
  whatsCamila:  '5547992769491'    // Camila  (47) 99276-9491
};
```

> Para trocar a ordem dos nomes, edite `casal` e `casalCompleto` aqui e os textos
> correspondentes no `index.html` (título, monogramas, capa, assinatura e rodapé).

Os números de WhatsApp já estão configurados (formato de exibição: **Camila & William**):
**Camila** (47) 99276-9491 · **William** (47) 99933-4946

Formato usado: `55` (Brasil) + `47` (DDD) + número, **apenas dígitos**.

### Trocar as fotos
Substitua os arquivos em `imagens/` mantendo os mesmos nomes (`cerimonia.jpg`, `salao.jpg`).

---

## Seções da página

| Seção | Conteúdo |
|---|---|
| **Abertura** | Envelope com selo de cera → a aba superior abre em 3D → a carta sai de dentro e para, esperando o clique |
| **Capa (hero)** | Nomes completos sobre a foto da cerimônia |
| **Save the Date** | Data + contagem regressiva ao vivo + botões de agenda e "Ver endereço no mapa" |
| **O Cenário** | As duas fotos do Porto a Porto com legendas |
| **Programação** | Linha do tempo (15h45 → 20h00) |
| **Nossa Recepção** | Menu (entrada, pratos, doces), Meu Confeito e aviso sobre bebidas |
| **Detalhes** | Traje, presentes e estacionamento |
| **Citação** | 1 Coríntios 13 + assinatura |
| **RSVP** | Formulário com escolha do prato, enviado via WhatsApp |
| **Rodapé** | Monograma + botão para rever a abertura |

> A página **não tem música** — foi removida a pedido.

---

## Efeitos incluídos

- **Abertura em 2 etapas**: o selo quebra → a aba superior levanta em rotação 3D → a carta sai de dentro do envelope e para, esperando o clique do convidado
- **Pétalas douradas** caindo ao fundo
- **Brilhos** cintilantes
- **Revelação ao rolar** (fade + subida, escalonado)
- **Cortina animada** nas fotos do local
- **Parallax suave** na capa
- **Contagem regressiva** ao vivo
- **Botão "Ver a abertura novamente"** no rodapé

---

## Ajustar a data

A data aparece em **três lugares** — atualize todos:

1. **Contagem regressiva** → `CONFIG.dataISO` no `script.js`
2. **Texto da página** → procure por `05 · Dezembro · 2026` e `05 de Dezembro de 2026` no `index.html`
3. **Arquivo de agenda** → `convite.ics` (datas em formato UTC: `DTSTART`/`DTEND`)

A data atual usada é **05 de dezembro de 2026** (um sábado). Se mudar, confira o dia da semana.

---

## Publicar de graça

Como é um site estático, qualquer host gratuito funciona:

- **Netlify Drop** — <https://app.netlify.com/drop> (arraste a pasta, fica online na hora)
- **Vercel** — <https://vercel.com>
- **GitHub Pages** — suba o repositório e ative Pages nas configurações
- **Cloudflare Pages** — <https://pages.cloudflare.com>

Depois é só compartilhar o link com os convidados. O link funciona bem em celular.

---

## Compatibilidade

Testado em Chrome, Safari, Firefox e Edge (desktop e mobile).
O layout é responsivo para celular (390px), tablet (834px) e desktop (1280px+).
Respeita a preferência **"reduzir movimento"** do sistema operacional — nesse caso
as animações são desativadas automaticamente.

---

## Como funciona a abertura (em 2 etapas)

A abertura agora é **interativa**: ela para no meio e espera o convidado.

### Etapa 1 — o envelope se abre (automático)
1. O selo de cera quebra e cai — `900ms`
2. A aba levanta em rotação 3D — `1700ms`
3. A carta desliza para fora, sobe acima do envelope — `1600ms`
4. A carta **para** e o botão **"Abrir o convite"** aparece, pulsando de leve

A dica embaixo muda de *"Toque no selo para abrir"* para
*"Clique na carta para entrar"*.

### Etapa 2 — o convidado entra (por clique)
A pessoa pode clicar em **qualquer lugar da carta** ou no botão
**"Abrir o convite"**. Aí a carta cresce até tomar a tela e o convite
completo aparece.

> A página **nunca avança sozinha** — ela espera o clique, sem pressa.

---

## Ajustar a velocidade

Os tempos estão numa constante `TEMPO` no topo do `script.js` (em milissegundos):

```js
var TEMPO = {
  selo:   900,   // selo de cera quebra e cai
  aba:    1700,  // aba do envelope levanta (rotação 3D)
  pausa1: 400,   // respiro antes da carta sair
  sair:   1600,  // carta desliza para fora e PARA
  crescer:1900,  // só ao clicar: carta expande e toma a conta
  final:  1000   // crossfade para o convite
};
```

Cada etapa só começa **depois** que a anterior terminou, então a abertura
nunca fica atropelada. Do clique no selo até a carta parar leva cerca de
**4,6 segundos**.

> Se mudar `TEMPO.aba`, ajuste também a transição da aba no `style.css`
> (procure por `1700ms` em `.env-flap`) para os dois ficarem sincronizados.
