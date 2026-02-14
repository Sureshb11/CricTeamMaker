
import db from '@/lib/db';
import ScorecardForm from './scorecard-form';
import { notFound } from 'next/navigation';

interface PageProps {
    params: { id: string };
}

async function getMatchData(id: string) {
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

    // Get Players: fetch all registrations and split by team
    const allPlayersResult = await db.execute('SELECT id, full_name, team_name FROM registrations ORDER BY full_name');
    const allPlayers = allPlayersResult.rows as any[];

    // Get distinct team names from registrations
    const distinctTeams = [...new Set(allPlayers.map(p => p.team_name).filter(Boolean))] as string[];

    // Map match team names to registration team names via fuzzy matching
    // (the match may use different names than registrations)
    const mapTeam = (matchTeam: string) => {
        // Exact match first
        const exact = distinctTeams.find(t => t === matchTeam);
        if (exact) return exact;
        // Fuzzy: find team name that shares words with match team
        const matchWords = matchTeam.toLowerCase().split(/\s+/);
        return distinctTeams.find(t => {
            const tWords = t.toLowerCase().split(/[\s-]+/);
            return matchWords.some(w => tWords.some(tw => tw.includes(w) || w.includes(tw)));
        }) || matchTeam;
    };

    const homeRegTeam = mapTeam(String(match.home_team));
    const awayRegTeam = mapTeam(String(match.away_team));

    const homePlayers = allPlayers.filter(p => p.team_name === homeRegTeam);
    const awayPlayers = allPlayers.filter(p => p.team_name === awayRegTeam);

    // Get current inning
    const currentInning = inningsResult.rows.find((i: any) => i.inning_number === match.current_inning) || null;

    // Fetch live batting stats for current inning
    let batterStats: any[] = [];
    let bowlerStats: any[] = [];
    let currentOverBalls: string[] = [];

    if (currentInning) {
        // Batting performances: all batters who have participated in this inning
        const battersResult = await db.execute({
            sql: `SELECT pp.*, r.full_name, r.team_name
                  FROM player_performances pp
                  JOIN registrations r ON pp.player_id = r.id
                  WHERE pp.match_id = ? AND pp.inning_id = ?
                  AND (pp.balls_faced > 0 OR pp.runs_scored > 0 OR pp.player_id = ? OR pp.player_id = ?)
                  ORDER BY pp.id ASC`,
            args: [id, currentInning.id, currentInning.current_striker_id || 0, currentInning.current_non_striker_id || 0]
        });
        batterStats = battersResult.rows as any[];

        // Bowling performances for current inning
        const bowlersResult = await db.execute({
            sql: `SELECT pp.*, r.full_name, r.team_name
                  FROM player_performances pp
                  JOIN registrations r ON pp.player_id = r.id
                  WHERE pp.match_id = ? AND pp.inning_id = ?
                  AND (pp.runs_conceded > 0 OR pp.wickets_taken > 0 OR pp.overs_bowled > 0 OR pp.player_id = ?)
                  ORDER BY pp.id ASC`,
            args: [id, currentInning.id, currentInning.current_bowler_id || 0]
        });
        bowlerStats = bowlersResult.rows as any[];

        // Get current over deliveries for "This Over" display
        // Find current over number from legal ball count
        const legalCountResult = await db.execute({
            sql: `SELECT COUNT(*) as cnt FROM deliveries 
                  WHERE match_id = ? AND inning_id = ? 
                  AND extra_type NOT IN ('wide', 'no_ball')`,
            args: [id, currentInning.id]
        });
        const totalLegal = Number(legalCountResult.rows[0].cnt);
        const currentOverNum = Math.floor(totalLegal / 6);
        const ballsInOver = totalLegal % 6;

        // Fetch balls for the current over
        const overBallsResult = await db.execute({
            sql: `SELECT * FROM deliveries 
                  WHERE match_id = ? AND inning_id = ? AND over_number = ?
                  ORDER BY id ASC`,
            args: [id, currentInning.id, ballsInOver === 0 && currentOverNum > 0 ? currentOverNum - 1 : currentOverNum]
        });

        // If we just finished an over (ballsInOver = 0), show the last complete over
        // If mid-over, show the current over's balls
        const showOverNum = ballsInOver === 0 && currentOverNum > 0 ? currentOverNum - 1 : currentOverNum;
        const actualBallsResult = await db.execute({
            sql: `SELECT * FROM deliveries 
                  WHERE match_id = ? AND inning_id = ? AND over_number = ?
                  ORDER BY id ASC`,
            args: [id, currentInning.id, currentOverNum]
        });

        currentOverBalls = actualBallsResult.rows.map((b: any) => {
            let label = String(Number(b.runs_off_bat));
            if (b.extra_type === 'wide') label = 'Wd';
            else if (b.extra_type === 'no_ball') label = 'Nb';
            if (b.wicket_type && b.wicket_type !== 'none') label = 'W';
            return label;
        });

        // Calculate bowler's overs from deliveries (more accurate than stored value)
        for (const bowler of bowlerStats) {
            const bowlerBallsResult = await db.execute({
                sql: `SELECT COUNT(*) as cnt FROM deliveries 
                      WHERE match_id = ? AND inning_id = ? AND bowler_id = ?
                      AND extra_type NOT IN ('wide', 'no_ball')`,
                args: [id, currentInning.id, bowler.player_id]
            });
            const bowlerLegalBalls = Number(bowlerBallsResult.rows[0].cnt);
            const bowlerOvers = Math.floor(bowlerLegalBalls / 6);
            const bowlerBalls = bowlerLegalBalls % 6;
            bowler.calculated_overs = bowlerBalls === 0 ? `${bowlerOvers}` : `${bowlerOvers}.${bowlerBalls}`;
        }
    }

    // Get first innings data (for target display in 2nd innings)
    const firstInning = inningsResult.rows.find((i: any) => i.inning_number === 1) || null;

    return {
        match,
        innings: inningsResult.rows as any[],
        players: allPlayers,
        homePlayers,
        awayPlayers,
        homeRegTeam,
        awayRegTeam,
        batterStats,
        bowlerStats,
        currentOverBalls,
        firstInning,
    };
}

// Helper to serialize BigInts and Dates
const serialize = (data: any): any => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ));
};

// Next.js 15: params is a Promise
export default async function LiveScorePage({ params }: PageProps) {
    const { id } = await params;
    const data = await getMatchData(id);

    if (!data) return notFound();

    return (
        <ScorecardForm
            match={serialize(data.match)}
            innings={serialize(data.innings)}
            players={serialize(data.players)}
            homePlayers={serialize(data.homePlayers)}
            awayPlayers={serialize(data.awayPlayers)}
            homeRegTeam={data.homeRegTeam}
            awayRegTeam={data.awayRegTeam}
            batterStats={serialize(data.batterStats)}
            bowlerStats={serialize(data.bowlerStats)}
            currentOverBalls={serialize(data.currentOverBalls)}
            firstInning={serialize(data.firstInning)}
        />
    );
}
