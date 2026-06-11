# Especificações de comportamento — Amazon Prime Video

## Como usar este documento

Cada cenário descreve um teste manual a ser executado no Chrome com a extensão carregada em modo desenvolvedor. Use as DevTools (F12) para observar o DOM, o console e o tráfego de rede conforme indicado.

**Formato:**
- **Dado que** — pré-condições necessárias antes de executar
- **Quando** — ação disparadora
- **Então** — resultado esperado verificável
- **Falha se** — sinais concretos de que o cenário não passou

**Seletores marcados como `[TBD]`** serão preenchidos durante a implementação, quando os elementos reais do DOM forem inspecionados na plataforma.

---

## RF01 — Pulo de anúncios em vídeo

### Cenário 1.1 — Pre-roll detectado antes do conteúdo iniciar

**Dado que** a extensão está ativa  
**E** o usuário navega até um título no Amazon Prime Video e clica em "Assistir"  
**Quando** o player exibe um anúncio pre-roll (elemento `[TBD]` presente no DOM)  
**Então** o anúncio é pulado em até 1 segundo após a detecção  
**E** a reprodução do conteúdo principal inicia sem interrupção perceptível  
**E** nenhum erro é registrado no console da página (aba Console do DevTools)

**Falha se:** o anúncio for exibido por mais de 1 segundo; o conteúdo reiniciar do início após o pulo; erros como `TypeError` ou `Uncaught` aparecerem no console.

---

### Cenário 1.2 — Mid-roll detectado durante a reprodução

**Dado que** a extensão está ativa  
**E** o usuário está assistindo a um título que contém intervalo publicitário mid-roll  
**Quando** o player interrompe o conteúdo para exibir o anúncio mid-roll  
**Então** o anúncio é pulado em até 1 segundo  
**E** a reprodução do conteúdo retoma a partir do ponto em que foi interrompida  
**E** a barra de progresso não regride nem avança de forma inesperada

**Falha se:** o conteúdo reiniciar do início após o pulo; a barra de progresso mostrar posição incorreta.

---

### Cenário 1.3 — Extensão desativada: anúncio não é pulado (caso negativo)

**Dado que** a extensão está **inativa** (desativada pelo usuário via popup)  
**Quando** o player exibe um anúncio pre-roll ou mid-roll  
**Então** o anúncio é reproduzido normalmente até o fim  
**E** nenhuma intervenção da extensão ocorre no DOM ou no `currentTime` do player

**Propósito:** garantir que a desativação funciona corretamente (RF03).

---

### Cenário 1.4 — Ad pod: múltiplos anúncios em sequência

**Dado que** a extensão está ativa  
**E** o player exibe um ad pod (sequência de 2 ou mais anúncios sem conteúdo entre eles)  
**Quando** o primeiro anúncio é detectado e pulado  
**Então** o segundo anúncio também é detectado e pulado independentemente  
**E** o conteúdo principal inicia apenas após todos os anúncios do pod serem pulados

**Falha se:** apenas o primeiro anúncio for pulado e os subsequentes forem reproduzidos normalmente.

---

## RF02 — Bloqueio de banners e overlays

### Cenário 2.1 — Banner publicitário ocultado sem colapso de layout

**Dado que** a extensão está ativa  
**E** o Amazon Prime Video exibe um banner publicitário sobre ou ao redor do player  
**Quando** a extensão detecta e oculta o elemento  
**Então** o banner desaparece da tela sem deixar espaço em branco visível  
**E** o layout da página não colapsa nem apresenta deslocamento de elementos

**Verificação:** inspecionar o elemento no DevTools e confirmar `display: none` ou remoção do DOM; não deve haver `height` residual visível.

---

### Cenário 2.2 — Player permanece totalmente funcional após ocultação

**Dado que** a extensão ocultou um ou mais banners/overlays  
**Quando** o usuário interage com o player  
**Então** todas as seguintes ações funcionam normalmente:
  - Play e pause (clique no botão e barra de espaço)
  - Scrubbing (arrastar a barra de progresso)
  - Avanço e retrocesso por teclado (setas ou J/K/L)
  - Fullscreen (botão e tecla F)
  - Controle de volume

**Falha se:** qualquer controle do player parar de responder após a extensão atuar.

---

### Cenário 2.3 — FALSE POSITIVE: modal de detalhes do catálogo não é bloqueado

**Dado que** a extensão está ativa  
**Quando** o usuário passa o mouse sobre um título no catálogo e o modal de detalhes abre  
**Ou** quando o usuário clica no título para ver a página de detalhes  
**Então** o modal/página de detalhes é exibido normalmente  
**E** a extensão não remove nem oculta nenhum elemento desse modal

> Este é o cenário de false positive mais crítico do RF02. A distinção entre overlay de anúncio e modal de navegação deve ser garantida pelos seletores escolhidos na implementação.

**Falha se:** o modal de detalhes de qualquer título não abrir ou aparecer incompleto com a extensão ativa.

---

## RF03 — Toggle de ativação/desativação

### Cenário 3.1 — Estado persiste entre fechamentos do popup

**Dado que** o usuário abre o popup e desativa a extensão  
**Quando** o popup é fechado e reaberto  
**Então** o popup exibe o estado "Inativo"  
**E** a extensão permanece inativa (nenhum bloqueio ocorre nas abas abertas)

---

### Cenário 3.2 — Desativar em aba aberta atua sem exigir reload

**Dado que** a extensão está ativa em uma aba com o Prime Video aberta  
**E** um bloqueio foi observado (anúncio pulado ou banner removido)  
**Quando** o usuário abre o popup e clica para desativar  
**Então** a extensão para de interceptar e manipular a página imediatamente  
**E** a aba não é recarregada  
**E** novos anúncios exibidos após a desativação não são bloqueados

---

### Cenário 3.3 — Reativar em aba já aberta retoma bloqueio sem reload

**Dado que** a extensão estava inativa  
**E** o usuário está em uma aba do Prime Video  
**Quando** o usuário abre o popup e clica para ativar  
**Então** o bloqueio é retomado naquela aba sem necessidade de reload  
**E** o próximo anúncio é pulado normalmente

---

### Cenário 3.4 — Estado é independente por tipo de aba (não contamina outras abas)

**Dado que** o usuário tem duas abas do Prime Video abertas  
**E** a extensão está ativa em ambas  
**Quando** o usuário desativa a extensão via popup  
**Então** ambas as abas refletem o estado inativo  
**E** nenhuma aba do Prime Video continua bloqueando anúncios

**Nota:** o estado é global (não por aba) — este cenário verifica que a propagação entre abas funciona corretamente, não que abas têm estados independentes.

---

## RF04 — Contador de bloqueios

### Cenário 4.1 — Contador separado por tipo

**Dado que** a extensão está ativa e acabou de ser instalada (contadores em zero)  
**Quando** um anúncio em vídeo é pulado  
**Então** o contador "Anúncios em vídeo" no popup incrementa em 1  
**E** o contador "Elementos de página" permanece inalterado

**E quando** um banner é ocultado  
**Então** o contador "Elementos de página" incrementa em 1  
**E** o contador "Anúncios em vídeo" permanece inalterado

---

### Cenário 4.2 — Sem double-counting

**Dado que** a extensão detectou e purou um anúncio  
**Quando** o mesmo elemento de anúncio ainda está no DOM (antes de ser removido)  
**Então** o contador incrementa exatamente 1 vez por evento de bloqueio  
**E** não incrementa novamente para o mesmo anúncio

---

### Cenário 4.3 — Contador zerado ao reiniciar o Chrome

**Dado que** a extensão bloqueou alguns anúncios (contadores > 0)  
**Quando** o Chrome é fechado completamente e reaberto  
**Então** o popup exibe contadores em zero  
**E** o valor anterior não é recuperado de `chrome.storage`

---

## RF06 — Bloqueio de pop-ups de upsell

### Cenário 6.1 — Modal de upgrade removido antes de renderizar

**Dado que** a extensão está ativa  
**Quando** o Prime Video exibiria o modal "Assine o plano Ilimitado" ou "Alugar por R$ X,XX"  
**Então** o modal não aparece para o usuário (sem flash visível)  
**E** a extensão não exibe nenhuma mensagem de erro no console

**Verificação:** monitorar o DOM no DevTools durante a navegação; o elemento alvo pode aparecer brevemente antes de ser removido — o "sem flash" significa que a remoção deve ser imperceptível ao olho humano.

---

### Cenário 6.2 — FALSE POSITIVE: modal de catálogo não é bloqueado

**Dado que** a extensão está ativa  
**Quando** o usuário clica em "Ver detalhes" ou qualquer CTA de navegação legítima  
**Então** o modal ou página de detalhes do título abre normalmente  
**E** todos os botões de ação (Assistir, Adicionar à lista, Comprar) são visíveis e funcionais

> Este é o false positive mais difícil do RF06. Modais de upsell e modais de detalhes de conteúdo compartilham estrutura DOM similar no Prime Video. Os seletores devem ser suficientemente específicos para distingui-los.

---

## RF07 — Remoção de telas de inatividade

### Cenário 7.1 — "Continuar assistindo?" dispensado automaticamente

**Dado que** a extensão está ativa  
**E** o Prime Video exibe a tela "Continuar assistindo?" após período de inatividade  
**Quando** a tela é detectada no DOM  
**Então** ela é dispensada em até 2 segundos sem interação do usuário  
**E** a reprodução retoma sem exibir a tela ao usuário

---

### Cenário 7.2 — Reprodução retoma do ponto correto

**Dado que** a tela de inatividade foi dispensada pela extensão  
**Então** a reprodução continua a partir do momento exato em que foi pausada  
**E** o episódio não reinicia do início  
**E** a posição na barra de progresso é mantida

---

## RNF01 — Privacidade

### Cenário P.1 — Nenhuma requisição de rede originada pela extensão

**Verificação via DevTools:**
1. Abra o DevTools → aba Network
2. Filtre por "Extension" (ou inspecione o service worker via `chrome://serviceworker-internals`)
3. Navegue pelo Prime Video por 5 minutos com a extensão ativa

**Então** nenhuma requisição HTTP originada pelo código da extensão é registrada  
(Requisições de atualização automática da Chrome Web Store são excluídas desta verificação)

---

## RNF02 — Desempenho

### Cenário P.2 — CPU em idle < 1%

**Verificação:**
1. Abra o Prime Video em uma página sem anúncio ativo (ex.: página inicial)
2. Aguarde 30 segundos para estabilizar
3. Abra DevTools → Performance → gravar por 10 segundos

**Então** o uso de CPU atribuível ao content script da extensão é < 1% durante o período idle

---

### Cenário P.3 — Memória adicional < 10 MB

**Verificação:**
1. Abra o Chrome sem a extensão → `chrome://task-manager` → anote memória base do Prime Video
2. Instale a extensão → repita a medição

**Então** a diferença entre as duas medições é < 10 MB

---

### Cenário P.4 — MutationObserver desconectado quando extensão inativa

**Dado que** a extensão está ativa em uma aba do Prime Video  
**Quando** o usuário desativa a extensão via popup  
**Então** o `MutationObserver` do content script chama `disconnect()`  
**E** nenhuma callback do observer é disparada após a desativação

**Verificação:** adicionar `console.log` temporário na callback do observer durante desenvolvimento; confirmar ausência de logs após desativação.

---

## Seletores TBD

Os seletores CSS e atributos de DOM listados abaixo devem ser determinados durante a implementação por inspeção manual do Prime Video:

| Elemento | Seletor | Status |
|---|---|---|
| Container do anúncio em vídeo (pre-roll) | `[TBD]` | Pendente |
| Container do anúncio em vídeo (mid-roll) | `[TBD]` | Pendente |
| Elemento `<video>` do player principal | `[TBD]` | Pendente |
| Banner publicitário sobre o player | `[TBD]` | Pendente |
| Overlay publicitário lateral | `[TBD]` | Pendente |
| Modal de upsell (upgrade de plano) | `[TBD]` | Pendente |
| Modal de aluguel de conteúdo | `[TBD]` | Pendente |
| Modal de detalhes do catálogo (legítimo — não bloquear) | `[TBD]` | Pendente |
| Tela "Continuar assistindo?" | `[TBD]` | Pendente |

> **Critério de qualidade para seletores:** prefira atributos semânticos (`data-*`, `aria-label`, `role`) a classes CSS geradas dinamicamente. Ver RNF05 e R06 em `docs/RISCOS.md`.
