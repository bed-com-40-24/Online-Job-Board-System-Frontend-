import "server-only";

import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type DemoAccountType = "employer" | "admin";

export type DemoAuthAccount = {
  id: string;
  type: DemoAccountType;
  email: string;
  passwordHash: string;
  displayName: string;
  verificationStatus?: "Pending" | "Verified" | "Rejected";
  verificationReason?: string;
  verificationCheckedAt?: string;
  certificate?: {
    name: string;
    mime: string;
    data: string;
  };
};

type DemoResetToken = {
  type: DemoAccountType;
  email: string;
  tokenHash: string;
  expiresAt: number;
  usedAt?: number;
};

type DemoAuthData = {
  accounts: DemoAuthAccount[];
  loginAttempts: Record<string, { failedAttempts: number; lockedUntil: number | null }>;
  resetTokens: DemoResetToken[];
};

const storeDirectory = path.join(process.cwd(), ".data");
const storePath = path.join(storeDirectory, "demo-auth.json");

let pendingMutation: Promise<void> = Promise.resolve();

const developmentDemoAccounts = [
  {
    type: "employer",
    email: "employer@onlinejobboard.mw",
    password: "Employer123!",
    displayName: "Lakeview Technologies",
  },
  {
    type: "admin",
    email: "admin@onlinejobboard.mw",
    password: "Admin123!",
    displayName: "Demo Administrator",
  },
] as const;

async function addDevelopmentDemoAccounts(data: DemoAuthData): Promise<DemoAuthData> {
  if (process.env.NODE_ENV === "production" || process.env.AUTH_BACKEND === "oracle") return data;

  for (const demoAccount of developmentDemoAccounts) {
    if (data.accounts.some((account) => account.type === demoAccount.type && account.email === demoAccount.email)) {
      continue;
    }
    data.accounts.push({
      id: randomUUID(),
      type: demoAccount.type,
      email: demoAccount.email,
      passwordHash: await bcrypt.hash(demoAccount.password, 12),
      displayName: demoAccount.displayName,
      verificationStatus: "Pending",
    });
  }
  return data;
}

function isMissingFile(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

async function readStore(): Promise<DemoAuthData> {
  try {
    const contents = await readFile(storePath, "utf8");
    const parsed: unknown = JSON.parse(contents);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("accounts" in parsed) ||
      !Array.isArray(parsed.accounts) ||
      !("loginAttempts" in parsed) ||
      typeof parsed.loginAttempts !== "object" ||
      parsed.loginAttempts === null ||
      !("resetTokens" in parsed) ||
      !Array.isArray(parsed.resetTokens)
    ) {
      throw new Error("The demo authentication store has an invalid shape.");
    }
    for (const account of (parsed as DemoAuthData).accounts) {
      if (account.type === "employer" && !account.verificationStatus) {
        account.verificationStatus = "Pending";
      }
    }
    return addDevelopmentDemoAccounts(parsed as DemoAuthData);
  } catch (error) {
    if (isMissingFile(error)) {
      return addDevelopmentDemoAccounts({ accounts: [], loginAttempts: {}, resetTokens: [] });
    }
    throw error;
  }
}

async function writeStore(data: DemoAuthData): Promise<void> {
  await mkdir(storeDirectory, { recursive: true });
  const temporaryPath = `${storePath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(data), { encoding: "utf8", mode: 0o600 });
  await rename(temporaryPath, storePath);
}

function mutateStore<T>(operation: (data: DemoAuthData) => T | Promise<T>): Promise<T> {
  const result = pendingMutation.then(async () => {
    const data = await readStore();
    const value = await operation(data);
    await writeStore(data);
    return value;
  });
  pendingMutation = result.then(() => undefined, () => undefined);
  return result;
}

export async function findDemoAccount(
  type: DemoAccountType,
  email: string,
): Promise<DemoAuthAccount | undefined> {
  return mutateStore((data) =>
    data.accounts.find((account) => account.type === type && account.email === email),
  );
}

export async function getDemoEmployerVerificationRecords() {
  return mutateStore((data) => data.accounts
    .filter((account) => account.type === "employer")
    .map((account) => ({
      id: account.id,
      companyName: account.displayName,
      email: account.email,
      status: account.verificationStatus ?? "Pending",
      reason: account.verificationReason,
      checkedAt: account.verificationCheckedAt,
    })));
}

export async function createDemoAccount(
  account: Omit<DemoAuthAccount, "id">,
): Promise<boolean> {
  return mutateStore((data) => {
    if (data.accounts.some((entry) => entry.type === account.type && entry.email === account.email)) {
      return false;
    }
    data.accounts.push({ ...account, id: randomUUID() });
    return true;
  });
}

export async function getDemoLoginLockSeconds(type: DemoAccountType, email: string): Promise<number> {
  return mutateStore((data) => {
    const lockKey = `${type}:${email}`;
    const attempt = data.loginAttempts[lockKey];
    if (!attempt?.lockedUntil) return 0;
    const remaining = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
    return Math.max(remaining, 0);
  });
}

export async function recordDemoLoginFailure(type: DemoAccountType, email: string): Promise<number> {
  return mutateStore((data) => {
    const lockKey = `${type}:${email}`;
    const attempt = data.loginAttempts[lockKey];
    if (!attempt || (attempt.lockedUntil !== null && attempt.lockedUntil <= Date.now())) {
      data.loginAttempts[lockKey] = { failedAttempts: 1, lockedUntil: null };
    } else {
      attempt.failedAttempts += 1;
      if (attempt.failedAttempts >= 3) attempt.lockedUntil = Date.now() + 60_000;
    }
    const lockUntil = data.loginAttempts[lockKey].lockedUntil;
    return lockUntil ? Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000)) : 0;
  });
}

export async function clearDemoLoginFailures(type: DemoAccountType, email: string): Promise<void> {
  await mutateStore((data) => {
    delete data.loginAttempts[`${type}:${email}`];
  });
}

export async function updateDemoAccount(
  type: DemoAccountType,
  email: string,
  update: (account: DemoAuthAccount) => void,
): Promise<boolean> {
  return mutateStore((data) => {
    const account = data.accounts.find((entry) => entry.type === type && entry.email === email);
    if (!account) return false;
    update(account);
    return true;
  });
}

export async function createDemoResetToken(
  type: DemoAccountType,
  email: string,
  tokenHash: string,
): Promise<boolean> {
  return mutateStore((data) => {
    if (!data.accounts.some((account) => account.type === type && account.email === email)) return false;
    data.resetTokens = data.resetTokens.filter((token) =>
      token.type !== type || token.email !== email || token.usedAt !== undefined,
    );
    data.resetTokens.push({ type, email, tokenHash, expiresAt: Date.now() + 60 * 60 * 1000 });
    return true;
  });
}

export async function consumeDemoResetToken(
  type: DemoAccountType,
  tokenHash: string,
  passwordHash: string,
): Promise<boolean> {
  return mutateStore((data) => {
    const token = data.resetTokens.find((entry) =>
      entry.type === type &&
      entry.tokenHash === tokenHash &&
      entry.usedAt === undefined &&
      entry.expiresAt > Date.now(),
    );
    if (!token) return false;
    const account = data.accounts.find((entry) => entry.type === type && entry.email === token.email);
    if (!account) return false;
    account.passwordHash = passwordHash;
    token.usedAt = Date.now();
    return true;
  });
}
