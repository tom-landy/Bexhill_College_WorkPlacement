import { prisma } from "../lib/prisma";
import { writeAuditEvent } from "../lib/audit";

async function main() {
  const counts = {
    users: await prisma.user.count(),
    placements: await prisma.placement.count(),
    placementLogs: await prisma.placementLog.count(),
    auditEvents: await prisma.auditEvent.count()
  };

  await writeAuditEvent({
    action: "system.nightly_integrity_check",
    entityType: "System",
    entityId: "nightly",
    summary: "Nightly integrity counts recorded",
    afterJson: counts
  });

  console.log("Nightly task complete", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
