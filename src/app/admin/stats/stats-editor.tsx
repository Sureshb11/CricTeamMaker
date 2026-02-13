'use client';

import { useState } from 'react';
import { updateBulkStats } from './actions';
import { User, PlayCircle, Hash, Target, Flame, Award, Save, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StatsEditor({ initialPlayers }: { initialPlayers: any[] }) {
    const [players, setPlayers] = useState(initialPlayers);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const router = useRouter();

    const handleChange = (index: number, field: string, value: any) => {
        const newPlayers = [...players];
        newPlayers[index] = { ...newPlayers[index], [field]: value };
        setPlayers(newPlayers);
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateBulkStats(players);
        setIsSaving(false);
        if (result.success) {
            alert('All stats updated successfully!');
            setHasChanges(false);
            router.refresh();
        } else {
            alert('Failed to update stats.');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.9rem', color: '#888' }}>
                    {players.length} Players found
                </div>
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    style={{
                        ...saveBtn,
                        opacity: hasChanges ? 1 : 0.5,
                        cursor: hasChanges ? 'pointer' : 'not-allowed',
                        padding: '10px 20px',
                        fontSize: '1rem'
                    }}
                >
                    {isSaving ? (
                        <>Saving...</>
                    ) : (
                        <><Save size={18} /> Save All Changes</>
                    )}
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}>
                                <th style={thStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <User size={14} /> Player
                                    </div>
                                </th>
                                <th style={thStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <PlayCircle size={14} /> Mat
                                    </div>
                                </th>
                                <th style={thStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Hash size={14} /> Runs
                                    </div>
                                </th>
                                <th style={thStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Target size={14} /> Wkts
                                    </div>
                                </th>
                                <th style={thStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Flame size={14} /> HS
                                    </div>
                                </th>
                                <th style={thStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Award size={14} /> Best
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((player, index) => (
                                <tr key={player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '600' }}>{player.full_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{player.playing_role}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <input
                                            type="number"
                                            value={player.matches_played || 0}
                                            onChange={(e) => handleChange(index, 'matches_played', Number(e.target.value))}
                                            style={statInput}
                                        />
                                    </td>
                                    <td style={tdStyle}>
                                        <input
                                            type="number"
                                            value={player.total_runs || 0}
                                            onChange={(e) => handleChange(index, 'total_runs', Number(e.target.value))}
                                            style={statInput}
                                        />
                                    </td>
                                    <td style={tdStyle}>
                                        <input
                                            type="number"
                                            value={player.total_wickets || 0}
                                            onChange={(e) => handleChange(index, 'total_wickets', Number(e.target.value))}
                                            style={statInput}
                                        />
                                    </td>
                                    <td style={tdStyle}>
                                        <input
                                            type="number"
                                            value={player.highest_score || 0}
                                            onChange={(e) => handleChange(index, 'highest_score', Number(e.target.value))}
                                            style={statInput}
                                        />
                                    </td>
                                    <td style={tdStyle}>
                                        <input
                                            type="text"
                                            value={player.best_bowling || ''}
                                            onChange={(e) => handleChange(index, 'best_bowling', e.target.value)}
                                            placeholder="3/24"
                                            style={{ ...statInput, width: '80px' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const thStyle = {
    padding: '15px 20px',
    color: '#888',
    fontWeight: '600',
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
};

const tdStyle = {
    padding: '15px 20px',
};

const statInput = {
    width: '60px',
    padding: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: '6px',
    fontSize: '0.9rem',
    textAlign: 'center' as const,
};

const saveBtn = {
    background: 'var(--primary-color)',
    color: 'black',
    border: 'none',
    padding: '6px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
};
