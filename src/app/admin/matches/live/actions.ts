'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ── Interface ──
export interface BallEvent {
    matchId: number;
    inningId: number;
    over: number;
    ball: number;
    strikerId: number;
    nonStrikerId: number;
    bowlerId: number;
    runsOffBat: number;
    extras: number;
    extraType: 'wide' | 'no_ball' | 'bye' | 'leg_bye' | 'none';
    wicketType: 'bowled' | 'caught' | 'caught_and_bowled' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket' | 'retired' | 'obstructing_field' | 'timed_out' | 'none';
    playerOutId?: number;
    fielderId?: number;
}

// ── Helper: count legal balls in current over ──
async function getLegalBallsInCurrentOver(matchId: number, inningId: number): Promise<number> {
    // First, count total legal balls to figure out the current over number
    const totalResult = await db.execute({
        sql: `SELECT COUNT(*) as cnt FROM deliveries 
              WHERE match_id = ? AND inning_id = ? 
              AND extra_type NOT IN ('wide', 'no_ball')`,
        args: [matchId, inningId]
    });
    const totalLegal = Number(totalResult.rows[0].cnt);
    // Balls in the current (incomplete) over
    return totalLegal % 6;
}

// ── Helper: recalculate overs from deliveries count ──
async function recalculateOvers(matchId: number, inningId: number): Promise<number> {
    const countResult = await db.execute({
        sql: `SELECT COUNT(*) as valid_balls FROM deliveries 
              WHERE match_id = ? AND inning_id = ? 
              AND extra_type NOT IN ('wide', 'no_ball')`,
        args: [matchId, inningId]
    });
    const validBalls = Number(countResult.rows[0].valid_balls);
    const completedOvers = Math.floor(validBalls / 6);
    const remainingBalls = validBalls % 6;
    return completedOvers + remainingBalls / 10; // e.g. 2.3 = 2 overs 3 balls
}

// ── Helper: get current over number (0-indexed) ──
async function getCurrentOverNumber(matchId: number, inningId: number): Promise<number> {
    const countResult = await db.execute({
        sql: `SELECT COUNT(*) as valid_balls FROM deliveries 
              WHERE match_id = ? AND inning_id = ? 
              AND extra_type NOT IN ('wide', 'no_ball')`,
        args: [matchId, inningId]
    });
    const validBalls = Number(countResult.rows[0].valid_balls);
    return Math.floor(validBalls / 6);
}

// ── SUBMIT BALL ──
export async function submitBall(event: BallEvent) {
    try {
        const isLegalBall = event.extraType !== 'wide' && event.extraType !== 'no_ball';
        const totalRuns = event.runsOffBat + event.extras;
        const isWicket = event.wicketType !== 'none';

        // Get current over and ball number from DB (not from client)
        const overNum = await getCurrentOverNumber(event.matchId, event.inningId);
        const ballsInOver = await getLegalBallsInCurrentOver(event.matchId, event.inningId);
        const ballNum = isLegalBall ? ballsInOver + 1 : ballsInOver; // extras don't count as a ball

        // 1. Insert delivery
        await db.execute({
            sql: `INSERT INTO deliveries (
                match_id, inning_id, over_number, ball_number, 
                striker_id, non_striker_id, bowler_id, 
                runs_off_bat, extras, extra_type, 
                wicket_type, player_out_id, fielder_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                event.matchId, event.inningId, overNum, ballNum,
                event.strikerId, event.nonStrikerId, event.bowlerId,
                event.runsOffBat, event.extras, event.extraType,
                event.wicketType, event.playerOutId || null, event.fielderId || null
            ]
        });

        // 2. Update innings totals
        const newOvers = await recalculateOvers(event.matchId, event.inningId);
        await db.execute({
            sql: `UPDATE innings SET 
                total_runs = total_runs + ?,
                wickets = wickets + ?,
                overs = ?
                WHERE id = ?`,
            args: [totalRuns, isWicket ? 1 : 0, newOvers, event.inningId]
        });

        // 3. Update batter stats (striker faces the ball unless it's a wide)
        if (event.extraType !== 'wide') {
            await db.execute({
                sql: `INSERT INTO player_performances (match_id, player_id, inning_id, runs_scored, balls_faced, fours, sixes) 
                      VALUES (?, ?, ?, ?, 1, ?, ?)
                      ON CONFLICT(match_id, player_id, inning_id) DO UPDATE SET 
                      runs_scored = runs_scored + ?,
                      balls_faced = balls_faced + 1,
                      fours = fours + ?,
                      sixes = sixes + ?`,
                args: [
                    event.matchId, event.strikerId, event.inningId, event.runsOffBat,
                    event.runsOffBat === 4 ? 1 : 0, event.runsOffBat === 6 ? 1 : 0,
                    event.runsOffBat,
                    event.runsOffBat === 4 ? 1 : 0, event.runsOffBat === 6 ? 1 : 0
                ]
            });
        }

        // Also ensure non-striker has a performance record (so they show on scorecard)
        await db.execute({
            sql: `INSERT INTO player_performances (match_id, player_id, inning_id, runs_scored, balls_faced, fours, sixes) 
                  VALUES (?, ?, ?, 0, 0, 0, 0)
                  ON CONFLICT(match_id, player_id, inning_id) DO NOTHING`,
            args: [event.matchId, event.nonStrikerId, event.inningId]
        });

        // 4. Update bowler stats
        await db.execute({
            sql: `INSERT INTO player_performances (match_id, player_id, inning_id, runs_conceded, wickets_taken) 
                  VALUES (?, ?, ?, ?, ?)
                  ON CONFLICT(match_id, player_id, inning_id) DO UPDATE SET 
                  runs_conceded = runs_conceded + ?,
                  wickets_taken = wickets_taken + ?`,
            args: [
                event.matchId, event.bowlerId, event.inningId, totalRuns,
                isWicket && event.wicketType !== 'run_out' ? 1 : 0,
                totalRuns,
                isWicket && event.wicketType !== 'run_out' ? 1 : 0
            ]
        });

        // 5. Handle wicket — mark batter as out
        if (isWicket) {
            const outPlayerId = event.playerOutId || event.strikerId;
            await db.execute({
                sql: `UPDATE player_performances SET is_out = 1, dismissal_text = ? 
                      WHERE match_id = ? AND player_id = ? AND inning_id = ?`,
                args: [event.wicketType, event.matchId, outPlayerId, event.inningId]
            });
        }

        // 6. Determine striker swap (odd runs = swap, wicket = need new batsman)
        let newStrikerId = event.strikerId;
        let newNonStrikerId = event.nonStrikerId;

        if (!isWicket) {
            // On odd total runs (including extras like byes/leg byes), swap
            const runsThatSwap = event.extraType === 'bye' || event.extraType === 'leg_bye'
                ? event.extras : event.runsOffBat;
            if (runsThatSwap % 2 !== 0) {
                newStrikerId = event.nonStrikerId;
                newNonStrikerId = event.strikerId;
            }
        }

        // 7. Check if over is complete (6 legal balls)
        const legalBallsNow = await getLegalBallsInCurrentOver(event.matchId, event.inningId);
        const overComplete = legalBallsNow === 0 && isLegalBall; // Just crossed to a new over

        if (overComplete) {
            // Swap striker at over end
            const temp = newStrikerId;
            newStrikerId = newNonStrikerId;
            newNonStrikerId = temp;

            // Update bowler overs_bowled
            await db.execute({
                sql: `UPDATE player_performances SET overs_bowled = overs_bowled + 1.0
                      WHERE match_id = ? AND player_id = ? AND inning_id = ?`,
                args: [event.matchId, event.bowlerId, event.inningId]
            });
        } else if (isLegalBall) {
            // Increment partial over for bowler: add 0.1
            // We track bowler overs as completed overs only — partial is derived from deliveries
        }

        // 8. Update active players in innings table
        await db.execute({
            sql: `UPDATE innings SET current_striker_id = ?, current_non_striker_id = ? WHERE id = ?`,
            args: [newStrikerId, newNonStrikerId, event.inningId]
        });

        revalidatePath(`/admin/matches/${event.matchId}`);
        revalidatePath(`/matches`);
        revalidatePath(`/matches/live/${event.matchId}`);

        return {
            success: true,
            overComplete,
            newStrikerId,
            newNonStrikerId,
        };
    } catch (e: any) {
        console.error('Error submitting ball:', e);
        return { success: false, error: e.message || String(e) };
    }
}

// ── INITIALIZE INNING ──
export async function initializeInning(
    matchId: number,
    inningNumber: number,
    battingTeam: string,
    bowlingTeam: string,
    strikerId: number,
    nonStrikerId: number,
    bowlerId: number,
    tossWinner?: string,
    tossDecision?: string,
    overs?: number
) {
    try {
        console.log('Init Inning:', { matchId, inningNumber, battingTeam, bowlingTeam, strikerId, nonStrikerId, bowlerId, overs });

        // 1. Create Inning Record
        const result = await db.execute({
            sql: `INSERT INTO innings (
                match_id, inning_number, batting_team, bowling_team, 
                total_runs, wickets, overs, 
                current_striker_id, current_non_striker_id, current_bowler_id
            ) VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?, ?)`,
            args: [matchId, inningNumber, battingTeam, bowlingTeam, strikerId, nonStrikerId, bowlerId]
        });

        const inningId = Number(result.lastInsertRowid);

        // 2. Initialize Player Performances (0 stats)
        // Striker
        await db.execute({
            sql: `INSERT INTO player_performances (match_id, player_id, inning_id, runs_scored, balls_faced, fours, sixes) 
                  VALUES (?, ?, ?, 0, 0, 0, 0)
                  ON CONFLICT(match_id, player_id, inning_id) DO NOTHING`,
            args: [matchId, strikerId, inningId]
        });
        // Non-Striker
        await db.execute({
            sql: `INSERT INTO player_performances (match_id, player_id, inning_id, runs_scored, balls_faced, fours, sixes) 
                  VALUES (?, ?, ?, 0, 0, 0, 0)
                  ON CONFLICT(match_id, player_id, inning_id) DO NOTHING`,
            args: [matchId, nonStrikerId, inningId]
        });
        // Bowler
        await db.execute({
            sql: `INSERT INTO player_performances (match_id, player_id, inning_id, runs_conceded, wickets_taken, overs_bowled) 
                  VALUES (?, ?, ?, 0, 0, 0)
                  ON CONFLICT(match_id, player_id, inning_id) DO NOTHING`,
            args: [matchId, bowlerId, inningId]
        });

        // 3. Update match — set current inning, status to live, save toss info, and total overs
        let updateSql = `UPDATE matches SET current_inning = ?, status = 'live'`;
        const updateArgs: any[] = [inningNumber];

        if (tossWinner && tossDecision) {
            updateSql += `, toss_winner = ?, toss_decision = ?`;
            updateArgs.push(tossWinner, tossDecision);
        }

        if (overs) {
            updateSql += `, overs = ?`;
            updateArgs.push(overs);
        }

        updateSql += ` WHERE id = ?`;
        updateArgs.push(matchId);

        await db.execute({
            sql: updateSql,
            args: updateArgs
        });

        revalidatePath(`/admin/matches/${matchId}`);
        revalidatePath(`/matches`);
        return { success: true, inningId };
    } catch (e: any) {
        console.error('Error initializing inning:', e);
        return { success: false, error: e.message || String(e) };
    }
}

// ── UNDO LAST BALL ──
export async function undoLastBall(matchId: number, inningId: number) {
    try {
        // 1. Get last delivery
        const lastBallResult = await db.execute({
            sql: `SELECT * FROM deliveries WHERE match_id = ? AND inning_id = ? ORDER BY id DESC LIMIT 1`,
            args: [matchId, inningId]
        });

        if (lastBallResult.rows.length === 0) {
            return { success: false, error: 'No balls to undo' };
        }

        const ball = lastBallResult.rows[0];
        const totalRuns = Number(ball.runs_off_bat) + Number(ball.extras);
        const isWicket = ball.wicket_type !== 'none';

        // 2. Reverse batter stats
        if (ball.extra_type !== 'wide') {
            await db.execute({
                sql: `UPDATE player_performances SET 
                    runs_scored = MAX(0, runs_scored - ?),
                    balls_faced = MAX(0, balls_faced - 1),
                    fours = MAX(0, fours - ?),
                    sixes = MAX(0, sixes - ?)
                    WHERE match_id = ? AND player_id = ? AND inning_id = ?`,
                args: [
                    Number(ball.runs_off_bat),
                    Number(ball.runs_off_bat) === 4 ? 1 : 0,
                    Number(ball.runs_off_bat) === 6 ? 1 : 0,
                    matchId, ball.striker_id, inningId
                ]
            });
        }

        // 3. Reverse bowler stats
        const bowlerWicket = isWicket && ball.wicket_type !== 'run_out';
        await db.execute({
            sql: `UPDATE player_performances SET 
                runs_conceded = MAX(0, runs_conceded - ?),
                wickets_taken = MAX(0, wickets_taken - ?)
                WHERE match_id = ? AND player_id = ? AND inning_id = ?`,
            args: [totalRuns, bowlerWicket ? 1 : 0, matchId, ball.bowler_id, inningId]
        });

        // 4. If it was a wicket, un-dismiss the batter
        if (isWicket) {
            const outPlayerId = ball.player_out_id || ball.striker_id;
            await db.execute({
                sql: `UPDATE player_performances SET is_out = 0, dismissal_text = NULL 
                      WHERE match_id = ? AND player_id = ? AND inning_id = ?`,
                args: [matchId, outPlayerId, inningId]
            });
        }

        // 5. Delete delivery
        await db.execute({
            sql: `DELETE FROM deliveries WHERE id = ?`,
            args: [ball.id]
        });

        // 6. Recalculate innings overs + totals
        const newOvers = await recalculateOvers(matchId, inningId);
        await db.execute({
            sql: `UPDATE innings SET 
                total_runs = MAX(0, total_runs - ?),
                wickets = MAX(0, wickets - ?),
                overs = ?
                WHERE id = ?`,
            args: [totalRuns, isWicket ? 1 : 0, newOvers, inningId]
        });

        // 7. Restore previous active players (the striker/nonStriker from the undone ball)
        await db.execute({
            sql: `UPDATE innings SET current_striker_id = ?, current_non_striker_id = ? WHERE id = ?`,
            args: [ball.striker_id, ball.non_striker_id, inningId]
        });

        revalidatePath(`/admin/matches/${matchId}`);
        revalidatePath(`/matches`);
        revalidatePath(`/matches/live/${matchId}`);

        return { success: true, strikerId: Number(ball.striker_id), nonStrikerId: Number(ball.non_striker_id) };
    } catch (e: any) {
        console.error('Error undoing ball:', e);
        return { success: false, error: e.message || String(e) };
    }
}

// ── CHANGE BOWLER ──
export async function changeBowler(matchId: number, inningId: number, newBowlerId: number) {
    try {
        // Update active bowler in innings
        await db.execute({
            sql: `UPDATE innings SET current_bowler_id = ? WHERE id = ?`,
            args: [newBowlerId, inningId]
        });

        // Ensure bowler has a performance record
        await db.execute({
            sql: `INSERT INTO player_performances (match_id, player_id, inning_id, runs_conceded, wickets_taken, overs_bowled) 
                  VALUES (?, ?, ?, 0, 0, 0)
                  ON CONFLICT(match_id, player_id, inning_id) DO NOTHING`,
            args: [matchId, newBowlerId, inningId]
        });

        revalidatePath(`/admin/matches/${matchId}`);
        return { success: true };
    } catch (e: any) {
        console.error('Error changing bowler:', e);
        return { success: false, error: e.message || String(e) };
    }
}

// ── SELECT NEW BATSMAN (after wicket) ──
export async function selectNewBatsman(matchId: number, inningId: number, newBatsmanId: number, isStriker: boolean) {
    try {
        // Update active batter in innings
        if (isStriker) {
            await db.execute({
                sql: `UPDATE innings SET current_striker_id = ? WHERE id = ?`,
                args: [newBatsmanId, inningId]
            });
        } else {
            await db.execute({
                sql: `UPDATE innings SET current_non_striker_id = ? WHERE id = ?`,
                args: [newBatsmanId, inningId]
            });
        }

        // Create performance record
        await db.execute({
            sql: `INSERT INTO player_performances (match_id, player_id, inning_id, runs_scored, balls_faced, fours, sixes) 
                  VALUES (?, ?, ?, 0, 0, 0, 0)
                  ON CONFLICT(match_id, player_id, inning_id) DO NOTHING`,
            args: [matchId, newBatsmanId, inningId]
        });

        revalidatePath(`/admin/matches/${matchId}`);
        return { success: true };
    } catch (e: any) {
        console.error('Error selecting new batsman:', e);
        return { success: false, error: e.message || String(e) };
    }
}

// ── END INNINGS ──
export async function endInnings(matchId: number, inningId: number) {
    try {
        // 1. Close current inning
        await db.execute({
            sql: `UPDATE innings SET is_closed = 1 WHERE id = ?`,
            args: [inningId]
        });

        // 2. Get current inning details to determine teams for 2nd innings
        const inningResult = await db.execute({
            sql: `SELECT * FROM innings WHERE id = ?`,
            args: [inningId]
        });
        const currentInning = inningResult.rows[0];

        // 3. Update match to next inning
        const nextInningNumber = Number(currentInning.inning_number) + 1;

        if (nextInningNumber <= 2) {
            await db.execute({
                sql: `UPDATE matches SET current_inning = ? WHERE id = ?`,
                args: [nextInningNumber, matchId]
            });
        }

        revalidatePath(`/admin/matches/${matchId}`);
        revalidatePath(`/matches`);
        revalidatePath(`/matches/live/${matchId}`);

        return {
            success: true,
            nextInningNumber,
            // Swap teams for 2nd innings
            battingTeam: String(currentInning.bowling_team),
            bowlingTeam: String(currentInning.batting_team),
            target: Number(currentInning.total_runs) + 1
        };
    } catch (e: any) {
        console.error('Error ending innings:', e);
        return { success: false, error: e.message || String(e) };
    }
}

// ── END MATCH ──
export async function endMatch(matchId: number) {
    try {
        // Get both innings
        const inningsResult = await db.execute({
            sql: `SELECT * FROM innings WHERE match_id = ? ORDER BY inning_number ASC`,
            args: [matchId]
        });

        const matchResult = await db.execute({
            sql: `SELECT * FROM matches WHERE id = ?`,
            args: [matchId]
        });
        const match = matchResult.rows[0];

        let result = '';
        let score = '';

        if (inningsResult.rows.length >= 2) {
            const inn1 = inningsResult.rows[0];
            const inn2 = inningsResult.rows[1];
            const runs1 = Number(inn1.total_runs);
            const runs2 = Number(inn2.total_runs);
            const wickets1 = Number(inn1.wickets);
            const wickets2 = Number(inn2.wickets);

            score = `${runs1}/${wickets1} vs ${runs2}/${wickets2}`;

            if (runs2 > runs1) {
                const wicketsRemaining = 10 - wickets2;
                result = `${inn2.batting_team} won by ${wicketsRemaining} wickets`;
            } else if (runs1 > runs2) {
                const runDiff = runs1 - runs2;
                result = `${inn1.batting_team} won by ${runDiff} runs`;
            } else {
                result = 'Match Tied';
            }
        } else if (inningsResult.rows.length === 1) {
            const inn1 = inningsResult.rows[0];
            score = `${inn1.total_runs}/${inn1.wickets}`;
            result = 'Match ended (1 innings)';
        }

        // Close all innings
        await db.execute({
            sql: `UPDATE innings SET is_closed = 1 WHERE match_id = ?`,
            args: [matchId]
        });

        // Update match
        await db.execute({
            sql: `UPDATE matches SET status = 'completed', result = ?, score = ? WHERE id = ?`,
            args: [result, score, matchId]
        });

        // Update cumulative player stats from player_performances
        const performances = await db.execute({
            sql: `SELECT DISTINCT player_id FROM player_performances WHERE match_id = ?`,
            args: [matchId]
        });

        for (const row of performances.rows) {
            const playerId = row.player_id;
            const statsResult = await db.execute({
                sql: `SELECT 
                    COUNT(DISTINCT match_id) as matches_played,
                    SUM(runs_scored) as total_runs,
                    SUM(wickets_taken) as total_wickets,
                    MAX(runs_scored) as highest_score
                FROM player_performances WHERE player_id = ?`,
                args: [playerId]
            });
            const stats = statsResult.rows[0];

            await db.execute({
                sql: `UPDATE registrations SET 
                    matches_played = ?, total_runs = ?, total_wickets = ?, highest_score = ?
                    WHERE id = ?`,
                args: [
                    Number(stats.matches_played) || 0,
                    Number(stats.total_runs) || 0,
                    Number(stats.total_wickets) || 0,
                    Number(stats.highest_score) || 0,
                    playerId
                ]
            });
        }

        revalidatePath(`/admin/matches/${matchId}`);
        revalidatePath(`/matches`);
        revalidatePath(`/admin/stats`);

        return { success: true, result, score };
    } catch (e: any) {
        console.error('Error ending match:', e);
        return { success: false, error: e.message || String(e) };
    }
}

// ── GET CURRENT OVER DELIVERIES (for "This Over" display) ──
export async function getCurrentOverDeliveries(matchId: number, inningId: number) {
    try {
        const overNum = await getCurrentOverNumber(matchId, inningId);
        const ballsInOver = await getLegalBallsInCurrentOver(matchId, inningId);

        // If ballsInOver === 0 and overNum > 0, we just completed an over
        // Show the previous over's balls in that case? No — show empty for the new over

        const result = await db.execute({
            sql: `SELECT * FROM deliveries 
                  WHERE match_id = ? AND inning_id = ? AND over_number = ?
                  ORDER BY id ASC`,
            args: [matchId, inningId, ballsInOver === 0 && overNum > 0 ? overNum : overNum]
        });

        return result.rows.map((b: any) => {
            let label = String(Number(b.runs_off_bat));
            if (b.extra_type === 'wide') label = 'Wd';
            else if (b.extra_type === 'no_ball') label = 'Nb';
            if (b.wicket_type && b.wicket_type !== 'none') label = 'W';
            return label;
        });
    } catch (e) {
        console.error('Error getting current over:', e);
        return [];
    }
}
