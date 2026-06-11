const path = require('path');
const fs = require('fs');

const RULES_PATH = path.resolve(__dirname, '../../../rules/prime-video.json');
const META_PATH = path.resolve(__dirname, '../../../rules/prime-video.meta.json');

let rules;
let meta;

beforeAll(() => {
  rules = JSON.parse(fs.readFileSync(RULES_PATH, 'utf8'));
  meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
});

// ─── Estrutura mínima ────────────────────────────────────────────────────────

describe('prime-video.json — estrutura', () => {
  it('é um array não-vazio', () => {
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(0);
  });

  it('cada regra tem id (número inteiro positivo)', () => {
    rules.forEach((rule) => {
      expect(typeof rule.id).toBe('number');
      expect(Number.isInteger(rule.id)).toBe(true);
      expect(rule.id).toBeGreaterThan(0);
    });
  });

  it('cada regra tem priority (número inteiro positivo)', () => {
    rules.forEach((rule) => {
      expect(typeof rule.priority).toBe('number');
      expect(rule.priority).toBeGreaterThan(0);
    });
  });

  it('cada regra tem action com type válido', () => {
    const validTypes = ['block', 'allow', 'redirect', 'modifyHeaders', 'upgradeScheme', 'allowAllRequests'];
    rules.forEach((rule) => {
      expect(rule.action).toBeDefined();
      expect(validTypes).toContain(rule.action.type);
    });
  });

  it('cada regra tem condition com pelo menos urlFilter ou regexFilter', () => {
    rules.forEach((rule) => {
      expect(rule.condition).toBeDefined();
      const hasFilter = rule.condition.urlFilter !== undefined || rule.condition.regexFilter !== undefined;
      expect(hasFilter).toBe(true);
    });
  });

  it('cada regra tem condition.resourceTypes (array não-vazio)', () => {
    rules.forEach((rule) => {
      expect(Array.isArray(rule.condition.resourceTypes)).toBe(true);
      expect(rule.condition.resourceTypes.length).toBeGreaterThan(0);
    });
  });
});

// ─── Integridade dos IDs ─────────────────────────────────────────────────────

describe('prime-video.json — integridade dos IDs', () => {
  it('IDs são únicos', () => {
    const ids = rules.map((r) => r.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('IDs são sequenciais a partir de 1 (sem lacunas)', () => {
    const ids = rules.map((r) => r.id).sort((a, b) => a - b);
    ids.forEach((id, index) => {
      expect(id).toBe(index + 1);
    });
  });
});

// ─── Consistência com meta.json ──────────────────────────────────────────────

describe('prime-video.meta.json — consistência', () => {
  it('é um array', () => {
    expect(Array.isArray(meta)).toBe(true);
  });

  it('tem entrada de metadado para cada regra ativa', () => {
    const ruleIds = new Set(rules.map((r) => r.id));
    const metaIds = new Set(meta.map((m) => m.id));
    ruleIds.forEach((id) => {
      expect(metaIds.has(id)).toBe(true);
    });
  });

  it('cada entrada de meta tem description e addedAt', () => {
    meta.forEach((entry) => {
      expect(typeof entry.description).toBe('string');
      expect(entry.description.length).toBeGreaterThan(0);
      expect(typeof entry.addedAt).toBe('string');
      // ISO date: YYYY-MM-DD
      expect(entry.addedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});

// ─── Segurança: não bloquear conteúdo legítimo ───────────────────────────────

describe('prime-video.json — segurança de conteúdo', () => {
  it('nenhuma regra bloqueia media ou sub_frame (risco de quebrar o player)', () => {
    const dangerousTypes = ['media', 'sub_frame'];
    rules.forEach((rule) => {
      if (rule.action.type === 'block') {
        rule.condition.resourceTypes.forEach((type) => {
          expect(dangerousTypes).not.toContain(type);
        });
      }
    });
  });

  it('nenhuma regra bloqueia URLs de primevideo.com diretamente', () => {
    rules.forEach((rule) => {
      if (rule.action.type === 'block' && rule.condition.urlFilter) {
        expect(rule.condition.urlFilter).not.toContain('primevideo.com');
      }
    });
  });

  it('nenhuma regra bloqueia m.media-amazon.com (CDN de imagens legítimas)', () => {
    rules.forEach((rule) => {
      if (rule.action.type === 'block' && rule.condition.urlFilter) {
        expect(rule.condition.urlFilter).not.toContain('m.media-amazon.com');
      }
    });
  });
});
