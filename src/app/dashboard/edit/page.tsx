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
    const user = result.rows[0] as any;

    if (!user) {
        redirect('/login');
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Edit Profile</h1>
                <p className={styles.subtitle}>Update your details</p>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '12px' }}>
                <EditProfileForm user={user} />
            </div>
        </div>
    );
}
