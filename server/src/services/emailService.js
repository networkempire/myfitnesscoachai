const nodemailer = require('nodemailer');

// Create transporter using SendGrid SMTP
const createTransporter = () => {
  // Check if SendGrid API key is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('WARNING: SENDGRID_API_KEY not configured. Emails will be logged to console only.');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  });
};

const transporter = createTransporter();

/**
 * Send a password reset email
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@myfitnesscoachai.com',
    to: email,
    subject: 'Reset Your MyFitnessCoachAI Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0f4c5c; margin: 0;">MyFitnessCoachAI</h1>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
          <p>We received a request to reset the password for your account associated with this email address.</p>
          <p>Click the button below to reset your password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: #0f4c5c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="font-size: 14px; color: #666;">
            This link will expire in <strong>1 hour</strong> for security reasons.
          </p>

          <p style="font-size: 14px; color: #666;">
            If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <div style="text-align: center; font-size: 12px; color: #999;">
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #0f4c5c;">${resetUrl}</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request

      We received a request to reset the password for your MyFitnessCoachAI account.

      Click this link to reset your password:
      ${resetUrl}

      This link will expire in 1 hour.

      If you didn't request this password reset, you can safely ignore this email.
    `
  };

  // If no transporter (SendGrid not configured), log to console for development
  if (!transporter) {
    console.log('='.repeat(60));
    console.log('PASSWORD RESET EMAIL (SendGrid not configured)');
    console.log('='.repeat(60));
    console.log('To:', email);
    console.log('Reset URL:', resetUrl);
    console.log('='.repeat(60));
    return { success: true, method: 'console' };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return { success: true, method: 'sendgrid' };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send a beta request notification to admin
 */
async function sendBetaRequestNotification(name, email) {
  const timestamp = new Date().toLocaleString();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@myfitnesscoachai.com',
    to: 'me@richboyd.email',
    subject: 'New Beta Tester Request - MyFitnessCoachAI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0f4c5c; margin: 0;">MyFitnessCoachAI</h1>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">New Beta Tester Request</h2>
          <p>Someone has requested to join the beta program:</p>

          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Submitted:</strong> ${timestamp}</p>
          </div>

          <p style="font-size: 14px; color: #666;">
            Log in to the admin panel to approve or reject this request.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
      New Beta Tester Request

      Name: ${name}
      Email: ${email}
      Submitted: ${timestamp}

      Log in to the admin panel to approve or reject this request.
    `
  };

  // If no transporter (SendGrid not configured), log to console for development
  if (!transporter) {
    console.log('='.repeat(60));
    console.log('BETA REQUEST NOTIFICATION (SendGrid not configured)');
    console.log('='.repeat(60));
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Timestamp:', timestamp);
    console.log('='.repeat(60));
    return { success: true, method: 'console' };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Beta request notification sent for ${email}`);
    return { success: true, method: 'sendgrid' };
  } catch (error) {
    console.error('Failed to send beta request notification:', error);
    // Don't throw - we don't want to fail the request just because email failed
    return { success: false, method: 'failed', error: error.message };
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendBetaRequestNotification
};
