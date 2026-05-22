import { Router } from "express";
import {
  register,
  login,
  firstLogin,
  getMe,
} from "../controllers/authController";
import authenticate from "../middlewares/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/first-login", authenticate, firstLogin);
router.get("/me", authenticate, getMe);

export default router;
