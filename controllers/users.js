const Listing = require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user");

module.exports.signup = async(req, res, next) => { 
  try {
    let { username, email, password } = req.body;
    const newUser  = new User({email, username});

    let registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if(err){
        // Ensure error is handled and process stops if login fails
        return next(err); 
      }
      req.flash("success", "Welcome to WanderLust");
      res.redirect("/listings");
  });
  
  } catch(e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async(req, res) => {
  req.flash("success", "Welcome to WanderLust");
  
  // Get the saved URL (or default to /listings)
  let redirectUrl = res.locals.redirectUrl || "/listings";
  
  // *** CRITICAL FIX: Clear the redirect URL from the session ***
  delete req.session.redirectUrl; 
  
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => { 
  req.logout((err) => {
    if(err){
      return next(err);
    }
    req.flash("success", "logged out");
    res.redirect("/listings");
  });
};