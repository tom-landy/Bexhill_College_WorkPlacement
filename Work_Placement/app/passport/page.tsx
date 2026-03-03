import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function PassportPage() {
  await requireRole(["STUDENT"]);
  return <RouteShell title="My Passport" detail="Skills, destinations, and activities." />;
}
