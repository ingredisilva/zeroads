// Funções puras de detecção de elementos de anúncio — sem dependências de Chrome API.
// Prefixo atvwebplayersdk-* é do SDK do player — semântico e estável (não gerado dinamicamente).

const SELECTORS = {
  // Presente no DOM somente enquanto um anúncio (pre-roll ou mid-roll) está em reprodução.
  // aria-label confirma o estado: "Anúncio publicitário em reprodução."
  adVideo: '.atvwebplayersdk-ad-timer',

  // Elemento <video> do player — manipulado para pular o anúncio via currentTime.
  adVideoPlayer: '.atvwebplayersdk-video-surface video',

  // Elementos promocionais na página de detalhes e dentro do player durante anúncio.
  // TODO: adicionar seletores de overlays/banners de display (não presentes no snapshot atual —
  // capturar com conta free-tier que exibe anúncios de display sobre o player).
  banners: [
    '.dv-signup-button',                   // CTA "Assista sem anúncios" no ATF da página de detalhes
    '.atvwebplayersdk-go-ad-free-button',   // botão "Assista sem anúncios" dentro do player durante anúncio
  ],

  // Modal sitewide de upgrade de plano (renderizado vazio, disparado dinamicamente).
  upsellModals: [
    '[data-automation-id="crossbenefit-modal-wrapper"]',
  ],

  // TODO: tela "Continuar assistindo?" — não encontrada neste snapshot de DOM.
  // Capturar após ~90 min de inatividade no player para identificar o seletor.
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
