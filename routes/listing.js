const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js")
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


// ...
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn, // 1. Check if user is authenticated
    upload.single("listing[image]"), // 2. Process the file upload
    validateListing, // 3. Validate form data after parsing
    wrapAsync (listingController.createListing) // 4. Create the listing
  );
// ...

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);


router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

  
// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;