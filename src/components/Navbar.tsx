import Link from 'next/link';
import styles from './navbar.module.css';
import { getSession } from '@/lib/session';
import db from '@/lib/db';
import NavLinks from './NavLinks';

export default async function Navbar() {
    const session = await getSession();
    let user = null;
    if (session) {
        const result = await db.execute({
            sql: 'SELECT full_name FROM registrations WHERE id = ?',
            args: [session.userId]
        });
        user = result.rows[0] as any;
    }
    return (
        <nav className={`container ${styles.navbar}`}>
            <Link href="/" className={styles.logo}>
                DVS
            </Link>
            <NavLinks
                session={session ? { ...session, expiresAt: new Date(session.expiresAt).toISOString() } : null}
                user={user ? { full_name: user.full_name } : null}
            />
        </nav>
    );
}
