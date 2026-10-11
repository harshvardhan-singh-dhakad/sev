import { test, expect } from '@playwright/test';
import { getDb } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth/session';
import crypto from 'node:crypto';

test.describe('Admin System Phase A1 - Auth & RBAC', () => {
  const OWNER_EMAIL = 'owner@rasvat.in';
  const OWNER_PASS = 'RasvatOwner@2026';

  // Seed secondary users with different roles for RBAC testing
  test.beforeAll(async () => {
    const db = getDb();
    const now = new Date().toISOString();

    const roles = [
      { email: 'editor@rasvat.in', name: 'Test Editor', role: 'editor', pass: 'EditorPass@2026' },
      { email: 'support@rasvat.in', name: 'Test Support', role: 'support', pass: 'SupportPass@2026' },
      { email: 'manager@rasvat.in', name: 'Test Manager', role: 'manager', pass: 'ManagerPass@2026' },
    ];

    for (const u of roles) {
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(u.email);
      if (!existing) {
        const { hash, salt } = hashPassword(u.pass);
        const id = crypto.randomUUID();
        db.prepare(`
          INSERT INTO users (id, email, password_hash, salt, name, role, totp_enabled, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?, ?)
        `).run(id, u.email, hash, salt, u.name, u.role, now, now);
      }
    }
  });

  test('1. Unauthenticated requests to admin endpoints return 401 Unauthorized', async ({ request }) => {
    const resSettings = await request.get('/api/admin/settings');
    expect(resSettings.status()).toBe(401);

    const resAudit = await request.get('/api/admin/audit-log');
    expect(resAudit.status()).toBe(401);

    const resMedia = await request.get('/api/admin/media');
    expect(resMedia.status()).toBe(401);
  });

  test('2. Rate limiting locks out after 5 consecutive failed login attempts', async ({ request }) => {
    const targetEmail = `bruteforce_${Date.now()}@rasvat.in`;

    for (let i = 0; i < 5; i++) {
      const res = await request.post('/api/admin/auth/login', {
        data: { email: targetEmail, password: 'WrongPassword123' },
      });
      expect(res.status()).toBe(401);
    }

    // 6th attempt should be locked out with 429
    const lockRes = await request.post('/api/admin/auth/login', {
      data: { email: targetEmail, password: 'WrongPassword123' },
    });
    expect(lockRes.status()).toBe(429);
    const body = await lockRes.json();
    expect(body.error).toContain('temporarily locked');
  });

  test('3. Owner valid login succeeds and receives HttpOnly session cookie', async ({ request }) => {
    const res = await request.post('/api/admin/auth/login', {
      data: { email: OWNER_EMAIL, password: OWNER_PASS },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.role).toBe('owner');

    const headers = res.headers();
    const setCookie = headers['set-cookie'] || '';
    expect(setCookie).toContain('rasvat_admin_session');
    expect(setCookie.toLowerCase()).toContain('httponly');
  });

  test('4. RBAC: Support role cannot view or edit audit logs (403 Forbidden)', async ({ request }) => {
    // Login as Support
    const loginRes = await request.post('/api/admin/auth/login', {
      data: { email: 'support@rasvat.in', password: 'SupportPass@2026' },
    });
    expect(loginRes.status()).toBe(200);

    // Support trying to read Audit Log
    const auditRes = await request.get('/api/admin/audit-log');
    expect(auditRes.status()).toBe(403);
    const auditBody = await auditRes.json();
    expect(auditBody.error).toContain('Forbidden');
  });

  test('5. RBAC: Editor role cannot view or edit settings (403 Forbidden)', async ({ request }) => {
    // Login as Editor
    const loginRes = await request.post('/api/admin/auth/login', {
      data: { email: 'editor@rasvat.in', password: 'EditorPass@2026' },
    });
    expect(loginRes.status()).toBe(200);

    // Editor cannot view settings
    const viewRes = await request.get('/api/admin/settings');
    expect(viewRes.status()).toBe(403);

    // Editor cannot edit settings
    const editRes = await request.put('/api/admin/settings', {
      data: { store_name: 'Hacked Store' },
    });
    expect(editRes.status()).toBe(403);

    // Manager CAN view settings
    await request.post('/api/admin/auth/login', {
      data: { email: 'manager@rasvat.in', password: 'ManagerPass@2026' },
    });
    const managerViewRes = await request.get('/api/admin/settings');
    expect(managerViewRes.status()).toBe(200);
  });

  test('6. Owner can update settings and mutation is logged in audit trail', async ({ request }) => {
    // Login as Owner
    const loginRes = await request.post('/api/admin/auth/login', {
      data: { email: OWNER_EMAIL, password: OWNER_PASS },
    });
    expect(loginRes.status()).toBe(200);

    // Update settings
    const updateRes = await request.put('/api/admin/settings', {
      data: {
        fssai_no: '12345678901234',
        bulk_minimum_kg: 5,
        min_cart_value_paise: 24900,
      },
    });
    expect(updateRes.status()).toBe(200);

    // Check audit log
    const auditRes = await request.get('/api/admin/audit-log');
    expect(auditRes.status()).toBe(200);
    const auditData = await auditRes.json();
    const updateLog = auditData.logs.find(
      (l: { action: string; entity_type: string }) => l.action === 'settings_change' && l.entity_type === 'settings'
    );
    expect(updateLog).toBeDefined();
    expect(updateLog.user_role).toBe('owner');
  });

  test('7. Browser UI flow: Login redirect and admin shell navigation', async ({ page, context }) => {
    // Clear cookies to simulate unauthenticated visitor
    await context.clearCookies();

    // Try to visit /admin without session -> redirects to /admin/login
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);

    // Fill credentials and login
    await page.fill('#admin-email', OWNER_EMAIL);
    await page.fill('#admin-password', OWNER_PASS);
    await page.click('button[type="submit"]');

    // Successfully redirects to /admin
    await page.waitForURL(/\/admin$/);
    await expect(page.locator('h1')).toContainText('Rasvat Operations Dashboard');

    // Sidebar and user profile visible
    await expect(page.getByText('Rasvat Owner', { exact: true })).toBeVisible();
    await expect(page.getByText('owner', { exact: true })).toBeVisible();

    // Navigate to Settings
    await page.click('a[href="/admin/settings"]');
    await page.waitForURL(/\/admin\/settings/);
    await expect(page.locator('h1').first()).toContainText('Store Configuration & Rules');

    // Navigate to Audit Log
    await page.click('a[href="/admin/audit-log"]');
    await page.waitForURL(/\/admin\/audit-log/);
    await expect(page.locator('h1').first()).toContainText('Security Audit Trail');

    // Navigate to Media
    await page.click('a[href="/admin/media"]');
    await page.waitForURL(/\/admin\/media/);
    await expect(page.locator('h1').first()).toContainText('Media Library & Assets');
  });
});
