# Arquitetura

## Visão geral

A extensão é construída sobre o **Manifest V3** do Chrome, composta por três camadas principais:

```
┌─────────────────────────────────────┐
│           Popup (UI)                │  ← Ativação on/off, contador
├─────────────────────────────────────┤
│         Content Script              │  ← Manipulação do DOM, pulo de anúncios
├─────────────────────────────────────┤
│     declarativeNetRequest           │  ← Bloqueio de requisições de rede
└─────────────────────────────────────┘
```

---

## Estrutura de arquivos

```
streamblock/
├── manifest.json
├── README.md
├── LICENSE
├── CONTRIBUTING.md
│
├── src/
│   ├── background/
│   │   └── service-worker.js     # Service worker MV3 (estado, mensagens)
│   ├── content/
│   │   └── prime-video.js        # Content script específico do Prime Video
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   └── options/
│       ├── options.html          # Página de configurações (lista branca)
│       ├── options.js
│       └── options.css
│
├── rules/
│   └── prime-video.json          # Regras declarativeNetRequest
│
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
│
└── docs/
    ├── REQUISITOS.md
    ├── ARQUITETURA.md
    └── RISCOS.md
```

---

## Decisões técnicas

### Manifest V3

O Chrome exige MV3 desde junho de 2024. As principais implicações são:

- **Sem background pages persistentes** — substituídas por service workers que encerram quando ociosos
- **Bloqueio de rede declarativo** — `declarativeNetRequest` substitui a API `webRequest` bloqueante
- **Content scripts** continuam disponíveis para manipulação de DOM

### Bloqueio de requisições (`declarativeNetRequest`)

Requisições de anúncio identificadas por URL são bloqueadas via regras estáticas declaradas em `rules/prime-video.json`. Esse mecanismo é nativo do Chrome — mais eficiente e mais privado que interceptação programática.

```json
{
  "id": 1,
  "priority": 1,
  "action": { "type": "block" },
  "condition": {
    "urlFilter": "||aax-eu.amazon-adsystem.com^",
    "resourceTypes": ["script", "xmlhttprequest"]
  }
}
```

### Pulo de anúncios em vídeo (content script)

Anúncios em vídeo não podem ser bloqueados por URL sem quebrar o player. A estratégia é observar o DOM via `MutationObserver` e, ao detectar o elemento de anúncio ativo, manipular o player para avançar.

```
MutationObserver detecta elemento de anúncio
  → Localiza o elemento <video>
  → Define video.currentTime = video.duration
  → Chrome pula automaticamente para o conteúdo principal
```

### Armazenamento

Configurações do usuário (estado on/off, lista branca) são armazenadas via `chrome.storage.local` — local, sem sincronização, sem envio a servidores externos.

---

## Tecnologias

| Componente | Tecnologia |
|---|---|
| Linguagem | JavaScript (ES2020+, sem transpilação) |
| Manifest | V3 |
| Bloqueio de rede | `declarativeNetRequest` |
| Manipulação DOM | Content script + `MutationObserver` |
| Armazenamento | `chrome.storage.local` |
| CI/CD | GitHub Actions |
| Distribuição | Chrome Web Store |

---

## Fluxo de funcionamento

```
Usuário acessa primevideo.com
  → Chrome injeta content script (prime-video.js)
  → MutationObserver inicia monitoramento do DOM
  → Requisições de anúncio bloqueadas por declarativeNetRequest

Anúncio em vídeo detectado no DOM
  → Script localiza o <video> player
  → Avança currentTime para o fim do anúncio
  → Contador de bloqueios incrementado via chrome.storage

Usuário clica no ícone da extensão
  → Popup exibe estado atual e contador
  → Usuário pode ativar/desativar com um clique
```
