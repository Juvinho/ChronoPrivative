# CHRONOPRIVATIVE — CONTEXTO TÉCNICO MASTER

**Data:** Março 4, 2026  
**Status:** ✅ | **Versão Backend:** v2.0.0

---

## 🐛 STATUS DE BUGS — Última Atualização: Março 4, 2026

| Bug | Prioridade | Status | Arquivo | Linha/Detalhe |
|-----|-----------|--------|---------|---------------|
| BUG 1 — 404 em `/api/user/topics` | CRÍTICO | ✅ Corrigido | `components/TopicsWidget.tsx` (L43) + `.env.local` (L5) | `fetch('/api/user/topics')` → `fetch(\`${NEXT_PUBLIC_API_URL}/api/user/topics\`)` |
| BUG 2 — Archives com meses sem posts | CRÍTICO | ✅ Corrigido | `backend/src/controllers/postController.js` (L338–360) + `components/ArchivesWidget.tsx` (L48–61) | SQL `WHERE status='published' GROUP BY month HAVING COUNT(*)>0`; ArchivesWidget agora auto-fetcha |
| BUG 3 — Archives em ordem alfabética | MAJOR | ✅ Corrigido | `components/ArchivesWidget.tsx` (L76–78) | `months.sort()` → `.sort((a,b) => new Date(b.month).getTime() - new Date(a.month).getTime())` |

### Porta Ativa Confirmada: **4000** (lida de `process.env.PORT` via `backend/.env`)

---
## 📋 CONFIGURAÇÃO DE PORTA

### Porta Ativa (Primária)
- **Ambiente:** `PORT=4000`
- **Variável:** `process.env.PORT`
- **URL Backend:** `http://localhost:4000`
- **Configuração:** `backend/.env` e `backend/server.js`

### Fallback
- **Porta:** `3002`
- **Acionada quando:** `process.env.PORT` não definida ou inválida
- **Código:** `const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;`

### Porta Descontinuada
- **Número:** `3001`
- **Status:** ❌ **NÃO USAR**
- **Razão:** Conflito com aplicação externa no ambiente de desenvolvimento
- **Removida de:** `.env`, `.env.example`, hardcoded references

---

## 🔧 CONFIGURAÇÃO TÉCNICA

### Backend (Node.js + Express)

**Arquivo Principal:** `backend/server.js` (L15)
```javascript
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;
```

**Variável de Ambiente:** `backend/.env`
```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Log de Startup:** Linha 176–184
```
✅ Porta ativa: 4000
🔗 URL: http://localhost:4000
Env: development
PID: [processo ID]
Health: /api/health
Config: PORT=4000 (variável do ambiente)
```

### Frontend (Next.js + React)

**Script de Dev:** `frontend/package.json`
```json
"dev": "next dev -p 3000"
```

**URLs de API:** Cliente fetch em `app/page.tsx` e `hooks/use-posts.ts`
```
http://localhost:4000/api/posts
http://localhost:4000/api/user/bio
http://localhost:4000/api/user/topics
```

---

## 🧪 VERIFICAÇÃO DE CONECTIVIDADE

### Health Check
```bash
curl http://localhost:4000/api/health
```

### Endpoints Ativos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Status do servidor |
| GET | `/api/posts` | Listar posts do usuário |
| POST | `/api/posts` | Criar novo post |
| DELETE | `/api/posts/:id` | Deletar post |
| GET | `/api/user/bio` | Obter bio do usuário |
| PUT | `/api/user/bio` | Atualizar bio |
| GET | `/api/user/topics` | Listar tópicos do usuário |

---

## 🚀 INICIALIZAÇÃO

### Development
```bash
# Terminal 1: Frontend
cd d:\Projetos de Site\ChronoPrivative
npm run dev
# Executa em http://localhost:3000

# Terminal 2: Backend
cd d:\Projetos de Site\ChronoPrivative\backend
npm run dev
# Executa em http://localhost:4000
# Lê PORT de .env = 4000
```

### Diagnóstico
1. ✅ Frontend iniciado em porta 3000
2. ✅ Backend detecta `PORT=4000` do `.env`
3. ✅ Backend inicia listener em porta 4000
4. ✅ Log exibe `✅ Porta ativa: 4000`
5. ✅ CORS de frontend (3000) aceito no backend

---

## 📊 HISTÓRICO DE CONFIGURAÇÃO

| Data | Evento | Porta | Status |
|------|--------|-------|--------|
| Sessão Anterior | Inicial | 3001 | ❌ Conflito |
| Sessão Anterior | Atualização | 4000 (hardcoded) | ⚠️ Sem env var |
| **Hoje (4/3/26)** | **Estabilização** | **4000 (via PORT=4000)** | **✅ Estável** |

---

## 🔐 Variáveis de Ambiente Críticas

```env
# Porta (obrigatória para production)
PORT=4000

# Segurança
JWT_SECRET=<gerado-em-producao>
ADMIN_PASSWORD=<gerado-em-producao>

# Banco de Dados
DATABASE_URL=postgresql://user:password@host:5432/chronoprivative_db

# CORS
CORS_ORIGIN=http://localhost:3000  (desenvolvimento)
NODE_ENV=development
```

---

## 📝 Notas

- **Retry automático:** Se porta 4000 estiver em uso, backend tenta 3002 (fallback)
- **Graceful shutdown:** Encerra conexões BD e HTTP server em ~10s max
- **Logging:** Morgan para HTTP em development, structured em production
- **Sem hardcoding:** Porta NUNCA hardcoded no código — sempre via `process.env.PORT`

---

**Mantido por:** Backend Engineering Team  
**Próxima revisão:** Quando nova configuração de infraestrutura for necessária
