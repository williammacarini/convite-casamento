/* Loja de mimos — Camila & William
   Os números de WhatsApp e o texto da mensagem ficam todos neste CONFIG. */
(function () {
  'use strict';

  var CONFIG = {
    // Ordem de exibição: Camila & William
    casal: 'Camila & William',
    // Quem recebe as mensagens dos mimos (código do país + DDD + número, apenas dígitos)
    whatsMimos: '5547999334946', // William
    whatsAlternativo: '5547992769491', // Camila
    // Fecho carinhoso que entra em toda mensagem
    fecho: 'Que essa nova fase seja cheia de amor, felicidade e muitas histórias boas! ❤️',
    // Convite oficial, usado no botão "voltar"
    convite: '../floral/'
  };

  var $ = function (seletor, contexto) { return (contexto || document).querySelector(seletor); };
  var $$ = function (seletor, contexto) { return Array.prototype.slice.call((contexto || document).querySelectorAll(seletor)); };
  var reais = function (valor) { return 'R$ ' + Number(valor).toLocaleString('pt-BR'); };

  function mensagem(nome, valor, sugerido) {
    var valorTexto = Number(valor) === Number(sugerido)
      ? 'no valor sugerido de ' + reais(sugerido)
      : 'no valor de ' + reais(valor);
    return 'Oi, noivos! Quero presentear vocês com *' + nome + '*, ' + valorTexto + '. ' + CONFIG.fecho;
  }

  function linkWhats(numero, texto) {
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
  }

  var cartoes = $$('.mimo');

  /* ---------- Cada mimo: links prontos, valor opcional e mensagem ---------- */
  cartoes.forEach(function (cartao) {
    var nome = cartao.getAttribute('data-nome');
    var sugerido = Number(cartao.getAttribute('data-valor'));
    var botoes = $$('.mimo-acoes [data-destino]', cartao);
    var principal = $('.btn--mimo', cartao);
    var campo = $('.mimo-campo', cartao);
    var entrada = $('input', campo);
    var alternar = $('.mimo-outro', cartao);

    function atualizar() {
      var digitado = Number(entrada.value);
      var valor = digitado > 0 ? digitado : sugerido;
      var texto = mensagem(nome, valor, sugerido);
      botoes.forEach(function (botao) {
        var ehCamila = botao.getAttribute('data-destino') === 'camila';
        botao.href = linkWhats(ehCamila ? CONFIG.whatsAlternativo : CONFIG.whatsMimos, texto);
        botao.setAttribute('aria-label', 'Presentear ' + nome + ' por ' + reais(valor) +
          ' no WhatsApp ' + (ehCamila ? 'da Camila' : 'do William'));
        botao.target = '_blank';
        botao.rel = 'noopener noreferrer';
      });
      if (principal) principal.textContent = digitado > 0 ? 'Presentear por ' + reais(valor) : 'Presentear no WhatsApp';
    }

    alternar.addEventListener('click', function () {
      var aberto = !campo.hidden;
      if (aberto) {
        campo.hidden = true;
        alternar.setAttribute('aria-expanded', 'false');
        alternar.textContent = 'Quero dar outro valor';
        entrada.value = '';
        atualizar();
      } else {
        campo.hidden = false;
        alternar.setAttribute('aria-expanded', 'true');
        alternar.textContent = 'Usar o valor sugerido';
        entrada.focus();
      }
    });
    entrada.addEventListener('input', atualizar);
    atualizar();
  });

  /* ---------- Filtros por categoria, favoritos e busca ---------- */
  var lista = $('#listaMimos');
  var status = $('#filtrosStatus');
  var busca = $('#busca');
  var vazio = $('#semResultado');
  var chips = $$('.chip');
  var total = cartoes.length;
  var filtro = 'todos';

  $('#totalMimos').textContent = String(total);

  function normalizar(texto) {
    return String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function aplicar() {
    var termo = normalizar(busca.value.trim());
    var visiveis = 0;
    cartoes.forEach(function (cartao) {
      var categoria = cartao.getAttribute('data-categoria');
      var favorito = cartao.getAttribute('data-favorito') === 'sim';
      var combinaCategoria = filtro === 'todos' || (filtro === 'favoritos' ? favorito : categoria === filtro);
      var combinaBusca = !termo || normalizar(cartao.textContent).indexOf(termo) >= 0;
      var mostrar = combinaCategoria && combinaBusca;
      cartao.hidden = !mostrar;
      if (mostrar) visiveis++;
    });

    vazio.hidden = visiveis > 0;
    if (!visiveis) {
      status.textContent = 'Nenhum mimo encontrado com esse filtro.';
    } else if (filtro === 'todos' && !termo) {
      status.textContent = 'Mostrando os ' + total + ' mimos.';
    } else {
      var rotulo = filtro === 'todos' ? 'todos os mimos'
        : filtro === 'favoritos' ? 'os mais pedidos'
        : 'a categoria ' + chips.filter(function (chip) { return chip.getAttribute('data-filtro') === filtro; })[0].textContent.trim();
      status.textContent = 'Mostrando ' + visiveis + ' de ' + total + ' mimos (' + rotulo + ').';
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filtro = chip.getAttribute('data-filtro');
      chips.forEach(function (outro) {
        var ativo = outro === chip;
        outro.classList.toggle('is-ativo', ativo);
        outro.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      });
      aplicar();
    });
  });
  busca.addEventListener('input', aplicar);
  aplicar();

  /* ---------- Contatos e link do convite ---------- */
  var contatos = [['#waAlt', CONFIG.whatsAlternativo], ['#waWill', CONFIG.whatsMimos]];
  contatos.forEach(function (par) {
    var link = $(par[0]);
    if (link) link.href = 'https://wa.me/' + par[1];
  });
  $$('[href="../floral/"]').forEach(function (link) { link.href = CONFIG.convite; });
})();
