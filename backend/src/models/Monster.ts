import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import { MonsterRow } from "../types";

const Monster = {
  create: async ({
    user_id,
    specie_id,
  }: {
    user_id: number;
    specie_id: number;
  }): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO monsters (user_id, specie_id) VALUES (?, ?)",
      [user_id, specie_id],
    );
    return result.insertId;
  },

  findActiveByUserId: async (
    user_id: number,
  ): Promise<MonsterRow | undefined> => {
    const [rows] = await pool.query<MonsterRow[]>(
      `SELECT m.*, s.name AS species_name, s.hunger_interval_hours, s.max_level, s.base_image_url
       FROM monsters m
       JOIN species s ON m.specie_id = s.id
       WHERE m.user_id = ? AND m.is_archived = FALSE
       LIMIT 1`,
      [user_id],
    );
    return rows[0];
  },

  findAllByUserId: async (user_id: number): Promise<MonsterRow[]> => {
    const [rows] = await pool.query<MonsterRow[]>(
      `SELECT m.*, s.name AS species_name, s.base_image_url, s.max_level
       FROM monsters m
       JOIN species s ON m.specie_id = s.id
       WHERE m.user_id = ?
       ORDER BY m.is_archived ASC, m.created_at DESC`,
      [user_id],
    );
    return rows;
  },

  levelUp: async (
    monster_id: number,
    newLevel: number,
    newStade: number,
  ): Promise<void> => {
    await pool.query("UPDATE monsters SET level = ?, stade = ? WHERE id = ?", [
      newLevel,
      newStade,
      monster_id,
    ]);
  },

  finish: async (monster_id: number): Promise<void> => {
    await pool.query("UPDATE monsters SET is_finished = TRUE WHERE id = ?", [
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

  complete: async (
    monster_id: number,
    user_id: number,
    specie_id: number,
    max_level: number,
  ): Promise<void> => {
    await pool.query(
      "INSERT INTO completed_monsters (user_id, specie_id, max_level_reached) VALUES (?, ?, ?)",
      [user_id, specie_id, max_level],
    );
    await pool.query("DELETE FROM monsters WHERE id = ?", [monster_id]);
  },

  findCompletedByUserId: async (user_id: number): Promise<RowDataPacket[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT cm.*, s.name AS species_name, s.base_image_url
       FROM completed_monsters cm
       JOIN species s ON cm.specie_id = s.id
       WHERE cm.user_id = ?
       ORDER BY cm.completed_at DESC`,
      [user_id],
    );
    return rows;
  },
};

export default Monster;
