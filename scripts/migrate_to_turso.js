
const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });
// Also load .env for Turso credentials
require('dotenv').config();

const localDb = new Database('cricket.db');

const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
    console.log('Starting migration to Turso...');

    // 1. Get all tables
    const tables = localDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

    for (const table of tables) {
        const tableName = table.name;
        console.log(`Migrating table: ${tableName}`);

        // 2. Get Schema
        const schema = localDb.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name = ?`).get(tableName);
        if (schema && schema.sql) {
            console.log(`  Creating table schema...`);
            try {
                await turso.execute(schema.sql);
            } catch (e) {
                console.log(`  Table might already exist: ${e.message}`);
            }
        }

        // 3. Get Data
        const rows = localDb.prepare(`SELECT * FROM ${tableName}`).all();
        console.log(`  Found ${rows.length} rows.`);

        if (rows.length > 0) {
            // Construct INSERT statement
            const firstRow = rows[0];
            const columns = Object.keys(firstRow);
            const placeholders = columns.map(() => '?').join(', ');
            const sql = `INSERT OR IGNORE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

            // Batch insert? LibSQL client supports execute multiple, but batch execution is better. 
            // For simplicity and safety with quotas, let's do batches or individual if small. 
            // Let's try individual for now or small batches.

            let count = 0;
            for (const row of rows) {
                const args = columns.map(col => row[col]);
                await turso.execute({ sql, args });
                count++;
                if (count % 10 === 0) process.stdout.write('.');
            }
            console.log(`\n  Migrated ${count} rows.`);
        }
    }

    console.log('Migration complete!');
}

migrate().catch(console.error);
