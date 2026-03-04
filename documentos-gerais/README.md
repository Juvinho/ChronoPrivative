# ChronoPrivative
> Última atualização: 04/03/2026

**Diário digital privado com estética retro/cyberpunk.**

Blog pessoal de uso exclusivo do proprietário, com interface terminal e animações glitch. Suporta publicação de posts em Markdown, reações anônimas, comentários com moderação, busca avançada e widgets de sidebar (bio, tópicos, arquivos).

---

## Stack

| Camada    | Tecnologia                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 15 · React 19 · TypeScript  |
| Estilos   | Tailwind CSS 4 · CSS custom (glitch, grid animado) |
| Backend   | Node.js · Express 4                 |
| Banco     | PostgreSQL 18                       |
| Auth      | JWT (jsonwebtoken) + bcrypt         |
| Processo  | PM2 (produção) · nodemon (dev)      |

---

## Pré-requisitos

- Node.js ≥ 18
- PostgreSQL 18 instalado e rodando
- Um banco de dados criado: `chronoprivative_db`

---

## Setup Completo (Desenvolvimento Local)

### 1. Clonar e instalar dependências do frontend

```bash
cd "d:\Projetos de Site\ChronoPrivative"
npm install
```

### 2. Instalar dependências do backend

```bash
cd backend
npm install
```

### 3. Configurar variáveis de ambiente

**Frontend** — criar `.env.local` na raiz:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Backend** — editar `backend/.env`:
```env
PORT=4000
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/chronoprivative_db
JWT_SECRET=segredo_unico_e_longo_minimo_32_caracteres
ADMIN_PASSWORD=admin
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. Executar migrations no banco

```bash
cd backend
npm run migrate
```

### 5. Popular banco com dados iniciais (seed)

```bash
npm run seed                        # cria usuário admin
node scripts/update-admin-hash.js   # define hash bcrypt da senha
node scripts/seed-and-migrate.js    # insere tópicos + posts de exemplo
```

### 6. Iniciar os serviços

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → Servidor rodando em http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd ..   # raiz do projeto
npm run dev
# → Aplicação em http://localhost:3000
```

### 7. Acessar

Abrir no browser: **http://localhost:3000**

Senha de acesso: `admin` (ou `juan` — apenas desbloqueia UI, sem JWT)

---

## Variáveis de Ambiente

### Frontend — `.env.local`

| Variável              | Obrigatório | Descrição                                     |
|-----------------------|-------------|-----------------------------------------------|
| `NEXT_PUBLIC_API_URL` | ✅          | URL base do backend (`http://localhost:4000`) |

### Backend — `backend/.env`

| Variável         | Obrigatório | Descrição                                                |
|------------------|-------------|----------------------------------------------------------|
| `DATABASE_URL`   | ✅          | Connection string PostgreSQL                              |
| `JWT_SECRET`     | ✅          | Segredo para assinar tokens JWT (mínimo 32 chars)        |
| `ADMIN_PASSWORD` | ✅          | Senha do admin usada pelo `npm run seed`                 |
| `PORT`           | ✅          | Porta do backend (padrão: `4000`, fallback: `3002`)      |
| `NODE_ENV`       | ✅          | `development` ou `production`                            |
| `CORS_ORIGIN`    | ✅          | Domínio autorizado do frontend (`http://localhost:3000`) |

Ver template em `backend/.env.example`.

---

## Scripts Disponíveis

### Frontend (raiz do projeto)

| Script         | Comando               | Descrição                          |
|----------------|-----------------------|------------------------------------|
| `dev`          | `npm run dev`         | Servidor dev em `localhost:3000`   |
| `build`        | `npm run build`       | Build de produção                  |
| `start`        | `npm start`           | Serve o build de produção          |
| `lint`         | `npm run lint`        | Verifica código com ESLint         |

### Backend (`cd backend`)

| Script         | Comando                   | Descrição                                   |
|----------------|---------------------------|---------------------------------------------|
| `dev`          | `npm run dev`             | Servidor dev com hot-reload (nodemon)        |
| `start`        | `npm start`               | Servidor produção (`node server.js`)         |
| `migrate`      | `npm run migrate`         | Executa `migrations.sql` no banco            |
| `seed`         | `npm run seed`            | Cria usuário admin com senha do `.env`       |
| `prod`         | `npm run prod`            | Inicia via PM2 (`ecosystem.config.js`)       |
| `prod:logs`    | `npm run prod:logs`       | Logs em tempo real via PM2                   |
| `prod:restart` | `npm run prod:restart`    | Reinicia processo PM2                        |
| `prod:stop`    | `npm run prod:stop`       | Para processo PM2                            |

### Scripts de suporte (`backend/scripts/`)

| Script                    | Descrição                                              |
|---------------------------|--------------------------------------------------------|
| `migrate.js`              | Executa `migrations.sql` (mesma função do `npm run migrate`) |
| `seed-and-migrate.js`     | Setup completo: migrations + 5 tópicos + 2 posts       |
| `update-admin-hash.js`    | Redefine hash bcrypt do usuário `admin` no banco       |
| `test-e2e-delete.js`      | Testa fluxo login → criar post → deletar post          |

---

## Status do Projeto — 04/03/2026

| Funcionalidade                | Status         |
|-------------------------------|----------------|
| Login com autenticação JWT    | ✅ Implementado |
| CRUD de posts (criar/editar/excluir) | ✅ Implementado |
| Feed de posts publicados      | ✅ Implementado |
| Sidebar: Topics               | ✅ Implementado |
| Sidebar: Archives por mês     | ✅ Implementado |
| Sidebar: Bio editável         | ⚠️ Parcial (URL relativa — ver COMPONENTES.md) |
| Reações nos posts             | ✅ Backend OK — ⚠️ Frontend pendente de integração completa |
| Comentários com moderação     | ✅ Backend OK — ⚠️ Frontend pendente |
| Busca de posts                | ⚠️ Parcial — endpoint na API, UI básica |
| Upload de imagens             | ❌ Endpoint não implementado no backend |
| Dark mode                     | ⚠️ Parcial — componente existe, persistência local |
| Timeline view                 | ⚠️ Parcial — componente existe, dados mock |
| Mood heatmap                  | ⚠️ Parcial — componente existe, sem campo `mood` no schema atual |
| Serendipity (post aleatório)  | ⚠️ Parcial — modal existe, endpoint não implementado |
| Calendário de posts           | ⚠️ Parcial — componente existe, integração manual |

---

## Portas

| Serviço     | Porta |
|-------------|-------|
| Frontend    | 3000  |
| Backend API | 4000  |
| PostgreSQL  | 5432  |

---

## Documentação

Toda a documentação técnica está em `documentos-gerais/`:

| Arquivo               | Conteúdo                                    |
|-----------------------|---------------------------------------------|
| `BANCO-DE-DADOS.md`   | Schema, tabelas, índices, migrations        |
| `API.md`              | Todas as rotas, exemplos de request/response|
| `COMPONENTES.md`      | Componentes React, props, hooks             |
| `ARQUITETURA.md`      | Diagrama, fluxos, decisões técnicas (ADRs)  |
| `BUGS-E-DECISOES.md`  | Histórico de bugs e regras que não reverter |
| `GUIA-DEPLOY.md`      | Deploy frontend, backend e banco            |
| `GLOSSARIO.md`        | Termos técnicos e abreviações               |
| `INDICE.md`           | Índice da suíte de documentação             |
