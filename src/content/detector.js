// Funções puras de detecção de elementos de anúncio — sem dependências de Chrome API.
// Seletores marcados como null serão preenchidos na T06 (inspeção do DOM).

const SELECTORS = {
  adVideo: null,
  adVideoPlayer: null,
  banners: [],
  upsellModals: [],
  inactivityScreen: null,
  catalogModal: null, // elemento LEGÍTIMO — jamais bloquear (cenários 2.3 e 6.2 da spec)
};

function isAdVideoPlaying(doc) {
}

function getAdVideo(doc) {
}

function findBanners(doc) {
}

function findUpsellModals(doc) {
}

function findInactivityScreen(doc) {
}

if (typeof module !== 'undefined') {
  module.exports = {
    SELECTORS,
    isAdVideoPlaying,
    getAdVideo,
    findBanners,
    findUpsellModals,
    findInactivityScreen,
  };
}
