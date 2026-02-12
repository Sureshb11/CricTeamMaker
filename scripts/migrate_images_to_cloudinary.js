
const { createClient } = require('@libsql/client');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Database
const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function uploadFile(localPath, folder) {
    try {
        const fullPath = path.join(process.cwd(), 'public', localPath);
        if (!fs.existsSync(fullPath)) {
            console.warn(`File not found: ${fullPath}`);
            return null;
        }

        console.log(`Uploading ${localPath} to ${folder}...`);
        const result = await cloudinary.uploader.upload(fullPath, {
            folder: `cric-team-maker/${folder}`
        });
        return result.secure_url;
    } catch (error) {
        console.error(`Upload failed for ${localPath}:`, error.message);
        return null;
    }
}

async function migrateImages() {
    console.log('Starting Image Migration to Cloudinary...');

    // 1. Migrate Registrations (Profile Photos)
    console.log('\n--- Migrating Registrations ---');
    const registrations = await db.execute("SELECT id, photo_url FROM registrations WHERE photo_url LIKE '/uploads/%'");
    for (const row of registrations.rows) {
        const newUrl = await uploadFile(row.photo_url, 'profiles');
        if (newUrl) {
            await db.execute({
                sql: "UPDATE registrations SET photo_url = ? WHERE id = ?",
                args: [newUrl, row.id]
            });
            console.log(`Updated registration ${row.id}`);
        }
    }

    // 2. Migrate Teams (Logos)
    console.log('\n--- Migrating Teams ---');
    const teams = await db.execute("SELECT id, logo_url FROM teams WHERE logo_url LIKE '/uploads/%'");
    for (const row of teams.rows) {
        const newUrl = await uploadFile(row.logo_url, 'teams');
        if (newUrl) {
            await db.execute({
                sql: "UPDATE teams SET logo_url = ? WHERE id = ?",
                args: [newUrl, row.id]
            });
            console.log(`Updated team ${row.id}`);
        }
    }

    // 3. Migrate Gallery Images
    console.log('\n--- Migrating Gallery ---');
    try {
        const gallery = await db.execute("SELECT id, image_url FROM gallery_images WHERE image_url LIKE '/uploads/%'");
        for (const row of gallery.rows) {
            const newUrl = await uploadFile(row.image_url, 'gallery');
            if (newUrl) {
                await db.execute({
                    sql: "UPDATE gallery_images SET image_url = ? WHERE id = ?",
                    args: [newUrl, row.id]
                });
                console.log(`Updated gallery image ${row.id}`);
            }
        }
    } catch (e) {
        console.log('Gallery table might not exist or empty:', e.message);
    }

    console.log('\nMigration Complete!');
}

migrateImages().catch(console.error);
