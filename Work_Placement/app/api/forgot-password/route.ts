import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { assertNotCoolingDown, checkAndRecordFailure, clearFailures } from "@/lib/rate-limit";
import { issuePasswordResetToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";
import { writeAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const rateKey = `reset:${email}`;

  try {
    await assertNotCoolingDown(rateKey);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many attempts." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await checkAndRecordFailure(rateKey);
    return NextResponse.json({ ok: true });
  }

  const token = await issuePasswordResetToken(user.id);
  const resetUrl = `${process.env.APP_BASE_URL}/reset-password/${token}`;

  await sendEmail(
    user.email,
    "Password reset request",
    `A password reset was requested. Use this link within 1 hour: ${resetUrl}`
  );

  await clearFailures(rateKey);
  await prisma.authEvent.create({
    data: { userId: user.id, type: "PASSWORD_RESET_REQUESTED", metadataJson: { email: user.email } }
  });
  await writeAuditEvent({
    actorUserId: user.id,
    action: "auth.password_reset.requested",
    entityType: "User",
    entityId: user.id,
    summary: `Password reset requested for ${user.email}`
  });

  return NextResponse.json({ ok: true });
}
