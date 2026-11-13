import "server-only";

import oracledb from "oracledb";
import { getDemoEmployerVerificationRecords } from "@/lib/demo-auth-store";
import { getOracleConnection } from "@/lib/oracle";
import type { OrgStatus } from "@/lib/data";

export type EmployerVerificationRecord = {
  id: string;
  companyName: string;
  email: string;
  status: OrgStatus;
  reason?: string;
  checkedAt?: string;
};

type EmployerVerificationRow = {
  EMPLOYER_ID: number;
  COMPANY_NAME: string;
  EMAIL: string;
  VERIFICATION_STATUS: OrgStatus | null;
  VERIFICATION_REASON: string | null;
  VERIFICATION_CHECKED_AT: Date | null;
};

export async function getEmployerVerificationRecords(): Promise<EmployerVerificationRecord[]> {
  if ((process.env.AUTH_BACKEND ?? "demo") === "demo") {
    return getDemoEmployerVerificationRecords();
  }

  let connection: oracledb.Connection | undefined;
  try {
    connection = await getOracleConnection();
    const result = await connection.execute<EmployerVerificationRow>(
      `SELECT employer_id, company_name, email, verification_status,
              verification_reason, verification_checked_at
       FROM employers
       ORDER BY CASE verification_status WHEN 'Pending' THEN 0 ELSE 1 END,
                created_at DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return (result.rows ?? []).map((row) => ({
      id: String(row.EMPLOYER_ID),
      companyName: row.COMPANY_NAME,
      email: row.EMAIL,
      status: row.VERIFICATION_STATUS === "Verified" || row.VERIFICATION_STATUS === "Rejected"
        ? row.VERIFICATION_STATUS
        : "Pending",
      reason: row.VERIFICATION_REASON ?? undefined,
      checkedAt: row.VERIFICATION_CHECKED_AT?.toISOString(),
    }));
  } finally {
    await connection?.close();
  }
}
