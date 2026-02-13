'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updatePlayerStats(formData: FormData) {
    const id = formData.get('id') as string;
    const matches_played = formData.get('matches_played') as string;
    const total_runs = formData.get('total_runs') as string;
    const total_wickets = formData.get('total_wickets') as string;
    const highest_score = formData.get('highest_score') as string;
    const best_bowling = formData.get('best_bowling') as string;

    try {
        await db.execute({
            sql: `
            UPDATE registrations 
            SET matches_played = ?, total_runs = ?, total_wickets = ?, highest_score = ?, best_bowling = ?
            WHERE id = ?
        `,
            args: [matches_played, total_runs, total_wickets, highest_score, best_bowling, id]
        });

        revalidatePath('/dashboard');
        revalidatePath('/team');
        revalidatePath('/admin/stats');
        return { success: true };
    } catch (error) {
        console.error('Database error:', error);
        return { error: 'Failed to update stats.' };
    }
}

export async function updateBulkStats(updates: any[]) {
    try {
        for (const update of updates) {
            await db.execute({
                sql: `
                UPDATE registrations 
                SET matches_played = ?, total_runs = ?, total_wickets = ?, highest_score = ?, best_bowling = ?
                WHERE id = ?
                `,
                args: [
                    update.matches_played,
                    update.total_runs,
                    update.total_wickets,
                    update.highest_score,
                    update.best_bowling,
                    update.id
                ]
            });
        }

        revalidatePath('/dashboard');
        revalidatePath('/team');
        revalidatePath('/admin/stats');
        return { success: true };
    } catch (error) {
        console.error('Bulk update error:', error);
        return { error: 'Failed to update bulk stats.' };
    }
}
