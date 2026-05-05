import { Request, Response } from "express";
import Species from "../models/Species";
import Monster from "../models/Monster";
import { pool } from "../config/database";
import { CoinRow } from "../types";

const getAllSpecies = async (_req: Request, res: Response): Promise<void> => {
  try {
    const species = await Species.findAll();
    res.json(species);
  } catch (error) {
    console.error("Erreur getAllSpecies:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const buySpecies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { speciesId } = req.params;

    const species = await Species.findById(speciesId);
    if (!species) {
      res.status(404).json({ message: "Espèce introuvable" });
      return;
    }

    const [userRows] = await pool.query<CoinRow[]>(
      "SELECT coins FROM users WHERE id = ?",
      [req.user!.id],
    );
    const userCoins = userRows[0].coins;

    if (userCoins < species.unlock_cost) {
      res.status(400).json({
        message: `Pas assez de coins. Il vous faut ${species.unlock_cost} coins, vous en avez ${userCoins}.`,
      });
      return;
    }

    await pool.query("UPDATE users SET coins = coins - ? WHERE id = ?", [
      species.unlock_cost,
      req.user!.id,
    ]);

    await Monster.archiveAllForUser(req.user!.id);

    await Monster.create({
      user_id: req.user!.id,
      specie_id: species.id,
    });

    const newMonster = await Monster.findActiveByUserId(req.user!.id);

    res.status(201).json({
      message: `Vous avez obtenu un ${species.name} !`,
      monster: newMonster,
      coinsSpent: species.unlock_cost,
    });
  } catch (error) {
    console.error("Erreur buySpecies:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export { getAllSpecies, buySpecies };
