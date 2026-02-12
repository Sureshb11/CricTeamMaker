'use client';

import { useActionState } from 'react';
import { updateProfile } from '../actions';
import styles from '../../register/page.module.css'; // Reuse register form styles

// We can reuse the register styles since they are generic form styles.

const initialState = {
    error: '',
};

export default function EditProfileForm({ user }: { user: any }) {
    const [state, formAction, isPending] = useActionState(updateProfile as any, initialState);

    return (
        <form action={formAction}>
            {state?.error && (
                <div style={{ color: '#ff5252', marginBottom: '20px', textAlign: 'center', background: 'rgba(255, 82, 82, 0.1)', padding: '10px', borderRadius: '6px' }}>
                    {state.error}
                </div>
            )}

            <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                    type="text"
                    className={styles.input}
                    value={user.full_name}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>Name cannot be changed.</small>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Team</label>
                <input
                    type="text"
                    className={styles.input}
                    value={user.team_name}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>Team is fixed. Contact admin to change.</small>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>Phone Number</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={styles.input}
                    required
                    defaultValue={user.phone}
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="playing_role" className={styles.label}>Playing Role</label>
                <select
                    id="playing_role"
                    name="playing_role"
                    className={styles.select}
                    required
                    defaultValue={user.playing_role}
                >
                    <option value="" disabled>Select your role</option>
                    <optgroup label="Batting">
                        <option value="Batsman (Opening)">Batsman (Opening)</option>
                        <option value="Batsman (Middle Order)">Batsman (Middle Order)</option>
                        <option value="Batsman (Finisher)">Batsman (Finisher)</option>
                    </optgroup>
                    <optgroup label="Wicket Keeping">
                        <option value="Wicket-keeper">Wicket-keeper</option>
                        <option value="Wicket-keeper Batsman">Wicket-keeper Batsman</option>
                    </optgroup>
                    <optgroup label="All-Rounders">
                        <option value="Batting All-rounder">Batting All-rounder</option>
                        <option value="Bowling All-rounder">Bowling All-rounder</option>
                    </optgroup>
                    <optgroup label="Pace Bowling">
                        <option value="Right-arm Fast">Right-arm Fast</option>
                        <option value="Right-arm Fast-Medium">Right-arm Fast-Medium</option>
                        <option value="Right-arm Medium">Right-arm Medium</option>
                        <option value="Left-arm Fast">Left-arm Fast</option>
                        <option value="Left-arm Fast-Medium">Left-arm Fast-Medium</option>
                        <option value="Left-arm Medium">Left-arm Medium</option>
                    </optgroup>
                    <optgroup label="Spin Bowling">
                        <option value="Right-arm Off Spin (Off Break)">Right-arm Off Spin (Off Break)</option>
                        <option value="Right-arm Leg Spin (Leg Break)">Right-arm Leg Spin (Leg Break)</option>
                        <option value="Left-arm Orthodox">Left-arm Orthodox</option>
                        <option value="Left-arm Unorthodox (Chinaman)">Left-arm Unorthodox (Chinaman)</option>
                    </optgroup>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="experience_level" className={styles.label}>Experience Level</label>
                <select
                    id="experience_level"
                    name="experience_level"
                    className={styles.select}
                    defaultValue={user.experience_level}
                >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate (Club Level)</option>
                    <option value="Professional">Professional</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="profile_photo" className={styles.label}>Update Profile Photo</label>
                {user.photo_url && (
                    <div style={{ marginBottom: '10px' }}>
                        <img src={user.photo_url} alt="Current" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', verticalAlign: 'middle', marginRight: '10px' }} />
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>Current Photo</span>
                    </div>
                )}
                <input
                    type="file"
                    id="profile_photo"
                    name="profile_photo"
                    accept="image/*"
                    className={styles.input}
                    style={{ padding: '10px', background: 'transparent' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button type="submit" className={styles.button} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <a href="/dashboard" className={styles.button} style={{ background: 'transparent', border: '1px solid #444', color: '#fff', textAlign: 'center', textDecoration: 'none' }}>
                    Cancel
                </a>
            </div>
        </form>
    );
}
