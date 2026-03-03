import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prospectSchema } from "@/lib/validation";
import { writeAuditEvent } from "@/lib/audit";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorised." }, { status: 403 });
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } });
  if (!student) {
    return NextResponse.json({ error: "Student profile missing." }, { status: 404 });
  }

  const { id } = await context.params;
  const existing = await prisma.prospectEmployer.findFirst({ where: { id, studentId: student.id } });
  if (!existing) {
    return NextResponse.json({ error: "Prospect not found." }, { status: 404 });
  }

  if (existing.status !== "DRAFT") {
    return NextResponse.json({ error: "Submitted prospects cannot be edited." }, { status: 409 });
  }

  const payload = prospectSchema.partial().safeParse(await req.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  }

  const updated = await prisma.prospectEmployer.update({
    where: { id: existing.id },
    data: payload.data
  });

  await writeAuditEvent({
    actorUserId: session.user.id,
    action: "prospect.update",
    entityType: "ProspectEmployer",
    entityId: existing.id,
    summary: "Prospective employer updated",
    beforeJson: existing,
    afterJson: updated
  });

  return NextResponse.json({ prospect: updated });
}
