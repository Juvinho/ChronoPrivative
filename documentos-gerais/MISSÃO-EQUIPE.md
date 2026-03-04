# MISSÃO DE CORREÇÃO — CHRONOPRIVATIVE
**Tech Lead → Equipe** · 04/03/2026  
**Assignees:** Frontend Dev · Backend Dev · Full Stack Jr

---

## Situação atual

O sistema está com o fluxo de escrita completamente quebrado. Todo post criado vai direto para `draft` e some do feed. Imagem, tags e metadados são dropados silenciosamente — o usuário vê sucesso, o banco recebe lixo. Além disso, `AboutWidget` manda PUT para o Next.js em vez do Express, então bio nunca salva. 22 problemas mapeados pelo QA. Nenhuma falha é randômica: todas ocorrem em 100% das execuções. O sistema não pode ir para produção nesse estado.

---

## Sprint 1 — Fluxo de escrita funcional

> **Done quando:** criar um post via UI persiste `published` com tag e metadados corretos, e o post aparece no feed imediatamente.

---

### C-01 — Posts sempre criados como `draft`, nunca aparecem no feed

**Assignee:** Frontend Dev  
**Arquivo:** `app/page.tsx` · função `handlePublish` · linha ~276

O payload de criação não envia `status`. O backend, ao não receber o campo, insere `draft` como padrão. O feed lista apenas `published`. O resultado é que 100% dos posts criados ficam invisíveis.

**Antes:**
```js
const newPost = {
  title: postTitle || "Untitled Entry",
  content: postContent || "No content provided.",
  tag: postTag,
  metadata: { mood: postMood, weather: postWeather, listening: postListening },
  image: postImage || undefined
};
```

**Depois:**
```js
const newPost = {
  title: postTitle || "Untitled Entry",
  content: postContent || "No content provided.",
  status: 'published',
  tags: [postTag],
  cover_image_url: postImage || undefined,
  metadata: { mood: postMood, weather: postWeather, listening: postListening },
};
```

> **Critério de aceitação:** Após `handlePublish`, o post aparece no feed sem recarregar a página. `GET /api/posts` retorna o post com `status: 'published'`. Verificar no banco: `SELECT status FROM posts ORDER BY id DESC LIMIT 1;` → deve retornar `published`.

---

### C-02 + C-03 — Imagem descartada e tag nunca associada

**Assignee:** Frontend Dev  
**Arquivo:** `app/page.tsx` · `handlePublish` · linha ~276

Dois problemas no mesmo payload. `image` ≠ `cover_image_url` (backend não reconhece o campo). `tag: "LIFE"` ≠ `tags: ["LIFE"]` — o backend faz `Array.isArray(tags)` antes de processar. Ambos resultam em `NULL` e nenhuma associação na tabela `post_tags`.

Correção já incluída no bloco C-01 acima (renomear `image` → `cover_image_url` e `tag` → `tags: [postTag]`).

> **Critério de aceitação:** Após criar post com imagem e tag "LIFE": `SELECT cover_image_url FROM posts ORDER BY id DESC LIMIT 1;` → não nulo. `SELECT t.name FROM post_tags pt JOIN tags t ON pt.tag_id = t.id WHERE pt.post_id = (SELECT MAX(id) FROM posts);` → retorna `LIFE`.

---

### C-04 — Metadados (mood / weather / listening) nunca persistidos

**Assignee:** Backend Dev  
**Arquivos:** `backend/src/db/migrations.sql` · `backend/src/controllers/postController.js`

A tabela `posts` não tem coluna `metadata`. O controller recebe o campo e ignora. Executar em dois passos: migration + atualização do controller.

**Migration — adicionar ao final de `migrations.sql`:**
```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
```

**Antes (`postController.js` · `createPost` · linha ~138):**
```js
const result = await transaction(async (client) => {
  const postResult = await client.query(
    `INSERT INTO posts (title, slug, content, excerpt, cover_image_url, author_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, slug, status, created_at`,
    [title, slug, content, excerpt || null, cover_image_url || null, req.user.id, postStatus]
  );
```

**Depois:**
```js
const { title, content, excerpt, cover_image_url, status, tags, metadata } = req.body;
// ...
const result = await transaction(async (client) => {
  const postResult = await client.query(
    `INSERT INTO posts (title, slug, content, excerpt, cover_image_url, author_id, status, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, title, slug, status, created_at`,
    [title, slug, content, excerpt || null, cover_image_url || null, req.user.id, postStatus, metadata ? JSON.stringify(metadata) : '{}']
  );
```

Aplicar o mesmo padrão em `updatePost`.

> **Critério de aceitação:** Criar post com mood "Feliz". `SELECT metadata FROM posts ORDER BY id DESC LIMIT 1;` → `{"mood":"Feliz","weather":"...","listening":"..."}`.

---

### C-05 — `AboutWidget` manda PUT para o Next.js (404 garantido)

**Assignee:** Frontend Dev  
**Arquivo:** `components/AboutWidget.tsx` · linha ~35

URL relativa `/api/user/bio` resolve para `localhost:3000` (Next.js), não `localhost:4000` (Express). Não existe rota Next.js em `app/api/`. Toda tentativa de salvar bio retorna 404.

**Antes:**
```ts
const response = await fetch('/api/user/bio', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ bio: newBio }),
});
```

**Depois:**
```ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const response = await fetch(`${apiUrl}/api/user/bio`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ bio: newBio }),
});
```

> **Critério de aceitação:** Editar bio no widget → salvar → recarregar página → bio persistida. Verificar: `SELECT bio FROM users WHERE username = 'admin';` → novo valor.

---

## Sprint 2 — Integrações críticas pendentes

> **Done quando:** edição de posts funciona via modal, undo de delete não produz divergência de ID, login autentica com as credenciais corretas e `topics.count` reflete dados reais.

---

### C-09 — Undo de delete usa ID errado após restaurar

**Assignee:** Full Stack Jr  
**Arquivo:** `app/page.tsx` · função `handleUndo` · linha ~358

`handleUndo` cria um novo post no banco (novo `id`, novo `created_at`), mas reinsere o objeto antigo no estado local com o `id` original. Toda operação posterior (delete, edit) nesse post resulta em 404.

**Antes:**
```js
if (response.ok) {
  const newPosts = [...posts];
  newPosts.splice(deletedPost.index, 0, deletedPost.post); // id antigo
  setPosts(newPosts);
  setDeletedPost(null);
  if (undoTimer) clearTimeout(undoTimer);
}
```

**Depois:**
```js
if (response.ok) {
  const restored = await response.json(); // { post: { id: novoId, ... } }
  const restoredPost = { ...deletedPost.post, id: restored.post.id };
  const newPosts = [...posts];
  newPosts.splice(deletedPost.index, 0, restoredPost);
  setPosts(newPosts);
  setDeletedPost(null);
  if (undoTimer) clearTimeout(undoTimer);
}
```

> **Critério de aceitação:** Criar post → deletar → undo → deletar novamente. Nenhum 404 deve ocorrer. O segundo delete deve remover o post do banco corretamente.

---

### C-10 — `type Post` declarado duas vezes em `page.tsx` com schemas incompatíveis

**Assignee:** Frontend Dev  
**Arquivo:** `app/page.tsx` · linha ~190

O arquivo importa `PostEntry as Post` mas redeclara `type Post` localmente com estrutura diferente. O tipo local sobrescreve o importado, mascarando erros de tipo.

**Antes (linha ~190):**
```ts
type Post = {
  id: number;
  title: string;
  content: string;
  tag: string;
  created_at: string;
  metadata?: any;
};
```

**Depois:** Remover esse bloco inteiro. `Post` já está importado como `PostEntry` no topo. Substituir todas as ocorrências do tipo local por `PostEntry` (ou manter o alias `Post` apenas no import: `import { type PostEntry as Post } from "@/hooks/use-posts"`).

> **Critério de aceitação:** `npm run build` sem erros de TypeScript relacionados ao tipo `Post`.

---

### Dead Code — `EditPostModal` (endpoint já existe, só precisa integrar)

**Assignee:** Full Stack Jr  
**Arquivo:** `app/page.tsx` · `components/EditPostModal.tsx`

O modal existe e está completo. O endpoint `PUT /api/posts/admin/:id` existe no backend. A integração é apenas adicionar o import, um estado `editingPost`, e conectar o botão de editar (ícone `Edit3` que já está no card do post) para abrir o modal.

**Passos:**
1. Importar `EditPostModal` em `page.tsx`
2. Adicionar estado: `const [editingPost, setEditingPost] = useState<Post | null>(null)`
3. Implementar `handleSaveEdit` que chama `PUT /api/posts/admin/:id` com token
4. Conectar botão `Edit3` do card ao `setEditingPost(post)`
5. Renderizar `<EditPostModal>` no JSX condicionado a `editingPost !== null`

> **Critério de aceitação:** Clicar em editar em um post existente → alterar título → salvar → título atualizado no feed sem recarregar. Backend retorna `200` com o post atualizado.

---

### A-01 — Login sempre autentica com `admin/admin` hardcoded

**Assignee:** Frontend Dev  
**Arquivo:** `components/login-screen.tsx` · linha ~52

Independente da senha digitada, o fetch de login sempre envia `{ username: 'admin', password: 'admin' }`. Se a senha do admin for alterada no banco, o JWT nunca será obtido.

**Antes:**
```ts
fetch(`${apiUrl}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin' }),
})
```

**Depois:**
```ts
fetch(`${apiUrl}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: password }),
})
```

> **Critério de aceitação:** Alterar a senha do admin no banco. Login com senha correta → acesso liberado + JWT obtido. Login com senha errada → acesso negado + sem JWT.

---

### A-04 — `topics.count` sempre zero

**Assignee:** Backend Dev  
**Arquivo:** `backend/src/controllers/userController.js` · endpoint `GET /api/user/topics`

A coluna `count` nunca é atualizada. Solução mais simples: calcular dinamicamente na query, eliminando a dependência de updates manuais.

**Antes:**
```js
const result = await pool.query(
  `SELECT id, name, slug, count 
   FROM topics 
   ORDER BY count DESC, name ASC`
);
```

**Depois:**
```js
const result = await pool.query(
  `SELECT 
     t.id, t.name, t.slug,
     COUNT(DISTINCT p.id)::integer AS count
   FROM topics t
   LEFT JOIN posts p 
     ON p.status = 'published' 
     AND p.metadata->>'tag' = t.slug  -- ajustar conforme a coluna real de tag
   GROUP BY t.id
   ORDER BY count DESC, name ASC`
);
```

**Nota para o Backend Dev:** Confirmar o campo de associação post↔topic após a definição de C-03/C-04. Se tags e topics forem entidades separadas, o JOIN muda. Abrir discussão antes de implementar.

> **Critério de aceitação:** Topics widget exibe contadores maiores que zero quando há posts publicados com aquelas tags.

---

## Sprint 3 — Estabilidade, segurança e endpoints faltantes

> **Done quando:** o servidor não encerra processo em erros transitórios de DB, todos os endpoints referenciados pelos hooks existem no backend, auto-save não corrompe o localStorage silenciosamente.

---

### A-02 — `process.exit(-1)` mata servidor em erros transitórios de banco

**Assignee:** Backend Dev  
**Arquivo:** `backend/src/db/pool.js` · linha ~22

**Antes:**
```js
pool.on('error', (err) => {
  console.error('[DB] Erro inesperado no pool:', err.message);
  process.exit(-1);
});
```

**Depois:**
```js
pool.on('error', (err) => {
  console.error('[DB] Erro inesperado no pool:', err.message);
  // Encerra apenas em erros fatais de autenticação/configuração
  if (err.message.includes('password authentication') || err.message.includes('database') && err.message.includes('does not exist')) {
    console.error('[DB] Erro fatal de configuração — encerrando processo.');
    process.exit(-1);
  }
  // Erros transitórios (connection reset, idle timeout): logar e continuar
});
```

> **Critério de aceitação:** Reiniciar o PostgreSQL enquanto o servidor está rodando → servidor permanece ativo → próxima query reconecta automaticamente.

---

### A-03 — Blacklist de JWT perde tokens revogados no restart

**Assignee:** Backend Dev  
**Arquivo:** `backend/src/middlewares/authMiddleware.js` · linha ~6

`blacklistedTokens` é um `Set` em memória — zerado a cada restart. Decisão: **se Redis não estiver disponível nesta sprint**, adotar tokens de curta duração como mitigação imediata.

**Mitigação sem Redis (trocar expiração no authController):**
```js
// Antes
{ expiresIn: '24h' }

// Depois
{ expiresIn: '1h' }
```

Implementação completa com Redis fica para decisão de infraestrutura (ver Tabela de Decisões Pendentes).

> **Critério de aceitação (mitigação):** Token expira em 1h. Fazer logout, copiar token, aguardar reinício do servidor, tentar usar o token → deve retornar `401 TOKEN_REVOKED` dentro da janela de 1h se o servidor não reiniciou, ou `401 TOKEN_EXPIRED` após expiração.

---

### C-06 — `GET /api/posts/random` não existe no backend

**Assignee:** Backend Dev  
**Arquivo:** `backend/src/routes/posts.js` · `backend/src/controllers/postController.js`

Adicionar rota antes de `/:slug` (para não ser interceptada):

**`posts.js`:**
```js
router.get('/random', getRandomPost); // antes de router.get('/:slug', ...)
```

**`postController.js` — nova função:**
```js
async function getRandomPost(req, res) {
  try {
    const result = await query(
      `SELECT id, title, slug, content, excerpt, created_at, metadata
       FROM posts
       WHERE status = 'published'
       ORDER BY RANDOM()
       LIMIT 1`
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Nenhum post publicado.' });
    }
    return res.status(200).json({ post: result.rows[0] });
  } catch (error) {
    console.error('[POSTS] Erro ao buscar post aleatório:', error.message);
    return res.status(500).json({ error: 'SERVER_ERROR', message: 'Erro interno.' });
  }
}
```

Corrigir também a URL no hook:

**`hooks/useRandomPost.ts` · linha ~29:**
```ts
// Antes
const response = await fetch('/api/posts/random');

// Depois
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const response = await fetch(`${apiUrl}/api/posts/random`);
```

> **Critério de aceitação:** `GET http://localhost:4000/api/posts/random` retorna `200` com um post. Chamadas repetidas retornam posts diferentes.

---

### C-07 — Endpoints de busca avançada e analytics inexistentes

**Assignee:** Backend Dev  
**Decisão necessária antes de implementar** (ver Tabela de Decisões Pendentes — item D-01).

Se aprovado: implementar `GET /api/posts/search` com suporte a `q`, `tags`, `dateFrom`, `dateTo`. `GET /api/posts/analytics/mood` depende da coluna `metadata` (C-04) estar implementada primeiro.

> **Critério de aceitação:** `GET /api/posts/search?q=test` retorna posts cujo título ou conteúdo contém "test". `GET /api/posts/analytics/mood` retorna distribuição de moods dos posts publicados.

---

### M-01 — Auto-save quebra silenciosamente quando imagem excede quota do localStorage

**Assignee:** Frontend Dev  
**Arquivo:** `app/page.tsx` · função de auto-save · linha ~155

**Antes:**
```js
localStorage.setItem('chrono_draft', JSON.stringify(draft));
setLastSaved(new Date());
```

**Depois:**
```js
try {
  const draftToSave = { ...draft, image: undefined }; // exclui imagem do draft
  localStorage.setItem('chrono_draft', JSON.stringify(draftToSave));
  setLastSaved(new Date());
} catch (e) {
  if (e instanceof DOMException && e.name === 'QuotaExceededError') {
    console.warn('[DRAFT] localStorage cheio — draft não salvo.');
    // Opcional: exibir aviso na UI
  }
}
```

> **Critério de aceitação:** Adicionar imagem de 4MB+ ao editor. Auto-save roda sem erro no console. Draft restaurado não inclui imagem (comportamento esperado).

---

### M-03 — useSearch vaza timer ao desmontar componente

**Assignee:** Full Stack Jr  
**Arquivo:** `hooks/useSearch.ts` · linha ~41

**Antes:** Sem cleanup.

**Depois — adicionar após a declaração de `debounceTimer`:**
```ts
useEffect(() => {
  return () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };
}, []);
```

> **Critério de aceitação:** Sem warning `Can't perform a React state update on an unmounted component` no console ao montar/desmontar o componente que usa `useSearch`.

---

## Itens pontuais — sem sprint dedicado

Estes itens podem ser incluídos em qualquer PR como linha adicional:

| ID | Arquivo | Correção |
|----|---------|----------|
| M-02 | `app/page.tsx` · linha ~23 | Mover `formatTimeAgo` para fora do componente `Home` |
| M-04 | `components/EditPostModal.tsx` · linha ~22 | `'melancoly'` → `'melancholy'` |
| B-02 | `app/page.tsx` · linha ~1340 | `© 2024` → `© {new Date().getFullYear()}` |

---

## Componentes mortos — decisão por item

| Componente | Endpoint necessário | Status endpoint | Recomendação |
|---|---|---|---|
| `EditPostModal` | `PUT /api/posts/admin/:id` | ✅ Existe | **Integrar — Sprint 2** |
| `DarkModeToggle` | Nenhum | — | **Integrar — Sprint 2 (sem bloqueio)** |
| `KeyboardShortcutsModal` | Nenhum | — | **Integrar ou remover** — modal inline em `page.tsx` já cobre isso |
| `TimelineView` | `GET /api/posts` | ✅ Existe | **Integrar — Sprint 3** (corrigir URL relativa antes) |
| `SerendipityModal` | `GET /api/posts/random` | ❌ Faltando | **Aguardar C-06** |
| `SearchPanel` | `GET /api/posts/search` | ❌ Faltando | **Aguardar decisão D-01** |
| `MoodHeatmap` | `GET /api/posts/analytics/mood` | ❌ Faltando | **Aguardar C-04 + decisão D-01** |
| `ImageGallery` | `GET /api/posts/:id/images` | ❌ Faltando | **Remover ou aguardar** — escopo não definido |
| `useGlobalKeyboardShortcuts` | Nenhum | — | **Substituir** o listener inline de `page.tsx` por este hook no Sprint 3 |
| `useTimeline` | `GET /api/posts` | ✅ Existe (URL relativa) | **Corrigir URL + integrar com `TimelineView`** |
| `useMoodAnalytics` | `GET /api/posts/analytics/mood` | ❌ Faltando | **Aguardar C-04 + decisão D-01** |
| `useSearch` | `GET /api/posts/search` | ❌ Faltando | **Aguardar decisão D-01** |
| `useRandomPost` | `GET /api/posts/random` | ❌ Faltando | **Aguardar C-06** |
| `useImageUpload` | `POST /api/posts/:id/upload` | ❌ Faltando | **Aguardar decisão D-02** |

---

## Decisões pendentes — produto deve responder antes de implementar

| ID | Pergunta | Impacto se não respondido |
|----|----------|--------------------------|
| D-01 | Busca avançada (por mood, weather, data) e mood heatmap fazem parte do escopo desta entrega? | `useSearch`, `useMoodAnalytics`, `SearchPanel`, `MoodHeatmap` permanecem dead code |
| D-02 | Upload de imagem vai usar armazenamento local (disco do servidor) ou storage externo (S3/Cloudinary)? | `useImageUpload` e endpoint de upload não podem ser implementados sem esta decisão |
| D-03 | Redis estará disponível no ambiente de produção? | A-03 (blacklist de JWT) não tem solução completa sem Redis ou decisão de arquitetura alternativa |
| D-04 | `topics` e `tags` são entidades separadas ou a mesma coisa? O seletor de TAG no formulário deveria popular `topics` ou `post_tags`? | A-04 (`topics.count`) e a query de JOIN em `getTopics` não podem ser finalizadas sem essa definição |

---

## Regras de entrega

### Nomenclatura de PR
```
[SPRINT-N] C-XX/A-XX — descrição curta

Exemplos:
[SPRINT-1] C-01 — status published no payload de criação
[SPRINT-1] C-02/C-03 — padronizar campos image e tag
[SPRINT-2] DEAD-EditPostModal — integrar modal de edição
```

### Proibições
- **Não misturar sprints em um único PR.** Sprint 2 não começa antes de Sprint 1 estar em `main`.
- **Não abrir PR sem critério de aceitação verificado** — testar localmente antes de submeter.
- **Não implementar C-07/D-01/D-02** sem decisão de produto documentada neste arquivo.

### Política de dúvidas
- Dúvida técnica sobre implementação → comentar diretamente no PR.
- Dúvida sobre requisito/escopo → abrir issue com label `needs-decision` e mencionar o Tech Lead.
- Nenhuma decisão de arquitetura (storage, Redis, schema) deve ser tomada unilateralmente pelo dev.

### Ordem de dependência entre tarefas
```
C-04 (migration metadata) → deve rodar ANTES de C-07 (analytics/mood)
C-06 (endpoint random)    → deve estar em main ANTES de integrar SerendipityModal
C-01/C-03 (status+tags)   → deve estar em main ANTES de integrar EditPostModal
```
