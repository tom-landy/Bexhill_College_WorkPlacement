import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import * as XLSX from "xlsx";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { writeAuditEvent } from "@/lib/audit";

const allowedRoles = new Set<UserRole>(["ADMIN", "CAREERS_LEAD", "PLACEMENT_OFFICER"]);

type ImportRow = {
  name?: string;
  email?: string;
  yearGroup?: string;
  tutorGroup?: string;
  tutorEmail?: string;
  pp?: string | number | boolean;
  send?: string | number | boolean;
};

function toBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "1" || v === "true" || v === "yes" || v === "y";
  }
  return false;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !allowedRoles.has(session.user.role as UserRole)) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload file is required." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const wb = XLSX.read(Buffer.from(bytes), { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<ImportRow>(ws, { raw: false, defval: "" });

  const defaultPassword = process.env.STUDENT_DEFAULT_PASSWORD ?? "CollegePassphrase2026";
  const passwordHash = await hashPassword(defaultPassword);

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const [index, row] of rows.entries()) {
    const line = index + 2;
    const name = (row.name ?? "").toString().trim();
    const email = (row.email ?? "").toString().trim().toLowerCase();
    const yearGroup = (row.yearGroup ?? "").toString().trim();
    const tutorGroup = (row.tutorGroup ?? "").toString().trim();

    if (!name || !email || !yearGroup || !tutorGroup) {
      errors.push(`Row ${line}: missing required fields (name, email, yearGroup, tutorGroup).`);
      skipped += 1;
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      skipped += 1;
      continue;
    }

    const tutorEmail = (row.tutorEmail ?? "").toString().trim().toLowerCase();
    const tutor = tutorEmail
      ? await prisma.user.findFirst({ where: { email: tutorEmail, role: "TUTOR" }, select: { id: true } })
      : null;

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          role: "STUDENT",
          passwordHash,
          isActive: true
        }
      });

      await tx.studentProfile.create({
        data: {
          userId: user.id,
          yearGroup,
          tutorGroup,
          tutorUserId: tutor?.id ?? null,
          pp: toBool(row.pp),
          send: toBool(row.send)
        }
      });

      await tx.auditEvent.create({
        data: {
          actorUserId: session.user.id,
          action: "student.import.create",
          entityType: "User",
          entityId: user.id,
          summary: `Student imported: ${email}`
        }
      });
    });

    created += 1;
  }

  await writeAuditEvent({
    actorUserId: session.user.id,
    action: "student.import.batch",
    entityType: "User",
    entityId: "batch",
    summary: `Student import completed. Created=${created}, Skipped=${skipped}`,
    afterJson: { created, skipped, errorCount: errors.length }
  });

  return NextResponse.json({ created, skipped, errors, defaultPassword });
}
