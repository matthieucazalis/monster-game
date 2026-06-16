import { Router } from "express";
import {
  register,
  login,
  firstLogin,
  getMe,
  changeEmail,
  changePseudo,
  resetGame,
  deleteAccount,
  changePassword,
} from "../controllers/authController";
import authenticate from "../middlewares/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/first-login", authenticate, firstLogin);
router.get("/me", authenticate, getMe);

router.patch("/email", authenticate, changeEmail);
router.patch("/username", authenticate, changePseudo);
router.post("/reset", authenticate, resetGame);
router.delete("/account", authenticate, deleteAccount);
router.patch("/password", authenticate, changePassword);

export default router;
