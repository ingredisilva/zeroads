# Requisitos

## Contexto

| Item | Valor |
|---|---|
| Plataforma alvo | Chrome / Chromium (Manifest V3) |
| Streaming prioritário | Amazon Prime Video |
| Perfil do usuário | Leigo — instalação simples, sem configuração obrigatória |
| Modelo | Open Source (MIT) |

---

## Requisitos funcionais

### RF01 — Bloqueio de anúncios em vídeo `[P1 - Essencial]`

A extensão deve detectar e pular anúncios em vídeo (pre-roll e mid-roll) no Amazon Prime Video automaticamente, sem interação do usuário.

**Critérios de aceite:**
- Anúncio é pulado em até 1 segundo após ser detectado no DOM
- Funciona em pre-roll (antes do conteúdo) e mid-roll (durante o conteúdo)
- A reprodução do conteúdo principal retoma sem interrupção perceptível após o pulo
- O mecanismo de pulo não exibe erro de console na página hospedeira

---

### RF02 — Bloqueio de banners e overlays `[P1 - Essencial]`

A extensão deve ocultar banners publicitários e overlays de propaganda exibidos sobre ou ao redor do player de vídeo.

**Critérios de aceite:**
- Elementos de propaganda são ocultados via CSS (`display: none`) ou removidos do DOM
- A página não apresenta colapso de layout, espaços em branco inesperados ou erros de JavaScript após a ocultação
- O player de vídeo permanece funcional (play/pause, barra de progresso, fullscreen)

---

### RF03 — Botão de ativação/desativação `[P1 - Essencial]`

O usuário deve poder ativar e desativar a extensão pelo ícone na barra de ferramentas do Chrome, sem precisar acessar configurações.

**Critérios de aceite:**
- Popup exibe claramente o estado atual: `Ativo` ou `Inativo`
- A mudança de estado persiste entre sessões do navegador (salvo em `chrome.storage.local`)
- Ao desativar, a extensão para de interceptar e manipular a página sem exigir reload
- Ao reativar em uma aba já aberta, o bloqueio volta a funcionar sem exigir reload

---

### RF04 — Contador de bloqueios `[P2 - Importante]`

A extensão deve exibir no popup um contador com o número de itens bloqueados na sessão de navegação atual.

**Definição de sessão:** desde a abertura do navegador até o seu fechamento. O contador é zerado ao reiniciar o Chrome.

**Critérios de aceite:**
- Contador visível no popup, separado por tipo: anúncios em vídeo e elementos de página (banners/overlays)
- Incrementado a cada bloqueio realizado, sem double-counting
- Não persiste entre sessões (não é armazenado em `chrome.storage`)

---

### RF05 — Lista branca configurável `[P2 - Importante]`

O usuário deve poder desativar o bloqueio para domínios específicos sem desativar a extensão globalmente.

**Critérios de aceite:**
- Página de opções permite adicionar e remover entradas na lista branca
- A granularidade é por domínio (ex.: `primevideo.com` cobre todos os subdomínios)
- A extensão fica inativa em qualquer URL cujo domínio ou subdomínio esteja na lista
- A lista persiste entre sessões do navegador

---

### RF06 — Bloqueio de pop-ups de upsell `[P2 - Importante]`

A extensão deve bloquear pop-ups e notificações que incentivam upgrade de plano ou compra de conteúdo adicional.

**Exemplos de elementos alvo:** modal "Assine o plano Ilimitado", banner "Alugar por R$ X,XX", notificação de renovação de assinatura.

**Critérios de aceite:**
- Pop-ups identificados são removidos antes de serem exibidos ao usuário (sem flash visível)
- A remoção não impede navegação normal pelo catálogo (ex.: não bloqueia o modal de detalhes do título)

---

### RF07 — Remoção de telas de inatividade `[P3 - Nice to have]`

A extensão deve dispensar automaticamente telas do tipo "Continuar assistindo?" que interrompem a reprodução.

**Critérios de aceite:**
- Tela é detectada e descartada em até 2 segundos sem interação do usuário
- A reprodução retoma do ponto onde parou, sem reiniciar o episódio

---

## Requisitos não-funcionais

### RNF01 — Privacidade `[P1 - Essencial]`

A extensão não deve coletar, transmitir ou armazenar nenhum dado do usuário fora do dispositivo local. Zero telemetria.

**Critérios de aceite:**
- Nenhuma requisição de rede originada pela própria extensão (exceto atualizações via Chrome Web Store)
- Nenhum uso de `fetch`, `XMLHttpRequest` ou similar no código da extensão

---

### RNF02 — Desempenho `[P1 - Essencial]`

A extensão não deve impactar significativamente o desempenho do navegador.

**Métricas:**
- Uso de CPU adicional < 1% em páginas sem anúncio ativo (medido via DevTools Performance)
- Consumo de memória adicional < 10 MB
- O `MutationObserver` deve usar `disconnect()` quando a extensão estiver inativa

---

### RNF03 — Compatibilidade `[P1 - Essencial]`

A extensão deve funcionar em Chrome 114+ e navegadores derivados do Chromium que suportem Manifest V3 (Edge, Brave, Opera).

---

### RNF04 — Usabilidade `[P1 - Essencial]`

A instalação deve ser possível em um único clique via Chrome Web Store. Nenhuma configuração deve ser obrigatória para o funcionamento básico.

---

### RNF05 — Manutenibilidade das regras `[P1 - Essencial]`

As regras de bloqueio (seletores CSS e URLs de anúncio) devem ser fáceis de atualizar por colaboradores externos sem exigir conhecimento da estrutura interna da extensão.

**Critérios de aceite:**
- Regras de rede isoladas em `rules/prime-video.json` com comentários explicativos
- Seletores DOM concentrados em `src/content/prime-video.js`, sem lógica espalhada
- O `CONTRIBUTING.md` descreve o processo de atualização de regras

---

### RNF06 — Permissões mínimas `[P2 - Importante]`

A extensão deve solicitar apenas as permissões estritamente necessárias, seguindo o princípio do menor privilégio.

**Permissões esperadas:**
- `declarativeNetRequest` — bloqueio de requisições de rede
- `storage` — persistência de configurações locais
- `activeTab` — acesso à aba atual para content scripts
- `scripting` — injeção de content scripts

---

### RNF07 — Atualizações automáticas `[P2 - Importante]`

Após publicação na Chrome Web Store, atualizações devem ser distribuídas automaticamente pelo mecanismo nativo do Chrome.

---

## Fora de escopo (MVP)

- Suporte a Firefox, Safari ou outros navegadores não-Chromium
- Outras plataformas de streaming além do Amazon Prime Video
- Interface de configuração avançada de regras de filtro
- Sincronização de configurações entre dispositivos
- Importação/exportação de listas de filtro no formato uBlock Origin
