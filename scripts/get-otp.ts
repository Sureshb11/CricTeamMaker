
import db from '../src/lib/db';

async function main() {
    const email = 'bsb.suresh11@gmail.com';
    try {
        const result = await db.execute({
            sql: 'SELECT otp FROM otp_codes WHERE email = ?',
            args: [email]
        });

        if (result.rows.length > 0) {
            console.log(result.rows[0].otp);
        } else {
            console.error('No OTP found for', email);
            process.exit(1);
        }
    } catch (error) {
        console.error('Database error:', error);
        process.exit(1);
    }
}

main();
