const http = require('http');

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testAuthSession() {
  console.log('=== Test Auth & Session Management (Tetap di Aplikasi / Keluar) ===\n');

  // 1. Test Admin Login with valid credentials
  console.log('1. Testing Admin Login with "admin" / "adminunugha"...');
  const loginRes1 = await request('POST', '/api/auth/login', { username: 'admin', password: 'adminunugha' });
  if (loginRes1.status !== 200 || !loginRes1.body.success) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes1.body));
  }
  console.log(`[PASS] Login Success: User=${loginRes1.body.user.name}, Role=${loginRes1.body.user.role}`);
  console.log(`[PASS] JWT Token Received (length: ${loginRes1.body.token.length})`);

  // 2. Test Login with alias password 'unugha2026'
  console.log('\n2. Testing Admin Login with alias password "unugha2026"...');
  const loginRes2 = await request('POST', '/api/auth/login', { username: 'admin', password: 'unugha2026' });
  if (loginRes2.status !== 200 || !loginRes2.body.success) {
    throw new Error('Alias password login failed: ' + JSON.stringify(loginRes2.body));
  }
  console.log('[PASS] Alias password accepted successfully');

  // 3. Test Invalid Password
  console.log('\n3. Testing Login with Incorrect Password...');
  const badLogin = await request('POST', '/api/auth/login', { username: 'admin', password: 'wrongpassword' });
  if (badLogin.status === 401 && !badLogin.body.success) {
    console.log('[PASS] Incorrect password correctly rejected with 401: ' + badLogin.body.error);
  } else {
    throw new Error('Bad password was not rejected properly!');
  }

  // 4. Test Token Verification
  console.log('\n4. Testing Token Verification (/api/auth/me)...');
  const token = loginRes1.body.token;
  const verifyRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve(JSON.parse(b)));
    });
    req.on('error', reject);
    req.end();
  });

  if (verifyRes.success && verifyRes.user.username === 'admin') {
    console.log(`[PASS] Token authenticated successfully for user: ${verifyRes.user.name}`);
  } else {
    throw new Error('Token verification failed: ' + JSON.stringify(verifyRes));
  }

  console.log('\n=== ALL AUTH & SESSION TESTS PASSED (100%) ===');
}

testAuthSession().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
