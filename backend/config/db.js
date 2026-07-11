import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL?.trim();
const databaseHost = (process.env.DB_HOST || "localhost").trim();
const localDatabaseHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const databaseCa = process.env.DB_CA_CERT?.replace(/\\n/g, "\n").trim();
let databaseUrlForMysql2 = databaseUrl;

if (databaseUrl) {
  try {
    const parsedDatabaseUrl = new URL(databaseUrl);
    parsedDatabaseUrl.searchParams.delete("ssl-mode");
    databaseUrlForMysql2 = parsedDatabaseUrl.toString();
  } catch {
    throw new Error("DATABASE_URL is not a valid MySQL URL");
  }
}

if (process.env.NODE_ENV === "production") {
  let usesLocalDatabase = !databaseUrl && localDatabaseHosts.has(databaseHost);

  if (databaseUrl) {
    usesLocalDatabase = localDatabaseHosts.has(new URL(databaseUrl).hostname);
  }

  if (usesLocalDatabase) {
    throw new Error("Production requires an online MySQL database");
  }
}

const connectionOptions = {
  host: databaseHost,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
  database: process.env.DB_NAME || "kidty_shop",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  connectTimeout: 10000
};

const pool = databaseUrl
  ? mysql.createPool({
      uri: databaseUrlForMysql2,
      ...(databaseCa && {
        ssl: {
          ca: databaseCa,
          rejectUnauthorized: true
        }
      }),
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      connectTimeout: 10000
    })
  : mysql.createPool(connectionOptions);

export async function testConnection() {
  const connection = await pool.getConnection();
  connection.release();
}

export default pool;
