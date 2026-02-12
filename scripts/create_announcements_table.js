const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'cricket.db');
const db = new Database(dbPath);

console.log('Creating announcements table...');
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Successfully created announcements table.');
} catch (error) {
    console.error('Error creating table:', error);
}
