import { RouteShell } from "@/components/RouteShell";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <RouteShell title="Reset Password" detail={`Reset token: ${token.slice(0, 8)}...`} />;
}
