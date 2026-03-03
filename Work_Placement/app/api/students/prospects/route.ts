import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prospectSchema } from "@/lib/validation";
import { writeAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorised." }, { status: 403 });
  }

  const student = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } });
  if (!student) {
    return NextResponse.json({ error: "Student profile missing." }, { status: 404 });
  }

  const payload = prospectSchema.safeParse(await req.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid prospect data." }, { status: 400 });
  }

  const prospect = await prisma.prospectEmployer.create({
    data: {
      studentId: student.id,
      ...payload.data,
      status: "DRAFT"
    }
  });

  await writeAuditEvent({
    actorUserId: session.user.id,
    action: "prospect.create",
    entityType: "ProspectEmployer",
    entityId: prospect.id,
    summary: "Prospective employer created",
    afterJson: prospect
  });

  return NextResponse.json({ prospect });
}
