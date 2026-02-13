'use client';

import { useState } from 'react';
import { updateTeamAssignments } from './actions';
import {
    Dices,
    Sparkles,
    Save,
    Copy,
    RotateCcw,
    PlayCircle,
    Target,
    Zap,
    Star,
    Check,
    Users
} from 'lucide-react';

export default function TeamGenerator({ players, availableTeams }: { players: any[], availableTeams: string[] }) {
    const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
    const [teams, setTeams] = useState<any[][]>([]);
    const [teamCount, setTeamCount] = useState(2);
    const [teamNames, setTeamNames] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [revealedCount, setRevealedCount] = useState(0);
    const [isRevealing, setIsRevealing] = useState(false);
    const [isAllRevealed, setIsAllRevealed] = useState(false);

    // Initialize defaults or handle custom names
    const getTeamName = (index: number) => {
        if (teamNames[index]) return teamNames[index];
        return availableTeams[index] || `Team ${index + 1}`;
    };

    const togglePlayer = (id: number) => {
        setSelectedPlayers(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        const allIds = players.map(p => p.id);
        if (selectedPlayers.length === allIds.length) {
            setSelectedPlayers([]);
        } else {
            setSelectedPlayers(allIds);
        }
    };
    const clearSelection = () => setSelectedPlayers([]);

    const generateTeams = () => {
        if (selectedPlayers.length === 0) return alert('Select players first!');

        setIsShuffling(true);
        setGenerated(false);
        setRevealedCount(0);

        // Simulate shuffle time for fun
        setTimeout(() => {
            const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
            const newTeams: any[][] = Array.from({ length: teamCount }, () => []);
            shuffled.forEach((playerId, index) => {
                const player = players.find(p => p.id === playerId);
                newTeams[index % teamCount].push(player);
            });

            const currentNames = [...teamNames];
            for (let i = 0; i < teamCount; i++) {
                if (!currentNames[i]) currentNames[i] = getTeamName(i);
            }
            setTeamNames(currentNames);
            setTeams(newTeams);
            setGenerated(true);
            setIsShuffling(false);
        }, 1500);
    };

    const revealPlayers = () => {
        if (isRevealing || isAllRevealed) return;
        setIsRevealing(true);
        let count = 0;
        const total = selectedPlayers.length;

        const interval = setInterval(() => {
            count++;
            setRevealedCount(count);
            if (count >= total) {
                clearInterval(interval);
                setIsRevealing(false);
                setIsAllRevealed(true);
            }
        }, 200);
    };

    const saveTeams = async () => {
        if (!confirm('This will update the database and change teams for everyone. Proceed?')) return;

        setIsSaving(true);
        const assignments: { playerId: number, teamName: string }[] = [];

        teams.forEach((team, index) => {
            const teamName = teamNames[index] || `Team ${index + 1}`;
            team.forEach(player => {
                assignments.push({ playerId: player.id, teamName });
            });
        });

        const result = await updateTeamAssignments(assignments);
        setIsSaving(false);

        if (result.success) {
            alert('Teams updated successfully!');
        } else {
            alert('Failed to update teams.');
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Dices size={28} /> Team Generator
                </h1>
                <p style={{ color: '#888', marginTop: '5px' }}>Randomly shuffle players into balanced teams</p>
            </div>

            {/* Controls */}
            <div className="card" style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={selectAll} style={secondaryBtn}>Select All</button>
                        <button onClick={clearSelection} style={secondaryBtn}>Clear</button>
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                        <span style={{ color: '#888' }}>Selected Players: </span>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{selectedPlayers.length}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px', marginBottom: '25px' }}>
                    <div>
                        <label style={labelStyle}>Number of Teams</label>
                        <select
                            value={teamCount}
                            onChange={(e) => setTeamCount(Number(e.target.value))}
                            style={inputStyle}
                        >
                            <option value="2">2 Teams</option>
                            <option value="3">3 Teams</option>
                            <option value="4">4 Teams</option>
                        </select>
                    </div>
                    {Array.from({ length: teamCount }).map((_, i) => (
                        <div key={i}>
                            <label style={labelStyle}>Team {i + 1} Name</label>
                            <select
                                value={teamNames[i] || (availableTeams[i] ? availableTeams[i] : '')}
                                onChange={(e) => {
                                    const newNames = [...teamNames];
                                    newNames[i] = e.target.value;
                                    setTeamNames(newNames);
                                }}
                                style={{ ...inputStyle, width: '180px' }}
                            >
                                <option value="" disabled>Select Team</option>
                                {availableTeams.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                                <option value={`Team ${i + 1}`}>Custom: Team {i + 1}</option>
                            </select>
                        </div>
                    ))}
                </div>

                <button onClick={generateTeams} style={{ ...primaryBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Dices size={20} /> Shuffle & Generate Teams
                </button>
            </div>

            {/* Generated Teams Display */}
            {generated && (
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>Teams Ready!</h2>
                            {!isAllRevealed && !isRevealing && (
                                <button
                                    onClick={revealPlayers}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '12px 24px',
                                        fontSize: '1rem',
                                        fontWeight: '800',
                                        background: 'linear-gradient(135deg, #00ff88 0%, #00ccff 100%)',
                                        color: 'black',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)',
                                        animation: 'pulse 1.5s infinite'
                                    }}
                                >
                                    <Sparkles size={20} /> Start Reveal
                                </button>
                            )}
                            {isRevealing && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="loader-dots"></div>
                                    <span style={{ fontSize: '1rem', color: '#00ff88', fontWeight: 'bold' }}>
                                        Uncovering Lineups...
                                    </span>
                                </div>
                            )}
                            {isAllRevealed && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ fontSize: '1.2rem', animation: 'bounce 0.5s ease', fontWeight: 'bold', color: '#00ff88', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Sparkles size={20} /> REVEALED!
                                    </span>
                                    <button
                                        onClick={() => {
                                            const text = teams.map((team, i) => {
                                                const playersText = team.map(p => `- ${p.full_name} (${p.playing_role})`).join('\n');
                                                return `${teamNames[i]}:\n${playersText}`;
                                            }).join('\n\n');
                                            navigator.clipboard.writeText(text);
                                            alert('Teams copied to clipboard!');
                                        }}
                                        style={{ ...secondaryBtn, background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', borderColor: 'rgba(0, 255, 136, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Copy size={16} /> Copy Teams
                                    </button>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={generateTeams} style={{ ...secondaryBtn, border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <RotateCcw size={16} /> Re-Shuffle
                            </button>
                            <button
                                onClick={saveTeams}
                                disabled={isSaving || !isAllRevealed}
                                style={{
                                    ...primaryBtn,
                                    padding: '10px 24px',
                                    fontSize: '0.9rem',
                                    width: 'auto',
                                    opacity: !isAllRevealed ? 0.3 : 1,
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {isSaving ? 'Saving...' : <><Save size={16} /> Save Teams</>}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`, gap: '20px' }}>
                        {teams.map((team, index) => {
                            const batters = team.filter(p => p.playing_role?.includes('Batsman') || p.playing_role?.includes('keeper'));
                            const allRounders = team.filter(p => p.playing_role?.toLowerCase().includes('all-rounder'));
                            const bowlers = team.filter(p => !batters.includes(p) && !allRounders.includes(p));

                            return (
                                <div key={index} className="card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '15px' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary-color)' }}>{teamNames[index]}</h3>
                                            {isAllRevealed && (
                                                <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    Strength: {Array.from({ length: 3 + (index % 3) }).map((_, i) => <Star key={i} size={8} fill="currentColor" />)}
                                                </div>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>({team.length} players)</span>
                                    </div>

                                    {/* Batters */}
                                    {batters.length > 0 && (
                                        <div style={{ marginBottom: '15px' }}>
                                            <div style={{ ...roleHeader, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <PlayCircle size={12} /> Batters
                                            </div>
                                            <div style={playerList}>
                                                {batters.map((player) => {
                                                    const globalIdx = teams.slice(0, index).flat().length + team.indexOf(player);
                                                    const isRevealed = revealedCount > globalIdx;
                                                    return (
                                                        <div key={player.id} className={isRevealed ? 'player-revealed' : 'player-masked'} style={{
                                                            ...playerItem,
                                                            position: 'relative'
                                                        }}>
                                                            {isRevealed ? player.full_name : <span style={{ opacity: 0.3 }}>••••••••••••</span>}
                                                            {!isRevealed && <div className="shimmer-effect"></div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* All-Rounders */}
                                    {allRounders.length > 0 && (
                                        <div style={{ marginBottom: '15px' }}>
                                            <div style={{ ...roleHeader, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Zap size={12} /> All-Rounders
                                            </div>
                                            <div style={playerList}>
                                                {allRounders.map((player) => {
                                                    const globalIdx = teams.slice(0, index).flat().length + team.indexOf(player);
                                                    const isRevealed = revealedCount > globalIdx;
                                                    return (
                                                        <div key={player.id} className={isRevealed ? 'player-revealed' : 'player-masked'} style={{
                                                            ...playerItem,
                                                            position: 'relative'
                                                        }}>
                                                            {isRevealed ? player.full_name : <span style={{ opacity: 0.3 }}>••••••••••••</span>}
                                                            {!isRevealed && <div className="shimmer-effect"></div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bowlers */}
                                    {bowlers.length > 0 && (
                                        <div style={{ marginBottom: '5px' }}>
                                            <div style={{ ...roleHeader, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Target size={12} /> Bowlers
                                            </div>
                                            <div style={playerList}>
                                                {bowlers.map((player) => {
                                                    const globalIdx = teams.slice(0, index).flat().length + team.indexOf(player);
                                                    const isRevealed = revealedCount > globalIdx;
                                                    return (
                                                        <div key={player.id} className={isRevealed ? 'player-revealed' : 'player-masked'} style={{
                                                            ...playerItem,
                                                            position: 'relative'
                                                        }}>
                                                            {isRevealed ? player.full_name : <span style={{ opacity: 0.3 }}>••••••••••••</span>}
                                                            {!isRevealed && <div className="shimmer-effect"></div>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* List for Selection */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={20} /> Select Players for Shuffling
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                    {players.map(player => (
                        <div
                            key={player.id}
                            onClick={() => togglePlayer(player.id)}
                            style={{
                                padding: '12px',
                                background: selectedPlayers.includes(player.id) ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                border: selectedPlayers.includes(player.id) ? '1px solid var(--primary-color)' : '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '4px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: selectedPlayers.includes(player.id) ? 'var(--primary-color)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'black',
                                fontSize: '10px'
                            }}>
                                {selectedPlayers.includes(player.id) && <Check size={12} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{player.full_name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#666' }}>{player.playing_role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isShuffling && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '20px',
                        animation: 'spin 0.5s linear infinite'
                    }}>
                        <Dices size={64} color="var(--primary-color)" />
                    </div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'var(--primary-color)',
                        letterSpacing: '4px',
                        textTransform: 'uppercase'
                    }}>Shuffling Teams...</div>
                    <style>{`
                        @keyframes spin {
                            0% { transform: scale(1) rotate(0deg); }
                            50% { transform: scale(1.2) rotate(180deg); }
                            100% { transform: scale(1) rotate(360deg); }
                        }
                        @keyframes pulse {
                            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
                            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(0, 255, 136, 0); }
                            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
                        }
                        @keyframes bounce {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-10px); }
                        }
                        .player-masked {
                            background: rgba(255, 255, 255, 0.05) !important;
                            overflow: hidden;
                        }
                        .shimmer-effect {
                            position: absolute;
                            top: 0; left: -100%;
                            width: 100%; height: 100%;
                            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
                            animation: shimmer 2s infinite;
                        }
                        @keyframes shimmer {
                            100% { left: 100%; }
                        }
                        .player-revealed {
                            animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                            background: rgba(0, 255, 136, 0.05) !important;
                            border-color: rgba(0, 255, 136, 0.2) !important;
                        }
                        @keyframes popIn {
                            0% { transform: scale(0.8); opacity: 0; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                        .loader-dots {
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            border: 2px solid #00ff88;
                            border-top-color: transparent;
                            animation: spin 1s linear infinite;
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    fontWeight: 'bold' as const,
};

const inputStyle = {
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'white',
    width: '150px',
    fontSize: '0.9rem',
};

const primaryBtn = {
    background: 'var(--primary-color)',
    color: 'black',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '10px',
    fontWeight: '800',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    width: '100%',
};

const secondaryBtn = {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#ccc',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600' as const,
};

const roleHeader = {
    color: '#888',
    fontSize: '0.7rem',
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
    letterSpacing: '1px',
};

const playerList = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
};

const playerItem = {
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '6px',
    fontSize: '0.9rem',
    border: '1px solid rgba(255,255,255,0.05)',
};
