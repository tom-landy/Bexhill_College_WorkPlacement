import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PlacementAssignmentForm } from "@/components/PlacementAssignmentForm";

export default async function PlacementsPage() {
  const session = await requireRole(["ADMIN", "PLACEMENT_OFFICER", "TUTOR", "EMPLOYER_SUPERVISOR", "STUDENT"]);
  const placementsCount = await prisma.placement.count();

  const canAssign = session.user.role === "ADMIN" || session.user.role === "PLACEMENT_OFFICER";
  const students = canAssign
    ? await prisma.studentProfile.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "asc" }
      })
    : [];

  const employers = canAssign
    ? await prisma.employer.findMany({
        include: { contacts: { select: { id: true, name: true } } },
        orderBy: { name: "asc" }
      })
    : [];

  return (
    <div className="space-y-4">
      <section className="rounded border bg-white p-4">
        <h2 className="text-xl font-semibold">Placements</h2>
        <p className="text-sm text-slate-700">Total placements: {placementsCount}</p>
      </section>

      {canAssign ? (
        <PlacementAssignmentForm
          students={students.map((s) => ({
            id: s.id,
            label: `${s.user.name} (${s.user.email})`
          }))}
          employers={employers.map((e) => ({
            id: e.id,
            name: e.name,
            contacts: e.contacts
          }))}
        />
      ) : null}
    </div>
  );
}
