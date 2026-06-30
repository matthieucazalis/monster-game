import { Router } from "express";
import {
  register,
  login,
  firstLogin,
  getMe,
  changeEmail,
  changePseudo,
  changePassword,
  resetGame,
  deleteAccount,
} from "../controllers/authController";
import authenticate from "../middlewares/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/first-login", authenticate, firstLogin);
router.get("/me", authenticate, getMe);

router.patch("/email", authenticate, changeEmail);
router.patch("/username", authenticate, changePseudo);
router.patch("/password", authenticate, changePassword);
router.post("/reset", authenticate, resetGame);
router.delete("/account", authenticate, deleteAccount);

export default router;
