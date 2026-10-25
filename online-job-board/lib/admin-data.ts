import "server-only";
import oracledb from "oracledb";
import { getOracleConnection } from "@/lib/oracle";

export type AdminEmployer = {
  id: string;
  companyName: string;
  email: string;
  createdAt: string;
};

type EmployerRow = {
  EMPLOYER_ID: number;
  COMPANY_NAME: string;
  EMAIL: string;
  CREATED_AT: Date;
};

export async function getRecentAdminEmployers(limit = 5): Promise<AdminEmployer[]> {
  let connection: oracledb.Connection | undefined;

  try {
    connection = await getOracleConnection();
    const result = await connection.execute<EmployerRow>(
      `SELECT employer_id, company_name, email, created_at
       FROM employers
       ORDER BY created_at DESC
       FETCH FIRST :rowLimit ROWS ONLY`,
      { rowLimit: limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    return (result.rows ?? []).map((employer) => ({
      id: String(employer.EMPLOYER_ID),
      companyName: employer.COMPANY_NAME,
      email: employer.EMAIL,
      createdAt: employer.CREATED_AT.toISOString(),
    }));
  } finally {
    await connection?.close();
  }
}

export async function getAdminEmployerCount(): Promise<number> {
  let connection: oracledb.Connection | undefined;

  try {
    connection = await getOracleConnection();
    const result = await connection.execute<{ EMPLOYER_COUNT: number }>(
      `SELECT COUNT(*) AS employer_count FROM employers`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const count = result.rows?.[0]?.EMPLOYER_COUNT;
    if (typeof count !== "number") {
      throw new Error("Employer count was not returned by the database.");
    }

    return count;
  } finally {
    await connection?.close();
  }
}
