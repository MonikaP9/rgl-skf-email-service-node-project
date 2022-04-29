const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

router.post("/verify", userController.verifyUser);
router.post("/verifyPicker", userController.verifyPicker);
router.post("/logoutPicker", userController.logoutPicker);


module.exports = router;

// http://localhost:7000/user/verify?Email=admin@bb.com&Password=rgl@2022