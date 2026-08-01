import mailTransporter, { senderEmail } from "../config/mailer.js";

const storeName = process.env.STORE_NAME?.trim() || "Accessories Store";

function escapeHtml(value) {
  const characters = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => characters[character],
  );
}

export async function sendAdminLoginOtpEmail({
  recipientEmail,
  otp,
  expiresInMinutes,
}) {
  const safeStoreName = escapeHtml(storeName);

  const safeOtp = escapeHtml(otp);

  await mailTransporter.sendMail({
    from: senderEmail,
    to: recipientEmail,

    subject: `${storeName} admin login verification`,

    text: [
      "An admin login was requested.",
      "",
      `Your verification code is: ${otp}`,
      "",
      `This code expires in ${expiresInMinutes} minutes.`,
      "Do not share this code with anyone.",
      "",
      "If you did not request this login, change your password and secure your email account.",
    ].join("\n"),

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>${safeStoreName} admin login</h2>

        <p>An admin login was requested.</p>

        <p>Your verification code is:</p>

        <p style="font-size: 30px; font-weight: 700; letter-spacing: 8px;">
          ${safeOtp}
        </p>

        <p>
          This code expires in
          <strong>${expiresInMinutes} minutes</strong>.
        </p>

        <p>Do not share this code with anyone.</p>

        <p>
          If you did not request this login, change your password
          and secure your email account.
        </p>
      </div>
    `,
  });
}

export async function sendCustomerEmailVerificationOtpEmail({
  recipientEmail,
  customerName,
  otp,
  expiresInMinutes,
}) {
  const safeStoreName = escapeHtml(storeName);

  const safeCustomerName = escapeHtml(customerName);

  const safeOtp = escapeHtml(otp);

  await mailTransporter.sendMail({
    from: senderEmail,
    to: recipientEmail,

    subject: `Verify your email for ${storeName}`,

    text: [
      `Hello ${customerName},`,
      "",
      `Welcome to ${storeName}.`,
      "",
      `Your email verification code is: ${otp}`,
      "",
      `This code expires in ${expiresInMinutes} minutes.`,
      "Do not share this code with anyone.",
      "",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Verify your email</h2>

        <p>Hello ${safeCustomerName},</p>

        <p>
          Welcome to ${safeStoreName}.
          Use the following code to verify your email address:
        </p>

        <p style="font-size: 30px; font-weight: 700; letter-spacing: 8px;">
          ${safeOtp}
        </p>

        <p>
          This code expires in
          <strong>${expiresInMinutes} minutes</strong>.
        </p>

        <p>Do not share this code with anyone.</p>

        <p>
          If you did not create this account,
          you can ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetOtpEmail({
  recipientEmail,
  userName,
  otp,
  expiresInMinutes,
}) {
  const safeStoreName = escapeHtml(storeName);

  const safeUserName = escapeHtml(userName);

  const safeOtp = escapeHtml(otp);

  await mailTransporter.sendMail({
    from: senderEmail,
    to: recipientEmail,

    subject: `Reset your ${storeName} password`,

    text: [
      `Hello ${userName},`,
      "",
      "A request was made to reset your password.",
      "",
      `Your password-reset code is: ${otp}`,
      "",
      `This code expires in ${expiresInMinutes} minutes.`,
      "Do not share this code with anyone.",
      "",
      "If you did not request a password reset, you can ignore this email. Your current password will remain unchanged.",
    ].join("\n"),

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Reset your password</h2>

        <p>Hello ${safeUserName},</p>

        <p>
          A request was made to reset your
          ${safeStoreName} password.
        </p>

        <p>Your password-reset code is:</p>

        <p style="font-size: 30px; font-weight: 700; letter-spacing: 8px;">
          ${safeOtp}
        </p>

        <p>
          This code expires in
          <strong>${expiresInMinutes} minutes</strong>.
        </p>

        <p>Do not share this code with anyone.</p>

        <p>
          If you did not request a password reset,
          you can ignore this email. Your current password
          will remain unchanged.
        </p>
      </div>
    `,
  });
}
