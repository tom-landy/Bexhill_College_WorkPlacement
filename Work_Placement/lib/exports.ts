import { prisma } from "@/lib/prisma";

export const exportMap = {
  users: async () => prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  students: async () => prisma.studentProfile.findMany({ orderBy: { createdAt: "asc" } }),
  employers: async () => prisma.employer.findMany({ orderBy: { createdAt: "asc" } }),
  employer_contacts: async () => prisma.employerContact.findMany({ orderBy: { createdAt: "asc" } }),
  interactions: async () => prisma.interaction.findMany({ orderBy: { occurredAt: "asc" } }),
  opportunities: async () => prisma.opportunity.findMany({ orderBy: { createdAt: "asc" } }),
  placements: async () => prisma.placement.findMany({ orderBy: { createdAt: "asc" } }),
  compliance: async () => prisma.complianceChecklist.findMany({ orderBy: { createdAt: "asc" } }),
  placement_logs: async () => prisma.placementLog.findMany({ orderBy: { createdAt: "asc" } }),
  careers_activities: async () => prisma.careersActivity.findMany({ orderBy: { createdAt: "asc" } }),
  activity_completions: async () => prisma.studentActivityCompletion.findMany({ orderBy: { createdAt: "asc" } }),
  prospects: async () => prisma.prospectEmployer.findMany({ orderBy: { createdAt: "asc" } }),
  outreach_emails: async () => prisma.outreachEmail.findMany({ orderBy: { createdAt: "asc" } }),
  audit_events: async () => prisma.auditEvent.findMany({ orderBy: { createdAt: "asc" } })
};

export type ExportKey = keyof typeof exportMap;
