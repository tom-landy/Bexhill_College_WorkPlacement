import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { exportMap, type ExportKey } from "@/lib/exports";
import { toCsv } from "@/lib/csv";

const staffRoles = new Set<UserRole>(["ADMIN", "CAREERS_LEAD", "PLACEMENT_OFFICER", "TUTOR"]);

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !staffRoles.has(session.user.role as UserRole)) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 403 });
  }

  const type = req.nextUrl.searchParams.get("type") as ExportKey | null;
  const format = req.nextUrl.searchParams.get("format") ?? "csv";

  if (!type || !(type in exportMap)) {
    return NextResponse.json({ error: "Unknown export type." }, { status: 400 });
  }

  if (type === "audit_events" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can export audit events." }, { status: 403 });
  }

  const rows = await exportMap[type]();

  if (format === "json") {
    return NextResponse.json({ type, count: rows.length, rows });
  }

  const safeRows = rows.map((row) => JSON.parse(JSON.stringify(row)) as Record<string, unknown>);
  const csv = toCsv(safeRows);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename=${type}-${new Date().toISOString().slice(0, 10)}.csv`
    }
  });
}
