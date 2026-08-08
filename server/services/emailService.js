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

export async function sendInitialAdminCredentialsEmail({
  recipientEmail,
  adminName,
  temporaryPassword,
  adminPortalUrl,
}) {
  const safeAdminName = escapeHtml(adminName);
  const safeTemporaryPassword = escapeHtml(temporaryPassword);
  const safeAdminPortalUrl = escapeHtml(adminPortalUrl);

  await mailTransporter.sendMail({
    from: `Butterfly Dream <${senderEmail}>`,
    to: recipientEmail,

    subject: "Your Butterfly Dream administrator account",

    text: [
      `Hello ${adminName},`,
      "",
      "Your Butterfly Dream administrator account has been created.",
      "",
      `Admin email: ${recipientEmail}`,
      `Temporary password: ${temporaryPassword}`,
      "",
      `Admin portal: ${adminPortalUrl}`,
      "",
      "This is a temporary password.",
      "You will be required to create a new permanent password after your first successful login.",
      "",
      "Do not share these credentials with anyone.",
    ].join("\n"),

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Butterfly Dream administrator account</h2>

        <p>Hello ${safeAdminName},</p>

        <p>
          Your Butterfly Dream administrator account has been created.
        </p>

        <div
          style="
            margin: 24px 0;
            padding: 18px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            background: #f9fafb;
          "
        >
          <p style="margin: 0 0 12px;">
            <strong>Admin email:</strong><br />
            ${escapeHtml(recipientEmail)}
          </p>

          <p style="margin: 0;">
            <strong>Temporary password:</strong><br />
            <span
              style="
                font-family: monospace;
                font-size: 16px;
                word-break: break-all;
              "
            >
              ${safeTemporaryPassword}
            </span>
          </p>
        </div>

        <p>
          <a
            href="${safeAdminPortalUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #111827;
              color: #ffffff;
              text-decoration: none;
              border-radius: 9999px;
              font-weight: 700;
            "
          >
            Open Admin Portal
          </a>
        </p>

        <p>
          This password is temporary.
          You will be required to create a new permanent password
          after your first successful login.
        </p>

        <p>
          Do not share these credentials with anyone.
        </p>
      </div>
    `,
  });
}
