const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'cricket.db');
const db = new Database(dbPath);

try {
    console.log('Adding photo_url column to registrations table...');
    db.prepare('ALTER TABLE registrations ADD COLUMN photo_url TEXT').run();
    console.log('Successfully added photo_url column.');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('Column photo_url already exists.');
    } else {
        console.error('Error adding column:', error);
    }
}
