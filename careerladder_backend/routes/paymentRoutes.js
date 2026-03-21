const express = require("express");
const router = express.Router();
const { createCheckoutSession } = require("../controllers/paymentController");

router.post("/createCheckoutSession", createCheckoutSession);

module.exports = router;
