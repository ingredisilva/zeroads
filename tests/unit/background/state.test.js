const { createInitialState, applyToggle, incrementCount } = require('../../../src/background/state.js');

describe('createInitialState', () => {
  it('retorna enabled:true', () => {
    expect(createInitialState().enabled).toBe(true);
  });

  it('retorna contadores zerados', () => {
    expect(createInitialState().counts).toEqual({ video: 0, banner: 0 });
  });
});

describe('applyToggle', () => {
  it('inverte enabled de true para false', () => {
    const state = { enabled: true, counts: { video: 0, banner: 0 } };
    expect(applyToggle(state).enabled).toBe(false);
  });

  it('inverte enabled de false para true', () => {
    const state = { enabled: false, counts: { video: 0, banner: 0 } };
    expect(applyToggle(state).enabled).toBe(true);
  });

  it('não muta o estado original', () => {
    const state = { enabled: true, counts: { video: 0, banner: 0 } };
    applyToggle(state);
    expect(state.enabled).toBe(true);
  });

  it('preserva os contadores', () => {
    const state = { enabled: true, counts: { video: 3, banner: 7 } };
    expect(applyToggle(state).counts).toEqual({ video: 3, banner: 7 });
  });
});

describe('incrementCount', () => {
  it('incrementa o contador de vídeo em 1', () => {
    const state = createInitialState();
    expect(incrementCount(state, 'video').counts.video).toBe(1);
  });

  it('incrementa o contador de banner em 1', () => {
    const state = createInitialState();
    expect(incrementCount(state, 'banner').counts.banner).toBe(1);
  });

  it('não afeta outros contadores', () => {
    const state = createInitialState();
    expect(incrementCount(state, 'video').counts.banner).toBe(0);
  });

  it('não muta o estado original', () => {
    const state = createInitialState();
    incrementCount(state, 'video');
    expect(state.counts.video).toBe(0);
  });

  it('acumula incrementos sucessivos corretamente', () => {
    const s1 = createInitialState();
    const s2 = incrementCount(s1, 'video');
    const s3 = incrementCount(s2, 'video');
    expect(s3.counts.video).toBe(2);
  });
});
