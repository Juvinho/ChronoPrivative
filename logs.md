### 2026-03-06 12:15 · BUGFIX · Backend Engineer
**Status:** CONCLUÍDO ✅
**Problema:** Imagens de posts eram enviadas como base64 DataURL via JSON body → armazenadas como blobs de texto no banco. Imagens grandes falhavam silenciosamente ou tornavam os fetches lentos. Exibição no feed usava campo `imageUrl` que só existia após mapeamento do `use-posts.ts` (correto), mas o fluxo de publicação passava base64 para `cover_image_url` no DB.
**Causa raiz:** `processFile` em `app/page.tsx` lia o arquivo com `FileReader.readAsDataURL` e mandava o resultado como campo JSON. O backend aceitava e armazenava a string. Não havia endpoint dedicado de upload para posts.
**Solução:**
  - `backend/src/middlewares/upload.js` — refatorado: extraiu lógica comum `fileFilter`/`ensureDir`; adicionou `uploadPostImage` multer com dest `uploads/posts/`, limite 5MB
  - `backend/src/controllers/postController.js` — +`uploadPostImageHandler`: salva arquivo no disco, retorna URL absoluta
  - `backend/src/routes/posts.js` — +`POST /api/posts/admin/upload-image` (auth + multer), registrado antes de `/admin`
  - `app/page.tsx` — `processFile` vira `async`: exibe preview base64 local imediatamente (UX), faz upload real em paralelo, substitui `postImage` pela URL definitiva quando upload conclui
  - `app/page.tsx` — estado `isUploadingImage`: spinner no preview + botões "Publish Entry" desabilitados durante o upload
**Commit:** `aac0455` · TypeScript `tsc --noEmit` passou sem erros
**Próximo agente:** IA-2 (QA) — testar fluxo completo de upload de imagem

---

### 2026-03-06 11:30 · FEAT · Frontend Engineer
**Status:** CONCLUÍDO ✅
**Tarefa:** Perfil de usuário — avatar e username, solicitação do cliente
**Output produzido:**
  - `components/UserProfileModal.tsx` — modal de edição (avatar + username), design preto/roxo do site
  - `hooks/useUserProfile.ts` — fetch de perfil, updateUsername, uploadAvatar
  - `backend/src/middlewares/upload.js` — multer storage em disco, filtro de tipo, limite 2MB
  - `backend/src/controllers/userController.js` — +getProfile, +updateUsername, +uploadAvatarHandler, +usernameValidators
  - `backend/src/routes/users.js` — +GET /api/user/profile, +PATCH /api/user/username, +POST /api/user/avatar
  - `backend/server.js` — express.static servindo /uploads
  - `app/page.tsx` — header com avatar dinâmico + UserProfileModal integrado
  - `backend/src/db/migrations.sql` — colunas avatar_url e username_updated_at
  - `documentos-gerais/PERFIL-USUARIO.md` — documentação da feature
  - Migration executada no banco: ALTER TABLE users ADD COLUMN avatar_url, username_updated_at
  - multer instalado no backend
**Commit:** `4909118` · TypeScript `tsc --noEmit` passou sem erros
**Próximo agente:** IA-2 (QA) — revisar feature de perfil

---

### 2026-03-04 18:49 · T-001 · IA-3 (Tech Lead)
**Ação tomada:**
	- Log inicial vazio. Abri a tarefa critica T-001 para corrigir metadata no frontend.
	- T-001 -> assignee: IA-1
		- Arquivo: hooks/use-posts.ts
		- O que fazer: desserializar metadata quando vier como string JSON e manter fallback para objeto.
		- Criterio de done: metadata chega como objeto no frontend e campos mood/weather/listening aparecem apos reload.
**Proxima tarefa:** T-002 -> assignee: IA-1
**Escopo da proxima tarefa:**
	- Arquivo: hooks/use-posts.ts
	- O que fazer: desserializar metadata quando vier como string JSON e manter fallback para objeto.
	- Criterio de done: metadata chega como objeto no frontend e campos mood/weather/listening aparecem apos reload.
**Observacoes:** Prioridade critica. Sem conflitos entre IA-1 e IA-2 no log.

### 2026-03-04 19:15 · T-002 · IA-2 (QA Engineer)
**Input recebido:** Implementação da camada de "Blindagem" (Hardening) e Tipagem Autoritativa.
**Problemas encontrados:**
  - 🟡 [MÉDIO] [backend/src/controllers/postController.js](backend/src/controllers/postController.js#L262) — A função `updatePost` dá fallback para `JSON.stringify({})` no campo `metadata`, mas a tabela permite NULL. Se o banco retornar NULL, a sanitização no frontend/backend precisa ser robusta. (Já mitigado pela `sanitizePostResponse`).
  - 🔵 [BAIXO] [components/EditPostModal.tsx](components/EditPostModal.tsx#L85) — A conversão manual de `tags: string[]` para `Tag[]` no `onSave` usa `id: 0`. O backend trata isso corretamente (faz upsert pelo slug), mas é um acoplamento de lógica de negócio no componente UI.
  - 🔵 [BAIXO] [app/page.tsx](app/page.tsx#L240) — O log de console no `usePosts` foi mantido. Sugerido remover em produção.
**Decisão:** APROVADO ✅
**Próximo agente:** IA-3 (fechar tarefa)
**Observações:** O sistema está estruturalmente muito mais sólido. A introdução de `sanitizePost` no frontend e `sanitizePostResponse` no backend elimina a causa raiz dos erros de `undefined`. O check de `tsc` passou com sucesso.

---

### 2026-03-04 18:55 · Sprint-3 + T-001 · IA-1 (Developer)
**Status:** CONCLUÍDO ✅
**Input recebido:** LOGS.md vazio na sessão anterior; leitura de ANÁLISE GERAL.md identificou Sprint 3 pendente (M-03, M-01, B-02, C-06, A-03). Registro de IA-3 atribuiu T-001 (metadata string) para IA-1.
**Output produzido:**
  - `hooks/useSearch.ts` — `useEffect` cleanup para timer de debounce (M-03)
  - `app/page.tsx` — `localStorage.setItem` em try/catch com fallback sem imagem em QuotaExceededError (M-01)
  - `app/page.tsx` — ano do footer dinâmico `{new Date().getFullYear()}` (B-02)
  - `backend/src/controllers/postController.js` — função `getRandomPost()` com query RANDOM() (C-06)
  - `backend/src/routes/posts.js` — rota `GET /random` registrada antes de `/:slug` (C-06)
  - `hooks/useRandomPost.ts` — URL corrigida para usar `NEXT_PUBLIC_API_URL` (C-06)
  - `backend/src/db/migrations.sql` — tabela `revoked_tokens` + índices (A-03 / D-03)
  - `backend/src/middlewares/authMiddleware.js` — blacklist migrada para PostgreSQL, função async, cleanup periódico a cada 1h (A-03)
  - `backend/src/controllers/authController.js` — `await blacklistToken(token)` no logout (A-03)
  - Migration executada no banco: tabela `revoked_tokens` criada com CREATE INDEX
  - `lib/types.ts` — `sanitizePost` desserializa `metadata` quando vier como string JSON do PostgreSQL (T-001)
**Commits:** `a9a4e81` (Sprint 3), `a seguir` (T-001 + logs)
**TypeScript:** `tsc --noEmit` passou sem erros em ambos os commits
**Próximo agente:** IA-2 (QA) — revisar T-001 e validar blacklist A-03

