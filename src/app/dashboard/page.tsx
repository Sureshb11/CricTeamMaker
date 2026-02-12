import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import styles from './page.module.css';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    // Fetch full user details
    const userResult = await db.execute({
        sql: 'SELECT * FROM registrations WHERE id = ?',
        args: [session.userId]
    });
    const user = userResult.rows[0] as any;

    // Fetch latest announcements
    const announceResult = await db.execute('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 3');
    const announcements = announceResult.rows as any[];

    if (!user) {
        // Edge case: session exists but user deleted?
        redirect('/login');
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                {user.photo_url && (
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        margin: '0 auto 20px',
                        border: '3px solid var(--primary-color)',
                        boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)'
                    }}>
                        <img src={user.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
                <h1 className={styles.title}>Welcome, {user.full_name}</h1>
                <p className={styles.subtitle}>Member Dashboard</p>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <a href="/dashboard/edit" style={{
                        display: 'inline-block',
                        padding: '10px 20px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid var(--primary-color)',
                        borderRadius: '20px',
                        color: 'var(--primary-color)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease'
                    }}>
                        ✏️ Edit Profile
                    </a>

                    {user.role === 'admin' && (
                        <a href="/admin" style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            background: 'var(--primary-color)',
                            border: '1px solid var(--primary-color)',
                            borderRadius: '20px',
                            color: 'black',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease'
                        }}>
                            🛠️ Admin Panel
                        </a>
                    )}
                </div>
            </div>

            {announcements.length > 0 && (
                <div style={{ marginBottom: '30px', background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: '12px', padding: '20px' }}>
                    <h2 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📢 Team Announcements
                    </h2>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {announcements.map((item: any) => (
                            <div key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{item.title}</h3>
                                <p style={{ margin: 0, color: '#ccc', fontSize: '0.95rem' }}>{item.message}</p>
                                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>{new Date(item.created_at).toLocaleDateString()}</small>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.grid}>
                <div className={styles.card}>
                    <h2>Player Profile</h2>
                    <div className={styles.profileInfo}>
                        <div className={styles.row}>
                            <span className={styles.label}>Team:</span>
                            <span className={styles.value}>{user.team_name}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Role:</span>
                            <span className={styles.value}>{user.playing_role}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Experience:</span>
                            <span className={styles.value}>{user.experience_level}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Email:</span>
                            <span className={styles.value}>{user.email}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Phone:</span>
                            <span className={styles.value}>{user.phone}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <h2>My Stats</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{user.matches_played || 0}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Matches</div>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{user.total_runs || 0}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Runs</div>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{user.total_wickets || 0}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Wickets</div>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{user.highest_score || 0}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>High Score</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <form action={async () => {
                    'use server';
                    const { deleteSession } = await import('@/lib/session');
                    await deleteSession();
                    redirect('/login');
                }}>
                    <button className={styles.logoutBtn}>Logout</button>
                </form>
            </div>
        </div>
    );
}
