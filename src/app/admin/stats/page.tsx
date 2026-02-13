import db from '@/lib/db';
import StatsEditor from './stats-editor';

async function getPlayers() {
    const result = await db.execute('SELECT * FROM registrations ORDER BY id ASC');
    return result.rows as any[];
}

export default async function ManageStats() {
    const players = await getPlayers();

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Player Stats Manager</h1>
                <p style={{ color: '#888', marginTop: '5px' }}>Update Season performance for all players</p>
            </div>

            <StatsEditor initialPlayers={players} />
        </div>
    );
}
