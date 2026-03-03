import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  await prisma.authEvent.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.placementLogStatusHistory.deleteMany();
  await prisma.placementStatusHistory.deleteMany();
  await prisma.prospectStatusHistory.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.inviteToken.deleteMany();
  await prisma.outreachEmail.deleteMany();
  await prisma.studentActivityCompletion.deleteMany();
  await prisma.careersActivity.deleteMany();
  await prisma.placementLog.deleteMany();
  await prisma.complianceChecklist.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.employerAccountLink.deleteMany();
  await prisma.employerContact.deleteMany();
  await prisma.employer.deleteMany();
  await prisma.prospectEmployer.deleteMany();
  await prisma.skillsProfile.deleteMany();
  await prisma.note.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.authRateLimit.deleteMany();
  await prisma.emailRecord.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await hashPassword("CollegePassphrase2026");
  const adminPassword = await hashPassword("Alpha1234*");

  const roles: Array<{ name: string; email: string; role: UserRole }> = [
    { name: "Admin", email: "admin@college.local", role: "ADMIN" },
    { name: "Casey Careers", email: "careers@college.local", role: "CAREERS_LEAD" },
    { name: "Parker Placement", email: "placement@college.local", role: "PLACEMENT_OFFICER" },
    { name: "Toni Tutor", email: "tutor@college.local", role: "TUTOR" },
    { name: "Emery Employer", email: "employer@college.local", role: "EMPLOYER_SUPERVISOR" }
  ];

  const users = await Promise.all(
    roles.map((u) =>
      prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          role: u.role,
          passwordHash: u.role === "ADMIN" ? adminPassword : defaultPassword,
          isActive: true
        }
      })
    )
  );

  const tutor = users.find((u) => u.role === "TUTOR");
  if (!tutor) throw new Error("Tutor missing");

  const students = await Promise.all(
    Array.from({ length: 8 }, (_, i) => i + 1).map(async (i) => {
      const user = await prisma.user.create({
        data: {
          name: `Student ${i}`,
          email: `student${i}@college.local`,
          role: "STUDENT",
          passwordHash: defaultPassword,
          isActive: true
        }
      });
      const profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          yearGroup: i <= 4 ? "Year 12" : "Year 13",
          tutorGroup: i <= 4 ? "12A" : "13A",
          tutorUserId: tutor.id,
          pp: i % 2 === 0,
          send: i % 3 === 0
        }
      });
      return { user, profile };
    })
  );

  const employers = await Promise.all(
    [
      ["Harbour Engineering", "Engineering"],
      ["Greenline Care", "Health and Care"],
      ["Northgate Digital", "Technology"],
      ["Bright Retail Group", "Retail"],
      ["Southfield Logistics", "Logistics"]
    ].map(([name, sector], idx) =>
      prisma.employer.create({
        data: {
          name,
          sector,
          address: `${idx + 1} College Road, Brighton`,
          website: `https://example${idx + 1}.org`
        }
      })
    )
  );

  const contacts = await Promise.all(
    employers.map((employer, i) =>
      prisma.employerContact.create({
        data: {
          employerId: employer.id,
          name: `Supervisor ${i + 1}`,
          email: `supervisor${i + 1}@example.org`,
          phone: `01273 00000${i + 1}`
        }
      })
    )
  );

  const employerSupervisor = users.find((u) => u.role === "EMPLOYER_SUPERVISOR");
  if (!employerSupervisor) throw new Error("Employer supervisor missing");

  await prisma.employerAccountLink.create({
    data: {
      userId: employerSupervisor.id,
      employerContactId: contacts[0].id
    }
  });

  const placementOfficer = users.find((u) => u.role === "PLACEMENT_OFFICER");
  if (!placementOfficer) throw new Error("Placement officer missing");

  for (const employer of employers) {
    await prisma.interaction.create({
      data: {
        employerId: employer.id,
        userId: placementOfficer.id,
        type: "MEETING",
        notes: "Initial engagement meeting",
        occurredAt: new Date()
      }
    });
  }

  const stages = ["NEW", "CONTACTED", "MEETING", "OFFER", "LIVE", "FILLED"] as const;
  await Promise.all(
    Array.from({ length: 6 }, (_, i) =>
      prisma.opportunity.create({
        data: {
          employerId: employers[i % employers.length].id,
          type: i % 2 === 0 ? "WORK_PLACEMENT" : "APPRENTICESHIP",
          title: `Opportunity ${i + 1}`,
          shortDescription: "Structured work-based learning opportunity",
          status: i === 5 ? "CLOSED" : "OPEN",
          pipelineStage: stages[i]
        }
      })
    )
  );

  const placementDefs = [
    { status: "IN_PROGRESS", hoursTarget: 120, student: 0, employer: 0, supervisor: 0 },
    { status: "PENDING", hoursTarget: 90, student: 1, employer: 1, supervisor: 1 },
    { status: "COMPLETED", hoursTarget: 100, student: 2, employer: 2, supervisor: 0 },
    { status: "CANCELLED", hoursTarget: 60, student: 3, employer: 3, supervisor: 3 },
    { status: "DRAFT", hoursTarget: 80, student: 4, employer: 4, supervisor: 0 }
  ] as const;

  const placements = [];

  for (const def of placementDefs) {
    const placement = await prisma.placement.create({
      data: {
        studentId: students[def.student].profile.id,
        employerId: employers[def.employer].id,
        supervisorContactId: contacts[def.supervisor].id,
        startDate: new Date("2026-01-12"),
        endDate: new Date("2026-06-30"),
        hoursTarget: def.hoursTarget,
        status: def.status,
        employerConfirmationStatus: def.status === "COMPLETED" ? "CONFIRMED" : "PENDING",
        employerConfirmedAt: def.status === "COMPLETED" ? new Date() : null,
        employerConfirmedByUserId: def.status === "COMPLETED" ? employerSupervisor.id : null
      }
    });

    placements.push(placement);

    await prisma.complianceChecklist.create({
      data: {
        placementId: placement.id,
        itemsJson: [
          { name: "DBS check", status: "completed", completedAt: new Date().toISOString() },
          { name: "Health and safety briefing", status: "completed", completedAt: new Date().toISOString() },
          { name: "Risk assessment", status: "pending", dueDate: "21/03/2026" }
        ]
      }
    });

    await prisma.placementStatusHistory.create({
      data: {
        placementId: placement.id,
        fromStatus: null,
        toStatus: def.status,
        changedByUserId: placementOfficer.id
      }
    });
  }

  const tutorUser = users.find((u) => u.role === "TUTOR");
  if (!tutorUser) throw new Error("Tutor user missing");

  for (let i = 0; i < 12; i += 1) {
    const placement = placements[i % placements.length];
    const tutorStatus = i % 3 === 0 ? "APPROVED" : i % 4 === 0 ? "REJECTED" : "PENDING";
    const employerStatus = i % 2 === 0 ? "VERIFIED" : i % 5 === 0 ? "DISPUTED" : "PENDING";

    const log = await prisma.placementLog.create({
      data: {
        placementId: placement.id,
        date: new Date(Date.now() - i * 86400000),
        hours: 6,
        reflection: `Learner reflection entry ${i + 1}`,
        supervisorName: `Supervisor ${(i % 5) + 1}`,
        studentSubmittedAt: new Date(),
        tutorApprovalStatus: tutorStatus,
        tutorApprovedById: tutorStatus === "PENDING" ? null : tutorUser.id,
        tutorApprovedAt: tutorStatus === "PENDING" ? null : new Date(),
        tutorComment: tutorStatus === "REJECTED" ? "Please add more detail." : null,
        employerVerificationStatus: employerStatus,
        employerVerifiedByUserId: employerStatus === "PENDING" ? null : employerSupervisor.id,
        employerVerifiedAt: employerStatus === "PENDING" ? null : new Date(),
        employerComment: employerStatus === "DISPUTED" ? "Hours do not match shift rota." : null
      }
    });

    await prisma.placementLogStatusHistory.create({
      data: {
        placementLogId: log.id,
        fromTutorStatus: null,
        toTutorStatus: tutorStatus,
        fromEmployerStatus: null,
        toEmployerStatus: employerStatus,
        changedByUserId: tutorUser.id
      }
    });
  }

  const gatsbySets = [
    ["G1", "G4"],
    ["G2", "G5"],
    ["G3", "G6"],
    ["G4", "G7"],
    ["G5", "G8"]
  ];

  const activities = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.careersActivity.create({
        data: {
          title: `Careers Activity ${i + 1}`,
          description: "Structured careers activity for programme evidence.",
          yearGroup: i < 5 ? "Year 12" : "Year 13",
          dueDate: new Date(Date.now() + (i + 7) * 86400000),
          gatsbyTags: gatsbySets[i % gatsbySets.length]
        }
      })
    )
  );

  for (const [i, student] of students.entries()) {
    for (const [j, activity] of activities.slice(0, 3).entries()) {
      await prisma.studentActivityCompletion.create({
        data: {
          studentId: student.profile.id,
          activityId: activity.id,
          status: i % 2 === 0 && j === 0 ? "APPROVED" : "SUBMITTED",
          evidenceObjectKey: `evidence/student-${i + 1}/activity-${j + 1}.pdf`,
          evidenceFileName: `activity-${j + 1}.pdf`,
          evidenceFileSize: 45678,
          evidenceMimeType: "application/pdf",
          submittedAt: new Date(),
          markedById: i % 2 === 0 && j === 0 ? users.find((u) => u.role === "CAREERS_LEAD")?.id : null,
          markedAt: i % 2 === 0 && j === 0 ? new Date() : null,
          markerComment: i % 2 === 0 && j === 0 ? "Evidence complete." : null
        }
      });
    }
  }

  const prospect1 = await prisma.prospectEmployer.create({
    data: {
      studentId: students[5].profile.id,
      companyName: "Future Fabricators",
      contactName: "Jordan Miles",
      contactEmail: "jordan@future-fabricators.org",
      status: "PLACEMENT_CREATED",
      submittedAt: new Date(),
      reviewedAt: new Date(),
      reviewedById: placementOfficer.id,
      reviewComment: "Converted to placement"
    }
  });

  const prospect2 = await prisma.prospectEmployer.create({
    data: {
      studentId: students[6].profile.id,
      companyName: "Citycare Services",
      contactName: "Alex Khan",
      contactEmail: "alex@citycare.example",
      status: "APPROVED",
      submittedAt: new Date(),
      reviewedAt: new Date(),
      reviewedById: placementOfficer.id,
      reviewComment: "Approved for outreach"
    }
  });

  const prospect3 = await prisma.prospectEmployer.create({
    data: {
      studentId: students[7].profile.id,
      companyName: "Westbay Retail",
      contactName: "Taylor Reed",
      contactEmail: "taylor@westbay.example",
      status: "REJECTED",
      submittedAt: new Date(),
      reviewedAt: new Date(),
      reviewedById: placementOfficer.id,
      reviewComment: "Insufficient safeguarding checks"
    }
  });

  for (const p of [prospect1, prospect2, prospect3]) {
    await prisma.prospectStatusHistory.create({
      data: {
        prospectEmployerId: p.id,
        fromStatus: "SUBMITTED",
        toStatus: p.status,
        changedByUserId: placementOfficer.id
      }
    });
  }

  await prisma.outreachEmail.create({
    data: {
      prospectEmployerId: prospect2.id,
      sentByUserId: placementOfficer.id,
      toEmail: prospect2.contactEmail,
      subject: "Work placement partnership",
      body: "Thank you for discussing placement opportunities.",
      status: "SENT",
      sentAt: new Date()
    }
  });

  const admin = users.find((u) => u.role === "ADMIN");
  if (!admin) throw new Error("Admin missing");

  await prisma.auditEvent.createMany({
    data: [
      {
        actorUserId: placementOfficer.id,
        action: "placement.create",
        entityType: "Placement",
        entityId: placements[0].id,
        summary: "Placement created via seed data"
      },
      {
        actorUserId: admin.id,
        action: "user.create",
        entityType: "User",
        entityId: students[0].user.id,
        summary: "Student account created"
      }
    ]
  });

  console.log("Seed complete. Admin password: Alpha1234*. Other users: CollegePassphrase2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
