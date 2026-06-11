// Popup UI — lê estado fresco do service worker a cada abertura.
// Sem estado em memória: o popup fecha e reabre a cada clique no ícone.

function getStatusText(enabled) {
  return enabled ? 'Ativo' : 'Inativo';
}

function getToggleLabel(enabled) {
  return enabled ? 'Desativar' : 'Ativar';
}

function formatCounts(counts) {
  return counts.video + ' vídeos · ' + counts.banner + ' banners';
}

function renderState(state, elements) {
  elements.status.textContent = getStatusText(state.enabled);
  elements.toggle.textContent = getToggleLabel(state.enabled);
  elements.counts.textContent = formatCounts(state.counts);
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
