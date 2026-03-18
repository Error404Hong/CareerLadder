// TO READ .ENV PROPERTIES
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const logger = require("./utils/logger");

const app = express();
const port = process.env.PORT || 5000;

// Routes
const usersRoutes = require("./routes/usersRoute");
const projectRoutes = require("./routes/projectsRoute");
const jobRoutes = require("./routes/jobsRoute");
const trainingRoutes = require("./routes/trainingRoute");

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    }),
);

app.use(express.json());

// Use Routes
app.use("/users", usersRoutes);
app.use("/projects", projectRoutes);
app.use("/jobs", jobRoutes);
app.use("/training", trainingRoutes);

app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()"); // simple test query
        res.send(`PostgreSQL Connected! Time: ${result.rows[0].now}`);
    } catch (err) {
        res.status(500).send("Database connection failed: " + err.message);
    }
});

app.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`);
});
