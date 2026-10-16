/* Third local version. Wedding data is copied verbatim from the main invitation. */
(function () {
  'use strict';
  var CONFIG = {
    // Ordem de exibição: Camila & William
    noiva: 'Camila Cristina Goncalves',
    noivo: 'William Prussak Macarini',
    // Nomes juntos, já na ordem de exibição
    casal: 'Camila & William',
    casalCompleto: 'Camila Cristina Goncalves e William Prussak Macarini',
    // Data e hora da cerimônia (horário local de Brasília, UTC-3)
    dataISO: '2026-11-24T16:00:00-03:00',
    local: 'Porto a Porto Restaurante',
    endereco: 'Ribeirão da Ilha, Florianópolis - SC',
    // Opções de prato principal para escolha prévia no RSVP
    pratos: [
      'Risoto Bruxaria',
      'Parmegiana de mignon',
      'Parmegiana de frango',
      'Menu Kids (feito no dia)'
    ],
    // WhatsApp dos noivos: código do país + DDD + número, apenas dígitos
    whatsWilliam: '5547999334946',
    whatsCamila: '5547992769491'
  };
  var $ = function (selector, context) { return (context || document).querySelector(selector); };
  var $$ = function (selector, context) { return Array.from((context || document).querySelectorAll(selector)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var opening = $('#opening');
  var invitation = $('#invitation');
  var nav = $('.invite-nav');
  var floating = $('.floating-rsvp');
  var envelope = $('#envelope');
  var seal = $('#openEnvelope');
  var letter = $('#letterCard');
  var openButton = $('#btnOpenText');
  var hint = $('#openingHint');
  var stage = 'closed';
  var timer;

  function revealInvitation() {
    clearTimeout(timer);
    stage = 'revealed';
    envelope.dataset.phase = stage;
    opening.hidden = true;
    invitation.inert = false;
    nav.inert = false;
    floating.inert = false;
    document.body.classList.remove('is-opening');
    window.scrollTo(0, 0);
    invitation.focus({ preventScroll: true });
  }

  function showOpening() {
    clearTimeout(timer);
    stage = 'closed';
    envelope.className = 'envelope is-resetting';
    envelope.dataset.phase = 'closed';
    void envelope.offsetWidth;
    envelope.classList.remove('is-resetting');
    seal.disabled = false;
    letter.inert = true;
    invitation.inert = true;
    nav.inert = true;
    floating.inert = true;
    opening.hidden = false;
    document.body.classList.add('is-opening');
    hint.textContent = 'Toque no selo para abrir';
    window.scrollTo(0, 0);
  }

  function readyLetter() {
    if (stage !== 'sliding') return;
    stage = 'ready';
    envelope.dataset.phase = stage;
    envelope.classList.add('is-ready');
    letter.inert = false;
    hint.textContent = 'Clique na carta para entrar';
    openButton.focus({ preventScroll: true });
  }

  function liftLetter() {
    if (stage !== 'opening') return;
    stage = 'sliding';
    envelope.dataset.phase = stage;
    envelope.classList.add('is-flap-open', 'is-sliding');
    timer = setTimeout(readyLetter, reduced ? 0 : 1000);
  }

  function liftFlap() {
    if (stage !== 'unsealing') return;
    stage = 'opening';
    envelope.dataset.phase = stage;
    envelope.classList.add('is-opening-flap');
    // Switch the single flap surface to its lining only after it turns away.
    timer = setTimeout(function () {
      if (stage !== 'opening') return;
      envelope.classList.add('is-lining');
      timer = setTimeout(liftLetter, reduced ? 0 : 520);
    }, reduced ? 0 : 480);
  }

  function openEnvelope() {
    if (stage !== 'closed') return;
    stage = 'unsealing';
    envelope.dataset.phase = stage;
    seal.disabled = true;
    envelope.classList.add('is-unsealed');
    hint.textContent = 'Seu convite está chegando…';
    timer = setTimeout(liftFlap, reduced ? 0 : 320);
  }

  seal.addEventListener('click', openEnvelope);
  openButton.addEventListener('click', function () { if (stage === 'ready') revealInvitation(); });
  letter.addEventListener('click', function () { if (stage === 'ready') revealInvitation(); });
  $('#skipOpening').addEventListener('click', revealInvitation);
  $('.skip-link').addEventListener('click', function (e) { e.preventDefault(); revealInvitation(); });
  $('#btnReplay').addEventListener('click', function () {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    showOpening();
    seal.focus({ preventScroll: true });
  });

  // Direct links allow a guest to reach RSVP or a section without replaying the envelope.
  if (window.location.hash) {
    revealInvitation();
    var target = $(window.location.hash === '#convite' ? '#invitation' : window.location.hash);
    if (target) requestAnimationFrame(function () { target.scrollIntoView({ behavior: 'instant' }); });
  } else {
    showOpening();
  }

  if ('IntersectionObserver' in window && !reduced) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && stage === 'revealed') {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    $$('.reveal').forEach(function (el) { observer.observe(el); });
  }
  if ('IntersectionObserver' in window) {
    var rsvpObserver = new IntersectionObserver(function (entries) {
      floating.classList.toggle('at-rsvp', entries[0].isIntersecting);
    }, { threshold: .04 });
    rsvpObserver.observe($('#rsvp'));
  }

  var weddingTime = new Date(CONFIG.dataISO).getTime();
  function updateCountdown() {
    var seconds = Math.max(0, Math.floor((weddingTime - Date.now()) / 1000));
    var values = [Math.floor(seconds / 86400), Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60];
    ['cdDays', 'cdHours', 'cdMins', 'cdSecs'].forEach(function (id, i) { $('#' + id).textContent = String(values[i]).padStart(2, '0'); });
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  $('#waWilliam').href = 'https://wa.me/' + CONFIG.whatsWilliam;
  $('#waCamila').href = 'https://wa.me/' + CONFIG.whatsCamila;

  var form = $('#rsvpForm');
  var nameInput = $('#nome');
  var companions = $('#acompanhantes');
  var attendance = $('#presenca');
  var dishField = $('#campoPratos');
  var dishList = $('#pratosLista');
  var status = $('#formStatus');
  var retry = $('#waRetry');

  function willAttend() { return attendance.value.indexOf('Sim') === 0; }
  function renderDishes() {
    var previous = $$('.prato-select', dishList).map(function (select) { return select.value; });
    var count = Number(companions.value);
    if (!Number.isInteger(count) || count < 0 || count > 10) return;
    dishList.replaceChildren();
    for (var i = 0; i <= count; i++) {
      var row = document.createElement('div');
      row.className = 'prato-linha';
      var label = document.createElement('label');
      label.className = 'prato-rotulo';
      label.textContent = i === 0 ? 'Você' : 'Acompanhante ' + i;
      label.htmlFor = 'prato-' + i;
      var select = document.createElement('select');
      select.id = 'prato-' + i;
      select.name = 'prato-' + i;
      select.className = 'prato-select';
      select.setAttribute('aria-label', 'Prato principal: ' + label.textContent);
      select.required = willAttend();
      var placeholder = new Option('Selecione o prato', '');
      select.add(placeholder);
      CONFIG.pratos.forEach(function (dish) { select.add(new Option(dish, dish)); });
      if (previous[i]) select.value = previous[i];
      row.append(label, select);
      dishList.append(row);
    }
  }
  function adjustAttendance() {
    var attending = willAttend();
    dishField.hidden = !attending;
    companions.disabled = !attending;
    $$('.prato-select', dishList).forEach(function (select) { select.disabled = !attending; select.required = attending; });
    if (attending) renderDishes();
  }
  companions.addEventListener('input', renderDishes);
  attendance.addEventListener('change', adjustAttendance);
  renderDishes();
  adjustAttendance();

  function showError(message, field) {
    status.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.focus();
  }
  form.addEventListener('input', function () {
    status.textContent = '';
    retry.hidden = true;
    $$('[aria-invalid]', form).forEach(function (el) { el.removeAttribute('aria-invalid'); });
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    retry.hidden = true;
    var name = nameInput.value.trim();
    var count = Number(companions.value);
    if (name.length < 3) { showError('Por favor, informe seu nome completo.', nameInput); return; }
    if (willAttend() && (!companions.value || !Number.isInteger(count) || count < 0 || count > 10)) {
      showError('Informe uma quantidade de acompanhantes entre 0 e 10.', companions); return;
    }
    var choices = $$('.prato-select', dishList);
    var missing = choices.find(function (select) { return !select.value; });
    if (willAttend() && missing) { showError('Por favor, escolha o prato principal de cada pessoa.', missing); return; }
    var lines = ['*Confirmação de Presença*', 'Casamento de ' + CONFIG.casal, '', 'Nome: ' + name, 'Presença: ' + attendance.value];
    if (willAttend()) {
      lines.push('Acompanhantes: ' + count, 'Pratos escolhidos:');
      choices.forEach(function (select, i) { lines.push('  • ' + (i === 0 ? 'Convidado' : 'Acompanhante ' + i) + ': ' + select.value); });
    }
    var message = $('#recado').value.trim();
    if (message) lines.push('', 'Recado: ' + message);
    var url = 'https://wa.me/' + CONFIG.whatsWilliam + '?text=' + encodeURIComponent(lines.join('\n'));
    retry.href = url;
    retry.hidden = false;
    window.open(url, '_blank', 'noopener,noreferrer');
    status.textContent = 'Sua mensagem está pronta. Envie no WhatsApp para concluir a confirmação. Se a janela não abriu, use o link abaixo.';
  });
})();
