// Using Brevo HTTP API instead of SMTP to bypass Render's port restrictions
// SMTP ports 587/465 are blocked on free hosting, but HTTPS (443) works
// NOTE: Brevo API key (xkeysib-...) is DIFFERENT from SMTP key (xsmtpsib-...)

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;
const FROM_NAME = "PeerCode AI";

const isEmailConfigured = !!(BREVO_API_KEY && FROM_EMAIL);

if (!isEmailConfigured) {
  console.warn("⚠️  Email service not configured.");
  console.warn("   Required: BREVO_API_KEY (starts with 'xkeysib-...') and FROM_EMAIL");
  console.warn("   Note: SMTP key (xsmtpsib-...) will NOT work with HTTP API!");
}

/**
 * Send email using Brevo HTTP API
 */
async function sendEmail(to, subject, htmlContent, textContent) {
  if (!isEmailConfigured) {
    console.error("❌ Email service not configured");
    throw new Error("Email service not configured");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("❌ Brevo API error:", response.status, errorData);
    throw new Error(`Email API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
  }

  return await response.json();
}

export async function sendSessionInvite(toEmail, accessCode, sessionInfo) {
  const { problem, difficulty, hostName, sessionId } = sessionInfo;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const inviteLink = `${clientUrl}/session/${sessionId}`;

  if (process.env.NODE_ENV === "production" && clientUrl.includes("localhost")) {
    console.warn("⚠️  CLIENT_URL is set to localhost in production!");
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; border: 1px solid #e5e5e5;">
        <tr>
          <td style="padding: 24px 24px 16px 24px; border-bottom: 1px solid #e5e5e5;">
            <h1 style="margin: 0; font-size: 20px; color: #333;">PeerCode AI</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px;">
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #333;">
              <strong>${hostName}</strong> invited you to a coding session.
            </p>
            
            <table style="margin-bottom: 20px; width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Problem:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 500;">${problem}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Difficulty:</td>
                <td style="padding: 8px 0; color: #333; text-transform: capitalize;">${difficulty}</td>
              </tr>
            </table>

            <table cellpadding="0" cellspacing="0" style="margin: 20px 0;">
              <tr>
                <td>
                  <a href="${inviteLink}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">Join Session</a>
                </td>
              </tr>
            </table>
            
            <p style="margin: 16px 0 8px 0; font-size: 14px; color: #666;">
              Or enter this access code on your dashboard:
            </p>
            
            <div style="background: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 6px; padding: 16px; text-align: center;">
              <span style="font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #333;">${accessCode}</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 24px; border-top: 1px solid #e5e5e5; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999;">PeerCode AI - Collaborative Coding Tutoring Platform</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
You're invited to a coding session!

Host: ${hostName}
Problem: ${problem}
Difficulty: ${difficulty}

Join directly: ${inviteLink}

Or use this Access Code: ${accessCode}

Enter this code on your dashboard to join the session.

- PeerCode AI Team
  `;

  try {
    await sendEmail(toEmail, `Session Invite: ${problem}`, htmlContent, textContent);
    console.log(`✅ Session invite sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", { to: toEmail, error: error.message });
    throw error;
  }
}

export async function sendSessionCompletedEmail(toEmail, sessionInfo, role) {
  if (!isEmailConfigured) {
    console.warn("⚠️ Email not configured - skipping session completed email");
    return false;
  }

  const { problem, difficulty, sessionId, hostName, sessionType } = sessionInfo;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const aiReportLink = `${clientUrl}/feedback/${sessionId}`;
  const sessionsLink = role === "teacher" ? `${clientUrl}/sessions` : `${clientUrl}/my-sessions`;
  const isOneOnOne = sessionType === "one_on_one";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; border: 1px solid #e5e5e5;">
        <tr>
          <td style="padding: 24px 24px 16px 24px; border-bottom: 1px solid #e5e5e5;">
            <h1 style="margin: 0; font-size: 20px; color: #333;">PeerCode AI</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px;">
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #333;">
              <strong>Session Completed</strong>
            </p>
            
            <table style="margin-bottom: 20px; width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Problem:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 500;">${problem}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Difficulty:</td>
                <td style="padding: 8px 0; color: #333; text-transform: capitalize;">${difficulty}</td>
              </tr>
              ${role === "student" ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Teacher:</td>
                <td style="padding: 8px 0; color: #333;">${hostName}</td>
              </tr>
              ` : ""}
            </table>

            <p style="margin: 0 0 16px 0; font-size: 14px; color: #666;">
              Your session transcript is now available for download.
              ${isOneOnOne ? " Your AI performance report is also ready." : ""}
            </p>
            
            <table cellpadding="0" cellspacing="0" style="margin-top: 20px;">
              ${isOneOnOne ? `
              <tr>
                <td style="padding-right: 8px;">
                  <a href="${aiReportLink}" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">View AI Report</a>
                </td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding-top: 8px;">
                  <a href="${sessionsLink}" style="display: inline-block; background: #64748b; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">Download Transcript</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 24px; border-top: 1px solid #e5e5e5; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999;">PeerCode AI - Collaborative Coding Tutoring Platform</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
Session Completed: ${problem}

Problem: ${problem}
Difficulty: ${difficulty}
${role === "student" ? `Teacher: ${hostName}` : ""}

Your session transcript is now available for download.
${isOneOnOne ? "Your AI performance report is also ready." : ""}

${isOneOnOne ? `View AI Report: ${aiReportLink}` : ""}
Download Transcript: ${sessionsLink}

- PeerCode AI Team
  `;

  try {
    await sendEmail(toEmail, `Session Completed: ${problem}`, htmlContent, textContent);
    console.log(`✅ Session completed email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending session completed email:", error.message);
    return false;
  }
}
