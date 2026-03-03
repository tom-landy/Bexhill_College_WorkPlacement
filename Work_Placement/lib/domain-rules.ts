import { ProspectStatus } from "@prisma/client";

type TokenRecord = {
  expiresAt: Date;
  usedAt: Date | null;
};

export function employerCanAccessPlacement(linkedContactId: string, placementSupervisorContactId: string): boolean {
  return linkedContactId === placementSupervisorContactId;
}

export function studentCanEditProspect(status: ProspectStatus): boolean {
  return status === "DRAFT";
}

export function tokenIsUsable(token: TokenRecord, now: Date): boolean {
  if (token.usedAt) {
    return false;
  }
  return token.expiresAt.getTime() > now.getTime();
}
