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
import {
  clearDemoLoginFailures,
  createDemoAccount,
  createDemoResetToken,
  findDemoAccount,
  getDemoLoginLockSeconds,
  recordDemoLoginFailure,
  updateDemoAccount,
  consumeDemoResetToken,
} from "@/lib/demo-auth-store";

export type AuthFormState = {
  error?: string;
  success?: string;
  redirectTo?: string;
  retryAfter?: number;
  resetUrl?: string;
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

type LoginLockRow = {
  LOCKED_UNTIL: Date | string;
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

function getAuthBackend(): "demo" | "oracle" {
  const backend = process.env.AUTH_BACKEND ?? "demo";
  if (backend !== "demo" && backend !== "oracle") {
    throw new Error("AUTH_BACKEND must be either 'demo' or 'oracle'.");
  }
  return backend;
}

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

function isStrongEmployerPassword(password: string): boolean {
  return password.length >= 12 && password.length <= 72 &&
    /[a-z]/.test(password) && /[A-Z]/.test(password) &&
    /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ORA-00001"
  );
}

function getEmailHash(email: string): string {
  return createHash("sha256").update(email).digest("hex");
}

async function getLoginLockSeconds(
  connection: oracledb.Connection,
  accountType: "employer" | "admin",
  emailHash: string,
): Promise<number> {
  const result = await connection.execute<LoginLockRow>(
    `SELECT locked_until
     FROM login_attempts
     WHERE account_type = :accountType
       AND email_hash = :emailHash
       AND locked_until > SYSTIMESTAMP`,
    { accountType, emailHash },
    { outFormat: oracledb.OUT_FORMAT_OBJECT },
  );
  const lockedUntil = result.rows?.[0]?.LOCKED_UNTIL;
  if (!lockedUntil) return 0;
  const expiryTime = lockedUntil instanceof Date ? lockedUntil.getTime() : new Date(lockedUntil).getTime();
  const remaining = Math.ceil((expiryTime - Date.now()) / 1000);
  return Math.max(remaining, 0);
}

async function recordFailedLogin(
  connection: oracledb.Connection,
  accountType: "employer" | "admin",
  emailHash: string,
): Promise<number> {
  const recordAttempt = () => connection.execute(
    `MERGE INTO login_attempts target
     USING (SELECT :accountType AS account_type, :emailHash AS email_hash FROM dual) source
     ON (target.account_type = source.account_type AND target.email_hash = source.email_hash)
     WHEN MATCHED THEN UPDATE SET
       failed_attempts = CASE
         WHEN target.locked_until IS NOT NULL AND target.locked_until <= SYSTIMESTAMP THEN 1
         ELSE target.failed_attempts + 1
       END,
       locked_until = CASE
         WHEN target.locked_until IS NOT NULL AND target.locked_until <= SYSTIMESTAMP THEN NULL
         WHEN target.failed_attempts >= 2 THEN SYSTIMESTAMP + INTERVAL '60' SECOND
         ELSE NULL
       END,
       updated_at = SYSTIMESTAMP
     WHEN NOT MATCHED THEN INSERT (account_type, email_hash, failed_attempts, updated_at)
       VALUES (source.account_type, source.email_hash, 1, SYSTIMESTAMP)`,
    { accountType, emailHash },
    { autoCommit: true },
  );

  try {
    await recordAttempt();
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;
    await recordAttempt();
  }
  return getLoginLockSeconds(connection, accountType, emailHash);
}

async function clearFailedLogins(
  connection: oracledb.Connection,
  accountType: "employer" | "admin",
  emailHash: string,
): Promise<void> {
  await connection.execute(
    `DELETE FROM login_attempts
     WHERE account_type = :accountType AND email_hash = :emailHash`,
    { accountType, emailHash },
    { autoCommit: true },
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

  if (getAuthBackend() === "demo") {
    try {
      const lockSeconds = await getDemoLoginLockSeconds("employer", email);
      if (lockSeconds > 0) {
        return {
          error: `Too many incorrect attempts. Try again in ${lockSeconds} seconds.`,
          retryAfter: lockSeconds,
        };
      }
      const employer = await findDemoAccount("employer", email);
      if (!employer || !(await bcrypt.compare(password, employer.passwordHash))) {
        const retryAfter = await recordDemoLoginFailure("employer", email);
        return retryAfter > 0
          ? { error: `Too many incorrect attempts. Try again in ${retryAfter} seconds.`, retryAfter }
          : { error: "Email or password is incorrect." };
      }
      await clearDemoLoginFailures("employer", email);
      await createEmployerSession({
        id: employer.id,
        email: employer.email,
        companyName: employer.displayName,
      });
      return { redirectTo: "/employer/dashboard" };
    } catch (error) {
      console.error("Demo employer sign-in failed.", error);
      return { error: "Demo employer sign-in failed. Check the local demo store and session configuration." };
    }
  }

  let connection: oracledb.Connection | undefined;
  let employer: EmployerRow | undefined;
  const emailHash = getEmailHash(email);
  try {
    connection = await getOracleConnection();
    const lockSeconds = await getLoginLockSeconds(connection, "employer", emailHash);
    if (lockSeconds > 0) {
      return {
        error: `Too many incorrect attempts. Try again in ${lockSeconds} seconds.`,
        retryAfter: lockSeconds,
      };
    }

    const result = await connection.execute<EmployerRow>(
      `SELECT employer_id, email, password_hash, company_name
       FROM employers
       WHERE UPPER(email) = UPPER(:email)`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    employer = result.rows?.[0];
    if (!employer || !(await bcrypt.compare(password, employer.PASSWORD_HASH))) {
      const retryAfter = await recordFailedLogin(connection, "employer", emailHash);
      return retryAfter > 0
        ? { error: `Too many incorrect attempts. Try again in ${retryAfter} seconds.`, retryAfter }
        : { error: "Email or password is incorrect." };
    }
    await clearFailedLogins(connection, "employer", emailHash);
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
  const confirmPassword = getValue(formData, "confirmPassword");
  const certificateEntry = formData.get("businessRegistrationCertificateFile");
  const physicalBusinessAddress = getValue(formData, "physicalBusinessAddress");
  const companyPhone = getValue(formData, "companyPhone");
  const representativeName = getValue(formData, "representativeName");
  const representativePosition = getValue(formData, "representativePosition");

  if (companyName.length < 2 || companyName.length > 200) {
    return { error: "Company name must be between 2 and 200 characters." };
  }
  if (!(certificateEntry instanceof File) || certificateEntry.size === 0) {
    return { error: "Upload your business registration certificate." };
  }
  if (certificateEntry.size > 5 * 1024 * 1024) {
    return { error: "The certificate file must be 5 MB or smaller." };
  }
  if (physicalBusinessAddress.length < 5 || physicalBusinessAddress.length > 500) {
    return { error: "Enter a physical business address between 5 and 500 characters." };
  }
  if (companyPhone.length > 20 || !/^\+?[0-9][0-9\s()-]{6,18}$/.test(companyPhone)) {
    return { error: "Enter a valid company phone number." };
  }
  if (representativeName.length < 2 || representativeName.length > 100) {
    return { error: "Enter the authorized representative's name." };
  }
  if (representativePosition.length < 2 || representativePosition.length > 100) {
    return { error: "Enter the authorized representative's position." };
  }
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };
  if (!isStrongEmployerPassword(password)) {
    return { error: "Use at least 12 characters, including uppercase and lowercase letters, a number, and a symbol." };
  }
  if (password !== confirmPassword) {
    return { error: "The passwords do not match." };
  }

  let certificateBuffer: Buffer;
  try {
    certificateBuffer = Buffer.from(await certificateEntry.arrayBuffer());
  } catch (error) {
    console.error("Unable to read employer business certificate upload.", error);
    return { error: "The certificate file could not be read. Please choose it again." };
  }
  const signature = certificateBuffer.subarray(0, 12);
  let certificateMime: string;
  let certificateExtension: string;
  if (signature.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    certificateMime = "application/pdf";
    certificateExtension = ".pdf";
  } else if (signature.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    certificateMime = "image/png";
    certificateExtension = ".png";
  } else if (signature.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    certificateMime = "image/jpeg";
    certificateExtension = ".jpg";
  } else if (signature.subarray(0, 4).toString("ascii") === "RIFF" &&
    signature.subarray(8, 12).toString("ascii") === "WEBP") {
    certificateMime = "image/webp";
    certificateExtension = ".webp";
  } else {
    return { error: "Upload a valid PDF, JPEG, PNG, or WebP certificate file." };
  }
  const certificateBaseName = certificateEntry.name
    .replace(/[\\/\0-\x1f\x7f]/g, "_")
    .replace(/\.[^.]*$/, "")
    .slice(0, 240);
  const certificateName = `${certificateBaseName || "business-registration-certificate"}${certificateExtension}`;

  if (getAuthBackend() === "demo") {
    try {
      const passwordHash = await bcrypt.hash(password, 12);
      const created = await createDemoAccount({
        type: "employer",
        email,
        passwordHash,
        displayName: companyName,
        certificate: {
          name: certificateName,
          mime: certificateMime,
          data: certificateBuffer.toString("base64"),
        },
      });
      if (!created) return { error: "An account with that email address already exists." };
      return { success: "Test employer account created locally. You can now sign in." };
    } catch (error) {
      console.error("Demo employer registration failed.", error);
      return { error: "The local demo account could not be saved. Check that the project folder is writable." };
    }
  }

  let connection: oracledb.Connection | undefined;
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    connection = await getOracleConnection();
    await connection.execute(
      `INSERT INTO employers (
         email, password_hash, company_name, business_registration_certificate_file,
         business_registration_certificate_name, business_registration_certificate_mime,
         physical_business_address, company_phone, representative_name, representative_position
       ) VALUES (
         :email, :passwordHash, :companyName, :certificateFile,
         :certificateName, :certificateMime,
         :physicalBusinessAddress, :companyPhone, :representativeName, :representativePosition
       )`,
      {
        email,
        passwordHash,
        companyName,
        certificateFile: { val: certificateBuffer, type: oracledb.BLOB },
        certificateName,
        certificateMime,
        physicalBusinessAddress,
        companyPhone,
        representativeName,
        representativePosition,
      },
      { autoCommit: true },
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "An account with that email address already exists." };
    }
    console.error("Employer registration failed.", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error.code === "ORA-00904" || error.code === "ORA-00942")
    ) {
      return {
        error: "Employer account setup is incomplete. Ask your database administrator to run employer-security.sql and employer-certificate-upload.sql, then try again.",
      };
    }
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

  if (getAuthBackend() === "demo") {
    try {
      const updated = await updateDemoAccount("employer", employer.email, (account) => {
        account.displayName = companyName;
      });
      if (!updated) return { error: "The demo employer account was not found. The profile was not updated." };
      await createEmployerSession({ ...employer, companyName });
      return { success: "Company profile updated in the local demo store." };
    } catch (error) {
      console.error("Demo employer profile update failed.", error);
      return { error: "The local demo profile could not be updated." };
    }
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

  if (getAuthBackend() === "demo") {
    try {
      const lockSeconds = await getDemoLoginLockSeconds("admin", email);
      if (lockSeconds > 0) {
        return {
          error: `Too many incorrect attempts. Try again in ${lockSeconds} seconds.`,
          retryAfter: lockSeconds,
        };
      }
      const admin = await findDemoAccount("admin", email);
      if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
        const retryAfter = await recordDemoLoginFailure("admin", email);
        return retryAfter > 0
          ? { error: `Too many incorrect attempts. Try again in ${retryAfter} seconds.`, retryAfter }
          : { error: "Email or password is incorrect." };
      }
      await clearDemoLoginFailures("admin", email);
      await createAdminSession({
        id: admin.id,
        email: admin.email,
        fullName: admin.displayName,
      });
      return { redirectTo: "/admin/dashboard" };
    } catch (error) {
      console.error("Demo administrator sign-in failed.", error);
      return { error: "Demo administrator sign-in failed. Check the local demo store and session configuration." };
    }
  }

  let connection: oracledb.Connection | undefined;
  let admin: AdminRow | undefined;
  const emailHash = getEmailHash(email);
  try {
    connection = await getOracleConnection();
    const lockSeconds = await getLoginLockSeconds(connection, "admin", emailHash);
    if (lockSeconds > 0) {
      return {
        error: `Too many incorrect attempts. Try again in ${lockSeconds} seconds.`,
        retryAfter: lockSeconds,
      };
    }

    const result = await connection.execute<AdminRow>(
      `SELECT admin_id, email, password_hash, full_name
       FROM administrators
       WHERE UPPER(email) = UPPER(:email)`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    admin = result.rows?.[0];
    if (!admin || !(await bcrypt.compare(password, admin.PASSWORD_HASH))) {
      const retryAfter = await recordFailedLogin(connection, "admin", emailHash);
      return retryAfter > 0
        ? { error: `Too many incorrect attempts. Try again in ${retryAfter} seconds.`, retryAfter }
        : { error: "Email or password is incorrect." };
    }
    await clearFailedLogins(connection, "admin", emailHash);
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

  if (getAuthBackend() === "demo") {
    try {
      const created = await createDemoAccount({
        type: "admin",
        email,
        passwordHash: await bcrypt.hash(password, 12),
        displayName: fullName,
      });
      return created
        ? { success: "Test administrator account created locally. You can now sign in." }
        : { error: "An administrator account with that email already exists." };
    } catch (error) {
      console.error("Demo administrator registration failed.", error);
      return { error: "The local demo account could not be saved. Check that the project folder is writable." };
    }
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
  if (getAuthBackend() === "demo") {
    try {
      const demoType = accountType === "admin" ? "admin" : "employer";
      const account = await findDemoAccount(demoType, email);
      if (!account) {
        return { success: "If an account matches that email, a reset link will be available." };
      }
      const token = randomBytes(32).toString("base64url");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const stored = await createDemoResetToken(demoType, email, tokenHash);
      if (!stored) {
        return { error: "A local demo reset link could not be created. Please try again." };
      }
      return {
        success: "Demo reset link created. Open it in this browser to choose a new password.",
        resetUrl: `${config.resetPath}?token=${encodeURIComponent(token)}`,
      };
    } catch (error) {
      console.error(`Unable to create demo ${accountType} password reset.`, error);
      return { error: "The local demo reset link could not be created." };
    }
  }

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
  if (accountType === "employer" && !isStrongEmployerPassword(password)) {
    return { error: "Use at least 12 characters, including uppercase and lowercase letters, a number, and a symbol." };
  }

  const config = resetAccountConfig[accountType];
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const passwordHash = await bcrypt.hash(password, 12);
  if (getAuthBackend() === "demo") {
    try {
      const updated = await consumeDemoResetToken(
        accountType === "admin" ? "admin" : "employer",
        tokenHash,
        passwordHash,
      );
      if (!updated) return { error: "This reset link is invalid or expired." };
      return {
        success: "Your password has been updated. Sign in with your new password.",
        redirectTo: accountType === "admin" ? "/admin/login" : "/employer/login",
      };
    } catch (error) {
      console.error(`Demo ${accountType} password reset failed.`, error);
      return { error: "The local demo password could not be updated. Please request a new link." };
    }
  }

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
