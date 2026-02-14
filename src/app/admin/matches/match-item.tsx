'use client';

import { useState } from 'react';
import { updateMatchResult, deleteMatch } from './actions';
import Link from 'next/link';
import { Save, Edit2, Trash2, Calendar, MapPin, CheckCircle, Clock, Activity, PlayCircle } from 'lucide-react';
import { formatTime12Hour } from '@/lib/utils';

export default function MatchItem({ match }: { match: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
                            <input type="date" name="date" defaultValue={match.date} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Time</label>
                            <input type="time" name="time" defaultValue={match.time || '14:00'} style={inputStyle} />
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {match.time ? formatTime12Hour(match.time) : 'TBD'}</span>
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

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <Link href={`/admin/matches/${match.id}/scorecard`} style={{ ...actionBtn, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>
                    <PlayCircle size={14} /> Live Scorer
                </Link>
                <button onClick={() => setIsEditing(true)} style={actionBtn}>
                    <Edit2 size={14} /> Edit
                </button>

                {isDeleting ? (
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', background: 'rgba(255, 82, 82, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#ff5252', marginRight: '4px' }}>Sure?</span>
                        <button
                            onClick={async () => {
                                setIsDeleting(false); // Optimistic UI
                                await deleteMatch(match.id);
                            }}
                            style={{ ...actionBtn, background: '#ff5252', color: 'white', borderColor: '#ff5252', padding: '4px 8px', fontSize: '0.8rem' }}
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => setIsDeleting(false)}
                            style={{ ...actionBtn, padding: '4px 8px', fontSize: '0.8rem' }}
                        >
                            No
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsDeleting(true)} style={{ ...actionBtn, color: '#ff5252', borderColor: 'rgba(255, 82, 82, 0.3)' }}>
                        <Trash2 size={14} /> Delete
                    </button>
                )}
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

const actionBtn = {
    background: 'rgba(255,255,255,0.05)',
    color: '#ccc',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
};
