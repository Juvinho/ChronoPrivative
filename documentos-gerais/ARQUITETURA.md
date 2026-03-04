# ARQUITETURA — ChronoPrivative
> Última atualização: 04/03/2026

---

## Visão Geral

ChronoPrivative é um **blog/diário digital privado** com estética retro/cyberpunk. A arquitetura é de **dois serviços desacoplados**: frontend Next.js e backend Express, cada um rodando em porta separada e se comunicando via REST sobre HTTP.

---

## Diagrama de Arquitetura (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUÁRIO (Browser)                         │
│                    http://localhost:3000                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND — Next.js 15                         │
│                    Porta: 3000                                    │
│                                                                   │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────┐ │
│  │ app/page.tsx │  │   components/  │  │      hooks/          │ │
│  │ (orquestrador│  │  Widgets,       │  │  usePosts()          │ │
│  │  principal)  │  │  Modals,        │  │  useSearch()         │ │
│  └──────┬───────┘  │  LoginScreen    │  │  useMoodAnalytics()  │ │
│         │          └────────────────┘  └──────────────────────┘ │
│         │ fetch() com NEXT_PUBLIC_API_URL                        │
└─────────┼───────────────────────────────────────────────────────┘
          │ CORS: Authorization: Bearer <JWT>
          │ Content-Type: application/json
          │ HTTP REST
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND — Express 4 / Node.js                  │
│                   Porta: 4000                                     │
│                                                                   │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ server.js │  │   routes/    │  │     controllers/         │  │
│  │ (entry    │─▶│  auth        │─▶│  authController          │  │
│  │  point)   │  │  posts       │  │  postController          │  │
│  └───────────┘  │  comments    │  │  commentController       │  │
│                 │  reactions   │  │  reactionController      │  │
│  Middlewares:   │  tags        │  │  tagController           │  │
│  helmet         │  users       │  │  userController          │  │
│  cors           └──────────────┘  └──────────────────────────┘  │
│  morgan                                    │                     │
│  rateLimiter                               │ pg.Pool queries     │
│  authMiddleware                            ▼                     │
└────────────────────────────────────────────┬────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BANCO DE DADOS — PostgreSQL 18                  │
│                   Porta: 5432                                     │
│                   Banco: chronoprivative_db                       │
│                                                                   │
│   users | posts | reactions | comments | tags | topics           │
│   post_tags | views_log                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fluxo Completo: Usuário → Frontend → API → Banco

### 1. Acesso inicial

```
Usuário abre localhost:3000
  → Next.js serve app/page.tsx
  → LoginScreen exibe sequência de boot
  → Usuário digita senha ("admin" ou "juan")
  → Frontend chama POST /api/auth/login em background
  → Backend valida bcrypt, retorna JWT
  → Frontend armazena: localStorage.setItem('auth_token', token)
  → UI desbloqueia (independente do resultado backend)
```

### 2. Listagem de posts

```
page.tsx monta
  → usePosts() executa GET http://localhost:4000/api/posts
  → Backend query: SELECT posts JOIN users LEFT JOIN tags WHERE status='published'
  → Retorna JSON com array de posts + paginação
  → Frontend renderiza feed central
```

### 3. Criação de post

```
Usuário preenche formulário e clica "publicar"
  → handlePublish() em page.tsx
  → POST http://localhost:4000/api/posts/admin
     Headers: { Authorization: Bearer <JWT> }
     Body: { title, content, excerpt, status, tags[] }
  → authMiddleware valida JWT no backend
  → postController.createPost():
     - Gera slug único via uniqueSlug()
     - Insere em `posts` (transaction)
     - Insere/associa tags em `tags` e `post_tags`
  → Retorna 201 { message: 'POST_CREATED', post }
  → Frontend atualiza lista de posts
```

### 4. Exclusão de post

```
Usuário clica "excluir"
  → handleDelete(post) em page.tsx
  → DELETE http://localhost:4000/api/posts/admin/:id
     Headers: { Authorization: Bearer <JWT> }
  → authMiddleware valida JWT
  → postController.deletePost(): DELETE FROM posts WHERE id = $1
  → Retorna 200 { message: 'POST_DELETED' }
  → Frontend remove post da lista local
```

### 5. Sidebar: Topics e Archives

```
TopicsWidget monta
  → fetch(${NEXT_PUBLIC_API_URL}/api/user/topics)
  → Backend: SELECT * FROM topics ORDER BY name
  → Renderiza lista de tópicos no sidebar

ArchivesWidget monta
  → fetch(${NEXT_PUBLIC_API_URL}/api/posts/archives)
  → Backend: SELECT DATE_TRUNC('month', created_at) ... GROUP BY month
  → Frontend agrupa por ano, ordena decrescente
  → Renderiza calendário de arquivos no sidebar
```

---

## Estrutura de Pastas

```
ChronoPrivative/                    ← Raiz do projeto
├── app/                            ← Next.js App Router
│   ├── globals.css                 ← Estilos globais + variáveis CSS + Tailwind v4
│   ├── layout.tsx                  ← Server Component: fontes, metadata, body wrapper
│   └── page.tsx                    ← Client Component: orquestrador principal da UI
│
├── components/                     ← Componentes React reutilizáveis
│   ├── login-screen.tsx            ← Tela de boot/login
│   ├── AboutWidget.tsx             ← Sidebar: bio do autor
│   ├── TopicsWidget.tsx            ← Sidebar: lista de tópicos
│   ├── ArchivesWidget.tsx          ← Sidebar: arquivo mensal
│   ├── EditPostModal.tsx           ← Modal de edição de post
│   ├── BioEditModal.tsx            ← Modal de edição de bio
│   ├── SearchPanel.tsx             ← Painel de busca avançada
│   ├── MiniCalendar.tsx            ← Calendário com posts
│   ├── MoodHeatmap.tsx             ← Heatmap de humor
│   ├── TimelineView.tsx            ← Timeline cronológica
│   ├── ImageGallery.tsx            ← Galeria lightbox
│   ├── SerendipityModal.tsx        ← Post aleatório
│   ├── KeyboardShortcutsModal.tsx  ← Atalhos de teclado
│   ├── DarkModeToggle.tsx          ← Toggle de tema
│   ├── typewriter-text.tsx         ← Animação máquina de escrever
│   ├── highlight-text.tsx          ← Realce de termos buscados
│   ├── retro-image-placeholder.tsx ← Placeholder retro
│   ├── terminal-input.tsx          ← Input com estilo terminal
│   └── terminal-textarea.tsx       ← Textarea com estilo terminal
│
├── hooks/                          ← React hooks customizados
│   ├── use-posts.ts                ← Busca e estado de posts
│   ├── use-mobile.ts               ← Detecção de viewport mobile
│   ├── useSearch.ts                ← Busca de posts
│   ├── useTimeline.ts              ← Agrupamento temporal
│   ├── useMoodAnalytics.ts         ← Análise de humor
│   ├── useRandomPost.ts            ← Post aleatório
│   ├── useImageUpload.ts           ← Upload de imagens
│   └── useGlobalKeyboardShortcuts.ts ← Atalhos globais
│
├── lib/                            ← Utilitários
│   └── utils.ts                    ← `cn()` (clsx + tailwind-merge)
│
├── documentos-gerais/              ← Documentação oficial do projeto
│
├── docs/                           ← Relatórios gerados durante sessões
│
├── .env.local                      ← Variáveis de ambiente do frontend (não comitar)
├── next.config.ts                  ← Configuração Next.js (standalone, transpile motion)
├── postcss.config.mjs              ← PostCSS: apenas @tailwindcss/postcss
├── tsconfig.json                   ← TypeScript strict mode
├── package.json                    ← deps: next 15, react 19, tailwindcss 4
│
└── backend/                        ← API Express (serviço separado)
    ├── server.js                   ← Entry point: middlewares + mount de rotas
    ├── .env                        ← Variáveis do backend (não comitar)
    ├── ecosystem.config.js         ← Configuração PM2 para produção
    ├── scripts/
    │   ├── migrate.js              ← Executa migrations.sql via pg
    │   ├── seed-and-migrate.js     ← Setup inicial: users + topics + posts
    │   ├── update-admin-hash.js    ← Redefine hash bcrypt do admin
    │   └── test-e2e-delete.js      ← Testa fluxo login→criar→deletar
    └── src/
        ├── controllers/            ← Lógica de negócio por recurso
        ├── routes/                 ← Definição de rotas Express
        ├── middlewares/            ← auth, rateLimiter
        ├── db/
        │   ├── pool.js             ← Singleton pg.Pool
        │   └── migrations.sql      ← DDL de todas as tabelas + índices + trigger
        └── utils/
            ├── slugify.js          ← Geração de slugs únicos
            └── hashPassword.js     ← bcrypt compare wrapper
```

---

## Portas e Serviços

| Serviço       | Porta | Comando de start           | Variável de controle          |
|---------------|-------|----------------------------|-------------------------------|
| Frontend      | 3000  | `npm run dev` (raiz)       | fixo em `package.json`        |
| Backend       | 4000  | `npm run dev` (backend/)   | `PORT=4000` em `.env`         |
| PostgreSQL    | 5432  | serviço do sistema          | `DATABASE_URL` no `.env`      |

---

## Comunicação entre Serviços

### Frontend → Backend

| Aspecto              | Valor                                                     |
|----------------------|-----------------------------------------------------------|
| Protocolo            | HTTP REST (JSON)                                         |
| CORS permitido       | `http://localhost:3000` (configurado via `CORS_ORIGIN`)  |
| Autenticação         | JWT no header `Authorization: Bearer <token>`            |
| URL base             | `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'` |
| Timeouts             | Padrão do browser (nenhum configurado explicitamente)     |

### Backend → PostgreSQL

| Aspecto         | Valor                                           |
|-----------------|-------------------------------------------------|
| Driver          | `pg` (node-postgres)                            |
| Connection pool | Singleton em `src/db/pool.js`                   |
| Connection string | `DATABASE_URL` do `.env`                      |
| Transações      | `transaction()` wrapper em `pool.js`            |

---

## Decisões Arquiteturais (ADRs)

### ADR-1: Dois serviços separados vs monolito Next.js

**Decisão:** Frontend e backend como projetos Node distintos, portas 3000 e 4000.  
**Justificativa:** Permite deploy independente, escalabilidade separada, e substituição futura do frontend (ex: migrar para outro framework) sem afetar a API.  
**Trade-off:** Exige configuração de CORS e variáveis de ambiente para a URL da API.

---

### ADR-2: JWT em localStorage vs httpOnly cookie

**Decisão:** Token armazenado em `localStorage`.  
**Justificativa:** Simplicidade de implementação para projeto pessoal/privado. O blog é de uso exclusivo do dono — não há múltiplos usuários com dados sensíveis a proteger.  
**Trade-off:** Vulnerável a XSS; para uso público, migrar para `httpOnly Cookie`.

---

### ADR-3: Tailwind CSS v4 sem `tailwind.config`

**Decisão:** Tailwind v4 com `@import "tailwindcss"` em `globals.css` e `@tailwindcss/postcss` no PostCSS.  
**Justificativa:** Tailwind v4 elimina o arquivo de configuração — as personalizações são feitas via `@theme {}` no CSS.  
**Restrição crítica:** `autoprefixer` **não deve** ser adicionado ao PostCSS — Tailwind v4 já inclui vendor prefixes internamente. Adicionar `autoprefixer` como plugin separado corrompe a saída CSS silenciosamente (ver [BUGS-E-DECISOES.md](./BUGS-E-DECISOES.md) — Bug 4).

---

### ADR-4: `output: 'standalone'` no Next.js

**Decisão:** `next.config.ts` usa `output: 'standalone'`.  
**Justificativa:** Gera output otimizado para containers Docker com todas as dependências necessárias.  
**Efeito colateral conhecido:** Em Windows, `npm run build` pode travar no estágio "Finalizing page optimization" sem erro — mas o build real (compilação TypeScript + CSS) está correto.

---

### ADR-5: Rate limiting em memória

**Decisão:** `express-rate-limit` com store padrão (em memória do processo).  
**Justificativa:** Suficiente para uso pessoal local.  
**Limitação:** Contadores zerados ao reiniciar o servidor. Para produção com múltiplas instâncias, migrar para Redis store.

---

### ADR-6: `topics` independente de `posts`

**Decisão:** Tabela `topics` não tem FK para `posts`.  
**Justificativa:** Tópicos são categorias editoriais fixas, gerenciadas via seed/admin — não geradas automaticamente de posts. O campo `count` é atualizado manualmente.  
**Alternativa rejeitada:** Gerar topics dinamicamente de tags/posts (complexidade desnecessária para uso pessoal).

---

## Stack de Tecnologias

| Camada       | Tecnologia            | Versão       |
|--------------|-----------------------|--------------|
| Frontend     | Next.js               | ^15.4.9      |
| Frontend     | React                 | ^19.2.1      |
| Frontend     | TypeScript            | 5.9.3        |
| Frontend     | Tailwind CSS          | 4.1.11       |
| Frontend     | Lucide React (ícones) | ^0.553.0     |
| Frontend     | Motion (animações)    | ^12.23.24    |
| Frontend     | react-markdown        | ^10.1.0      |
| Backend      | Node.js               | ≥ 18         |
| Backend      | Express               | ^4.21.0      |
| Backend      | jsonwebtoken          | ^9.0.2       |
| Backend      | bcrypt                | ^5.1.1       |
| Backend      | pg (node-postgres)    | ^8.13.0      |
| Backend      | helmet                | ^7.1.0       |
| Backend      | express-rate-limit    | ^7.4.0       |
| Backend      | morgan (logging)      | ^1.10.0      |
| Banco        | PostgreSQL            | 18           |
| Processo     | PM2 (produção)        | ^5.4.3       |
| Dev backend  | nodemon               | ^3.1.4       |

Para detalhes completos de rotas: [API.md](./API.md)  
Para schema do banco: [BANCO-DE-DADOS.md](./BANCO-DE-DADOS.md)  
Para componentes: [COMPONENTES.md](./COMPONENTES.md)
