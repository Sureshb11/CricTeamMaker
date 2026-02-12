import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string, type: 'register' | 'login' = 'register') {
  const subject = type === 'register' ? 'Verify your email for DVS Team' : 'Login Code for DVS Team';
  const title = type === 'register' ? 'DVS Registration' : 'DVS Login';
  const message = type === 'register'
    ? 'Please verify your email address to complete registration.'
    : 'Use the code below to sign in to your account.';

  try {
    const info = await transporter.sendMail({
      from: `"DVS Team" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: `Your verification code is: ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #00ff88;">${title}</h2>
          <p>${message}</p>
          <div style="background: #f4f4f4; padding: 15px; font-size: 24px; letter-spacing: 5px; font-weight: bold; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
