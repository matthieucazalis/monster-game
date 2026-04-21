import { Router } from "express";
import { getAllSpecies, buySpecies } from "../controllers/speciesController";
import authenticate from "../middlewares/auth";

const router = Router();

router.get("/", authenticate, getAllSpecies);
router.post("/buy/:speciesId", authenticate, buySpecies);

export default router;
