
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkSchema() {
    console.log('Checking otp_codes schema...');
    try {
        const result = await db.execute("PRAGMA table_info(otp_codes)");
        console.table(result.rows);
    } catch (e) {
        console.error('Error checking schema:', e);
    }
}

checkSchema();
