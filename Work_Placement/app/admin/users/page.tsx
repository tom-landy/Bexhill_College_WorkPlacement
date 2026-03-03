import { requireRole } from "@/lib/session";
import { RouteShell } from "@/components/RouteShell";

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"]);
  return <RouteShell title="User Management" detail="Activate, deactivate, and manage roles." />;
}
