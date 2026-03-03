import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditEvent } from "@/lib/audit";

const allowedRoles = new Set<UserRole>(["ADMIN", "PLACEMENT_OFFICER"]);

const assignSchema = z.object({
  studentId: z.string().min(1),
  employerId: z.string().min(1),
  supervisorContactId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  hoursTarget: z.coerce.number().int().positive()
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !allowedRoles.has(session.user.role as UserRole)) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 403 });
  }

  const parsed = assignSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid assignment data." }, { status: 400 });
  }

  const student = await prisma.studentProfile.findUnique({ where: { id: parsed.data.studentId } });
  const employer = await prisma.employer.findUnique({ where: { id: parsed.data.employerId } });
  const contact = await prisma.employerContact.findFirst({
    where: { id: parsed.data.supervisorContactId, employerId: parsed.data.employerId }
  });

  if (!student || !employer || !contact) {
    return NextResponse.json({ error: "Student, employer, or supervisor contact not found." }, { status: 404 });
  }

  const placement = await prisma.$transaction(async (tx) => {
    const created = await tx.placement.create({
      data: {
        studentId: parsed.data.studentId,
        employerId: parsed.data.employerId,
        supervisorContactId: parsed.data.supervisorContactId,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        hoursTarget: parsed.data.hoursTarget,
        status: "PENDING",
        employerConfirmationStatus: "PENDING"
      }
    });

    await tx.complianceChecklist.create({
      data: {
        placementId: created.id,
        itemsJson: []
      }
    });

    await tx.placementStatusHistory.create({
      data: {
        placementId: created.id,
        fromStatus: null,
        toStatus: "PENDING",
        changedByUserId: session.user.id
      }
    });

    await tx.auditEvent.create({
      data: {
        actorUserId: session.user.id,
        action: "placement.assign",
        entityType: "Placement",
        entityId: created.id,
        summary: "Student assigned to employer",
        afterJson: created
      }
    });

    return created;
  });

  await writeAuditEvent({
    actorUserId: session.user.id,
    action: "placement.create",
    entityType: "Placement",
    entityId: placement.id,
    summary: "Placement created from assignment flow"
  });

  return NextResponse.json({ placement });
}
