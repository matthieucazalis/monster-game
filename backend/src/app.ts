import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import monsterRoutes from "./routes/monsterRoutes";
import speciesRoutes from "./routes/speciesRoutes";
import decorationRoutes from "./routes/decorationRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "API Monster Game fonctionne" });
});

app.use("/api/auth", authRoutes);
app.use("/api/monsters", monsterRoutes);
app.use("/api/species", speciesRoutes);
app.use("/api/decorations", decorationRoutes);

export default app;
