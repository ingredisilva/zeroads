# Contribuindo

Obrigado pelo interesse em contribuir com o StreamBlock!

## Como contribuir

### Reportando bugs

Abra uma issue no GitHub com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. observado
- Versão do Chrome e do sistema operacional

### Sugerindo melhorias

Abra uma issue com a tag `enhancement` descrevendo a funcionalidade desejada e o caso de uso.

### Enviando código

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b fix/nome-do-bug` ou `feat/nome-da-feature`
3. Faça suas alterações
4. Teste localmente (veja **Desenvolvimento local** abaixo)
5. Abra um Pull Request descrevendo as mudanças

## Desenvolvimento local

```bash
git clone https://github.com/seu-usuario/adblock-streaming.git
cd adblock-streaming
```

1. Acesse `chrome://extensions/`
2. Ative o **Modo do desenvolvedor**
3. Clique em **Carregar sem compactação** e selecione a pasta do projeto
4. Após alterações, clique no ícone de atualização na extensão

## Atualizando regras de filtro

Se um bloqueio parou de funcionar após uma atualização da plataforma:

1. Inspecione o DOM da página afetada (F12 → Inspector)
2. Identifique os novos seletores ou URLs de anúncio
3. Atualize `rules/prime-video.json` ou `src/content/prime-video.js`
4. Abra um PR com a descrição da mudança e os seletores antigos vs. novos

## Convenções

- Commits em português ou inglês — seja consistente no PR
- Sem dependências externas — a extensão deve funcionar com JS puro
- Cada PR deve ter um escopo claro e focado

## Código de conduta

Este projeto segue o [Contributor Covenant](https://www.contributor-covenant.org/). Seja respeitoso e construtivo.
