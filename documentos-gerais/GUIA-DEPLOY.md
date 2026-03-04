# GUIA DE DEPLOY — ChronoPrivative
> Última atualização: 04/03/2026

---

## Checklist Pré-Deploy

Execute cada item antes de qualquer deploy para produção:

- [ ] `npm run build` na raiz — confirmar `✓ Compiled successfully`
- [ ] Todas as variáveis de ambiente de produção definidas (ver seção abaixo)
- [ ] `npm run migrate` executado no banco de produção
- [ ] Hash bcrypt do admin definido via `node scripts/update-admin-hash.js` (ou `npm run seed`)
- [ ] `JWT_SECRET` produção diferente do desenvolvimento
- [ ] `CORS_ORIGIN` apontando para o domínio real do frontend
- [ ] `NODE_ENV=production` no backend
- [ ] Logs habilitados e diretório `backend/logs/` existente
- [ ] Testar `GET /api/health` na API de produção antes de publicar o frontend

---

## Variáveis de Ambiente em Produção

### Frontend (Vercel / Netlify / qualquer plataforma)

| Variável                | Valor de produção                     | Obrigatório |
|-------------------------|---------------------------------------|-------------|
| `NEXT_PUBLIC_API_URL`   | `https://sua-api.railway.app`         | ✅          |

> Prefixo `NEXT_PUBLIC_` é obrigatório para expor a variável ao browser no Next.js.

---

### Backend (Railway / Render / VPS)

| Variável        | Valor de produção                                         | Obrigatório |
|-----------------|-----------------------------------------------------------|-------------|
| `DATABASE_URL`  | `postgresql://user:pass@host:5432/chronoprivative_db`     | ✅          |
| `JWT_SECRET`    | String aleatória longa (mínimo 64 chars)                  | ✅          |
| `ADMIN_PASSWORD`| Senha real do admin (bcrypt aplicado via `npm run seed`)  | ✅          |
| `PORT`          | Geralmente definido pela plataforma (Railway auto-define) | ✅          |
| `NODE_ENV`      | `production`                                              | ✅          |
| `CORS_ORIGIN`   | `https://seu-frontend.vercel.app`                         | ✅          |

> **⚠️ Jamais reutilize o `JWT_SECRET` de desenvolvimento em produção.**

---

## Deploy do Frontend (Vercel — recomendado)

### Passo a passo

**1. Instalar Vercel CLI (opcional):**
```bash
npm install -g vercel
```

**2. Login na Vercel:**
```bash
vercel login
```

**3. Deploy a partir da raiz do projeto:**
```bash
cd "d:\Projetos de Site\ChronoPrivative"
vercel --prod
```

Ou conectar via painel Vercel em https://vercel.com/new:
- Importar repositório Git
- Selecionar framework: **Next.js**
- Root directory: `.` (raiz)
- Build command: `npm run build`
- Output directory: `.next` (automático)

**4. Configurar variável de ambiente no painel Vercel:**
```
NEXT_PUBLIC_API_URL = https://sua-api.railway.app
```

> ⚠️ `output: 'standalone'` em `next.config.ts` pode causar comportamento diferente no deploy Vercel. Se o deploy falhar, remover ou comentar essa linha.

### Verificar deploy

```bash
curl https://seu-projeto.vercel.app/
# Deve retornar HTML com CSS carregado
```

---

## Deploy do Frontend (Netlify — alternativa)

**1. Build:**
```bash
npm run build
```

**2. Configurar `netlify.toml` na raiz:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**3. Variável de ambiente:**
No painel Netlify → Site settings → Environment variables:
```
NEXT_PUBLIC_API_URL = https://sua-api.railway.app
```

---

## Deploy do Backend (Railway — recomendado)

### Passo a passo

**1. Criar conta em https://railway.app**

**2. Novo projeto → "Deploy from GitHub Repo"**
- Selecionar o repositório
- **Root directory:** `backend`

**3. Railway detecta Node.js automaticamente.**
   - Start command: `npm start` (usa `node server.js`)
   - Build command: `npm install`

**4. Configurar variáveis de ambiente no painel Railway:**
```
DATABASE_URL   = postgresql://...  (gerado pelo Railway PostgreSQL)
JWT_SECRET     = <string_aleatoria_64_chars>
ADMIN_PASSWORD = <senha_do_admin>
NODE_ENV       = production
CORS_ORIGIN    = https://seu-frontend.vercel.app
```

> A variável `PORT` é **injetada automaticamente** pelo Railway — não definir manualmente.

**5. Adicionar PostgreSQL ao mesmo projeto:**
- New Service → Database → PostgreSQL
- Railway gera `DATABASE_URL` automaticamente
- Conectar ao backend via "Reference Variable": `${{Postgres.DATABASE_URL}}`

**6. Executar migrations após primeiro deploy:**
```bash
# Via Railway CLI:
railway run npm run migrate

# Via painel Railway → Deploy → Custom command:
node scripts/migrate.js
```

**7. Popular banco:**
```bash
railway run npm run seed
railway run node scripts/update-admin-hash.js
```

### Verificar deploy

```bash
curl https://sua-api.railway.app/api/health
# Deve retornar: { "status": "healthy", ... }
```

---

## Deploy do Backend (Render — alternativa)

**1. Criar conta em https://render.com**

**2. New Web Service → Connect GitHub**
- Root directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: `Node`

**3. Configurar Environment Variables no painel.**

**4. Adicionar PostgreSQL:**
- New → PostgreSQL
- Copiar `Internal Database URL` para `DATABASE_URL` no backend service.

---

## Deploy do Banco (Supabase — alternativa standalone)

Se não quiser usar o PostgreSQL integrado ao Railway/Render:

**1. Criar projeto em https://supabase.com**

**2. Obter connection string:**
- Project Settings → Database → Connection String → URI mode

**3. Executar migrations remotamente:**
```bash
# Substituir DATABASE_URL pela connection string do Supabase
DATABASE_URL="postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres" node scripts/migrate.js
```

**4. Definir `DATABASE_URL` no backend de produção.**

---

## Deploy com PM2 (VPS / servidor próprio)

Para deploy em servidor Linux com Node.js instalado:

**1. Fazer upload do código (ex: Git clone):**
```bash
git clone https://github.com/seu-usuario/chronoprivative.git
cd chronoprivative/backend
npm install --production
```

**2. Configurar `.env` de produção:**
```env
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/chronoprivative_db
JWT_SECRET=<chave_segura>
ADMIN_PASSWORD=<senha_admin>
NODE_ENV=production
CORS_ORIGIN=https://seu-frontend.com
```

> ⚠️ `ecosystem.config.js` usa `PORT: 3001` como default no `env` — sobrescrever com `.env` ou editar o arquivo.

**3. Executar migrations e seed:**
```bash
npm run migrate
npm run seed
```

**4. Iniciar via PM2:**
```bash
npm run prod
# Equivalente a: pm2 start ecosystem.config.js --env production
```

**5. Comandos PM2 úteis:**
```bash
npm run prod:logs     # acompanhar logs em tempo real
npm run prod:monit    # monitor interativo
npm run prod:restart  # reiniciar
npm run prod:stop     # parar
```

---

## Verificar se o Deploy foi Bem-Sucedido

### Checklist pós-deploy

1. **Backend health check:**
   ```bash
   curl https://sua-api.railway.app/api/health
   ```
   Esperado: `{ "status": "healthy", "database": "connected" }`

2. **Login API:**
   ```bash
   curl -X POST https://sua-api.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"<sua_senha>"}'
   ```
   Esperado: `{ "message": "ACCESS_GRANTED", "token": "eyJ..." }`

3. **Listagem de posts:**
   ```bash
   curl https://sua-api.railway.app/api/posts
   ```
   Esperado: `{ "posts": [...], "pagination": {...} }`

4. **Frontend carrega com CSS:**
   - Abrir URL do frontend no browser
   - Verificar que a tela de boot aparece estilizada (fundo preto, texto verde/branco, fonte Space Mono)
   - DevTools → Network → verificar que arquivo `.css` retorna HTTP 200

5. **Fluxo completo:**
   - Fazer login com senha admin
   - Verificar que posts carregam no feed
   - Verificar sidebar (Topics, Archives)

---

## Notas Importantes de Produção

- O token JWT no frontend é armazenado em `localStorage`. Em produção pública, considerar migrar para `httpOnly Cookie`. Para uso pessoal, localStorage é aceitável.
- Blacklist de tokens JWT está em **memória do processo** — reiniciar o backend invalida a blacklist. Tokens logados-out antes do restart voltam a ser válidos.
- A senha `"juan"` é aceita localmente pelo `LoginScreen` mas **não existe** no banco — o JWT não será emitido para essa senha. Apenas `"admin"` funciona end-to-end.
- Para detalhes de arquitetura e variáveis: ver [ARQUITETURA.md](./ARQUITETURA.md)
