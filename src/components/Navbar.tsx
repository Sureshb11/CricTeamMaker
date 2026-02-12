import Link from 'next/link';
import styles from './navbar.module.css';
import { getSession } from '@/lib/session';
import db from '@/lib/db';

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
            <ul className={styles.navLinks}>
                <li><Link href="/" className={styles.navLink}>Home</Link></li>
                <li><Link href="/team" className={styles.navLink}>Our Teams</Link></li>
                <li><Link href="/matches" className={styles.navLink}>Matches</Link></li>
                <li><Link href="/gallery" className={styles.navLink}>Gallery</Link></li>
                {session ? (
                    <li><Link href="/dashboard" className={styles.navLink} style={{ color: 'var(--primary-color)' }}>Hi, {user?.full_name?.split(' ')[0]}</Link></li>
                ) : (
                    <li><Link href="/login" className={styles.navLink}>Login</Link></li>
                )}
                {!session && <li><Link href="/register" className="btn">Join Team</Link></li>}
            </ul>
        </nav>
    );
}
