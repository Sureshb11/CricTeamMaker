'use client';

import { useActionState, useEffect, useState } from 'react';
import { requestOtp, verifyOtp } from './actions';
import styles from './page.module.css';
import Link from 'next/link';

const initialState = {
    error: '',
    step: 'email',
    email: '',
};

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
        // Dispatch to correct action based on hidden field or state
        // Actually, useActionState binds to one action.
        // We can handle this by having two different forms or a wrapper action?
        // Wrapper action approach:
        const step = formData.get('current_step');
        if (step === 'email') {
            return requestOtp(prev, formData);
        } else {
            return verifyOtp(prev, formData);
        }
    }, initialState);

    // We need to keep local state for inputs to persist between renders if needed, 
    // but form actions handle this mostly.

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Login to access your dashboard.</p>

                {state.error && (
                    <div className={styles.error}>{state.error}</div>
                )}

                {state.step === 'email' ? (
                    <form action={formAction}>
                        <input type="hidden" name="current_step" value="email" />
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your registered email"
                                required
                                className={styles.input}
                            />
                        </div>
                        <button type="submit" className={styles.button} disabled={isPending}>
                            {isPending ? 'Sending Code...' : 'Send Login Code'}
                        </button>
                    </form>
                ) : (
                    <form action={formAction}>
                        <input type="hidden" name="current_step" value="otp" />
                        <input type="hidden" name="email" value={state.email} />
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <p>Code sent to <strong>{state.email}</strong></p>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="otp">Enter 6-Digit Code</label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                placeholder="123456"
                                required
                                maxLength={6}
                                className={styles.input}
                                style={{ letterSpacing: '5px', textAlign: 'center', fontSize: '1.5rem' }}
                            />
                        </div>
                        <button type="submit" className={styles.button} disabled={isPending}>
                            {isPending ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() => window.location.reload()} // Simple reset
                        >
                            Wrong email? Try again
                        </button>
                    </form>
                )}

                <div className={styles.footer}>
                    Don't have an account? <Link href="/register">Register here</Link>
                </div>
            </div>
        </div>
    );
}
