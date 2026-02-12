'use client';

import { useState } from 'react';
import { updateMatchResult, deleteMatch } from './actions';

export default function MatchItem({ match }: { match: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (isEditing) {
        return (
            <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '8px', marginBottom: '10px', border: '1px solid var(--primary-color)' }}>
                <form action={async (formData) => {
                    setIsLoading(true);
                    await updateMatchResult(formData);
                    setIsLoading(false);
                    setIsEditing(false);
                }}>
                    <input type="hidden" name="id" value={match.id} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Home Team</label>
                            <input name="home_team" defaultValue={match.home_team || 'DVS TEAM'} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Away Team</label>
                            <input name="away_team" defaultValue={match.away_team || match.opponent} style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Date</label>
                            <input name="date" defaultValue={match.date} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Venue</label>
                            <input name="venue" defaultValue={match.venue} style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Result</label>
                            <select name="result" defaultValue={match.result || ''} style={inputStyle}>
                                <option value="">Pending</option>
                                <option value="Won">Won</option>
                                <option value="Lost">Lost</option>
                                <option value="Draw">Draw</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Score/Summary</label>
                            <input name="score" defaultValue={match.score} placeholder="e.g. Won by 20 runs" style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" disabled={isLoading} style={saveBtnStyle}>
                            {isLoading ? 'Saving...' : '💾 Save Changes'}
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)} style={cancelBtnStyle}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#1a1a1a',
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '8px',
            borderLeft: match.result === 'Won' ? '4px solid #00ff88' : match.result === 'Lost' ? '4px solid #ff5252' : '4px solid #888'
        }}>
            <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {match.home_team || 'DVS'} vs {match.away_team || match.opponent}
                </div>
                <div style={{ color: '#888', fontSize: '0.9rem' }}>
                    {match.date} • {match.venue}
                </div>
                {match.score && <div style={{ marginTop: '5px', color: '#ccc' }}>{match.score} ({match.result})</div>}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsEditing(true)} style={editBtnStyle}>
                    ✏️ Edit
                </button>

                <form action={async () => {
                    if (confirm('Delete this match?')) await deleteMatch(match.id);
                }}>
                    <button style={deleteBtnStyle}>
                        ❌
                    </button>
                </form>
            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: '8px',
    background: '#333',
    border: '1px solid #444',
    borderRadius: '4px',
    color: 'white',
    marginTop: '2px'
};

const saveBtnStyle = {
    background: 'var(--primary-color)',
    color: 'black',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

const cancelBtnStyle = {
    background: 'transparent',
    color: '#ccc',
    border: '1px solid #444',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer'
};

const editBtnStyle = {
    background: 'transparent',
    border: '1px solid #444',
    color: 'var(--primary-color)',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer'
};

const deleteBtnStyle = {
    background: 'transparent',
    border: '1px solid #444',
    color: '#ff5252',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer'
};
