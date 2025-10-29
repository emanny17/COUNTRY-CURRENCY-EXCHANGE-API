import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  refreshCountries,
  getAllCountries,
  getCountryByName,
  deleteCountry,
  getStatus,
} from "../controllers/countryController.js";

const router = express.Router();

// Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /status - Get system status (before /countries routes)
router.get("/status", getStatus);

// POST /countries/refresh - Refresh country data
router.post("/countries/refresh", refreshCountries);

// GET /countries/image - Serve summary image
router.get("/countries/image", (req, res) => {
  const imagePath = path.join(__dirname, "../../cache/summary.png");

  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({
      error: "Summary image not found",
    });
  }

  res.sendFile(imagePath);
});

// GET /countries - Get all countries with filters
router.get("/countries", getAllCountries);

// GET /countries/:name - Get specific country
router.get("/countries/:name", getCountryByName);

// DELETE /countries/:name - Delete a country
router.delete("/countries/:name", deleteCountry);

export default router;
