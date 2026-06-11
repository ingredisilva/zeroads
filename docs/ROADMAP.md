# Roadmap

## v1.0 — Amazon Prime Video (MVP)

**Escopo:** funcionalidade central de bloqueio no Prime Video, pronta para publicação na Chrome Web Store.

**Requisitos incluídos:**
- RF01 — Bloqueio de anúncios em vídeo (pre-roll e mid-roll)
- RF02 — Bloqueio de banners e overlays
- RF03 — Toggle de ativação/desativação
- RF08 — Indicador visual no ícone (badge de contagem)
- RNF01 — Privacidade (zero telemetria)
- RNF02 — Desempenho (< 1% CPU, < 10 MB RAM)
- RNF03 — Compatibilidade Chrome 114+ e Chromium
- RNF04 — Instalação sem configuração obrigatória
- RNF05 — Manutenibilidade das regras
- RNF06 — Permissões mínimas

**Entregáveis:** extensão publicada na Chrome Web Store + instalação via modo desenvolvedor documentada.

---

## v1.x — Qualidade de vida

**Escopo:** funcionalidades complementares que melhoram a experiência sem exigir mudança de arquitetura.

- RF04 — Contador de bloqueios no popup (separado por tipo)
- RF06 — Bloqueio de pop-ups de upsell
- RF07 — Remoção de telas de inatividade ("Continuar assistindo?")
- RF05 — Lista branca configurável por domínio
- RNF07 — Auditoria e documentação de permissões
- Página de opções (para RF05)

---

## v2.0 — Segunda plataforma de streaming

**Candidatos:** Netflix, Disney+, Globoplay (contexto brasileiro), Max.

**Pré-requisito arquitetural (fazer em v1.x, antes de v2.0):**  
A abstração do content script deve ser generalizada em uma interface comum antes de adicionar a segunda plataforma. O arquivo `src/content/prime-video.js` deve evoluir para um módulo com contrato definido (funções de detecção, pulo, ocultação) que uma implementação específica por plataforma possa seguir. Se não for feito antes, v2.0 exige refactor grande.

**Escopo de v2.0:**
- Content script para a segunda plataforma seguindo a interface definida em v1.x
- Regras `declarativeNetRequest` específicas por plataforma em `rules/<plataforma>.json`
- Atualização da tabela de plataformas suportadas no `README.md`

---

## v3.0 — Funcionalidades avançadas (especulativo)

- Suporte a múltiplas plataformas simultaneamente (3+)
- Interface de configuração avançada de regras de filtro
- Estatísticas por plataforma no popup

---

## Não planejado

Itens abaixo estão fora do escopo previsto indefinidamente:

- Suporte a Firefox, Safari ou outros navegadores não-Chromium
- Importação/exportação de listas no formato uBlock Origin
- Sincronização de configurações entre dispositivos via `chrome.storage.sync`
- Servidor centralizado de regras (a extensão deve funcionar offline e sem infraestrutura própria)
