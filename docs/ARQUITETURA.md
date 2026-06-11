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

---

## Passagem de mensagens

O popup fecha e reabre a cada uso — ele não pode manter estado em memória. Todo estado vive em `chrome.storage.local` e é lido de forma fresca a cada abertura do popup.

```
[popup.js] abre
  → chrome.runtime.sendMessage({ action: "getState" })
  ← service-worker responde: { enabled: true, counts: { video: 3, banner: 7 } }
  → popup renderiza estado e contadores

[popup.js] usuário clica em "Desativar"
  → chrome.runtime.sendMessage({ action: "setState", enabled: false })
  → service-worker persiste em chrome.storage.local
  → service-worker itera todas as abas com URL primevideo.com
    → chrome.tabs.sendMessage(tabId, { action: "disable" })
    → content script recebe e chama observer.disconnect()
```

**Restrição crítica:** o service worker MV3 encerra quando ocioso. Toda lógica de estado deve ser recuperável de `chrome.storage.local` a qualquer momento, não depender de variáveis em memória do service worker.

---

## Sincronização de estado entre abas

**Problema:** o usuário pode ter múltiplas abas do Prime Video abertas e fazer toggle da extensão.

**Solução:** ao receber `setState`, o service worker itera `chrome.tabs.query({ url: "*://*.primevideo.com/*" })` e envia a mensagem de atualização para cada aba encontrada.

**Edge case crítico — aba aberta após o toggle:**  
Se o usuário abre uma nova aba do Prime Video depois de desativar a extensão, o content script é injetado naquele momento. Ele não recebe a mensagem de desativação (que já foi enviada). Portanto, o content script **deve ler o estado de `chrome.storage.local` na sua inicialização** — nunca assumir que está ativo por padrão.

```
[nova aba abre primevideo.com após toggle]
  → Chrome injeta content script
  → content script lê chrome.storage.local: { enabled: false }
  → content script não inicia o MutationObserver
```

---

## CSP do popup e options

O Manifest V3 impõe Content Security Policy estrita por padrão. Consequências práticas para este projeto:

- **Sem scripts inline** nos arquivos `.html` — todo JavaScript deve estar em arquivos `.js` separados
- **Sem `eval()`** nem `new Function()` no código da extensão
- **Sem carregamento de scripts externos** via `<script src="...">` de CDNs

Essas restrições são compatíveis com a convenção "sem dependências externas" do `CONTRIBUTING.md`. Qualquer tentativa de usar script inline em `popup.html` ou `options.html` resultará em erro silencioso no Chrome — o script simplesmente não executa.

---

## Versionamento de regras (`rules/prime-video.json`)

IDs de regras nunca devem ser reutilizados após a remoção de uma regra. Use sempre o próximo inteiro disponível — não preencha lacunas.

Como JSON não suporta comentários nativamente, cada regra deve ser acompanhada de entrada correspondente em `rules/prime-video.meta.json` (mesmo formato de array, indexado pelo mesmo ID):

```json
[
  {
    "id": 1,
    "description": "Bloqueia script de anúncio da Amazon Advertising",
    "addedAt": "2024-01-01",
    "observedPattern": "aax-eu.amazon-adsystem.com",
    "fragile": true
  }
]
```

O campo `fragile: true` sinaliza regras que dependem de URLs conhecidas por mudar (relacionadas ao R01). Quando uma regra quebra e é atualizada: o ID antigo é aposentado (pode ser removido do JSON de regras, mas mantido no meta com campo `retiredAt`) e uma nova regra com novo ID é adicionada. Isso preserva o histórico de auditoria sem poluir o arquivo de regras ativo.
