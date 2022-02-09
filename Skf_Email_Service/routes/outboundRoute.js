const express = require("express");
const router = express.Router();

const outboundController = require("../controllers/outboundController");

router.get("/outboundList", outboundController.outboundList);

router.get("/outboundDetails", outboundController.outboundDetails);
router.post("/updateOutbound", outboundController.updateOutbound);
router.get("/outboundListWeb", outboundController.outboundListWeb);
router.get("/outboundWebDetails", outboundController.outboundDetailsWeb);
router.get("/outboundDelete", outboundController.outboundDelete);
router.post("/allocateProductOutBound", outboundController.allocateProductOutBound);



module.exports = router;

// http://localhost:7000/outbound/outboundList?WarehouseID=1100000001&PickerID=1&Status=2
// http://localhost:7000/outbound/outboundDelete?user_id=&picking_ID=108386248
// http://localhost:7000/outbound/allocateProductOutBound(body :WareHouseID=1100000001&PickerID=1&PickingID=025474GHDSB1&number_of_picker=1)
// http://localhost:7000/outbound/updateOutbound
// http://localhost:7000/outbound/outboundWebDetails?user_id=2&picking_ID=025474GHDSB1
// http://localhost:7000/outbound/outboundListWeb?user_id=2&picking_ID=025474GHDSB1&StatusID=2
// (pending)
// http://localhost:7000/outbound/outboundDetails?user_id=null&picking_id=025474GHDSB1