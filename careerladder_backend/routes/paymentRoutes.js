const express = require("express");
const router = express.Router();
const {
    createCheckoutSession,
    createProjectPayment,
    calculatePayable,
} = require("../controllers/paymentController");

router.post("/createCheckoutSession", createCheckoutSession);
router.post("/createProjectPayment", createProjectPayment);
router.get("/calculatePayable/:projectid", calculatePayable);

module.exports = router;
