import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'cricket.db');
const db = new Database(dbPath);

const schema = `
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper')) NOT NULL,
    matches_played INTEGER DEFAULT 0,
    runs INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opponent TEXT NOT NULL,
    date TEXT NOT NULL,
    venue TEXT NOT NULL,
    result TEXT,
    score TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    team_name TEXT,
    playing_role TEXT,
    experience_level TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

db.exec(schema);

// Seed some initial data if empty
const playersCount = db.prepare('SELECT count(*) as count FROM players').get() as { count: number };

if (playersCount.count === 0) {
  console.log('Seeding initial players...');
  const insertPlayer = db.prepare('INSERT INTO players (name, role, matches_played, runs, wickets, photo_url) VALUES (?, ?, ?, ?, ?, ?)');

  insertPlayer.run('Virat Kohli', 'Batsman', 250, 12000, 4, 'https://placehold.co/400x400?text=Virat');
  insertPlayer.run('Jasprit Bumrah', 'Bowler', 150, 200, 300, 'https://placehold.co/400x400?text=Bumrah');
  insertPlayer.run('Ravindra Jadeja', 'All-rounder', 200, 4000, 250, 'https://placehold.co/400x400?text=Jadeja');
}

console.log('Database initialized successfully!');
