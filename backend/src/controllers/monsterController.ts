import { Request, Response } from "express";
import Monster from "../models/Monster";
import { pool } from "../config/database";
import { MonsterRow } from "../types";

const getMyMonster = async (req: Request, res: Response): Promise<void> => {
  try {
    const monster = await Monster.findActiveByUserId(req.user!.id);

    if (!monster) {
      res.status(404).json({ message: "Aucun monstre actif trouvé" });
      return;
    }

    res.json(monster);
  } catch (error) {
    console.error("Erreur getMyMonster:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getMyCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const monsters = await Monster.findAllByUserId(req.user!.id);
    res.json(monsters);
  } catch (error) {
    console.error("Erreur getMyCollection:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const feedMonster = async (req: Request, res: Response): Promise<void> => {
  try {
    const monster = await Monster.findActiveByUserId(req.user!.id);

    if (!monster) {
      res.status(404).json({ message: "Aucun monstre actif trouvé" });
      return;
    }

    await Monster.feed(monster.id);

    await pool.query("UPDATE users SET coins = coins + 10 WHERE id = ?", [
      req.user!.id,
    ]);

    const updatedMonster = (await Monster.findActiveByUserId(
      req.user!.id,
    )) as MonsterRow;

    if (
      updatedMonster.xp >= 100 &&
      updatedMonster.level < (updatedMonster.max_level ?? Infinity)
    ) {
      await Monster.updateLevel(updatedMonster.id, updatedMonster.level + 1);
      await pool.query("UPDATE monsters SET xp = 0 WHERE id = ?", [
        updatedMonster.id,
      ]);
    }

    const finalMonster = await Monster.findActiveByUserId(req.user!.id);

    res.json({
      message: "Monstre nourri avec succès",
      monster: finalMonster,
      coinsEarned: 10,
    });
  } catch (error) {
    console.error("Erreur feedMonster:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const activateMonster = async (req: Request, res: Response): Promise<void> => {
  try {
    const { monsterId } = req.params;

    const [rows] = await pool.query<MonsterRow[]>(
      "SELECT * FROM monsters WHERE id = ? AND user_id = ?",
      [monsterId, req.user!.id],
    );

    if (rows.length === 0) {
      res.status(404).json({
        message: "Monstre introuvable dans votre collection",
      });
      return;
    }

    await Monster.archiveAllForUser(req.user!.id);
    await Monster.activate(monsterId);

    const activeMonster = await Monster.findActiveByUserId(req.user!.id);

    res.json({
      message: "Monstre activé avec succès",
      monster: activeMonster,
    });
  } catch (error) {
    console.error("Erreur activateMonster:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export { getMyMonster, getMyCollection, feedMonster, activateMonster };
