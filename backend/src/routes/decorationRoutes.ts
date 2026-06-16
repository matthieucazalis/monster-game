import { Router } from "express";
import {
  getAllDecorations,
  getMyDecorations,
  buyDecoration,
  placeDecoration,
  removeDecoration,
} from "../controllers/decorationController";
import authenticate from "../middlewares/auth";

const router = Router();

router.get("/", authenticate, getAllDecorations);
router.get("/my", authenticate, getMyDecorations);
router.post("/buy/:decorationId", authenticate, buyDecoration);
router.put("/place/:userDecorationId", authenticate, placeDecoration);
router.put("/remove/:userDecorationId", authenticate, removeDecoration);

export default router;
