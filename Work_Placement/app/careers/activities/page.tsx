import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function CareersActivitiesPage() {
  await requireRole(["ADMIN", "CAREERS_LEAD", "PLACEMENT_OFFICER", "TUTOR", "STUDENT"]);
  return <RouteShell title="Careers Activities" detail="Create, assign, and complete activities tagged to Gatsby benchmarks." />;
}
