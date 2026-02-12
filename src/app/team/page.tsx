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
    return result.rows.map(row => ({
        id: Number(row.id),
        full_name: String(row.full_name),
        email: String(row.email),
        phone: String(row.phone),
        playing_role: row.playing_role ? String(row.playing_role) : null,
        experience_level: row.experience_level ? String(row.experience_level) : null,
        team_name: row.team_name ? String(row.team_name) : null,
        photo_url: row.photo_url ? String(row.photo_url) : null,
        logo_url: row.logo_url ? String(row.logo_url) : null,
        matches_played: Number(row.matches_played || 0),
        total_runs: Number(row.total_runs || 0),
        total_wickets: Number(row.total_wickets || 0),
        highest_score: Number(row.highest_score || 0),
    }));
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
