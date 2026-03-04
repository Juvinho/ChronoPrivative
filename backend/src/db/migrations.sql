-- ═══════════════════════════════════════════
-- CHRONOPRIVATIVE — MIGRATIONS COMPLETAS
-- ═══════════════════════════════════════════

-- Extensão para UUIDs (caso necessário no futuro)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ───────────────────────────────────────────
-- TABELA: users
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role        VARCHAR(20) DEFAULT 'admin',
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ───────────────────────────────────────────
-- TABELA: posts
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    content         TEXT NOT NULL,
    excerpt         TEXT,
    cover_image_url TEXT,
    author_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    views           INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Índices para posts
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- ───────────────────────────────────────────
-- TABELA: reactions
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reactions (
    id          SERIAL PRIMARY KEY,
    post_id     INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    type        VARCHAR(20) NOT NULL CHECK (type IN ('like', 'love', 'fire', 'clap', 'sad')),
    user_ip     VARCHAR(45),
    session_id  TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, session_id, type)
);

-- Índice para reactions
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);

-- ───────────────────────────────────────────
-- TABELA: comments
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id              SERIAL PRIMARY KEY,
    post_id         INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    author_name     VARCHAR(100) NOT NULL,
    author_email    VARCHAR(150),
    content         TEXT NOT NULL,
    is_approved     BOOLEAN DEFAULT false,
    parent_id       INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Índice para comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- ───────────────────────────────────────────
-- TABELA: tags
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(50) UNIQUE NOT NULL,
    slug    VARCHAR(50) UNIQUE NOT NULL
);

-- ───────────────────────────────────────────
-- TABELA: post_tags (relação N:N)
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_tags (
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    tag_id  INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- ───────────────────────────────────────────
-- TABELA: views_log
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS views_log (
    id          SERIAL PRIMARY KEY,
    post_id     INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    viewer_ip   VARCHAR(45),
    user_agent  TEXT,
    visited_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_views_log_post_id ON views_log(post_id);

-- ───────────────────────────────────────────
-- TRIGGER: atualizar updated_at em posts
-- ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_posts_updated_at ON posts;
CREATE TRIGGER trigger_update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_posts_updated_at();
