import { Router } from "express";
import {
  getMyMonster,
  getMyCollection,
  feedMonster,
  activateMonster,
} from "../controllers/monsterController";
import authenticate from "../middlewares/auth";

const router = Router();

router.get("/me", authenticate, getMyMonster);
router.get("/collection", authenticate, getMyCollection);
router.post("/feed", authenticate, feedMonster);
router.put("/activate/:monsterId", authenticate, activateMonster);

export default router;
