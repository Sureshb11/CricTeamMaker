import db from '@/lib/db';
import Link from 'next/link';
import { Users, PlayCircle, Trophy, Dices, BarChart2 } from 'lucide-react';

async function getStats() {
    try {
        const playerResult = await db.execute('SELECT COUNT(*) as count FROM registrations');
        const matchResult = await db.execute('SELECT COUNT(*) as count FROM matches');
        const recentPlayers = await db.execute('SELECT full_name, team_name, created_at FROM registrations ORDER BY id DESC LIMIT 5');

        return {
            totalPlayers: Number(playerResult.rows[0].count),
            totalMatches: Number(matchResult.rows[0].count),
            recentPlayers: recentPlayers.rows as any[]
        };
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return {
            totalPlayers: 0,
            totalMatches: 0,
            recentPlayers: []
        };
    }
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Dashboard Overview</h1>
                <p style={{ color: '#888' }}>Welcome back, Admin. Here's what's happening today.</p>
            </div>

            {/* Stats Overview */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '12px' }}>
                        <Users size={32} color="var(--primary-color)" />
                    </div>
                    <div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Total Players</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-color)' }}>{stats.totalPlayers}</div>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'rgba(108, 92, 231, 0.1)', borderRadius: '12px' }}>
                        <PlayCircle size={32} color="#6c5ce7" />
                    </div>
                    <div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Total Matches</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#6c5ce7' }}>{stats.totalMatches}</div>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '12px' }}>
                        <Trophy size={32} color="#ffd700" />
                    </div>
                    <div>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>Teams Created</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffd700' }}>Active</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Recent Registrations */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Recent Registrations</h3>
                        <Link href="/admin/players" style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>View All</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats.recentPlayers.length > 0 ? stats.recentPlayers.map((player, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{player.full_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{player.team_name}</div>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#444' }}>
                                    {player.created_at ? new Date(player.created_at).toLocaleDateString() : 'Just now'}
                                </div>
                            </div>
                        )) : (
                            <p style={{ color: '#444', textAlign: 'center' }}>No recent players.</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link href="/admin/generator" style={{ ...actionBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Dices size={18} /> Shuffle Teams
                        </Link>
                        <Link href="/admin/matches" style={{ ...actionBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <PlayCircle size={18} /> Add Match
                        </Link>
                        <Link href="/admin/stats" style={{ ...actionBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <BarChart2 size={18} /> Update Stats
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

const actionBtn = {
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    textAlign: 'center' as const,
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textDecoration: 'none',
    color: 'inherit'
};
