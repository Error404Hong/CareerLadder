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
    releaseMonthlyPayment,
    getPaymentReleases,
} = require("../controllers/paymentController");

router.post("/createCheckoutSession", createCheckoutSession);
router.post("/createProjectPayment", createProjectPayment);
router.get("/calculatePayable/:projectid", calculatePayable);
router.get("/getByCompany/:companyId", getPaymentsByCompany);
router.get("/getStats/:companyId", getPaymentStats);
router.get("/getByStudent/:studentId", getPaymentsByStudent);
router.put("/updateStatus/:id", updatePaymentStatus);
router.put("/releaseMonthly/:id", releaseMonthlyPayment);
router.get("/releases/:paymentId", getPaymentReleases);

module.exports = router;
