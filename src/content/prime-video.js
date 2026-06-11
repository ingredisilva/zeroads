// Content script injetado em primevideo.com.
// Lê o estado ao iniciar — não depende de mensagem que pode ter sido perdida.
//
// Padrão de objeto: chamadas internas passam por `primeVideo.<método>`,
// permitindo que jest.spyOn intercepte corretamente nos testes.

var _observer = null;

var primeVideo = {
  startObserver: function () {
    if (_observer) return;
    _observer = new MutationObserver(function (_mutations) {
      // T08/T09: detecção implementada após T06 (inspeção do DOM)
    });
    _observer.observe(document.body, { childList: true, subtree: true });
  },

  stopObserver: function () {
    if (!_observer) return;
    _observer.disconnect();
    _observer = null;
  },

  handleMessage: function (message) {
    if (message.action === 'disable') primeVideo.stopObserver();
    if (message.action === 'enable') primeVideo.startObserver();
  },

  init: function () {
    chrome.storage.local.get(['enabled'], function (state) {
      if (state.enabled !== false) primeVideo.startObserver();
    });
    chrome.runtime.onMessage.addListener(primeVideo.handleMessage);
  },
};

if (typeof module === 'undefined') {
  primeVideo.init();
}

if (typeof module !== 'undefined') {
  module.exports = primeVideo;
}
