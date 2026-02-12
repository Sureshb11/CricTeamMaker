import styles from './page.module.css';
import db from '@/lib/db';
import TeamList from './team-list';

async function getRegisteredPlayers() {
    const result = await db.execute(`
        SELECT r.*, t.logo_url 
        FROM registrations r 
        LEFT JOIN teams t ON r.team_name = t.name 
        ORDER BY r.team_name ASC, r.full_name ASC
    `);
    return result.rows as any[];
}

export default async function TeamPage() {
    const registeredPlayers = await getRegisteredPlayers();

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Our Teams and Squad</h1>
                <p className={styles.subtitle}>All registered players and teams.</p>
            </div>

            <TeamList players={registeredPlayers} />
        </div>
    );
}
