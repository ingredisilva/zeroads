// Service worker MV3 — gerencia estado global e coordena abas.
// Encerra quando ocioso: todo estado persiste em chrome.storage.local.

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason !== 'install') return;
  chrome.storage.local.set(
    { enabled: true, counts: { video: 0, banner: 0 } },
    function () {}
  );
});

chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {
  if (message.action === 'getState') {
    chrome.storage.local.get(['enabled', 'counts'], function (state) {
      sendResponse(state);
    });
    return true; // mantém canal aberto para resposta assíncrona
  }

  if (message.action === 'setState') {
    chrome.storage.local.get(['counts'], function (current) {
      const next = { enabled: message.enabled, counts: current.counts };
      chrome.storage.local.set(next, function () {
        _notifyTabs(message.enabled ? 'enable' : 'disable');
        _updateIcon(message.enabled);
      });
    });
  }

  if (message.action === 'incrementCount') {
    chrome.storage.local.get(['counts'], function (current) {
      const counts = Object.assign({}, current.counts);
      counts[message.type] = (counts[message.type] || 0) + 1;
      chrome.storage.local.set({ counts }, function () {
        const total = counts.video + counts.banner;
        chrome.action.setBadgeText({ text: total > 0 ? String(total) : '' });
      });
    });
  }
});

function _notifyTabs(action) {
  chrome.tabs.query({ url: '*://*.primevideo.com/*' }, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, { action });
    });
  });
}

function _updateIcon(enabled) {
  chrome.action.setIcon({
    path: enabled
      ? { 16: 'icons/icon-16.png', 48: 'icons/icon-48.png', 128: 'icons/icon-128.png' }
      : { 16: 'icons/icon-16-off.png', 48: 'icons/icon-48-off.png', 128: 'icons/icon-128-off.png' },
  });
}

// Expõe funções internas para testes
if (typeof module !== 'undefined') {
  module.exports = { _notifyTabs, _updateIcon };
}
