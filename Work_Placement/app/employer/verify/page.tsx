import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function EmployerVerifyPage() {
  await requireRole(["EMPLOYER_SUPERVISOR"]);
  return <RouteShell title="Verification Queue" detail="Bulk verify or dispute learner logs." />;
}
