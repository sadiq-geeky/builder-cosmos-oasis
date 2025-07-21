import mysql from "mysql2/promise";

// Database configuration matching your parameters
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "setcrmuser",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "setcrmuis",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Helper function to execute queries
export async function executeQuery<T = any>(
  query: string,
  params: any[] = [],
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Initialize database connection on startup
export async function initializeDatabase() {
  await testConnection();
}
