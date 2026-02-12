
import db from '../src/lib/db';

async function testConnection() {
    console.log('Testing connection to Turso...');
    try {
        const result = await db.execute('SELECT 1');
        console.log('Connection successful!', result);
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

testConnection();
