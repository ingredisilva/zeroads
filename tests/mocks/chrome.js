// Fábrica de mock do chrome — cria uma instância limpa por suite de testes.
// Uso: const chrome = createChromeMock(); global.chrome = chrome;

function createChromeMock() {
  const _storage = {};

  return {
    runtime: {
      onInstalled: { addListener: jest.fn() },
      onMessage: { addListener: jest.fn() },
      sendMessage: jest.fn().mockResolvedValue({}),
    },
    storage: {
      local: {
        get: jest.fn().mockImplementation(function (keys, cb) {
          if (Array.isArray(keys)) {
            const result = {};
            keys.forEach(function (k) { if (k in _storage) result[k] = _storage[k]; });
            cb(result);
          } else {
            cb(Object.assign({}, _storage));
          }
        }),
        set: jest.fn().mockImplementation(function (data, cb) {
          Object.assign(_storage, data);
          if (cb) cb();
        }),
      },
    },
    tabs: {
      query: jest.fn().mockImplementation(function (_filter, cb) { cb([]); }),
      sendMessage: jest.fn().mockResolvedValue({}),
    },
    action: {
      setBadgeText: jest.fn(),
      setBadgeBackgroundColor: jest.fn(),
      setIcon: jest.fn(),
    },
  };
}

module.exports = { createChromeMock };
