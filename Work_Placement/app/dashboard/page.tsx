import { requireSession } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function DashboardPage() {
  const session = await requireSession();
  return <RouteShell title="Dashboard" detail={`Signed in as ${session.user.role}.`} />;
}
