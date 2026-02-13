
import db from '@/lib/db';
import ScorecardForm from './scorecard-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

async function getMatch(id: string) {
    const result = await db.execute({
        sql: 'SELECT * FROM matches WHERE id = ?',
        args: [id]
    });
    return result.rows[0];
}

async function getPlayers() {
    const result = await db.execute('SELECT id, full_name, playing_role as role FROM registrations ORDER BY full_name ASC');
    return result.rows;
}

export default async function ScorecardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const match = await getMatch(id) as any;
    const players = await getPlayers();

    if (!match) return <div>Match not found</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '30px' }}>
                <Link href="/admin/matches" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#888', textDecoration: 'none', marginBottom: '15px' }}>
                    <ArrowLeft size={16} /> Back to Matches
                </Link>
                <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Update Scorecard</h1>
                <p style={{ color: '#888', marginTop: '5px' }}>
                    {String(match.home_team)} vs {String(match.away_team)} - {new Date(match.date).toLocaleDateString()}
                </p>
            </div>

            <ScorecardForm matchId={Number(id)} players={players} />
        </div>
    );
}

