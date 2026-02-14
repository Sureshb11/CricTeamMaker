
import db from '@/lib/db';
import { notFound } from 'next/navigation';
import LiveMatchView from './live-match-view';

interface PageProps {
    params: { id: string };
}

async function getLiveMatchData(id: string) {
    const matchResult = await db.execute({
        sql: 'SELECT * FROM matches WHERE id = ?',
        args: [id]
    });

    if (matchResult.rows.length === 0) return null;
    const match = matchResult.rows[0] as any;

    const inningsResult = await db.execute({
        sql: 'SELECT * FROM innings WHERE match_id = ? ORDER BY inning_number ASC',
        args: [id]
    });

    const currentInning = inningsResult.rows.find((i: any) => i.inning_number === match.current_inning);

    // Get recent deliveries for this over display
    const deliveriesResult = await db.execute({
        sql: `SELECT d.*, s.full_name as striker_name, b.full_name as bowler_name
              FROM deliveries d
              LEFT JOIN registrations s ON d.striker_id = s.id
              LEFT JOIN registrations b ON d.bowler_id = b.id
              WHERE d.match_id = ? 
              ORDER BY d.id DESC LIMIT 24`,
        args: [id]
    });

    // Get all batting performances for ALL innings  
    let allBatters: any[] = [];
    let currentBowler: any = null;
    let allBowlers: any[] = [];

    for (const inning of inningsResult.rows) {
        const battersResult = await db.execute({
            sql: `SELECT pp.*, r.full_name, ? as inning_number
                  FROM player_performances pp
                  JOIN registrations r ON pp.player_id = r.id
                  WHERE pp.match_id = ? AND pp.inning_id = ?
                  AND (pp.balls_faced > 0 OR pp.runs_scored > 0 OR pp.player_id = ? OR pp.player_id = ?)
                  ORDER BY pp.id ASC`,
            args: [inning.inning_number, id, inning.id, inning.current_striker_id || 0, inning.current_non_striker_id || 0]
        });
        allBatters = allBatters.concat(battersResult.rows);

        // Get bowling performances
        const bowlersResult = await db.execute({
            sql: `SELECT pp.*, r.full_name, ? as inning_number
                  FROM player_performances pp
                  JOIN registrations r ON pp.player_id = r.id
                  WHERE pp.match_id = ? AND pp.inning_id = ?
                  AND (pp.runs_conceded > 0 OR pp.wickets_taken > 0 OR pp.overs_bowled > 0 OR pp.player_id = ?)
                  ORDER BY pp.id ASC`,
            args: [inning.inning_number, id, inning.id, inning.current_bowler_id || 0]
        });
        allBowlers = allBowlers.concat(bowlersResult.rows);

        // Calculate bowler overs from deliveries
        for (const bowler of bowlersResult.rows) {
            const bowlerBallsResult = await db.execute({
                sql: `SELECT COUNT(*) as cnt FROM deliveries 
                      WHERE match_id = ? AND inning_id = ? AND bowler_id = ?
                      AND extra_type NOT IN ('wide', 'no_ball')`,
                args: [id, inning.id, bowler.player_id]
            });
            const bowlerLegalBalls = Number(bowlerBallsResult.rows[0].cnt);
            const bowlerOvers = Math.floor(bowlerLegalBalls / 6);
            const bowlerBalls = bowlerLegalBalls % 6;
            (bowler as any).calculated_overs = bowlerBalls === 0 ? `${bowlerOvers}` : `${bowlerOvers}.${bowlerBalls}`;
        }
    }

    // Current bowler info
    if (currentInning && currentInning.current_bowler_id) {
        const bowlerResult = await db.execute({
            sql: `SELECT pp.*, r.full_name 
                  FROM player_performances pp
                  JOIN registrations r ON pp.player_id = r.id
                  WHERE pp.match_id = ? AND pp.player_id = ? AND pp.inning_id = ?`,
            args: [id, currentInning.current_bowler_id, currentInning.id]
        });
        if (bowlerResult.rows.length > 0) {
            currentBowler = bowlerResult.rows[0];
            // Calculate bowler's overs
            const bowlerBallsResult = await db.execute({
                sql: `SELECT COUNT(*) as cnt FROM deliveries 
                      WHERE match_id = ? AND inning_id = ? AND bowler_id = ?
                      AND extra_type NOT IN ('wide', 'no_ball')`,
                args: [id, currentInning.id, currentInning.current_bowler_id]
            });
            const bowlerLegalBalls = Number(bowlerBallsResult.rows[0].cnt);
            const bowlerOvers = Math.floor(bowlerLegalBalls / 6);
            const bowlerBalls = bowlerLegalBalls % 6;
            (currentBowler as any).calculated_overs = bowlerBalls === 0 ? `${bowlerOvers}` : `${bowlerOvers}.${bowlerBalls}`;
        }
    }

    return {
        match,
        innings: inningsResult.rows as any[],
        recentBalls: deliveriesResult.rows as any[],
        allBatters,
        currentBowler,
        allBowlers,
    };
}

const serialize = (data: any): any => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ));
};

export default async function PublicLiveMatchPage({ params }: PageProps) {
    const { id } = await params;
    const data = await getLiveMatchData(id);

    if (!data) return notFound();

    return (
        <div className="container">
            <LiveMatchView
                match={serialize(data.match)}
                innings={serialize(data.innings)}
                recentBalls={serialize(data.recentBalls)}
                batters={serialize(data.allBatters)}
                bowler={serialize(data.currentBowler)}
                allBowlers={serialize(data.allBowlers)}
            />
        </div>
    );
}
