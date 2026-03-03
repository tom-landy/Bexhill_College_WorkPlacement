import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "CAREERS_LEAD", "PLACEMENT_OFFICER", "TUTOR"]);
  const { id } = await params;
  return <RouteShell title="Student Passport (Staff View)" detail={`Student id: ${id}`} />;
}
