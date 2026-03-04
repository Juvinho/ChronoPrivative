# ChronoPrivative — Backend API 🔐

Servidor backend completo para **ChronoPrivative** — diário privado retro/cyberpunk, construído com **Node.js + Express + PostgreSQL**.

---

## 🚀 Quickstart

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Criar banco de dados PostgreSQL

```bash
createdb chronoprivative_db
```

### 3. Configurar `.env`

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/chronoprivative_db
JWT_SECRET=seu_jwt_secret_seguro_aqui
ADMIN_PASSWORD=suaSenhaEspecificaAqui
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. Executar migrations (criar tabelas)

```bash
npm run migrate
```

### 5. Criar usuário admin (seed)

```bash
npm run seed
```

### 6. Iniciar servidor

**Desenvolvimento** (com hot-reload):

```bash
npm run dev
```

**Produção**:

```bash
npm start
```

Servidor rodará em `http://localhost:3001`

---

## 📋 Estrutura de Arquivos

```
backend/
├── src/
│   ├── controllers/          # Lógica de negócio
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── reactionController.js
│   │   ├── commentController.js
│   │   └── tagController.js
│   ├── middlewares/          # Middlewares Express
│   │   ├── authMiddleware.js
│   │   └── rateLimiter.js
│   ├── routes/               # Definição de rotas
│   │   ├── auth.js
│   │   ├── posts.js
│   │   ├── reactions.js
│   │   ├── comments.js
│   │   └── tags.js
│   ├── db/                   # Database
│   │   ├── pool.js          # Pool de conexões PostgreSQL
│   │   └── migrations.sql   # Schema SQL
│   └── utils/                # Utilitários
│       ├── slugify.js
│       └── hashPassword.js
├── .env.example             # Variáveis de exemplo
├── .env                     # Variáveis locais (não commitar)
├── package.json
└── server.js               # Entry point
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

| Tabela        | Descrição                          |
|---------------|------------------------------------|
| `users`       | Usuários (admin)                   |
| `posts`       | Posts/diários                      |
| `reactions`   | Reações (like, love, fire, clap)   |
| `comments`    | Comentários                        |
| `tags`        | Categorias de posts                |
| `post_tags`   | Relação N:N entre posts e tags     |
| `views_log`   | Log de visualizações               |

### Relacionamentos

```
users (1) → (N) posts
posts (1) → (N) reactions
posts (1) → (N) comments
posts (1) → (N) post_tags
tags (1) → (N) post_tags
comments (1) → (N) comments  [self-referential para replies]
```

---

## 🔑 Autenticação & Autorização

### JWT (JSON Web Token)

- **Expira em**: 24 horas
- **Gerado em**: `/api/auth/login`
- **Invalidado em**: `/api/auth/logout` (blacklist em memória)
- **Headers**: `Authorization: Bearer TOKEN`

### Roles

Atualmente: `admin` (único role)

---

## 📡 API Endpoints

### 🔐 Autenticação

| Método | Rota                   | Descrição      |
|--------|------------------------|----------------|
| POST   | `/api/auth/login`      | Login          |
| POST   | `/api/auth/logout`     | Logout (JWT)   |

### 📝 Posts

| Método | Rota                        | Auth | Descrição              |
|--------|-----------------------------| -----|------------------------|
| GET    | `/api/posts`                | -    | Lista posts (paginado) |
| GET    | `/api/posts/:slug`          | -    | Post por slug          |
| POST   | `/api/posts/admin`          | JWT  | Cria post              |
| PUT    | `/api/posts/admin/:id`      | JWT  | Edita post             |
| DELETE | `/api/posts/admin/:id`      | JWT  | Deleta post            |
| PATCH  | `/api/posts/admin/:id/status`| JWT  | Muda status            |

### ❤️ Reações

| Método | Rota                        | Auth | Descrição           |
|--------|-----------------------------| -----|---------------------|
| POST   | `/api/reactions`            | -    | Adiciona reação     |
| GET    | `/api/reactions/:postId`    | -    | Contagem de reações |

### 💬 Comentários

| Método | Rota                              | Auth | Descrição              |
|--------|-----------------------------------|------|------------------------|
| GET    | `/api/comments/:postId`           | -    | Comentários aprovados  |
| POST   | `/api/comments`                   | -    | Cria comentário        |
| PATCH  | `/api/admin/comments/:id/approve` | JWT  | Aprova comentário      |
| DELETE | `/api/admin/comments/:id`         | JWT  | Deleta comentário      |

### 🏷️ Tags

| Método | Rota              | Auth | Descrição      |
|--------|-------------------|------|----------------|
| GET    | `/api/tags`       | -    | Lista tags     |
| GET    | `/api/posts/tag/:slug` | - | Posts por tag  |

### 🏥 Health

| Método | Rota          | Descrição    |
|--------|---------------|--------------|
| GET    | `/api/health` | Status do servidor |

---

## 🌐 Exemplos de Uso (cURL)

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "suaSenhaEspecificaAqui"
  }'
```

**Response:**

```json
{
  "message": "ACCESS_GRANTED",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Criar Post

```bash
curl -X POST http://localhost:3001/api/posts/admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "title": "Meu Primeiro Post",
    "content": "Conteúdo em **markdown** completo aqui.",
    "excerpt": "Resumo do post...",
    "cover_image_url": "https://...",
    "status": "published",
    "tags": ["cyberpunk", "diário"]
  }'
```

### Listar Posts Publicados

```bash
curl "http://localhost:3001/api/posts?page=1&limit=10&search=cyberpunk"
```

### Buscar Post por Slug

```bash
curl http://localhost:3001/api/posts/meu-primeiro-post
```

### Adicionar Reação

```bash
curl -X POST http://localhost:3001/api/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 1,
    "type": "fire",
    "session_id": "abc123xyz"
  }'
```

**Tipos válidos**: `like`, `love`, `fire`, `clap`, `sad`

### Criar Comentário

```bash
curl -X POST http://localhost:3001/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 1,
    "author_name": "João Silva",
    "author_email": "joao@example.com",
    "content": "Ótimo post!"
  }'
```

### Aprovar Comentário (Admin)

```bash
curl -X PATCH http://localhost:3001/api/admin/comments/1/approve \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### Listar Tags

```bash
curl http://localhost:3001/api/api/tags
```

---

## 🛡️ Segurança

### Implementado

- ✅ **Helmet.js** — Headers HTTP securizados
- ✅ **bcrypt** — Hashing de senhas com salt rounds 12
- ✅ **JWT** — Autenticação stateless
- ✅ **Rate Limiting** — Proteção contra brute force e spam
  - Login: 5 tentativas/min
  - API geral: 100 requisições/15min
  - Reações: 30/min
- ✅ **CORS** — Apenas domínio do frontend permitido
- ✅ **SQL Injection Protection** — Parameterized queries (pg library)
- ✅ **Transações** — Data consistency garantida

### Recomendações para Produção

1. **Usar Redis** para blacklist de tokens em vez de Set em memória
2. **Environment secrets** em Azure Key Vault ou similar
3. **HTTPS/TLS** obrigatório
4. **WAF** (Web Application Firewall)
5. **Monitoring** com ferramentas como New Relic, DataDog
6. **Backup automático** do banco PostgreSQL
7. **Rate limiting** com cache distribuído (Redis)

---

## 🧪 Testes Rápidos

### Health Check

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:

```json
{
  "status": "ONLINE",
  "database": "CONNECTED",
  "timestamp": "2026-03-03T...",
  "uptime": 123.456
}
```

---

## 📦 Dependências

| Pacote          | Versão   | Uso                          |
|-----------------|----------|------------------------------|
| express         | ^4.21    | Web framework                |
| pg              | ^8.13    | PostgreSQL driver            |
| cors            | ^2.8     | CORS middleware              |
| helmet          | ^7.1     | Security headers             |
| jsonwebtoken    | ^9.0     | JWT geração/validação        |
| bcrypt          | ^5.1     | Password hashing             |
| express-rate-limit | ^7.4  | Rate limiting                |
| morgan          | ^1.10    | Logging HTTP                 |
| dotenv          | ^16.4    | Environment variables        |
| nodemon         | ^3.1 (dev) | Hot-reload development     |

---

## 🚨 Troubleshooting

### Erro: "connect ECONNREFUSED"

PostgreSQL não está rodando. Verifique:

```bash
# macOS
brew services start postgresql

# Windows (com WSL)
sudo service postgresql start

# Linux
sudo systemctl start postgresql
```

### Erro: "database does not exist"

Crie o banco:

```bash
createdb chronoprivative_db
```

### Erro: "permission denied"

Verifique credenciais em `.env` e permissões do usuário PostgreSQL.

### Erro: "JWT_SECRET is not defined"

Verifique se `.env` existe e contém `JWT_SECRET`.

---

## 📚 Recursos

- [Express.js Docs](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [node-postgres](https://node-postgres.com)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)

---

## 📄 Licença

MIT © 2026 ChronoPrivative
