import styles from './page.module.css';
import db from '@/lib/db';
import Link from 'next/link';
import { PlayCircle, MapPin, Clock } from 'lucide-react';
import { formatTime12Hour } from '@/lib/utils';

async function getMatches() {
    const result = await db.execute('SELECT *, status FROM matches ORDER BY date DESC');
    return result.rows as any[];
}

export default async function MatchesPage() {
    const matches = await getMatches();
    const today = new Date().toISOString().split('T')[0];

    const upcomingMatches = matches.filter(m => m.date >= today);
    const pastMatches = matches.filter(m => m.date < today);

    const renderMatch = (match: any) => (
        <div key={match.id} className={styles.matchCard}>
            <div className={styles.matchInfo}>
                <div className={styles.datetime} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '10px' }}>
                    <span className={styles.date}>{match.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#ccc' }}>
                        <Clock size={14} /> {match.time ? formatTime12Hour(match.time) : 'TBD'}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                        {match.home_team || 'D-Vigo-S XI'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>VS</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                        {match.away_team || match.opponent}
                    </span>
                </div>
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.venue)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.venue}
                    style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                >
                    <span className={styles.icon} style={{ display: 'flex', alignItems: 'center' }}>
                        <MapPin size={16} color="var(--primary-color)" />
                    </span>
                    <div className={styles.venueText}>
                        <span className={styles.groundName}>
                            {match.venue.split(',')[0]}
                        </span>
                        {match.venue.includes(',') && (
                            <span className={styles.location}>
                                {match.venue.substring(match.venue.indexOf(',') + 1)}
                            </span>
                        )}
                    </div>
                </a>

                {/* Live Match Indicator */}
                {match.status === 'live' && (
                    <div style={{ marginTop: '15px' }}>
                        <Link href={`/matches/live/${match.id}`} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(255, 0, 0, 0.15)', color: '#ff4444',
                            padding: '6px 12px', borderRadius: '20px',
                            textDecoration: 'none', fontWeight: 'bold', border: '1px solid rgba(255,0,0,0.3)',
                            fontSize: '0.85rem',
                            animation: 'pulse 2s infinite'
                        }}>
                            <div style={{ width: '6px', height: '6px', background: '#ff4444', borderRadius: '50%' }}></div>
                            LIVE SCORE
                        </Link>
                    </div>
                )}
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
                    match.date < today ? (
                        <span className={`${styles.outcome} ${styles.pending}`}>Result Pending</span>
                    ) : (
                        <span className={`${styles.outcome} ${styles.upcoming}`}>Upcoming</span>
                    )
                )}
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <PlayCircle size={32} /> Match Schedule
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Follow DVS TEAM journey, match by match.</p>
            </div>

            <div className={styles.matchList}>
                {upcomingMatches.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <h2 className={styles.sectionTitle} style={{ borderBottom: '1px solid var(--primary-color)', paddingBottom: '10px', marginBottom: '20px' }}>
                            Upcoming Matches
                        </h2>
                        {upcomingMatches.map(renderMatch)}
                    </div>
                )}

                {pastMatches.length > 0 && (
                    <div>
                        <h2 className={styles.sectionTitle} style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '20px', color: '#888' }}>
                            Recent Results
                        </h2>
                        {pastMatches.map(renderMatch)}
                    </div>
                )}

                {matches.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No matches scheduled yet.</p>
                )}
            </div>
        </div>
    );
}
