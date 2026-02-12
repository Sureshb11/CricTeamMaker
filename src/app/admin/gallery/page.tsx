import db from '@/lib/db';
import { uploadGalleryImage, deleteGalleryImage } from './actions';
import styles from '@/app/register/page.module.css';

async function getImages() {
    const result = await db.execute('SELECT * FROM gallery_images ORDER BY created_at DESC');
    return result.rows as any[];
}

export default async function ManageGallery() {
    const images = await getImages();

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '30px' }}>Manage Gallery</h1>

            {/* Upload Form */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Upload New Photo</h2>
                <form action={uploadGalleryImage}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Caption (Optional)</label>
                        <input type="text" name="caption" className={styles.input} placeholder="e.g. Winning Moment 2024" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Photo</label>
                        <input type="file" name="image" className={styles.input} accept="image/*" required style={{ padding: '10px' }} />
                    </div>

                    <button type="submit" className={styles.button}>Upload Photo</button>
                </form>
            </div>

            {/* Gallery Grid */}
            <h2 style={{ marginBottom: '20px' }}>Uploaded Photos ({images.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {images.map(img => (
                    <div key={img.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                        <img src={img.image_url} alt={img.caption} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                        <div style={{ padding: '10px', background: '#1a1a1a' }}>
                            <p style={{ fontSize: '0.8rem', color: '#ccc', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {img.caption || 'No Caption'}
                            </p>
                            <form action={async () => {
                                'use server';
                                await deleteGalleryImage(img.id);
                            }}>
                                <button style={{
                                    width: '100%',
                                    marginTop: '10px',
                                    background: '#ff5252',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}>
                                    Delete
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
