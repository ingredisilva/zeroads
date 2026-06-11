# Riscos

## Matriz de riscos

| ID | Risco | Probabilidade | Impacto | Nível |
|---|---|---|---|---|
| R01 | Amazon atualiza o player para quebrar o bloqueio | Alta | Alto | 🔴 Crítico |
| R02 | Rejeição na Chrome Web Store | Média | Alto | 🟠 Alto |
| R03 | Limitações do Manifest V3 bloqueiam funcionalidades | Média | Médio | 🟠 Alto |
| R04 | Violação dos ToS da Amazon | Alta | Médio | 🟠 Alto |
| R05 | Quebra de layout após remoção de elementos | Baixa | Baixo | 🟡 Médio |

---

## Detalhamento

### R01 — Amazon atualiza o player `[Crítico]`

**Descrição:** A Amazon atualiza ativamente a estrutura do player de vídeo e os seletores CSS para dificultar o funcionamento de bloqueadores. Mudanças podem tornar a extensão ineficaz em horas.

**Mitigação:**
- Usar seletores robustos baseados em atributos de comportamento, não apenas em classes CSS geradas dinamicamente
- Monitorar o repositório com alertas automáticos de falha via testes de integração no CI
- Manter canal de comunicação ativo com a comunidade para reporte rápido de quebras
- Documentar o processo de atualização das regras para facilitar contribuições externas

---

### R02 — Rejeição na Chrome Web Store `[Alto]`

**Descrição:** O Google pode rejeitar a extensão durante a revisão manual, especialmente se as permissões solicitadas forem consideradas excessivas ou se o propósito de bloqueio de anúncios violar políticas da loja.

**Mitigação:**
- Solicitar apenas permissões estritamente necessárias (ver RNF06)
- Redigir descrição clara e transparente sobre o funcionamento
- Disponibilizar instalação via modo desenvolvedor como alternativa
- Estudar as políticas da Chrome Web Store antes de submeter

---

### R03 — Limitações do Manifest V3 `[Alto]`

**Descrição:** O MV3 impõe restrições significativas em relação ao MV2: sem background pages persistentes, bloqueio de rede apenas declarativo, limite de 30.000 regras estáticas. Algumas técnicas de bloqueio usadas por extensões consolidadas (como uBlock Origin) não são possíveis no MV3.

**Mitigação:**
- Projetar a extensão assumindo as limitações do MV3 desde o início — não tentar replicar comportamentos do MV2
- Para casos onde `declarativeNetRequest` é insuficiente, usar content scripts como alternativa
- Acompanhar as evoluções da API do Chrome que possam relaxar restrições

---

### R04 — Violação dos ToS da Amazon `[Alto]`

**Descrição:** O uso de bloqueadores de anúncio provavelmente viola os Termos de Serviço do Amazon Prime Video. Isso pode resultar em suspensão de contas de usuários ou em ações legais contra o projeto.

**Mitigação:**
- Incluir aviso legal claro no `README.md` e na descrição da extensão
- Não incentivar ativamente a violação dos ToS
- Estruturar o projeto de forma que a responsabilidade recaia sobre o usuário final, que aceita os termos consciente dos riscos

---

### R05 — Quebra de layout após remoção de DOM `[Médio]`

**Descrição:** Remover elementos da página pode causar colapso de layout, espaços em branco ou erros de JavaScript na página hospedeira.

**Mitigação:**
- Preferir `visibility: hidden` ou `display: none` à remoção completa de elementos quando possível
- Testar cada seletor em diferentes resolucões e estados da interface
- Monitorar erros de console após manipulações via content script

---

## Processo de resposta a incidentes

Quando a extensão parar de funcionar devido a uma atualização da plataforma:

1. **Identificação** — issue aberta no GitHub com reprodução do problema
2. **Triagem** — mantenedor confirma e marca como `bug:urgent`
3. **Investigação** — inspecionar DOM atual para identificar novos seletores
4. **Correção** — atualizar regras e content script
5. **Publicação** — nova versão submetida à Chrome Web Store
6. **Comunicação** — release notes descrevendo a correção

Meta de tempo de resposta para falhas críticas (R01): **72 horas**.
