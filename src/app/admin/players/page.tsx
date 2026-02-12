import db from '@/lib/db';
import styles from '@/app/register/page.module.css';
import DeletePlayerButton from './delete-button';

async function getPlayers() {
    const result = await db.execute('SELECT * FROM registrations ORDER BY id DESC');
    return result.rows as any[];
}

export default async function ManagePlayers() {
    const players = await getPlayers();

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 className={styles.sectionTitle} style={{ margin: 0 }}>Manage Players</h1>
                <div style={{ color: '#888' }}>Total Players: {players.length}</div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: '#222', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th style={{ padding: '15px' }}>Name</th>
                            <th style={{ padding: '15px' }}>Team</th>
                            <th style={{ padding: '15px' }}>Role</th>
                            <th style={{ padding: '15px' }}>Email</th>
                            <th style={{ padding: '15px' }}>Phone</th>
                            <th style={{ padding: '15px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map(player => (
                            <tr key={player.id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '15px', color: '#666' }}>{player.id}</td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {player.photo_url && (
                                            <img src={player.photo_url} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                                        )}
                                        {player.full_name}
                                        {player.role === 'admin' && <span style={{ fontSize: '0.7rem', background: '#00ff88', color: 'black', padding: '2px 6px', borderRadius: '4px' }}>ADMIN</span>}
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>{player.team_name}</td>
                                <td style={{ padding: '15px' }}>{player.playing_role}</td>
                                <td style={{ padding: '15px' }}>{player.email}</td>
                                <td style={{ padding: '15px' }}>{player.phone}</td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <DeletePlayerButton id={player.id} disabled={player.role === 'admin'} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
