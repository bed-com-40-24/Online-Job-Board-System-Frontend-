import "server-only";
import oracledb from "oracledb";

type OracleGlobal = typeof globalThis & {
  employerOraclePool?: Promise<oracledb.Pool>;
};

const globalForOracle = globalThis as OracleGlobal;

export async function getOracleConnection() {
  const user = process.env.ORACLE_USER;
  const password = process.env.ORACLE_PASSWORD;
  const connectString = process.env.ORACLE_CONNECT_STRING;

  if (!user || !password || !connectString) {
    throw new Error("Oracle connection environment variables are missing.");
  }

  const pool =
    globalForOracle.employerOraclePool ??=
      oracledb.createPool({
        user,
        password,
        connectString,
        poolMin: 1,
        poolMax: 5,
        poolIncrement: 1,
      });

  return (await pool).getConnection();
}