import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import Monster from "../models/Monster";
import { generateToken } from "../utils/jwt";
import { pool } from "../config/database";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, pseudo } = req.body as {
      email: string;
      password: string;
      pseudo: string;
    };

    if (!email || !password || !pseudo) {
      res
        .status(400)
        .json({ message: "Email, mot de passe et pseudo sont obligatoires" });
      return;
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ message: "Cet email est déjà utilisé" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create({
      email,
      password: hashedPassword,
      pseudo,
    });

    await Monster.create({ user_id: userId, specie_id: 1 });

    const token = generateToken({ id: userId, email, role: "user" });

    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: {
        id: userId,
        email,
        pseudo,
        role: "user",
        is_first_login: true,
        coins: 0,
      },
    });
  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res
        .status(400)
        .json({ message: "Email et mot de passe sont obligatoires" });
      return;
    }

    const user = await User.findByEmail(email);
    if (!user) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    const token = generateToken(user);

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        email: user.email,
        pseudo: user.pseudo,
        role: user.role,
        is_first_login: user.is_first_login,
        coins: user.coins,
      },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const firstLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.query("UPDATE users SET is_first_login = FALSE WHERE id = ?", [
      req.user!.id,
    ]);
    res.json({ message: "Premier login enregistré" });
  } catch (error) {
    console.error("Erreur firstLogin:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: "Utilisateur introuvable" });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      pseudo: user.pseudo,
      role: user.role,
      coins: user.coins,
      is_first_login: user.is_first_login,
    });
  } catch (error) {
    console.error("Erreur getMe:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const changeEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res
        .status(400)
        .json({ message: "Email et mot de passe sont obligatoires" });
      return;
    }

    const user = await User.findByIdWithPassword(req.user!.id);
    if (!user) {
      res.status(404).json({ message: "Utilisateur introuvable" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Mot de passe incorrect" });
      return;
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser && existingUser.id !== user.id) {
      res.status(409).json({ message: "Cet email est déjà utilisé" });
      return;
    }

    await pool.query("UPDATE users SET email = ? WHERE id = ?", [
      email,
      user.id,
    ]);
    res.json({ message: "Email mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur changeEmail:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const changePseudo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };

    if (!username || !password) {
      res
        .status(400)
        .json({ message: "Pseudo et mot de passe sont obligatoires" });
      return;
    }

    const user = await User.findByIdWithPassword(req.user!.id);
    if (!user) {
      res.status(404).json({ message: "Utilisateur introuvable" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Mot de passe incorrect" });
      return;
    }

    await pool.query("UPDATE users SET pseudo = ? WHERE id = ?", [
      username,
      user.id,
    ]);
    res.json({ message: "Pseudo mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur changePseudo:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    if (!currentPassword || !newPassword) {
      res
        .status(400)
        .json({ message: "Les deux mots de passe sont obligatoires" });
      return;
    }

    const user = await User.findByIdWithPassword(req.user!.id);
    if (!user) {
      res.status(404).json({ message: "Utilisateur introuvable" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      res.status(401).json({ message: "Mot de passe actuel incorrect" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      user.id,
    ]);
    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur changePassword:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const resetGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body as { password: string };

    if (!password) {
      res.status(400).json({ message: "Mot de passe obligatoire" });
      return;
    }

    const user = await User.findByIdWithPassword(req.user!.id);
    if (!user) {
      res.status(404).json({ message: "Utilisateur introuvable" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Mot de passe incorrect" });
      return;
    }

    // Supprime les monstres en cours, les monstres terminés et les décorations achetées
    await pool.query("DELETE FROM monsters WHERE user_id = ?", [user.id]);
    await pool.query("DELETE FROM completed_monsters WHERE user_id = ?", [
      user.id,
    ]);
    await pool.query("DELETE FROM user_decorations WHERE user_id = ?", [
      user.id,
    ]);
    await pool.query(
      "UPDATE users SET coins = 0, is_first_login = TRUE WHERE id = ?",
      [user.id],
    );

    await Monster.create({ user_id: user.id, specie_id: 1 });

    res.json({ message: "Jeu réinitialisé avec succès" });
  } catch (error) {
    console.error("Erreur resetGame:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body as { password: string };

    if (!password) {
      res.status(400).json({ message: "Mot de passe obligatoire" });
      return;
    }

    const user = await User.findByIdWithPassword(req.user!.id);
    if (!user) {
      res.status(404).json({ message: "Utilisateur introuvable" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Mot de passe incorrect" });
      return;
    }

    await pool.query("DELETE FROM users WHERE id = ?", [user.id]);
    res.json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error("Erreur deleteAccount:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export {
  register,
  login,
  firstLogin,
  getMe,
  changeEmail,
  changePseudo,
  changePassword,
  resetGame,
  deleteAccount,
};
