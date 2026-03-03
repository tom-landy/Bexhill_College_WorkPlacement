import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function EmployerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "PLACEMENT_OFFICER"]);
  const { id } = await params;
  return <RouteShell title="Employer Detail" detail={`Employer id: ${id}`} />;
}
