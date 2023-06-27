const express = require("express");

const contactController = require("../controller/contact");
const isAuth = require("../middlerware/is-auth");

const router = express.Router();

// user exists
router.post("/contact/is-exists", isAuth, contactController.ifNumberExists);

router.get("/contact-list", isAuth, contactController.loadContactList);

module.exports = router;
