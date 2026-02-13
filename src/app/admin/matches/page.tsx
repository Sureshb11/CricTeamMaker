import db from '@/lib/db';
// import { addMatch } from './actions'; // No longer needed here
import AddMatchForm from './add-match-form';
import styles from '@/app/register/page.module.css';
import MatchItem from './match-item';
import { Trophy, Calendar, MapPin, Shield, Plus, Clock } from 'lucide-react';

async function getMatches() {
    const result = await db.execute('SELECT * FROM matches ORDER BY date DESC');
    return result.rows.map((row: any) => ({
        id: Number(row.id),
        opponent: String(row.opponent || ''),
        date: String(row.date),
        time: row.time ? String(row.time) : null,
        venue: String(row.venue),
        result: row.result ? String(row.result) : null,
        score: row.score ? String(row.score) : null,
        home_team: String(row.home_team || ''),
        away_team: String(row.away_team || ''),
        created_at: String(row.created_at)
    }));
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
                <AddMatchForm />
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
