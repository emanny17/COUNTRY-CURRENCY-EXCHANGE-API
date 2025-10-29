import { pool } from "../config/database.js";
import {
  fetchCountries,
  fetchExchangeRates,
  extractCurrencyCode,
  calculateEstimatedGDP,
} from "../services/externalAPI.js";
import { generateSummaryImage } from "../services/imageGenerator.js";

// POST /countries/refresh
async function refreshCountries(req, res) {
  let connection;

  try {
    // Fetch data from external APIs
    const [countriesData, exchangeRates] = await Promise.all([
      fetchCountries(),
      fetchExchangeRates(),
    ]);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let processedCount = 0;

    // Process each country
    for (const country of countriesData) {
      const currencyCode = extractCurrencyCode(country.currencies);
      const exchangeRate = currencyCode
        ? exchangeRates[currencyCode] || null
        : null;
      const estimatedGDP =
        currencyCode && exchangeRate
          ? calculateEstimatedGDP(country.population, exchangeRate)
          : currencyCode
          ? null
          : 0; // 0 if no currency, null if currency not found in rates

      // Insert or update country
      await connection.execute(
        `INSERT INTO countries 
        (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          capital = VALUES(capital),
          region = VALUES(region),
          population = VALUES(population),
          currency_code = VALUES(currency_code),
          exchange_rate = VALUES(exchange_rate),
          estimated_gdp = VALUES(estimated_gdp),
          flag_url = VALUES(flag_url),
          last_refreshed_at = CURRENT_TIMESTAMP`,
        [
          country.name,
          country.capital || null,
          country.region || null,
          country.population,
          currencyCode,
          exchangeRate,
          estimatedGDP,
          country.flag || null,
        ]
      );

      processedCount++;
    }

    await connection.execute(
      `UPDATE refresh_metadata 
       SET last_refreshed_at = CURRENT_TIMESTAMP, 
           total_countries = ?
       WHERE id = 1`,
      [processedCount]
    );

    await connection.commit();

    console.log(`✅ Refreshed ${processedCount} countries`);

    generateSummaryImage().catch((err) =>
      console.error("Image generation failed:", err.message)
    );

    res.json({
      message: "Countries refreshed successfully",
      total_processed: processedCount,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Refresh error:", error.message);

    if (error.message.includes("Could not fetch data")) {
      return res.status(503).json({
        error: "External data source unavailable",
        details: error.message,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
}

// GET /countries

async function getAllCountries(req, res) {
  try {
    const { region, currency, sort } = req.query;

    let query = "SELECT * FROM countries WHERE 1=1";
    const params = [];

    if (region) {
      query += " AND LOWER(region) = LOWER(?)";
      params.push(region);
    }

    if (currency) {
      query += " AND LOWER(currency_code) = LOWER(?)";
      params.push(currency);
    }

    if (sort === "gdp_desc") {
      query += " ORDER BY estimated_gdp DESC";
    } else if (sort === "gdp_asc") {
      query += " ORDER BY estimated_gdp ASC";
    } else if (sort === "population_desc") {
      query += " ORDER BY population DESC";
    } else if (sort === "name_asc") {
      query += " ORDER BY name ASC";
    } else {
      query += " ORDER BY name ASC";
    }

    const [countries] = await pool.execute(query, params);

    res.json(countries);
  } catch (error) {
    console.error("Get countries error:", error.message);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}

//GET /countries/:name
async function getCountryByName(req, res) {
  try {
    const { name } = req.params;

    const [countries] = await pool.execute(
      "SELECT * FROM countries WHERE LOWER(name) = LOWER(?)",
      [name]
    );

    if (countries.length === 0) {
      return res.status(404).json({
        error: "Country not found",
      });
    }

    res.json(countries[0]);
  } catch (error) {
    console.error("Get country error:", error.message);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}

// DELETE /countries/:name
async function deleteCountry(req, res) {
  let connection;

  try {
    const { name } = req.params;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [countries] = await connection.execute(
      "SELECT id FROM countries WHERE LOWER(name) = LOWER(?)",
      [name]
    );

    if (countries.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: "Country not found",
      });
    }

    await connection.execute(
      "DELETE FROM countries WHERE LOWER(name) = LOWER(?)",
      [name]
    );

    const [countResult] = await connection.execute(
      "SELECT COUNT(*) as total FROM countries"
    );

    await connection.execute(
      "UPDATE refresh_metadata SET total_countries = ? WHERE id = 1",
      [countResult[0].total]
    );

    await connection.commit();

    console.log(`✅ Deleted country: ${name}`);

    res.json({
      message: "Country deleted successfully",
      deleted_country: name,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Delete country error:", error.message);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
}

// GET /status

async function getStatus(req, res) {
  try {
    const [metadata] = await pool.execute(
      "SELECT total_countries, last_refreshed_at FROM refresh_metadata WHERE id = 1"
    );

    if (metadata.length === 0) {
      return res.json({
        total_countries: 0,
        last_refreshed_at: null,
      });
    }

    res.json({
      total_countries: metadata[0].total_countries,
      last_refreshed_at: metadata[0].last_refreshed_at,
    });
  } catch (error) {
    console.error("Get status error:", error.message);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}

export {
  refreshCountries,
  getAllCountries,
  getCountryByName,
  deleteCountry,
  getStatus,
};
