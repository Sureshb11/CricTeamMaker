const db = require('better-sqlite3')('cricket.db');

const row = db.prepare('SELECT otp FROM otp_codes ORDER BY expires_at DESC LIMIT 1').get();

if (row) {
    console.log(row.otp);
} else {
    console.log('NO_OTP');
}
