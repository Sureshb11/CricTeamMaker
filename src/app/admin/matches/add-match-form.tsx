'use client';

import { useState } from 'react';
import { addMatch } from './actions';
import { Calendar, MapPin, Shield, Plus, Clock } from 'lucide-react';
import styles from '@/app/register/page.module.css';

const labelStyle = { display: 'flex', alignItems: 'center', gap: '8px' };

export default function AddMatchForm() {
    const [isLoading, setIsLoading] = useState(false);

    // Use uncontrolled inputs with name attributes for server action compatibility
    // but handle submission client-side to show alerts/loading state.

    async function performAddMatch(formData: FormData) {
        setIsLoading(true);
        try {
            const result = await addMatch(formData);
            if (result?.error) {
                alert(result.error);
            } else if (result?.success) {
                alert('Match added successfully!');
                // Reset form
                const form = document.getElementById('add-match-form') as HTMLFormElement;
                form.reset();
            }
        } catch (e) {
            alert('An unexpected error occurred.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form id="add-match-form" action={performAddMatch}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className={styles.formGroup}>
                    <label className={styles.label} style={labelStyle}>
                        <Calendar size={14} /> Date
                    </label>
                    <input type="date" name="date" className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label} style={labelStyle}>
                        <Clock size={14} /> Time
                    </label>
                    <input type="time" name="time" className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label} style={labelStyle}>
                        <MapPin size={14} /> Venue
                    </label>
                    <input type="text" name="venue" className={styles.input} placeholder="e.g. Green Park Stadium" required />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className={styles.formGroup}>
                    <label className={styles.label} style={labelStyle}>
                        <Shield size={14} /> Home Team
                    </label>
                    <input type="text" name="home_team" className={styles.input} defaultValue="DVS TEAM" />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label} style={labelStyle}>
                        <Shield size={14} /> Away Team / Opponent
                    </label>
                    <input type="text" name="away_team" className={styles.input} placeholder="e.g. Rogue XI" required />
                </div>
            </div>

            <button type="submit" className={styles.button} disabled={isLoading} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}>
                <Plus size={18} /> {isLoading ? 'Adding...' : 'Add Match'}
            </button>
        </form>
    );
}
