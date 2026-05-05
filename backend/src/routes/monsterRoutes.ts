import { Router } from "express";
import {
  getMyMonster,
  getMyCollection,
  levelUpMonster,
  activateMonster,
  getMyInventory,
} from "../controllers/monsterController";
import authenticate from "../middlewares/auth";

const router = Router();

router.get("/me", authenticate, getMyMonster);
router.get("/collection", authenticate, getMyCollection);
router.post("/levelup", authenticate, levelUpMonster);
router.get("/inventory", authenticate, getMyInventory);
router.put("/activate/:monsterId", authenticate, activateMonster);

export default router;
