'use client';

import { useState } from 'react';
import { saveMatchScorecard } from '../../actions';
import { User, Activity, Trash2, Save, Plus } from 'lucide-react';

export default function ScorecardForm({ matchId, players }: { matchId: number, players: any[] }) {
    const [entries, setEntries] = useState<any[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState('');

    const addEntry = () => {
        if (!selectedPlayer) return;
        const player = players.find(p => p.id === Number(selectedPlayer));
        if (!player) return;

        // Prevent duplicate entries
        if (entries.find(e => e.player_id === player.id)) {
            alert('Player already added!');
            return;
        }

        setEntries([...entries, {
            player_id: player.id,
            name: player.full_name,
            runs_scored: 0,
            balls_faced: 0,
            wickets_taken: 0,
            overs_bowled: 0,
            runs_conceded: 0,
            is_out: false
        }]);
        setSelectedPlayer('');
    };

    const updateEntry = (index: number, field: string, value: any) => {
        const newEntries = [...entries];
        newEntries[index][field] = value;
        setEntries(newEntries);
    };

    const removeEntry = (index: number) => {
        const newEntries = [...entries];
        newEntries.splice(index, 1);
        setEntries(newEntries);
    };

    return (
        <div className="card">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Activity size={24} /> Match Scorecard
            </h2>

            {/* Player Selection */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    style={selectStyle}
                >
                    <option value="">Select Player</option>
                    {players.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.full_name} ({p.role})
                        </option>
                    ))}
                </select>
                <button onClick={addEntry} style={addBtn}>
                    <Plus size={18} /> Add Player
                </button>
            </div>

            {/* Scorecard Table */}
            {entries.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <form action={async () => {
                        if (confirm('Save scorecard? This will update player totals.')) {
                            await saveMatchScorecard(matchId, entries);
                        }
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                    <th style={thStyle}>Player</th>
                                    <th style={thStyle}>Runs</th>
                                    <th style={thStyle}>Balls</th>
                                    <th style={thStyle}>Out?</th>
                                    <th style={thStyle}>Wickets</th>
                                    <th style={thStyle}>Overs</th>
                                    <th style={thStyle}>Runs Given</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, index) => (
                                    <tr key={entry.player_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={14} /> {entry.name}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <input
                                                type="number"
                                                value={entry.runs_scored}
                                                onChange={(e) => updateEntry(index, 'runs_scored', Number(e.target.value))}
                                                style={inputStyle}
                                                min="0"
                                            />
                                        </td>
                                        <td style={tdStyle}>
                                            <input
                                                type="number"
                                                value={entry.balls_faced}
                                                onChange={(e) => updateEntry(index, 'balls_faced', Number(e.target.value))}
                                                style={inputStyle}
                                                min="0"
                                            />
                                        </td>
                                        <td style={tdStyle}>
                                            <input
                                                type="checkbox"
                                                checked={entry.is_out}
                                                onChange={(e) => updateEntry(index, 'is_out', e.target.checked)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td style={tdStyle}>
                                            <input
                                                type="number"
                                                value={entry.wickets_taken}
                                                onChange={(e) => updateEntry(index, 'wickets_taken', Number(e.target.value))}
                                                style={inputStyle}
                                                min="0"
                                            />
                                        </td>
                                        <td style={tdStyle}>
                                            <input
                                                type="number"
                                                value={entry.overs_bowled}
                                                onChange={(e) => updateEntry(index, 'overs_bowled', Number(e.target.value))}
                                                style={inputStyle}
                                                min="0"
                                                step="0.1"
                                            />
                                        </td>
                                        <td style={tdStyle}>
                                            <input
                                                type="number"
                                                value={entry.runs_conceded}
                                                onChange={(e) => updateEntry(index, 'runs_conceded', Number(e.target.value))}
                                                style={inputStyle}
                                                min="0"
                                            />
                                        </td>
                                        <td style={tdStyle}>
                                            <button type="button" onClick={() => removeEntry(index)} style={deleteBtn}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" style={saveBtn}>
                                <Save size={18} /> Save Scorecard & Update Stats
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No players added to scorecard yet.
                </div>
            )}
        </div>
    );
}

const selectStyle = {
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'white',
    flex: 1,
    fontSize: '0.9rem'
};

const inputStyle = {
    width: '60px',
    padding: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: '6px',
    fontSize: '0.9rem',
    textAlign: 'center' as const
};

const addBtn = {
    padding: '10px 20px',
    background: 'var(--primary-color)',
    color: 'black',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
} as const;

const saveBtn = {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00ff88 0%, #00ccff 100%)',
    color: 'black',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1rem'
} as const;

const deleteBtn = {
    background: 'transparent',
    border: 'none',
    color: '#ff5252',
    cursor: 'pointer',
    padding: '5px'
};

const thStyle = {
    padding: '12px',
    color: '#888',
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    fontWeight: '600'
};

const tdStyle = {
    padding: '12px'
};
