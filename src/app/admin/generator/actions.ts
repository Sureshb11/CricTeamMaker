'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateTeamAssignments(assignments: { playerId: number, teamName: string }[]) {
    try {
        const stmts = assignments.map(item => ({
            sql: 'UPDATE registrations SET team_name = ? WHERE id = ?',
            args: [item.teamName, item.playerId]
        }));

        await db.batch(stmts, 'write');

        revalidatePath('/team');
        revalidatePath('/dashboard');
        revalidatePath('/admin/generator');
        return { success: true };
    } catch (error) {
        console.error('Database error:', error);
        return { error: 'Failed to update teams.' };
    }
}
