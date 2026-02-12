
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkPlayerCount() {
    console.log('Checking player count...');
    try {
        const result = await db.execute("SELECT COUNT(*) as count FROM registrations");
        const count = result.rows[0].count;
        console.log(`Total Players Registered: ${count}`);

        // Also list the names to be helpful
        const players = await db.execute("SELECT full_name, email FROM registrations LIMIT 10");
        console.log('\nRecent Players (First 10):');
        console.table(players.rows);

    } catch (e) {
        console.error('Error checking player count:', e);
    }
}

checkPlayerCount();
