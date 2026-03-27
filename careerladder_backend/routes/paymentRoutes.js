const express = require("express");
const router = express.Router();
const {
    createCheckoutSession,
    createProjectPayment,
    calculatePayable,
    getPaymentsByCompany,
    getPaymentStats,
    getPaymentsByStudent,
    updatePaymentStatus,
} = require("../controllers/paymentController");

router.post("/createCheckoutSession", createCheckoutSession);
router.post("/createProjectPayment", createProjectPayment);
router.get("/calculatePayable/:projectid", calculatePayable);
router.get("/getByCompany/:companyId", getPaymentsByCompany);
router.get("/getStats/:companyId", getPaymentStats);
router.get("/getByStudent/:studentId", getPaymentsByStudent);
router.put("/updateStatus/:id", updatePaymentStatus);

module.exports = router;
