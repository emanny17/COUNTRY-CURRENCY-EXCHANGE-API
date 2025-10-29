import dotenv from "dotenv";
import app from "./src/app.js";
import { testConnection } from "./src/config/database.js";

dotenv.config();

const PORT = process.env.PORT || 8080;

// Test database connection before starting server
async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
