// Imports necessary libraries and modules
const jwt = require("jsonwebtoken");  // Used for encoding, decoding, and verifying JWTs
const bcrypt = require("bcrypt");  // Used for hashing passwords
const Datastore = require("nedb");  // Embedded persistent database
const path = require("path");  // Utilities for working with file and directory paths
const User = require("../database/database.js");  // Database access for users, assuming the corrected path
const Pantry = require('../models/pantryModel.js');  // Model for managing pantry data
// Renders the page for creating a new pantry
exports.show_create_pantry_page = function (req, res) {
  res.render("createPantry");  // Points to a view named 'createPantry' to display the form
};
// Handles the creation of a new pantry
exports.create_pantry = async function (req, res) {
  let newPantry = {
    name: req.body.name,  // Retrieves the name from the form input
    location: req.body.location  // Retrieves the location from the form input
  };
  try {
    const createdPantry = await Pantry.createPantry(newPantry);  // Attempts to create a pantry using the Pantry model
    console.log(createdPantry);  // Logs the newly created pantry object to the console
    res.redirect('/admin');  // Redirects the user to the admin page upon successful creation
  } catch (err) {
    console.log(err);  // Logs any error that occurs during the pantry creation process
    res.redirect('/admin/createPantry');  // Redirects back to the create pantry page if there is an error
  }
};