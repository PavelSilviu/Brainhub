const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");
const passport = require("passport");

router.post("/", passport.authenticate("local"), loginController.login);

module.exports = router;
