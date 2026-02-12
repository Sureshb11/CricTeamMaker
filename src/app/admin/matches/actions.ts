'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addMatch(formData: FormData) {
    const opponent = formData.get('opponent') as string;
    const date = formData.get('date') as string;
    const venue = formData.get('venue') as string;
    const result = formData.get('result') as string;
    const score = formData.get('score') as string;
    const home_team = formData.get('home_team') as string;
    const away_team = formData.get('away_team') as string;

    if (!date || (!opponent && !away_team) || !venue) {
        // Basic validation
        return { error: 'Please fill required fields' };
    }

    try {
        await db.execute({
            sql: `
            INSERT INTO matches (opponent, date, venue, result, score, home_team, away_team)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
            args: [opponent, date, venue, result, score, home_team, away_team]
        });

        revalidatePath('/matches');
        revalidatePath('/admin/matches');
    } catch (error) {
        console.error('Failed to add match:', error);
        return { error: 'Failed to add match' };
    }
}

export async function deleteMatch(id: number) {
    try {
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
