import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL?.trim();
const databaseHost = (process.env.DB_HOST || "localhost").trim();
const localDatabaseHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const databaseCa = process.env.DB_CA_CERT?.replace(/\\n/g, "\n").trim();
let databaseUrlForMysql2 = databaseUrl;

const usesLocalDatabase = !databaseUrl
  ? localDatabaseHosts.has(databaseHost)
  : localDatabaseHosts.has(new URL(databaseUrl).hostname);

if (process.env.NODE_ENV === "production" && usesLocalDatabase) {
  throw new Error("Production requires an online MySQL database");
}

if (databaseUrl) {
  try {
    const parsedDatabaseUrl = new URL(databaseUrl);
    parsedDatabaseUrl.searchParams.delete("ssl-mode");
    databaseUrlForMysql2 = parsedDatabaseUrl.toString();
  } catch {
    throw new Error("DATABASE_URL is not a valid MySQL URL");
  }
}

// Build SSL configuration
let sslConfig = null;
if (databaseCa) {
  sslConfig = {
    ca: databaseCa,
    rejectUnauthorized: true
  };
} else if (process.env.DB_SSL === "true" || (process.env.NODE_ENV === "production" && !usesLocalDatabase)) {
  sslConfig = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false"
  };
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
  connectTimeout: 10000,
  ...(sslConfig && { ssl: sslConfig })
};

const pool = databaseUrl
  ? mysql.createPool({
      uri: databaseUrlForMysql2,
      ...(sslConfig && { ssl: sslConfig }),
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      connectTimeout: 10000
    })
  : mysql.createPool(connectionOptions);

export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log("Database connection test succeeded.");
    return true;
  } catch (err) {
    console.error("Database connection test failed details (excluding password):", {
      host: databaseHost,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      database: process.env.DB_NAME || "kidty_shop",
      hasDatabaseUrl: !!databaseUrl,
      hasSslConfig: !!sslConfig,
      errorMessage: err.message
    });
    throw err;
  }
}

export default pool;
