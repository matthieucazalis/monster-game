import { Request, Response } from "express";
import Decoration from "../models/Decoration";
import { pool } from "../config/database";
import { CoinRow, UserDecorationRow } from "../types";

const getAllDecorations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const decorations = await Decoration.findAll();
    res.json(decorations);
  } catch (error) {
    console.error("Erreur getAllDecorations:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getMyDecorations = async (req: Request, res: Response): Promise<void> => {
  try {
    const decorations = await Decoration.findByUserId(req.user!.id);
    res.json(decorations);
  } catch (error) {
    console.error("Erreur getMyDecorations:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const buyDecoration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { decorationId } = req.params;

    const decoration = await Decoration.findById(decorationId);
    if (!decoration) {
      res.status(404).json({ message: "Décoration introuvable" });
      return;
    }

    const alreadyOwned = await Decoration.userOwns(req.user!.id, decorationId);
    if (alreadyOwned) {
      res.status(409).json({ message: "Vous possédez déjà cette décoration" });
      return;
    }

    const [userRows] = await pool.query<CoinRow[]>(
      "SELECT coins FROM users WHERE id = ?",
      [req.user!.id],
    );
    const userCoins = userRows[0].coins;

    if (userCoins < decoration.price) {
      res.status(400).json({
        message: `Pas assez de coins. Il vous faut ${decoration.price} coins, vous en avez ${userCoins}.`,
      });
      return;
    }

    await pool.query("UPDATE users SET coins = coins - ? WHERE id = ?", [
      decoration.price,
      req.user!.id,
    ]);

    await Decoration.addToUser(req.user!.id, decorationId);

    res.status(201).json({
      message: `Vous avez acheté ${decoration.name} !`,
      decoration,
      coinsSpent: decoration.price,
    });
  } catch (error) {
    console.error("Erreur buyDecoration:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const toggleEquipDecoration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userDecorationId } = req.params;
    const { is_equipped } = req.body as { is_equipped: boolean };

    const [rows] = await pool.query<UserDecorationRow[]>(
      "SELECT * FROM user_decorations WHERE id = ? AND user_id = ?",
      [userDecorationId, req.user!.id],
    );

    if (rows.length === 0) {
      res.status(404).json({
        message: "Décoration introuvable dans votre inventaire",
      });
      return;
    }

    await Decoration.setEquipped(userDecorationId, is_equipped);

    res.json({
      message: is_equipped ? "Décoration équipée" : "Décoration déséquipée",
    });
  } catch (error) {
    console.error("Erreur toggleEquipDecoration:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const updateDecorationPosition = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userDecorationId } = req.params;
    const { position_x, position_y } = req.body as {
      position_x: number | undefined;
      position_y: number | undefined;
    };

    if (position_x === undefined || position_y === undefined) {
      res.status(400).json({
        message: "position_x et position_y sont obligatoires",
      });
      return;
    }

    const [rows] = await pool.query<UserDecorationRow[]>(
      "SELECT * FROM user_decorations WHERE id = ? AND user_id = ?",
      [userDecorationId, req.user!.id],
    );

    if (rows.length === 0) {
      res.status(404).json({
        message: "Décoration introuvable dans votre inventaire",
      });
      return;
    }

    await Decoration.updatePosition(userDecorationId, position_x, position_y);

    res.json({
      message: "Position mise à jour",
      position: { x: position_x, y: position_y },
    });
  } catch (error) {
    console.error("Erreur updateDecorationPosition:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export {
  getAllDecorations,
  getMyDecorations,
  buyDecoration,
  toggleEquipDecoration,
  updateDecorationPosition,
};
