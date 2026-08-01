import "dotenv/config";
import nodemailer from "nodemailer";

function getRequiredEnvironmentVariable(variableName) {
  const value = process.env[variableName]?.trim();

  if (!value) {
    throw new Error(
      `${variableName} is required. Add it to the server .env file.`,
    );
  }

  return value;
}

function parseSmtpPort(rawPort) {
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }

  return port;
}

function parseBoolean(rawValue, variableName) {
  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  throw new Error(`${variableName} must be true or false.`);
}

const smtpHost = getRequiredEnvironmentVariable("SMTP_HOST");

const smtpPort = parseSmtpPort(getRequiredEnvironmentVariable("SMTP_PORT"));

const smtpSecure = parseBoolean(
  getRequiredEnvironmentVariable("SMTP_SECURE"),
  "SMTP_SECURE",
);

const smtpUser = getRequiredEnvironmentVariable("SMTP_USER");

const smtpPassword = getRequiredEnvironmentVariable("EMAIL_PASSWORD");

export const senderEmail = getRequiredEnvironmentVariable("SENDER_EMAIL");

const mailTransporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,

  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
});

export default mailTransporter;
