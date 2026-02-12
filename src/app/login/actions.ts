'use server';

import db from '@/lib/db';
import { createSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { sendOtpEmail } from '@/lib/email';

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestOtp(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return { error: 'Please enter a valid email address.', step: 'email' };
    }

    // Check if user exists
    const result = await db.execute({
        sql: 'SELECT * FROM registrations WHERE email = ?',
        args: [email]
    });
    const user = result.rows[0] as any;

    if (!user) {
        return { error: 'No account found with this email. Please register first.', step: 'email' };
    }

    // Generate and store OTP
    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    await db.execute({
        sql: `
    INSERT INTO otp_codes (email, otp, expires_at)
    VALUES (?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET otp = ?, expires_at = ?
  `,
        args: [email, otp, expiresAt, otp, expiresAt]
    });

    // Send Email (Non-blocking for speed)
    sendOtpEmail(email, otp, 'login').catch(err => console.error('Background email failed:', err));

    // Instant return for better UI UX
    return { success: true, email, step: 'otp' };
}

export async function verifyOtp(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const otp = formData.get('otp') as string;

    if (!otp || otp.length !== 6) {
        return { error: 'Please enter a valid 6-digit code.', step: 'otp', email };
    }

    const otpResult = await db.execute({
        sql: 'SELECT * FROM otp_codes WHERE email = ?',
        args: [email]
    });
    const record = otpResult.rows[0] as any;

    if (!record) {
        return { error: 'Invalid request. Please try again.', step: 'email' };
    }

    if (record.otp !== otp) {
        return { error: 'Invalid code. Please try again.', step: 'otp', email };
    }

    if (Date.now() > record.expires_at) {
        return { error: 'Code expired. Please request a new one.', step: 'email' };
    }

    // Valid OTP
    // Get user details again to be sure
    const userResult = await db.execute({
        sql: 'SELECT * FROM registrations WHERE email = ?',
        args: [email]
    });
    const user = userResult.rows[0] as any;

    // Create Session
    await createSession(user.email, user.id);

    // Delete used OTP
    await db.execute({
        sql: 'DELETE FROM otp_codes WHERE email = ?',
        args: [email]
    });

    redirect('/');
}
