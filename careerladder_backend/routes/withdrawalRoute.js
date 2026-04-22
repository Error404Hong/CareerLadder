const express = require("express");
const router = express.Router();
const {
    getAvailableBalance,
    requestWithdrawal,
    getWithdrawalRequestByStudent,
    getAllWithdrawalRequest,
    approveRequest,
    rejectRequest,
    completeRequest,
} = require("../controllers/withdrawalController");

router.get("/getBalance/:studentid", getAvailableBalance);
router.get("/getStudentRequests/:studentid", getWithdrawalRequestByStudent);
router.get("/getAll", getAllWithdrawalRequest);

router.post("/request/:bankid/:studentid", requestWithdrawal);
router.put("/approve/:id", approveRequest);
router.put("/complete/:id", completeRequest);
router.put("/reject/:id", rejectRequest);

module.exports = router;
