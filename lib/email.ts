import nodemailer from "nodemailer";

const transport = nodemailer.createTransport(
  process.env.SMTP_URL
    ? process.env.SMTP_URL
    : {
        host: process.env.SMTP_HOST ?? "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
);

export async function sendInvitationEmail({
  to,
  inviterName,
  teamName,
  token,
}: {
  to: string;
  inviterName: string;
  teamName: string | null;
  token: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const acceptUrl = `${baseUrl}/invitations/${token}`;
  const label = teamName ? `"${teamName}"` : "their team";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#06060e;color:#f3f3fb;border-radius:16px">
      <h2 style="margin:0 0 8px;font-size:22px">You're invited to join Chill &amp; Build 🎉</h2>
      <p style="color:#a3a3c2;margin:0 0 24px">
        <strong style="color:#f3f3fb">${inviterName}</strong> has invited you to join ${label} at the Rooberah hackathon on <strong>June 12</strong>.
      </p>
      <a href="${acceptUrl}"
         style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#d36bff,#9b6bff);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px">
        View &amp; Accept Invitation →
      </a>
      <p style="color:#6a6a87;font-size:12px;margin-top:24px">
        This invitation expires in 48 hours. If you didn't expect this, you can safely ignore it.
      </p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? `"Chill & Build" <no-reply@fastbundle.co>`,
      to,
      subject: `${inviterName} invited you to join their Chill & Build team`,
      html,
    });
  } catch {
    console.warn("⚠️  Email not sent (no SMTP config). Invitation link:");
    console.warn(acceptUrl);
  }
}

export async function sendPasswordResetEmail({
  to,
  displayName,
  token,
}: {
  to: string;
  displayName: string;
  token: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password/${token}`;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#06060e;color:#f3f3fb;border-radius:16px">
      <h2 style="margin:0 0 8px;font-size:22px">Reset your password</h2>
      <p style="color:#a3a3c2;margin:0 0 24px">
        Hi <strong style="color:#f3f3fb">${displayName || to}</strong>, we received a request to reset your Chill &amp; Build password.
        Click the button below — the link expires in <strong style="color:#f3f3fb">1 hour</strong>.
      </p>
      <a href="${resetUrl}"
         style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#d36bff,#9b6bff);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px">
        Reset password →
      </a>
      <p style="color:#6a6a87;font-size:12px;margin-top:24px">
        If you didn't request this, you can safely ignore this email. Your password won't change.
      </p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? `"Chill & Build" <no-reply@fastbundle.co>`,
      to,
      subject: "Reset your Chill & Build password",
      html,
    });
  } catch {
    console.warn("⚠️  Email not sent (no SMTP config). Password reset link:");
    console.warn(resetUrl);
  }
}
