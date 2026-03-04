# BANCO DE DADOS — ChronoPrivative
> Última atualização: 04/03/2026

---

## Visão Geral

- **SGBD:** PostgreSQL 18
- **Nome do banco:** `chronoprivative_db`
- **Usuário:** `postgres`
- **Host local:** `localhost:5432`
- **Total de tabelas:** 8
- **Arquivo de migrations:** `backend/src/db/migrations.sql`

---

## Diagrama Entidade-Relacionamento (ASCII)

```
┌──────────────┐         ┌─────────────────┐         ┌──────────────┐
│    users     │         │      posts       │         │     tags     │
├──────────────┤    1:N  ├─────────────────┤   N:N   ├──────────────┤
│ id (PK)      │────────▶│ id (PK)         │◀───────▶│ id (PK)      │
│ username     │         │ title           │ post_tags│ name         │
│ password_hash│         │ slug (UNIQUE)   │         │ slug (UNIQUE)│
│ role         │         │ content         │         └──────────────┘
│ bio          │         │ excerpt         │
│ bio_updated_at│        │ cover_image_url │         ┌──────────────┐
│ created_at   │         │ author_id (FK)  │    1:N  │   comments   │
└──────────────┘         │ status          │────────▶├──────────────┤
                         │ views           │         │ id (PK)      │
                         │ created_at      │         │ post_id (FK) │
                         │ updated_at      │         │ author_name  │
                         └─────────────────┘         │ author_email │
                                  │                   │ content      │
                         1:N      │                   │ is_approved  │
                    ┌─────────────┴──────┐            │ parent_id(FK)│
                    ▼                    ▼            │ created_at   │
          ┌──────────────┐     ┌──────────────┐      └──────────────┘
          │  reactions   │     │  views_log   │
          ├──────────────┤     ├──────────────┤      ┌──────────────┐
          │ id (PK)      │     │ id (PK)      │      │    topics    │
          │ post_id (FK) │     │ post_id (FK) │      ├──────────────┤
          │ type         │     │ viewer_ip    │      │ id (PK)      │
          │ user_ip      │     │ user_agent   │      │ name (UNIQUE)│
          │ session_id   │     │ visited_at   │      │ slug (UNIQUE)│
          │ created_at   │     └──────────────┘      │ count        │
          └──────────────┘                           │ created_at   │
                                                     └──────────────┘
```

---

## Tabelas — Definição Completa

### `users`
| Coluna          | Tipo          | Constraints                  | Descrição                      |
|-----------------|---------------|------------------------------|-------------------------------|
| `id`            | SERIAL        | PRIMARY KEY                  | Identificador único            |
| `username`      | VARCHAR(50)   | UNIQUE NOT NULL              | Nome de usuário                |
| `password_hash` | TEXT          | NOT NULL                     | Hash bcrypt da senha           |
| `role`          | VARCHAR(20)   | DEFAULT `'admin'`            | Papel do usuário               |
| `bio`           | TEXT          | DEFAULT `''`                 | Biografia exibida no sidebar   |
| `bio_updated_at`| TIMESTAMP     | DEFAULT NOW()                | Data da última edição da bio   |
| `created_at`    | TIMESTAMP     | DEFAULT NOW()                | Data de criação                |

---

### `posts`
| Coluna            | Tipo          | Constraints                                     | Descrição                     |
|-------------------|---------------|-------------------------------------------------|-------------------------------|
| `id`              | SERIAL        | PRIMARY KEY                                     | Identificador único            |
| `title`           | VARCHAR(255)  | NOT NULL                                        | Título do post                 |
| `slug`            | VARCHAR(255)  | UNIQUE NOT NULL                                 | URL amigável (auto-gerado)     |
| `content`         | TEXT          | NOT NULL                                        | Corpo do post (Markdown)       |
| `excerpt`         | TEXT          | —                                               | Trecho curto para listagem     |
| `cover_image_url` | TEXT          | —                                               | URL da imagem de capa          |
| `author_id`       | INTEGER       | FK → `users(id)` ON DELETE SET NULL             | Autor do post                  |
| `status`          | VARCHAR(20)   | CHECK IN (`draft`, `published`, `archived`)     | Estado do post                 |
| `views`           | INTEGER       | DEFAULT 0                                       | Contador de visualizações      |
| `created_at`      | TIMESTAMP     | DEFAULT NOW()                                   | Data de criação                |
| `updated_at`      | TIMESTAMP     | DEFAULT NOW() — atualizado por trigger          | Data da última edição          |

**Trigger:** `trigger_update_posts_updated_at` — executa `BEFORE UPDATE` para manter `updated_at` sincronizado automaticamente.

---

### `reactions`
| Coluna       | Tipo        | Constraints                                              | Descrição                      |
|--------------|-------------|----------------------------------------------------------|-------------------------------|
| `id`         | SERIAL      | PRIMARY KEY                                              | Identificador único            |
| `post_id`    | INTEGER     | FK → `posts(id)` ON DELETE CASCADE                       | Post relacionado               |
| `type`       | VARCHAR(20) | CHECK IN (`like`, `love`, `fire`, `clap`, `sad`)         | Tipo de reação                 |
| `user_ip`    | VARCHAR(45) | —                                                        | IP do usuário (IPv4/IPv6)      |
| `session_id` | TEXT        | —                                                        | ID de sessão anônima           |
| `created_at` | TIMESTAMP   | DEFAULT NOW()                                            | Data da reação                 |

**Constraint única:** `UNIQUE(post_id, session_id, type)` — um usuário não pode reagir duas vezes com o mesmo tipo no mesmo post.

---

### `comments`
| Coluna         | Tipo         | Constraints                                    | Descrição                         |
|----------------|--------------|------------------------------------------------|----------------------------------|
| `id`           | SERIAL       | PRIMARY KEY                                    | Identificador único               |
| `post_id`      | INTEGER      | FK → `posts(id)` ON DELETE CASCADE             | Post relacionado                  |
| `author_name`  | VARCHAR(100) | NOT NULL                                       | Nome do comentarista              |
| `author_email` | VARCHAR(150) | —                                              | E-mail (opcional)                 |
| `content`      | TEXT         | NOT NULL                                       | Texto do comentário               |
| `is_approved`  | BOOLEAN      | DEFAULT false                                  | Moderação: aprovado ou não        |
| `parent_id`    | INTEGER      | FK → `comments(id)` ON DELETE CASCADE          | Suporte a respostas aninhadas     |
| `created_at`   | TIMESTAMP    | DEFAULT NOW()                                  | Data do comentário                |

---

### `tags`
| Coluna | Tipo        | Constraints      | Descrição                     |
|--------|-------------|------------------|-------------------------------|
| `id`   | SERIAL      | PRIMARY KEY      | Identificador único            |
| `name` | VARCHAR(50) | UNIQUE NOT NULL  | Nome legível da tag            |
| `slug` | VARCHAR(50) | UNIQUE NOT NULL  | Versão URL da tag              |

---

### `topics`
| Coluna       | Tipo         | Constraints      | Descrição                               |
|--------------|--------------|------------------|-----------------------------------------|
| `id`         | SERIAL       | PRIMARY KEY      | Identificador único                      |
| `name`       | VARCHAR(100) | UNIQUE NOT NULL  | Nome do tópico (exibido no sidebar)      |
| `slug`       | VARCHAR(100) | UNIQUE NOT NULL  | Versão URL do tópico                     |
| `count`      | INTEGER      | DEFAULT 0        | Posts associados a este tópico           |
| `created_at` | TIMESTAMP    | DEFAULT NOW()    | Data de criação                          |

> **Nota:** Topics são independentes de posts — gerenciados manualmente ou via seed.

---

### `post_tags` (tabela de junção N:N)
| Coluna    | Tipo    | Constraints                               |
|-----------|---------|-------------------------------------------|
| `post_id` | INTEGER | FK → `posts(id)` ON DELETE CASCADE — PK  |
| `tag_id`  | INTEGER | FK → `tags(id)` ON DELETE CASCADE — PK   |

**Chave primária composta:** `(post_id, tag_id)`

---

### `views_log`
| Coluna       | Tipo        | Constraints                         | Descrição                        |
|--------------|-------------|-------------------------------------|----------------------------------|
| `id`         | SERIAL      | PRIMARY KEY                         | Identificador único               |
| `post_id`    | INTEGER     | FK → `posts(id)` ON DELETE CASCADE  | Post visualizado                  |
| `viewer_ip`  | VARCHAR(45) | —                                   | IP do visitante                   |
| `user_agent` | TEXT        | —                                   | Navegador/dispositivo do visitante|
| `visited_at` | TIMESTAMP   | DEFAULT NOW()                       | Timestamp da visita               |

---

## Índices

| Índice                          | Tabela      | Coluna(s)    | Justificativa                                        |
|---------------------------------|-------------|--------------|------------------------------------------------------|
| `idx_posts_slug`                | posts       | `slug`       | Lookups por slug em `GET /api/posts/:slug`           |
| `idx_posts_status`              | posts       | `status`     | Filtro `WHERE status = 'published'` em listagens     |
| `idx_posts_created_at`          | posts       | `created_at` | Ordenação `DESC` na listagem paginada                |
| `idx_reactions_post_id`         | reactions   | `post_id`    | Busca de reações por post                            |
| `idx_comments_post_id`          | comments    | `post_id`    | Busca de comentários por post                        |
| `idx_comments_parent_id`        | comments    | `parent_id`  | Busca de respostas aninhadas                         |
| `idx_topics_slug`               | topics      | `slug`       | Lookup de tópico por slug                            |
| `idx_views_log_post_id`         | views_log   | `post_id`    | Agregação de visualizações por post                  |

---

## Executar Migrations

```bash
cd backend
npm run migrate
```

O script `backend/scripts/migrate.js` lê `backend/src/db/migrations.sql` e executa via `pg.Pool`. Usa `IF NOT EXISTS` em todas as criações — seguro para re-execução.

---

## Popular Banco para Desenvolvimento (Seed)

**Opção 1 — seed de usuário admin via npm:**
```bash
cd backend
npm run seed
```
Cria o usuário `admin` com a senha definida em `ADMIN_PASSWORD` (padrão: `admin`).

**Opção 2 — script completo com posts e tópicos:**
```bash
cd backend
node scripts/seed-and-migrate.js
```
Insere: 5 tópicos (LIFE, THOUGHTS, TRAVEL, MUSIC, RANDOM) + 2 posts publicados de exemplo.

**Opção 3 — redefinir hash do admin:**
```bash
cd backend
node scripts/update-admin-hash.js
```
Define `bcrypt('admin')` no campo `password_hash` do usuário `admin`.

---

## Conexão via psql

```powershell
$env:PGPASSWORD='juvinho'
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d chronoprivative_db
```

---

## Observações de Design

- Todas as FKs com `ON DELETE CASCADE` garantem limpeza automática de dados dependentes.
- `posts.author_id` usa `ON DELETE SET NULL` para preservar posts de usuários removidos.
- A tabela `topics` não tem relação direta com `posts` — é uma listagem editorial independente.
- O campo `views` em `posts` é um contador desnormalizado para performance; `views_log` é o log detalhado.
