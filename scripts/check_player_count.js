import db from '../src/lib/db';

async function checkPlayers() {
    console.log('Checking player data...');
    try {
        const result = await db.execute("SELECT id, full_name, email, photo_url, team_name FROM registrations LIMIT 10");
        console.table(result.rows);
    } catch (e) {
        console.error(e);
    }
}

checkPlayers();
