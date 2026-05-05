import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import Monster from "../models/Monster";
import { generateToken } from "../utils/jwt";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, pseudo } = req.body as {
      email: string;
      password: string;
      pseudo: string;
    };

    if (!email || !password || !pseudo) {
      res.status(400).json({
        message: "Email, mot de passe et pseudo sont obligatoires",
      });
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

    await Monster.create({
      user_id: userId,
      specie_id: 1,
    });

    const token = generateToken({ id: userId, email, role: "user" });

    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: { id: userId, email, pseudo, role: "user" },
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
      res.status(400).json({
        message: "Email et mot de passe sont obligatoires",
      });
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
      },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export { register, login };
