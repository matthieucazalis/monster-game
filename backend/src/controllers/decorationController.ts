import { Request, Response } from "express";
import Decoration from "../models/Decoration";
import { pool } from "../config/database";
import { CoinRow, UserDecorationRow } from "../types";

const getAllDecorations = async (
  _req: Request,
  res: Response,
): Promise<void> => {
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

// Place une déco dans un slot (1-6), retire l'ancienne si besoin
const placeDecoration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userDecorationId } = req.params;
    const { slot } = req.body as { slot: number };

    if (!slot || slot < 1 || slot > 6) {
      res.status(400).json({ message: "Slot invalide (1-6)" });
      return;
    }

    // Vérifier que la déco appartient à l'utilisateur
    const [rows] = await pool.query<UserDecorationRow[]>(
      "SELECT * FROM user_decorations WHERE id = ? AND user_id = ?",
      [userDecorationId, req.user!.id],
    );

    if (rows.length === 0) {
      res
        .status(404)
        .json({ message: "Décoration introuvable dans votre inventaire" });
      return;
    }

    // Vérifier que la même déco n'est pas déjà dans un autre slot
    const currentDeco = rows[0];
    if (currentDeco.is_equipped && currentDeco.position_x !== slot) {
      // Elle est dans un autre slot, on la retire d'abord
      await pool.query(
        "UPDATE user_decorations SET is_equipped = FALSE, position_x = NULL WHERE id = ? AND user_id = ?",
        [userDecorationId, req.user!.id],
      );
    }

    // Vider le slot cible si occupé par une autre déco
    await pool.query(
      "UPDATE user_decorations SET is_equipped = FALSE, position_x = NULL WHERE user_id = ? AND position_x = ? AND id != ?",
      [req.user!.id, slot, userDecorationId],
    );

    // Placer la déco dans le slot
    await pool.query(
      "UPDATE user_decorations SET is_equipped = TRUE, position_x = ? WHERE id = ? AND user_id = ?",
      [slot, userDecorationId, req.user!.id],
    );

    res.json({ message: "Décoration placée dans le slot " + slot, slot });
  } catch (error) {
    console.error("Erreur placeDecoration:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Retire une déco de son slot
const removeDecoration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userDecorationId } = req.params;

    const [rows] = await pool.query<UserDecorationRow[]>(
      "SELECT * FROM user_decorations WHERE id = ? AND user_id = ?",
      [userDecorationId, req.user!.id],
    );

    if (rows.length === 0) {
      res
        .status(404)
        .json({ message: "Décoration introuvable dans votre inventaire" });
      return;
    }

    await pool.query(
      "UPDATE user_decorations SET is_equipped = FALSE, position_x = NULL WHERE id = ? AND user_id = ?",
      [userDecorationId, req.user!.id],
    );

    res.json({ message: "Décoration retirée du slot" });
  } catch (error) {
    console.error("Erreur removeDecoration:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export {
  getAllDecorations,
  getMyDecorations,
  buyDecoration,
  placeDecoration,
  removeDecoration,
};
