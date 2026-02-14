import db from '../src/lib/db';

async function main() {
    console.log('--- Adding innings tracking columns ---');

    const columns = [
        { name: 'current_striker_id', type: 'INTEGER' },
        { name: 'current_non_striker_id', type: 'INTEGER' },
        { name: 'current_bowler_id', type: 'INTEGER' },
    ];

    for (const col of columns) {
        try {
            await db.execute(`ALTER TABLE innings ADD COLUMN ${col.name} ${col.type}`);
            console.log(`✅ Added column: ${col.name}`);
        } catch (e: any) {
            if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
                console.log(`⏭️  Column ${col.name} already exists, skipping.`);
            } else {
                console.error(`❌ Error adding ${col.name}:`, e.message);
            }
        }
    }

    console.log('Done!');
}

main();
