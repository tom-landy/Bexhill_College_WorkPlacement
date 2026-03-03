import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "EMPLOYER_SUPERVISOR") {
    return NextResponse.json({ error: "Unauthorised." }, { status: 403 });
  }

  const { id } = await context.params;

  const link = await prisma.employerAccountLink.findUnique({
    where: { userId: session.user.id },
    include: { employerContact: true }
  });

  if (!link) {
    return NextResponse.json({ error: "No employer account link." }, { status: 403 });
  }

  const placement = await prisma.placement.findFirst({
    where: {
      id,
      supervisorContactId: link.employerContactId
    },
    include: {
      student: { include: { user: true } },
      logs: true
    }
  });

  if (!placement) {
    return NextResponse.json({ error: "Placement not found." }, { status: 404 });
  }

  return NextResponse.json({ placement });
}
