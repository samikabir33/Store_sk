import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const SITE_NAME = "Fahmida's Fashion";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
// If you add a logo file at /public/logo.png, it will automatically show up in the email.
const LOGO_URL = `${SITE_URL}/logo.png`;

export async function sendOtpEmail({ to, name, otp }) {
  const html = otpEmailTemplate({ name, otp });

  if (!resend) {
    // No RESEND_API_KEY set yet - log to the server console so you can still test locally.
    console.log(`\n[email not sent - RESEND_API_KEY missing] OTP for ${to}: ${otp}\n`);
    return { ok: true, simulated: true };
  }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || `${SITE_NAME} <onboarding@resend.dev>`,
    to,
    subject: `Your ${SITE_NAME} password reset code`,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return { ok: false, error };
  }
  return { ok: true };
}

function otpEmailTemplate({ name, otp }) {
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; background:#fdf3f0; padding:32px 16px;">
    <div style="max-width:420px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #f3d9d3;">
      <div style="background:linear-gradient(135deg,#e8a9a0,#d4a95c); padding:24px; text-align:center;">
        <img src="${LOGO_URL}" alt="${SITE_NAME}" height="32" style="height:32px; display:inline-block; vertical-align:middle;" />
        <div style="font-family: Georgia, serif; font-size:20px; color:#3a2a28; margin-top:6px;">${SITE_NAME}</div>
      </div>
      <div style="padding:32px 28px; text-align:center;">
        <h1 style="font-size:18px; color:#3a2a28; margin:0 0 8px;">Reset your password</h1>
        <p style="font-family: Arial, sans-serif; font-size:13px; color:#6b5a57; margin:0 0 24px;">
          Hi ${name || "there"}, use the code below to reset your password. This code expires in 10 minutes.
        </p>
        <div style="font-family: Arial, sans-serif; font-size:32px; font-weight:bold; letter-spacing:8px; color:#c9645a; background:#fdf3f0; border-radius:10px; padding:16px; margin-bottom:24px;">
          ${otp}
        </div>
        <p style="font-family: Arial, sans-serif; font-size:12px; color:#9b8b88; margin:0;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
      <div style="background:#fdf3f0; padding:14px; text-align:center; font-family: Arial, sans-serif; font-size:11px; color:#9b8b88;">
        © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
      </div>
    </div>
  </div>
  `;
}