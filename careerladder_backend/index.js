// TO READ .ENV PROPERTIES
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const app = express();
const port = process.env.PORT || 5000;

// Routes
const usersRoutes = require("./routes/usersRoute");

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    }),
);

app.use(express.json());

// Use Routes
app.use("/users", usersRoutes);

app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()"); // simple test query
        res.send(`PostgreSQL Connected! Time: ${result.rows[0].now}`);
    } catch (err) {
        res.status(500).send("Database connection failed: " + err.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
