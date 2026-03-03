import { describe, expect, test } from "vitest";
import { employerCanAccessPlacement, studentCanEditProspect, tokenIsUsable } from "../lib/domain-rules";
import { toCsv } from "../lib/csv";

describe("Employer isolation", () => {
  test("employer cannot access another supervisor's placement", () => {
    expect(employerCanAccessPlacement("contact-a", "contact-b")).toBe(false);
    expect(employerCanAccessPlacement("contact-a", "contact-a")).toBe(true);
  });
});

describe("Prospect edit restrictions", () => {
  test("student cannot edit submitted prospect", () => {
    expect(studentCanEditProspect("DRAFT")).toBe(true);
    expect(studentCanEditProspect("SUBMITTED")).toBe(false);
  });
});

describe("Token expiry and single use", () => {
  test("invite token expiry and single use", () => {
    const now = new Date("2026-03-02T10:00:00.000Z");
    expect(tokenIsUsable({ expiresAt: new Date("2026-03-02T10:05:00.000Z"), usedAt: null }, now)).toBe(true);
    expect(tokenIsUsable({ expiresAt: new Date("2026-03-02T09:00:00.000Z"), usedAt: null }, now)).toBe(false);
    expect(tokenIsUsable({ expiresAt: new Date("2026-03-02T10:05:00.000Z"), usedAt: now }, now)).toBe(false);
  });

  test("password reset token expiry and single use", () => {
    const now = new Date("2026-03-02T10:00:00.000Z");
    expect(tokenIsUsable({ expiresAt: new Date("2026-03-02T10:30:00.000Z"), usedAt: null }, now)).toBe(true);
    expect(tokenIsUsable({ expiresAt: new Date("2026-03-02T09:59:59.000Z"), usedAt: null }, now)).toBe(false);
    expect(tokenIsUsable({ expiresAt: new Date("2026-03-02T10:30:00.000Z"), usedAt: now }, now)).toBe(false);
  });
});

describe("CSV exports", () => {
  test("CSV has headers and non-empty rows", () => {
    const csv = toCsv([
      { id: "u1", email: "user@example.org", createdAt: "2026-03-02T10:00:00.000Z" },
      { id: "u2", email: "user2@example.org", createdAt: "2026-03-02T10:01:00.000Z" }
    ]);

    expect(csv).toContain("id,email,createdAt");
    expect(csv.split("\n").length).toBeGreaterThan(2);
  });
});
