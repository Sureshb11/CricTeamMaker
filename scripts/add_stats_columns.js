const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'cricket.db');
const db = new Database(dbPath);

console.log('Adding stats columns to registrations table...');

const columns = [
    { name: 'matches_played', type: 'INTEGER DEFAULT 0' },
    { name: 'total_runs', type: 'INTEGER DEFAULT 0' },
    { name: 'total_wickets', type: 'INTEGER DEFAULT 0' },
    { name: 'highest_score', type: 'INTEGER DEFAULT 0' },
    { name: 'best_bowling', type: 'TEXT' }
];

try {
    columns.forEach(col => {
        try {
            db.prepare(`ALTER TABLE registrations ADD COLUMN ${col.name} ${col.type}`).run();
            console.log(`Added column: ${col.name}`);
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log(`Column ${col.name} already exists.`);
            } else {
                console.error(`Error adding ${col.name}:`, e.message);
            }
        }
    });
    console.log('Migration complete.');
} catch (error) {
    console.error('Error during migration:', error);
}
