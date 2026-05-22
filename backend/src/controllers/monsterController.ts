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

const levelUpMonster = async (req: Request, res: Response): Promise<void> => {
  try {
    const monster = (await Monster.findActiveByUserId(
      req.user!.id,
    )) as MonsterRow;

    if (!monster) {
      res.status(404).json({ message: "Aucun monstre actif trouvé" });
      return;
    }

    if (monster.is_finished) {
      res
        .status(400)
        .json({ message: "Ce monstre a déjà atteint son niveau maximum" });
      return;
    }

    // Vérification du timer
    // NULL = jamais cliqué → premier clic toujours autorisé
    if (!Monster.isReady(monster)) {
      const next = new Date(monster.next_available_at!).getTime();
      res.status(400).json({
        message: "Monstre pas encore prêt",
        remainingMs: next - Date.now(),
      });
      return;
    }

    const maxLevel = monster.max_level ?? 9;
    const newLevel = monster.level + 1;
    const third = maxLevel / 3;

    let newStade: number;
    if (newLevel <= third) newStade = 1;
    else if (newLevel <= third * 2) newStade = 2;
    else newStade = 3;

    // Coins aléatoires entre 5 et 9
    const coinsEarned = Math.floor(Math.random() * 5) + 5;
    await pool.query("UPDATE users SET coins = coins + ? WHERE id = ?", [
      coinsEarned,
      req.user!.id,
    ]);

    // Monstre terminé
    if (newLevel >= maxLevel) {
      await Monster.complete(
        monster.id,
        req.user!.id,
        monster.specie_id,
        maxLevel,
      );
      res.json({
        message:
          "Félicitations ! Votre monstre a atteint son niveau maximum et rejoint votre inventaire !",
        completed: true,
        coinsEarned,
      });
      return;
    }

    // Level up + reset timer à exactement maintenant + cooldown
    await Monster.levelUp(
      monster.id,
      newLevel,
      newStade,
      monster.hunger_interval_hours ?? 4,
    );

    const updatedMonster = await Monster.findActiveByUserId(req.user!.id);

    res.json({
      message: "Monstre monté de niveau !",
      monster: updatedMonster,
      completed: false,
      coinsEarned,
    });
  } catch (error) {
    console.error("Erreur levelUpMonster:", error);
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
      res
        .status(404)
        .json({ message: "Monstre introuvable dans votre collection" });
      return;
    }

    await Monster.archiveAllForUser(req.user!.id);
    await Monster.activate(monsterId);

    const activeMonster = await Monster.findActiveByUserId(req.user!.id);
    res.json({ message: "Monstre activé avec succès", monster: activeMonster });
  } catch (error) {
    console.error("Erreur activateMonster:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getMyInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const completed = await Monster.findCompletedByUserId(req.user!.id);
    res.json(completed);
  } catch (error) {
    console.error("Erreur getMyInventory:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export {
  getMyMonster,
  getMyCollection,
  levelUpMonster,
  activateMonster,
  getMyInventory,
};
