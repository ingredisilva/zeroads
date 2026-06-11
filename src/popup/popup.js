// Popup UI — lê estado fresco do service worker a cada abertura.
// Sem estado em memória: o popup fecha e reabre a cada clique no ícone.

function getStatusText(enabled) {
}

function getToggleLabel(enabled) {
}

function formatCounts(counts) {
}

function renderState(state, elements) {
}

// Inicialização no navegador
if (typeof module === 'undefined') {
  var elements = {
    status: document.getElementById('status'),
    toggle: document.getElementById('toggle'),
    counts: document.getElementById('counts'),
  };

  chrome.runtime.sendMessage({ action: 'getState' }, function (state) {
    renderState(state, elements);
  });

  elements.toggle.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'getState' }, function (state) {
      chrome.runtime.sendMessage({ action: 'setState', enabled: !state.enabled }, function () {
        chrome.runtime.sendMessage({ action: 'getState' }, function (next) {
          renderState(next, elements);
        });
      });
    });
  });
}

if (typeof module !== 'undefined') {
  module.exports = { getStatusText, getToggleLabel, formatCounts, renderState };
}
