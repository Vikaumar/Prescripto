import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send caretaker invitation email
 */
export const sendCaretakerInvite = async (toEmail, inviterName, role) => {
  const roleLabel = role === "caretaker" ? "Caretaker (Full Access)" : "Member (View Only)";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
              <div style="font-size:28px;margin-bottom:8px;">💊</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Prescripto</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Smart Prescription Manager</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              <h2 style="margin:0 0 8px;color:#0f172a;font-size:18px;">You're Invited! 🤝</h2>
              <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;">
                <strong style="color:#0f172a;">${inviterName}</strong> has invited you to join their family health network on Prescripto.
              </p>
              
              <!-- Role Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Your Role</p>
                    <p style="margin:0;font-size:15px;color:#6366f1;font-weight:700;">${role === "caretaker" ? "🔑" : "👁️"} ${roleLabel}</p>
                  </td>
                </tr>
              </table>
              
              <!-- What you can do -->
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#0f172a;">What this means:</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                ${role === "caretaker" ? `
                <tr><td style="padding:4px 0;font-size:13px;color:#475569;">✅ View family health information</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#475569;">✅ Manage prescriptions & reminders</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#475569;">✅ Update emergency contacts</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#475569;">✅ Full access to family health data</td></tr>
                ` : `
                <tr><td style="padding:4px 0;font-size:13px;color:#475569;">✅ View family health information</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#475569;">✅ See emergency contacts & allergies</td></tr>
                <tr><td style="padding:4px 0;font-size:13px;color:#475569;">❌ Cannot modify health data</td></tr>
                `}
              </table>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/family"
                       style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;">
                      Open Prescripto →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                This email was sent by Prescripto. If you didn't expect this,<br>you can safely ignore it.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const mailOptions = {
    from: `"Prescripto" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${inviterName} invited you to their family on Prescripto`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Invitation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    return { success: false, error: error.message };
  }
};
