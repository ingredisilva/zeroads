/**
 * @jest-environment jsdom
 */

const { getStatusText, getToggleLabel, formatCounts, renderState } = require('../../../src/popup/popup.js');

describe('getStatusText', () => {
  it('retorna "Ativo" quando enabled é true', () => {
    expect(getStatusText(true)).toBe('Ativo');
  });

  it('retorna "Inativo" quando enabled é false', () => {
    expect(getStatusText(false)).toBe('Inativo');
  });
});

describe('getToggleLabel', () => {
  it('retorna "Desativar" quando enabled é true', () => {
    expect(getToggleLabel(true)).toBe('Desativar');
  });

  it('retorna "Ativar" quando enabled é false', () => {
    expect(getToggleLabel(false)).toBe('Ativar');
  });
});

describe('formatCounts', () => {
  it('formata contadores como string legível', () => {
    expect(formatCounts({ video: 3, banner: 7 })).toBe('3 vídeos · 7 banners');
  });

  it('formata contadores zerados', () => {
    expect(formatCounts({ video: 0, banner: 0 })).toBe('0 vídeos · 0 banners');
  });

  it('formata corretamente com qualquer valor', () => {
    expect(formatCounts({ video: 100, banner: 1 })).toBe('100 vídeos · 1 banners');
  });
});

describe('renderState', () => {
  let elements;

  beforeEach(() => {
    document.body.innerHTML = `
      <p id="status"></p>
      <button id="toggle"></button>
      <p id="counts"></p>
    `;
    elements = {
      status: document.getElementById('status'),
      toggle: document.getElementById('toggle'),
      counts: document.getElementById('counts'),
    };
  });

  it('exibe "Ativo" no status quando enabled é true', () => {
    renderState({ enabled: true, counts: { video: 0, banner: 0 } }, elements);
    expect(elements.status.textContent).toBe('Ativo');
  });

  it('exibe "Inativo" no status quando enabled é false', () => {
    renderState({ enabled: false, counts: { video: 0, banner: 0 } }, elements);
    expect(elements.status.textContent).toBe('Inativo');
  });

  it('exibe "Desativar" no botão quando enabled é true', () => {
    renderState({ enabled: true, counts: { video: 0, banner: 0 } }, elements);
    expect(elements.toggle.textContent).toBe('Desativar');
  });

  it('exibe "Ativar" no botão quando enabled é false', () => {
    renderState({ enabled: false, counts: { video: 0, banner: 0 } }, elements);
    expect(elements.toggle.textContent).toBe('Ativar');
  });

  it('exibe os contadores formatados', () => {
    renderState({ enabled: true, counts: { video: 2, banner: 4 } }, elements);
    expect(elements.counts.textContent).toBe('2 vídeos · 4 banners');
  });
});
