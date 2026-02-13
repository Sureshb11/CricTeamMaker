'use client';

import { useState, useEffect } from 'react';
import { Search, ArrowRightLeft, Trophy, Activity, Target, Hash, Percent } from 'lucide-react';
import PlayerAvatar from '@/components/PlayerAvatar';

export default function ComparePage() {
    const [players, setPlayers] = useState<any[]>([]);
    const [player1Id, setPlayer1Id] = useState<string>('');
    const [player2Id, setPlayer2Id] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all players for the dropdowns
        fetch('/api/players')
            .then(res => res.json())
            .then(data => {
                setPlayers(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const player1 = players.find(p => p.id.toString() === player1Id);
    const player2 = players.find(p => p.id.toString() === player2Id);

    const StatRow = ({ label, val1, val2, icon, higherBetter = true }: any) => {
        const v1 = Number(val1) || 0;
        const v2 = Number(val2) || 0;
        const highlight1 = higherBetter ? v1 > v2 : v1 < v2;
        const highlight2 = higherBetter ? v2 > v1 : v2 < v1;
        const isEqual = v1 === v2;

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', gap: '10px', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                <div style={{ textAlign: 'right', fontWeight: highlight1 ? 'bold' : 'normal', color: highlight1 ? 'var(--primary-color)' : 'white', fontSize: highlight1 ? '1.1rem' : '1rem' }}>
                    {val1}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    {icon} {label}
                </div>
                <div style={{ textAlign: 'left', fontWeight: highlight2 ? 'bold' : 'normal', color: highlight2 ? 'var(--primary-color)' : 'white', fontSize: highlight2 ? '1.1rem' : '1rem' }}>
                    {val2}
                </div>
            </div>
        );
    };

    return (
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '50px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                <ArrowRightLeft size={32} color="var(--primary-color)" /> Player Comparison
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'start', marginBottom: '40px' }}>
                {/* Player 1 Selector */}
                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <select
                            value={player1Id}
                            onChange={(e) => setPlayer1Id(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            <option value="">Select Player 1</option>
                            {players.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                        </select>
                    </div>
                    {player1 ? (
                        <>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 15px', overflow: 'hidden', border: '3px solid var(--primary-color)' }}>
                                <PlayerAvatar src={player1.photo_url} alt={player1.full_name} fallbackName={player1.full_name} />
                            </div>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{player1.full_name}</h2>
                            <div style={{ color: '#888', fontSize: '0.9rem' }}>{player1.playing_role}</div>
                            <div style={{ color: '#666', fontSize: '0.8rem' }}>{player1.team_name}</div>
                        </>
                    ) : (
                        <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                            <Search size={40} />
                        </div>
                    )}
                </div>

                {/* VS Badge */}
                <div style={{ alignSelf: 'center', background: 'var(--primary-color)', color: 'black', fontWeight: '900', padding: '10px 15px', borderRadius: '50%', fontSize: '1.2rem', boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)' }}>
                    VS
                </div>

                {/* Player 2 Selector */}
                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <select
                            value={player2Id}
                            onChange={(e) => setPlayer2Id(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            <option value="">Select Player 2</option>
                            {players.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                        </select>
                    </div>
                    {player2 ? (
                        <>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 15px', overflow: 'hidden', border: '3px solid var(--primary-color)' }}>
                                <PlayerAvatar src={player2.photo_url} alt={player2.full_name} fallbackName={player2.full_name} />
                            </div>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{player2.full_name}</h2>
                            <div style={{ color: '#888', fontSize: '0.9rem' }}>{player2.playing_role}</div>
                            <div style={{ color: '#666', fontSize: '0.8rem' }}>{player2.team_name}</div>
                        </>
                    ) : (
                        <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                            <Search size={40} />
                        </div>
                    )}
                </div>
            </div>

            {/* Comparison Stats */}
            {player1 && player2 && (
                <div className="card" style={{ padding: '30px' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>Head to Head Stats</h3>

                    <StatRow label="Matches" val1={player1.matches_played} val2={player2.matches_played} icon={<Activity size={14} />} />
                    <StatRow label="Runs" val1={player1.total_runs} val2={player2.total_runs} icon={<Hash size={14} />} />
                    <StatRow label="High Score" val1={player1.highest_score} val2={player2.highest_score} icon={<Trophy size={14} />} />
                    <StatRow label="Wickets" val1={player1.total_wickets} val2={player2.total_wickets} icon={<Target size={14} />} />
                    {/* Calculate Average if needed, guarding against division by zero */}
                    <StatRow
                        label="Runs / Match"
                        val1={(player1.total_runs / (player1.matches_played || 1)).toFixed(1)}
                        val2={(player2.total_runs / (player2.matches_played || 1)).toFixed(1)}
                        icon={<Percent size={14} />}
                    />
                    <StatRow
                        label="Wickets / Match"
                        val1={(player1.total_wickets / (player1.matches_played || 1)).toFixed(1)}
                        val2={(player2.total_wickets / (player2.matches_played || 1)).toFixed(1)}
                        icon={<Percent size={14} />}
                    />
                </div>
            )}
        </div>
    );
}
