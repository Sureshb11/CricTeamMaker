'use client';

import { useState } from 'react';
import { updateMatchResult, deleteMatch } from './actions';
import { Save, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';

export default function MatchItem({ match }: { match: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (isEditing) {
        return (
            <div className="card" style={{ border: '1px solid var(--primary-color)' }}>
                <form action={async (formData) => {
                    setIsLoading(true);
                    await updateMatchResult(formData);
                    setIsLoading(false);
                    setIsEditing(false);
                }}>
                    <input type="hidden" name="id" value={match.id} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={labelStyle}>Home Team</label>
                            <input name="home_team" defaultValue={match.home_team || 'DVS TEAM'} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Away Team</label>
                            <input name="away_team" defaultValue={match.away_team || match.opponent} style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={labelStyle}>Date</label>
                            <input name="date" defaultValue={match.date} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Venue</label>
                            <input name="venue" defaultValue={match.venue} style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <label style={labelStyle}>Result</label>
                            <select name="result" defaultValue={match.result || ''} style={inputStyle}>
                                <option value="">Pending</option>
                                <option value="Won">Won</option>
                                <option value="Lost">Lost</option>
                                <option value="Draw">Draw</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Score Summary</label>
                            <input name="score" defaultValue={match.score} placeholder="e.g. Won by 20 runs" style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" disabled={isLoading} style={{ ...saveBtnStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isLoading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)} style={cancelBtnStyle}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    const resultColor = match.result === 'Won' ? 'var(--primary-color)' : match.result === 'Lost' ? '#ff5252' : '#888';

    return (
        <div className="card" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeft: `4px solid ${resultColor}`
        }}>
            <div>
                <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'white' }}>
                    {match.home_team || 'DVS'} <span style={{ color: '#444', fontSize: '1rem', fontStyle: 'italic' }}>vs</span> {match.away_team || match.opponent}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {match.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {match.venue}</span>
                </div>
                {match.score && (
                    <div style={{
                        marginTop: '10px',
                        fontSize: '0.9rem',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        display: 'inline-block',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <span style={{ color: resultColor, fontWeight: 'bold' }}>{match.result}</span>: {match.score}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsEditing(true)} style={editBtnStyle}>
                    <Edit2 size={16} />
                </button>

                <form action={async () => {
                    if (confirm('Delete this match?')) await deleteMatch(match.id);
                }}>
                    <button style={deleteBtnStyle}>
                        <Trash2 size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '5px',
    textTransform: 'uppercase' as const,
    fontWeight: 'bold',
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'white',
};

const saveBtnStyle = {
    background: 'var(--primary-color)',
    color: 'black',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
};

const cancelBtnStyle = {
    background: 'transparent',
    color: '#888',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
};

const editBtnStyle = {
    background: 'rgba(0, 255, 136, 0.05)',
    border: '1px solid rgba(0, 255, 136, 0.1)',
    color: 'var(--primary-color)',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
};

const deleteBtnStyle = {
    background: 'rgba(255, 82, 82, 0.05)',
    border: '1px solid rgba(255, 82, 82, 0.1)',
    color: '#ff5252',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
};
