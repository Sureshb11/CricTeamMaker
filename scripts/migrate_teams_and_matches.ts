import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'cricket.db');
const db = new Database(dbPath);

console.log('Migrating database: Creating teams and fixing matches...');

try {
    // 1. Create Teams Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    console.log('Created teams table.');

    // 2. Insert Teams
    const insertTeam = db.prepare('INSERT OR IGNORE INTO teams (name) VALUES (?)');
    insertTeam.run('D-Vigo-S XI');
    insertTeam.run('Rogue Hawn');
    console.log('Seeded teams: D-Vigo-S XI, Rogue Hawn');

    // 3. Fix Matches Table (Handle NOT NULL constraint failure from previous attempt)
    // We'll just ensure the columns exist, and then insert the match with a placeholder for the legacy 'opponent' column if needed

    const formattedDate = '2024-05-20';

    // Check if we need to supply 'opponent' (legacy column) to satisfy NOT NULL constraint
    const tableInfo = db.pragma('table_info(matches)') as any[];
    const opponentCol = tableInfo.find(col => col.name === 'opponent');

    if (opponentCol && opponentCol.notnull === 1) {
        // If opponent is NOT NULL, we must provide it. We'll use the away team name as the legacy opponent value.
        db.prepare(`
        INSERT INTO matches (home_team, away_team, opponent, date, venue, result, score)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('D-Vigo-S XI', 'Rogue Hawn', 'Rogue Hawn', formattedDate, 'Home Ground', null, null);
    } else {
        // If opponent allows NULL or doesn't exist (if we dropped it, which we didn't)
        db.prepare(`
        INSERT INTO matches (home_team, away_team, date, venue, result, score)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('D-Vigo-S XI', 'Rogue Hawn', formattedDate, 'Home Ground', null, null);
    }

    console.log('Added new fixture: D-Vigo-S XI vs Rogue Hawn');

} catch (error) {
    console.error('Migration failed:', error);
}
