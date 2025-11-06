const Listing = require("../models/listing")
const mongoose = require("mongoose");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"},}).populate("owner");
  if(!listing){
    req.flash("error", "Listing you requested for does not exist");
    // **FIX: Use res.redirect for flash messages**
    return res.redirect("/listings"); 
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  })
  .send();

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url, filename};

  // **FIX: The response body has 'features' not 'feature' (plural)**
  newListing.geometry = response.body.features[0].geometry; 

  let savedListing = await newListing.save();
  console.log(savedListing);

  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const cleanId = id.trim();

  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    // This part is fine, but the next line is the priority fix
  }

  const listing = await Listing.findById(cleanId);
  if(!listing){
    req.flash("error", "Listing you requested for does not exist");
    // **FIX: Use res.redirect for flash messages**
    return res.redirect("/listings");
  }

  // The next if(!listing) is redundant after the flash block, but keeping it for flow
  if (!listing) {
    return res.status(404).send("Listing not found");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  // **FIX 1: Rerun geocoding to update geometry if location changed**
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  })
  .send();
  
  // Update the listing object with the new geometry before passing to update
  req.body.listing.geometry = response.body.features[0].geometry;

  let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

  if(typeof req.file != "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};

    // Only save if we update the image (findByIdAndUpdate already saved other fields)
    await listing.save(); 
  }

  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};