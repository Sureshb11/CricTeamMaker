import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'cricket.db');
const db = new Database(dbPath);

console.log('Migrating database: Creating OTP table...');

try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      email TEXT PRIMARY KEY,
      otp TEXT NOT NULL,
      expires_at DATETIME NOT NULL
    );
  `);
    console.log('Created otp_codes table.');
} catch (error) {
    console.error('Migration failed:', error);
}
