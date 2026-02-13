'use client';

import { useActionState, useEffect, useState } from 'react';
import { registerPlayer } from './actions';
import styles from './page.module.css';
import { User, Mail, Phone, Shield, Image as ImageIcon, UserCircle, Star, Send } from 'lucide-react';

type FormInputs = {
    full_name?: string;
    email?: string;
    phone?: string;
    team_name?: string;
    playing_role?: string;
    experience_level?: string;
    team_logo_url?: string | null;
};

type FormState = {
    error?: string;
    step: string;
    email?: string;
    message?: string;
    inputs?: FormInputs;
    success?: boolean;
};

// Ensure initialState matches the structure expected by the action return
const initialState: FormState = {
    error: '',
    step: 'details',
    email: '',
    message: '',
    inputs: {},
    success: false,
};

type Team = {
    id: number;
    name: string;
}

export default function RegisterForm({ teams }: { teams: Team[] }) {
    const [state, formAction, isPending] = useActionState(registerPlayer as any, initialState);
    const [teamSelection, setTeamSelection] = useState<string>(state.inputs?.team_name || '');

    const labelStyle = { display: 'flex', alignItems: 'center', gap: '8px' };

    // Sync state update if server returns a different team name (e.g. from persisted input)
    useEffect(() => {
        if (state.inputs?.team_name) {
            setTeamSelection(state.inputs.team_name);
        }
    }, [state.inputs?.team_name]);

    // Scroll to top on error or step change
    useEffect(() => {
        if (state.error || state.message) {
            window.scrollTo(0, 0);
        }
    }, [state]);

    if (state.step === 'verify') {
        return (
            <form action={formAction} className={styles.formContainer}>
                <input type="hidden" name="step" value="verify" />
                <input type="hidden" name="email" value={state.email} />

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: 'var(--primary-color)' }}>Verify Email</h2>
                    <p>We sent a 6-digit code to <strong>{state.email}</strong></p>
                </div>

                {state.error && (
                    <div style={{ color: '#ff5252', marginBottom: '20px', textAlign: 'center', background: 'rgba(255, 82, 82, 0.1)', padding: '10px', borderRadius: '6px' }}>
                        {state.error}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="otp" className={styles.label}>Enter OTP Code</label>
                    <input
                        type="text"
                        id="otp"
                        name="otp"
                        className={styles.input}
                        required
                        placeholder="123456"
                        maxLength={6}
                        style={{ letterSpacing: '5px', textAlign: 'center', fontSize: '1.5rem' }}
                    />
                </div>

                <button type="submit" className={styles.button} disabled={isPending}>
                    {isPending ? 'Verifying...' : 'Verify & Complete Registration'}
                </button>

                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => window.location.reload()}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        textAlign: 'center',
                        width: '100%',
                        marginTop: '15px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    Start Over
                </button>
            </form>
        );
    }

    return (
        <form action={formAction}>
            <input type="hidden" name="step" value="details" />

            {state.error && (
                <div style={{ color: '#ff5252', marginBottom: '20px', textAlign: 'center', background: 'rgba(255, 82, 82, 0.1)', padding: '10px', borderRadius: '6px' }}>
                    {state.error}
                </div>
            )}

            <div className={styles.formGroup}>
                <label htmlFor="full_name" className={styles.label} style={labelStyle}>
                    <User size={16} /> Full Name
                </label>
                <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    className={styles.input}
                    required
                    placeholder="Enter your full name"
                    defaultValue={state.inputs?.full_name ?? ''}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label} style={labelStyle}>
                    <Mail size={16} /> Email Address
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className={styles.input}
                    required
                    placeholder="john@example.com"
                    defaultValue={state.inputs?.email ?? ''}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label} style={labelStyle}>
                    <Phone size={16} /> Phone Number (+91)
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={styles.input}
                    required
                    placeholder="98765 43210"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    title="Please enter a valid 10-digit Indian mobile number starting with 6-9"
                    defaultValue={state.inputs?.phone ?? ''}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="team_name" className={styles.label} style={labelStyle}>
                    <Shield size={16} /> Team Name
                </label>
                <select
                    id="team_name"
                    name="team_name"
                    className={styles.select}
                    required
                    value={teamSelection}
                    onChange={(e) => setTeamSelection(e.target.value)}
                >
                    <option value="" disabled>Select your team</option>
                    {teams.map((team) => (
                        <option key={team.id} value={team.name}>{team.name}</option>
                    ))}
                    <option value="New Team">Register New Team (Specify below)</option>
                </select>
            </div>

            {teamSelection === 'New Team' && (
                <div style={{ marginTop: '-10px', marginBottom: '20px', padding: '15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px dashed var(--primary-color)' }}>
                    <div className={styles.formGroup}>
                        <label htmlFor="new_team_name" className={styles.label} style={{ ...labelStyle, color: 'var(--primary-color)' }}>
                            <Shield size={16} /> New Team Name
                        </label>
                        <input
                            type="text"
                            id="new_team_name"
                            name="new_team_name"
                            className={styles.input}
                            required
                            placeholder="Enter the name of your new team"
                            defaultValue={state.inputs?.team_name !== 'New Team' ? state.inputs?.team_name : ''}
                        />
                    </div>

                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label htmlFor="team_logo" className={styles.label} style={{ ...labelStyle, color: '#aaa', fontSize: '0.9rem' }}>
                            <ImageIcon size={14} /> Team Logo (Optional)
                        </label>
                        <input
                            type="file"
                            id="team_logo"
                            name="team_logo"
                            accept="image/*"
                            className={styles.input}
                            style={{ padding: '10px', background: 'transparent' }}
                        />
                    </div>
                </div>
            )}

            <div className={styles.formGroup}>
                <label htmlFor="profile_photo" className={styles.label} style={labelStyle}>
                    <ImageIcon size={16} /> Profile Photo (Optional)
                </label>
                <input
                    type="file"
                    id="profile_photo"
                    name="profile_photo"
                    accept="image/*"
                    className={styles.input}
                    style={{ padding: '10px', background: 'transparent' }}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="playing_role" className={styles.label} style={labelStyle}>
                    <UserCircle size={16} /> Playing Role
                </label>
                <select
                    id="playing_role"
                    name="playing_role"
                    className={styles.select}
                    required
                    defaultValue={state.inputs?.playing_role ?? ''}
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
                <label htmlFor="experience_level" className={styles.label} style={labelStyle}>
                    <Star size={16} /> Experience Level
                </label>
                <select
                    id="experience_level"
                    name="experience_level"
                    className={styles.select}
                    defaultValue={state.inputs?.experience_level ?? 'Beginner'}
                >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate (Club Level)</option>
                    <option value="Professional">Professional</option>
                </select>
            </div>

            <button type="submit" className={styles.button} disabled={isPending} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                {isPending ? 'Sending OTP...' : <><Send size={18} /> Continue to Verification</>}
            </button>
        </form>
    );
}
