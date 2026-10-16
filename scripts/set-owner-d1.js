/**
 * Change the production D1 owner email and password without placing the
 * password in shell history, environment variables, or process arguments.
 * Usage: node scripts/set-owner-d1.js <email> [owner-name]
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function readSecret(prompt) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    throw new Error('Run this command in an interactive terminal so the password can be entered securely.');
  }

  return new Promise((resolve) => {
    let value = '';
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const onData = (chunk) => {
      const input = chunk.toString('utf8');
      if (input === '\u0003') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.off('data', onData);
        process.stdout.write('\nCancelled.\n');
        process.exit(130);
      }
      if (input === '\r' || input === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.off('data', onData);
        process.stdout.write('\n');
        resolve(value);
        return;
      }
      if (input === '\u007f' || input === '\b') {
        if (value.length > 0) {
          value = value.slice(0, -1);
          process.stdout.write('\b \b');
        }
        return;
      }
      if (input.length === 1 && input >= ' ') {
        value += input;
        process.stdout.write('*');
      }
    };
    process.stdin.on('data', onData);
  });
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function main() {
  const email = String(process.argv[2] || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Usage: node scripts/set-owner-d1.js <your-email> [owner-name]');
  }

  const ownerName = String(process.argv[3] || email.split('@')[0]).trim().slice(0, 100) || 'Rasvat Owner';
  const password = await readSecret('New admin password (12+ characters): ');
  const confirmation = await readSecret('Confirm new admin password: ');
  if (password.length < 12) throw new Error('Use a password with at least 12 characters.');
  if (password !== confirmation) throw new Error('The passwords do not match. No changes were made.');

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const updateOwner = `UPDATE users
    SET email = ${sqlString(email)}, password_hash = ${sqlString(passwordHash)}, salt = ${sqlString(salt)},
        name = ${sqlString(ownerName)}, role = 'owner', is_active = 1, updated_at = ${sqlString(now)}
    WHERE role = 'owner';`;
  const insertOwner = `INSERT INTO users
    (id, email, password_hash, salt, name, role, totp_enabled, is_active, created_at, updated_at)
    SELECT ${sqlString(id)}, ${sqlString(email)}, ${sqlString(passwordHash)}, ${sqlString(salt)},
           ${sqlString(ownerName)}, 'owner', 0, 1, ${sqlString(now)}, ${sqlString(now)}
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'owner');`;

  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'rasvat-d1-owner-'));
  const sqlFile = path.join(temporaryDirectory, 'set-owner.sql');
  try {
    fs.writeFileSync(sqlFile, `${updateOwner}\n${insertOwner}\n`, { encoding: 'utf8', mode: 0o600 });
    const wranglerScript = path.join(__dirname, '..', 'node_modules', 'wrangler', 'bin', 'wrangler.js');
    if (!fs.existsSync(wranglerScript)) throw new Error('Wrangler is not installed. Run npm install first.');

    const result = spawnSync(process.execPath, [
      wranglerScript,
      'd1', 'execute', 'rasvat-prod-db',
      '--remote', '--yes', '--file', sqlFile,
    ], { stdio: 'inherit', windowsHide: true });

    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error('Cloudflare did not update the owner. Check Wrangler login, D1 access, and whether this email already belongs to another staff account.');
    }
    process.stdout.write(`\nProduction admin owner is now ${email}. Sign in at /admin/login.\n`);
  } finally {
    if (fs.existsSync(sqlFile)) fs.unlinkSync(sqlFile);
    if (fs.existsSync(temporaryDirectory)) fs.rmdirSync(temporaryDirectory);
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message || 'Could not set the D1 owner.'}\n`);
  process.exitCode = 1;
});
