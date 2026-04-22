const express = require("express");
const router = express.Router();
const {
    getBankAccounts,
    addBankAccount,
    deleteBankAccount,
    setDefault,
} = require("../controllers/bankController");

router.get("/getBankAcc/:studentid", getBankAccounts);
router.post("/addBankAcc/:studentid", addBankAccount);
router.delete("/deleteBank/:id/:studentid", deleteBankAccount);
router.put("/setDefault/:id/:studentid", setDefault);

module.exports = router;
