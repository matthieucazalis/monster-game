import { Router } from "express";
import {
  getAllDecorations,
  getMyDecorations,
  buyDecoration,
  toggleEquipDecoration,
  updateDecorationPosition,
} from "../controllers/decorationController";
import authenticate from "../middlewares/auth";

const router = Router();

router.get("/", authenticate, getAllDecorations);
router.get("/my", authenticate, getMyDecorations);
router.post("/buy/:decorationId", authenticate, buyDecoration);
router.put("/equip/:userDecorationId", authenticate, toggleEquipDecoration);
router.put("/position/:userDecorationId", authenticate, updateDecorationPosition);

export default router;
