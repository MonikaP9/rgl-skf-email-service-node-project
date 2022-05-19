const express = require('express');

const router = express.Router();

const dashboardController = require('../controllers/dashboardController');

router.get("/dashboardCount", dashboardController.inbound_outboundCount);
router.get("/dashboardData", dashboardController.dashboardData);

module.exports = router;

// http://localhost:7000/dashboard/dashboardCount?WarehouseID=1100000005&PickerID=1