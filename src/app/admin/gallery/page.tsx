import db from '@/lib/db';
import { uploadGalleryImage, deleteGalleryImage } from './actions';
import styles from '@/app/register/page.module.css';
import { Image as ImageIcon, Upload, Trash2 } from 'lucide-react';

async function getImages() {
    const result = await db.execute('SELECT * FROM gallery_images ORDER BY created_at DESC');
    return result.rows as any[];
}

export default async function ManageGallery() {
    const images = await getImages();

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ImageIcon size={28} /> Manage Gallery
                </h1>
                <p style={{ color: '#888', marginTop: '5px' }}>Upload photos from recent matches and events</p>
            </div>

            {/* Upload Form */}
            <div className="card" style={{ marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '25px', color: 'var(--primary-color)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Upload size={20} /> Upload New Photo
                </h2>
                <form action={async (formData) => {
                    'use server';
                    await uploadGalleryImage(formData);
                }}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Caption (Optional)</label>
                        <input type="text" name="caption" className={styles.input} placeholder="e.g. Winning Moment 2024" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Photo File</label>
                        <input type="file" name="image" className={styles.input} accept="image/*" required style={{ padding: '12px' }} />
                    </div>

                    <button type="submit" className={styles.button} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <ImageIcon size={18} /> Upload to Gallery
                    </button>
                </form>
            </div>

            {/* Gallery Grid */}
            <h2 style={{ marginBottom: '25px', fontSize: '1.25rem' }}>Photo Gallery ({images.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {images.length > 0 ? (
                    images.map(img => (
                        <div key={img.id} className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                            <div style={{ height: '200px', overflow: 'hidden' }}>
                                <img src={img.image_url} alt={img.caption || 'Gallery Image'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)' }}>
                                <p style={{ fontSize: '0.9rem', color: '#ccc', margin: '0 0 15px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {img.caption || 'No Caption'}
                                </p>
                                <form action={async () => {
                                    'use server';
                                    await deleteGalleryImage(img.id);
                                }}>
                                    <button style={{
                                        width: '100%',
                                        background: 'rgba(255, 82, 82, 0.05)',
                                        border: '1px solid rgba(255, 82, 82, 0.1)',
                                        color: '#ff5252',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}>
                                        <Trash2 size={16} /> Delete Photo
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                        <p style={{ color: '#888' }}>No photos found. Start by uploading one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
