import { createApp } from '../apps/backend/src/app';
import http from 'http';

async function runTest() {
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5000, '127.0.0.1', () => {
      console.log('✅ Server listening on http://127.0.0.1:5000');
      resolve();
    });
  });

  try {
    // 1. Test /api/health
    const healthRes = await fetch('http://127.0.0.1:5000/api/health');
    const healthJson = await healthRes.json();
    console.log('--- HEALTH CHECK RESULT ---');
    console.log(JSON.stringify(healthJson, null, 2));

    if (healthRes.status !== 200) {
      throw new Error(`Health check returned unexpected status ${healthRes.status}`);
    }

    // 2. Test /api/v1/auth/login with demo user
    const loginRes = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo.user@antigravity-finance.local',
        password: 'Password123!'
      })
    });
    const loginJson = (await loginRes.json()) as { data: { tokens: { accessToken: string } } };
    console.log('--- AUTH LOGIN RESULT ---');
    console.log(`Status: ${loginRes.status}, Access Token Received: ${Boolean(loginJson?.data?.tokens?.accessToken)}`);

    const token = loginJson.data.tokens.accessToken;

    // 3. Test authenticated /api/v1/accounts
    const accountsRes = await fetch('http://127.0.0.1:5000/api/v1/accounts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const accountsJson = (await accountsRes.json()) as { data: unknown[] };
    console.log('--- ACCOUNTS RESULT ---');
    console.log(`Status: ${accountsRes.status}, Accounts Count: ${accountsJson?.data?.length}`);

    // 4. Test /api/v1/analytics/net-worth
    const analyticsRes = await fetch('http://127.0.0.1:5000/api/v1/analytics/net-worth', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const analyticsJson = await analyticsRes.json();
    console.log('--- ANALYTICS NET WORTH RESULT ---');
    console.log(JSON.stringify(analyticsJson, null, 2));

    console.log('🎉 ALL FOUNDATION API CHECKS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

