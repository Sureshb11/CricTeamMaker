import db from '@/lib/db';
import { addMatch } from './actions';
import styles from '@/app/register/page.module.css';
import MatchItem from './match-item';
import { Trophy, Calendar, MapPin, Shield, Plus } from 'lucide-react';

async function getMatches() {
    const result = await db.execute('SELECT * FROM matches ORDER BY date DESC');
    return result.rows as any[];
}

export default async function ManageMatches() {
    const matches = await getMatches();

    const labelStyle = { display: 'flex', alignItems: 'center', gap: '8px' };

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Trophy size={28} /> Manage Matches
                </h1>
                <p style={{ color: '#888', marginTop: '5px' }}>Schedule new matches and update results</p>
            </div>

            <div className="card" style={{ marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '25px', color: 'var(--primary-color)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Plus size={20} /> Add New Match
                </h2>
                <form action={async (formData) => {
                    'use server';
                    await addMatch(formData);
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={labelStyle}>
                                <Calendar size={14} /> Date
                            </label>
                            <input type="text" name="date" className={styles.input} placeholder="e.g. Oct 25, 2024" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={labelStyle}>
                                <MapPin size={14} /> Venue
                            </label>
                            <input type="text" name="venue" className={styles.input} placeholder="e.g. Green Park Stadium" required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={labelStyle}>
                                <Shield size={14} /> Home Team
                            </label>
                            <input type="text" name="home_team" className={styles.input} defaultValue="DVS TEAM" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} style={labelStyle}>
                                <Shield size={14} /> Away Team / Opponent
                            </label>
                            <input type="text" name="away_team" className={styles.input} placeholder="e.g. Rogue XI" required />
                        </div>
                    </div>

                    <button type="submit" className={styles.button} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <Plus size={18} /> Add Match
                    </button>
                </form>
            </div>

            {/* List Matches */}
            <div>
                <h2 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Scheduled & Past Matches</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {matches.length > 0 ? (
                        matches.map(match => (
                            <MatchItem key={match.id} match={match} />
                        ))
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                            <p style={{ color: '#888' }}>No matches found. Add your first match above!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
