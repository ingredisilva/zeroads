# Tarefas — StreamBlock v1.0 (MVP)

Backlog de implementação. Ordem dentro de cada milestone respeita dependências.  
Referências: [`docs/REQUISITOS.md`](docs/REQUISITOS.md) · [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) · [`specs/prime-video.spec.md`](specs/prime-video.spec.md)

---

## Milestone 0 — Esqueleto

### T01 — Criar estrutura de arquivos e `manifest.json`
Criar os diretórios e arquivos base conforme a estrutura em `docs/ARQUITETURA.md`:
```
src/background/service-worker.js   (vazio)
src/content/prime-video.js         (vazio)
src/popup/popup.html|js|css        (vazios)
rules/prime-video.json             (array vazio)
rules/prime-video.meta.json        (array vazio)
icons/icon-16.png|48.png|128.png   (placeholders)
LICENSE
```
`manifest.json` com:
- `manifest_version: 3`, nome, versão, descrição
- Permissões: `declarativeNetRequest`, `storage`, `activeTab`, `scripting`
- `host_permissions`: `*://*.primevideo.com/*`
- `background.service_worker`
- `action` (popup)
- `content_scripts` apontando para `prime-video.js` em `*://*.primevideo.com/*`
- `declarative_net_request.rule_resources` apontando para `rules/prime-video.json`

**Conclusão:** extensão carrega no Chrome (`chrome://extensions/`) sem erros no console do service worker.

---

### T02 — Criar ícones da extensão
Gerar ou criar ícones nos três tamanhos exigidos (16×16, 48×48, 128×128 px).  
O ícone deve ser reconhecível em tamanho pequeno e comunicar "bloqueio" ou "streaming".

**Conclusão:** ícone aparece na barra de ferramentas do Chrome sem o ícone padrão de quebra-cabeça.

---

## Milestone 1 — Comunicação (backbone)

> Sem bloqueio real ainda — apenas o fluxo de mensagens e estado funcionando.  
> Dependência: T01.

### T03 — Service worker: gerenciamento de estado
`src/background/service-worker.js`:
- Inicializa `chrome.storage.local` com `{ enabled: true, counts: { video: 0, banner: 0 } }` na primeira instalação (`chrome.runtime.onInstalled`)
- Responde a `getState` → retorna estado atual do storage
- Responde a `setState` → persiste novo valor, propaga para todas as abas `primevideo.com` via `chrome.tabs.sendMessage`

Ver diagrama de mensagens em `docs/ARQUITETURA.md` — seção "Passagem de mensagens".

**Conclusão:** abrindo o DevTools do service worker (`chrome://extensions/` → "Service Worker"), `chrome.storage.local.get(null, console.log)` retorna o estado esperado.

---

### T04 — Popup: toggle on/off
`src/popup/`:
- `popup.html`: estrutura sem scripts inline (requisito CSP do MV3)
- `popup.js`: ao abrir, envia `getState` e renderiza estado atual ("Ativo" / "Inativo"); botão de toggle envia `setState`
- `popup.css`: estilo mínimo funcional

**Conclusão:** cenários 3.1 (estado persiste entre fechamentos) e 3.2 / 3.3 (ativar/desativar sem reload) da spec passam, exceto a propagação para o content script (que ainda não existe).

---

### T05 — Content script: inicialização e escuta de estado
`src/content/prime-video.js`:
- Ao injetar, lê `chrome.storage.local` para saber se extensão está ativa
- Se ativa: inicia `MutationObserver` (observando `document.body`)
- Escuta mensagem `disable` do service worker → chama `observer.disconnect()`
- Escuta mensagem `enable` → reinicia o observer

Nesta etapa o observer não precisa fazer nada além de logar no console.

**Conclusão:** ao abrir o Prime Video com a extensão ativa, o console da aba mostra o log de inicialização; ao desativar via popup, log de `disconnect()` aparece sem reload.

---

## Milestone 2 — Regras de rede e inspeção do DOM

> Dependência: T01. Pode rodar em paralelo com Milestone 1.

### T06 — Inspecionar DOM do Prime Video e preencher seletores
Abrir o Amazon Prime Video no Chrome com DevTools e mapear os elementos alvo listados na tabela "Seletores TBD" de `specs/prime-video.spec.md`:
- Container do anúncio em vídeo (pre-roll e mid-roll)
- Elemento `<video>` do player principal
- Banners e overlays publicitários
- Modais de upsell (upgrade, aluguel)
- Modal de detalhes do catálogo (elemento legítimo — **não bloquear**)
- Tela "Continuar assistindo?"

Para cada seletor: preferir `data-*`, `aria-label` ou `role` a classes CSS. Documentar também o seletor do elemento legítimo para usar como exclusão nos cenários de false positive.

**Conclusão:** tabela de seletores TBD em `specs/prime-video.spec.md` preenchida; seletores testados via `document.querySelector()` no console do DevTools.

---

### T07 — Regras `declarativeNetRequest` para Prime Video
`rules/prime-video.json` + `rules/prime-video.meta.json`:
- Identificar as URLs de servidores de anúncio do Prime Video (inspecionar aba Network do DevTools durante reprodução com anúncio)
- Adicionar uma regra por domínio/padrão de URL identificado
- Preencher `prime-video.meta.json` com descrição, data e campo `fragile` para cada regra (ver esquema em `docs/ARQUITETURA.md` — seção "Versionamento de regras")

**Conclusão:** com as regras ativas, requisições de anúncio são bloqueadas (aparecem como "blocked" na aba Network do DevTools).

---

## Milestone 3 — Bloqueio (core)

> Dependências: T05 (content script base), T06 (seletores mapeados).

### T08 — RF01: Pulo de anúncios em vídeo
`src/content/prime-video.js` — dentro do `MutationObserver`:
- Detectar presença do elemento de anúncio em vídeo (seletor de T06)
- Localizar o `<video>` principal
- Executar `video.currentTime = video.duration`
- Incrementar `counts.video` via `chrome.runtime.sendMessage`

Considerar a fragilidade do mecanismo (R07 em `docs/RISCOS.md`): se o hack for detectado pela Amazon, investigar alternativa de clicar no botão "Pular anúncio" quando presente.

**Conclusão:** cenários 1.1, 1.2, 1.3 e 1.4 da spec passam.

---

### T09 — RF02: Ocultação de banners e overlays
`src/content/prime-video.js` — dentro do `MutationObserver`:
- Para cada seletor de banner/overlay de T06: ao detectar, aplicar `element.style.display = 'none'`
- Verificar que o seletor do modal de catálogo (legítimo) **não** está incluído
- Incrementar `counts.banner` via `chrome.runtime.sendMessage`

**Conclusão:** cenários 2.1, 2.2 e — especialmente — 2.3 (false positive) da spec passam.

---

## Milestone 4 — Integração e polimento

> Dependências: T03, T04, T05 completos (Milestone 1).

### T10 — RF03: Toggle sem reload (integração completa)
Integrar o fluxo completo de mensagens definido em `docs/ARQUITETURA.md`:
- Popup → service worker → todas as abas `primevideo.com`
- Content script lê estado ao iniciar (edge case: aba aberta depois do toggle)
- `MutationObserver.disconnect()` ao desativar; reinicialização ao ativar

**Conclusão:** cenários 3.1, 3.2, 3.3 e 3.4 da spec passam, incluindo o edge case de aba aberta pós-toggle.

---

### T11 — RF08: Badge no ícone
`src/background/service-worker.js`:
- Ao receber incremento de contador (`counts.video` ou `counts.banner`), atualizar badge via `chrome.action.setBadgeText`
- Badge vazio quando count = 0
- `chrome.action.setIcon` para ícone em escala de cinza quando extensão desativada

**Conclusão:** badge atualiza em tempo real durante testes dos cenários RF01/RF02; ícone muda ao desativar (RF03).

---

## Milestone 5 — QA e publicação

> Dependência: todos os milestones anteriores.

### T12 — Executar cenários da spec
Percorrer todos os 17 cenários de `specs/prime-video.spec.md` manualmente:
- Marcar cada cenário como ✅ passou / ❌ falhou / ⚠️ inconclusivo
- Para cada falha: abrir issue no GitHub antes de marcar como concluído

**Conclusão:** todos os cenários P1/P2 (RF01–RF03, RF08, RNF01, RNF02) com status ✅.

---

### T13 — GitHub Actions: CI básico
`.github/workflows/ci.yml`:
- Trigger: push e pull request em `main`
- Job `validate`: verificar se `manifest.json` é JSON válido; verificar se `rules/prime-video.json` é JSON válido e IDs são únicos
- Job `package`: gerar `.zip` da extensão (sem `docs/`, `specs/`, `*.meta.json`) como artefato

**Conclusão:** pipeline verde em PR de teste; artefato `.zip` gerado e carregável no Chrome.

---

### T14 — Submissão na Chrome Web Store
- Criar conta de desenvolvedor na Chrome Web Store (taxa única de USD 5)
- Preparar assets da loja: screenshots, ícone 128px, descrição curta e longa
- Submeter o `.zip` gerado por T13
- Aguardar revisão (tipicamente 1–3 dias úteis)

**Conclusão:** extensão publicada com link da loja; atualizar badge de status no `README.md`.

---

## Dependências entre tarefas

```
T01 ──┬──► T03 ──┬──► T10 ──► T11
      │          │
      ├──► T04 ──┘
      │
      ├──► T05 ──┬──► T08 ──┐
      │          │           ├──► T12 ──► T13 ──► T14
      │          └──► T09 ──┘
      │
      ├──► T06 ──► T07
      │
      └──► T02
```
