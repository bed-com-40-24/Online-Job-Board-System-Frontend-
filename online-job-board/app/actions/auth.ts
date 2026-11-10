"use server";

import bcrypt from "bcryptjs";
import oracledb from "oracledb";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getOracleConnection } from "@/lib/oracle";
import { createAdminSession, clearAdminSession } from "@/lib/admin-session";
import {
  createEmployerSession,
  clearEmployerSession,
  getEmployerSession,
} from "@/lib/employer-session";
import { sendPasswordResetEmail } from "@/lib/mail";

export type AuthFormState = {
  error?: string;
  success?: string;
  redirectTo?: string;
};

type EmployerRow = {
  EMPLOYER_ID: number;
  EMAIL: string;
  PASSWORD_HASH: string;
  COMPANY_NAME: string;
};

type AdminRow = {
  ADMIN_ID: number;
  EMAIL: string;
  PASSWORD_HASH: string;
  FULL_NAME: string;
};

type ResetAccount = {
  ACCOUNT_ID: number;
  EMAIL: string;
};

type ResetRow = {
  ACCOUNT_ID: number;
};

const resetAccountConfig = {
  employer: {
    accountTable: "employers",
    accountId: "employer_id",
    resetTable: "employer_password_resets",
    resetId: "employer_id",
    accountType: "employer",
    resetPath: "/employer/reset-password",
  },
  admin: {
    accountTable: "administrators",
    accountId: "admin_id",
    resetTable: "administrator_password_resets",
    resetId: "admin_id",
    accountType: "administrator",
    resetPath: "/admin/reset-password",
  },
} as const;

function getValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPassword(formData: FormData): string {
  const value = formData.get("password");
  return typeof value === "string" ? value : "";
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ORA-00001"
  );
}

export async function loginEmployer(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getValue(formData, "email").toLowerCase();
  const password = getPassword(formData);
  if (!isValidEmail(email) || password.length === 0 || password.length > 72) {
    return { error: "Enter a valid email address and password." };
  }

  let connection: oracledb.Connection | undefined;
  let employer: EmployerRow | undefined;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute<EmployerRow>(
      `SELECT employer_id, email, password_hash, company_name
       FROM employers
       WHERE UPPER(email) = UPPER(:email)`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    employer = result.rows?.[0];
    if (!employer || !(await bcrypt.compare(password, employer.PASSWORD_HASH))) {
      return { error: "Email or password is incorrect." };
    }
  } catch (error) {
    console.error("Employer sign-in failed.", error);
    return { error: "Employer sign-in is temporarily unavailable. Please try again." };
  } finally {
    await connection?.close();
  }

  try {
    await createEmployerSession({
      id: String(employer.EMPLOYER_ID),
      email: employer.EMAIL,
      companyName: employer.COMPANY_NAME,
    });
  } catch (error) {
    console.error("Unable to create employer session.", error);
    return { error: "A secure session could not be created. Check the server session configuration." };
  }

  return { redirectTo: "/employer/dashboard" };
}

export async function registerEmployer(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const companyName = getValue(formData, "companyName");
  const email = getValue(formData, "email").toLowerCase();
  const password = getPassword(formData);

  if (companyName.length < 2 || companyName.length > 200) {
    return { error: "Company name must be between 2 and 200 characters." };
  }
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };
  if (password.length < 8 || password.length > 72) {
    return { error: "Password must be between 8 and 72 characters." };
  }

  let connection: oracledb.Connection | undefined;
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    connection = await getOracleConnection();
    await connection.execute(
      `INSERT INTO employers (email, password_hash, company_name)
       VALUES (:email, :passwordHash, :companyName)`,
      { email, passwordHash, companyName },
      { autoCommit: true },
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "An account with that email address already exists." };
    }
    console.error("Employer registration failed.", error);
    return { error: "Employer registration is temporarily unavailable. Please try again." };
  } finally {
    await connection?.close();
  }

  return { success: "Your employer account has been created. You can now sign in." };
}

export async function updateEmployerCompanyName(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const employer = await getEmployerSession();
  if (!employer) return { error: "Sign in again before updating your company profile." };

  const companyName = getValue(formData, "companyName");
  if (companyName.length < 2 || companyName.length > 200) {
    return { error: "Company name must be between 2 and 200 characters." };
  }

  let connection: oracledb.Connection | undefined;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute(
      `UPDATE employers
       SET company_name = :companyName
       WHERE employer_id = :employerId`,
      { companyName, employerId: employer.id },
      { autoCommit: true },
    );
    if (result.rowsAffected !== 1) {
      return { error: "The employer account was not found. The profile was not updated." };
    }
  } catch (error) {
    console.error("Employer profile update failed.", error);
    return { error: "The company profile could not be updated. Please try again." };
  } finally {
    await connection?.close();
  }

  try {
    await createEmployerSession({ ...employer, companyName });
  } catch (error) {
    console.error("Employer profile updated but session refresh failed.", error);
    return {
      error: "The profile was saved, but your session could not refresh. Sign out and sign in again.",
    };
  }

  return { success: "Company profile updated." };
}

export async function loginAdmin(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getValue(formData, "email").toLowerCase();
  const password = getPassword(formData);
  if (!isValidEmail(email) || password.length === 0 || password.length > 72) {
    return { error: "Enter a valid email address and password." };
  }

  let connection: oracledb.Connection | undefined;
  let admin: AdminRow | undefined;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute<AdminRow>(
      `SELECT admin_id, email, password_hash, full_name
       FROM administrators
       WHERE UPPER(email) = UPPER(:email)`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    admin = result.rows?.[0];
    if (!admin || !(await bcrypt.compare(password, admin.PASSWORD_HASH))) {
      return { error: "Email or password is incorrect." };
    }
  } catch (error) {
    console.error("Administrator sign-in failed.", error);
    return { error: "Administrator sign-in is temporarily unavailable. Please try again." };
  } finally {
    await connection?.close();
  }

  try {
    await createAdminSession({
      id: String(admin.ADMIN_ID),
      email: admin.EMAIL,
      fullName: admin.FULL_NAME,
    });
  } catch (error) {
    console.error("Unable to create administrator session.", error);
    return { error: "A secure session could not be created. Check the server session configuration." };
  }

  return { redirectTo: "/admin/dashboard" };
}

export async function registerAdmin(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fullName = getValue(formData, "fullName");
  const email = getValue(formData, "email").toLowerCase();
  const password = getPassword(formData);
  const setupKey = getValue(formData, "setupKey");
  const expectedSetupKey = process.env.ADMIN_SIGNUP_KEY;

  if (fullName.length < 2 || fullName.length > 100) {
    return { error: "Full name must be between 2 and 100 characters." };
  }
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };
  if (password.length < 12 || password.length > 72) {
    return { error: "Password must be between 12 and 72 characters." };
  }
  const submittedSetupKey = Buffer.from(setupKey);
  const configuredSetupKey = Buffer.from(expectedSetupKey ?? "");
  if (
    !expectedSetupKey ||
    submittedSetupKey.length !== configuredSetupKey.length ||
    !timingSafeEqual(submittedSetupKey, configuredSetupKey)
  ) {
    return { error: "The administrator setup key is invalid." };
  }

  let connection: oracledb.Connection | undefined;
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    connection = await getOracleConnection();
    await connection.execute(
      `INSERT INTO administrators (email, password_hash, full_name)
       VALUES (:email, :passwordHash, :fullName)`,
      { email, passwordHash, fullName },
      { autoCommit: true },
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "An administrator account with that email already exists." };
    }
    console.error("Administrator registration failed.", error);
    return { error: "Administrator registration is temporarily unavailable. Please try again." };
  } finally {
    await connection?.close();
  }

  return { success: "Your administrator account has been created. You can now sign in." };
}

async function requestPasswordReset(
  accountType: keyof typeof resetAccountConfig,
  formData: FormData,
): Promise<AuthFormState> {
  const email = getValue(formData, "email").toLowerCase();
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };

  const config = resetAccountConfig[accountType];
  let connection: oracledb.Connection | undefined;
  let account: ResetAccount | undefined;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute<ResetAccount>(
      `SELECT ${config.accountId} AS account_id, email
       FROM ${config.accountTable}
       WHERE UPPER(email) = UPPER(:email)`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    account = result.rows?.[0];
  } catch (error) {
    console.error(`Unable to look up ${accountType} password reset.`, error);
    return { error: "Password reset is temporarily unavailable. Please try again." };
  } finally {
    await connection?.close();
  }

  if (!account) {
    return { success: "If an account matches that email, a reset link will be sent." };
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  connection = undefined;
  try {
    connection = await getOracleConnection();
    await connection.execute(
      `INSERT INTO ${config.resetTable} (${config.resetId}, token_hash, expires_at)
       VALUES (:accountId, :tokenHash, SYSTIMESTAMP + INTERVAL '1' HOUR)`,
      { accountId: account.ACCOUNT_ID, tokenHash },
      { autoCommit: true },
    );
  } catch (error) {
    console.error(`Unable to store ${accountType} password reset token.`, error);
    return { error: "Password reset is temporarily unavailable. Please try again." };
  } finally {
    await connection?.close();
  }

  try {
    const appUrl = process.env.APP_URL;
    if (!appUrl) throw new Error("APP_URL is not configured.");
    const resetUrl = new URL(config.resetPath, appUrl);
    resetUrl.searchParams.set("token", token);
    await sendPasswordResetEmail(account.EMAIL, resetUrl.toString(), config.accountType);
  } catch (error) {
    console.error(`Unable to send ${accountType} password reset email.`, error);
    return { error: "The reset email could not be sent. Check the mail configuration and try again." };
  }

  return { success: "If an account matches that email, a reset link will be sent." };
}

async function resetPassword(
  accountType: keyof typeof resetAccountConfig,
  formData: FormData,
): Promise<AuthFormState> {
  const token = getValue(formData, "token");
  const password = getPassword(formData);
  const minimumLength = accountType === "admin" ? 12 : 8;
  if (!token || token.length > 200) return { error: "This reset link is invalid or expired." };
  if (password.length < minimumLength || password.length > 72) {
    return { error: `Password must be between ${minimumLength} and 72 characters.` };
  }

  const config = resetAccountConfig[accountType];
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const passwordHash = await bcrypt.hash(password, 12);
  let connection: oracledb.Connection | undefined;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute<ResetRow>(
      `SELECT ${config.resetId} AS account_id
       FROM ${config.resetTable}
       WHERE token_hash = :tokenHash
         AND used_at IS NULL
         AND expires_at > SYSTIMESTAMP
       FOR UPDATE`,
      { tokenHash },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const reset = result.rows?.[0];
    if (!reset) {
      await connection.rollback();
      return { error: "This reset link is invalid or expired." };
    }

    await connection.execute(
      `UPDATE ${config.accountTable}
       SET password_hash = :passwordHash
       WHERE ${config.accountId} = :accountId`,
      { passwordHash, accountId: reset.ACCOUNT_ID },
    );
    await connection.execute(
      `UPDATE ${config.resetTable}
       SET used_at = SYSTIMESTAMP
       WHERE token_hash = :tokenHash`,
      { tokenHash },
    );
    await connection.commit();
  } catch (error) {
    try {
      await connection?.rollback();
    } catch (rollbackError) {
      console.error(`Unable to roll back ${accountType} password reset.`, rollbackError);
    }
    console.error(`${accountType} password reset failed.`, error);
    return { error: "Password reset is temporarily unavailable. Please request a new link." };
  } finally {
    await connection?.close();
  }

  return {
    success: "Your password has been updated. Sign in with your new password.",
    redirectTo: accountType === "admin" ? "/admin/login" : "/employer/login",
  };
}

export async function requestEmployerPasswordReset(
  _previousState: AuthFormState,
  formData: FormData,
) {
  return requestPasswordReset("employer", formData);
}

export async function resetEmployerPassword(
  _previousState: AuthFormState,
  formData: FormData,
) {
  return resetPassword("employer", formData);
}

export async function requestAdminPasswordReset(
  _previousState: AuthFormState,
  formData: FormData,
) {
  return requestPasswordReset("admin", formData);
}

export async function resetAdminPassword(
  _previousState: AuthFormState,
  formData: FormData,
) {
  return resetPassword("admin", formData);
}

export async function logoutEmployer() {
  await clearEmployerSession();
}

export async function logoutAdmin() {
  await clearAdminSession();
}
