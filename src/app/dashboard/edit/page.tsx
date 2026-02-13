import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import styles from '../page.module.css'; // Reuse dashboard styles
import EditProfileForm from './edit-profile-form';

export default async function EditProfilePage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const result = await db.execute({
        sql: 'SELECT * FROM registrations WHERE id = ?',
        args: [session.userId]
    });
    const userRow = result.rows[0];

    // Fetch all teams for the dropdown
    const teamsResult = await db.execute('SELECT name FROM teams ORDER BY name ASC');
    const teams = teamsResult.rows.map(row => String(row.name));

    const user = {
        id: Number(userRow.id),
        full_name: String(userRow.full_name),
        email: String(userRow.email),
        phone: String(userRow.phone),
        team_name: String(userRow.team_name),
        playing_role: String(userRow.playing_role),
        experience_level: String(userRow.experience_level),
        photo_url: userRow.photo_url ? String(userRow.photo_url) : null,
        role: String(userRow.role || 'user'),
    };

    if (!userRow) {
        redirect('/login');
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>✏️ Edit Profile</h1>
                <p className={styles.subtitle}>Update your details</p>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '12px' }}>
                <EditProfileForm user={user} teams={teams} />
            </div>
        </div>
    );
}
