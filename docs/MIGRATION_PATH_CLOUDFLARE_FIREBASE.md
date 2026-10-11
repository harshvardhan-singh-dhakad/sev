# Migration Path: Cloudflare (D1 & R2) and Firebase Auth

This document outlines the zero-downtime migration path from **Option 1 (Node.js native SQLite + Built-in HttpOnly Session Auth)** to **Cloudflare (D1 + R2)** and **Firebase Auth**.

---

## 1. Current Architecture (Option 1 - Self-Contained)
- **Database**: Native Node v24 `DatabaseSync` (`node:sqlite`) storing data at `data/rasvat.sqlite`.
- **Query Layer**: Abstracted via `query<T>(sql, params)` and `execute(sql, params)` in `src/lib/db/index.ts`. All SQL matches standard SQLite / Cloudflare D1 syntax 1:1.
- **Authentication**: PBKDF2 hashed passwords, secure 32-byte session tokens with SHA-256 token hashing, HttpOnly `SameSite=Lax` cookies, rate limiting (5 attempts = 15 min lock), and server-side RBAC verification (`hasPermission`, `assertPermission`).
- **Media Storage**: Uploads validated with magic bytes, saved locally to `public/uploads/` with usage count tracking.

---

## 2. Cloudflare D1 Database Migration

Because Cloudflare D1 is built on SQLite, the schema in `src/lib/db/index.ts` is already 100% compatible.

### Migration Steps:
1. **Export SQLite Schema & Data**:
   ```bash
   sqlite3 data/rasvat.sqlite .dump > d1-migration.sql
   ```
2. **Create D1 Database on Cloudflare**:
   ```bash
   npx wrangler d1 create rasvat-prod-db
   ```
3. **Execute Migration on D1**:
   ```bash
   npx wrangler d1 execute rasvat-prod-db --file=./d1-migration.sql --remote
   ```
4. **Update `src/lib/db/index.ts`**:
   Switch the `query` and `execute` functions to bind to Cloudflare D1:
   ```typescript
   // On Cloudflare Pages/Workers:
   const db = env.DB; // D1 binding
   return await db.prepare(sql).bind(...params).all();
   ```
   Or use the Cloudflare D1 REST API via `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_API_TOKEN`.

---

## 3. Firebase Auth Migration

The Auth Adapter architecture in `src/lib/auth/adapter.ts` provides a drop-in slot for Firebase Auth.

### Migration Steps:
1. **Install Firebase Admin SDK**:
   ```bash
   npm install firebase-admin
   ```
2. **Configure Environment Variables in `.env`**:
   ```env
   AUTH_PROVIDER="firebase"
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk@...iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   ```
3. **Set Custom Claims for RBAC Roles**:
   In your Firebase Admin initialization or via a Cloud Function:
   ```typescript
   await admin.auth().setCustomUserClaims(uid, { role: 'owner' }); // 'owner' | 'manager' | 'editor' | 'support'
   ```
4. **Adapter Behavior**:
   `FirebaseAuthAdapter.verifySession(idToken)` in `src/lib/auth/adapter.ts` verifies the Firebase ID token and returns the typed `AdminUser` with the assigned role, preserving all downstream RBAC checks (`assertPermission`, `hasPermission`) without modifying any admin routes or UI.

---

## 4. Cloudflare R2 Media Storage Migration

The storage provider in `src/lib/media/storage.ts` supports switching from local disk to Cloudflare R2 without breaking media metadata or usage tracking.

### Migration Steps:
1. **Create R2 Bucket**:
   ```bash
   npx wrangler r2 bucket create rasvat-media
   ```
2. **Configure S3-Compatible Credentials in `.env`**:
   ```env
   STORAGE_PROVIDER="r2"
   R2_ACCOUNT_ID="your-cloudflare-account-id"
   R2_ACCESS_KEY_ID="your-access-key"
   R2_SECRET_ACCESS_KEY="your-secret-key"
   R2_BUCKET_NAME="rasvat-media"
   R2_PUBLIC_URL="https://media.rasvat.in"
   ```
3. **Migrate Existing Files**:
   Upload all files in `public/uploads/` to the R2 bucket using `aws s3 sync public/uploads/ s3://rasvat-media --endpoint-url https://<account-id>.r2.cloudflarestorage.com`.
4. **Activate `CloudflareR2StorageAdapter`**:
   Flip `STORAGE_PROVIDER="r2"` in `.env`.
