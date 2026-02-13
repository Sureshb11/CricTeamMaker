'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { join } from 'path';
import { uploadToCloudinary } from '@/lib/cloudinary';



export async function updateProfile(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const phone = formData.get('phone') as string;
    const playing_role = formData.get('playing_role') as string;
    const experience_level = formData.get('experience_level') as string;
    const team_name = formData.get('team_name') as string;
    const profile_photo_file = formData.get('profile_photo') as File;

    // Fetch user role to verify admin status
    const userResult = await db.execute({
        sql: 'SELECT role FROM registrations WHERE id = ?',
        args: [session.userId]
    });
    const userRole = userResult.rows[0]?.role;
    const isAdmin = userRole === 'admin';

    // Validate Phone
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return { error: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    let photo_url: string | null = null;
    if (profile_photo_file && profile_photo_file.size > 0) {
        try {
            photo_url = await uploadToCloudinary(profile_photo_file, 'player-photos');
        } catch (error) {
            console.error('Profile photo upload error:', error);
            return { error: 'Failed to upload photo.' };
        }
    }

    try {
        let sql = 'UPDATE registrations SET phone = ?, playing_role = ?, experience_level = ?';
        const args: any[] = [phone, playing_role, experience_level];

        if (photo_url) {
            sql += ', photo_url = ?';
            args.push(photo_url);
        }

        if (isAdmin && team_name) {
            sql += ', team_name = ?';
            args.push(team_name);
        }

        sql += ' WHERE id = ?';
        args.push(session.userId);

        await db.execute({ sql, args });

        revalidatePath('/dashboard');
        revalidatePath('/team');

    } catch (error) {
        console.error('Update Profile Error:', error);
        return { error: 'Failed to update profile.' };
    }

    redirect('/dashboard');
}
