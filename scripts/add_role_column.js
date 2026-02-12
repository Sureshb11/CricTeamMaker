const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'cricket.db');
const db = new Database(dbPath);

try {
    console.log('Adding role column to registrations table...');
    try {
        db.prepare('ALTER TABLE registrations ADD COLUMN role TEXT DEFAULT "player"').run();
        console.log('Successfully added role column.');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('Column role already exists.');
        } else {
            throw e;
        }
    }

    console.log('Setting admin user: bsb.suresh11@gmail.com');
    const result = db.prepare('UPDATE registrations SET role = ? WHERE email = ?').run('admin', 'bsb.suresh11@gmail.com');

    if (result.changes > 0) {
        console.log('Successfully updated bsb.suresh11@gmail.com to admin.');
    } else {
        console.log('User bsb.suresh11@gmail.com not found. Create the user first or update manually later.');
    }

} catch (error) {
    console.error('Error during migration:', error);
}
