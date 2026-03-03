import { requireRole } from "@/lib/session";
import { StudentImportForm } from "@/components/StudentImportForm";
import { prisma } from "@/lib/prisma";

export default async function StudentsPage() {
  const session = await requireRole(["ADMIN", "CAREERS_LEAD", "PLACEMENT_OFFICER", "TUTOR"]);
  const students = await prisma.studentProfile.count();

  return (
    <div className="space-y-4">
      <section className="rounded border bg-white p-4">
        <h2 className="text-xl font-semibold">Students</h2>
        <p className="text-sm text-slate-700">Total students: {students}</p>
      </section>
      {session.user.role === "ADMIN" ? <StudentImportForm /> : null}
    </div>
  );
}
