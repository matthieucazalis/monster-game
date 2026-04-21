import jwt from "jsonwebtoken";
import { UserPayload } from "../types";

const generateToken = (user: UserPayload): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );
};

const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
};

export { generateToken, verifyToken };
