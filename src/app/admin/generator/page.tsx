import db from '@/lib/db';
import styles from '@/app/register/page.module.css';
import TeamGenerator from './team-generator';

async function getPlayers() {
    const result = await db.execute('SELECT * FROM registrations ORDER BY full_name ASC');
    return result.rows as any[];
}

async function getTeams() {
    const result = await db.execute('SELECT name FROM teams ORDER BY name ASC');
    return result.rows as { name: string }[];
}

export default async function GeneratorPage() {
    const players = await getPlayers();
    const availableTeams = await getTeams();

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '10px' }}>Random Team Generator</h1>
            <p style={{ textAlign: 'center', color: '#888', marginBottom: '40px' }}>
                Select players, shuffle them into balanced teams, and update the database.
            </p>

            <TeamGenerator players={players} availableTeams={availableTeams.map(t => t.name)} />
        </div>
    );
}
