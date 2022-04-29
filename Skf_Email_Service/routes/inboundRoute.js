const express = require("express");
const router = express.Router();

const inboundController = require("../controllers/inboundController");

router.get("/inboundList", inboundController.inboundList);
router.post("/allocateProduct", inboundController.allocateProduct);
router.get("/location", inboundController.location);
router.get("/inboundDetails", inboundController.inboundDetails);
router.post("/updateInbound", inboundController.updateInbound);
router.get("/inboundListWeb", inboundController.inboundListWeb);
router.get("/inboundWebDetails", inboundController.inboundDetailsWeb);
router.get("/inboundDelete", inboundController.inboundDelete);
router.post("/createInbound", inboundController.createInbound);
router.get("/inboundDownloadXlsxFileLink", inboundController.inboundDownloadXlsxFileLink);
router.get("/inboundBulkDownloadXlsxFileLink", inboundController.inboundBulkDownloadXlsxFileLink);
router.get("/download", inboundController.downloadDoc);

module.exports = router;

// http://localhost:7000/inbound/inboundList?WarehouseID=1100000001&PickerID=1&StatusID=NULL
// http://localhost:7000/inbound/allocateProduct?WareHouseID=1100000001&PickerID=1&invoiceNo=025474GHDSB1&number_of_picker=1
// http://localhost:7000/inbound/location?WarehouseID=1100000001&PickerID=1

// http://localhost:7000/inbound/updateInbound?
// http://localhost:7000/inbound/inboundListWeb?user_id=&invoice_no=004201HNWSB1&LR_No=712640415&From_DC=1100000004&StatusID=0
// http://localhost:7000/inbound/inboundDelete?user_id=2&inbound_ID=2
// http://localhost:7000/inbound/inboundWebDetails?user_id=1&inbound_ID=1


// (pending)
// http://localhost:7000/inbound/inboundDownloadXlsxFileLink?User_ID=&invoice_No=004201HNWSB1
// http://localhost:7000/inbound/inboundDetails?WarehouseID=1100000004&PickerID=1&invoiceNo=004201HNWSB1