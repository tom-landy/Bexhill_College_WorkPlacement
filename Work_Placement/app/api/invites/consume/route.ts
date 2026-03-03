import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { consumeInviteToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";
import { writeAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json();
  const token = typeof body.token === "string" ? body.token : "";
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const consumed = await consumeInviteToken(token, session.user.id);
  if (!consumed.valid || !consumed.employerContactId) {
    return NextResponse.json({ error: "Invite token is invalid or expired." }, { status: 400 });
  }

  const contact = await prisma.employerContact.findUnique({ where: { id: consumed.employerContactId } });
  if (!contact) {
    return NextResponse.json({ error: "Employer contact not found." }, { status: 404 });
  }

  await prisma.employerAccountLink.upsert({
    where: { userId: session.user.id },
    update: { employerContactId: contact.id },
    create: { userId: session.user.id, employerContactId: contact.id }
  });

  await writeAuditEvent({
    actorUserId: session.user.id,
    action: "invite.used",
    entityType: "EmployerContact",
    entityId: contact.id,
    summary: "Employer invite token consumed"
  });

  return NextResponse.json({ ok: true });
}
