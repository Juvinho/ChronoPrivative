// Teste end-to-end: login → delete post com JWT
const http = require('http');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
    const req = http.request(
      { hostname: 'localhost', port: 4000, path, method: 'POST', headers },
      res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function del(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
    const req = http.request(
      { hostname: 'localhost', port: 4000, path, method: 'DELETE', headers },
      res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  // 1. Login
  console.log('\n[1] POST /api/auth/login');
  const login = await post('/api/auth/login', { username: 'admin', password: 'admin' });
  console.log('   STATUS:', login.status, '| token:', login.body.token ? login.body.token.slice(0, 30) + '...' : 'AUSENTE');
  
  if (!login.body.token) {
    console.error('   ❌ Login falhou — token não retornado');
    return;
  }
  const token = login.body.token;
  console.log('   ✅ JWT obtido');

  // 2. Criar post para deletar
  console.log('\n[2] POST /api/posts/admin (criar post de teste)');
  const create = await post('/api/posts/admin', { title: 'Post DELETE test', content: 'A ser deletado', status: 'published' }, token);
  console.log('   STATUS:', create.status, '| id:', create.body.post?.id);
  if (create.status !== 201) { console.error('   ❌ Criação falhou:', JSON.stringify(create.body)); return; }
  const postId = create.body.post.id;
  console.log('   ✅ Post criado com id:', postId);

  // 3. Deletar post
  console.log('\n[3] DELETE /api/posts/admin/' + postId);
  const del1 = await del(`/api/posts/admin/${postId}`, token);
  console.log('   STATUS:', del1.status, '| body:', JSON.stringify(del1.body));
  if (del1.status === 200) {
    console.log('   ✅ DELETE retornou 200 — BUG CORRIGIDO');
  } else {
    console.error('   ❌ DELETE falhou com status:', del1.status);
  }
})();
