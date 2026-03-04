# 🔧 RELATÓRIO BACKEND V2.0
## Análise & Planejamento de Implementação - Fase 2: Enriquecimento

**Autor:** Senior Backend Engineer  
**Data:** 03/03/2026  
**Versão:** 2.0 (Planning Phase)  
**Status:** 📋 ANALYSIS → 🛠️ IMPLEMENTATION

---

## 📊 ESTADO ATUAL DO BACKEND (Fase 1)

### ✅ Implementado & Validado
```
Routes:
  ✅ POST /api/auth/login           (JWT 24h, bcrypt verified)
  ✅ POST /api/auth/logout          (token blacklist)
  ✅ GET  /api/posts                (list all, paginated)
  ✅ GET  /api/posts/:slug          (single post)
  ✅ POST /api/posts                (create with metadata + tags)
  ✅ DELETE /api/posts/:id          (soft delete capable)
  ✅ GET  /api/health               (status + metrics)
  ✅ GET  /api/tags                 (with count aggregation)

Database:
  ✅ PostgreSQL 18 with 7 indices
  ✅ 8 tables (users, posts, tags, reactions, comments, etc)
  ✅ Proper relationships + triggers
  ✅ Auto-timestamp columns

Security:
  ✅ Helmet.js headers
  ✅ CORS restricted
  ✅ Rate limiting (5/min login)
  ✅ JWT middleware
  ✅ Graceful shutdown (10s)
```

### ⚠️ Pendências (Para Fase 2)
```
Routes:
  ⏳ PUT  /api/posts/:id            (update post - ESSENCIAL)
  ⏳ POST /api/posts/:id/upload     (image upload - ESSENCIAL)
  ⏳ GET  /api/posts/search         (advanced search - ESSENCIAL)
  ⏳ GET  /api/posts/random         (serendipity - BOM TER)
  ⏳ POST /api/posts/:id/export     (PDF/Markdown - BOM TER)
  ⏳ GET  /api/analytics/mood       (heatmap data - BOM TER)
  ⏳ DELETE /api/posts/:id/image   (cleanup images)

Infrastructure:
  ⏳ Image storage solution (local fs ou S3)
  ⏳ PDF generator library
  ⏳ Query optimization para search
  ⏳ Caching strategy (se necessário)
```

---

## 🎯 ESCOPO FASE 2 - BACKEND ONLY

### Feature 1: POST EDITING (Editação de Posts)
**Prioridade:** CRÍTICA  
**Complexidade:** BAIXA  
**Esforço:** 8 story points

```
Requisito: Usuário poder atualizar conteúdo, tags, metadata de um post já publicado

Endpoint:
  PUT /api/posts/:id
  
Body:
  {
    "title": "Nova título",
    "content": "Novo conteúdo...",
    "mood": "melancoly" | "happy" | "neutral" | "stressed",
    "weather": "rainy" | "sunny" | "cloudy" | "snowy",
    "tags": ["LIFE", "THOUGHTS"],
    "musicPlaying": "Artist - Song"
  }

Response:
  {
    "id": "uuid",
    "title": "Nova título",
    "content": "Novo conteúdo...",
    "updatedAt": "2026-03-03T15:30:00Z",
    "editedAt": "2026-03-03T15:30:00Z"  ← NEW FIELD
  }

Database Changes:
  ✅ Add column: posts.edited_at (nullable)
  ✅ Add column: posts.edit_count (default 0)
  ✅ Update modified_at on each edit

Security:
  ✅ Verify ownership (JWT user == post.user_id)
  ✅ Validate tags exist OR create new ones
  ✅ Check body size (max 10000 chars)

Tests:
  ✅ Authorized edit succeeds
  ✅ Unauthorized edit fails (403 Forbidden)
  ✅ Non-existent post returns 404
  ✅ Invalid mood/weather rejected
  ✅ Tag creation on edit works
```

---

### Feature 2: IMAGE UPLOAD (Upload de Imagens)
**Prioridade:** CRÍTICA  
**Complexidade:** MÉDIA  
**Esforço:** 13 story points

```
Requisito: Usuário upload imagens associadas a posts

Decisions Made:
  • Storage: LOCAL filesystem (/public/uploads) para Fase 2
  • Format: JPG, PNG, WebP (max 5MB each)
  • Limit: 5 imagens por post
  • Resolution: Optimize com sharp (1920px max width)

Endpoints:
  POST /api/posts/:id/upload
  Content-Type: multipart/form-data
  
  File: image (binary)
  Metadata: 
    - title (opcional)
    - description (opcional)
    - order (número 1-5)

Response:
  {
    "id": "image-uuid",
    "postId": "post-uuid",
    "filename": "a1b2c3d4.jpg",
    "url": "/uploads/posts/{postId}/a1b2c3d4.jpg",
    "size": 245000,
    "format": "image/jpeg",
    "createdAt": "2026-03-03T15:30:00Z"
  }

Database Changes:
  ✅ Create table: post_images
    - id (uuid, pk)
    - post_id (fk → posts.id)
    - filename (path)
    - title (nullable)
    - description (nullable)
    - file_size (bytes)
    - mime_type (string)
    - sort_order (int)
    - created_at (timestamp)
    - deleted_at (nullable, soft delete)

  ✅ Create index: (post_id, sort_order)

Libraries Needed:
  • multer: file handling
  • sharp: image optimization
  • uuid: unique filenames

Security:
  ⚠️ CRÍTICO:
    ✅ File type validation (whitelist)
    ✅ File size limit (5MB per file)
    ✅ Filename sanitization (não usar upload original)
    ✅ Store in /public/uploads/{userId}/{postId}/
    ✅ Verify ownership antes de upload
    ✅ Virus scan (optional, Fase 3)
    ✅ Rate limit: 5 uploads/min per user

  Implementation:
    • Multer config: fileFilter + limits
    • Sharp pipeline: resize, format conversion, optimize
    • Database transaction: save metadata atomically

Error Handling:
  ✅ 413: Payload too large
  ✅ 415: Unsupported media type
  ✅ 429: Too many requests (rate limit)
  ✅ 422: Invalid image (corrupt)
  ✅ 503: Storage full

Tests:
  ✅ Upload single image works
  ✅ Upload 5 images (max) succeeds
  ✅ Upload 6th image rejected
  ✅ Wrong format rejected
  ✅ File size > 5MB rejected
  ✅ Delete image removes file + DB record
  ✅ Non-owner cannot upload to post
```

---

### Feature 3: ADVANCED SEARCH (Busca Avançada)
**Prioridade:** CRÍTICA  
**Complexidade:** ALTA  
**Esforço:** 21 story points

```
Requisito: Buscar posts por múltiplos critérios simultaneamente

Endpoint:
  GET /api/posts/search?q=...&tags=...&mood=...&from=...&to=...&sort=...

Query Parameters:
  q (string, opcional): Busca full-text em title + content
  tags (csv, opcional): "LIFE,THOUGHTS" (AND logic)
  mood (string, opcional): "happy" | "neutral" | "melancoly" | "stressed"
  weather (string, opcional): "sunny" | "cloudy" | "rainy" | "snowy"
  dateFrom (date, opcional): "2026-01-01"
  dateTo (date, opcional): "2026-03-03"
  hasImages (boolean, opcional): true | false
  sort (enum, opcional): "recent" | "mood" | "oldest"
  limit (int, default 20, max 100)
  offset (int, default 0)

Response:
  {
    "total": 47,
    "limit": 20,
    "offset": 0,
    "results": [
      {
        "id": "uuid",
        "title": "...",
        "preview": "...",  ← first 200 chars
        "mood": "happy",
        "createdAt": "2026-03-03T15:30:00Z",
        "tags": ["LIFE"],
        "imageCount": 2
      },
      ...
    ]
  }

Database Optimization:
  ✅ Full-text search index on posts(title, content)
  ✅ Composite index: (user_id, created_at DESC)
  ✅ Composite index: (user_id, mood)
  ✅ Composite index: (user_id, deleted_at, created_at)

SQL Query Strategy:
  • Base: WHERE user_id = ? AND deleted_at IS NULL
  • Add: IF q THEN (tsquery full-text)
  • Add: IF tags THEN (JOIN tags, filter by all selected)
  • Add: IF mood THEN (WHERE mood = ?)
  • Add: IF weather THEN (WHERE weather = ?)
  • Add: IF date range THEN (WHERE created_at BETWEEN ? AND ?)
  • Add: IF hasImages THEN (EXISTS join to post_images)
  • ORDER BY (based on sort param)
  • LIMIT + OFFSET

Implementation Detail:
  • Create reusable SearchPostsQuery class
  • Parameterized to prevent SQL injection
  • Test with 1000+ posts for performance

Error Handling:
  ✅ 400: Invalid filter value
  ✅ 400: Invalid date format
  ✅ 400: limit > 100 rejected
  ✅ 422: Conflicting filters

Tests:
  ✅ Search by keyword works
  ✅ Search by tag(s) works
  ✅ Multi-criteria search accurate
  ✅ Date range filter works
  ✅ Sort options work
  ✅ Pagination accurate
  ✅ Empty results handled gracefully
  ✅ Performance: 1000 posts in < 200ms
```

---

### Feature 4: RANDOM POST (Serendipity - BOM TER)
**Prioridade:** MÉDIA  
**Complexidade:** BAIXA  
**Esforço:** 5 story points

```
Requisito: Endpoint para pegar um post aleatório do usuário (para nostalgia)

Endpoint:
  GET /api/posts/random

Response:
  {
    "id": "uuid",
    "title": "Um pensamento antigo",
    "content": "...",
    "createdAt": "2024-06-15T10:30:00Z",
    "mood": "reflective",
    "ageInDays": 627
  }

Strategy:
  ✅ PostgreSQL TABLESAMPLE BERNOULLI (eficiente)
  ✅ Fallback: SELECT... ORDER BY RANDOM() LIMIT 1 (safe)
  ✅ Cache resultado 5 minutos (optional)

Edge Cases:
  ✅ Só 1 post? retorna ese
  ✅ Nenhum post? 404 No posts found
```

---

### Feature 5: EXPORT POSTS (PDF/Markdown - BOM TER)
**Prioridade:** BAIXA  
**Complexidade:** MÉDIA  
**Esforço:** 13 story points

```
Requisito: Exportar post(s) em PDF ou Markdown

Endpoints:
  POST /api/posts/:id/export?format=pdf|markdown

Response (streaming):
  Content-Type: application/pdf | text/markdown
  Content-Disposition: attachment; filename="...pdf|.md"
  [binary stream]

Decisions:
  Format: PDF
    Library: pdfkit (lightweight)
    Include: title, content, metadata, images (embedded)
    Styling: Simple, readable (serif font)

  Format: Markdown
    Structure: frontmatter (YAML) + content
    Include: All metadata as frontmatter
    Image references: relative paths

Implementation:
  GET /api/posts/:id/export/pdf
    → Load post + images
    → Generate PDF (async stream)
    → Send file

  GET /api/posts/:id/export/markdown
    → Load post
    → Format YAML frontmatter
    → Return markdown text

Error Handling:
  ✅ 404: Post not found
  ✅ 403: Unauthorized
  ✅ 422: Invalid format
  ✅ 503: PDF generation failed

Libraries:
  • pdfkit: PDF generation
  • js-yaml: YAML formatting
```

---

### Feature 6: MOOD ANALYTICS (Heatmap - BOM TER)
**Prioridade:** BAIXA  
**Complexidade:** MÉDIA  
**Esforço:** 8 story points

```
Requisito: Endpoint que retorna agregação de mood ao longo do tempo (para visual heatmap)

Endpoint:
  GET /api/analytics/mood?period=week|month|year&limit=12

Response:
  {
    "period": "month",
    "data": [
      {
        "date": "2026-02",
        "happy": 8,
        "neutral": 12,
        "melancoly": 4,
        "stressed": 2,
        "total": 26
      },
      ...
    ]
  }

Database Query:
  SELECT 
    DATE_TRUNC('month', created_at) as period,
    mood,
    COUNT(*) as count
  FROM posts
  WHERE user_id = ? AND deleted_at IS NULL
  GROUP BY DATE_TRUNC('month', created_at), mood
  ORDER BY period DESC
  LIMIT ?

Performance:
  ✅ Indexed query (user_id, created_at)
  ✅ Optional: Cache 1 hour (Redis if available)
  ✅ Should complete < 100ms

Error Handling:
  ✅ 400: Invalid period
  ✅ 400: limit > 50 rejected
```

---

## 🏗️ ARCHITECTURE DECISIONS & PATTERNS

### 1. Error Handling Strategy
```
All endpoints follow this pattern:

try {
  // Authenticate
  const user = await verifyJWT(req.headers.authorization);
  
  // Authorize
  const post = await getPost(req.params.id);
  if (post.user_id !== user.id) throw new ForbiddenError();
  
  // Validate
  if (!isValidImageFormat(file)) throw new ValidationError();
  
  // Execute
  const result = await updatePost(...);
  
  // Respond
  res.json(result);
  
} catch (error) {
  next(error);  // Global error handler
}

Error Handler (express middleware):
  (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    logger.error({
      status,
      message,
      path: req.path,
      userId: req.user?.id
    });
    
    res.status(status).json({
      error: {
        code: err.code,
        message,
        timestamp: new Date().toISOString()
      }
    });
  }
```

### 2. Database Transaction Pattern
```
For complex operations (ex: upload + create relation):

const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  // Step 1: Save image file
  const imagePath = await saveImage(file);
  
  // Step 2: Save metadata
  const imageRecord = await client.query(
    'INSERT INTO post_images (...) VALUES (...) RETURNING *', [...]
  );
  
  // Step 3: Update post
  await client.query('UPDATE posts SET updated_at = NOW() WHERE id = ?', [postId]);
  
  await client.query('COMMIT');
  return imageRecord.rows[0];
  
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### 3. Query Builder Pattern
```
Don't use raw SQL. Use parameterized queries or simple lib:

// ❌ NEVER:
const query = `SELECT * FROM posts WHERE id = '${id}'`;

// ✅ ALWAYS:
const query = 'SELECT * FROM posts WHERE id = $1 AND user_id = $2';
pool.query(query, [id, userId]);

For complex searches, create helper:

class PostSearchBuilder {
  constructor(tableAlias = 'p') {
    this.alias = tableAlias;
    this.conditions = [];
    this.params = [];
    this.paramCount = 1;
  }
  
  whereUserId(userId) {
    this.conditions.push(`${this.alias}.user_id = $${this.paramCount++}`);
    this.params.push(userId);
    return this;
  }
  
  whereKeyword(keyword) {
    this.conditions.push(
      `${this.alias}.title ILIKE $${this.paramCount} OR ${this.alias}.content ILIKE $${this.paramCount}`
    );
    this.params.push(`%${keyword}%`);
    this.paramCount++;
    return this;
  }
  
  build() {
    return {
      where: this.conditions.join(' AND '),
      params: this.params
    };
  }
}
```

### 4. Rate Limiting Strategy
```
// Existing: login endpoint
// New: Add rate limiting to:
  • File uploads (5/min per user)
  • Search requests (30/min per user)
  • Export requests (10/min per user)

Use token bucket algorithm:

const rateLimit = (endpoint, limit, window) => {
  const store = new Map(); // user_id -> { count, resetAt }
  
  return (req, res, next) => {
    const userId = req.user.id;
    const now = Date.now();
    const record = store.get(userId) || { count: 0, resetAt: now + window };
    
    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + window;
    }
    
    if (record.count >= limit) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Retry in ' + Math.ceil((record.resetAt - now) / 1000) + 's'
      });
    }
    
    record.count++;
    store.set(userId, record);
    next();
  };
};
```

---

## 📋 IMPLEMENTATION SEQUENCE

### Sprint 1 (Week 1-2): Foundation
**Story Points: 42**

1. **PUT /api/posts/:id** (8 pts)
   - Update schema (add edited_at, edit_count)
   - Write endpoint
   - Test thoroughly
   
2. **POST /api/posts/:id/upload** Part 1: Infrastructure (8 pts)
   - Setup multer config
   - Create /public/uploads structure
   - Implement file validation + optimization
   - Create post_images table

3. **POST /api/posts/:id/upload** Part 2: API (5 pts)
   - Implement endpoint
   - Database integration
   - Error handling

### Sprint 2 (Week 3-4): Search
**Story Points: 21**

4. **GET /api/posts/search** (21 pts)
   - Database indexing
   - Build SearchBuilder class
   - Implement all filter logic
   - Comprehensive testing

### Sprint 3 (Week 5): Polish
**Story Points: 26**

5. **GET /api/posts/random** (5 pts)
6. **POST /api/posts/:id/export** (13 pts)
7. **GET /api/analytics/mood** (8 pts)

---

## 🧪 TESTING STRATEGY

Each feature will have:

```
Unit Tests (Jest):
  • Input validation
  • Parameter handling
  • Edge cases
  
Integration Tests:
  • Database operations
  • File system operations
  • Transaction handling
  
E2E Tests:
  • Full workflow (upload → search → export)
  • Authentication checks
  • Error scenarios

Coverage Target: 85%+ for backend critical paths
```

---

## 📊 PERFORMANCE TARGETS

| Operation | Target | Acceptable |
|-----------|--------|-----------|
| POST /api/posts/:id (edit) | < 100ms | < 200ms |
| POST /api/posts/:id/upload | < 2s (with resize) | < 5s |
| GET /api/posts/search | < 200ms (100 results) | < 500ms |
| GET /api/posts/random | < 50ms | < 100ms |
| POST /api/posts/:id/export (PDF) | < 3s | < 5s |
| GET /api/analytics/mood | < 100ms | < 200ms |

Monitoring:
  ✅ Log all slow queries (> 200ms)
  ✅ Monitor disk space (uploads)
  ✅ Memory usage during exports

---

## 🔒 SECURITY CHECKLIST

- [ ] All endpoints require JWT auth
- [ ] All file uploads sanitized + type-checked
- [ ] No directory traversal vulnerabilities
- [ ] SQL injection prevention (parameterized queries)
- [ ] Rate limiting on sensitive operations
- [ ] File size limits enforced
- [ ] User ownership verified before operations
- [ ] Sensitive errors NOT logged to client
- [ ] Temporary files cleaned up after export
- [ ] Database transactions for atomic operations

---

## 📚 DEPENDENCIES TO ADD

```bash
npm install --save \
  multer@^1.4.5 \
  sharp@^0.33.0 \
  pdfkit@^0.13.0 \
  js-yaml@^4.1.0
```

No breaking changes. All backward compatible.

---

## 🎯 SUCCESS CRITERIA (Fase 2 Complete)

- ✅ All 6 features implemented + tested
- ✅ Zero security vulnerabilities (OWASP Top 10)
- ✅ Performance targets met (85%+)
- ✅ Documentation complete (inline + API docs)
- ✅ E2E tests passing
- ✅ Code review approved
- ✅ Deployed to staging
- ✅ User acceptance testing passed

---

<div align="center">

```
═══════════════════════════════════════════════
  BACKEND ARCHITECTURE & IMPLEMENTATION PLAN
  Senior Engineering Standards
  Production-Ready Quality
═══════════════════════════════════════════════
```

**Waiting for PO approval to proceed with Sprint 1 implementation**

</div>
