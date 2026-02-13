import db from '@/lib/db';
import { createAnnouncement, deleteAnnouncement } from './actions';
import styles from '@/app/register/page.module.css';
import { Megaphone, Send, Trash2, Clock } from 'lucide-react';

async function getAnnouncements() {
    const result = await db.execute('SELECT * FROM announcements ORDER BY created_at DESC');
    return result.rows as any[];
}

export default async function ManageAnnouncements() {
    const announcements = await getAnnouncements();

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Megaphone size={28} /> Team Announcements
                </h1>
                <p style={{ color: '#888', marginTop: '5px' }}>Broadcast messages to all team members</p>
            </div>

            {/* Post Announcement Form */}
            <div className="card" style={{ marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '25px', color: 'var(--primary-color)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Send size={20} /> Post New Announcement
                </h2>
                <form action={async (formData) => {
                    'use server';
                    await createAnnouncement(formData);
                }}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Title</label>
                        <input type="text" name="title" className={styles.input} placeholder="e.g. Practice Cancelled" required />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Message</label>
                        <textarea name="message" className={styles.input} rows={4} placeholder="Details here..." required style={{ padding: '15px' }}></textarea>
                    </div>

                    <button type="submit" className={styles.button} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <Send size={18} /> Post Announcement
                    </button>
                </form>
            </div>

            {/* List Announcements */}
            <h2 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Announcement History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {announcements.length > 0 ? (
                    announcements.map(item => (
                        <div key={item.id} className="card" style={{
                            borderLeft: '4px solid var(--primary-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            padding: '24px'
                        }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '1.1rem' }}>{item.title}</h3>
                                <p style={{ color: '#aaa', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{item.message}</p>
                                <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={12} style={{ color: '#666' }} />
                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Posted: {new Date(item.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                            <form action={async () => {
                                'use server';
                                await deleteAnnouncement(item.id);
                            }}>
                                <button style={{
                                    background: 'rgba(255, 82, 82, 0.05)',
                                    border: '1px solid rgba(255, 82, 82, 0.1)',
                                    color: '#ff5252',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    marginLeft: '15px',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </form>
                        </div>
                    ))
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: '#888' }}>No announcements yet. Post your first one above!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
