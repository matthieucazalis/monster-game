import "dotenv/config";
import app from "./src/app";
import { testConnection } from "./src/config/database";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, async () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
  await testConnection();
});
