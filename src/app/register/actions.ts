'use server';

import db from '@/lib/db';
import { sendOtpEmail } from '@/lib/email';
import { redirect } from 'next/navigation';
import { writeFile, mkdir } from 'fs/promises';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { join } from 'path';
import { createSession } from '@/lib/session';

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function checkEmailExists(email: string) {
    const result = await db.execute({
        sql: 'SELECT id FROM registrations WHERE email = ?',
        args: [email]
    });
    return result.rows.length > 0;
}

export async function initiateRegistration(prevState: any, formData: FormData) {
    const full_name = formData.get('full_name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    let team_name = formData.get('team_name') as string;
    const playing_role = formData.get('playing_role') as string;
    const experience_level = formData.get('experience_level') as string;

    // Optional Files
    const profile_photo = formData.get('profile_photo') as File;
    const team_logo = formData.get('team_logo') as File; // Only if New Team
    const new_team_name = formData.get('new_team_name') as string;

    const inputs = { full_name, email, phone, team_name, playing_role, experience_level };

    if (!full_name || !email || !phone || !team_name || !playing_role) {
        return { error: 'Please fill in all required fields.', step: 'details', inputs };
    }

    // Check if email already registered
    if (await checkEmailExists(email)) {
        return { error: 'Email is already registered.', step: 'details', inputs };
    }

    // Handle New Team Logic
    let team_logo_url = null;
    if (team_name === 'New Team') {
        if (!new_team_name) {
            return { error: 'Please enter a name for your new team.', step: 'details', inputs };
        }
        team_name = new_team_name;

        if (team_logo && team_logo.size > 0) {
            try {
                team_logo_url = await uploadToCloudinary(team_logo, 'teams');
            } catch (e) {
                console.error("Team Logo Upload Error", e);
                return { error: 'Failed to upload team logo.', step: 'details', inputs };
            }
        }
    }

    // Handle Profile Photo
    let photo_url = null;
    if (profile_photo && profile_photo.size > 0) {
        try {
            photo_url = await uploadToCloudinary(profile_photo, 'profiles');
        } catch (e) {
            console.error("Profile Photo Upload Error", e);
            return { error: 'Failed to upload profile photo.', step: 'details', inputs };
        }
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const registrationData = JSON.stringify({
        full_name,
        email,
        phone,
        team_name,
        playing_role,
        experience_level,
        photo_url,
        team_logo_url
    });

    try {
        // Store OTP and Details
        await db.execute({
            sql: `
            INSERT INTO otp_codes (email, otp, expires_at, data)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET otp = ?, expires_at = ?, data = ?
         `,
            args: [email, otp, expiresAt, registrationData, otp, expiresAt, registrationData]
        });

        // Send Email (Must await in serverless)
        try {
            await sendOtpEmail(email, otp);
        } catch (error) {
            console.error('Failed to send OTP email:', error);
            return { error: 'Failed to send verification email. Please try again.', step: 'details', inputs };
        }

        return { success: true, step: 'verify', email: email, message: 'OTP sent to your email.', inputs };

    } catch (error) {
        console.error(error);
        return { error: 'System error. Please try again.', step: 'details', inputs };
    }
}

async function verifyAndRegister(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const otp = formData.get('otp') as string;

    if (!otp || otp.length !== 6) {
        return { error: 'Invalid OTP format.', step: 'verify', email: email };
    }

    const otpResult = await db.execute({
        sql: 'SELECT * FROM otp_codes WHERE email = ?',
        args: [email]
    });
    const record = otpResult.rows[0] as any;

    if (!record) {
        return { error: 'Session expired. Please register again.', step: 'details' };
    }

    if (record.otp !== otp) {
        return { error: 'Incorrect OTP. Please try again.', step: 'verify', email: email };
    }

    if (Date.now() > record.expires_at) {
        return { error: 'OTP expired. Please register again.', step: 'details' };
    }

    // OTP Valid - Register User
    const data = JSON.parse(record.data);

    try {
        // Ensure team exists (for New Team) with Logo
        if (data.team_logo_url) {
            await db.execute({
                sql: `
                INSERT INTO teams (name, logo_url) VALUES (?, ?)
                ON CONFLICT(name) DO UPDATE SET logo_url = excluded.logo_url
            `,
                args: [data.team_name, data.team_logo_url]
            });
        } else {
            await db.execute({
                sql: `INSERT OR IGNORE INTO teams (name) VALUES (?)`,
                args: [data.team_name]
            });
        }

        const result = await db.execute({
            sql: `
            INSERT INTO registrations (full_name, email, phone, team_name, playing_role, experience_level, photo_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
            args: [data.full_name, data.email, data.phone, data.team_name, data.playing_role, data.experience_level, data.photo_url || null]
        });

        const userId = Number(result.lastInsertRowid);

        // Auto-Login: Create Session
        await createSession(email, userId);

        // Clean up OTP
        await db.execute({
            sql: 'DELETE FROM otp_codes WHERE email = ?',
            args: [email]
        });

    } catch (error) {
        console.error("Registration DB Error:", error);
        return { error: 'Failed to save registration. Please try again.', step: 'verify', email: email };
    }

    // Redirect to Home (Dashboard) after successful registration and auto-login
    // Redirect to Home (Dashboard) after successful registration and auto-login
    redirect('/');
}

export async function registerPlayer(prevState: any, formData: FormData) {
    const step = formData.get('step') as string;
    if (step === 'verify') {
        return verifyAndRegister(prevState, formData);
    }
    return initiateRegistration(prevState, formData);
}
