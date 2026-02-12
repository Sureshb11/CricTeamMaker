const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'cricket.db');
const db = new Database(dbPath);

console.log('Creating gallery_images table...');
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS gallery_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_url TEXT NOT NULL,
            caption TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Successfully created gallery_images table.');
} catch (error) {
    console.error('Error creating table:', error);
}
