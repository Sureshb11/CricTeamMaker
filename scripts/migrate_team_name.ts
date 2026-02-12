import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'cricket.db');
const db = new Database(dbPath);

console.log('Migrating database: Adding team_name column to registrations table...');

try {
    // Check if column exists (basic check, could be more robust)
    const tableInfo = db.prepare('PRAGMA table_info(registrations)').all() as any[];
    const hasColumn = tableInfo.some(col => col.name === 'team_name');

    if (!hasColumn) {
        db.prepare('ALTER TABLE registrations ADD COLUMN team_name TEXT').run();
        console.log('Successfully added team_name column.');
    } else {
        console.log('Column team_name already exists.');
    }
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}

console.log('Migration complete.');
