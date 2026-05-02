require("dotenv").config();
const { Pool } = require("pg");
const logger = require("../utils/logger");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
});

pool.connect((err, client, release) => {
    if (err) {
        logger.error("Error connecting to PostgreSQL:", err.message);
    } else {
        logger.info("PostgreSQL Connected Successfully");
        release();
    }
});

module.exports = pool;
