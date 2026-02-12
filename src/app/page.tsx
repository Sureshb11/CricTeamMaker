import styles from "./page.module.css";
import db from "@/lib/db";
import Link from 'next/link';
import { getSession } from '@/lib/session';
import RegisterForm from './register/register-form';

async function getLatestRegistration() {
  const result = await db.execute('SELECT * FROM registrations ORDER BY created_at DESC LIMIT 1');
  return result.rows[0] as any;
}

async function getTeams() {
  const result = await db.execute('SELECT id, name FROM teams ORDER BY name ASC');
  return result.rows.map(row => ({ id: row.id as number, name: row.name as string }));
}

async function getTopScorers() {
  const result = await db.execute('SELECT * FROM registrations ORDER BY total_runs DESC LIMIT 3');
  return result.rows as any[];
}

async function getTopWicketTakers() {
  const result = await db.execute('SELECT * FROM registrations ORDER BY total_wickets DESC LIMIT 3');
  return result.rows as any[];
}

export default async function Home() {
  const latestPlayer = await getLatestRegistration();
  const session = await getSession();
  const teams = await getTeams();
  const topScorers = await getTopScorers();
  const topWicketTakers = await getTopWicketTakers();

  let user = null;
  if (session) {
    const result = await db.execute({
      sql: 'SELECT full_name FROM registrations WHERE id = ?',
      args: [session.userId]
    });
    user = result.rows[0] as any;
  }

  // If user is NOT logged in, show Registration Form (Landing Page = Register)
  if (!user) {
    return (
      <div className={styles.main} style={{ justifyContent: 'center', paddingTop: '40px' }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '2.5rem',
            color: 'var(--primary-color)'
          }}>
            Join Our Team
          </h1>
          <RegisterForm teams={teams} />

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#aaa' }}>Already a member?</p>
            <Link href="/login" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
              Login here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user IS logged in, show Dashboard
  return (
    <div className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Welcome back, {user.full_name.split(' ')[0]}!
        </h1>
        <p className={styles.description}>
          Ready for the next match?
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="btn">My Dashboard</Link>
          <Link href="/team" className="btn btn-outline" style={{ marginLeft: '20px' }}>View Players</Link>
        </div>
      </section>

      <div className={styles.grid}>

        {/* Season Leaders Section */}
        <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '30px' }}>🏆 Season Leaders</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {/* Orange Cap - Batting */}
            <div style={{ background: 'rgba(255, 165, 0, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 165, 0, 0.3)' }}>
              <h3 style={{ color: 'orange', textAlign: 'center', marginBottom: '15px' }}>Orange Cap (Runs) 🏏</h3>
              {topScorers.map((player, index) => (
                <div key={player.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px', color: '#888' }}>#{index + 1}</span>
                  {player.photo_url ? (
                    <img src={player.photo_url} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{player.full_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{player.team_name}</div>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>{player.total_runs}</div>
                </div>
              ))}
            </div>

            {/* Purple Cap - Bowling */}
            <div style={{ background: 'rgba(138, 43, 226, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(138, 43, 226, 0.3)' }}>
              <h3 style={{ color: 'blueviolet', textAlign: 'center', marginBottom: '15px' }}>Purple Cap (Wickets) 🥎</h3>
              {topWicketTakers.map((player, index) => (
                <div key={player.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px', color: '#888' }}>#{index + 1}</span>
                  {player.photo_url ? (
                    <img src={player.photo_url} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{player.full_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{player.team_name}</div>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>{player.total_wickets}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Newest Member</h2>
          {latestPlayer ? (
            <div>
              <h3>{latestPlayer.full_name}</h3>
              <p>{latestPlayer.team_name || "Unassigned"}</p>
              <p style={{ color: 'var(--primary-color)', marginTop: '5px' }}>{latestPlayer.playing_role}</p>
            </div>
          ) : (
            <p>No players registered yet.</p>
          )}
          <div style={{ marginTop: '20px' }}>
            <Link href="/team" style={{ color: 'var(--primary-color)' }}>View All Players →</Link>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Season Details</h2>
          <p className={styles.description}>
            Registrations are open for the upcoming season.
          </p>
          <div style={{ marginTop: '20px' }}>
            <Link href="/matches" style={{ color: 'var(--primary-color)' }}>Check Schedule →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
