import { ResultSetHeader } from "mysql2";
import { pool } from "../config/database";
import { MonsterRow } from "../types";

const Monster = {
  create: async ({
    user_id,
    species_id,
    name,
  }: {
    user_id: number;
    species_id: number;
    name: string;
  }): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO monsters (user_id, species_id, name) VALUES (?, ?, ?)",
      [user_id, species_id, name],
    );
    return result.insertId;
  },

  findActiveByUserId: async (user_id: number): Promise<MonsterRow | undefined> => {
    const [rows] = await pool.query<MonsterRow[]>(
      `SELECT m.*, s.name AS species_name, s.hunger_interval_hours, s.max_level, s.base_image_url
       FROM monsters m
       JOIN species s ON m.species_id = s.id
       WHERE m.user_id = ? AND m.is_archived = FALSE`,
      [user_id],
    );
    return rows[0];
  },

  findAllByUserId: async (user_id: number): Promise<MonsterRow[]> => {
    const [rows] = await pool.query<MonsterRow[]>(
      `SELECT m.*, s.name AS species_name, s.base_image_url
       FROM monsters m
       JOIN species s ON m.species_id = s.id
       WHERE m.user_id = ?
       ORDER BY m.is_archived ASC, m.created_at DESC`,
      [user_id],
    );
    return rows;
  },

  feed: async (monster_id: number): Promise<void> => {
    await pool.query(
      `UPDATE monsters
       SET hunger_level = LEAST(hunger_level + 10, 100),
           xp = xp + 5,
           last_fed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [monster_id],
    );
  },

  updateLevel: async (monster_id: number, level: number): Promise<void> => {
    await pool.query("UPDATE monsters SET level = ? WHERE id = ?", [
      level,
      monster_id,
    ]);
  },

  archiveAllForUser: async (user_id: number): Promise<void> => {
    await pool.query(
      "UPDATE monsters SET is_archived = TRUE WHERE user_id = ?",
      [user_id],
    );
  },

  activate: async (monster_id: number | string | string[]): Promise<void> => {
    await pool.query("UPDATE monsters SET is_archived = FALSE WHERE id = ?", [
      monster_id,
    ]);
  },
};

export default Monster;
