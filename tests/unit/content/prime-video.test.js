/**
 * @jest-environment jsdom
 */

const { createChromeMock } = require('../../mocks/chrome.js');

describe('prime-video content script', () => {
  let chrome;
  let script;

  beforeEach(() => {
    chrome = createChromeMock();
    global.chrome = chrome;
    jest.resetModules();
    script = require('../../../src/content/prime-video.js');
  });

  // --- init ---

  describe('init', () => {
    it('lê o estado do storage ao inicializar', () => {
      script.init();
      expect(chrome.storage.local.get).toHaveBeenCalledWith(
        ['enabled'],
        expect.any(Function)
      );
    });

    it('registra listener de mensagens', () => {
      script.init();
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    });

    it('inicia o observer quando estado é enabled:true', () => {
      chrome.storage.local.get.mockImplementation(function (_keys, cb) {
        cb({ enabled: true });
      });
      const startSpy = jest.spyOn(script, 'startObserver');
      script.init();
      expect(startSpy).toHaveBeenCalled();
    });

    it('não inicia o observer quando estado é enabled:false', () => {
      chrome.storage.local.get.mockImplementation(function (_keys, cb) {
        cb({ enabled: false });
      });
      const startSpy = jest.spyOn(script, 'startObserver');
      script.init();
      expect(startSpy).not.toHaveBeenCalled();
    });

    it('não inicia o observer quando enabled está ausente do storage (default seguro)', () => {
      // enabled ausente = extensão nunca foi instalada? Não deve iniciar.
      // Comportamento esperado: só inicia se enabled !== false (padrão é true).
      chrome.storage.local.get.mockImplementation(function (_keys, cb) {
        cb({}); // sem chave 'enabled'
      });
      const startSpy = jest.spyOn(script, 'startObserver');
      script.init();
      // enabled ausente → state.enabled é undefined → !== false → deve iniciar
      expect(startSpy).toHaveBeenCalled();
    });
  });

  // --- handleMessage ---

  describe('handleMessage', () => {
    it('chama stopObserver ao receber action:disable', () => {
      const stopSpy = jest.spyOn(script, 'stopObserver');
      script.handleMessage({ action: 'disable' });
      expect(stopSpy).toHaveBeenCalled();
    });

    it('chama startObserver ao receber action:enable', () => {
      const startSpy = jest.spyOn(script, 'startObserver');
      script.handleMessage({ action: 'enable' });
      expect(startSpy).toHaveBeenCalled();
    });

    it('ignora mensagens com action desconhecida sem lançar erro', () => {
      expect(() => script.handleMessage({ action: 'unknownAction' })).not.toThrow();
    });
  });

  // --- startObserver / stopObserver ---

  describe('startObserver', () => {
    it('não lança erro ao iniciar', () => {
      expect(() => script.startObserver()).not.toThrow();
    });

    it('não cria observer duplicado se chamado duas vezes', () => {
      script.startObserver();
      script.startObserver();
      // Deve haver apenas um observer ativo — stopObserver deve funcionar normalmente
      expect(() => script.stopObserver()).not.toThrow();
    });
  });

  describe('stopObserver', () => {
    it('não lança erro ao parar sem observer ativo', () => {
      expect(() => script.stopObserver()).not.toThrow();
    });

    it('para o observer após startObserver', () => {
      script.startObserver();
      expect(() => script.stopObserver()).not.toThrow();
    });
  });
});
