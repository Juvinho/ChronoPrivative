# BUGS E DECISÕES — ChronoPrivative
> Última atualização: 04/03/2026

---

## Histórico de Bugs

### BUG-1 — Conflito de porta: frontend tentando acessar backend na porta 3001

| Campo          | Detalhe                                                                 |
|----------------|-------------------------------------------------------------------------|
| **Severidade** | Alta                                                                    |
| **Sintoma**    | Todas as chamadas à API retornavam `ECONNREFUSED` / `net::ERR_CONNECTION_REFUSED` |
| **Componentes afetados** | `app/page.tsx`, `hooks/use-posts.ts`                        |
| **Causa raiz** | URLs hardcoded com `localhost:3001` enquanto backend rodava na porta 4000 (ou 3002) |
| **Ocorrências** | 4 — `app/page.tsx` (×3) e `hooks/use-posts.ts` (×1)                 |
| **Solução**    | 1. Criou `.env.local` com `NEXT_PUBLIC_API_URL=http://localhost:4000`<br>2. Substituiu todas as ocorrências por `process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:4000'`<br>3. `backend/.env`: `PORT=4000` |
| **Status**     | ✅ Resolvido                                                            |

---

### BUG-2 — 404 em `GET /api/user/topics` no TopicsWidget

| Campo          | Detalhe                                                                 |
|----------------|-------------------------------------------------------------------------|
| **Severidade** | Média                                                                   |
| **Sintoma**    | Widget de tópicos retornava erro 404 ou dados vazios                    |
| **Causa raiz** | `fetch('/api/user/topics')` — URL relativa resolvia para `localhost:3000/api/user/topics` (Next.js), não para o backend Express |
| **Solução**    | Substituir por `fetch(\`${apiUrl}/api/user/topics\`)` onde `apiUrl = process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:4000'` |
| **Status**     | ✅ Resolvido                                                            |

---

### BUG-3 — Tabela `topics` não existia no banco (migrations não executadas)

| Campo          | Detalhe                                                                 |
|----------------|-------------------------------------------------------------------------|
| **Severidade** | Alta                                                                    |
| **Sintoma**    | `GET /api/user/topics` retornava HTTP 500 com erro `relation "topics" does not exist` |
| **Causa raiz** | O arquivo `migrations.sql` nunca havia sido executado no banco de desenvolvimento. O banco existia mas as tabelas não foram criadas. |
| **Diagnóstico** | `psql -c "\dt"` confirmou ausência das tabelas `topics`, `reactions`, `views_log` |
| **Solução**    | 1. Executou `psql ... -f migrations.sql` para criar todas as tabelas<br>2. Criou `backend/scripts/migrate.js` para automatizar<br>3. Adicionou `"migrate": "node scripts/migrate.js"` no `backend/package.json`<br>4. Populou via `node scripts/seed-and-migrate.js` (5 tópicos + 2 posts) |
| **Status**     | ✅ Resolvido                                                            |

---

### BUG-4 — CSS desapareceu da aplicação (styles não renderizados)

| Campo          | Detalhe                                                                 |
|----------------|-------------------------------------------------------------------------|
| **Severidade** | Alta                                                                    |
| **Sintoma**    | Aplicação carregava sem nenhum estilo — página em branco sem cores, fontes ou layout |
| **Causa raiz** | `postcss.config.mjs` continha `autoprefixer: {}` como plugin. No **Tailwind CSS v4**, o `@tailwindcss/postcss` já inclui vendor prefixes internamente. Ter `autoprefixer` como plugin PostCSS adicional causava conflito de processamento que corrompia silenciosamente o CSS de saída. |
| **Evidência**  | Build reportava `✓ Compiled successfully` sem erros — o problema era de output CSS, não de compilação TypeScript |
| **Solução**    | Removeu `autoprefixer: {}` do `postcss.config.mjs`, deixando apenas `'@tailwindcss/postcss': {}` |
| **Arquivo alterado** | `postcss.config.mjs`                                            |
| **Status**     | ✅ Resolvido                                                            |

---

### BUG-5 — `handleDelete` retornando 404 ("Failed to delete post")

| Campo          | Detalhe                                                                 |
|----------------|-------------------------------------------------------------------------|
| **Severidade** | Alta                                                                    |
| **Sintoma**    | Clicar em "excluir" exibia erro "Failed to delete post: 404 Not Found" |
| **Localização**| `app/page.tsx:346` (função `handleDelete`)                             |
| **Causa raiz 1** | URL errada: frontend chamava `DELETE /api/posts/${id}` mas a rota no backend é `DELETE /api/posts/admin/:id` |
| **Causa raiz 2** | `localStorage.getItem('auth_token')` retornava `null` porque o `LoginScreen` nunca havia chamado o backend para obter um JWT — apenas validava a senha localmente |
| **Solução**    | 1. Corrigiu URL em `handleDelete`: `/api/posts/${id}` → `/api/posts/admin/${id}`<br>2. Corrigiu URLs em `handlePublish` e `handleUndo`: `POST /api/posts` → `POST /api/posts/admin`<br>3. Adicionou `fetch('/api/auth/login')` no `LoginScreen.handleSubmit()` para obter e armazenar JWT<br>4. Executou `node scripts/update-admin-hash.js` para garantir hash bcrypt válido no banco |
| **Verificação**| `node scripts/test-e2e-delete.js` → login 200 ✅, create 201 ✅, delete 200 ✅ |
| **Status**     | ✅ Resolvido                                                            |

---

### BUG-6 — Archives exibindo vazio ou em ordem alfabética

| Campo          | Detalhe                                                                 |
|----------------|-------------------------------------------------------------------------|
| **Severidade** | Média                                                                   |
| **Sintoma A**  | Widget de archives exibia lista vazia                                   |
| **Sintoma B**  | Meses eram ordenados alfabeticamente ("April" antes de "February")     |
| **Causa raiz A** | Componente usava `DEFAULT_ARCHIVES` hardcoded e não chamava API. Endpoint `GET /api/posts/archives` não existia no backend. |
| **Causa raiz B** | `months.sort()` fazia ordenação lexicográfica de strings (`"April" < "February"`) |
| **Solução**    | 1. Criou endpoint `GET /api/posts/archives` em `postController.js` com `DATE_TRUNC('month', created_at) ... GROUP BY month ORDER BY month DESC`<br>2. Registrou rota em `backend/src/routes/posts.js` **antes** de `/:slug` (ordem crítica)<br>3. Refatorou `ArchivesWidget` para auto-fetch com `useEffect`<br>4. Substituiu `months.sort()` por `[...archives].sort((a,b) => new Date(b.month).getTime() - new Date(a.month).getTime())` |
| **Status**     | ✅ Resolvido                                                            |

---

### BUG-7 — Build Next.js travando em "Finalizing page optimization"

| Campo          | Detalhe                                                                 |
|----------------|-------------------------------------------------------------------------|
| **Severidade** | Baixa (cosmética)                                                       |
| **Sintoma**    | `npm run build` trava indefinidamente após `✓ Generating static pages (4/4)` |
| **Causa raiz** | `output: 'standalone'` em `next.config.ts` combinado com o ambiente Windows causa lentidão/travamento no estágio de coleta de traces |
| **Impacto real**| Nenhum — o código TypeScript e o CSS compilam corretamente (✓ Compiled successfully). O problema é apenas no bundle de traces para standalone |
| **Solução temporária** | Usar `npm run dev` para desenvolvimento local |
| **Solução definitiva** | [ TODO: remover `output: 'standalone'` se não for usar Docker, ou verificar compatibilidade com a versão do Node no Windows ] |
| **Status**     | ⚠️ Parcialmente resolvido — dev funciona, build standalone trava     |

---

## Decisões que NÃO devem ser revertidas

### D1 — Rota `/api/posts/archives` antes de `/:slug`

**Regra:** Em `backend/src/routes/posts.js`, `router.get('/archives', ...)` deve sempre vir **antes** de `router.get('/:slug', ...)`.

**Motivo:** Express avalia rotas em ordem de registro. Se `/:slug` vier primeiro, a string `"archives"` é capturada como parâmetro de slug, causando 404 ou erro de banco tentando buscar post com slug `archives`.

**Consequência de reverter:** `GET /api/posts/archives` quebra imediatamente.

---

### D2 — Remover `autoprefixer` do postcss.config.mjs

**Regra:** O arquivo `postcss.config.mjs` deve conter **apenas** `'@tailwindcss/postcss': {}`. Nunca adicionar `autoprefixer`.

**Motivo:** Tailwind CSS v4 processa vendor prefixes internamente. Adicionar `autoprefixer` como plugin adicional cria duplo processamento que corrompe silenciosamente o CSS gerado (ver Bug 4).

**Consequência de reverter:** Todo o CSS da aplicação desaparece sem erros de compilação visíveis.

---

### D3 — URLs de API protegida com prefixo `/admin`

**Regra:** Rotas que modificam dados de posts **devem** usar o prefixo `/admin`:
- `POST /api/posts/admin` (criar)
- `PUT /api/posts/admin/:id` (editar)
- `DELETE /api/posts/admin/:id` (excluir)
- `PATCH /api/posts/admin/:id/status` (status)

**Motivo:** Separação semântica entre rotas públicas e protegidas. O `authMiddleware` só está aplicado nessas rotas.

**Consequência de reverter:** Qualquer chamada sem o prefixo `/admin` retorna 404 (rota não encontrada).

---

### D4 — LoginScreen deve chamar backend para obter JWT

**Regra:** `components/login-screen.tsx` deve chamar `POST /api/auth/login` após validação local bem-sucedida e armazenar o token em `localStorage.setItem('auth_token', token)`.

**Motivo:** Sem o JWT no localStorage, todas as operações protegidas (criar, editar, excluir) retornam 401.

**Nota:** A chamada é best-effort (catch vazio) — a UI desbloqueia independente. Mas sem ela, o JWT nunca é obtido.

**Consequência de reverter:** Operações admin (publicar, deletar, editar) retornam 401.

---

### D5 — Porta do backend: 4000 (fallback: 3002)

**Regra:** Backend roda na porta 4000 (`PORT=4000` em `backend/.env`). O fallback no `server.js` é 3002 (não 3000, para não conflitar com o frontend).

**Motivo:** Frontend roda em 3000. Se ambos usassem 3000, o segundo a iniciar falharia com `EADDRINUSE`.

**Consequência de reverter:** Alterar a porta requer atualização consistente de: `backend/.env`, `backend/.env.example`, `.env.local` (`NEXT_PUBLIC_API_URL`) e todos os scripts de teste.

---

### D6 — Storage de imagem: disco local para esta entrega

**Decisão (Infra Lead · 04/03/2026):** Opção A — disco local (`backend/uploads/`) via `multer`. S3 e Cloudinary fora de escopo.

**Regra:** O endpoint `POST /api/posts/:id/upload` deve usar `multer` com destino `./uploads/`. O Express deve servir os arquivos estaticamente em `GET /uploads/:filename`.

**Variáveis de ambiente obrigatórias:**
```env
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=5
```

**Motivo:** Sem cloud definido e sem budget para S3/Cloudinary nesta fase. Disco local é suficiente para o volume atual.

**Consequência de contornar:** PRs que introduzirem `@aws-sdk` ou `cloudinary` serão bloqueados na revisão até decisão formal de cloud.

**Path de migração futuro:** Quando produção for definida em cloud, substituir a implementação `multer` local por SDK de storage externo. A interface do endpoint (`POST /upload`, retorna URL) permanece a mesma — sem breaking change para o frontend.

---

### D7 — Blacklist JWT: tabela PostgreSQL `revoked_tokens` (sem Redis)

**Decisão (Infra Lead · 04/03/2026):** Opção B — PostgreSQL. Redis não será provisionado nesta fase.

**Regra:** `authMiddleware.js` deve consultar a tabela `revoked_tokens` ao validar tokens, substituindo o `Set` em memória. Migration obrigatória antes do deploy:

```sql
CREATE TABLE IF NOT EXISTS revoked_tokens (
    token_hash TEXT PRIMARY KEY,
    expires_at TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires ON revoked_tokens(expires_at);
```

**Cleanup de tokens expirados:** implementar via cron job no servidor ou trigger de banco — a critério do Backend Dev. Sugestão mínima: `DELETE FROM revoked_tokens WHERE expires_at < NOW()` rodando a cada hora.

**Motivo:** Redis não está no stack desta fase. PostgreSQL já está provisionado e a latência adicional de 1 query por request autenticado é aceitável para o volume esperado.

**Consequência de contornar:** Não instalar `redis`, `ioredis` ou `@redis/client`. Se instalado sem aprovação de infra, será removido na revisão.

---

## Decisões Pendentes — aguardando resposta de Produto / Infraestrutura

> Registradas por **Juvinho** · 04/03/2026  
> Origem: `MISSÃO-EQUIPE.md` · Bloqueios identificados durante Sprint 1

### ✅ D-01A — Busca avançada (SearchPanel + useSearch) — no escopo desta entrega?

| Campo             | Detalhe |
|-------------------|---------|
| **Quem decide**   | Produto |
| **Reportado por** | Juvinho · 04/03/2026 |
| **Respondido por**| PO · 04/03/2026 |
| **Status**        | ✅ Respondida |
| **Decisão**       | **PRÓXIMA FASE** — manter código, não implementar endpoint nesta entrega |
| **Motivo**        | O fluxo principal do sistema (escrever e publicar entradas diárias) acabou de ser estabilizado no Sprint 1. Busca avançada é uma funcionalidade de consumo de conteúfo, não de produção — não há volume de posts suficiente no sistema ainda para justificar a prioridade desta entrega. |
| **Prioridade**    | Baixa — entra no backlog v2 |
| **Próximo passo** | Criar ticket de backlog v2: `[v2] Implementar GET /api/posts/search com suporte a q, tags, moods, weather, dateFrom, dateTo e integrar SearchPanel` |
| **Restrição**     | Não remover `SearchPanel.tsx` nem `hooks/useSearch.ts` do código — preservar para v2. Não implementar endpoint sem aprovacao formal desta decisão. |
| **C-07 desbloqueado?** | **Não** — C-07 é formalmente arquivado nesta entrega. Backend não implementa `/api/posts/search` nem `/api/posts/analytics/mood` até v2. |

---

### ✅ D-01B — Analytics de mood (MoodHeatmap + useMoodAnalytics) — no escopo desta entrega?

| Campo             | Detalhe |
|-------------------|---------|
| **Quem decide**   | Produto |
| **Reportado por** | Juvinho · 04/03/2026 |
| **Respondido por**| PO · 04/03/2026 |
| **Status**        | ✅ Respondida |
| **Decisão**       | **PRÓXIMA FASE** — manter código, não implementar endpoint nesta entrega |
| **Motivo**        | Analytics de humor são significativos apenas com histórico acumulado de entradas — o sistema nunca teve posts publicados corretamente até o Sprint 1. Implementar a visualização agora produziria um heatmap vazio por semanas. Decisão: deixar os dados acumularem e lançar a feature em v2 com dados reais para validar o valor. |
| **Prioridade**    | Baixa — entra no backlog v2, após busca avançada |
| **Próximo passo** | Criar ticket de backlog v2: `[v2] Implementar GET /api/posts/analytics/mood e integrar MoodHeatmap` (depende de C-04 estar aplicado — já está) |
| **Restrição**     | Não remover `MoodHeatmap.tsx` nem `hooks/useMoodAnalytics.ts` do código. Coluna `metadata` (C-04) já está coletando dados — bloco está ativo sem custo. |

---

### ✅ D-02 — Upload de imagem: armazenamento local (disco) ou storage externo (S3 / Cloudinary)?

| Campo             | Detalhe |
|-------------------|---------|
| **Quem decide**   | Infraestrutura / Produto |
| **Reportado por** | Juvinho · 04/03/2026 |
| **Respondido por**| Infra Lead · 04/03/2026 |
| **Status**        | ✅ Respondida — ver D6 em "Decisões que NÃO devem ser revertidas" |
| **Decisão**       | **Opção A — disco local (`/uploads/`)** para esta entrega |
| **Motivo**        | Não há cloud definido para produção ainda e não há budget aprovado para S3/Cloudinary nesta fase. Disco local via `multer` é suficiente para o ambiente atual e não bloqueia o desenvolvimento. A migração para storage externo será feita em sprint dedicado quando o ambiente de produção for provisionado. |
| **Pré-requisitos operacionais** | Criar diretório `backend/uploads/` e garantir que está no `.gitignore`. Configurar serving estático no Express para expor `GET /uploads/:filename`. Confirmar limite de tamanho de upload (padrão: 5MB). |
| **Variáveis de ambiente** | `UPLOAD_DIR=./uploads` · `MAX_UPLOAD_SIZE_MB=5` |
| **Restrição**     | Não usar S3/Cloudinary nesta entrega. Qualquer PR que introduza SDK `@aws-sdk` ou `cloudinary` será bloqueado na revisão. |

---

### ✅ D-03 — Redis estará disponível no ambiente de produção?

| Campo             | Detalhe |
|-------------------|---------|
| **Quem decide**   | Infraestrutura |
| **Reportado por** | Juvinho · 04/03/2026 |
| **Respondido por**| Infra Lead · 04/03/2026 |
| **Status**        | ✅ Respondida — ver D7 em "Decisões que NÃO devem ser revertidas" |
| **Decisão**       | **Opção B — tabela PostgreSQL `revoked_tokens`** · Redis **não** será provisionado nesta fase |
| **Motivo**        | Redis é um novo serviço com custo operacional (memória dedicada, configuração, monitoramento) que não está no escopo de infraestrutura desta entrega. O banco PostgreSQL já está provisionado e disponível. A solução com tabela `revoked_tokens` cobre o requisito de segurança sem adicionar dependência nova, com custo de latência desprezível para o volume de uso esperado (sistema de uso pessoal/pequeno time). |
| **Pré-requisitos operacionais** | Backend Dev deve criar tabela `revoked_tokens` via migration. Configurar job de cleanup (cron ou trigger) para remover tokens com `expires_at < NOW()`. |
| **Migration necessária** | `CREATE TABLE IF NOT EXISTS revoked_tokens (token_hash TEXT PRIMARY KEY, expires_at TIMESTAMP NOT NULL);` · `CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires ON revoked_tokens(expires_at);` |
| **Variáveis de ambiente** | Nenhuma nova — usa o mesmo `DATABASE_URL` / pool existente. |
| **Restrição**     | Não instalar `redis`, `ioredis` ou `@redis/client` nesta entrega. Se Redis for adicionado ao stack no futuro, a tabela `revoked_tokens` pode coexistir como fallback. |

---

### ❌ D-04 — `topics` e `tags` são a mesma entidade ou entidades separadas?

| Campo             | Detalhe |
|-------------------|---------|
| **Quem decide**   | Produto / Backend Lead |
| **Reportado por** | Juvinho · 04/03/2026 |
| **Status**        | ⏳ Aguardando resposta |
| **Impacto**       | A-04 (`topics.count`) e a query de JOIN em `getTopics` não podem ser finalizadas sem esta definição. O seletor de TAG no formulário de criação de post popula `post_tags` (tabela `tags`) — mas o widget lateral exibe `topics` (tabela separada). Podem ser a mesma coisa com nomes diferentes, ou entidades com semânticas distintas. |
| **Código afetado**| `backend/src/controllers/userController.js` · `getTopics`; tabelas `tags`, `post_tags`, `topics` |
| **Cenários possíveis** | (a) São a mesma coisa → migrar tudo para uma entidade, remover outra; (b) São separadas → definir qual popula qual no fluxo de criação de post |

---

## Log de Bloqueios por Sprint

### Sprint 1 — 04/03/2026

| ID | Tipo | Bloqueio | Reportado por | Resolvido em |
|----|------|----------|---------------|--------------|
| C-07 | Técnico | Depende de D-01 (produto) + C-04 (migration não aplicada) | Juvinho | ✅ 04/03/2026 — arquivado: D-01A+B FASE PRÓXIMA |
| D-01 | Produto | Escopo de busca avançada não definido | Juvinho | ✅ 04/03/2026 — D-01A+B: PRÓXIMA FASE (ver acima) |
| D-02 | Infra | Storage de imagens não definido | Juvinho | ✅ 04/03/2026 — disco local (ver D6) |
| D-03 | Infra | Redis em produção não confirmado | Juvinho | ✅ 04/03/2026 — PostgreSQL (ver D7) |
| D-04 | Produto | Relação topics/tags não definida | Juvinho | — |

**Tarefas desbloqueadas no Sprint 1 (progredindo normalmente):** C-01, C-02, C-03, C-04, C-05.
