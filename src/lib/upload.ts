import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function saveFile(file: File, subfolder: string): Promise<string | null> {
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
