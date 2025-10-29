# 🌍 Country API - RESTful Service

A comprehensive RESTful API that fetches country data from external sources, stores it in MySQL, and provides CRUD operations with advanced features like filtering, sorting, and image generation.

## 📋 Features

- ✅ Fetch country data from [RestCountries API](https://restcountries.com)
- ✅ Integrate real-time exchange rates from [Exchange Rate API](https://open.er-api.com)
- ✅ Calculate estimated GDP for each country
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Advanced filtering and sorting capabilities
- ✅ Automatic summary image generation
- ✅ Transaction-based database operations
- ✅ Comprehensive error handling

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MySQL 8.0+
- **External APIs:** RestCountries, Exchange Rate API
- **Image Generation:** node-canvas
- **HTTP Client:** Axios

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **MySQL Workbench** (optional, for GUI) - [Download](https://dev.mysql.com/downloads/workbench/)
- **Git** (for cloning) - [Download](https://git-scm.com/)

---

## 🚀 Installation & Setup

### Step 1: Clone or Create Project Directory

```bash
mkdir country-api
cd country-api
```

### Step 2: Initialize Project

Create the following project structure:

```
country-api/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── countryController.js
│   ├── routes/
│   │   └── countryRoutes.js
│   ├── services/
│   │   ├── externalAPI.js
│   │   └── imageGenerator.js
│   └── app.js
├── cache/
│   └── (images will be generated here)
├── .env
├── .gitignore
├── package.json
└── server.js
```

### Step 3: Install Dependencies

```bash
npm init -y
npm install express mysql2 axios dotenv canvas
npm install -D nodemon
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=countries_db

# Server Configuration
PORT=8080

# External APIs
COUNTRIES_API=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
EXCHANGE_RATE_API=https://open.er-api.com/v6/latest/USD
```

**⚠️ Important:** Replace `your_mysql_password_here` with your actual MySQL root password.

### Step 5: Set Up MySQL Database

Open MySQL Workbench or terminal and run:

```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS countries_db;
USE countries_db;

-- Create the countries table
CREATE TABLE countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    capital VARCHAR(255),
    region VARCHAR(100),
    population BIGINT NOT NULL,
    currency_code VARCHAR(10),
    exchange_rate DECIMAL(15, 4),
    estimated_gdp DECIMAL(20, 2),
    flag_url TEXT,
    last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_region (region),
    INDEX idx_currency (currency_code)
);

-- Create metadata table
CREATE TABLE refresh_metadata (
    id INT PRIMARY KEY DEFAULT 1,
    last_refreshed_at TIMESTAMP,
    total_countries INT DEFAULT 0,
    CHECK (id = 1)
);

-- Insert initial metadata
INSERT INTO refresh_metadata (id, last_refreshed_at, total_countries) 
VALUES (1, NOW(), 0)
ON DUPLICATE KEY UPDATE id = id;
```

### Step 6: Update package.json

Add the following to your `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 7: Create .gitignore (Optional)

```
node_modules/
.env
cache/*.png
*.log
```

---

## ▶️ Running the Application

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Expected Output

```
 Database connected successfully
 Server running on http://localhost:8080
```

---

## 📡 API Endpoints

### 1. Refresh Country Data

**Endpoint:** `POST /countries/refresh`

**Description:** Fetches all countries from external APIs, calculates GDP, and stores in database.

**Request:**
```bash
curl -X POST http://localhost:8080/countries/refresh
```

**Response:**
```json
{
  "message": "Countries refreshed successfully",
  "total_processed": 250
}
```

**Status Codes:**
- `200` - Success
- `503` - External API unavailable
- `500` - Internal server error

---

### 2. Get All Countries

**Endpoint:** `GET /countries`

**Description:** Retrieves all countries with optional filtering and sorting.

**Query Parameters:**
- `region` - Filter by region (e.g., Africa, Europe, Asia)
- `currency` - Filter by currency code (e.g., NGN, USD, EUR)
- `sort` - Sort results:
  - `gdp_desc` - Highest GDP first
  - `gdp_asc` - Lowest GDP first
  - `population_desc` - Highest population first
  - `name_asc` - Alphabetical order

**Examples:**

```bash
# Get all countries
curl http://localhost:8080/countries

# Filter by region
curl http://localhost:8080/countries?region=Africa

# Filter by currency
curl http://localhost:8080/countries?currency=NGN

# Sort by GDP (descending)
curl http://localhost:8080/countries?sort=gdp_desc

# Combine filters and sorting
curl "http://localhost:8080/countries?region=Europe&sort=population_desc"
```

**Response Example:**
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 257674481.25,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-29T18:00:00Z",
    "created_at": "2025-10-29T17:00:00Z"
  }
]
```

---

### 3. Get Single Country

**Endpoint:** `GET /countries/:name`

**Description:** Retrieves a specific country by name (case-insensitive).

**Request:**
```bash
curl http://localhost:8080/countries/Nigeria
```

**Response:**
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 257674481.25,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-29T18:00:00Z"
}
```

**Status Codes:**
- `200` - Country found
- `404` - Country not found
- `500` - Internal server error

---

### 4. Delete Country

**Endpoint:** `DELETE /countries/:name`

**Description:** Deletes a country from the database (case-insensitive).

**Request:**
```bash
curl -X DELETE http://localhost:8080/countries/Nigeria
```

**Response:**
```json
{
  "message": "Country deleted successfully",
  "deleted_country": "Nigeria"
}
```

**Status Codes:**
- `200` - Successfully deleted
- `404` - Country not found
- `500` - Internal server error

---

### 5. Get System Status

**Endpoint:** `GET /status`

**Description:** Returns total number of countries and last refresh timestamp.

**Request:**
```bash
curl http://localhost:8080/status
```

**Response:**
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-29T18:00:00Z"
}
```

---

### 6. Get Summary Image

**Endpoint:** `GET /countries/image`

**Description:** Returns a PNG image with country statistics (top 5 by GDP, total countries, last refresh time).

**Access via Browser:**
```
http://localhost:8080/countries/image
```

**Download via Command Line:**
```bash
curl http://localhost:8080/countries/image --output summary.png
```

**Response:**
- `200` - Returns PNG image
- `404` - Image not yet generated (run `/countries/refresh` first)

---

## 🧪 Testing the API

### Quick Start Testing Sequence

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Refresh country data (first time):**
   ```bash
   curl -X POST http://localhost:8080/countries/refresh
   ```
   *This may take 10-30 seconds as it fetches 250+ countries.*

3. **View all countries:**
   ```bash
   curl http://localhost:8080/countries
   ```

4. **Check system status:**
   ```bash
   curl http://localhost:8080/status
   ```

5. **View summary image:**
   Open in browser: `http://localhost:8080/countries/image`

### Using Postman (Recommended for Testing)

1. Import collection or create requests manually
2. Set base URL: `http://localhost:8080`
3. Test all endpoints listed above

---

## 🗃️ Database Schema

### Countries Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key (auto-increment) |
| `name` | VARCHAR(255) | Country name (unique) |
| `capital` | VARCHAR(255) | Capital city |
| `region` | VARCHAR(100) | Geographic region |
| `population` | BIGINT | Total population |
| `currency_code` | VARCHAR(10) | ISO currency code |
| `exchange_rate` | DECIMAL(15,4) | Exchange rate to USD |
| `estimated_gdp` | DECIMAL(20,2) | Calculated GDP estimate |
| `flag_url` | TEXT | Flag image URL |
| `last_refreshed_at` | TIMESTAMP | Last update time |
| `created_at` | TIMESTAMP | Record creation time |

### Refresh Metadata Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Always 1 (single row) |
| `last_refreshed_at` | TIMESTAMP | Last refresh time |
| `total_countries` | INT | Total countries cached |

---

## 🔧 Troubleshooting

### Error: "Database connection failed"

**Solution:**
1. Check MySQL is running: `mysql --version`
2. Verify credentials in `.env` file
3. Ensure `countries_db` database exists
4. Test connection: `mysql -u root -p`

### Error: "Port 8080 already in use"

**Solution:**
```bash
# Find and kill process using port 8080
# On Mac/Linux:
lsof -ti:8080 | xargs kill -9

# On Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or change PORT in .env file
```

### Error: "Cannot find module 'canvas'"

**Solution:**
```bash
# Mac (requires Homebrew)
brew install pkg-config cairo pango libpng jpeg giflib librsvg
npm install canvas

# Ubuntu/Debian
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
npm install canvas

# Windows
# Download pre-built binaries automatically via npm
npm install canvas
```

### Error: "External data source unavailable"

**Solution:**
- Check internet connection
- External APIs might be down (wait and retry)
- Check API URLs in `.env` are correct

---

## 📚 Project Structure Explained

```
country-api/
├── src/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── controllers/
│   │   └── countryController.js # Business logic & request handlers
│   ├── routes/
│   │   └── countryRoutes.js     # API route definitions
│   ├── services/
│   │   ├── externalAPI.js       # External API integration
│   │   └── imageGenerator.js    # Canvas image generation
│   └── app.js                   # Express app configuration
├── cache/
│   └── summary.png              # Generated summary image
├── .env                         # Environment variables
├── package.json                 # Dependencies & scripts
└── server.js                    # Application entry point
```

---

## 🎯 How It Works

### Data Flow

1. **User triggers refresh:** `POST /countries/refresh`
2. **Fetch external data:** Parallel API calls to RestCountries & Exchange Rate API
3. **Process each country:**
   - Extract currency code
   - Match with exchange rate
   - Calculate estimated GDP using: `(population × random(1000-2000)) ÷ exchange_rate`
4. **Store in database:** Insert or update using MySQL transactions
5. **Generate image:** Create summary PNG with top 5 countries
6. **Return response:** Confirm success with total processed count

### GDP Calculation Logic

```javascript
// If country has no currency (e.g., Antarctica)
estimated_gdp = 0

// If country has currency but rate not found
estimated_gdp = null

// If both currency and rate exist
estimated_gdp = (population × random_multiplier) ÷ exchange_rate
// where random_multiplier is between 1000-2000
```

---

## 🔐 Security Notes

- ✅ Uses parameterized queries (prevents SQL injection)
- ✅ Environment variables for sensitive data
- ✅ Connection pooling (prevents resource exhaustion)
- ✅ Transaction-based operations (ensures data consistency)
- ⚠️ **Production Recommendation:** Add rate limiting, authentication, and HTTPS

---

## 📝 Additional Notes

### Currency Handling

- If a country has multiple currencies, only the **first** is stored
- Countries without currencies (e.g., Antarctica) are stored with `null` currency and `0` GDP
- If a currency code isn't found in exchange rates, `exchange_rate` and `estimated_gdp` are `null`

### Transaction Behavior

All database operations use transactions to ensure:
- **Atomicity:** All changes succeed or all fail
- **Consistency:** Database always in valid state
- **Rollback:** Failed operations don't leave partial data

### Image Generation

- Generated asynchronously (doesn't block API response)
- Cached in `/cache/summary.png`
- Regenerated on each refresh
- Shows top 5 countries by GDP

---

## 🤝 Contributing

This is an educational project. Feel free to extend it with:
- Authentication & authorization
- Pagination for large datasets
- More sophisticated GDP calculations
- Additional filtering options
- Unit & integration tests

---

## 📄 License

MIT License - Feel free to use for learning and personal projects.

---

## 🆘 Support

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Verify all setup steps were completed
3. Check server logs for detailed error messages
4. Ensure MySQL and Node.js versions meet requirements

---

## 🎉 Success Checklist

After setup, you should be able to:

- ✅ Start server without errors
- ✅ See "Database connected successfully"
- ✅ POST to `/countries/refresh` and get 250+ countries
- ✅ GET filtered/sorted country lists
- ✅ View summary image in browser
- ✅ Check system status
- ✅ Delete countries and see count update

---

**Happy Coding! 🚀**
