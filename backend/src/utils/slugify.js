// ═══════════════════════════════════════════
// Gerador de Slugs URL-safe
// ═══════════════════════════════════════════

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')                   // Separa acentos dos caracteres
    .replace(/[\u0300-\u036f]/g, '')    // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')      // Remove caracteres especiais
    .replace(/\s+/g, '-')              // Espaços → hifens
    .replace(/-+/g, '-')              // Múltiplos hifens → um
    .replace(/^-+|-+$/g, '');         // Remove hifens no início/fim
}

// Garante slug único adicionando sufixo numérico se necessário
async function uniqueSlug(baseText, queryFn, excludeId = null) {
  let slug = slugify(baseText);
  let counter = 0;
  let candidate = slug;

  while (true) {
    let result;
    if (excludeId) {
      result = await queryFn('SELECT id FROM posts WHERE slug = $1 AND id != $2', [candidate, excludeId]);
    } else {
      result = await queryFn('SELECT id FROM posts WHERE slug = $1', [candidate]);
    }

    if (result.rows.length === 0) return candidate;

    counter++;
    candidate = `${slug}-${counter}`;
  }
}

module.exports = { slugify, uniqueSlug };
