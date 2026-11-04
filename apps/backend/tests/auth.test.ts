import { authService } from '../src/modules/auth/auth.service';
import { userService } from '../src/modules/users/user.service';
import {
  UnauthorizedError,
  ConflictError
} from '../src/core/errors/AppError';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    process.stdout.write(`⏳ Running test: ${name}... `);
    await fn();
    const durationMs = Date.now() - start;
    results.push({ name, passed: true, durationMs });
    console.log(`✅ PASSED (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ name, passed: false, error: err.message, durationMs });
    console.log(`❌ FAILED (${durationMs}ms)`);
    console.error(`   Error: ${err.message}`);
  }
}

async function main() {
  console.log('\n============================================================');
  console.log('🧪 WealthFlow Auth & User Management Verification Suite');
  console.log('============================================================\n');

  const testUserEmail = `arjun.sharma.${Date.now()}@wealthflow.internal`;
  const initialPassword = 'SecurePassword@2026!';
  let testUserId = '';
  let testRefreshToken = '';
  let currentSessionId = '';

  // 1. User Registration with India & INR defaults
  await runTest('1. User Registration with India & INR Regional Defaults', async () => {
    const authResult = await authService.register(
      {
        firstName: 'Arjun',
        lastName: 'Sharma',
        email: testUserEmail,
        password: initialPassword,
        confirmPassword: initialPassword,
        phoneNumber: '+91 98765 43210',
        country: 'India',
        currency: 'INR',
        financialYear: 'APRIL_MARCH',
        timeZone: 'Asia/Kolkata',
        theme: 'dark'
      },
      '103.21.244.50',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0'
    );

    if (!authResult.user) throw new Error('User not returned from registration');
    if (authResult.user.email !== testUserEmail) throw new Error(`Email mismatch: ${authResult.user.email}`);
    if (authResult.user.preferences.defaultCurrency !== 'INR') {
      throw new Error(`Currency must be INR, got ${authResult.user.preferences.defaultCurrency}`);
    }
    if (authResult.user.profile.country !== 'India') {
      throw new Error(`Country must be India, got ${authResult.user.profile.country}`);
    }
    if (authResult.user.preferences.financialYear !== 'APRIL_MARCH') {
      throw new Error(`Financial year must be APRIL_MARCH, got ${authResult.user.preferences.financialYear}`);
    }
    if (authResult.user.profile.timeZone !== 'Asia/Kolkata') {
      throw new Error(`Timezone must be Asia/Kolkata, got ${authResult.user.profile.timeZone}`);
    }
    if (!authResult.tokens.accessToken || !authResult.tokens.refreshToken) {
      throw new Error('Registration must issue both access and refresh tokens');
    }

    testUserId = authResult.user.id;
    testRefreshToken = authResult.tokens.refreshToken;
  });

  // 2. Duplicate Registration Rejection
  await runTest('2. Duplicate Email Registration Rejection', async () => {
    let duplicateRejected = false;
    try {
      await authService.register(
        {
          firstName: 'Arjun',
          lastName: 'Duplicate',
          email: testUserEmail,
          password: initialPassword,
          confirmPassword: initialPassword
        },
        '103.21.244.50',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      );
    } catch (err: any) {
      if (err instanceof ConflictError || err.statusCode === 409 || err.message.includes('already exists')) {
        duplicateRejected = true;
      }
    }

    if (!duplicateRejected) {
      throw new Error('Expected duplicate email registration to throw ConflictError (409)');
    }
  });

  // 3. Valid Login & JWT Issuance
  await runTest('3. Valid Login with Device Metadata and JWT Generation', async () => {
    const loginResult = await authService.login(
      {
        email: testUserEmail,
        password: initialPassword
      },
      '103.21.244.50',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0'
    );

    if (!loginResult.tokens?.accessToken) throw new Error('Missing accessToken');
    if (!loginResult.tokens?.refreshToken) throw new Error('Missing refreshToken');

    // Decode and verify JWT
    const decoded = jwt.verify(loginResult.tokens.accessToken, env.JWT_SECRET) as any;
    if (decoded.id !== testUserId) throw new Error(`JWT id ${decoded.id} does not match user id ${testUserId}`);
    if (decoded.email !== testUserEmail) throw new Error(`JWT email ${decoded.email} does not match`);

    testRefreshToken = loginResult.tokens.refreshToken;
  });

  // 4. Account Lockout Protection after 5 Failed Attempts
  await runTest('4. Account Lockout Protection after 5 consecutive failed logins', async () => {
    const lockoutEmail = `lockout.${Date.now()}@wealthflow.internal`;

    // Register user
    await authService.register(
      {
        firstName: 'Lockout',
        lastName: 'Test',
        email: lockoutEmail,
        password: initialPassword,
        confirmPassword: initialPassword
      },
      '127.0.0.1',
      'Mozilla/5.0'
    );

    // 5 consecutive failed login attempts
    for (let i = 1; i <= 5; i++) {
      try {
        await authService.login({ email: lockoutEmail, password: 'WrongPassword' }, '127.0.0.1', 'Mozilla/5.0');
      } catch {
        // Expected failure
      }
    }

    // 6th attempt should be blocked due to account lockout
    let isLocked = false;
    try {
      await authService.login({ email: lockoutEmail, password: 'WrongPassword' }, '127.0.0.1', 'Mozilla/5.0');
    } catch (err: any) {
      if (err.message.includes('locked') || err.statusCode === 423) {
        isLocked = true;
      }
    }

    if (!isLocked) {
      throw new Error('Account was not locked after 5 consecutive failed login attempts');
    }
  });

  // 5. Token Refresh & Token Rotation
  await runTest('5. Cryptographic Refresh Token Rotation', async () => {
    const refreshResult = await authService.refreshToken(testRefreshToken, '103.21.244.50');
    if (!refreshResult.accessToken) throw new Error('Missing new accessToken from refresh');
    if (!refreshResult.refreshToken) throw new Error('Missing rotated refreshToken');

    // Attempting to reuse old refresh token should be rejected
    let oldTokenRejected = false;
    try {
      await authService.refreshToken(testRefreshToken, '103.21.244.50');
    } catch (err: any) {
      if (err instanceof UnauthorizedError || err.message.includes('revoked') || err.message.includes('invalid')) {
        oldTokenRejected = true;
      }
    }

    if (!oldTokenRejected) {
      throw new Error('Old refresh token was not revoked upon rotation (replay attack risk)');
    }

    testRefreshToken = refreshResult.refreshToken;
  });

  // 6. Active Sessions Tracking & Metadata
  await runTest('6. Active Session Device Tracking and Metadata', async () => {
    // Log in to establish a fresh active session after the token reuse test
    const loginRes = await authService.login(
      {
        email: testUserEmail,
        password: initialPassword
      },
      '103.21.244.50',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0'
    );
    currentSessionId = loginRes.sessionId || '';

    const sessions = await userService.getActiveSessions(testUserId);
    if (!sessions || sessions.length === 0) {
      throw new Error('User has no active sessions recorded');
    }

    const firstSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
    currentSessionId = firstSession.id;

    if (!firstSession.browser) throw new Error('Session did not capture browser metadata');
    if (!firstSession.os) throw new Error('Session did not capture OS metadata');
    if (!firstSession.ipAddress) throw new Error('Session did not capture IP address');
  });

  // 7. Session Revocation
  await runTest('7. Individual Session Revocation', async () => {
    await userService.revokeSession(testUserId, currentSessionId);
    const stores = authService.getMemoryStores();
    const revokedSession = stores.sessions.get(currentSessionId);
    if (!revokedSession) {
      throw new Error('Revoked session not found in session store');
    }
    if (revokedSession.isActive) {
      throw new Error('Session is still marked active in store after revocation');
    }
  });

  // 8. Password Reset Token Flow
  await runTest('8. Secure Password Reset Request and Token Execution', async () => {
    const forgotResult = await authService.requestPasswordReset({ email: testUserEmail });
    const resetToken = forgotResult.devResetToken;
    if (!resetToken) throw new Error('Did not generate password reset token');

    const updatedPassword = 'BrandNewPassword@2026!';
    await authService.resetPassword({
      token: resetToken,
      password: updatedPassword,
      confirmPassword: updatedPassword
    });

    // Old password should now fail
    let oldPasswordFailed = false;
    try {
      await authService.login({ email: testUserEmail, password: initialPassword }, '103.21.244.50', 'Mozilla/5.0');
    } catch {
      oldPasswordFailed = true;
    }
    if (!oldPasswordFailed) throw new Error('Old password still worked after reset');

    // New password should succeed
    const newLogin = await authService.login({ email: testUserEmail, password: updatedPassword }, '103.21.244.50', 'Mozilla/5.0');
    if (!newLogin.tokens.accessToken) throw new Error('Login with new password failed');
  });

  // 9. Guided Onboarding Submission
  await runTest('9. Guided Onboarding Submission with Regional & Workspace Config', async () => {
    const updatedUser = await userService.submitOnboarding(testUserId, {
      defaultCurrency: 'INR',
      financialYear: 'APRIL_MARCH',
      workspaceType: 'INDIVIDUAL',
      enabledModules: ['BANKING', 'INVESTMENTS', 'BUDGETS', 'GOALS', 'ANALYTICS'],
      initialGoal: {
        title: 'Emergency Reserve Fund (6 Months)',
        targetAmount: 600000,
        targetDate: '2027-03-31'
      }
    });

    if (!updatedUser.onboardingCompleted) {
      throw new Error('User onboardingCompleted flag was not updated to true');
    }
    if (updatedUser.preferences?.workspaceType !== 'INDIVIDUAL') {
      throw new Error('WorkspaceType not persisted');
    }
    if (updatedUser.preferences?.defaultCurrency !== 'INR') {
      throw new Error('Currency changed from INR');
    }
  });

  // 10. Audit Log Verification
  await runTest('10. Security Event Audit Logging', async () => {
    const logs = await userService.getAuditLogs(testUserId);
    if (!logs || logs.length === 0) {
      throw new Error('No audit logs recorded for user security events');
    }

    const actionTypes = logs.map((l) => l.action);
    const requiredActions = ['REGISTER', 'LOGIN_SUCCESS', 'SESSION_REVOKED', 'ONBOARDING_COMPLETED'];
    for (const action of requiredActions) {
      if (!actionTypes.some((a) => a.includes(action))) {
        throw new Error(`Expected audit log to include action: ${action}`);
      }
    }
  });

  // 11. Token Expiration Enforcement
  await runTest('11. Short-Lived Access Token Expiration Enforcement', async () => {
    const expiredToken = jwt.sign(
      { id: testUserId, email: testUserEmail, role: 'USER' },
      env.JWT_SECRET,
      { expiresIn: '10ms' }
    );

    // Sleep for 50ms to ensure expiry
    await new Promise((resolve) => setTimeout(resolve, 50));

    let expiredRejected = false;
    try {
      jwt.verify(expiredToken, env.JWT_SECRET);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        expiredRejected = true;
      }
    }

    if (!expiredRejected) {
      throw new Error('Expired JWT token was not rejected by cryptographic verification');
    }
  });

  // 12. Role-Based Access Control (RBAC) Authorization Boundary
  await runTest('12. Role-Based Access Control Authorization Boundary (USER vs ADMIN)', async () => {
    const { authorize } = await import('../src/core/middleware/authenticate');
    const { ForbiddenError } = await import('../src/core/errors/AppError');

    const adminCheckMiddleware = authorize('ADMIN');

    // Simulate standard USER request
    const userReq: any = { user: { id: testUserId, email: testUserEmail, role: 'USER' } };
    let userDenied = false;

    adminCheckMiddleware(userReq, {} as any, (err: any) => {
      if (err instanceof ForbiddenError || err?.statusCode === 403) {
        userDenied = true;
      }
    });

    if (!userDenied) {
      throw new Error('Standard USER was incorrectly granted access to ADMIN-protected endpoint');
    }

    // Simulate ADMIN request
    const adminReq: any = { user: { id: 'admin-id', email: 'admin@wealthflow.internal', role: 'ADMIN' } };
    let adminAllowed = false;

    adminCheckMiddleware(adminReq, {} as any, (err?: any) => {
      if (!err) {
        adminAllowed = true;
      }
    });

    if (!adminAllowed) {
      throw new Error('ADMIN user was denied access to ADMIN-protected endpoint');
    }
  });

  // 13. Strict User Ownership Boundary
  await runTest('13. Strict Server-Side User Resource Ownership Boundary', async () => {
    const victimEmail = `victim.${Date.now()}@wealthflow.internal`;
    const victimAuth = await authService.register(
      {
        firstName: 'Victim',
        lastName: 'User',
        email: victimEmail,
        password: initialPassword,
        confirmPassword: initialPassword
      },
      '127.0.0.1',
      'Mozilla/5.0'
    );

    const victimSessionId = victimAuth.sessionId!;
    const stores = authService.getMemoryStores();

    // Attacker (testUserId) attempts to revoke victim's session
    await userService.revokeSession(testUserId, victimSessionId);

    // Victim's session must remain active because attacker does not own it
    const victimSession = stores.sessions.get(victimSessionId);
    if (!victimSession || !victimSession.isActive) {
      throw new Error('Cross-user session revocation succeeded! Ownership boundary violation');
    }
  });

  // 14. IP-Based Sliding Window Rate Limiting Protection
  await runTest('14. IP-Based Rate Limiting on Authentication Endpoints', async () => {
    const { createRateLimiter } = await import('../src/core/middleware/rateLimiter');
    const testLimiter = createRateLimiter(60000, 5, 'Rate limit triggered');

    const mockReq: any = {
      headers: { 'x-forwarded-for': '203.0.113.199' },
      socket: { remoteAddress: '203.0.113.199' }
    };

    let rateLimited = false;
    for (let i = 1; i <= 6; i++) {
      const mockRes: any = {
        statusCode: 200,
        setHeader: () => {},
        status: function (code: number) {
          this.statusCode = code;
          return this;
        },
        json: function (payload: any) {
          if (this.statusCode === 429) {
            rateLimited = true;
          }
        }
      };

      testLimiter(mockReq, mockRes, () => {});
    }

    if (!rateLimited) {
      throw new Error('Rate limiter failed to trigger HTTP 429 after exceeding limit');
    }
  });

  // Print Summary
  console.log('\n============================================================');
  console.log('📊 Verification Summary');
  console.log('============================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  results.forEach((r, idx) => {
    const symbol = r.passed ? '✅' : '❌';
    console.log(`${idx + 1}. ${symbol} ${r.name} (${r.durationMs}ms)`);
    if (r.error) {
      console.log(`      Error: ${r.error}`);
    }
  });

  console.log('============================================================');
  console.log(`Total: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log('============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
