import { UserRole } from "@prisma/client";

export class AuthzError extends Error {}

const roleMatrix: Record<UserRole, UserRole[]> = {
  ADMIN: ["ADMIN", "CAREERS_LEAD", "PLACEMENT_OFFICER", "TUTOR", "STUDENT", "EMPLOYER_SUPERVISOR"],
  CAREERS_LEAD: ["CAREERS_LEAD", "STUDENT", "TUTOR"],
  PLACEMENT_OFFICER: ["PLACEMENT_OFFICER", "STUDENT", "TUTOR", "EMPLOYER_SUPERVISOR"],
  TUTOR: ["TUTOR", "STUDENT"],
  STUDENT: ["STUDENT"],
  EMPLOYER_SUPERVISOR: ["EMPLOYER_SUPERVISOR"]
};

export function assertRole(actorRole: UserRole, allowed: UserRole[]): void {
  if (!allowed.includes(actorRole)) {
    throw new AuthzError("Unauthorised");
  }
}

export function canManageUser(actorRole: UserRole, targetRole: UserRole): boolean {
  return roleMatrix[actorRole].includes(targetRole);
}
