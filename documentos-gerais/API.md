# API — ChronoPrivative
> Última atualização: 04/03/2026

---

## Base URL

- **Desenvolvimento:** `http://localhost:4000`
- **Prefixo de todas as rotas:** `/api`
- **Variável de ambiente no frontend:** `NEXT_PUBLIC_API_URL=http://localhost:4000`

---

## Autenticação

O backend usa **JWT (JSON Web Token)** com validade de **24 horas**.

### Como obter o token

```http
POST /api/auth/login
Content-Type: application/json

{ "username": "admin", "password": "admin" }
```

Resposta:
```json
{
  "message": "ACCESS_GRANTED",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "username": "admin", "role": "admin" }
}
```

### Como enviar o token nas rotas protegidas

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Onde o frontend armazena o token

```javascript
localStorage.setItem('auth_token', token)
// Enviado como: Authorization: Bearer ${localStorage.getItem('auth_token')}
```

---

## Tabela de Rotas

| Método   | Rota                              | Auth | Descrição                              |
|----------|-----------------------------------|------|----------------------------------------|
| `POST`   | `/api/auth/login`                 | ❌   | Login, retorna JWT                     |
| `POST`   | `/api/auth/logout`                | ✅   | Invalida token (blacklist em memória)  |
| `GET`    | `/api/posts`                      | ❌   | Lista posts publicados (paginado)      |
| `GET`    | `/api/posts/archives`             | ❌   | Posts agrupados por mês/ano            |
| `GET`    | `/api/posts/tag/:slug`            | ❌   | Posts filtrados por tag                |
| `GET`    | `/api/posts/:slug`                | ❌   | Detalhes de um post + incrementa views |
| `POST`   | `/api/posts/admin`                | ✅   | Cria novo post                         |
| `PUT`    | `/api/posts/admin/:id`            | ✅   | Edita post existente                   |
| `DELETE` | `/api/posts/admin/:id`            | ✅   | Exclui post                            |
| `PATCH`  | `/api/posts/admin/:id/status`     | ✅   | Altera status do post                  |
| `GET`    | `/api/comments/:postId`           | ❌   | Lista comentários aprovados do post    |
| `POST`   | `/api/comments`                   | ❌   | Cria comentário (pendente de aprovação)|
| `PATCH`  | `/api/comments/admin/:id/approve` | ✅   | Aprova comentário                      |
| `DELETE` | `/api/comments/admin/:id`         | ✅   | Exclui comentário                      |
| `GET`    | `/api/reactions/:postId`          | ❌   | Contagem de reações por tipo           |
| `POST`   | `/api/reactions`                  | ❌   | Adiciona reação ao post                |
| `GET`    | `/api/tags`                       | ❌   | Lista todas as tags                    |
| `GET`    | `/api/user/topics`                | ❌   | Lista tópicos do sidebar               |
| `PUT`    | `/api/user/bio`                   | ✅   | Atualiza bio do admin                  |
| `GET`    | `/api/health`                     | ❌   | Health check do servidor               |

---

## Detalhamento das Rotas

---

### `POST /api/auth/login`

**Rate limit:** 5 tentativas por 15 minutos por IP.

**Request body:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response 200:**
```json
{
  "message": "ACCESS_GRANTED",
  "token": "eyJhbGci...",
  "user": { "id": 1, "username": "admin", "role": "admin" }
}
```

**Erros:**
| Código | `error`              | Causa                          |
|--------|----------------------|--------------------------------|
| 400    | `MISSING_FIELDS`     | username ou password ausente   |
| 401    | `INVALID_CREDENTIALS`| Usuário não encontrado ou senha errada |
| 429    | `RATE_LIMITED`       | Muitas tentativas de login     |
| 500    | `SERVER_ERROR`       | Erro interno                   |

---

### `POST /api/auth/logout`

**Header obrigatório:** `Authorization: Bearer <token>`

**Response 200:**
```json
{ "message": "LOGGED_OUT" }
```

> O token é adicionado a uma blacklist **em memória**. Reiniciar o servidor limpa a blacklist.

---

### `GET /api/posts`

**Query params opcionais:**
| Parâmetro | Tipo    | Padrão | Descrição                       |
|-----------|---------|--------|---------------------------------|
| `page`    | integer | `1`    | Página atual                    |
| `limit`   | integer | `10`   | Posts por página (máx 50)       |
| `search`  | string  | `""`   | Busca em `title` e `content`    |

**Response 200:**
```json
{
  "posts": [
    {
      "id": 1,
      "title": "Meu primeiro post",
      "slug": "meu-primeiro-post",
      "excerpt": "Um breve resumo...",
      "cover_image_url": null,
      "views": 42,
      "created_at": "2026-02-15T10:00:00.000Z",
      "updated_at": "2026-02-15T10:00:00.000Z",
      "author": "admin",
      "tags": [{ "id": 1, "name": "life", "slug": "life" }]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### `GET /api/posts/archives`

> ⚠️ Esta rota **deve** ser registrada antes de `GET /api/posts/:slug` no router para evitar que `archives` seja interpretado como slug.

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "month": "2026-02-01T00:00:00.000Z", "total": 3 },
    { "month": "2026-01-01T00:00:00.000Z", "total": 5 }
  ]
}
```

---

### `GET /api/posts/:slug`

**Response 200:**
```json
{
  "post": {
    "id": 1,
    "title": "Meu primeiro post",
    "slug": "meu-primeiro-post",
    "content": "Conteúdo completo em Markdown...",
    "excerpt": "Resumo...",
    "cover_image_url": null,
    "status": "published",
    "views": 43,
    "created_at": "2026-02-15T10:00:00.000Z",
    "updated_at": "2026-02-15T10:00:00.000Z",
    "author": "admin",
    "tags": []
  }
}
```

**Efeito colateral:** incrementa `posts.views` e insere registro em `views_log` (async, não bloqueia resposta).

**Erros:**
| Código | `error`     | Causa                              |
|--------|-------------|-------------------------------------|
| 404    | `NOT_FOUND` | Slug não encontrado ou não publicado|
| 500    | `SERVER_ERROR` | Erro interno                     |

---

### `POST /api/posts/admin`

**Header:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "title": "Novo post",
  "content": "Conteúdo em **Markdown**",
  "excerpt": "Resumo opcional",
  "cover_image_url": "https://picsum.photos/800/400",
  "status": "published",
  "tags": ["life", "thoughts"]
}
```

**Response 201:**
```json
{
  "message": "POST_CREATED",
  "post": {
    "id": 3,
    "title": "Novo post",
    "slug": "novo-post",
    "status": "published",
    "created_at": "2026-03-04T12:00:00.000Z"
  }
}
```

**Erros:**
| Código | `error`         | Causa                   |
|--------|-----------------|-------------------------|
| 400    | `MISSING_FIELDS`| `title` ou `content` ausente |
| 401    | —               | Token inválido ou ausente|
| 500    | `SERVER_ERROR`  | Erro interno             |

---

### `DELETE /api/posts/admin/:id`

**Header:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "message": "POST_DELETED",
  "post": { "id": 3, "title": "Novo post" }
}
```

**Erros:**
| Código | `error`     | Causa                     |
|--------|-------------|---------------------------|
| 401    | —           | Token inválido ou ausente  |
| 404    | `NOT_FOUND` | Post não encontrado        |
| 500    | `SERVER_ERROR` | Erro interno            |

---

### `PATCH /api/posts/admin/:id/status`

**Header:** `Authorization: Bearer <token>`

**Request body:**
```json
{ "status": "published" }
```

**Valores válidos de `status`:** `draft` | `published` | `archived`

**Response 200:**
```json
{
  "message": "STATUS_UPDATED",
  "post": { "id": 1, "status": "published" }
}
```

---

### `GET /api/comments/:postId`

**Response 200:**
```json
{
  "post_id": 1,
  "total": 2,
  "comments": [
    {
      "id": 1,
      "author_name": "Visitante",
      "content": "Ótimo post!",
      "parent_id": null,
      "created_at": "2026-02-20T14:00:00.000Z",
      "replies": []
    }
  ]
}
```

> Retorna apenas comentários com `is_approved = true`. Estruturado em árvore (respostas aninhadas em `replies`).

---

### `POST /api/comments`

**Request body:**
```json
{
  "post_id": 1,
  "author_name": "Visitante",
  "author_email": "email@exemplo.com",
  "content": "Texto do comentário",
  "parent_id": null
}
```

**Response 201:**
```json
{
  "message": "COMMENT_PENDING",
  "comment": {
    "id": 5,
    "created_at": "2026-03-04T12:00:00.000Z",
    "note": "Seu comentário será exibido após aprovação."
  }
}
```

---

### `POST /api/reactions`

**Rate limit:** aplicado via `reactionLimiter`.

**Request body:**
```json
{
  "post_id": 1,
  "type": "like",
  "session_id": "uuid-da-sessao-do-usuario"
}
```

**Tipos válidos:** `like` | `love` | `fire` | `clap` | `sad`

**Response 201:**
```json
{ "message": "REACTION_ADDED" }
```

**Erros:**
| Código | `error`          | Causa                                    |
|--------|------------------|------------------------------------------|
| 400    | `INVALID_INPUT`  | `type` inválido ou campos ausentes       |
| 400    | `MISSING_SESSION`| `session_id` ausente                     |
| 404    | `NOT_FOUND`      | Post não encontrado                      |
| 409    | `ALREADY_REACTED`| Já reagiu com este tipo (constraint UNIQUE)|
| 500    | `SERVER_ERROR`   | Erro interno                             |

---

### `GET /api/reactions/:postId`

**Response 200:**
```json
{
  "post_id": 1,
  "reactions": {
    "like": 12,
    "love": 3,
    "fire": 8,
    "clap": 1,
    "sad": 0
  }
}
```

---

### `GET /api/user/topics`

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "LIFE",     "slug": "life",     "count": 0 },
    { "id": 2, "name": "THOUGHTS", "slug": "thoughts", "count": 0 },
    { "id": 3, "name": "TRAVEL",   "slug": "travel",   "count": 0 },
    { "id": 4, "name": "MUSIC",    "slug": "music",    "count": 0 },
    { "id": 5, "name": "RANDOM",   "slug": "random",   "count": 0 }
  ]
}
```

---

### `PUT /api/user/bio`

**Header:** `Authorization: Bearer <token>`

**Request body:**
```json
{ "bio": "Nova bio aqui (máx 500 caracteres)" }
```

**Response 200:**
```json
{
  "success": true,
  "message": "Bio atualizada com sucesso.",
  "data": {
    "bio": "Nova bio aqui",
    "updatedAt": "2026-03-04T12:00:00.000Z"
  }
}
```

---

### `GET /api/health`

**Response 200:**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "environment": "development",
  "database": "connected",
  "timestamp": "2026-03-04T12:00:00.000Z"
}
```

---

## Middlewares Globais

| Middleware         | Escopo         | Descrição                                            |
|--------------------|----------------|------------------------------------------------------|
| `helmet`           | Global         | Headers HTTP de segurança                            |
| `cors`             | Global         | Permite apenas `CORS_ORIGIN` (padrão: `localhost:3000`) |
| `morgan`           | Global         | Logging de requisições (dev: `dev`, prod: `combined`)|
| `apiLimiter`       | `/api/*`       | Rate limit geral de proteção                         |
| `loginLimiter`     | `POST /api/auth/login` | Máx 5 tentativas/15 min por IP              |
| `reactionLimiter`  | `POST /api/reactions`  | Rate limit anti-spam de reações             |
| `authMiddleware`   | Rotas protegidas | Valida Bearer JWT + verifica blacklist              |

---

## Códigos de Erro Comuns

| Código | Significado                          |
|--------|--------------------------------------|
| 400    | Dados inválidos ou campos obrigatórios ausentes |
| 401    | Token JWT ausente, inválido ou expirado |
| 404    | Recurso não encontrado               |
| 409    | Conflito (ex: já reagiu, slug duplicado) |
| 429    | Rate limit atingido                   |
| 500    | Erro interno do servidor              |

---

## Estrutura de banco: ver [BANCO-DE-DADOS.md](./BANCO-DE-DADOS.md)
