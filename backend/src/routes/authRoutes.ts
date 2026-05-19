import { Router } from "express";
import { register, login, firstLogin } from "../controllers/authController";
import authenticate from "../middlewares/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/first-login", authenticate, firstLogin);

export default router;
