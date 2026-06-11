// Funções puras de gerenciamento de estado — sem dependências de Chrome API.
// Testáveis de forma isolada. Usadas pelo service worker via cópia local.

function createInitialState() {
  return { enabled: true, counts: { video: 0, banner: 0 } };
}

function applyToggle(state) {
  return Object.assign({}, state, { enabled: !state.enabled });
}

function incrementCount(state, type) {
  var counts = Object.assign({}, state.counts, { [type]: (state.counts[type] || 0) + 1 });
  return Object.assign({}, state, { counts: counts });
}

if (typeof module !== 'undefined') {
  module.exports = { createInitialState, applyToggle, incrementCount };
}
