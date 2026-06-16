import { ResultSetHeader } from "mysql2";
import { pool } from "../config/database";
import { UserRow } from "../types";

const User = {
  findByEmail: async (email: string): Promise<UserRow | undefined> => {
    const [rows] = await pool.query<UserRow[]>(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );
    return rows[0];
  },

  findById: async (id: number): Promise<UserRow | undefined> => {
    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, email, pseudo, role, coins, is_first_login, created_at FROM users WHERE id = ?",
      [id],
    );
    return rows[0];
  },

  // Pour les opérations sensibles nécessitant une vérification de mot de passe
  findByIdWithPassword: async (id: number): Promise<UserRow | undefined> => {
    const [rows] = await pool.query<UserRow[]>(
      "SELECT * FROM users WHERE id = ?",
      [id],
    );
    return rows[0];
  },

  create: async ({
    email,
    password,
    pseudo,
  }: {
    email: string;
    password: string;
    pseudo: string;
  }): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO users (email, password, pseudo) VALUES (?, ?, ?)",
      [email, password, pseudo],
    );
    return result.insertId;
  },
};

export default User;
