import styles from './page.module.css';
import RegisterForm from './register-form';
import db from '@/lib/db';

async function getTeams() {
    const result = await db.execute('SELECT id, name FROM teams ORDER BY name ASC');
    return result.rows as unknown as { id: number; name: string }[];
}

export default async function RegisterPage(props: { searchParams: Promise<{ success?: string }> }) {
    const searchParams = await props.searchParams;
    const isSuccess = searchParams.success === 'true';
    const teams = await getTeams();

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Join Our Team</h1>

            {isSuccess ? (
                <div className={styles.successMessage}>
                    <h2>Registration Successful!</h2>
                    <p>Welcome to the club. We will contact you shortly.</p>
                </div>
            ) : (
                <RegisterForm teams={teams} />
            )}
        </div>
    );
}
