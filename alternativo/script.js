/* =========================================================
   CONVITE — VERSÃO ALTERNATIVA
   Abertura do envelope + contagem regressiva + RSVP
   Camila & William · 24 de Novembro de 2026
   ========================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------------
     CONFIGURAÇÃO
     ------------------------------------------------------- */
  var CONFIG = {
    casal: 'Camila & William',
    dataISO: '2026-11-24T16:30:00-03:00',
    pratos: [
      'Risoto Bruxaria',
      'Parmegiana de mignon',
      'Parmegiana de frango'
    ],
    whatsWilliam: '5547999334946',
    whatsCamila: '5547992769491'
  };

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* =======================================================
     1. ABERTURA DO ENVELOPE
     ======================================================= */

  var cena       = $('#cenaEnvelope');
  var palco      = $('.palco');
  var envelope   = $('#envelope');
  var cartao     = $('#cartao');
  var dica       = $('#dica');
  var dicaTexto  = $('#dicaTexto');
  var convite    = $('#convite');

  var TEMPO = { selo: 420, aba: 820, pausa: 180, sair: 850, crescer: 850, fim: 650 };

  var abriu = false;
  var revelou = false;

  function abrirEnvelope() {
    if (abriu) return;
    abriu = true;

    document.body.classList.add('travado');
    palco.classList.add('abrindo');
    envelope.classList.add('aberto');

    if (reduzir) {
      cartao.style.opacity = '1';
      cartao.style.transform = 'translateY(-46%)';
      liberarCartao();
      return;
    }

    var t = TEMPO.selo;

    setTimeout(function () { cartao.style.opacity = '1'; }, t + TEMPO.aba * 0.5);

    setTimeout(function () {
      cartao.style.transform = 'translateY(-52%)';
      cartao.style.zIndex = '8';
    }, t + TEMPO.aba + TEMPO.pausa);

    setTimeout(liberarCartao, t + TEMPO.aba + TEMPO.pausa + TEMPO.sair);
  }

  function liberarCartao() {
    palco.classList.add('pronto');
    if (dicaTexto) dicaTexto.textContent = 'Clique na carta para entrar';
  }

  function abrirConvite() {
    if (!abriu) { abrirEnvelope(); return; }
    if (revelou) return;
    if (palco.classList.contains('revelando')) return;

    if (reduzir) { revelar(); return; }

    palco.classList.add('revelando');
    palco.classList.remove('pronto');

    cartao.style.transition =
      'transform ' + TEMPO.crescer + 'ms cubic-bezier(.22,.61,.36,1), opacity 600ms ease';
    cartao.style.transform = 'translateY(-50%) scale(1.06)';
    cartao.style.zIndex = '12';

    setTimeout(revelar, TEMPO.crescer + TEMPO.fim);
  }

  function revelar() {
    if (revelou) return;
    revelou = true;

    convite.classList.add('visivel');
    convite.setAttribute('aria-hidden', 'false');
    cena.classList.add('saiu');

    document.body.classList.remove('travado');
    window.scrollTo(0, 0);

    setTimeout(function () { varrer(); }, 260);
    setTimeout(function () { cena.style.display = 'none'; }, 1100);
  }

  if (envelope) {
    envelope.addEventListener('click', abrirEnvelope);
    envelope.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirEnvelope(); }
    });
  }

  var btnAbrir = $('#btnAbrir');
  if (btnAbrir) {
    btnAbrir.addEventListener('click', function (e) { e.stopPropagation(); abrirConvite(); });
  }
  if (cartao) {
    cartao.addEventListener('click', function (e) { e.stopPropagation(); abrirConvite(); });
  }

  // Rever a abertura
  var btnRever = $('#btnRever');
  if (btnRever) {
    btnRever.addEventListener('click', function () {
      window.scrollTo(0, 0);
      cena.style.display = '';
      document.body.classList.add('travado');

      abriu = false; revelou = false;

      cartao.style.transition = 'opacity .4s ease, transform .5s ease';
      cartao.style.transform = 'translateY(0)';
      cartao.style.opacity = '0';
      cartao.style.zIndex = '4';

      envelope.classList.remove('aberto');
      cena.classList.remove('saiu');
      palco.classList.remove('abrindo', 'pronto', 'revelando');
      convite.classList.remove('visivel');
      convite.setAttribute('aria-hidden', 'true');

      if (dicaTexto) dicaTexto.textContent = 'Toque no selo para abrir';
      $$('.rev').forEach(function (el) { el.classList.remove('ativo'); });

      setTimeout(abrirEnvelope, reduzir ? 50 : 900);
    });
  }


  /* =======================================================
     2. REVELAÇÃO AO ROLAR
     ======================================================= */

  // Marca os elementos que devem animar
  $$('.bloco .eyebrow, .bloco .titulo-script, .bloco .texto, .bloco .aviso, .bloco .versiculo, .bloco .aspas, .bloco .contagem, .bloco .acoes, .cartao-info, .colagem, .foto-larga, .local-info, .paleta, .paleta-nota, .form, .form-nota, .contato, .menu-item, .rodape-versiculo').forEach(function (el) {
    el.classList.add('rev');
  });

  function varrer() {
    var vh = window.innerHeight;
    $$('.rev').forEach(function (el, i) {
      if (el.classList.contains('ativo')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > -60) {
        setTimeout(function () { el.classList.add('ativo'); }, Math.min(i % 6, 4) * 80);
      }
    });
  }

  var rolando = false;
  window.addEventListener('scroll', function () {
    if (rolando) return;
    rolando = true;
    requestAnimationFrame(function () { varrer(); rolando = false; });
  }, { passive: true });

  window.addEventListener('resize', varrer, { passive: true });
  window.addEventListener('load', varrer);
  varrer();


  /* =======================================================
     3. CONTAGEM REGRESSIVA
     ======================================================= */

  var elDias = $('#cgDias'), elHoras = $('#cgHoras'), elMin = $('#cgMin'), elSeg = $('#cgSeg');
  var alvo = new Date(CONFIG.dataISO).getTime();

  function dois(n) { return n < 10 ? '0' + n : String(n); }

  function contar() {
    if (isNaN(alvo)) return;
    var diff = alvo - Date.now();
    if (diff <= 0) {
      if (elDias) elDias.textContent = '00';
      if (elHoras) elHoras.textContent = '00';
      if (elMin) elMin.textContent = '00';
      if (elSeg) elSeg.textContent = '00';
      return;
    }
    var s = Math.floor(diff / 1000);
    if (elDias)  elDias.textContent  = dois(Math.floor(s / 86400));
    if (elHoras) elHoras.textContent = dois(Math.floor((s % 86400) / 3600));
    if (elMin)   elMin.textContent   = dois(Math.floor((s % 3600) / 60));
    if (elSeg)   elSeg.textContent   = dois(s % 60);
  }

  if (elDias) { contar(); setInterval(contar, 1000); }


  /* =======================================================
     4. RSVP → WhatsApp
     ======================================================= */

  var form = $('#formRsvp');

  if (form) {
    var elPresenca = $('#presenca');
    var elAcomp = $('#acompanhantes');
    var campoPratos = $('#campoPratos');
    var listaPratos = $('#pratosLista');

    function montarPratos() {
      if (!listaPratos) return;

      var n = parseInt((elAcomp && elAcomp.value) || '0', 10);
      if (isNaN(n) || n < 0) n = 0;
      if (n > 10) n = 10;
      var total = n + 1;

      var antes = $$('.prato-sel', listaPratos).map(function (s) { return s.value; });
      listaPratos.innerHTML = '';

      for (var i = 0; i < total; i++) {
        var linha = document.createElement('div');
        linha.className = 'prato-linha';

        var rot = document.createElement('span');
        rot.className = 'prato-rot';
        rot.textContent = i === 0 ? 'Você' : 'Acompanhante ' + i;

        var sel = document.createElement('select');
        sel.className = 'prato-sel';
        sel.setAttribute('aria-label', 'Prato principal — ' + rot.textContent);

        var vazio = document.createElement('option');
        vazio.value = '';
        vazio.textContent = 'Selecione o prato';
        sel.appendChild(vazio);

        CONFIG.pratos.forEach(function (p) {
          var o = document.createElement('option');
          o.value = p; o.textContent = p;
          sel.appendChild(o);
        });

        if (antes[i]) sel.value = antes[i];

        linha.appendChild(rot);
        linha.appendChild(sel);
        listaPratos.appendChild(linha);
      }
    }

    function ajustarPratos() {
      if (!campoPratos || !elPresenca) return;
      var vai = elPresenca.value.indexOf('Sim') === 0;
      campoPratos.classList.toggle('escondido', !vai);
      if (vai) montarPratos();
    }

    if (elPresenca) elPresenca.addEventListener('change', ajustarPratos);
    if (elAcomp) {
      elAcomp.addEventListener('input', montarPratos);
      elAcomp.addEventListener('change', montarPratos);
    }
    ajustarPratos();

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nome = ($('#nome') && $('#nome').value.trim()) || '';
      var presenca = (elPresenca && elPresenca.value) || 'Sim, estarei presente';
      var acomp = (elAcomp && elAcomp.value) || '0';
      var recado = ($('#recado') && $('#recado').value.trim()) || '';
      var vai = presenca.indexOf('Sim') === 0;

      if (nome.length < 3) {
        alert('Por favor, informe seu nome completo.');
        $('#nome').focus();
        return;
      }

      var escolhas = $$('.prato-sel', listaPratos).map(function (s) { return s.value; });

      if (vai && escolhas.some(function (v) { return !v; })) {
        alert('Por favor, escolha o prato principal de cada pessoa.');
        var vazios = $$('.prato-sel', listaPratos).filter(function (s) { return !s.value; });
        if (vazios[0]) vazios[0].focus();
        return;
      }

      var linhas = [
        '*Confirmação de Presença*',
        'Casamento de ' + CONFIG.casal,
        '',
        'Nome: ' + nome,
        'Presença: ' + presenca
      ];

      if (vai) {
        linhas.push('Acompanhantes: ' + acomp);
        linhas.push('Pratos escolhidos:');
        escolhas.forEach(function (p, i) {
          linhas.push('  • ' + (i === 0 ? 'Convidado' : 'Acompanhante ' + i) + ': ' + p);
        });
      }
      if (recado) { linhas.push(''); linhas.push('Recado: ' + recado); }

      window.open('https://wa.me/' + CONFIG.whatsWilliam + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');

      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        var orig = btn.textContent;
        btn.textContent = 'Obrigado! ✓';
        btn.disabled = true;
        setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 3200);
      }
    });
  }

  var waC = $('#waCamila'), waW = $('#waWilliam');
  if (waC) waC.href = 'https://wa.me/' + CONFIG.whatsCamila;
  if (waW) waW.href = 'https://wa.me/' + CONFIG.whatsWilliam;

})();
