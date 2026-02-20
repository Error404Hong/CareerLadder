// TO READ .ENV PROPERTIES
require("dotenv").config();

const express = require("express");
const pool = require("./config/database");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()"); // simple test query
        res.send(`PostgreSQL Connected! Time: ${result.rows[0].now}`);
    } catch (err) {
        res.status(500).send("Database connection failed: " + err.message);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
