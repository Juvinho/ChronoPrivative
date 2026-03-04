# Índice de Documentação — ChronoPrivative
> Gerado em: 04/03/2026

Suíte completa de documentação oficial do projeto, organizada em camadas: operacional, técnica, de qualidade e de referência.

---

## Documentos

| # | Arquivo | Conteúdo | Status |
|---|---------|----------|--------|
| 1 | [README.md](./README.md) | Ponto de entrada do projeto: descrição, stack, setup completo, scripts e status atual | ✅ |
| 2 | [BANCO-DE-DADOS.md](./BANCO-DE-DADOS.md) | Diagrama ER, schema das 8 tabelas, índices, instruções de migration e seed | ✅ |
| 3 | [API.md](./API.md) | Todas as 20 rotas REST, autenticação JWT, exemplos completos de request/response, códigos de erro | ✅ |
| 4 | [COMPONENTES.md](./COMPONENTES.md) | 19 componentes React documentados com props, estado e dependências; 8 hooks customizados | ✅ |
| 5 | [ARQUITETURA.md](./ARQUITETURA.md) | Diagrama de 3 camadas, 4 fluxos end-to-end, estrutura de pastas, 6 ADRs | ✅ |
| 6 | [BUGS-E-DECISOES.md](./BUGS-E-DECISOES.md) | 7 bugs com causa raiz e solução; 5 decisões técnicas imutáveis | ✅ |
| 7 | [GUIA-DEPLOY.md](./GUIA-DEPLOY.md) | Deploy em Vercel, Netlify, Railway, Render, PM2+VPS; checklist e variáveis de produção | ✅ |
| 8 | [GLOSSARIO.md](./GLOSSARIO.md) | Termos técnicos A–W, abreviações, convenções de nomenclatura do projeto | ✅ |

---

## Mapa de Responsabilidade

```
Quero entender...                  → Consultar
─────────────────────────────────────────────────────────
Como subir o projeto               → README.md
O schema do banco                  → BANCO-DE-DADOS.md
Uma rota específica da API         → API.md
Um componente específico           → COMPONENTES.md
Como o sistema funciona            → ARQUITETURA.md
Por que algo funciona assim        → ARQUITETURA.md (ADRs) + BUGS-E-DECISOES.md
Um bug que já aconteceu            → BUGS-E-DECISOES.md
Como fazer deploy                  → GUIA-DEPLOY.md
O significado de um termo          → GLOSSARIO.md
```

---

## Notas de Geração

- Todos os documentos foram gerados a partir do código-fonte real do projeto.
- Nenhuma informação foi inventada ou estimada.
- Idioma: Português Brasileiro (pt-BR).
- Qualquer alteração no projeto deve refletir nos documentos correspondentes.
