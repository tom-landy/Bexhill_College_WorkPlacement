import { prisma } from "@/lib/prisma";
import { createOpaqueToken, sha256 } from "@/lib/security";

export async function issuePasswordResetToken(userId: string): Promise<string> {
  const token = createOpaqueToken();
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    }
  });
  return token;
}

export async function consumePasswordResetToken(token: string): Promise<{ valid: boolean; userId?: string }> {
  const tokenHash = sha256(token);
  const record = await prisma.passwordResetToken.findFirst({
    where: { tokenHash },
    orderBy: { createdAt: "desc" }
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { valid: false };
  }

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() }
  });

  return { valid: true, userId: record.userId };
}

export async function issueInviteToken(employerContactId: string): Promise<string> {
  const token = createOpaqueToken();
  await prisma.inviteToken.create({
    data: {
      employerContactId,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
  return token;
}

export async function consumeInviteToken(token: string, usedByUserId: string): Promise<{ valid: boolean; employerContactId?: string }> {
  const tokenHash = sha256(token);
  const record = await prisma.inviteToken.findFirst({
    where: { tokenHash },
    orderBy: { createdAt: "desc" }
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { valid: false };
  }

  await prisma.inviteToken.update({
    where: { id: record.id },
    data: { usedAt: new Date(), usedByUserId }
  });

  return { valid: true, employerContactId: record.employerContactId };
}
