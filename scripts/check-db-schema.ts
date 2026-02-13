
import db from '../src/lib/db';

async function main() {
    try {
        const result = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='matches'");
        console.log('Schema:', result.rows[0]);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
