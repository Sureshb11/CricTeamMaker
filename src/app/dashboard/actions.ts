'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Generic File Saver (Duplicated for now to avoid refactoring risks)
async function saveFile(file: File, subfolder: string): Promise<string | null> {
    if (!file || file.size === 0 || file.name === 'undefined') return null;

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filename = `${timestamp}-${safeName}`;

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', subfolder);
        await mkdir(uploadDir, { recursive: true });

        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return `/${subfolder}/${filename}`;
    } catch (error) {
        console.error(`Error saving file to ${subfolder}:`, error);
        return null;
    }
}

export async function updateProfile(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const phone = formData.get('phone') as string;
    const playing_role = formData.get('playing_role') as string;
    const experience_level = formData.get('experience_level') as string;
    const profile_photo_file = formData.get('profile_photo') as File;

    // Validate Phone
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return { error: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    let photo_url: string | null = null;
    if (profile_photo_file && profile_photo_file.size > 0) {
        photo_url = await saveFile(profile_photo_file, 'player-photos');
    }

    try {
        if (photo_url) {
            await db.execute({
                sql: `
                UPDATE registrations 
                SET phone = ?, playing_role = ?, experience_level = ?, photo_url = ?
                WHERE id = ?
                `,
                args: [phone, playing_role, experience_level, photo_url, session.userId]
            });
        } else {
            await db.execute({
                sql: `
                UPDATE registrations 
                SET phone = ?, playing_role = ?, experience_level = ?
                WHERE id = ?
                `,
                args: [phone, playing_role, experience_level, session.userId]
            });
        }

        revalidatePath('/dashboard');
        revalidatePath('/team');

    } catch (error) {
        console.error('Update Profile Error:', error);
        return { error: 'Failed to update profile.' };
    }

    redirect('/dashboard');
}
