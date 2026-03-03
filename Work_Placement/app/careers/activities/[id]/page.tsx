import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function CareersActivityPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "CAREERS_LEAD", "PLACEMENT_OFFICER", "TUTOR", "STUDENT"]);
  const { id } = await params;
  return <RouteShell title="Careers Activity" detail={`Activity id: ${id}`} />;
}
