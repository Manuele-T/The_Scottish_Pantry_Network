const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Datastore = require("gray-nedb");  // Includes NeDB, a lightweight database
const User = require("../models/userModel");  // Imports user model for database operations
const messageModel = require("../models/messageModel");  // Imports message model for handling messages
const Pantry = require("../models/pantryModel");  // Imports pantry model for handling pantry data
// Function to display a list of all pantries
exports.seePantriesList = async function (req, res) {
  try {
    const pantries = await Pantry.findAll();  // Retrieves all pantries from the database
    res.render("pantriesList", { pantries });  // Renders the pantries list page with retrieved pantries
  } catch (error) {
    console.error("Error loading pantries list:", error);
    res.status(500).send("Internal Server Error");  // Sends error if there's a server-side issue
  }
};
// Function to display a list of all growers
exports.seeGrowersList = async function (req, res) {
  try {
    const growers = await User.find({ role: "Grower" });  // Fetches all users with role 'Grower'
    res.render("growersList", { growers });  // Renders the growers list page with the data
  } catch (error) {
    console.error("Error loading growers list:", error); // Error message
    res.status(500).send("Internal Server Error");  // Handles errors during growers data fetch
  }
};
// Renders the homepage view
exports.show_home_page = function (req, res) {
  res.render("homePage", { user: req.session.user });  // Sends user session info to the homepage for dynamic content display
};
// Function to show the about page
exports.show_about_page = function (req, res) {
  res.render("about", { user: req.session.user });  // Renders the about page with user session information
};
// Displays the message form
exports.showMessageForm = function (req, res) {
  res.render("messageForm", { user: req.session.user });  // Renders the message form and passes user session data
};
// Submits a new message to the message model
exports.submitMessage = function (req, res) {
  const newMessage = {
    email: req.body.email,  // Takes email from form input
    message: req.body.message,  // Takes message from form input
  };
  messageModel.insert(newMessage, function (err, doc) {
    if (err) {
      console.log("Error occurred while saving message:", err);
      return res.status(500).send("Error occurred while saving message");  // Handles errors during message insertion
    }
    res.redirect("/");  // Redirects to the homepage after message is saved
  });
};
// Deletes a message from the database
exports.deleteMessage = function (req, res) {
  const messageId = req.params.id;  // Extracts message ID from the URL
  messageModel.delete(messageId, function (err, numRemoved) {
    if (err) {
      console.log("Error occurred while deleting message:", err); // Error message
      return res.status(500).send("Error occurred while deleting message");  // Error handling if deletion fails
    }
    res.redirect("/");  // Redirects to the homepage after deleting the message
  });
};