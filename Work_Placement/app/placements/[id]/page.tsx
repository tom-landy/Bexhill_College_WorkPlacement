import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function PlacementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "PLACEMENT_OFFICER", "TUTOR", "EMPLOYER_SUPERVISOR", "STUDENT"]);
  const { id } = await params;
  return <RouteShell title="Placement Detail" detail={`Placement id: ${id}`} />;
}
