# COMPONENTES — ChronoPrivative
> Última atualização: 04/03/2026

---

## Visão Geral

O frontend usa **Next.js 15 App Router** com componentes React em TypeScript. Todos os componentes são `'use client'` (renderizados no browser), exceto `app/layout.tsx` que é Server Component.

**Diretórios:**
- `app/` — rotas Next.js (layout, page)
- `components/` — componentes reutilizáveis
- `hooks/` — hooks customizados
- `lib/` — utilitários

---

## Sumário de Componentes

| Componente           | Arquivo                            | Consome API           | Estado Local | Descrição resumida                     |
|----------------------|------------------------------------|-----------------------|--------------|----------------------------------------|
| `LoginScreen`        | `login-screen.tsx`                 | `POST /api/auth/login`| ✅ sim       | Tela de boot + autenticação            |
| `AboutWidget`        | `AboutWidget.tsx`                  | `PUT /api/user/bio`   | ✅ sim       | Bio do autor no sidebar                |
| `TopicsWidget`       | `TopicsWidget.tsx`                 | `GET /api/user/topics`| ✅ sim       | Lista de tópicos no sidebar            |
| `ArchivesWidget`     | `ArchivesWidget.tsx`               | `GET /api/posts/archives` | ✅ sim  | Arquivo mensal de posts no sidebar     |
| `EditPostModal`      | `EditPostModal.tsx`                | ❌ (via props)        | ✅ sim       | Modal de edição de post                |
| `BioEditModal`       | `BioEditModal.tsx`                 | ❌ (via props)        | ✅ sim       | Modal de edição da bio                 |
| `SearchPanel`        | `SearchPanel.tsx`                  | ❌ (via props)        | ✅ sim       | Painel de busca com filtros avançados  |
| `MiniCalendar`       | `MiniCalendar.tsx`                 | ❌ (via props)        | ✅ sim       | Calendário mensal com posts marcados   |
| `MoodHeatmap`        | `MoodHeatmap.tsx`                  | ❌ (via props)        | ❌ memos    | Heatmap de humor dos posts             |
| `TimelineView`       | `TimelineView.tsx`                 | ❌ (via props)        | ✅ sim       | Posts agrupados cronologicamente       |
| `ImageGallery`       | `ImageGallery.tsx`                 | ❌ (via props)        | ✅ sim       | Galeria de imagens dos posts           |
| `SerendipityModal`   | `SerendipityModal.tsx`             | ❌ (via props)        | ✅ sim       | Modal de post aleatório                |
| `KeyboardShortcutsModal` | `KeyboardShortcutsModal.tsx`  | ❌                    | ❌           | Modal de atalhos de teclado            |
| `DarkModeToggle`     | `DarkModeToggle.tsx`               | ❌                    | ✅ sim       | Toggle de tema claro/escuro            |
| `TypewriterText`     | `typewriter-text.tsx`              | ❌                    | ✅ sim       | Texto com efeito máquina de escrever   |
| `HighlightText`      | `highlight-text.tsx`               | ❌                    | ❌           | Realça termos de busca no texto        |
| `RetroImagePlaceholder` | `retro-image-placeholder.tsx`  | ❌                    | ❌           | Placeholder retro para imagens         |
| `TerminalInput`      | `terminal-input.tsx`               | ❌                    | ❌           | Campo de input com estilo terminal     |
| `TerminalTextarea`   | `terminal-textarea.tsx`            | ❌                    | ❌           | Textarea com estilo terminal           |

---

## Detalhamento por Componente

---

### `LoginScreen`
**Arquivo:** `components/login-screen.tsx`  
**Props:**
| Prop       | Tipo           | Obrigatório | Descrição                                |
|------------|----------------|-------------|------------------------------------------|
| `onUnlock` | `() => void`   | ✅          | Callback chamado ao desbloquear o app    |

**Comportamento:**
- Exibe sequência de boot animada (6 linhas com intervalo de 400ms)
- Aceita as senhas `"admin"` ou `"juan"` localmente (sem validação backend)
- Após senha correta: chama `POST /api/auth/login` em background → armazena JWT em `localStorage.setItem('auth_token', token)`
- O unlock do UI é independente do resultado da chamada backend (best-effort)

**Estado local:** `password`, `error`, `bootSequence[]`, `showInput`, `accessGranted`  
**Dependências externas:** `NEXT_PUBLIC_API_URL`

---

### `AboutWidget`
**Arquivo:** `components/AboutWidget.tsx`  
**Props:**
| Prop         | Tipo                        | Obrigatório | Descrição                              |
|--------------|-----------------------------|-------------|----------------------------------------|
| `bio`        | `string`                    | ❌          | Bio inicial (default: texto padrão)    |
| `token`      | `string`                    | ❌          | JWT para autorizar edição da bio       |
| `onBioUpdate`| `(newBio: string) => void`  | ❌          | Callback após bio salva com sucesso    |

**Consome API:** `PUT /api/user/bio` — requer `Authorization: Bearer <token>`  
**Estado local:** `isEditModalOpen`, `currentBio`, `isSaving`, `error`

> ⚠️ A chamada à API usa URL relativa (`/api/user/bio`) em vez de `${NEXT_PUBLIC_API_URL}`. Em produção, o frontend deve estar no mesmo domínio ou a URL deve ser ajustada. [ TODO: unificar com NEXT_PUBLIC_API_URL ]

---

### `TopicsWidget`
**Arquivo:** `components/TopicsWidget.tsx`  
**Props:**
| Prop            | Tipo                         | Obrigatório | Descrição                              |
|-----------------|------------------------------|-------------|----------------------------------------|
| `topics`        | `Topic[]`                    | ❌          | Tópicos injetados (bypass do fetch)    |
| `onTopicSelect` | `(topic: string) => void`    | ❌          | Callback ao clicar em um tópico        |

**Consome API:** `GET /api/user/topics` (auto-fetch se `topics` prop não fornecida)  
**Fallback:** `DEFAULT_TOPICS` (5 tópicos com `count: 0`) caso a API falhe  
**Estado local:** `topics[]`, `loading`, `error`

---

### `ArchivesWidget`
**Arquivo:** `components/ArchivesWidget.tsx`  
**Props:**
| Prop              | Tipo                          | Obrigatório | Descrição                             |
|-------------------|-------------------------------|-------------|---------------------------------------|
| `archives`        | `ArchiveEntry[]`              | ❌          | Dados injetados (bypass do fetch)     |
| `onArchiveSelect` | `(archive: string) => void`   | ❌          | Callback ao clicar em um mês          |

**Consome API:** `GET /api/posts/archives` (auto-fetch se `archives` prop não fornecida)  
**Estrutura interna:**
```ts
interface ArchiveEntry { month: string; total: number; }
interface ArchiveGroup { year: string; months: { label: string; isoDate: string }[]; shouldCollapse: boolean; }
```
**Ordenação:** sort por `new Date(isoDate).getTime()` decrescente (mais recente primeiro)  
**Estado local:** `archives[]`, `loading`

---

### `EditPostModal`
**Arquivo:** `components/EditPostModal.tsx`  
**Props:**
| Prop     | Tipo                           | Obrigatório | Descrição                         |
|----------|--------------------------------|-------------|-----------------------------------|
| `post`   | `{ id, title, content, mood?, weather?, musicPlaying?, tags[] }` | ✅ | Post a editar |
| `isOpen` | `boolean`                      | ✅          | Controla visibilidade do modal    |
| `onClose`| `() => void`                   | ✅          | Callback para fechar              |
| `onSave` | `(updatedPost: any) => Promise<void>` | ✅   | Callback para salvar              |

**Não chama a API diretamente** — o salvamento é delegado ao `onSave` do `page.tsx`  
**Estado local:** `formData`, `isLoading`, `error`, `isDirty`, `newTag`

---

### `SearchPanel`
**Arquivo:** `components/SearchPanel.tsx`  
**Props:**
| Prop               | Tipo                                  | Obrigatório | Descrição                          |
|--------------------|---------------------------------------|-------------|------------------------------------|
| `onSearch`         | `(filters: SearchFilters) => Promise<void>` | ✅   | Callback ao executar busca         |
| `availableTags`    | `string[]`                            | ✅          | Tags disponíveis para filtro       |
| `availableMoods`   | `string[]`                            | ✅          | Moods disponíveis para filtro      |
| `availableWeather` | `string[]`                            | ✅          | Condições climáticas para filtro   |
| `isLoading`        | `boolean`                             | ❌          | Estado de carregamento externo     |

**Não chama a API diretamente** — o `onSearch` é implementado em `page.tsx`  
**Estado local:** `filters` (query, tags, moods, weather, dateFrom, dateTo)

---

### `MiniCalendar`
**Arquivo:** `components/MiniCalendar.tsx`  
**Props:**
| Prop           | Tipo                                     | Obrigatório | Descrição                         |
|----------------|------------------------------------------|-------------|-----------------------------------|
| `posts`        | `Array<{ id: string; createdAt: string }>`| ✅         | Posts para marcar no calendário   |
| `onDateSelect` | `(date: Date) => void`                   | ✅          | Callback ao selecionar data       |
| `selectedDate` | `Date`                                   | ❌          | Data atualmente selecionada       |

**Memoização:** `postsByDate` via `useMemo` — mapa de datas → contagem de posts  
**Estado local:** `displayDate` (mês/ano exibido na navegação)

---

### `MoodHeatmap`
**Arquivo:** `components/MoodHeatmap.tsx`  
**Props:**
| Prop    | Tipo                                                  | Obrigatório | Descrição               |
|---------|-------------------------------------------------------|-------------|-------------------------|
| `posts` | `Array<{ id: string; createdAt: string; mood?: string }>` | ✅    | Posts com dados de humor|

**Puramente calculado via `useMemo`** — sem estado, sem chamadas de API  
**Renders:** estatísticas por tipo de humor + heatmap mensal por humor

---

### `TimelineView`
**Arquivo:** `components/TimelineView.tsx`  
**Props:**
| Prop            | Tipo                              | Obrigatório | Descrição                              |
|-----------------|-----------------------------------|-------------|----------------------------------------|
| `posts`         | `TimelinePost[]`                  | ✅          | Posts para exibir na timeline          |
| `onLoadMore`    | `() => Promise<void>`             | ✅          | Callback de paginação (mais posts)     |
| `isLoadingMore` | `boolean`                         | ❌          | Indica carregamento de mais posts      |
| `hasMore`       | `boolean`                         | ❌          | Se há mais posts para carregar         |
| `onPostSelect`  | `(post: TimelinePost) => void`    | ✅          | Callback ao selecionar um post         |

**Estado local:** `groupedPosts` (Map mês→posts), `expandedMonths` (Set)

---

### `TypewriterText`
**Arquivo:** `components/typewriter-text.tsx`  
**Props:**
| Prop      | Tipo      | Obrigatório | Descrição                                     |
|-----------|-----------|-------------|-----------------------------------------------|
| `text`    | `string`  | ✅          | Texto a ser animado                           |
| `speed`   | `number`  | ❌          | Velocidade em ms por caractere (padrão: 50ms) |
| `onDone`  | `() => void` | ❌       | Callback ao concluir a animação               |

---

### `HighlightText`
**Arquivo:** `components/highlight-text.tsx`  
**Props:**
| Prop      | Tipo     | Obrigatório | Descrição                                    |
|-----------|----------|-------------|----------------------------------------------|
| `text`    | `string` | ✅          | Texto completo                               |
| `highlight`| `string`| ✅          | Termo de busca a destacar                    |

Sem estado — componente puramente funcional.

---

### `TerminalInput` / `TerminalTextarea`
**Arquivos:** `terminal-input.tsx` / `terminal-textarea.tsx`  
Wrappers estilizados sobre `<input>` e `<textarea>` com visual de terminal cyberpunk. Aceitam todas as props nativas do elemento HTML correspondente.

---

### `RetroImagePlaceholder`
**Arquivo:** `retro-image-placeholder.tsx`  
Exibe um SVG/placeholder animado com estética retro enquanto a imagem real não carrega. Sem props obrigatórias.

---

### `DarkModeToggle`
**Arquivo:** `DarkModeToggle.tsx`  
Alterna classe CSS de tema. Estado local gerenciado por `localStorage` para persistência.

---

### `KeyboardShortcutsModal`
**Arquivo:** `KeyboardShortcutsModal.tsx`  
**Props:** `isOpen: boolean`, `onClose: () => void`  
Modal estático listando atalhos do teclado. Sem estado interno.

---

### `ImageGallery`
**Arquivo:** `ImageGallery.tsx`  
**Props:** `images: string[]`, `onClose: () => void`  
Galeria lightbox para imagens dos posts. Estado local: índice da imagem ativa.

---

### `SerendipityModal`
**Arquivo:** `SerendipityModal.tsx`  
**Props:** `posts: any[]`, `isOpen: boolean`, `onClose: () => void`, `onSelectPost: (post) => void`  
Seleciona um post aleatório da lista e o exibe em modal. Estado local: post selecionado.

---

## Hooks Customizados

| Hook                       | Arquivo                         | Consome API                | Descrição                               |
|----------------------------|---------------------------------|----------------------------|-----------------------------------------|
| `usePosts`                 | `hooks/use-posts.ts`            | `GET /api/posts`           | Busca lista de posts paginados          |
| `useMobile`                | `hooks/use-mobile.ts`           | ❌                         | Detecta se viewport é mobile            |
| `useSearch`                | `hooks/useSearch.ts`            | `GET /api/posts?search=..`  | Busca posts por query                  |
| `useTimeline`              | `hooks/useTimeline.ts`          | [ TODO: integrar ]         | Dados de timeline agrupados por data    |
| `useMoodAnalytics`         | `hooks/useMoodAnalytics.ts`     | [ TODO: integrar ]         | Estatísticas de humor dos posts         |
| `useRandomPost`            | `hooks/useRandomPost.ts`        | [ TODO: integrar ]         | Retorna post aleatório                  |
| `useImageUpload`           | `hooks/useImageUpload.ts`       | [ TODO: endpoint /upload ] | Upload de imagem para o servidor        |
| `useGlobalKeyboardShortcuts`| `hooks/useGlobalKeyboardShortcuts.ts` | ❌                  | Registra atalhos de teclado globais     |

---

## TODOs de Integração com Backend

| Componente / Hook    | Endpoint necessário          | Status       | Observação                                      |
|----------------------|------------------------------|--------------|------------------------------------------------|
| `AboutWidget`        | `PUT /api/user/bio`          | ⚠️ parcial   | URL relativa — deve usar `NEXT_PUBLIC_API_URL`  |
| `usePosts`           | `GET /api/posts`             | ⚠️ parcial   | URL hardcoded `localhost:4000` — usar env var   |
| `useImageUpload`     | `POST /api/upload`           | ❌ pendente  | Endpoint não implementado no backend            |
| `useTimeline`        | `GET /api/posts` (paginado)  | ❌ pendente  | Hook usa dados mock locais                      |
| `useMoodAnalytics`   | `GET /api/posts`             | ❌ pendente  | Depende de campo `mood` no schema de posts      |
| `useRandomPost`      | `GET /api/posts/random`      | ❌ pendente  | Endpoint não existe no backend                  |

---

## Componentes de Exibição de Conteúdo em `app/page.tsx`

O `page.tsx` é o orquestrador principal. Ele:
1. Controla estado global: `isUnlocked`, `posts[]`, `selectedPost`, `isEditing`
2. Busca posts com `usePosts()`
3. Gerencia `handlePublish`, `handleDelete`, `handleUndo` — chamadas diretas à API
4. Renderiza o layout de 3 colunas: sidebar esquerda | feed central | sidebar direita
5. Injeta props nos widgets do sidebar: `<TopicsWidget />`, `<ArchivesWidget />`, `<AboutWidget />`

---

## Estrutura de Dados de Post no Frontend

```typescript
interface PostEntry {
  id: number;
  title: string;
  content: string;
  tag: string;
  created_at: string;
  updated_at?: string;
  slug?: string;
  views_count?: number;
  reactions_count?: number;
  comments_count?: number;
  metadata?: { mood?: string; weather?: string; listening?: string; };
  imageUrl?: string;
  imageText?: string;
}
```

> Mapeado de `GET /api/posts` — ver [API.md](./API.md) e [BANCO-DE-DADOS.md](./BANCO-DE-DADOS.md).
