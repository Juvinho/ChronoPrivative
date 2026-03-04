```
   ▄████████    ▄█    █▄    ▄█  ███▄▄▄▄      ▄████████    ▄████████  ▄█  ██    ▄█    ▄████████
  ███    ███   ███    ███  ███  ███▀▀▀█     ███    ███   ███    ███ ███  ██▌  ███   ███    ███
  ███    █▀    ███    ███  ███▌ ███        ███    █▀    ███    █▀  ███▌ ███▌ ███   ███    █▀
 ▄███▄▄▄       ███    ███  ███▌ ███        ███         ▄███▄▄▄     ███▌ ███▌ ███  ▄███▄▄▄
▀▀███▀▀▀       ███    ███  ███▌ ███▌      ███         ▀▀███▀▀▀     ███▌ ███▌ ███ ▀▀███▀▀▀
  ███    █▄    ███    ███  ███  ███        ███    █▄    ███    █▀  ███  ███▀▀███   ███    █▄
  ███    ███   ███    ███  ███  ███        ███    ███   ███    ███ ███  ███  ███   ███    ███
  ██████████    ▀██████▀   █▀   ███▌       ████████▀    ███    ███ █▀   ███  █▀    ██████████
```

# **CHRONOPRIVATIVE**
## *A Private Retro Cyberpunk Diary Application*

<div align="center">

[![Status](https://img.shields.io/badge/Status-🟢%20PRODUCTION%20READY-00ff00?style=flat-square&labelColor=1a0b2e)](#)
[![License](https://img.shields.io/badge/License-MIT-9400ff?style=flat-square&labelColor=0a0015)](#)
[![Node](https://img.shields.io/badge/Node-v24.11-9400ff?style=flat-square&labelColor=0a0015)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-9400ff?style=flat-square&labelColor=0a0015)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4-9400ff?style=flat-square&labelColor=0a0015)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-9400ff?style=flat-square&labelColor=0a0015)](https://www.postgresql.org/)

```
┌─────────────────────────────────────────────┐
│  🔐 SECURE • 🎨 AESTHETIC • 🚀 PERFORMANT  │
└─────────────────────────────────────────────┘
```

</div>

---

## 📋 Sumário Executivo

**ChronoPrivative** é uma aplicação de diário pessoal privado com interface retrô-cyberpunk. Desenvolvida com tecnologia moderna, oferece segurança em nível enterprise com ambiente visual que homenageia a era dos terminais de computador.

Desde o conceito inicial até a implementação final, esta documentação registra cada etapa do desenvolvimento, decisões arquiteturais e melhorias contínuas realizadas pela equipe.

---

## 🎨 Paleta de Cores (Design Identity)

```
┌──────────────────────────────────┐
│ 🟪 #9400FF - Roxo Primário       │  ← Theme Primary
│ 🟩 #00FF00 - Verde Cybernetico   │  ← Success / Active
│ ⬛ #0A0015 - Preto Profundo      │  ← Background Primary
│ 🟫 #1A0B2E - Preto Secundário    │  ← Background Secondary
│ ⚪ #FFFFFF - Branco Puro         │  ← Text Light
│ 🔲 #505050 - Cinza Médio         │  ← Text Secondary
└──────────────────────────────────┘
```

> ⚠️ **NOTA IMPORTANTE:** A paleta de cores é elemento crítico da identidade do projeto. Qualquer alteração de UI deve manter estas cores como base.

---

## 🚀 Stack Tecnológico

### Frontend
- **Framework:** Next.js 15.4.9
- **Runtime:** React 19.2.1
- **Linguagem:** TypeScript
- **Estilos:** Tailwind CSS + CSS Customizado
- **Animações:** Framer Motion
- **Ícones:** Lucide React

### Backend
- **Runtime:** Node.js v24.11.1
- **Framework:** Express.js 4.21.0
- **Autenticação:** JWT (24h expiration)
- **Criptografia:** bcrypt (12 salt rounds)
- **Process Manager:** PM2 5.4.0

### Database
- **SGBD:** PostgreSQL 18
- **Conexão:** pg pool (10 max connections)
- **Migrations:** SQL customizado
- **Índices:** 7 índices para performance

### Infraestrutura
- **Rate Limiting:** express-rate-limit
- **Segurança:** Helmet.js + CORS
- **Monitoramento:** PM2 com métricas
- **Graceful Shutdown:** 10s timeout

---

## 📁 Estrutura do Projeto

```
ChronoPrivative/
├── 📂 app/
│   ├── page.tsx           ← SPA Principal (1429 linhas)
│   ├── layout.tsx         ← Root Layout com Hydration Fix
│   └── globals.css        ← Estilos Globais
│
├── 📂 components/
│   ├── typewriter-text.tsx      ← Efeito Typewriter
│   ├── login-screen.tsx         ← Tela de Login
│   ├── terminal-input.tsx       ← Input Customizado
│   ├── terminal-textarea.tsx    ← Textarea Customizado
│   ├── retro-image-placeholder.tsx ← Placeholder de Imagens
│   └── highlight-text.tsx       ← Highlight em Search
│
├── 📂 hooks/
│   └── use-posts.ts       ← Hook de Integração API (102 linhas)
│
├── 📂 lib/
│   └── utils.ts           ← Funções Utilitárias
│
├── 📂 backend/
│   ├── server.js          ← Express App com Graceful Shutdown
│   ├── ecosystem.config.js ← Configuração PM2
│   ├── migrations.sql     ← Schema do BD
│   ├── seeds.js           ← Dados Iniciais
│   │
│   ├── 📂 controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── reactionController.js
│   │   ├── commentController.js
│   │   └── tagController.js
│   │
│   └── 📂 routes/
│       ├── auth.js
│       ├── posts.js
│       ├── reactions.js
│       ├── comments.js
│       └── tags.js
│
└── 📂 docs/
    ├── relatórioFrontv1.md
    ├── relatórioQA_HydrationError_20260304.md
    ├── FRONTEND_IMPLEMENTATION_SUMMARY.md
    ├── FINAL_REPORT.md
    └── USAGE_GUIDE.md
```

---

## ⚙️ Instalação & Setup

### Pré-requisitos
- Node.js >= v24.11
- PostgreSQL >= 18
- npm ou yarn

### 1️⃣ Clonar e Instalar

```bash
# Clonar repositório
git clone https://github.com/Juvinho/ChronoPrivative.git
cd ChronoPrivative

# Instalar dependências frontend
npm install

# Instalar dependências backend
cd backend
npm install
cd ..
```

### 2️⃣ Configurar Banco de Dados

```bash
# Criar banco de dados
createdb chronoprivative_db

# Executar migrations
psql -U postgres -d chronoprivative_db < backend/migrations.sql

# Popula dados iniciais
cd backend
npm run seed
```

### 3️⃣ Configurar Variáveis de Ambiente

**`.env.local` (Frontend):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**`backend/.env`:**
```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=juvinho
DB_NAME=chronoprivative_db
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRATION=24h
```

### 4️⃣ Iniciar Serviços

**Backend (PM2):**
```bash
cd backend
npm run prod
```

**Frontend (Desenvolvimento):**
```bash
npm run dev
# → http://localhost:3000
```

**Frontend (Produção):**
```bash
npm run build
npm start
```

---

## 🔐 Credenciais Padrão

```
👤 Username: admin
🔑 Password: suaSenhaEspecificaAqui
⏱️ JWT Expiration: 24 horas
```

> ⚠️ **IMPORTANTE:** Altere credenciais em produção!

---

## 📡 Endpoints da API

### Autenticação
```
POST   /api/auth/login       → Login com JWT
POST   /api/auth/logout      → Logout (blacklist token)
```

### Posts
```
GET    /api/posts            → Listar todos posts
GET    /api/posts/:slug      → Obter post específico
POST   /api/posts            → Criar novo post
PUT    /api/posts/:id        → Atualizar post
DELETE /api/posts/:id        → Deletar post
```

### Reactions
```
POST   /api/reactions        → Adicionar reação
GET    /api/reactions/:postId → Contar reações
DELETE /api/reactions/:id    → Remover reação
```

### Comments
```
GET    /api/comments/:postId → Listar comentários
POST   /api/comments         → Criar comentário (aprovação pendente)
PUT    /api/comments/:id     → Aprovar comentário
DELETE /api/comments/:id     → Deletar comentário
```

### Tags
```
GET    /api/tags             → Listar tags com contagem
GET    /api/tags/:name/posts → Posts por tag
```

### Health
```
GET    /api/health           → Status do servidor + métricas
```

---

## 🧪 Testes

### Verificar Health Check
```bash
curl http://localhost:3001/api/health
```

### Testar Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"suaSenhaEspecificaAqui"}'
```

### Listar Posts
```bash
curl http://localhost:3001/api/posts
```

---

## 📊 Desenvolvimento & Histórico de Commits

### Commits Principais

| Hash | Tipo | Descrição |
|------|------|-----------|
| `77c8f07` | ✨ feat(api) | Hook usePosts para integração backend |
| `8e0c258` | ♻️ refactor(frontend) | Integração API + remoção posts hardcoded |
| `00d2984` | 🐛 fix(hydration) | Corrigir React hydration warning |
| `38cbb48` | 📚 docs | Documentação completa (5 MD files) |

### Fases do Desenvolvimento

#### 🔵 Fase 1: Planejamento & Especificação
- Definição de requisitos
- Arquitetura do sistema
- Design UI/UX com paleta de cores
- Wireframes e protótipos

#### 🟣 Fase 2: Backend Implementation
- Setup Express.js com PM2
- PostgreSQL schema (8 tabelas)
- Controllers CRUD completos
- Autenticação JWT
- Rate limiting & security headers

#### 🟪 Fase 3: Frontend Initial
- Scaffolding Next.js
- Componentes retrô-cyberpunk
- Integração com Tailwind + Custom CSS
- Typewriter effect
- Login screen

#### 🟨 Fase 4: Integration & Cleanup
- Remove posts hardcoded (2 posts fictícios)
- Cria hook `usePosts` para API
- Integra endpoints GET/POST/DELETE
- Transform hashtags (#) → cordões ($)
- Load/Error states

#### 🟩 Fase 5: QA & Fixes
- Identifica React hydration error
- Corrige suppressHydrationWarning
- Validates all endpoints
- Console error free

#### 🟦 Fase 6: Documentation
- Relatório técnico completo
- Guia de uso para usuários
- Documentação de API
- Esta seção (README profissional)

---

## ✨ Features Principais

### ✅ Autenticação Segura
```
🔐 JWT Tokens (24h)
🔒 Bcrypt Password Hashing (12 salt rounds)
🛑 Rate Limiting (5/min login)
🌐 CORS Restrito
```

### ✅ Diário Pessoal
```
📝 Criar posts com título e conteúdo
🏷️ Categorizar com tags (LIFE, THOUGHTS, etc)
🎭 Metadata emocional (mood, weather, listening to)
🖼️ Upload de imagens com drag & drop
🔍 Search e filter por tags
```

### ✅ Interatividade
```
💬 Comentários (com aprovação)
👍 Reações em posts
⏰ Timeline com posts ordenados
🔄 Atualização em tempo real
📱 Interface responsiva
```

### ✅ Estética Retrô
```
🖥️ Terminal dos anos 80/90
💜 Paleta roxo/preto
✨ Glitch effects
⌨️ Atalhos de teclado
🎬 Animações suaves
```

---

## ⌨️ Atalhos de Teclado

```
Alt + N        → Novo post
?              → Mostrar atalhos
/              → Focus search bar
J ou ↓         → Próximo post
K ou ↑         → Post anterior
Enter          → Expandir metadata
Esc            → Fechar tudo
Ctrl + S       → Publicar (modo editor)
```

---

## 🐛 Troubleshooting

### Backend não inicia na porta 3001
```bash
# Verificar se porta está livre
netstat -ano | findstr :3001

# Se ocupada, matar processo
taskkill /PID <PID> /F

# Reiniciar backend
npm run prod
```

### Posts não carregam
```bash
# Verificar saúde do servidor
curl http://localhost:3001/api/health

# Verificar database
psql -U postgres -d chronoprivative_db

# Checar PM2 logs
npm run prod:logs
```

### React Hydration Error
```
✅ RESOLVIDO: suppressHydrationWarning adicionado ao <html>
Ver: relatórioQA_HydrationError_20260304.md
```

---

## 🔒 Segurança

- ✅ Senhas com bcrypt (12 salt rounds)
- ✅ JWT com expiration 24h
- ✅ Rate limiting configurado
- ✅ CORS restrito ao frontend
- ✅ Helmet.js headers
- ✅ Graceful shutdown (10s timeout)
- ✅ Memory monitoring com PM2
- ✅ Auto-restart em crashes

---

## 📊 Monitoramento & Health Check

### Status Real-time
```bash
# Ver status dos processos
npm run prod:monit

# Ver logs em tempo real
npm run prod:logs

# Restart se necessário
npm run prod:restart
```

### Métricas do Health Check
```json
GET /api/health

{
  "status": "ONLINE",
  "database": "CONNECTED",
  "timestamp": "2026-03-04T01:00:00Z",
  "uptime": 3600,
  "memory": {
    "heapUsed": "87MB",
    "heapTotal": "100MB",
    "percentage": "87%"
  }
}
```

---

## 📚 Documentação Técnica

Consulte os arquivos de documentação para detalhes específicos:

- 📄 **USAGE_GUIDE.md** - Guia de uso prático
- 📄 **FINAL_REPORT.md** - Relatório final detalhado
- 📄 **relatórioFrontv1.md** - Análise técnica do frontend
- 📄 **FRONTEND_IMPLEMENTATION_SUMMARY.md** - Resumo executivo
- 🐛 **relatórioQA_HydrationError_20260304.md** - Bug report & fix

---

## 🎯 Roadmap Futuro

- [ ] Edição de posts existentes (PUT /api/posts/:id UI)
- [ ] Upload real de imagens para servidor
- [ ] Comments viewing no frontend
- [ ] Reactions voting interativo
- [ ] Search avançado no backend
- [ ] Tags autocomplete
- [ ] Dark mode toggle (tema já suporta)
- [ ] Export posts para PDF/Markdown
- [ ] Backup automático do BD
- [ ] 2FA (Two-Factor Authentication)

---

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit as mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- Use TypeScript para tipagem
- Mantenha paleta de cores roxo/preto
- Siga convenção de commits (feat, fix, refactor, docs, etc)
- Adicione testes para novas features
- Documente mudanças em README.md

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo LICENSE para detalhes.

---

## 👥 Equipe de Desenvolvimento

| Papel | Responsabilidade |
|-------|------------------|
| **Arquiteto de Sistema** | Design da arquitetura, database schema, security patterns |
| **Backend Engineer** | Express.js, PostgreSQL, PM2, rate limiting, JWT |
| **Frontend Engineer** | React, Next.js, Tailwind, integração API, UX |
| **QA Sênior** | Testes, bug reports, hydration error fix |
| **Redator Técnico** | Documentação, este README, relatórios |

---

## 📞 Suporte

Dúvidas ou problemas?

1. Consulte a **documentação técnica** em `/docs`
2. Revise o **guia de troubleshooting** acima
3. Abra uma **issue no GitHub** para reportar bugs

---

## 🙏 Agradecimentos

Obrigado por visitar o ChronoPrivative! Este projeto é resultado de:

- 🎨 Design inspirado em estética cyberpunk retrô
- 🔧 Práticas modernas de desenvolvimento
- 📚 Documentação profissional e completa
- 🤝 Trabalho em equipe colaborativo

---

<div align="center">

```
╔═══════════════════════════════════════╗
║  > CHRONOPRIVATIVE v1.0.0             ║
║  > STATUS: PRODUCTION READY ✓         ║
║  > LAST UPDATED: 2026-03-04           ║
║  > TEAM: Development Excellence       ║
╚═══════════════════════════════════════╝
```

### 🚀 Deploy com Confiança

| Ambiente | Status | Comando |
|----------|--------|---------|
| **Development** | ✅ Online | `npm run dev` |
| **Production** | ✅ Ready | `npm run prod` |
| **Database** | ✅ Synced | PostgreSQL 18 |

---

**Feito com 💜 e muita curiosidade digital**

</div>
