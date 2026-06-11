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

describe('SELECTORS', () => {
  it('exporta objeto de seletores', () => {
    expect(SELECTORS).toBeDefined();
    expect(typeof SELECTORS).toBe('object');
  });

  it('inclui seletor para catalogModal (elemento legítimo — não bloquear)', () => {
    // Garante que o elemento legítimo está explicitamente modelado
    expect('catalogModal' in SELECTORS).toBe(true);
  });
});

describe('isAdVideoPlaying', () => {
  it('retorna false quando nenhum elemento de anúncio está no DOM', () => {
    expect(isAdVideoPlaying(document)).toBe(false);
  });

  // TODO T06: adicionar teste com elemento de anúncio real após inspeção do DOM
  // it('retorna true quando container de anúncio está presente', () => { ... });
});

describe('getAdVideo', () => {
  it('retorna null quando nenhum elemento de vídeo existe', () => {
    expect(getAdVideo(document)).toBeNull();
  });

  // TODO T06: adicionar teste com seletor real do player após inspeção do DOM
});

describe('findBanners', () => {
  it('retorna array vazio quando não há banners', () => {
    expect(findBanners(document)).toEqual([]);
  });

  it('sempre retorna um array (nunca null ou undefined)', () => {
    const result = findBanners(document);
    expect(Array.isArray(result)).toBe(true);
  });

  // TODO T06: adicionar teste com banner real após inspeção do DOM
});

describe('findUpsellModals', () => {
  it('retorna array vazio quando não há modais de upsell', () => {
    expect(findUpsellModals(document)).toEqual([]);
  });

  it('sempre retorna um array', () => {
    expect(Array.isArray(findUpsellModals(document))).toBe(true);
  });

  // TODO T06: cenário crítico — modal de detalhes do catálogo (legítimo) não deve aparecer aqui
});

describe('findInactivityScreen', () => {
  it('retorna null quando não há tela de inatividade', () => {
    expect(findInactivityScreen(document)).toBeNull();
  });

  // TODO T06: adicionar teste com tela real de "Continuar assistindo?" após inspeção
});
