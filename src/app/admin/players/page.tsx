import db from '@/lib/db';
import styles from '@/app/register/page.module.css';
import DeletePlayerButton from './delete-button';
import { getSession } from '@/lib/session';
import { toggleAdminRole } from './actions';
import { User, Shield, ShieldCheck, Phone, Settings, UserPlus, UserMinus, Crown } from 'lucide-react';

async function getPlayers() {
    const result = await db.execute('SELECT * FROM registrations ORDER BY id DESC');
    return result.rows as any[];
}

async function getCurrentUser() {
    const session = await getSession();
    if (!session) return null;
    const result = await db.execute({
        sql: 'SELECT role FROM registrations WHERE id = ?',
        args: [session.userId]
    });
    return result.rows[0] as any;
}

export default async function ManagePlayers() {
    const players = await getPlayers();
    const currentUser = await getCurrentUser();
    const isSuperAdmin = currentUser?.role === 'super_admin';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Manage Players</h1>
                    <p style={{ color: '#888', marginTop: '5px' }}>View and manage all registered members</p>
                </div>
                <div className="card" style={{ padding: '10px 20px', borderRadius: '10px' }}>
                    <span style={{ color: '#888' }}>Total: </span>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{players.length}</span>
                </div>
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
                                        <Shield size={14} /> Team
                                    </div>
                                </th>
                                <th style={thStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShieldCheck size={14} /> Role
                                    </div>
                                </th>
                                <th style={thStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Phone size={14} /> Contact
                                    </div>
                                </th>
                                <th style={thStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Settings size={14} /> Actions
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(player => (
                                <tr key={player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '35px',
                                                height: '35px',
                                                borderRadius: '50%',
                                                background: '#222',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden'
                                            }}>
                                                {player.photo_url ? (
                                                    <img src={player.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <User size={16} />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {player.full_name}
                                                    {player.role === 'super_admin' && <Crown size={12} color="#FFD700" fill="#FFD700" />}
                                                </div>
                                                {player.role === 'admin' && (
                                                    <span style={{ fontSize: '0.65rem', background: 'var(--primary-color)', color: 'black', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold' }}>ADMIN</span>
                                                )}
                                                {player.role === 'super_admin' && (
                                                    <span style={{ fontSize: '0.65rem', background: 'linear-gradient(45deg, #FFD700, #FFA500)', color: 'black', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold' }}>SUPER USER</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>{player.team_name}</td>
                                    <td style={tdStyle}>
                                        <span style={{ color: '#aaa', fontSize: '0.8rem' }}>{player.playing_role}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: '0.85rem' }}>{player.email}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#555' }}>{player.phone}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {isSuperAdmin && player.role !== 'super_admin' && (
                                                <form action={async () => {
                                                    'use server';
                                                    await toggleAdminRole(player.id);
                                                }}>
                                                    <button
                                                        title={player.role === 'admin' ? "Remove Admin" : "Make Admin"}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: player.role === 'admin' ? '#ff4444' : 'var(--primary-color)',
                                                            padding: '4px'
                                                        }}
                                                    >
                                                        {player.role === 'admin' ? <UserMinus size={16} /> : <UserPlus size={16} />}
                                                    </button>
                                                </form>
                                            )}

                                            {/* Disable delete for Super Admin target, or if current user is not Super Admin trying to delete Admin */}
                                            <DeletePlayerButton
                                                id={player.id}
                                                disabled={
                                                    player.role === 'super_admin' ||
                                                    (player.role === 'admin' && !isSuperAdmin)
                                                }
                                            />
                                        </div>
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
