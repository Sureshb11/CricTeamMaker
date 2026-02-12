import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'cricket.db');
const db = new Database(dbPath);

console.log('Migrating database: Updating matches schema...');

try {
    // 1. Add new columns
    const tableInfo = db.pragma('table_info(matches)') as any[];
    const hasHomeTeam = tableInfo.some(col => col.name === 'home_team');
    const hasAwayTeam = tableInfo.some(col => col.name === 'away_team');

    if (!hasHomeTeam) {
        db.prepare('ALTER TABLE matches ADD COLUMN home_team TEXT DEFAULT "D-Vigo-S XI"').run();
        console.log('Added home_team column.');
    }

    if (!hasAwayTeam) {
        db.prepare('ALTER TABLE matches ADD COLUMN away_team TEXT').run();
        console.log('Added away_team column.');
    }

    // 2. Migrate existing data (Move 'opponent' to 'away_team')
    // We assume existing rows have 'opponent' populated.
    db.prepare('UPDATE matches SET away_team = opponent WHERE away_team IS NULL').run();
    console.log('Migrated existing opponents to away_team.');

    // 3. Insert the specific match requested by user
    db.prepare(`
    INSERT INTO matches (home_team, away_team, date, venue, result, score)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('D-Vigo-S XI', 'Rogue Hawn', '2024-05-20', 'Home Ground', null, null);

    console.log('Added new fixture: D-Vigo-S XI vs Rogue Hawn');

} catch (error) {
    console.error('Migration failed:', error);
}
