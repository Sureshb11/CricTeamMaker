import Link from 'next/link';

export default function AdminDashboard() {
    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ color: 'var(--primary-color)', marginBottom: '40px' }}>Admin Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <Link href="/admin/matches" style={{
                    display: 'block',
                    padding: '30px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'white',
                    border: '1px solid #333',
                    transition: 'border-color 0.3s'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏏</div>
                    <h2>Manage Matches</h2>
                    <p style={{ color: '#888' }}>Add upcoming matches, update scores</p>
                </Link>

                <Link href="/admin/stats" style={{
                    display: 'block',
                    padding: '30px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'white',
                    border: '1px solid #333',
                    transition: 'border-color 0.3s'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</div>
                    <h2>Manage Stats</h2>
                    <p style={{ color: '#888' }}>Update player records</p>
                </Link>

                <Link href="/admin/generator" style={{
                    display: 'block',
                    padding: '30px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'white',
                    border: '1px solid #333',
                    transition: 'border-color 0.3s'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎲</div>
                    <h2>Team Generator</h2>
                    <p style={{ color: '#888' }}>Shuffle & Create Teams</p>
                </Link>

                <Link href="/admin/players" style={{
                    display: 'block',
                    padding: '30px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'white',
                    border: '1px solid #333',
                    transition: 'border-color 0.3s'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👥</div>
                    <h2>Manage Players</h2>
                    <p style={{ color: '#888' }}>View list, remove users</p>
                </Link>
            </div>

            <div style={{ marginTop: '50px' }}>
                <Link href="/dashboard" style={{ color: '#888', textDecoration: 'underline' }}>Back to User Dashboard</Link>
            </div>
        </div>
    );
}
