'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deletePlayer(id: number) {
    try {
        await db.execute({
            sql: 'DELETE FROM registrations WHERE id = ?',
            args: [id]
        });
        revalidatePath('/team');
        revalidatePath('/admin/players');
    } catch (error) {
        console.error('Failed to delete player:', error);
    }
}
