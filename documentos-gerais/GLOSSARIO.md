# GLOSSÁRIO — ChronoPrivative
> Última atualização: 04/03/2026

---

## Termos Técnicos do Projeto

### A

**`AboutWidget`**  
Componente React do sidebar esquerdo que exibe a bio do autor. Permite edição via `BioEditModal` com autenticação JWT. Ver [COMPONENTES.md](./COMPONENTES.md).

**ADR (Architecture Decision Record)**  
Registro de uma decisão técnica significativa: o que foi decidido, por quê, e quais são os trade-offs. Ver [ARQUITETURA.md](./ARQUITETURA.md) — seção "Decisões Arquiteturais".

**`ArchivesWidget`**  
Componente React do sidebar que exibe posts agrupados por mês/ano. Auto-busca dados do endpoint `GET /api/posts/archives`. Ver [COMPONENTES.md](./COMPONENTES.md).

**`auth_token`**  
Chave usada no `localStorage` do browser para armazenar o JWT obtido após login: `localStorage.setItem('auth_token', token)`. Enviado como header `Authorization: Bearer <token>` nas rotas protegidas.

**`authMiddleware`**  
Middleware Express em `backend/src/middlewares/authMiddleware.js` que intercepta requisições às rotas `/admin`, valida o JWT no header `Authorization`, e injeta `req.user` com os dados do usuário autenticado.

**`autoprefixer`**  
Plugin PostCSS que adiciona prefixos de vendor (`-webkit-`, `-moz-`, etc.) a regras CSS. **Não deve ser usado com Tailwind CSS v4** — o `@tailwindcss/postcss` já inclui este processamento. Ver Bug 4 em [BUGS-E-DECISOES.md](./BUGS-E-DECISOES.md).

---

### B

**`bcrypt`**  
Algoritmo de hash de senhas usado para armazenar `password_hash` na tabela `users`. O custo (rounds) padrão é 12. Implementado via biblioteca `bcrypt` no backend.

**`BioEditModal`**  
Componente modal para edição da bio do autor. Chamado pelo `AboutWidget`. Valida comprimento (max 500 chars) e chama `PUT /api/user/bio`.

**`bio_updated_at`**  
Campo da tabela `users` que registra a data/hora da última atualização da bio.

---

### C

**`CORS_ORIGIN`**  
Variável de ambiente do backend que define o domínio autorizado a fazer requisições cross-origin. Em desenvolvimento: `http://localhost:3000`. Em produção: URL do frontend deployado.

**`cover_image_url`**  
Campo opcional da tabela `posts`. URL externa da imagem de capa do post (ex: `https://picsum.photos/800/400`).

---

### D

**`DATABASE_URL`**  
String de conexão PostgreSQL no formato `postgresql://user:password@host:port/database`. Usada pelo `pg.Pool` no backend. Exemplo: `postgresql://postgres:juvinho@localhost:5432/chronoprivative_db`.

**`DarkModeToggle`**  
Componente React que alterna entre tema claro e escuro. Persiste escolha em `localStorage`.

---

### E

**`ecosystem.config.js`**  
Arquivo de configuração do PM2 para gerenciamento do processo backend em produção. Define: nome do app, auto-restart, limites de memória, paths de log, graceful shutdown.

**`excerpt`**  
Campo opcional da tabela `posts`. Texto de resumo curto exibido na listagem de posts sem abrir o conteúdo completo.

**`express-rate-limit`**  
Biblioteca de rate limiting para Express. Usada em três contextos:
- `apiLimiter`: rate limit geral para `/api/*`
- `loginLimiter`: 5 tentativas/15 min para `POST /api/auth/login`
- `reactionLimiter`: anti-spam para `POST /api/reactions`

---

### F

**`fetch()`**  
API nativa do browser usada pelo frontend para todas as chamadas HTTP à API. Não há biblioteca HTTP externa (axios, etc.).

---

### G

**`getArchives`**  
Função no `postController.js` que retorna posts agrupados por mês: `SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS total FROM posts WHERE status='published' GROUP BY month`. Expostas como `GET /api/posts/archives`.

---

### H

**`handleDelete`**  
Função em `app/page.tsx` que executa `DELETE /api/posts/admin/:id` com JWT. Historicamente causou Bug 5 por URL incorreta.

**`handlePublish`**  
Função em `app/page.tsx` que executa `POST /api/posts/admin` para criar um novo post com status `published`.

**`handleUndo`**  
Função em `app/page.tsx` que recria um post excluído (restauração via nova criação com `POST /api/posts/admin`).

**`helmet`**  
Middleware Express que define headers HTTP de segurança: `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.

---

### I

**`is_approved`**  
Campo booleano da tabela `comments`. Padrão `false`. Comentários só aparecem publicamente após um admin mudar para `true` via `PATCH /api/comments/admin/:id/approve`.

---

### J

**JWT (JSON Web Token)**  
Token de autenticação gerado pelo backend após login bem-sucedido. Estrutura: `header.payload.signature`. Payload contém: `{ id, username, role }`. Expiração: 24 horas. Assimétrico: assinado com `JWT_SECRET`.

**`JWT_SECRET`**  
Variável de ambiente do backend usada para assinar e verificar JWTs. Deve ser uma string aleatória longa e secreta. Nunca expor publicamente.

---

### L

**`LoginScreen`**  
Componente React que exibe sequência de boot animada e campo de senha. Aceita `"admin"` e `"juan"` localmente; chama backend para obter JWT após login. Ver [COMPONENTES.md](./COMPONENTES.md).

---

### M

**`migrations.sql`**  
Arquivo SQL em `backend/src/db/migrations.sql` contendo todos os `CREATE TABLE IF NOT EXISTS`, índices e trigger do projeto. Executado via `npm run migrate`.

**`MiniCalendar`**  
Componente React de calendário que marca visualmente os dias que têm posts publicados. Recebe `posts[]` como prop.

**`MoodHeatmap`**  
Componente React de visualização de humor dos posts ao longo do tempo. Sem chamadas de API — processa os posts localmente via `useMemo`.

**`morgan`**  
Middleware de logging HTTP para Express. Em `development`: formato `dev` (colorido, conciso). Em `production`: formato `combined` (Apache-style, completo).

---

### N

**`NEXT_PUBLIC_API_URL`**  
Variável de ambiente do frontend definida em `.env.local`. Prefixo `NEXT_PUBLIC_` é obrigatório para expor ao código do browser em Next.js. Valor: `http://localhost:4000` (desenvolvimento).

---

### P

**`page.tsx`**  
Componente principal em `app/page.tsx`. Orquestra todo o estado da aplicação: posts, autenticação, modais, CRUD. Renderiza layout de 3 colunas.

**`pg` / `node-postgres`**  
Driver Node.js oficial para PostgreSQL. Usado via `Pool` (pool de conexões) em `backend/src/db/pool.js`.

**`PM2`**  
Process Manager 2 — gerenciador de processos Node.js para produção. Oferece: auto-restart, clustering, monitoramento de memória, logs rotativos. Configurado em `ecosystem.config.js`.

**`post_tags`**  
Tabela de junção many-to-many entre `posts` e `tags`. Chave primária composta: `(post_id, tag_id)`.

**`postcss.config.mjs`**  
Arquivo de configuração do PostCSS. Para Tailwind v4: deve conter **apenas** `'@tailwindcss/postcss': {}`.

---

### R

**`rateLimiter`**  
Arquivo `backend/src/middlewares/rateLimiter.js` que exporta `apiLimiter`, `loginLimiter` e `reactionLimiter`. Todos usam store em memória — contadores são zerados ao reiniciar o processo.

**`reactions`**  
Tabela que registra reações de usuários aos posts. Tipos válidos: `like`, `love`, `fire`, `clap`, `sad`. Restrição de unicidade: `UNIQUE(post_id, session_id, type)`.

**`RetroImagePlaceholder`**  
Componente de placeholder visual SVG com estética retro/cyberpunk, exibido enquanto uma imagem real não carrega.

---

### S

**`SearchPanel`**  
Componente de busca avançada com filtros por query, tags, mood, clima e intervalo de datas. Delega a execução da busca ao `onSearch` prop.

**`SerendipityModal`**  
Modal que exibe um post escolhido aleatoriamente da lista atual de posts.

**`session_id`**  
Identificador de sessão anônima usado na tabela `reactions` para prevenir reações duplicadas sem exigir autenticação do visitante.

**`slug`**  
Versão URL-amigável de um título. Gerado automaticamente pela função `uniqueSlug()` em `backend/src/utils/slugify.js`. Exemplo: "Meu Primeiro Post" → `meu-primeiro-post`. Garante unicidade com sufixo numérico se necessário (ex: `meu-primeiro-post-2`).

**`standalone`** (Next.js output)  
Modo de build Next.js que gera bundle completo e autocontido para deploy em containers. Configurado via `output: 'standalone'` em `next.config.ts`.

**`status`** (posts)  
Campo `VARCHAR(20)` da tabela `posts` com `CHECK` constraint. Valores possíveis:
- `draft` — rascunho, não visível publicamente
- `published` — publicado, aparece no feed
- `archived` — arquivado, não aparece no feed

---

### T

**`Tailwind CSS v4`**  
Versão atual do framework CSS utilitário. Mudanças em relação à v3:
- Sem arquivo `tailwind.config.js`
- Configuração feita via `@theme {}` em CSS
- Plugin PostCSS: `@tailwindcss/postcss`
- `autoprefixer` não deve ser usado como plugin separado

**`TerminalInput` / `TerminalTextarea`**  
Wrappers estilizados sobre elementos HTML nativos `<input>` e `<textarea>` com visual de terminal cyberpunk.

**`TimelineView`**  
Componente de visualização de posts agrupados por mês cronologicamente, com suporte a carregamento incremental (load more).

**`topics`**  
Tabela de categorias editoriais independentes (sem FK para posts). Exibidas no sidebar pelo `TopicsWidget`. Gerenciadas via seed ou admin.

**`TopicsWidget`**  
Componente React do sidebar que lista tópicos do blog. Auto-busca `GET /api/user/topics`. Usa `DEFAULT_TOPICS` como fallback se a API falhar.

**`transaction()`**  
Wrapper em `backend/src/db/pool.js` para executar múltiplas queries SQL em uma única transação PostgreSQL. Usado em `createPost` e `updatePost` para garantir consistência entre inserção de post e tags.

**`trigger_update_posts_updated_at`**  
Trigger PostgreSQL `BEFORE UPDATE` na tabela `posts` que atualiza automaticamente o campo `updated_at` com `NOW()`.

**`TypewriterText`**  
Componente que exibe texto com efeito máquina de escrever (um caractere por vez com intervalo configurável).

---

### U

**`uniqueSlug()`**  
Função em `backend/src/utils/slugify.js` que gera slugs únicos para posts. Se o slug gerado do título já existir, acrescenta sufixo numérico (`-2`, `-3`, etc.).

**`updated_at`**  
Campo da tabela `posts` atualizado automaticamente pelo trigger `trigger_update_posts_updated_at` a cada `UPDATE` no registro.

---

### V

**`views`**  
Campo inteiro desnormalizado na tabela `posts` que conta o total de visualizações. Incrementado de forma assíncrona (não bloqueia a resposta) a cada `GET /api/posts/:slug`.

**`views_log`**  
Tabela de log detalhado de visualizações: registra `post_id`, `viewer_ip`, `user_agent` e `visited_at` de cada acesso. Complementa o contador `posts.views`.

---

### W

**`Widget`**  
Sufixo usado nos componentes do sidebar (`AboutWidget`, `TopicsWidget`, `ArchivesWidget`). Representa paineis autônomos que compõem a barra lateral da interface.

---

## Abreviações Usadas no Código

| Abreviação | Significado                                    |
|------------|------------------------------------------------|
| `apiUrl`   | `process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:4000'` |
| `FK`       | Foreign Key (chave estrangeira)                |
| `PK`       | Primary Key (chave primária)                   |
| `JWT`      | JSON Web Token                                 |
| `DDL`      | Data Definition Language (CREATE, ALTER, DROP) |
| `DML`      | Data Manipulation Language (INSERT, UPDATE, DELETE) |
| `ADR`      | Architecture Decision Record                   |
| `CORS`     | Cross-Origin Resource Sharing                  |
| `HMR`      | Hot Module Replacement (Next.js dev)           |
| `E2E`      | End-to-End (testes de ponta a ponta)           |
| `SERIAL`   | Tipo PostgreSQL: inteiro auto-incrementado     |
| `ILIKE`    | `LIKE` case-insensitive no PostgreSQL          |

---

## Nomes de Campos e Convenções

| Convenção               | Padrão adotado                                   |
|-------------------------|--------------------------------------------------|
| Nomes de tabelas        | `snake_case` plural (ex: `posts`, `post_tags`)   |
| Nomes de colunas        | `snake_case` (ex: `created_at`, `author_id`)     |
| Nomes de componentes    | `PascalCase` (ex: `TopicsWidget`, `LoginScreen`) |
| Nomes de hooks          | `camelCase` com prefixo `use` (ex: `usePosts`)   |
| Nomes de rotas REST     | `kebab-case` (ex: `/api/posts/admin`)            |
| Slugs                   | `kebab-case` em minúsculas (ex: `meu-post`)      |
| Mensagens de erro da API| `SCREAMING_SNAKE_CASE` (ex: `NOT_FOUND`, `MISSING_FIELDS`) |
| Mensagens de sucesso    | `SCREAMING_SNAKE_CASE` (ex: `POST_CREATED`, `ACCESS_GRANTED`) |
