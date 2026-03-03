import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function OpportunitiesBoardPage() {
  await requireRole(["ADMIN", "PLACEMENT_OFFICER"]);
  return <RouteShell title="Opportunities Board" detail="Pipeline board for placement opportunities." />;
}
