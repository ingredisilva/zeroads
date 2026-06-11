// Content script injetado em primevideo.com.
// Lê o estado ao iniciar — não depende de mensagem que pode ter sido perdida.
//
// Padrão de objeto: chamadas internas passam por `primeVideo.<método>`,
// permitindo que jest.spyOn intercepte corretamente nos testes.
//
// _detector: em testes (Node) carregado via require; em browser, detector.js é
// injetado antes deste script (content_scripts no manifest) e expõe os mesmos
// nomes como funções globais.

var _detector = typeof module !== 'undefined'
  ? require('./detector')
  : { isAdVideoPlaying: isAdVideoPlaying, getAdVideo: getAdVideo, findBanners: findBanners, findUpsellModals: findUpsellModals };

var _observer = null;

var primeVideo = {
  startObserver: function () {
    if (_observer) return;
    _observer = new MutationObserver(function () {
      if (_detector.isAdVideoPlaying(document)) {
        primeVideo._skipAdVideo();
      }
    });
    _observer.observe(document.body, { childList: true, subtree: true });
  },

  stopObserver: function () {
    if (!_observer) return;
    _observer.disconnect();
    _observer = null;
  },

  // RF01: avança o currentTime do player para o fim do anúncio.
  // Guard: só age se o vídeo tem duração conhecida e ainda não chegou ao fim.
  _skipAdVideo: function () {
    var video = _detector.getAdVideo(document);
    if (!video || !video.duration || video.currentTime >= video.duration) return;
    video.currentTime = video.duration;
    chrome.runtime.sendMessage({ action: 'incrementCount', type: 'video' });
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
