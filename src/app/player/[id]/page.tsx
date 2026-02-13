
import db from '@/lib/db';
import Link from 'next/link';
import PlayerAvatar from '../../../components/PlayerAvatar';
import { ArrowLeft, User, Award, Activity, Target, Hash, PlayCircle, Flame } from 'lucide-react';

async function getPlayer(id: string) {
    const result = await db.execute({
        sql: 'SELECT * FROM registrations WHERE id = ?',
        args: [id]
    });
    return result.rows[0];
}

async function getRecentMatches(playerId: string) {
    const result = await db.execute({
        sql: `
        SELECT 
            mp.*, 
            m.date, m.opponent, m.venue, m.result, m.home_team, m.away_team
        FROM match_performances mp
        JOIN matches m ON mp.match_id = m.id
        WHERE mp.player_id = ?
        ORDER BY m.date DESC
        LIMIT 5
        `,
        args: [playerId]
    });
    return result.rows;
}

export default async function PlayerProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const player = await getPlayer(id) as any;
    const recentMatches = await getRecentMatches(id) as any[];

    if (!player) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Player not found</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
            <Link href="/team" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#888', textDecoration: 'none', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back to Team
            </Link>

            {/* Profile Header */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 20px', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginBottom: '20px',
                    border: '4px solid var(--primary-color)',
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)'
                }}>
                    <PlayerAvatar
                        src={player.photo_url}
                        alt={player.full_name}
                        fallbackName={player.full_name}
                    />
                </div>

                <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800' }}>{player.full_name}</h1>
                <div style={{ color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {player.playing_role}
                </div>
                <div style={{ color: '#888', marginTop: '10px', fontSize: '0.9rem' }}>
                    {player.team_name || 'Unassigned Team'} • {player.experience_level}
                </div>

                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(180deg, rgba(0,255,136,0.1) 0%, transparent 100%)', pointerEvents: 'none' }}></div>
            </div>

            {/* Career Stats */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={24} color="var(--primary-color)" /> Career Statistics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                <StatBox label="Matches" value={player.matches_played || 0} icon={<PlayCircle size={20} />} />
                <StatBox label="Runs" value={player.total_runs || 0} icon={<Hash size={20} />} />
                <StatBox label="Wickets" value={player.total_wickets || 0} icon={<Target size={20} />} />
                <StatBox label="High Score" value={player.highest_score || 0} icon={<Flame size={20} />} />
                <StatBox label="Best Bowl" value={player.best_bowling || '-'} icon={<Award size={20} />} />
            </div>

            {/* Recent Matches */}
            {recentMatches.length > 0 && (
                <>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ClockIcon /> Recent Matches
                    </h2>
                    <div className="card" style={{ padding: 0 }}>
                        {recentMatches.map((match, index) => (
                            <div key={match.id} style={{
                                padding: '15px 20px',
                                borderBottom: index < recentMatches.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>vs {match.opponent || (match.home_team === player.team_name ? match.away_team : match.home_team)}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(match.date).toLocaleDateString()} at {match.venue}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                        {match.runs_scored} runs ({match.balls_faced})
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                        {match.wickets_taken > 0 && `${match.wickets_taken}/${match.runs_conceded}`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function StatBox({ label, value, icon }: { label: string, value: string | number, icon: any }) {
    return (
        <div className="card" style={{ padding: '20px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--primary-color)', opacity: 0.8 }}>{icon}</div>
            <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>{label}</div>
            </div>
        </div>
    );
}

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    );
}
