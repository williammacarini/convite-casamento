# Versão 03 — Jardim em aquarela

Convite de casamento de **Camila & William**, inspirado em papelaria floral: textura de papel de algodão, flores multicoloridas, envelope fúcsia, detalhes dourados e verde escuro.

O conteúdo foi reaproveitado do convite principal. As versões principal e alternativa permanecem preservadas.

## Visualizar

Abra `index.html` diretamente no navegador, ou inicie um servidor na raiz do projeto:

```bash
python3 -m http.server 8899
```

- Nova versão: <http://127.0.0.1:8899/floral/>.
- Comparação das três versões: <http://127.0.0.1:8899/comparar.html>.
- Conteúdo sem a abertura: <http://127.0.0.1:8899/floral/#invitation>.
- Confirmação de presença: <http://127.0.0.1:8899/floral/#rsvp>.

Fontes, fotos e ilustrações são locais. Os links de mapa e WhatsApp precisam de internet.

## Dados do casamento

- **Camila Cristina Goncalves e William Prussak Macarini**.
- **24 de novembro de 2026**, cerimônia às **16h00** e jantar a partir das **18h00**.
- **Porto a Porto Restaurante**, Ribeirão da Ilha, Florianópolis, SC.
- Confirmação até **24 de outubro de 2026**.
- Mesmos textos da história, versículos, fotos reais, programação, traje, presentes, estacionamento, agenda e contatos do convite principal.

A data foi conferida no HTML, configuração e agenda do principal. Um trecho antigo do README da versão principal ainda menciona dezembro.

## Ajustes desta versão

- Textura de papel nas superfícies claras, incluindo abertura, carta, molduras e formulário.
- Foto maior na capa, nomes juntos e uma única contagem regressiva sob **Save the Date**.
- As duas fotos da história mantêm a composição diagonal, somente com as molduras, sem flores.
- Na capa do celular, a frase **Com a bênção de Deus** começa 20 px abaixo do topo, livre das flores do canto.
- O versículo de Mateus 19:6 aparece sozinho depois das fotos, sem o bloco de data.
- O versículo de Colossenses deu lugar ao convite: **Você é nosso convidado para celebrar esse dia conosco e continuar essa caminhada ao nosso lado.**
- Nenhum travessão no convite: os separadores são o ponto médio, a vírgula ou o ponto.
- A aba do envelope tem uma única superfície. O selo sai, a aba abre e uma única carta sobe atrás dos bolsos. O convidado toca na carta para entrar.
- Cliques repetidos não reiniciam a abertura. Pular e repetir cancelam os temporizadores anteriores.
- Botão para pular, navegação pelo teclado e preferência por movimento reduzido. Sem música.

## Recepção e confirmação

O menu mantém os três pratos principais: **Risoto Bruxaria**, **Parmegiana de mignon** e **Parmegiana de frango**. O ingrediente retirado do risoto e o item de queijo removido do menu seguem o ajuste aprovado pelos noivos.

As entradas aparecem em itens separados: pastel de carne, queijo e camarão; parmesão e provolone; salame italiano; pães artesanais; pastinha de salmão; pastinha de azeitona; pastinha de frango.

Entrada, pratos principais e doces da **Meu Confeito** estão incluídos. Bebidas são cobradas à parte pelo restaurante.

O RSVP solicita nome, presença, quantidade de acompanhantes, prato por pessoa e recado opcional. Valida a quantidade inteira entre 0 e 10 e mantém escolhas ao ajustar os acompanhantes. Quem não comparecer não precisa escolher pratos.

A confirmação prepara uma mensagem para o WhatsApp de William. **O convidado precisa enviar a mensagem no WhatsApp para concluir.** Um link de recuperação aparece caso a janela não abra. O site não envia mensagens automaticamente nem armazena respostas.

## Arquivos

- `index.html`, `style.css` e `script.js`: site floral.
- `convite.ics`: agenda original, com os mesmos lembretes.
- `assets/floral-aquarela.webp`: decoração floral.
- `assets/papel-algodao.webp`: textura de papel.
- `assets/fonts.css` e `assets/font-*.ttf`: famílias tipográficas locais.
- `assets/licenses/`: licenças das fontes.
- `../imagens/`: fotos reais compartilhadas com o principal.
- `previas/`: somente as três imagens utilizadas pela página de comparação.

Ilustração floral e textura criadas com imagegen. Nenhuma foto de pessoas foi gerada.

## Validação local

Foram aprovadas 30 verificações em Chrome, incluindo abertura e seus estados intermediários, cliques repetidos, cancelamento, teclado, movimento reduzido, agenda, mapa, contagem, mensagens de RSVP e composição responsiva de 320 a 1440 px.

O menu, seletores e mensagens preparados respeitam as alterações aprovadas. Os testes interceptaram a abertura do WhatsApp e não enviaram mensagens. Os arquivos das duas versões anteriores foram conferidos byte a byte.

Scripts de diagnóstico, relatórios e prévias adicionais permanecem locais e não fazem parte da entrega do site.
