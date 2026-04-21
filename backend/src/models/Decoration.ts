import { ResultSetHeader } from "mysql2";
import { pool } from "../config/database";
import { DecorationRow, UserDecorationRow } from "../types";

const Decoration = {
  findAll: async (): Promise<DecorationRow[]> => {
    const [rows] = await pool.query<DecorationRow[]>(
      "SELECT * FROM decorations ORDER BY price ASC",
    );
    return rows;
  },

  findById: async (id: number | string | string[]): Promise<DecorationRow | undefined> => {
    const [rows] = await pool.query<DecorationRow[]>(
      "SELECT * FROM decorations WHERE id = ?",
      [id],
    );
    return rows[0];
  },

  findByUserId: async (user_id: number): Promise<UserDecorationRow[]> => {
    const [rows] = await pool.query<UserDecorationRow[]>(
      `SELECT ud.id AS user_decoration_id, ud.is_equipped, ud.position_x, ud.position_y, ud.purchased_at,
              d.id, d.name, d.description, d.price, d.image_url
       FROM user_decorations ud
       JOIN decorations d ON ud.decoration_id = d.id
       WHERE ud.user_id = ?
       ORDER BY ud.purchased_at DESC`,
      [user_id],
    );
    return rows;
  },

  userOwns: async (user_id: number, decoration_id: number | string | string[]): Promise<boolean> => {
    const [rows] = await pool.query<DecorationRow[]>(
      "SELECT id FROM user_decorations WHERE user_id = ? AND decoration_id = ?",
      [user_id, decoration_id],
    );
    return rows.length > 0;
  },

  addToUser: async (user_id: number, decoration_id: number | string | string[]): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO user_decorations (user_id, decoration_id) VALUES (?, ?)",
      [user_id, decoration_id],
    );
    return result.insertId;
  },

  setEquipped: async (user_decoration_id: number | string | string[], is_equipped: boolean): Promise<void> => {
    await pool.query(
      "UPDATE user_decorations SET is_equipped = ? WHERE id = ?",
      [is_equipped, user_decoration_id],
    );
  },

  updatePosition: async (
    user_decoration_id: number | string | string[],
    position_x: number,
    position_y: number,
  ): Promise<void> => {
    await pool.query(
      "UPDATE user_decorations SET position_x = ?, position_y = ? WHERE id = ?",
      [position_x, position_y, user_decoration_id],
    );
  },
};

export default Decoration;
