import db from '@/lib/db';
import { addMatch, deleteMatch } from './actions';
import styles from '@/app/register/page.module.css'; // Reuse form styles

async function getMatches() {
    const result = await db.execute('SELECT * FROM matches ORDER BY date DESC');
    return result.rows as any[];
}

import MatchItem from './match-item';

// ... (imports remain)

// ... (getMatches function remains)

export default async function ManageMatches() {
    const matches = await getMatches();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* ... (Header and Add Form remain) ... reference existing code matches lines 14-60 */}
            <h1 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '30px' }}>Manage Matches</h1>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Add New Match</h2>
                <form action={async (formData) => {
                    'use server';
                    await addMatch(formData);
                }}>
                    {/* ... (Form fields remain same as existing) ... */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Date</label>
                            <input type="text" name="date" className={styles.input} placeholder="e.g. Oct 25, 2024" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Venue</label>
                            <input type="text" name="venue" className={styles.input} placeholder="e.g. Green Park Stadium" required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Home Team</label>
                            <input type="text" name="home_team" className={styles.input} defaultValue="DVS TEAM" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Away Team / Opponent</label>
                            <input type="text" name="away_team" className={styles.input} placeholder="e.g. Rogue XI" required />
                        </div>
                    </div>

                    <button type="submit" className={styles.button}>Add Match</button>
                </form>
            </div>

            {/* List Matches */}
            <div>
                <h2 style={{ marginBottom: '20px' }}>All Matches</h2>
                {matches.length > 0 ? (
                    matches.map(match => (
                        <MatchItem key={match.id} match={match} />
                    ))
                ) : (
                    <p style={{ color: '#888', textAlign: 'center' }}>No matches found.</p>
                )}
            </div>
        </div>
    );
}
