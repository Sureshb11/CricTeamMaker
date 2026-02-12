import db from '../src/lib/db';

async function checkSchema() {
    console.log('Checking registrations schema...');
    try {
        const result = await db.execute("PRAGMA table_info(registrations)");
        console.table(result.rows);

        console.log('\nChecking teams schema...');
        const teamResult = await db.execute("PRAGMA table_info(teams)");
        console.table(teamResult.rows);

        console.log('\nChecking otp_codes schema...');
        const otpResult = await db.execute("PRAGMA table_info(otp_codes)");
        console.table(otpResult.rows);
    } catch (e) {
        console.error(e);
    }
}

checkSchema();
