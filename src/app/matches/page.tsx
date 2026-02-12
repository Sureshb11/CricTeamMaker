import styles from './page.module.css';
import db from '@/lib/db';

async function getMatches() {
    const stmt = db.prepare('SELECT * FROM matches ORDER BY date DESC');
    return stmt.all() as any[];
}

export default async function MatchesPage() {
    const matches = await getMatches();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Match Schedule</h1>
                <p style={{ color: 'var(--text-muted)' }}>Follow DVS TEAM journey, match by match.</p>
            </div>

            <div className={styles.matchList}>
                {matches.length > 0 ? (
                    matches.map((match) => (
                        <div key={match.id} className={styles.matchCard}>
                            <div className={styles.matchInfo}>
                                <span className={styles.date}>{match.date}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                        {match.home_team || 'D-Vigo-S XI'}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>VS</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                        {match.away_team || match.opponent}
                                    </span>
                                </div>
                                <span className={styles.venue}>📍 {match.venue}</span>
                            </div>
                            <div className={styles.result}>
                                {match.result ? (
                                    <>
                                        <span className={styles.score}>{match.score}</span>
                                        <span className={`${styles.outcome} ${match.result === 'Won' ? styles.win : styles.loss}`}>
                                            {match.result}
                                        </span>
                                    </>
                                ) : (
                                    <span className={`${styles.outcome} ${styles.pending}`}>Upcoming</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No matches scheduled yet.</p>
                )}
            </div>
        </div>
    );
}
