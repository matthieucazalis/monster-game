import { pool } from "../config/database";
import { SpeciesRow } from "../types";

const Species = {
  findAll: async (): Promise<SpeciesRow[]> => {
    const [rows] = await pool.query<SpeciesRow[]>(
      "SELECT * FROM species ORDER BY unlock_cost ASC",
    );
    return rows;
  },

  findById: async (id: number | string | string[]): Promise<SpeciesRow | undefined> => {
    const [rows] = await pool.query<SpeciesRow[]>(
      "SELECT * FROM species WHERE id = ?",
      [id],
    );
    return rows[0];
  },

  findStarter: async (): Promise<SpeciesRow | undefined> => {
    const [rows] = await pool.query<SpeciesRow[]>(
      "SELECT * FROM species WHERE is_starter = TRUE LIMIT 1",
    );
    return rows[0];
  },
};

export default Species;
