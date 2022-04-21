const express = require("express");

const router = express.Router();
const scanController = require("../controllers/scanController");
router.get("/getMasterData", scanController.getMasterData);
router.get("/getPicklist", scanController.getPicklistData);
router.get("/getPickDetails", scanController.getPickDetails);
router.post("/addScan", scanController.addScan);
router.get("/autoMail", scanController.autoMail);
router.get("/apkDownload", scanController.apkDownload);


module.exports = router;

