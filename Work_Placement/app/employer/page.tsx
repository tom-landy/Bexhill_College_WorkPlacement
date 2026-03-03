import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function EmployerDashboardPage() {
  await requireRole(["EMPLOYER_SUPERVISOR"]);
  return <RouteShell title="Employer Dashboard" detail="Multi-learner placement overview and alerts." />;
}
