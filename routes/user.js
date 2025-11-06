const express = require("express");
const router = express.Router({mergeParams: true});
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

// **CRITICAL:** Ensure the path is correct relative to the location of this file
const userController = require("../controllers/users.js");

router
  .route("/signup")
  // These must match the exports in users.js exactly
  .get(userController.renderSignupForm) 
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderLoginForm) // This is likely the line causing the error
  .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), userController.login);

router.get("/logout", userController.logout);

module.exports = router;