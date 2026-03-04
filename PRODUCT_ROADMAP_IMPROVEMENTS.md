# CHRONOPRIVATIVE — Análise PO & Roadmap de Melhorias

**Data:** Março 4, 2026  
**Estado do Produto:** Sprint 1 Concluído (Core funcional)  
**Próximo Marco:** Sprint 2 — Features de retenção  

---

## 📊 RESUMO EXECUTIVO

O CHRONOPRIVATIVE está no estado "**core funcional**": usuário consegue escrever, salvar, organizar e recuperar posts. A infraestrutura técnica foi estabilizada (correção de bio, auth, pool errors).

**Este documento identifica:**
- 6 pontos de fricção na UX que frustram o usuário
- 7 features faltantes que aumentariam retenção/uso
- 5 features existentes prontas para melhoria
- 2 features que podem ser removidas ou drasticamente simplificadas

**Roadmap:** 3 fases, 13 semanas total até v2.0

---

## DIMENSÃO 1 — Experiência do Usuário (UX)

### UX-01 — Feedback de "Salvando..." não é claro

**Funcionalidade afetada:** EditPostModal, BioEditModal  
**Problema atual:**  
- Usuário clica "Salvar" em modal
- Nada acontece por 0.5-1s (latência rede + DB)
- Usuário não sabe se salvo, está salvando ou falhou
- Risco: clica "Salvar" 3x por impaciência, gera 3 POSTs

**Sugestão:**  
- Adicionar spinner/skeleton animado enquanto `isSaving = true`
- Feedback tátil: cor muda (blue → green) ao sucesso
- Toast notification (1.5s): "Bio atualizada ✓" ou "Erro ao salvar"
- Desabilitar botão "Salvar" durante request

**Valor:**  
- Reduz cliques duplos/triplos (economia de banda)
- Aumenta confiança na persistência
- Padrão esperado em qualquer app moderno

**Esforço estimado:** Baixo (1-2h)  
**Prioridade:** P1

---

### UX-02 — Bio em modal quando poderia ser inline

**Funcionalidade afetada:** AboutWidget  
**Problema atual:**  
- Clica ícone "Edit" biografia
- Abre modal grande e oscurecida (overlay inteiro)
- Para usuário que muda bio 1x/mês, modal é excessivo (3 clicks)
- Padrão antigo de desktop app (2010s)

**Sugestão:**  
- Renderizar editor de bio inline ao lado do texto atual
- Modo "leitura" padrão: bio com botão "Editar"
- Modo "edição": textarea inline, botões "Cancelar" e "Salvar" lado a lado
- Salvantar altura do widget se necessário (não fazer scroll horizontal)

**Valor:**  
- Quicker edits (3 clicks → 1 click intencional)
- Menos modal fatigue (usuário não quer abrir modal para tudo)
- Mais organic ao fluxo de leitura

**Esforço estimado:** Médio (3-4h refactor)  
**Prioridade:** P2

---

### UX-03 — Criar post é processo em 6 passos, poderia ser em 2

**Funcionalidade afetada:** Fluxo de criar novo post  
**Problema atual:**  
Usuário clica "+" → Abre modal gigante com abas:
1. Escrever título
2. Escrever conteúdo
3. Escolher tag
4. Upload imagem (não funciona — D-02)
5. Selecionar mood
6. Selecionar weather/listening to

Para post rápido ("Acordei hoje"), são 5 campos opcionais demais.

**Sugestão:**  
- **Modo Rápido:** Apenas título + conteúdo. Tudo opcional.
- **Modo Completo:** Toggle "Adicionar mais..." → revela mood, weather, tags
- Persistir preferências de modo (user prefere rápido ou completo?)
- Salvar rascunho automaticamente a cada 30s (não perde texto)

**Valor:**  
- Reduz atrito de criação (low barrier to start writing)
- Customização por perfil de uso (dia ocupado vs dia de reflexão)
- Draft auto-save garante nunca perder texto

**Esforço estimado:** Médio (6-8h refactor UI + auto-save)  
**Prioridade:** P1

---

### UX-04 — Sem indicador visual de "Mudou algo" antes de sair

**Funcionalidade afetada:** Editar post  
**Problema atual:**  
- Usuário entra no editor, muda título
- Se sair sem clicar "Salvar", perde tudo (sem aviso)
- Confundir: o post foi salvo ou não?

**Sugestão:**  
- Detectar mudanças no formulário (compare state inicial vs atual)
- Se houver mudanças não-salvas: mostrar badge "⚠️ Não salvo"
- Se usuário tenta sair: modal "Você tem alterações não salvas — Descartar ou Salvar?"
- Auto-save a cada 30s (reduz necessidade de clique manual)

**Valor:**  
- Evita perda acidental de conteúdo
- Padrão em Google Docs, Figma, etc (usuário espera isso)

**Esforço estimado:** Médio (4-5h)  
**Prioridade:** P1

---

### UX-05 — Archive navegação é por mês, sem contexto de ano

**Funcionalidade afetada:** ArchivesWidget  
**Problema atual:**  
- Widget mostra lista: "March", "February", "January"
- Qual ano? Se usuário tem posts desde 2024, tá confuso
- Clica "March" — não sabe se é Março 2024 ou 2026

**Sugestão:**  
- Agrupar por ano: `2026 / March`, `2025 / November`
- Usar ícone de accordion (▼/▶) para colapsar anos
- Mostrar count de posts: `2026 (12 posts) > March (2 posts)`

**Valor:**  
- Navegação de histórico (1-2 anos atrás) fica clara
- Usuário consegue clicar com confiança

**Esforço estimado:** Baixo (2-3h)  
**Prioridade:** P2

---

### UX-06 — Sem busca visual (SearchPanel existe mas não é óbvio onde está)

**Funcionalidade afetada:** SearchPanel  
**Problema atual:**  
- SearchPanel component existe no código
- Mas no UI principal não aparece botão "🔍 Buscar"
- Usuário não descobre que pode buscar posts

**Sugestão:**  
- Adicionar botão "🔍" na barra de título
- Ao clicar: modal/panel com campo de busca
- Busca real-time: `text ILIKE %query%` nos posts publicados
- Mostrar resultados com highlight do termo buscado

**Valor:**  
- Descoberta de próprio conteúdo (encontrar post antigo rápido)
- Padrão esperado (todo app tem busca)

**Esforço estimado:** Baixo-Médio (3-4h refactor + API busca)  
**Prioridade:** P2

---

## DIMENSÃO 2 — Funcionalidades Faltantes de Alto Valor

### FEAT-01 — Dashboard de Mood: Trends & Heatmap Interativo

**Descrição (linguagem de usuário):**  
Visualizar seu estado emocional ao longo do tempo em um gráfico. Ver padrões: "Fico triste às terças?" "Tenho dias bons em X meses?"

**Problema que resolve:**  
Usuário tem mood_heatmap component mas não está integrado ao fluxo principal. Sem dashboard visual, usuário não consegue explorar padrões emocionais (valor principal de um diário rastreador de mood).

**Critério de done:**  
- Novo tab/seção "Mood" no sidebar
- Heatmap mostra últimos 12 meses (cor mais intensa = mood melhor)
- Gráfico de linha: contagem por mood (Happy, Sad, etc) por semana
- Filtro por período (últimos 30 dias, 3 meses, 1 ano)
- Cliq em dia/semana → mostra posts daquele período

**Dependências técnicas:**  
- Tabela `posts` já tem `metadata JSONB` (pode armazenar mood)
- Hook `useMoodAnalytics.ts` existe
- MoodHeatmap.tsx component existe (precisa de dados)

**Prioridade:** P1 (É diferenciador vs blocos de notas comuns)

---

### FEAT-02 — Auto-save de Rascunho: Nunca perca o que escrever

**Descrição:**  
Enquanto escreve um novo post, o sistema salva automaticamente a cada 30 segundos para o servidor. Se browser fecha ou perde conexão, volta na próxima vez.

**Problema que resolve:**  
- Power outage? Perder 500 palavras escritas
- Navegador crash? Texto desaparece
- Usuario sai sem "Salvar" (ou esquece)
- Reduces key friction de app pessoal

**Critério de done:**  
- Ao criar novo post, mostrar badge "Draft (auto-saving...)"
- A cada 30s de inatividade: POST para criar/atualizar draft
- Se usuário voltar: detectar draft + perguntar "Continuar no rascunho?"
- Draft fica em estado "draft" até usuário clicar "Publish"

**Dependências técnicas:**  
- Backend precisa de endpoint `POST /api/posts/draft` e `PUT /api/posts/:id/draft`
- Frontend: hook para gerencie timer de auto-save
- localStorage para backup local (fail-safe se servidor offline)

**Prioridade:** P1 (Protege data do usuário)

---

### FEAT-03 — Estatísticas de Escrita: Rastrear Produtividade

**Descrição:**  
Ver métricas: "Escrevi 5 posts este mês" "2,340 palavras em Fevereiro" "Dia mais ativo: Sunday"

**Problema que resolve:**  
Usuário que quer ver progresso, visualizar produção pessoal. Dados já existem no BD — só precisa de dashboard.

**Critério de done:**  
- Novo tab "Stats" na sidebar
- Card 1: Posts publicados (mês atual vs mês passado, em % ou número)
- Card 2: Palavras escritas (total + por mês em gráfico de colunas)
- Card 3: Dias mais ativos (qua vs dom — quando escrevo mais?)
- Card 4: Mood distribuição (% Happy vs Sad vs Neutral)
- Filtro por período (últimos 30 dias, 90 dias, 1 ano)

**Dependências técnicas:**  
- 3 queries SQL no backend: `COUNT(posts) GROUP BY DATE(created_at)`, `SUM(LENGTH(content))`, etc
- Frontend: Charts library (recharts, chart.js, etc)

**Prioridade:** P1 (Gamification → retenção)

---

### FEAT-04 — Full-text Search em Posts

**Descrição:**  
Digitar "coffee" → mostra todos os posts que mencionam coffee (título, conteúdo, tags)

**Problema que resolve:**  
- Usuário quer re-encontrar post antigo (qual post falei sobre viagem a Paris?)
- SearchPanel existe mas não está no fluxo

**Critério de done:**  
- Campo de busca visível no header/sidebar
- Busca em real-time: resultados aparecem enquanto digita
- Match em: título, conteúdo, tags
- Highlight do termo nos resultados
- Se vazio: mostrar posts recentes (fallback)

**Dependências técnicas:**  
- Backend: `SELECT * FROM posts WHERE status='published' AND (title ILIKE $1 OR content ILIKE $1 OR tags ILIKE $1)`
- Frontend: debounce query a cada 300ms (não sobrecarregar server)

**Prioridade:** P1 (Necessário para app útil)

---

### FEAT-05 — Filtro por Data/Período no Feed

**Descrição:**  
Mostrar apenas posts de "Janeiro 2026" ou "últimos 7 dias"

**Problema que resolve:**  
- Archive widget mostra por mês, mas feed sempre mostra tudo
- Usuário quer reler posts de uma semana específica

**Critério de done:**  
- Botão "Filter" no header
- Modal com: "Data inicial", "Data final", "Apply"
- Feed filtra e mostra apenas posts no intervalo
- Mostrar quantidade: "3 posts em Jan 15-20"

**Dependências técnicas:**  
- Backend query: `WHERE created_at BETWEEN $1 AND $2`
- Frontend state: manage `filterStart` e `filterEnd`

**Prioridade:** P2

---

### FEAT-06 — Markdown Preview Real-Time

**Descrição:**  
Enquanto edita post, ao lado direito mostra como vai ficar formatado (negrito, itálico, links, etc)

**Problema que resolve:**  
- Usuário escreve markdown mas não vê resultado até publicar
- Preview in backend (renderizado depois)
- Expected padrão (Medium, Ghost, etc)

**Critério de done:**  
- Modal de edição: lado esquerdo = editor, lado direito = preview
- Preview atualiza em real-time (debounce 200ms)
- Suporta: **bold**, *italic*, [links](url), # Títulos, - listas, ```code```
- Mobile: toggle preview/edit (lado a lado é difícil em tela pequena)

**Dependências técnicas:**  
- Frontend: marked.js ou remark para parseMarkdown
- Backend já renderiza — pode reuser lógica

**Prioridade:** P2

---

### FEAT-07 — Publicar Seletivamente (Share Post Links)

**Descrição:**  
Gerar link único para compartilhamento: "Leia meu post sobre viagem" → link público, qualquer um consegue ler

**Problema que resolve:**  
- Hoje posts são privados (só author consegue ver)
- Se quer compartilhar post específico, não consegue
- Feature: quando status='published', gerar URL pública

**Critério de done:**  
- Ao publicar post: mostrar ícone "Share"
- Clica: copia para clipboard permanence de link: `/p/slug-do-post`
- Link público não exige login (qualquer um consegue ler)
- Comentários ainda exigem aprovação (ou bloquear?)
- Reactions anônimas (por session/IP) funcionam

**Dependências técnicas:**  
- Backend: endpoint `GET /public/p/:slug` (sem auth)
- Frontend: "Copy link" button
- Considerar: SEO? Meta tags para preview?

**Prioridade:** P2 (Não essencial para app pessoal, mas good-to-have)

---

## DIMENSÃO 3 — Funcionalidades Existentes para Melhorar

| Feature | Estado Atual | Melhoria Sugerida | Impacto | Esforço |
|---------|--------------|------------------|---------|---------|
| **Reactions** | Mostra count (likes=2) mas sem indicador visual no feed | Adicionar botão clicável com ícone (😊 👍 🔥) ao lado do post | Médio | Médio (4h) |
| **Comments** | Modal para aprovar comentários (fluxo backend-only) | Painel de aprovação visual no admin (QA report) | Médio | Médio (5h) |
| **Tags/Topics** | Widget mostra lista estática | Tornar *clicável* para filtrar posts por tag | Alto | Baixo (2h) |
| **Timeline View** | Component existe mas não integrado no main feed | Adicionar toggle "View: List / Timeline" na header | Médio | Médio (4h) |
| **Dark Mode** | DarkModeToggle component isolado | Integrar persistência em localStorage + sincronizar entre abas | Baixo | Baixo (1.5h) |
| **Keyboard Shortcuts** | Component existe mas atalhos não implementados | Implementar shortcuts: `Ctrl+K` = busca, `Ctrl+N` = novo post, `Ctrl+S` = save | Médio | Médio (6h) |
| **Archive** (resolvido mas pode melhorar) | Mostra posts por mês | Adicionar view "Timeline de posts" (grid de capas) em lugar de lista | Médio | Médio (5h) |

---

## DIMENSÃO 4 — Funcionalidades para Remover ou Simplificar

### REMOVE-01 — SerendipityModal (Proposta de Simplificação)

**Feature atual:**  
Component `SerendipityModal` existe mas propósito não é claro. Assumir que é "Mostrar post aleatório da base antiga para releitura".

**Motivo para simplificar:**  
- Para app pessoal (uso solitário), "sugestão aleatória" não tem valor
- Se quer reler post antigo, usa Archive ou Busca
- Component adiciona UI clutter sem ROI
- Não há behavioral data que diga que usuário clica nisso

**Substituto sugerido:**  
- Remover SerendipityModal
- Se quiser "surpresa": adicionar botão "📖 Random post" no Archive (1 clique)
- Ou retirar completamente (usuário nunca pediu)

**Prioridade para remover:** P3 (backlog, se tempo permitir)

---

### REMOVE-02 — Comments com Aprovação Manual (Proposta)

**Feature atual:**  
Qualquer um comenta. Admin vê na UI backend e precisa clicar "Approve" para aparecer.

**Motivo para simplificar:**  
- App é pessoal (usuário único)
- Comments são raros (próxima relação é admin consigo mesmo)
- Aprovação manual = overhead desnecessário
- Dados no BD: comentários não aprovados acumulam lixo

**Substituto sugerido:**  
- **Opção A:** Remover comments totalmente (feature não usa ninguém)
- **Opção B:** Auto-approve todos comentários (remover step de aprovação)
- **Opção C:** Se comentário for do próprio autor (email=admin), auto-approve

**Recomendação:** Remover comments totalmente (Sprint 2, se tempo não houver)  
**Prioridade:** P3

---

### REMOVE-03 — Posts com Status "Draft" vs "Archived" (Simplificar)

**Feature atual:**  
Posts podem ser: draft, published, archived (3 states)

**Motivo para simplificar:**  
- Draft: vira published (não envelhecimento)
- Archived: usuário nunca mencionou "preciso arquivar post"
- 3 states = mais complexidade no editor

**Substituto sugerido:**  
- Manter apenas 2 states: `published=false` (rascunho), `published=true` (visível)
- Home feed mostra só `published=true`
- Admin pode listar também `published=false` (seu backlog de rascunhos)
- Migração: `archived → published=false`

**Prioridade para simplificar:** P3 (refactor de schema)

---

## DIMENSÃO 5 — Roadmap de 3 Fases

---

### **v1.1 — Quick Wins (1 semana)**

*Mudanças pequenas, alto impacto, baixo risco. Sem dependências técnicas grandes.*

| Item | Descrição | Esforço | Impacto |
|------|-----------|---------|---------|
| **UX-01** | Adicionar spinner "Salvando..." em modais | 1.5h | Alto (reduz frustração) |
| **UX-05** | Archive grupar por ano (accordion) | 2h | Médio (UX de navegação) |
| **UX-06** | Botão de busca visível + SearchPanel integrado | 3h | Alto (descoberta) |
| **FEAT-04** | Full-text search básico (backend query + frontend) | 4h | Alto (essencial) |
| **FEAT-03** — Phase 1 | Cards de stats: posts/mês, palavras/mês | 3h | Médio (gamification) |

**Total Sprint 1.1:** ~13h (1 dev, 1-2 dias)  
**Resultado esperado:** App fica 30% mais "polido" e descobrível

---

### **v1.2 — Features de Valor (2-4 semanas)**

*Features que aumentam retenção: mood tracking visual, auto-save, UX melhorado.*

| Item | Descrição | Esforço | Impacto |
|------|-----------|---------|---------|
| **UX-02** | Editar bio inline (refactor BioEditModal) | 3h | Médio |
| **UX-03** | Criar post em 2 passos (Modo Rápido vs Completo) | 8h | Alto (aumenta posting frequency) |
| **UX-04** | Detecção de mudanças não-salvas + modal de aviso | 4h | Médio (proteção de data) |
| **FEAT-02** | Draft auto-save a cada 30s | 6h | Alto (proteção de data) |
| **FEAT-01** — Dashboard Mood | Heatmap + trends 12 meses | 8h | Alto (diferenciador) |
| **FEAT-06** | Markdown preview real-time | 5h | Médio (UX escrita) |
| **Refactor: Tags** | TopicsWidget tornar clicável (filtro) | 2h | Médio |
| **Refactor: Dark mode** | Persistência em localStorage + sync | 1.5h | Baixo |

**Total Sprint 1.2:** ~37.5h (~3 devs, 2-3 semanas)  
**Resultado esperado:** Produto 80% de seu potencial. Retenção semanal ↑ 40%

---

### **v2.0 — Evolução do Produto (3+ meses, futuro)**

*Depois que core está sólido: amplitude, exportação, colaboração, infra.*

| Item | Descrição | Esforço | Impacto | Bloqueador |
|------|-----------|---------|---------|-----------|
| **FEAT-05** | Filtro por período (data inicial/final) | 3h | Médio | Nenhum |
| **FEAT-07** | Share post públicos (gerar links) | 4h | Médio | Nenhum |
| **D-02: Storage** | Upload real de imagens (AWS S3 ou similar) | 8h | Alto | Decisão de infra |
| **Menções/Backlinks** | `[Outro post](post-slug)` criar link entre posts | 6h | Médio | Nenhum |
| **Export full backup** | Download JSON de todos posts (backup local) | 4h | Médio | Nenhum |
| **D-03: Cache** | Redis para cache de stats (mood dashboard) | 5h | Médio | Decisão de infra |
| **Sincronização multi-aba** | Editar em aba A, aba B vê mudança em real-time | 6h | Baixo | WebSocket ou polling |
| **Remover: Comments** | Deletar sistema de comments (simplify) | 2h | Baixo | Nenhum |
| **Remover: Serendipity** | Deletar SerendipityModal | 0.5h | Nenhum | Nenhum |

**Total Sprint v2.0:** ~40h (quando D-02 e D-03 resolvidas)  
**Resultado esperado:** Produto escalável, pronto para eventuais dados massivos, exportação/portabilidade garantida

---

## Tabela de Priorização Final

Ordenada por: **Prioridade → Impacto → Esforço (menor primeiro)**

| ID | Sugestão | Tipo | Prioridade | Esforço | Impacto | Sprint |
|----|----|------|-----------|---------|---------|--------|
| UX-01 | Feedback "Salvando..."  | UX | P1 | 1.5h | Alto | v1.1 |
| UX-03 | Criar post em 2 passos | UX | P1 | 8h | Alto | v1.2 |
| UX-04 | Mudanças não-salvas warning | UX | P1 | 4h | Médio | v1.2 |
| FEAT-02 | Draft auto-save | Feature | P1 | 6h | Alto | v1.2 |
| FEAT-04 | Full-text search | Feature | P1 | 4h | Alto | v1.1 |
| FEAT-03 | Estatísticas escrita | Feature | P1 | 3-6h | Alto | v1.1-v1.2 |
| FEAT-01 | Mood dashboard | Feature | P1 | 8h | Alto | v1.2 |
| UX-02 | Bio inline edit | UX | P2 | 3h | Médio | v1.2 |
| UX-05 | Archive por ano | UX | P2 | 2h | Médio | v1.1 |
| UX-06 | Botão Busca visível | UX | P2 | 3h | Alto | v1.1 |
| FEAT-05 | Filtro por período | Feature | P2 | 3h | Médio | v2.0 |
| FEAT-06 | Markdown preview | Feature | P2 | 5h | Médio | v1.2 |
| FEAT-07 | Share post links | Feature | P2 | 4h | Médio | v2.0 |
| Refactor: Topics | Tornar clicável | Refactor | P2 | 2h | Médio | v1.2 |
| Refactor: Dark mode | Persistência | Refactor | P2 | 1.5h | Baixo | v1.2 |
| Refactor: Keyboard | Atalhos implementados | Refactor | P3 | 6h | Médio | Backlog |
| REMOVE-01 | Remover SerendipityModal | Removal | P3 | 0.5h | Nenhum | v2.0 |
| REMOVE-02 | Remover Comments | Removal | P3 | 2-4h | Nenhum | v2.0 |
| REMOVE-03 | Simplificar 3 states → 2 | Removal | P3 | 4-6h | Baixo | v2.0 |

---

## 📈 Impacto Esperado por Sprint

### v1.1 (Quick Wins)
- **Tempo de Sprint:** 1-2 dias (1 dev)
- **Resultado:** Melhor UX de busca + stats básicas
- **KPI:** Tempo médio para encontrar post antigo ↓ 60%

### v1.2 (Features)
- **Tempo de Sprint:** 2-3 semanas (2-3 devs)
- **Resultado:** Auto-save, mood dashboard, fluxo de criação simples
- **KPI:** Frequência semanal de posts ↑ 30-50%; Draft auto-save = 0 perda de dados

### v2.0 (Escalabilidade)
- **Tempo de Sprint:** 3+ meses (quando D-02, D-03 resolvidas)
- **Resultado:** Produto robusto, exportável, pronto para crescimento
- **KPI:** Múltiplos dispositivos sincronizados; backup garantido

---

## ⚠️ Riscos & Suposições

| Risco | Mitigação |
|-------|-----------|
| D-02 (Storage) bloqueia FEAT-07 (imagens no post) | Começar v1.1-v1.2 sem imagens; deixar D-02 para v2.0 |
| D-03 (Redis) faz mood dashboard lento sem cache | Implementar FEAT-01 com queries simples; Redis é optimization, não blocker |
| Auto-save (FEAT-02) multiplica POSTs ao servidor | Implementar rate limiting + debounce 30s; teste com 100 edições/dia |
| Simplificar 3 states → 2 quebra posts existentes | Migração de schema: `archived=true → published=false` (uma query) |
| Usuário não quer Mood dashboard | Validar com user testing antes de gastar 8h (pode-se cortar se feedback negativo) |

---

## 🎯 Recomendações Finais

### Para o Tech Lead:
1. **Priorizar v1.1 esta semana** — 13h é deliverable e reduz frustração
2. **Bloquear D-02 e D-03 ASAP** — são bloqueadores de v2.0 value
3. **User testing before v1.2** — validar que Mood dashboard é realmente diferenciador
4. **Simplifier approach** — remover comments + serendipity (0% usage, 100% clutter)

### Para o PO/Product:
1. **Core ficou sólido** (Sprint 1) — próximo step é retenção (Sprint 2)
2. **v1.1 = confidence builder** — usuário vê melhorias rápido
3. **v1.2 = differentiation** — mood tracking visual é o que faz diferente vs Notion
4. **v2.0 = stability** — quando infra decisions (D-02, D-03) forem resolvidas

---

**Documento criado:** Março 4, 2026  
**Próxima revisão:** Após v1.1 delivery (em 1 semana)
