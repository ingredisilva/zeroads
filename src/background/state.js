// Funções puras de gerenciamento de estado — sem dependências de Chrome API.
// Testáveis de forma isolada. Usadas pelo service worker via cópia local.

function createInitialState() {
}

function applyToggle(state) {
}

function incrementCount(state, type) {
}

if (typeof module !== 'undefined') {
  module.exports = { createInitialState, applyToggle, incrementCount };
}
