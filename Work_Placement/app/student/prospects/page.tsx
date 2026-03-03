import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function StudentProspectsPage() {
  await requireRole(["STUDENT"]);
  return <RouteShell title="My Prospective Employers" detail="Submit and track prospective employers." />;
}
