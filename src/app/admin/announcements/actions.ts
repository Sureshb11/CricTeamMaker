'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createAnnouncement(formData: FormData) {
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;

    if (!title || !message) {
        return { error: 'Please fill all fields.' };
    }

    try {
        await db.execute({
            sql: 'INSERT INTO announcements (title, message) VALUES (?, ?)',
            args: [title, message]
        });
        revalidatePath('/dashboard');
        revalidatePath('/admin/announcements');
    } catch (error) {
        console.error('Database error:', error);
        return { error: 'Failed to post announcement.' };
    }
}

export async function deleteAnnouncement(id: number) {
    await db.execute({
        sql: 'DELETE FROM announcements WHERE id = ?',
        args: [id]
    });
    revalidatePath('/dashboard');
    revalidatePath('/admin/announcements');
}
