import db from '@/lib/db';
import { updatePlayerStats } from './actions';
import styles from '@/app/register/page.module.css';

async function getPlayers() {
    const result = await db.execute('SELECT * FROM registrations ORDER BY id ASC');
    return result.rows as any[];
}

export default async function ManageStats() {
    const players = await getPlayers();

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '30px' }}>Player Stats Manager</h1>

            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: '#222', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>Player</th>
                            <th style={{ padding: '10px' }}>Matches</th>
                            <th style={{ padding: '10px' }}>Runs</th>
                            <th style={{ padding: '10px' }}>Wickets</th>
                            <th style={{ padding: '10px' }}>High Score</th>
                            <th style={{ padding: '10px' }}>Best Bowl</th>
                            <th style={{ padding: '10px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map(player => (
                            <tr key={player.id} style={{ borderBottom: '1px solid #333' }}>
                                <form action={updatePlayerStats}>
                                    <input type="hidden" name="id" value={player.id} />
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{player.full_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{player.playing_role}</div>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <input type="number" name="matches_played" defaultValue={player.matches_played || 0} style={{ width: '60px', padding: '5px', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <input type="number" name="total_runs" defaultValue={player.total_runs || 0} style={{ width: '60px', padding: '5px', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <input type="number" name="total_wickets" defaultValue={player.total_wickets || 0} style={{ width: '60px', padding: '5px', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <input type="number" name="highest_score" defaultValue={player.highest_score || 0} style={{ width: '60px', padding: '5px', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <input type="text" name="best_bowling" defaultValue={player.best_bowling || ''} placeholder="3/24" style={{ width: '80px', padding: '5px', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button type="submit" style={{
                                            background: '#00ff88',
                                            color: '#000',
                                            border: 'none',
                                            padding: '5px 15px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}>
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
    );
}
