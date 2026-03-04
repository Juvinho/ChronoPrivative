# 📖 GUIA DE USO - ChronoPrivative Frontend Integrado

## 🚀 INICIANDO O SISTEMA

### Backend (Porta 3001)
```bash
cd backend
npm run prod
# Aguarde: [PM2] App launched (1 instances) - Status: online
```

### Frontend (Porta 3000)
```bash
npm run dev
# Aguarde: Compiled successfully
# Abra: http://localhost:3000
```

---

## 🔑 LOGIN

**Credenciais de Teste:**
```
Username: admin
Password: suaSenhaEspecificaAqui
```

---

## 📝 CRIAR POST

1. Clique no botão **"+ NEW DIARY ENTRY"** (sidebar direita)
2. Preencha:
   - **ENTRY TITLE:** Seu título
   - **TAG:** Escolha categoria ($LIFE, $THOUGHTS, etc)
   - **MOOD, WEATHER, LISTENING TO:** Opcional 
   - **IMAGE:** Pode fazer drag & drop
3. Clique **"Publish Entry"**
4. Post aparecerá no topo da Timeline ✅

---

## 💾 DADOS NO BANCO

O post é salvo em:
```
PostgreSQL Database: chronoprivative_db
Table: posts
```

Todos dados são **reais**, não fictícios!

---

## 🔄 SINCRONIZAÇÃO

**Automática:**
- ✅ Ao carregar página (useEffect)
- ✅ Após criar post (refresh automático)
- ✅ Após deletar post (refresh automático)

**Manual:**
- 🔄 Clique no ícone **refresh** ao lado de "Timeline"

---

## 🗑️ DELETAR POST

1. Hover sobre o post
2. Clique no ícone **trash** (canto superior direito)
3. Post será deletado (5s para undo)
4. ✅ Deletado do banco de dados também

---

## 🔍 SEARCH & FILTER

- **Search:** Use a barra de search para encontrar por título
- **Filter por Tag:** Clique na tag do post (`$LIFE`, `$THOUGHTS`, etc)
- **Clear:** Use o botão "Clear filters"

---

## ⌨️ ATALHOS DE TECLADO

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

## 📊 METADATA DOS POSTS

Cada post tem dados opcionais:
```
- MOOD: Como você está se sentindo
- WEATHER: Condição do tempo
- LISTENING_TO: Música que estava ouvindo
```

Clique em **"[+] SHOW_METADATA"** para ver os detalhes!

---

## 🖼️ IMAGENS

- **Formatos:** PNG, JPG, GIF
- **Tamanho máx:** 5MB
- **Upload:** Drag & drop ou clique para selecionar
- **Armazenamento:** Convertido para base64

---

## ⚠️ LIMITAÇÕES ATUAIS

❌ Edição de posts existentes  
❌ Upload direto de arquivo para servidor  
❌ Comment viewing no frontend  
❌ Reaction voting no frontend  

*(Todas essas features estão no backend, aguardando frontend)*

---

## 🐛 TROUBLESHOOTING

### "Posts não carregam"
```bash
# 1. Verificar se backend está online:
curl http://localhost:3001/api/health

# 2. Verificar se database existe:
psql -U postgres -d chronoprivative_db

# 3. Reiniciar backend:
cd backend && npm run prod:restart
```

### "Erro ao criar post"
```
Possíveis causas:
- Não autenticado → Login novamente
- Token expirado → Fazer refresh da página
- Backend offline → Checar porta 3001
```

### "Imagem não aparece"
```
- Arquivo > 5MB → Reduza e tente novamente
- Formato inválido → Use PNG, JPG ou GIF
```

---

## 📈 MONITORAMENTO

**Verificar saúde do sistema:**
```bash
# Backend health
curl http://localhost:3001/api/health

# PM2 status
npm run prod:monit

# Logs
npm run prod:logs
```

---

## 🔐 SEGURANÇA

✅ Senhas com bcrypt (12 salt rounds)  
✅ JWT tokens (24h expiration)  
✅ Rate limiting (login: 5/min, geral: 100/15min)  
✅ CORS restrito ao frontend  
✅ Helmet.js headers  

---

## 📞 SUPORTE

**Documentação Técnica:**
- `relatórioFrontv1.md` - Análise detalhada
- `FRONTEND_IMPLEMENTATION_SUMMARY.md` - Resumo
- `FINAL_REPORT.md` - Relatório completo

---

## 🎉 PRONTO!

Sistema totalmente integrado e funcional.  
Aproveite sua jornada no ChronoPrivative! 🚀

---

*Última atualização: 2026-03-04*
