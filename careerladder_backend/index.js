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
const paymentRoutes = require("./routes/paymentRoutes");
const meetingRoutes = require("./routes/meetingsRoute");
const notificationRoutes = require("./routes/notificationsRoute");
const chatRoutes = require("./routes/chatRoute");

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    }),
);

const { handleWebhook } = require("./controllers/paymentController");
app.post(
    "/payment/webhook",
    express.raw({ type: "application/json" }),
    handleWebhook,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use Routes
app.use("/users", usersRoutes);
app.use("/projects", projectRoutes);
app.use("/jobs", jobRoutes);
app.use("/training", trainingRoutes);
app.use("/payment", paymentRoutes);
app.use("/meetings", meetingRoutes);
app.use("/notifications", notificationRoutes);
app.use("/chat", chatRoutes);

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
