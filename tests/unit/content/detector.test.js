/**
 * @jest-environment jsdom
 */

const {
  SELECTORS,
  isAdVideoPlaying,
  getAdVideo,
  findBanners,
  findUpsellModals,
  findInactivityScreen,
} = require('../../../src/content/detector.js');

beforeEach(() => {
  document.body.innerHTML = '';
});

// ─── SELECTORS shape ────────────────────────────────────────────────────────

describe('SELECTORS', () => {
  it('exporta objeto de seletores', () => {
    expect(SELECTORS).toBeDefined();
    expect(typeof SELECTORS).toBe('object');
  });

  it('inclui seletor para catalogModal (elemento legítimo — não bloquear)', () => {
    expect('catalogModal' in SELECTORS).toBe(true);
  });

  it('adVideo aponta para elemento semântico do SDK do player', () => {
    expect(SELECTORS.adVideo).toBe('.atvwebplayersdk-ad-timer');
  });

  it('adVideoPlayer aponta para o <video> dentro do surface do player', () => {
    expect(SELECTORS.adVideoPlayer).toBe('.atvwebplayersdk-video-surface video');
  });

  it('banners contém seletores dos CTAs de upgrade exibidos durante anúncios', () => {
    expect(SELECTORS.banners).toContain('.atvwebplayersdk-go-ad-free-button');
  });

  it('upsellModals contém seletor do modal cross-benefit', () => {
    expect(SELECTORS.upsellModals).toContain('[data-automation-id="crossbenefit-modal-wrapper"]');
  });
});

// ─── isAdVideoPlaying ────────────────────────────────────────────────────────

describe('isAdVideoPlaying', () => {
  it('retorna false quando nenhum elemento de anúncio está no DOM', () => {
    expect(isAdVideoPlaying(document)).toBe(false);
  });

  it('retorna true quando o container do timer de anúncio está presente', () => {
    document.body.innerHTML = `
      <div class="atvwebplayersdk-ad-timer" aria-label="Anúncio publicitário em reprodução.">
        <span class="atvwebplayersdk-ad-timer-ad-text">Anúncio</span>
        <span class="atvwebplayersdk-ad-timer-remaining-time">0:30</span>
      </div>`;
    expect(isAdVideoPlaying(document)).toBe(true);
  });

  it('retorna false quando o player existe mas sem o timer de anúncio', () => {
    document.body.innerHTML = `
      <div id="dv-web-player">
        <div class="atvwebplayersdk-video-surface"><video></video></div>
      </div>`;
    expect(isAdVideoPlaying(document)).toBe(false);
  });

  it('retorna boolean (não truthy/falsy)', () => {
    const result = isAdVideoPlaying(document);
    expect(typeof result).toBe('boolean');
  });
});

// ─── getAdVideo ──────────────────────────────────────────────────────────────

describe('getAdVideo', () => {
  it('retorna null quando nenhum elemento de vídeo existe', () => {
    expect(getAdVideo(document)).toBeNull();
  });

  it('retorna o elemento <video> dentro do surface do player', () => {
    document.body.innerHTML = `
      <div class="atvwebplayersdk-video-surface">
        <video width="100%" height="100%" aria-hidden="true"></video>
      </div>`;
    const el = getAdVideo(document);
    expect(el).not.toBeNull();
    expect(el.tagName.toLowerCase()).toBe('video');
  });

  it('retorna null quando só existe <video> fora do surface do player', () => {
    document.body.innerHTML = `<video></video>`;
    expect(getAdVideo(document)).toBeNull();
  });
});

// ─── findBanners ─────────────────────────────────────────────────────────────

describe('findBanners', () => {
  it('retorna array vazio quando não há banners', () => {
    expect(findBanners(document)).toEqual([]);
  });

  it('sempre retorna um array (nunca null ou undefined)', () => {
    expect(Array.isArray(findBanners(document))).toBe(true);
  });

  it('detecta o botão "Assista sem anúncios" dentro do player', () => {
    document.body.innerHTML = `
      <button class="atvwebplayersdk-go-ad-free-button">Assista sem anúncios publicitários</button>`;
    expect(findBanners(document).length).toBe(1);
  });

  it('detecta CTA de upgrade na página de detalhes', () => {
    document.body.innerHTML = `<div class="dv-signup-button">Assinar</div>`;
    expect(findBanners(document).length).toBe(1);
  });

  it('detecta múltiplos banners simultâneos', () => {
    document.body.innerHTML = `
      <div class="dv-signup-button">Assinar</div>
      <button class="atvwebplayersdk-go-ad-free-button">Sem anúncios</button>`;
    expect(findBanners(document).length).toBe(2);
  });

  it('não detecta elementos genéricos do player como banner', () => {
    document.body.innerHTML = `
      <div id="dv-web-player">
        <div class="atvwebplayersdk-video-surface"><video></video></div>
      </div>`;
    expect(findBanners(document)).toEqual([]);
  });
});

// ─── findUpsellModals ────────────────────────────────────────────────────────

describe('findUpsellModals', () => {
  it('retorna array vazio quando não há modais de upsell', () => {
    expect(findUpsellModals(document)).toEqual([]);
  });

  it('sempre retorna um array', () => {
    expect(Array.isArray(findUpsellModals(document))).toBe(true);
  });

  it('detecta o modal cross-benefit pelo data-automation-id', () => {
    document.body.innerHTML = `
      <div data-automation-id="crossbenefit-modal-wrapper">
        <p>Assine Prime para ver sem anúncios</p>
      </div>`;
    expect(findUpsellModals(document).length).toBe(1);
  });

  it('falso positivo crítico: modal de detalhes do catálogo NÃO é upsell', () => {
    // catalogModal é LEGÍTIMO e não deve ser bloqueado (cenários 2.3 e 6.2 da spec)
    document.body.innerHTML = `
      <div data-testid="draper-player">
        <video src="blob:https://www.primevideo.com/preview"></video>
      </div>`;
    expect(findUpsellModals(document)).toEqual([]);
  });
});

// ─── findInactivityScreen ────────────────────────────────────────────────────

describe('findInactivityScreen', () => {
  it('retorna null quando não há tela de inatividade', () => {
    expect(findInactivityScreen(document)).toBeNull();
  });

  it('retorna null enquanto seletor não estiver mapeado (SELECTORS.inactivityScreen === null)', () => {
    // Inactivity screen não encontrada no snapshot de DOM atual.
    // Requer captura após ~90 min de inatividade.
    expect(SELECTORS.inactivityScreen).toBeNull();
    expect(findInactivityScreen(document)).toBeNull();
  });
});
