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
      mockDetector.findBanners.mockReturnValue([]);
      mockDetector.findUpsellModals.mockReturnValue([]);

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

    it('não pula quando duration é 0 (stream ainda não carregou metadados)', () => {
      const mockVideo = { duration: 0, currentTime: 0 };
      mockDetector.isAdVideoPlaying.mockReturnValue(true);
      mockDetector.getAdVideo.mockReturnValue(mockVideo);

      script.startObserver();
      capturedMutationCallback([]);

      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
    });
  });

  // ─── Ocultação de banners e modais (RF02) ─────────────────────────────────────

  describe('_hideBanners — ocultação de overlays (RF02)', () => {
    it('define display:none em cada banner encontrado', () => {
      const banner1 = document.createElement('div');
      const banner2 = document.createElement('button');
      mockDetector.findBanners.mockReturnValue([banner1, banner2]);

      script.startObserver();
      capturedMutationCallback([]);

      expect(banner1.style.display).toBe('none');
      expect(banner2.style.display).toBe('none');
    });

    it('envia incrementCount para cada banner ocultado', () => {
      const banner1 = document.createElement('div');
      const banner2 = document.createElement('div');
      mockDetector.findBanners.mockReturnValue([banner1, banner2]);

      script.startObserver();
      capturedMutationCallback([]);

      const bannerCalls = chrome.runtime.sendMessage.mock.calls.filter(
        (call) => call[0].action === 'incrementCount' && call[0].type === 'banner'
      );
      expect(bannerCalls.length).toBe(2);
    });

    it('não envia mensagem quando não há banners', () => {
      mockDetector.isAdVideoPlaying.mockReturnValue(false);
      mockDetector.findBanners.mockReturnValue([]);
      mockDetector.findUpsellModals.mockReturnValue([]);

      script.startObserver();
      capturedMutationCallback([]);

      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
    });

    it('oculta modais de upsell sem enviar incrementCount (modal, não banner)', () => {
      const modal = document.createElement('div');
      mockDetector.findUpsellModals.mockReturnValue([modal]);

      script.startObserver();
      capturedMutationCallback([]);

      expect(modal.style.display).toBe('none');
      const bannerCalls = chrome.runtime.sendMessage.mock.calls.filter(
        (call) => call[0].type === 'banner'
      );
      expect(bannerCalls.length).toBe(0);
    });

    it('não lança erro quando findBanners retorna array vazio', () => {
      mockDetector.findBanners.mockReturnValue([]);
      script.startObserver();
      expect(() => capturedMutationCallback([])).not.toThrow();
    });

    it('banner já oculto não recebe mensagem de incrementCount duplicada', () => {
      const banner = document.createElement('div');
      banner.style.display = 'none';
      mockDetector.findBanners.mockReturnValue([banner]);

      script.startObserver();
      capturedMutationCallback([]);

      const bannerCalls = chrome.runtime.sendMessage.mock.calls.filter(
        (call) => call[0].type === 'banner'
      );
      expect(bannerCalls.length).toBe(0);
    });
  });
});
