# Perfil de Usuário — Avatar e Username

**Adicionado em:** 06/03/2026  
**Sprint:** Solicitação direta do cliente  
**Arquivos alterados:** 7 arquivos (2 novos componentes, 1 hook, 4 arquivos modificados)

---

## O que foi implementado

Funcionalidade para o usuário editar sua foto de perfil (avatar) e alterar o username, acessíveis pelo botão circular no canto superior direito do header.

---

## Fluxo de uso

1. Usuário clica no botão de perfil no header (mostra avatar ou ícone de usuário).
2. Modal "Edit Profile" abre.
3. Na seção **Foto de Perfil**: clica no círculo ou no botão para escolher uma imagem → preview imediato → botão "Salvar Avatar" confirma o upload.
4. Na seção **Username**: edita o campo e clica em "Salvar" (ou pressiona Enter).
5. Fechar com ESC, clique fora do modal ou botão ×.

---

## Arquivos novos

| Arquivo | Responsabilidade |
|---|---|
| `components/UserProfileModal.tsx` | Modal de edição de perfil (avatar + username) |
| `hooks/useUserProfile.ts` | Fetch, updateUsername e uploadAvatar (lógica de estado) |
| `backend/src/middlewares/upload.js` | Multer: storage em disco, filtro de tipo, limite 2MB |

---

## Arquivos modificados

| Arquivo | Alteração |
|---|---|
| `backend/src/controllers/userController.js` | +`getProfile`, +`updateUsername`, +`uploadAvatarHandler`, +`usernameValidators` |
| `backend/src/routes/users.js` | +`GET /api/user/profile`, +`PATCH /api/user/username`, +`POST /api/user/avatar` |
| `backend/server.js` | `express.static` servindo `backend/uploads/` |
| `app/page.tsx` | Header com avatar dinâmico + integração do `UserProfileModal` |
| `backend/src/db/migrations.sql` | `ALTER TABLE users ADD COLUMN avatar_url TEXT`, `username_updated_at TIMESTAMP` |

---

## Endpoints da API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/user/profile` | Não | Retorna `username` e `avatarUrl` |
| `PATCH` | `/api/user/username` | Sim | Atualiza username (3–30 chars, `[a-zA-Z0-9_]`) |
| `POST` | `/api/user/avatar` | Sim | Upload de imagem (campo `avatar`, multipart) |

---

## Banco de dados

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url          TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username_updated_at TIMESTAMP DEFAULT NOW();
```

Avatares salvos em: `backend/uploads/avatars/avatar_{userId}_{hash}.{ext}`

---

## Restrições

- Imagem: JPG, PNG, GIF, WEBP — máximo **2 MB**
- Username: 3–30 caracteres, somente `[a-zA-Z0-9_]`
- Upload de avatar anterior é deletado do disco ao trocar
- Limpeza do diretório não é automática além do replace
