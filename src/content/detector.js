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
  if (!SELECTORS.adVideo) return false;
  return !!doc.querySelector(SELECTORS.adVideo);
}

function getAdVideo(doc) {
  if (!SELECTORS.adVideoPlayer) return null;
  return doc.querySelector(SELECTORS.adVideoPlayer);
}

function findBanners(doc) {
  if (!SELECTORS.banners.length) return [];
  return Array.from(doc.querySelectorAll(SELECTORS.banners.join(',')));
}

function findUpsellModals(doc) {
  if (!SELECTORS.upsellModals.length) return [];
  return Array.from(doc.querySelectorAll(SELECTORS.upsellModals.join(',')));
}

function findInactivityScreen(doc) {
  if (!SELECTORS.inactivityScreen) return null;
  return doc.querySelector(SELECTORS.inactivityScreen);
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
