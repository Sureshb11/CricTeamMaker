import db from '@/lib/db';
import { updatePlayerStats } from './actions';
import { User, PlayCircle, Hash, Target, Flame, Award, Save } from 'lucide-react';

async function getPlayers() {
    const result = await db.execute('SELECT * FROM registrations ORDER BY id ASC');
    return result.rows as any[];
}

export default async function ManageStats() {
    const players = await getPlayers();

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Player Stats Manager</h1>
                <p style={{ color: '#888', marginTop: '5px' }}>Update Season performance for all players</p>
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
                                <th style={thStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Save size={14} /> Action
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(player => (
                                <tr key={player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <form action={async (formData) => {
                                        'use server';
                                        await updatePlayerStats(formData);
                                    }}>
                                        <input type="hidden" name="id" value={player.id} />
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: '600' }}>{player.full_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>{player.playing_role}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <input type="number" name="matches_played" defaultValue={player.matches_played || 0} style={statInput} />
                                        </td>
                                        <td style={tdStyle}>
                                            <input type="number" name="total_runs" defaultValue={player.total_runs || 0} style={statInput} />
                                        </td>
                                        <td style={tdStyle}>
                                            <input type="number" name="total_wickets" defaultValue={player.total_wickets || 0} style={statInput} />
                                        </td>
                                        <td style={tdStyle}>
                                            <input type="number" name="highest_score" defaultValue={player.highest_score || 0} style={statInput} />
                                        </td>
                                        <td style={tdStyle}>
                                            <input type="text" name="best_bowling" defaultValue={player.best_bowling || ''} placeholder="3/24" style={{ ...statInput, width: '80px' }} />
                                        </td>
                                        <td style={tdStyle}>
                                            <button type="submit" style={saveBtn}>
                                                Save
                                            </button>
                                        </td>
                                    </form>
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
    background: 'rgba(0, 255, 136, 0.1)',
    color: 'var(--primary-color)',
    border: '1px solid rgba(0, 255, 136, 0.2)',
    padding: '6px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    fontSize: '0.8rem',
};
