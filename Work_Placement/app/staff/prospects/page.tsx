import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function StaffProspectsPage() {
  await requireRole(["ADMIN", "PLACEMENT_OFFICER", "CAREERS_LEAD"]);
  return <RouteShell title="Prospects Review Queue" detail="Approve, reject, and convert prospective employers." />;
}
