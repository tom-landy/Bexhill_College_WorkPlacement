import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function EmployersPage() {
  await requireRole(["ADMIN", "PLACEMENT_OFFICER"]);
  return <RouteShell title="Employers" detail="Employer CRM and contacts." />;
}
