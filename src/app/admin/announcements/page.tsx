import db from '@/lib/db';
import { createAnnouncement, deleteAnnouncement } from './actions';
import styles from '@/app/register/page.module.css';

async function getAnnouncements() {
    const result = await db.execute('SELECT * FROM announcements ORDER BY created_at DESC');
    return result.rows as any[];
}

export default async function ManageAnnouncements() {
    const announcements = await getAnnouncements();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '30px' }}>Team Announcements</h1>

            {/* Post Announcement Form */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Post New Announcement</h2>
                <form action={createAnnouncement}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Title</label>
                        <input type="text" name="title" className={styles.input} placeholder="e.g. Practice Cancelled" required />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Message</label>
                        <textarea name="message" className={styles.input} rows={4} placeholder="Details here..." required style={{ padding: '10px' }}></textarea>
                    </div>

                    <button type="submit" className={styles.button}>Post Announcement</button>
                </form>
            </div>

            {/* List Announcements */}
            <h2 style={{ marginBottom: '20px' }}>History</h2>
            <div>
                {announcements.map(item => (
                    <div key={item.id} style={{
                        background: '#1a1a1a',
                        padding: '20px',
                        marginBottom: '15px',
                        borderRadius: '8px',
                        borderLeft: '4px solid var(--primary-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start'
                    }}>
                        <div>
                            <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>{item.title}</h3>
                            <p style={{ color: '#ccc', margin: 0, whiteSpace: 'pre-wrap' }}>{item.message}</p>
                            <small style={{ color: '#666', marginTop: '10px', display: 'block' }}>Posted: {new Date(item.created_at).toLocaleString()}</small>
                        </div>
                        <form action={async () => {
                            'use server';
                            await deleteAnnouncement(item.id);
                        }}>
                            <button style={{
                                background: 'transparent',
                                border: '1px solid #444',
                                color: '#ff5252',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginLeft: '10px'
                            }}>
                                Delete
                            </button>
                        </form>
                    </div>
                ))}
            </div>
        </div>
    );
}
