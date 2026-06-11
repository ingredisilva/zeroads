# ZeroAds

> Extensão open source para Chrome que bloqueia anúncios em plataformas de streaming.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)]()
[![Status: Em desenvolvimento](https://img.shields.io/badge/Status-Em%20desenvolvimento-yellow.svg)]()

---

## Sobre o projeto

ZeroAds é uma extensão de navegador gratuita e open source que detecta e bloqueia anúncios em plataformas de streaming, com foco inicial no **Amazon Prime Video**.

O projeto foi concebido para ser simples de instalar (sem configuração obrigatória) e transparente — sem coleta de dados, sem telemetria.

## Plataformas suportadas

| Plataforma | Status |
|---|---|
| Amazon Prime Video | 🚧 Em desenvolvimento |

## Instalação

> Em breve via Chrome Web Store.

Para instalar em modo desenvolvedor:

1. Clone este repositório
2. Acesse `chrome://extensions/`
3. Ative o **Modo do desenvolvedor**
4. Clique em **Carregar sem compactação** e selecione a pasta do projeto

> **Nota:** se você tiver uma aba do Prime Video aberta no momento da instalação, recarregue-a (F5) para que a extensão entre em funcionamento.

## Como funciona

- **Bloqueio de rede:** requisições para servidores de anúncio são bloqueadas via `declarativeNetRequest` — mecanismo nativo do Chrome, sem interceptação de tráfego
- **Pulo de anúncios em vídeo:** anúncios que passam pela camada de rede são detectados via `MutationObserver` e pulados automaticamente no player
- **Privacidade:** nenhum dado é coletado, transmitido ou armazenado fora do seu dispositivo (ver [docs/REQUISITOS.md](docs/REQUISITOS.md) — RNF01)

## Documentação

- [`docs/REQUISITOS.md`](docs/REQUISITOS.md) — Requisitos funcionais e não-funcionais
- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) — Decisões técnicas e estrutura do projeto
- [`docs/RISCOS.md`](docs/RISCOS.md) — Riscos identificados e mitigações
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — Versões planejadas e funcionalidades futuras
- [`specs/prime-video.spec.md`](specs/prime-video.spec.md) — Cenários de teste para o Amazon Prime Video

## Contribuindo

Contribuições são bem-vindas. Veja [`CONTRIBUTING.md`](CONTRIBUTING.md) para detalhes.

## Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE) para mais informações.

## Aviso legal

Esta extensão pode violar os Termos de Serviço das plataformas de streaming onde for utilizada. Use por sua própria conta e risco. Os autores não se responsabilizam por eventuais consequências.
