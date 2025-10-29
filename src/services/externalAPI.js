import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Fetch all countries from RestCountries API

async function fetchCountries() {
  try {
    const response = await axios.get(process.env.COUNTRIES_API, {
      timeout: 10000,
    });

    console.log(`✅ Fetched ${response.data.length} countries`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch countries:", error.message);
    throw new Error("Could not fetch data from RestCountries API");
  }
}

// Fetch exchange rates from Exchange Rate API

async function fetchExchangeRates() {
  try {
    const response = await axios.get(process.env.EXCHANGE_RATE_API, {
      timeout: 10000,
    });

    if (response.data && response.data.rates) {
      console.log(
        `✅ Fetched exchange rates for ${
          Object.keys(response.data.rates).length
        } currencies`
      );
      return response.data.rates;
    }

    throw new Error("Invalid exchange rate response");
  } catch (error) {
    console.error("❌ Failed to fetch exchange rates:", error.message);
    throw new Error("Could not fetch data from Exchange Rate API");
  }
}

// Extract first currency code from country's currencies array

function extractCurrencyCode(currencies) {
  if (!currencies || !Array.isArray(currencies) || currencies.length === 0) {
    return null;
  }

  const firstCurrency = currencies[0];
  return firstCurrency.code || null;
}

// Calculate estimated GDP
function calculateEstimatedGDP(population, exchangeRate) {
  if (!exchangeRate || exchangeRate === 0) {
    return null;
  }

  const randomMultiplier = Math.random() * (2000 - 1000) + 1000;

  const estimatedGDP = (population * randomMultiplier) / exchangeRate;

  return Math.round(estimatedGDP * 100) / 100; // Round to 2 decimal places
}

export {
  fetchCountries,
  fetchExchangeRates,
  extractCurrencyCode,
  calculateEstimatedGDP,
};
