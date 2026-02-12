'use client';

import { useState } from 'react';
import { updateTeamAssignments } from './actions';

export default function TeamGenerator({ players, availableTeams }: { players: any[], availableTeams: string[] }) {
    const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
    const [teams, setTeams] = useState<any[][]>([]);
    const [teamCount, setTeamCount] = useState(2);
    const [teamNames, setTeamNames] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [generated, setGenerated] = useState(false);

    // Initialize defaults or handle custom names
    const getTeamName = (index: number) => {
        // If user has typed/selected something, use it
        if (teamNames[index]) return teamNames[index];
        // Default to available team if exists for this index, else generic
        return availableTeams[index] || `Team ${index + 1}`;
    };

    // Toggle player selection
    const togglePlayer = (id: number) => {
        setSelectedPlayers(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const selectAll = () => setSelectedPlayers(players.map(p => p.id));
    const clearSelection = () => setSelectedPlayers([]);

    const generateTeams = () => {
        if (selectedPlayers.length === 0) return alert('Select players first!');

        // Shuffle
        const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);

        // Distribute
        const newTeams: any[][] = Array.from({ length: teamCount }, () => []);
        shuffled.forEach((playerId, index) => {
            const player = players.find(p => p.id === playerId);
            newTeams[index % teamCount].push(player);
        });

        // Set default names if not set
        const currentNames = [...teamNames];
        for (let i = 0; i < teamCount; i++) {
            if (!currentNames[i]) currentNames[i] = getTeamName(i);
        }
        setTeamNames(currentNames);

        setTeams(newTeams);
        setGenerated(true);
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
            {/* Controls */}
            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={selectAll} style={secondaryBtn}>Select All</button>
                        <button onClick={clearSelection} style={secondaryBtn}>Clear</button>
                    </div>
                    <div>
                        <span style={{ marginRight: '10px', color: '#ccc' }}>Selected: {selectedPlayers.length}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Number of Teams</label>
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
                            <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Team {i + 1}</label>
                            <select
                                value={teamNames[i] || (availableTeams[i] ? availableTeams[i] : '')}
                                onChange={(e) => {
                                    const newNames = [...teamNames];
                                    newNames[i] = e.target.value;
                                    setTeamNames(newNames);
                                }}
                                style={inputStyle}
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

                <button onClick={generateTeams} style={primaryBtn}>
                    🎲 Shuffle & Generate
                </button>
            </div>

            {/* Generated Teams Display */}
            {generated && (
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0 }}>Generated Teams</h2>
                        <button onClick={saveTeams} disabled={isSaving} style={{ ...primaryBtn, background: isSaving ? '#666' : '#00ff88', color: 'black' }}>
                            {isSaving ? 'Saving...' : '💾 Save & Update Database'}
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${teamCount}, 1fr)`, gap: '20px' }}>
                        {teams.map((team, index) => (
                            <div key={index} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                                <h3 style={{ borderBottom: '1px solid var(--primary-color)', paddingBottom: '10px', marginBottom: '15px' }}>
                                    {teamNames[index]} ({team.length})
                                </h3>
                                {/* Role Stats */}
                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px' }}>
                                    🏏 {team.filter(p => p.playing_role === 'Batsman').length} Batters |
                                    🥎 {team.filter(p => p.playing_role === 'Bowler').length} Bowlers
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    {team.map(player => (
                                        <div key={player.id} style={{ padding: '5px', background: '#222', borderRadius: '4px', fontSize: '0.9rem' }}>
                                            <span style={{ color: 'var(--primary-color)', marginRight: '5px' }}>
                                                {player.playing_role === 'Batsman' ? '🏏' : player.playing_role === 'Bowler' ? '🥎' : '🏏🥎'}
                                            </span>
                                            {player.full_name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* List for Selection */}
            <h3 style={{ marginBottom: '15px' }}>Available Players</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {players.map(player => (
                    <div
                        key={player.id}
                        onClick={() => togglePlayer(player.id)}
                        style={{
                            padding: '10px',
                            background: selectedPlayers.includes(player.id) ? 'rgba(0, 255, 136, 0.2)' : '#1a1a1a',
                            border: selectedPlayers.includes(player.id) ? '1px solid var(--primary-color)' : '1px solid #333',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={selectedPlayers.includes(player.id)}
                            readOnly
                            style={{ pointerEvents: 'none' }}
                        />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{player.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{player.playing_role}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const primaryBtn = {
    background: 'var(--primary-color)',
    color: 'black',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem'
};

const secondaryBtn = {
    background: '#333',
    color: 'white',
    border: '1px solid #555',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer'
};

const inputStyle = {
    padding: '8px',
    background: '#333',
    border: '1px solid #444',
    borderRadius: '4px',
    color: 'white',
    width: '150px'
};
