import argon2 from "argon2";

export function validatePasswordPolicy(password: string): string | null {
  if (password.length < 12) {
    return "Password must be at least 12 characters.";
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
