import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function ExportsPage() {
  await requireRole(["ADMIN", "CAREERS_LEAD", "PLACEMENT_OFFICER", "TUTOR"] as UserRole[]);
  return <RouteShell title="Exports" detail="Download CSV or JSON evidence exports." />;
}
