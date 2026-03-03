import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function sendEmail(toEmail: string, subject: string, body: string): Promise<void> {
  const devMode = process.env.EMAIL_DEV_MODE === "true";

  if (devMode) {
    // eslint-disable-next-line no-console
    console.log(`[DEV EMAIL] To=${toEmail} Subject=${subject} Body=${body}`);
    await prisma.emailRecord.create({
      data: { toEmail, subject, body, status: "SENT", provider: "dev-console" }
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: toEmail,
      subject,
      text: body
    });

    await prisma.emailRecord.create({
      data: {
        toEmail,
        subject,
        body,
        status: "SENT",
        provider: "smtp",
        providerMessageId: info.messageId
      }
    });
  } catch (error) {
    await prisma.emailRecord.create({
      data: {
        toEmail,
        subject,
        body,
        status: "FAILED",
        provider: "smtp",
        errorMessage: error instanceof Error ? error.message : "unknown"
      }
    });
    throw error;
  }
}
