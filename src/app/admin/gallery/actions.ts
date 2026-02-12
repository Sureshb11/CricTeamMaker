'use server';

import db from '@/lib/db';
import { saveFile } from '@/lib/upload';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function uploadGalleryImage(formData: FormData) {
    const caption = formData.get('caption') as string;
    const file = formData.get('image') as File;

    if (!file || file.size === 0) {
        return { error: 'Please select an image.' };
    }

    let image_url = '';
    try {
        image_url = await uploadToCloudinary(file, 'gallery');
    } catch (error) {
        console.error('Upload error:', error);
        return { error: 'Failed to upload image to Cloud.' };
    }

    if (!image_url) {
        return { error: 'Failed to upload image.' };
    }

    try {
        await db.execute({
            sql: 'INSERT INTO gallery_images (image_url, caption) VALUES (?, ?)',
            args: [image_url, caption]
        });
        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
    } catch (error) {
        console.error('Database error:', error);
        return { error: 'Failed to save to database.' };
    }
}

export async function deleteGalleryImage(id: number) {
    await db.execute({
        sql: 'DELETE FROM gallery_images WHERE id = ?',
        args: [id]
    });
    revalidatePath('/gallery');
    revalidatePath('/admin/gallery');
}
