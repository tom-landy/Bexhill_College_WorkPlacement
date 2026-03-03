import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validation";
import { validatePasswordPolicy, hashPassword } from "@/lib/password";
import { consumePasswordResetToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";
import { writeAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const policyError = validatePasswordPolicy(parsed.data.password);
  if (policyError) {
    return NextResponse.json({ error: policyError }, { status: 400 });
  }

  const consumed = await consumePasswordResetToken(parsed.data.token);
  if (!consumed.valid || !consumed.userId) {
    return NextResponse.json({ error: "Reset token is invalid or expired." }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({ where: { id: consumed.userId }, data: { passwordHash } });

  await prisma.authEvent.create({
    data: { userId: consumed.userId, type: "PASSWORD_RESET_COMPLETED" }
  });
  await writeAuditEvent({
    actorUserId: consumed.userId,
    action: "auth.password_reset.completed",
    entityType: "User",
    entityId: consumed.userId,
    summary: "Password reset completed"
  });

  return NextResponse.json({ ok: true });
}
