import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'cricket.db');
const db = new Database(dbPath);

console.log('Migrating database: Adding data column to otp_codes...');

try {
    const tableInfo = db.pragma('table_info(otp_codes)') as any[];
    const hasData = tableInfo.some((col: any) => col.name === 'data');

    if (!hasData) {
        db.prepare('ALTER TABLE otp_codes ADD COLUMN data TEXT').run();
        console.log('Added data column to otp_codes.');
    } else {
        console.log('data column already exists.');
    }
} catch (error) {
    console.error('Migration failed:', error);
}
