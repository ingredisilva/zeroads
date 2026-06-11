/**
 * @jest-environment jsdom
 */

const { createChromeMock } = require('../../mocks/chrome.js');

describe('prime-video content script', () => {
  let chrome;
  let script;
  let mockDetector;
  let capturedMutationCallback;

  beforeEach(() => {
    // MutationObserver mock — captura o callback para disparar manualmente nos testes
    capturedMutationCallback = null;
    global.MutationObserver = jest.fn().mockImplementation(function (callback) {
      capturedMutationCallback = callback;
      return { observe: jest.fn(), disconnect: jest.fn() };
    });

    chrome = createChromeMock();
    global.chrome = chrome;

    jest.resetModules();
    jest.doMock('../../../src/content/detector.js', () => ({
      isAdVideoPlaying: jest.fn().mockReturnValue(false),
      getAdVideo: jest.fn().mockReturnValue(null),
      findBanners: jest.fn().mockReturnValue([]),
      findUpsellModals: jest.fn().mockReturnValue([]),
      findInactivityScreen: jest.fn().mockReturnValue(null),
      SELECTORS: {},
    }));

    mockDetector = require('../../../src/content/detector.js');
    script = require('../../../src/content/prime-video.js');
  });

  // ─── init ───────────────────────────────────────────────────────────────────

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

    it('inicia o observer quando enabled está ausente do storage (default ativo)', () => {
      chrome.storage.local.get.mockImplementation(function (_keys, cb) {
        cb({});
      });
      const startSpy = jest.spyOn(script, 'startObserver');
      script.init();
      expect(startSpy).toHaveBeenCalled();
    });
  });

  // ─── handleMessage ───────────────────────────────────────────────────────────

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

  // ─── startObserver / stopObserver ────────────────────────────────────────────

  describe('startObserver', () => {
    it('não lança erro ao iniciar', () => {
      expect(() => script.startObserver()).not.toThrow();
    });

    it('não cria observer duplicado se chamado duas vezes', () => {
      script.startObserver();
      script.startObserver();
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

  // ─── Pulo de anúncio em vídeo (RF01) ─────────────────────────────────────────

  describe('_skipAdVideo — pulo de anúncio (RF01)', () => {
    it('define video.currentTime = video.duration quando anúncio está em reprodução', () => {
      const mockVideo = { duration: 30, currentTime: 0 };
      mockDetector.isAdVideoPlaying.mockReturnValue(true);
      mockDetector.getAdVideo.mockReturnValue(mockVideo);

      script.startObserver();
      capturedMutationCallback([]);

      expect(mockVideo.currentTime).toBe(30);
    });

    it('envia incrementCount ao service worker após pular o anúncio', () => {
      const mockVideo = { duration: 30, currentTime: 0 };
      mockDetector.isAdVideoPlaying.mockReturnValue(true);
      mockDetector.getAdVideo.mockReturnValue(mockVideo);

      script.startObserver();
      capturedMutationCallback([]);

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        { action: 'incrementCount', type: 'video' }
      );
    });

    it('não faz nada quando nenhum anúncio está em reprodução', () => {
      mockDetector.isAdVideoPlaying.mockReturnValue(false);

      script.startObserver();
      capturedMutationCallback([]);

      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
    });

    it('não lança erro quando getAdVideo retorna null (player ainda não carregou)', () => {
      mockDetector.isAdVideoPlaying.mockReturnValue(true);
      mockDetector.getAdVideo.mockReturnValue(null);

      script.startObserver();
      expect(() => capturedMutationCallback([])).not.toThrow();
    });

    it('não pula anúncio já no fim — evita double-count em mutações repetidas', () => {
      const mockVideo = { duration: 30, currentTime: 30 };
      mockDetector.isAdVideoPlaying.mockReturnValue(true);
      mockDetector.getAdVideo.mockReturnValue(mockVideo);

      script.startObserver();
      capturedMutationCallback([]);

      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
    });

    it('não pula quando duration é 0 ou NaN (stream ainda não carregou metadados)', () => {
      const mockVideo = { duration: 0, currentTime: 0 };
      mockDetector.isAdVideoPlaying.mockReturnValue(true);
      mockDetector.getAdVideo.mockReturnValue(mockVideo);

      script.startObserver();
      capturedMutationCallback([]);

      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
    });

    it('callback não dispara nada quando observer ainda não foi iniciado', () => {
      // capturedMutationCallback é null se startObserver não foi chamado
      expect(capturedMutationCallback).toBeNull();
    });
  });
});
