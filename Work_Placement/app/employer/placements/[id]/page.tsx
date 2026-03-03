import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function EmployerPlacementPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["EMPLOYER_SUPERVISOR"]);
  const { id } = await params;
  return <RouteShell title="Employer Placement View" detail={`Placement id: ${id}`} />;
}
