/* =========================================================
   CONVITE DE CASAMENTO — Camila & William
   Sequência de abertura do envelope + interações
   ========================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------------
     CONFIGURAÇÃO — edite aqui os dados do casamento
     ------------------------------------------------------- */
  var CONFIG = {
    // Ordem de exibição: Camila & William
    noiva: 'Camila Cristina Goncalves',
    noivo: 'William Prussak Macarini',
    // Nomes juntos, já na ordem de exibição
    casal: 'Camila & William',
    casalCompleto: 'Camila Cristina Goncalves e William Prussak Macarini',
    // Data e hora da cerimônia (horário local de Brasília, UTC-3)
    dataISO: '2026-11-24T16:30:00-03:00',
    local: 'Porto a Porto Restaurante',
    endereco: 'Ribeirão da Ilha, Florianópolis - SC',
    // Opções de prato principal para escolha prévia no RSVP
    pratos: [
      'Risoto Bruxaria',
      'Parmegiana de mignon',
      'Parmegiana de frango'
    ],
    // WhatsApp dos noivos: código do país + DDD + número, apenas dígitos
    whatsWilliam: '5547999334946',
    whatsCamila: '5547992769491'
  };

  /* -------------------------------------------------------
     UTILITÁRIOS
     ------------------------------------------------------- */
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =======================================================
     1. SEQUÊNCIA DE ABERTURA DO ENVELOPE
     ======================================================= */

  var envelopeScene = $('#envelope-scene');
  var envelope      = $('#envelope');
  var envelopeStage = $('.envelope-stage');
  var letterCard    = $('#letterCard');
  var tapHint       = $('#tapHint');
  var invitation    = $('#invitation');

  var jaAbriu = false;
  var revelacaoFeita = false;
  var inicioAbertura = 0;

  /* -------------------------------------------------------
     TEMPOS DA ABERTURA (ms) — ajuste para deixar mais
     lento ou mais rápido. Cada etapa começa depois que a
     anterior terminou, sem sobreposição.
     ------------------------------------------------------- */
  var TEMPO = {
    selo:   900,   // selo de cera quebra e cai
    aba:    1700,  // aba do envelope levanta (rotação 3D)
    pausa1: 400,   // respiro antes da carta sair
    sair:   1600,  // carta desliza para fora e PARA
    crescer:1900,  // só ao clicar: carta expande e toma a conta
    final:  1000   // crossfade para o convite
  };

  /**
   * Etapa 1 — o envelope se abre.
   * O selo quebra, a aba levanta e a carta desliza para fora.
   * A carta PARA aqui, esperando o clique do convidado.
   */
  function abrirEnvelope() {
    if (jaAbriu) return;
    jaAbriu = true;
    inicioAbertura = Date.now();

    document.body.classList.add('is-locked');
    envelopeStage.classList.add('is-opening');

    if (reduceMotion) {
      envelope.classList.add('is-open');
      letterCard.style.opacity = '1';
      letterCard.style.transform = 'translateY(-40%)';
      liberarCarta();
      return;
    }

    // 1) O selo de cera quebra e some
    envelope.classList.add('is-open');

    var tSelo = TEMPO.selo;

    // 2) A carta aparece enquanto a aba ainda termina de levantar
    setTimeout(function () {
      letterCard.style.opacity = '1';
    }, tSelo + TEMPO.aba * 0.5);

    // 3) A carta desliza para fora e PARA, esperando o clique.
    //    Sobe acima do bolso frontal (z-index 7) para o convite
    //    e o botão ficarem totalmente visíveis.
    setTimeout(function () {
      letterCard.style.transition =
        'transform ' + TEMPO.sair + 'ms cubic-bezier(.34,.06,.2,1), ' +
        'opacity 700ms ease';
      letterCard.style.transform = 'translateY(-52%) scale(1.06)';
      letterCard.style.zIndex = '8';
    }, tSelo + TEMPO.aba + TEMPO.pausa1);

    // 4) Quando a carta termina de sair, ela vira o botão
    setTimeout(liberarCarta, tSelo + TEMPO.aba + TEMPO.pausa1 + TEMPO.sair);
  }

  /**
   * A carta parou de sair: agora ela é clicável e o botão
   * "Abrir o convite" fica em destaque, pulsando de leve.
   */
  function liberarCarta() {
    envelopeStage.classList.add('is-ready');

    // Troca a dica para indicar o próximo passo
    // (a visibilidade é controlada por .is-ready no CSS)
    var hintEl = $('.hint-text', tapHint);
    if (hintEl) {
      hintEl.textContent = hintEl.getAttribute('data-depois');
    }
  }

  /**
   * Etapa 2 — disparada pelo clique do convidado.
   * A carta cresce até ocupar a tela e o convite aparece.
   */
  function abrirConvite() {
    if (!jaAbriu) {
      // Se ainda não abriu o envelope, o primeiro clique abre
      abrirEnvelope();
      return;
    }
    if (revelacaoFeita) return;

    // Trava para não disparar duas vezes
    if (envelopeStage.classList.contains('is-revealing')) return;

    if (reduceMotion) {
      revelarConvite();
      return;
    }

    envelopeStage.classList.add('is-revealing');
    envelopeStage.classList.remove('is-ready');

    letterCard.style.transition =
      'transform ' + TEMPO.crescer + 'ms cubic-bezier(.22,.61,.36,1), ' +
      'opacity 700ms ease';
    letterCard.style.transform = 'translateY(-4%) scale(1.62)';
    letterCard.style.zIndex = '12';
    envelopeScene.style.transform = 'scale(1.1)';

    setTimeout(revelarConvite, TEMPO.crescer + TEMPO.final);
  }

  function revelarConvite() {
    if (revelacaoFeita) return;
    revelacaoFeita = true;

    invitation.classList.add('is-shown');
    invitation.setAttribute('aria-hidden', 'false');

    envelopeScene.classList.add('is-gone');

    document.body.classList.remove('is-locked');
    window.scrollTo(0, 0);

    // Mostra imediatamente o que já está na tela
    setTimeout(function () {
      varrerReveals();
      iniciarPetalsBurst();
    }, 260);

    // Limpa a cena do envelope do fluxo depois da transição
    setTimeout(function () {
      envelopeScene.style.display = 'none';
    }, 1200);
  }

  function iniciarPetalsBurst() {
    if (reduceMotion) return;
    var petals = $$('.petal');
    petals.forEach(function (p, i) {
      p.style.animationDelay = (-i * 1.6) + 's';
    });
  }

  // ---------- Etapa 1: o envelope abre ----------
  if (envelope) {
    envelope.addEventListener('click', abrirEnvelope);
    envelope.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrirEnvelope();
      }
    });
  }

  // ---------- Etapa 2: o convidado clica para entrar ----------
  // Depois que a carta sai e para, qualquer clique nela
  // (ou o Enter/Espaço) leva para o convite completo.
  var btnOpenText = $('#btnOpenText');

  if (letterCard) {
    letterCard.addEventListener('click', function (e) {
      e.stopPropagation();
      abrirConvite();
    });

    letterCard.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        abrirConvite();
      }
    });
  }

  if (btnOpenText) {
    btnOpenText.addEventListener('click', function (e) {
      e.stopPropagation();
      abrirConvite();
    });
  }

  // Abre automaticamente se a URL tiver #convite
  if (window.location.hash === '#convite' || window.location.hash === '#invitation') {
    setTimeout(abrirEnvelope, 500);
  }

  // Reabrir a animação
  var btnReplay = $('#btnReplay');
  if (btnReplay) {
    btnReplay.addEventListener('click', function () {
      window.scrollTo(0, 0);
      envelopeScene.style.display = '';
      envelopeScene.style.transform = '';
      document.body.classList.add('is-locked');
      window.scrollTo(0, 0);

      // Reanima a abertura
      jaAbriu = false;
      revelacaoFeita = false;

      // Esconde o convite de novo, para a cena do envelope aparecer limpa
      invitation.classList.remove('is-shown');
      invitation.setAttribute('aria-hidden', 'true');

      // Reseta a carta
      letterCard.style.transition = 'opacity .4s ease, transform .5s ease';
      letterCard.style.transform = 'translateY(0) scale(.98)';
      letterCard.style.opacity = '0';
      letterCard.style.zIndex = '4';
      letterCard.style.width = '';
      letterCard.style.height = '';

      envelope.classList.remove('is-open');
      envelopeScene.classList.remove('is-gone');
      envelopeStage.classList.remove('is-opening', 'is-ready', 'is-revealing');

      // Volta a dica ao texto inicial
      var hintReset = $('.hint-text', tapHint);
      if (hintReset) hintReset.textContent = hintReset.getAttribute('data-antes');

      // Reseta o estado do hero para a animação de entrada rodar de novo
      $$('.reveal').forEach(function (el) { el.classList.remove('is-visible'); });
      $$('.venue-figure, .casal-figure').forEach(function (el) { el.classList.remove('is-revealed'); });

      setTimeout(abrirEnvelope, reduceMotion ? 50 : 950);
    });
  }

  /* =======================================================
     2. REVEAL AO ROLAR
     ======================================================= */

  /**
   * Revela um elemento aplicando a classe correta conforme seu tipo.
   * Usa o índice entre os irmãos para escalonar a animação.
   */
  function revelarEl(el) {
    var irmaos = Array.prototype.slice.call(el.parentNode.children);
    var idx = irmaos.indexOf(el);
    var atraso = Math.min(idx, 4) * 90;

    setTimeout(function () {
      el.classList.add(el.classList.contains('venue-figure') || el.classList.contains('casal-figure')
        ? 'is-revealed'
        : 'is-visible');
    }, atraso);
  }

  /**
   * Varre a página e revela tudo que já entrou na viewport.
   * É a fonte de verdade — funciona mesmo quando o
   * IntersectionObserver não dispara (layout com cena fixa,
   * transformações ou navegação por hash).
   */
  function varrerReveals() {
    var vh = window.innerHeight;

    $$('.reveal').forEach(function (el) {
      if (el.classList.contains('is-visible')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > -60) revelarEl(el);
    });

    $$('.venue-figure, .casal-figure').forEach(function (el) {
      if (el.classList.contains('is-revealed')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > -60) revelarEl(el);
    });
  }

  /**
   * Rede de segurança: garante que nada fique invisível para sempre.
   * Depois de um tempo, revela tudo que ainda estiver pendente.
   */
  function revelarTudoPendente() {
    $$('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    $$('.venue-figure, .casal-figure').forEach(function (el) { el.classList.add('is-revealed'); });
  }

  // Revela conforme o usuário rola (com rAF para não travar)
  var scrollRaf = false;
  window.addEventListener('scroll', function () {
    if (scrollRaf) return;
    scrollRaf = true;
    requestAnimationFrame(function () {
      varrerReveals();
      scrollRaf = false;
    });
  }, { passive: true });

  window.addEventListener('resize', varrerReveals, { passive: true });

  // Revela o que já está visível assim que a página carrega
  window.addEventListener('load', varrerReveals);
  varrerReveals();

  /* =======================================================
     3. CONTAGEM REGRESSIVA
     ======================================================= */

  var elDias = $('#cdDays');
  var elHoras = $('#cdHours');
  var elMins = $('#cdMins');
  var elSecs = $('#cdSecs');

  var alvo = new Date(CONFIG.dataISO).getTime();

  function doisDigitos(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function atualizarContagem() {
    var agora = Date.now();
    var diff = alvo - agora;

    if (isNaN(alvo)) return;

    if (diff <= 0) {
      if (elDias)  elDias.textContent  = '00';
      if (elHoras) elHoras.textContent = '00';
      if (elMins)  elMins.textContent  = '00';
      if (elSecs)  elSecs.textContent  = '00';
      return;
    }

    var seg = Math.floor(diff / 1000);
    var dias  = Math.floor(seg / 86400);
    var horas = Math.floor((seg % 86400) / 3600);
    var mins  = Math.floor((seg % 3600) / 60);
    var secs  = seg % 60;

    if (elDias)  elDias.textContent  = doisDigitos(dias);
    if (elHoras) elHoras.textContent = doisDigitos(horas);
    if (elMins)  elMins.textContent  = doisDigitos(mins);
    if (elSecs)  elSecs.textContent  = doisDigitos(secs);
  }

  if (elDias) {
    atualizarContagem();
    setInterval(atualizarContagem, 1000);
  }

  /* =======================================================
     4. RSVP → WhatsApp
     ======================================================= */

  var form = $('#rsvpForm');

  if (form) {
    var elPresenca = $('#presenca');
    var elAcompanhantes = $('#acompanhantes');
    var campoPratos = $('#campoPratos');
    var pratosLista = $('#pratosLista');

    /**
     * Monta um seletor de prato para cada pessoa:
     * o próprio convidado + a quantidade de acompanhantes.
     */
    function montarPratos() {
      if (!pratosLista) return;

      var acompanhantes = parseInt((elAcompanhantes && elAcompanhantes.value) || '0', 10);
      if (isNaN(acompanhantes) || acompanhantes < 0) acompanhantes = 0;
      if (acompanhantes > 10) acompanhantes = 10;

      var total = acompanhantes + 1;   // convidado + acompanhantes

      // Guarda o que já foi escolhido, para não perder ao mudar a quantidade
      var anteriores = [];
      $$('.prato-select', pratosLista).forEach(function (sel) {
        anteriores.push(sel.value);
      });

      pratosLista.innerHTML = '';

      for (var i = 0; i < total; i++) {
        var linha = document.createElement('div');
        linha.className = 'prato-linha';

        var rotulo = document.createElement('span');
        rotulo.className = 'prato-rotulo';
        rotulo.textContent = i === 0 ? 'Você' : 'Acompanhante ' + i;

        var sel = document.createElement('select');
        sel.className = 'prato-select';
        sel.setAttribute('aria-label', 'Prato principal — ' + rotulo.textContent);

        var vazio = document.createElement('option');
        vazio.value = '';
        vazio.textContent = 'Selecione o prato';
        sel.appendChild(vazio);

        (CONFIG.pratos || []).forEach(function (nomePrato) {
          var opt = document.createElement('option');
          opt.value = nomePrato;
          opt.textContent = nomePrato;
          sel.appendChild(opt);
        });

        if (anteriores[i]) sel.value = anteriores[i];

        linha.appendChild(rotulo);
        linha.appendChild(sel);
        pratosLista.appendChild(linha);
      }
    }

    // A escolha dos pratos só faz sentido para quem vai comparecer
    function ajustarCampoPratos() {
      if (!campoPratos || !elPresenca) return;
      var vai = elPresenca.value.indexOf('Sim') === 0;
      campoPratos.classList.toggle('is-hidden', !vai);
      if (vai) montarPratos();
    }

    if (elPresenca) elPresenca.addEventListener('change', ajustarCampoPratos);
    if (elAcompanhantes) elAcompanhantes.addEventListener('input', montarPratos);
    if (elAcompanhantes) elAcompanhantes.addEventListener('change', montarPratos);

    ajustarCampoPratos();

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nome = ($('#nome') && $('#nome').value.trim()) || '';
      var presenca = ($('#presenca') && $('#presenca').value) || 'Sim, estarei presente';
      var acompanhantes = (elAcompanhantes && elAcompanhantes.value) || '0';
      var recado = ($('#recado') && $('#recado').value.trim()) || '';

      if (nome.length < 3) {
        alert('Por favor, informe seu nome completo.');
        $('#nome').focus();
        return;
      }

      var vaiComparecer = presenca.indexOf('Sim') === 0;

      // Coleta os pratos escolhidos, um por pessoa
      var escolhas = $$('.prato-select', pratosLista).map(function (sel) {
        return sel.value;
      });

      if (vaiComparecer) {
        var faltando = escolhas.some(function (v) { return !v; });
        if (faltando) {
          alert('Por favor, escolha o prato principal de cada pessoa.');
          var vazios = $$('.prato-select', pratosLista).filter(function (s) { return !s.value; });
          if (vazios[0]) vazios[0].focus();
          return;
        }
      }

      var linhas = [
        '*Confirmação de Presença*',
        'Casamento de ' + CONFIG.casal,
        '',
        'Nome: ' + nome,
        'Presença: ' + presenca
      ];

      if (vaiComparecer) {
        linhas.push('Acompanhantes: ' + acompanhantes);
        linhas.push('Pratos escolhidos:');
        escolhas.forEach(function (prato, i) {
          linhas.push('  • ' + (i === 0 ? 'Convidado' : 'Acompanhante ' + i) + ': ' + prato);
        });
      }
      if (recado) {
        linhas.push('');
        linhas.push('Recado: ' + recado);
      }

      var texto = encodeURIComponent(linhas.join('\n'));
      var url = 'https://wa.me/' + CONFIG.whatsWilliam + '?text=' + texto;

      window.open(url, '_blank', 'noopener');

      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        var original = btn.textContent;
        btn.textContent = 'Obrigado! ✓';
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = original;
          btn.disabled = false;
        }, 3200);
      }
    });
  }

  // Links diretos de WhatsApp
  var waW = $('#waWilliam');
  var waC = $('#waCamila');
  if (waW) waW.href = 'https://wa.me/' + CONFIG.whatsWilliam;
  if (waC) waC.href = 'https://wa.me/' + CONFIG.whatsCamila;

  /* =======================================================
     6. PARALLAX SUAVE NO HERO
     ======================================================= */

  if (!reduceMotion) {
    var heroBg = $('.hero-bg img');
    var ticking = false;

    window.addEventListener('scroll', function () {
      if (ticking || !heroBg) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.pageYOffset;
        if (y < window.innerHeight * 1.2) {
          heroBg.style.transform = 'translate3d(0,' + (y * 0.22) + 'px,0) scale(1.06)';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* =======================================================
     7. FALLBACK: se a animação travar, libera a carta
     ======================================================= */

  // Se por algum motivo a carta não for liberada (erro de
  // animação, aba do navegador em segundo plano etc.),
  // garante que o convidado consiga clicar para entrar.
  setInterval(function () {
    if (jaAbriu && !revelacaoFeita &&
        !envelopeStage.classList.contains('is-ready') &&
        !envelopeStage.classList.contains('is-revealing')) {
      var decorrido = Date.now() - inicioAbertura;
      if (decorrido > TEMPO.selo + TEMPO.aba + TEMPO.pausa1 + TEMPO.sair + 2500) {
        liberarCarta();
      }
    }
  }, 1000);

})();
