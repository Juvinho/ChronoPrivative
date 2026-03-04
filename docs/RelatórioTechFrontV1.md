# RELATÓRIO TECH FRONT V1
**Data:** 04 de março de 2026  
**Origem:** QA Report — RELATORIO-QA-ACHADOS-CRITICOS.md  
**Responsável:** Tech Lead Frontend  
**Arquivo alvo principal:** `app/page.tsx`

---

## Contexto de Código

Antes de executar qualquer tarefa, leia isso:

- O token JWT já tem padrão estabelecido no arquivo: `localStorage.getItem('auth_token')` usado nas linhas **287**, **329** e **366** de `app/page.tsx`.
- O `LoginScreen` atual (linha **482**) chama apenas `setIsAuthenticated(true)` no callback `onUnlock` — **nenhum token é gravado em localStorage**.
- Os três widgets da sidebar (`About Me`, `Topics`, `Archives`) existem como **JSX inline nas linhas 1178–1227** e precisam ser substituídos pelos componentes já implementados.
- Os componentes `AboutWidget`, `TopicsWidget` e `ArchivesWidget` estão em `components/` com `export default`.

---

## TAREFA 1 — Imports em `app/page.tsx`

**Arquivo:** `app/page.tsx`  
**Localização:** Bloco de imports, após a linha 15 (`import { usePosts, type Post } from "@/hooks/use-posts";`)

**Adicionar:**
```tsx
import AboutWidget from "@/components/AboutWidget";
import TopicsWidget from "@/components/TopicsWidget";
import ArchivesWidget from "@/components/ArchivesWidget";
```

Não alterar nenhum import existente.

---

## TAREFA 2 — Estado `authToken` e `userBio` em `app/page.tsx`

**Arquivo:** `app/page.tsx`  
**Localização:** Bloco de estados, após a linha **31** (`const [isAuthenticated, setIsAuthenticated] = useState(false);`)

**Adicionar:**
```tsx
const [authToken, setAuthToken] = useState<string | null>(null);
const [userBio, setUserBio] = useState<string>("");
```

---

## TAREFA 3 — Capturar token no `onUnlock` em `app/page.tsx`

**Arquivo:** `app/page.tsx`  
**Localização:** Linha **482**

**Antes:**
```tsx
  if (!isAuthenticated) {
    return <LoginScreen onUnlock={() => setIsAuthenticated(true)} />;
  }
```

**Depois:**
```tsx
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onUnlock={() => {
          setIsAuthenticated(true);
          setAuthToken(localStorage.getItem('auth_token'));
        }}
      />
    );
  }
```

**Observação crítica:** O `LoginScreen` atual (`components/login-screen.tsx`, linha **48**) chama `onUnlock()` após match de senha, mas **nunca executa `localStorage.setItem('auth_token', ...)`**. Enquanto o sistema não tiver endpoint real de autenticação, o `setAuthToken` receberá `null`. A consequência direta: `AboutWidget` exibirá erro `"Token de autenticação não disponível"` ao tentar salvar. Isso é comportamento esperado até que o fluxo de auth real seja implementado.

**Se quiser simular token para desenvolvimento:**  
Em `components/login-screen.tsx`, na linha **48**, antes de chamar `onUnlock()`, adicionar temporariamente:
```tsx
localStorage.setItem('auth_token', 'dev-mock-token');
```
Remover este mock quando a integração real de auth estiver pronta.

---

## TAREFA 4 — Substituir widget inline "About Me" na sidebar

**Arquivo:** `app/page.tsx`  
**Localização:** Linhas **1178–1188** — bloco `{/* About Widget */}`

**Remover:**
```tsx
          {/* About Widget */}
          <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] p-5 rounded-sm">
            <h3 className="font-bold text-[var(--theme-text-light)] mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[var(--theme-primary)]" />
              About Me
            </h3>
            <p className="text-sm text-[var(--theme-text-secondary)] leading-relaxed">
              Welcome to my personal diary. This is where I document my life, thoughts, and daily experiences in a retro-styled digital space.
            </p>
          </div>
```

**Substituir por:**
```tsx
          {/* About Widget */}
          <AboutWidget
            bio={userBio}
            token={authToken ?? undefined}
            onBioUpdate={setUserBio}
          />
```

`token={authToken ?? undefined}` — necessário porque a prop é `token?: string` (não aceita `null`).

---

## TAREFA 5 — Substituir widget inline "Tags Widget" (Topics) na sidebar

**Arquivo:** `app/page.tsx`  
**Localização:** Linhas **1190–1207** — bloco `{/* Tags Widget */}`

**Remover:**
```tsx
          {/* Tags Widget */}
          <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] p-5 rounded-sm">
            <h3 className="font-bold text-[var(--theme-text-light)] mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--theme-primary)]" />
              Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {["LIFE", "THOUGHTS", "TRAVEL", "MUSIC", "RANDOM"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] px-2 py-1 rounded text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)] cursor-pointer transition-colors"
                >
                  ${tag}
                </span>
              ))}
            </div>
          </div>
```

**Substituir por:**
```tsx
          {/* Topics Widget */}
          <TopicsWidget />
```

O componente gerencia estado e fetch internamente. Nenhuma prop obrigatória. Se futuramente precisar de filtro por tópico, passar `onTopicSelect={(slug) => handleTopicFilter(slug)}`.

---

## TAREFA 6 — Substituir widget inline "Archives Widget" na sidebar

**Arquivo:** `app/page.tsx`  
**Localização:** Linhas **1209–1227** — bloco `{/* Archives Widget */}`

**Remover:**
```tsx
          {/* Archives Widget */}
          <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] p-5 rounded-sm">
            <h3 className="font-bold text-[var(--theme-text-light)] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--theme-primary)]" />
              Archives
            </h3>
            <ul className="space-y-2 text-sm">
              {["October 2023", "September 2023", "August 2023"].map(
                (month) => (
                  <li key={month}>
                    <button className="w-full flex items-center justify-between text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors group">
                      <span>{month}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                ),
              )}
            </ul>
          </div>
```

**Substituir por:**
```tsx
          {/* Archives Widget */}
          <ArchivesWidget />
```

O componente usa `DEFAULT_ARCHIVES` internamente como fallback. A prop `archives` e `onArchiveSelect` são opcionais — deixar sem props por enquanto até que o endpoint de posts retorne datas.

---

## TAREFA 7 — Remover imports de ícones não utilizados após as substituições

**Arquivo:** `app/page.tsx`  
**Localização:** Linha **3**

Após completar as tarefas 4, 5 e 6, os ícones `Terminal`, `Lock` e `Clock` que eram usados nos widgets inline precisam ser verificados. Se não houver outro uso deles no arquivo além dos widgets removidos, removê-los do import do `lucide-react`.

**Verificação antes de remover:**
- `Terminal` — ainda usado no header (linha ~490) e em outros pontos. **Manter.**
- `Lock` — usado no footer e em outros pontos. **Manter.**
- `Clock` — verificar se há outros usos além do widget removido. **Remover se não houver.**

---

## TAREFA 8 — Verificar `npm run build` sem erros

Após aplicar as tarefas 1–7, executar:

```bash
cd "d:\Projetos de Site\ChronoPrivative"
npm run build 2>&1
```

**Erros esperados que já existem (não introduzidos por estas mudanças):**
- O build atual falha (Exit Code 1 nos terminais). Identificar se o erro pré-existe ou foi introduzido.

**O que verificar no output do build:**
1. Erros de TypeScript em `AboutWidget` — a prop `token` é `string | undefined`, não aceita `string | null`. A conversão `authToken ?? undefined` na Tarefa 4 resolve isso.
2. Warning de `Clock` não utilizado caso seja removido — não é erro, não bloqueia build.
3. Qualquer erro em `BioEditModal` não é responsabilidade desta tarefa (componente não é importado diretamente em `page.tsx` — é montado dentro de `AboutWidget`).

---

## Resultado Esperado da Sidebar Após Implementação

```
aside.w-80
├── [botão NEW DIARY ENTRY]       ← não muda
├── <AboutWidget>                  ← Tarefa 4
│   ├── header "About Me" + botão EDITAR (hover)
│   ├── texto da bio (state userBio)
│   └── <BioEditModal> (montado internamente)
├── <TopicsWidget>                 ← Tarefa 5
│   ├── header "Topics"
│   └── tags dinâmicas via GET /api/user/topics (fallback: 5 estáticos)
└── <ArchivesWidget>               ← Tarefa 6
    ├── header "Archives"
    └── meses agrupados por ano com collapse ≥ 5
```

---

## Ordem de Execução

| # | Tarefa | Arquivo | Bloqueante |
|---|--------|---------|-----------|
| 1 | Adicionar 3 imports | `app/page.tsx` linha 15 | Sim — tarefas 4/5/6 dependem disso |
| 2 | Adicionar estados `authToken` e `userBio` | `app/page.tsx` linha 31 | Sim — tarefa 4 depende disso |
| 3 | Atualizar `onUnlock` | `app/page.tsx` linha 482 | Sim — AboutWidget usa `token` |
| 4 | Substituir About Me inline | `app/page.tsx` linha 1178 | Não bloqueante para 5 e 6 |
| 5 | Substituir Tags Widget inline | `app/page.tsx` linha 1190 | Não |
| 6 | Substituir Archives Widget inline | `app/page.tsx` linha 1209 | Não |
| 7 | Auditar imports de ícones | `app/page.tsx` linha 3 | Não |
| 8 | Rodar `npm run build` | — | Validação final |

---

## O Que Este Relatório NÃO Cobre

- Implementação de autenticação real via API (endpoint `/api/auth/login` + JWT)
- Integração de `onArchiveSelect` com filtro de posts (posts filtrados por data, fora de escopo aqui)
- Integração de `onTopicSelect` com filtro de posts
- Testes automatizados dos componentes
