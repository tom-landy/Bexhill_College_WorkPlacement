import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function CareersReportingPage() {
  await requireRole(["ADMIN", "CAREERS_LEAD", "PLACEMENT_OFFICER", "TUTOR"]);
  return <RouteShell title="Careers Reporting" detail="Completion by year group and Gatsby benchmark." />;
}
