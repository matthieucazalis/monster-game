import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Token manquant ou invalide" });
      return;
    }

    const token = authHeader.split(" ")[1];
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

export default authenticate;
