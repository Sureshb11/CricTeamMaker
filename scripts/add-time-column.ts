
import db from '../src/lib/db';

async function main() {
    try {
        await db.execute('ALTER TABLE matches ADD COLUMN time TEXT DEFAULT "00:00"');
        console.log('Added time column to matches table');
    } catch (error) {
        console.error('Error adding column (might already exist):', error);
    }
}

main();
