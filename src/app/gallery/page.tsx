import styles from './page.module.css';
import db from '@/lib/db';

async function getImages() {
    return db.prepare('SELECT * FROM gallery_images ORDER BY created_at DESC').all() as any[];
}

export default async function GalleryPage() {
    const images = await getImages();

    return (
        <div>
            <h1 className="text-center" style={{ fontSize: '3rem', marginBottom: '10px', color: 'var(--primary-color)' }}>Gallery</h1>
            <p className="text-center" style={{ color: 'var(--text-muted)' }}>Relive the best moments.</p>

            {images.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
                    <p>No photos uploaded yet.</p>
                </div>
            ) : (
                <div className={styles.galleryGrid}>
                    {images.map((img) => (
                        <div key={img.id} className={styles.galleryItem}>
                            <img src={img.image_url} alt={img.caption || 'Team Photo'} className={styles.galleryImage} />
                            {img.caption && (
                                <div className={styles.overlay}>
                                    <span className={styles.caption}>{img.caption}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
