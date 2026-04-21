import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log("Connexion à MySQL réussie !");
    connection.release();
  } catch (error) {
    console.error("Erreur de connexion à MySQL :", (error as Error).message);
  }
};

export { pool, testConnection };
