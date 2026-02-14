
import db from '../src/lib/db';

async function main() {
    console.log('--- Creating Live Score Tables ---');

    try {
        // 1. Update Matches Table
        console.log('Updating matches table...');
        try {
            await db.execute("ALTER TABLE matches ADD COLUMN status TEXT DEFAULT 'scheduled'");
            await db.execute("ALTER TABLE matches ADD COLUMN toss_winner TEXT");
            await db.execute("ALTER TABLE matches ADD COLUMN toss_decision TEXT");
            await db.execute("ALTER TABLE matches ADD COLUMN current_inning_id INTEGER");
        } catch (e) {
            console.log('Matches columns might already exist, skipping...');
        }

        // 2. Create Innings Table
        console.log('Creating innings table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS innings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                match_id INTEGER NOT NULL,
                inning_number INTEGER NOT NULL,
                batting_team TEXT NOT NULL,
                bowling_team TEXT NOT NULL,
                total_runs INTEGER DEFAULT 0,
                wickets INTEGER DEFAULT 0,
                overs REAL DEFAULT 0.0,
                is_closed BOOLEAN DEFAULT 0,
                FOREIGN KEY(match_id) REFERENCES matches(id)
            )
        `);

        // 3. Create Deliveries Table
        console.log('Creating deliveries table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS deliveries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                match_id INTEGER NOT NULL,
                inning_id INTEGER NOT NULL,
                over_number INTEGER NOT NULL,
                ball_number INTEGER NOT NULL,
                striker_id INTEGER NOT NULL,
                non_striker_id INTEGER NOT NULL,
                bowler_id INTEGER NOT NULL,
                runs_off_bat INTEGER DEFAULT 0,
                extras INTEGER DEFAULT 0,
                extra_type TEXT DEFAULT 'none',
                wicket_type TEXT DEFAULT 'none',
                player_out_id INTEGER,
                fielder_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(match_id) REFERENCES matches(id),
                FOREIGN KEY(inning_id) REFERENCES innings(id)
            )
        `);

        // 4. Create Player Performances Table
        console.log('Creating player_performances table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS player_performances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                match_id INTEGER NOT NULL,
                player_id INTEGER NOT NULL,
                inning_id INTEGER,
                
                -- Batting
                runs_scored INTEGER DEFAULT 0,
                balls_faced INTEGER DEFAULT 0,
                fours INTEGER DEFAULT 0,
                sixes INTEGER DEFAULT 0,
                is_out BOOLEAN DEFAULT 0,
                dismissal_text TEXT,
                
                -- Bowling
                overs_bowled REAL DEFAULT 0.0,
                maidens INTEGER DEFAULT 0,
                runs_conceded INTEGER DEFAULT 0,
                wickets_taken INTEGER DEFAULT 0,
                
                FOREIGN KEY(match_id) REFERENCES matches(id),
                FOREIGN KEY(player_id) REFERENCES registrations(id)
            )
        `);

        // 5. Create Unique Index for Upserts (CRITICAL)
        console.log('Creating UNIQUE INDEX on player_performances...');
        await db.execute(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_player_performance_unique 
            ON player_performances(match_id, player_id, inning_id)
        `);

        console.log('All tables created successfully.');
    } catch (e) {
        console.error('Error creating tables:', e);
    }
}

main();
