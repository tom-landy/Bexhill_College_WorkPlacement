import { RouteShell } from "@/components/RouteShell";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <RouteShell title="Employer Invite" detail={`Invite token: ${token.slice(0, 8)}...`} />;
}
