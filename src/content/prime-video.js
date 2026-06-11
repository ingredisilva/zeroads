// Content script injetado em primevideo.com.
// Lê o estado ao iniciar — não depende de mensagem que pode ter sido perdida.

var _observer = null;

function startObserver() {
  if (_observer) return;
  _observer = new MutationObserver(function (_mutations) {
    // Lógica de detecção será implementada em T08 e T09
    // após os seletores serem mapeados em T06
  });
  _observer.observe(document.body, { childList: true, subtree: true });
}

function stopObserver() {
  if (!_observer) return;
  _observer.disconnect();
  _observer = null;
}

function handleMessage(message) {
  if (message.action === 'disable') stopObserver();
  if (message.action === 'enable') startObserver();
}

function init() {
  chrome.storage.local.get(['enabled'], function (state) {
    if (state.enabled !== false) startObserver();
  });
  chrome.runtime.onMessage.addListener(handleMessage);
}

// Auto-inicializa apenas no contexto do navegador (não durante testes)
if (typeof module === 'undefined') {
  init();
}

if (typeof module !== 'undefined') {
  module.exports = { init, startObserver, stopObserver, handleMessage };
}
