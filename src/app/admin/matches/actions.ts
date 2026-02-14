'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addMatch(formData: FormData) {
    const opponent = formData.get('opponent') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const venue = formData.get('venue') as string;
    const result = formData.get('result') as string;
    const score = formData.get('score') as string;
    const home_team = formData.get('home_team') as string;
    const away_team = formData.get('away_team') as string;

    const finalOpponent = opponent || away_team;

    console.log('Adding match:', { date, time, venue, home_team, away_team, opponent: finalOpponent });

    if (!date || !finalOpponent || !venue) {
        console.error('Validation failed:', { date, finalOpponent, venue });
        return { error: 'Please fill required fields' };
    }

    try {
        await db.execute({
            sql: `
            INSERT INTO matches (opponent, date, time, venue, result, score, home_team, away_team)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
            args: [finalOpponent, date, time || '00:00', venue, result, score, home_team, away_team]
        });

        console.log('Match added successfully');
        revalidatePath('/matches');
        revalidatePath('/admin/matches');
        return { success: true };
    } catch (error) {
        console.error('Failed to add match:', error);
        return { error: 'Failed to add match' };
    }
}

export async function deleteMatch(id: number) {
    try {
        console.log('Deleting match', id);
        // Delete related data first (Manual Cascade)
        await db.execute({ sql: 'DELETE FROM deliveries WHERE match_id = ?', args: [id] });
        await db.execute({ sql: 'DELETE FROM player_performances WHERE match_id = ?', args: [id] });
        await db.execute({ sql: 'DELETE FROM innings WHERE match_id = ?', args: [id] });
        await db.execute({ sql: 'DELETE FROM match_performances WHERE match_id = ?', args: [id] }); // Legacy/Manual scorecard

        // Finally delete match
        await db.execute({
            sql: 'DELETE FROM matches WHERE id = ?',
            args: [id]
        });
        revalidatePath('/matches');
        revalidatePath('/admin/matches');
    } catch (error) {
        console.error('Failed to delete match:', error);
    }
}

export async function updateMatchResult(formData: FormData) {
    const id = formData.get('id') as string;
    const home_team = formData.get('home_team') as string;
    const away_team = formData.get('away_team') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const venue = formData.get('venue') as string;
    const result = formData.get('result') as string;
    const score = formData.get('score') as string;

    try {
        await db.execute({
            sql: `
            UPDATE matches 
            SET home_team = ?, away_team = ?, date = ?, time = ?, venue = ?, result = ?, score = ?
            WHERE id = ?
            `,
            args: [home_team, away_team, date, time, venue, result, score, id]
        });
        revalidatePath('/matches');
        revalidatePath('/admin/matches');
    } catch (error) {
        console.error('Failed to update match:', error);
    }
}

export async function saveMatchScorecard(matchId: number, entries: any[]) {
    try {
        // 1. Clear existing performance for this match (to allow updates/overwrites)
        await db.execute({
            sql: 'DELETE FROM match_performances WHERE match_id = ?',
            args: [matchId]
        });

        // 2. Insert new performance records
        for (const entry of entries) {
            await db.execute({
                sql: `
                INSERT INTO match_performances 
                (match_id, player_id, runs_scored, balls_faced, wickets_taken, overs_bowled, runs_conceded, is_out)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                args: [
                    matchId,
                    entry.player_id,
                    entry.runs_scored,
                    entry.balls_faced,
                    entry.wickets_taken,
                    entry.overs_bowled,
                    entry.runs_conceded,
                    entry.is_out
                ]
            });
        }

        // 3. Recalculate and update cumulative stats for EACH affected player
        for (const entry of entries) {
            const playerId = entry.player_id;

            // Fetch aggregated stats for this player
            const statsResult = await db.execute({
                sql: `
                SELECT 
                    COUNT(*) as matches_played,
                    SUM(runs_scored) as total_runs,
                    SUM(wickets_taken) as total_wickets,
                    MAX(runs_scored) as highest_score
                FROM match_performances 
                WHERE player_id = ?
                `,
                args: [playerId]
            });

            const stats = statsResult.rows[0];

            // Calculate Best Bowling (most wickets, then least runs)
            const bowlingResult = await db.execute({
                sql: `
                SELECT wickets_taken, runs_conceded 
                FROM match_performances 
                WHERE player_id = ? AND wickets_taken > 0
                ORDER BY wickets_taken DESC, runs_conceded ASC
                LIMIT 1
                `,
                args: [playerId]
            });

            let best_bowling = '0/0';
            if (bowlingResult.rows.length > 0) {
                const best = bowlingResult.rows[0];
                best_bowling = `${best.wickets_taken}/${best.runs_conceded}`;
            }

            // Update Player Registry
            await db.execute({
                sql: `
                UPDATE registrations 
                SET matches_played = ?, total_runs = ?, total_wickets = ?, highest_score = ?, best_bowling = ?
                WHERE id = ?
                `,
                args: [
                    stats.matches_played || 0,
                    stats.total_runs || 0,
                    stats.total_wickets || 0,
                    stats.highest_score || 0,
                    best_bowling,
                    playerId
                ]
            });
        }

        revalidatePath('/admin/stats');
        revalidatePath('/matches');
        revalidatePath('/admin/matches');

    } catch (error) {
        console.error('Failed to save scorecard:', error);
        throw new Error('Failed to save scorecard');
    }
}
