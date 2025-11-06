// NOTE: I am assuming you have a schema.js file in your project root
const Listing = require("./models/listing");
const Review = require("./models/review"); // **FIX 1:** Corrected 'review' to 'Review' (Capital 'R')
const ExpressError = require("./utils/expressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


// ...
module.exports.isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()){
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create Listing");
    return res.redirect("/login");
  }
  next();
};
// ...

module.exports.saveRedirectUrl = (req, res, next) => {
  // Transfer the redirect URL from the session to res.locals
  // res.locals makes it accessible in the response cycle
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  // Continue
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  // Note: listing object must have its 'owner' field populated for this check to work
  let listing = await Listing.findById(id); 

  // Check if the listing was actually found
  if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
  }

  // Check if the authenticated user's ID matches the listing owner's ID
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    // **FIX 2:** Added 'return' to stop execution and prevent further code from running
    return res.redirect(`/listings/${id}`); 
  }
  // If they are the owner, continue
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  
  // Check if the review was actually found
  if (!review) {
      req.flash("error", "Review not found.");
      return res.redirect(`/listings/${id}`);
  }

  // Check if the authenticated user's ID matches the review author's ID
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    // **FIX 3:** Added 'return' to stop execution
    return res.redirect(`/listings/${id}`); 
  }
  // **FIX 4:** Added 'next()' to allow execution to proceed to the controller
  next();
};