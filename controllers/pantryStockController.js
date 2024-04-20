// Importing necessary models
const PantryStock = require('../models/pantryStockModel');
const User = require('../models/userModel');
const Pantry = require('../models/pantryModel');
const Food = require("../models/foodModel");
// Load items function retrieves pantry items from the database
exports.loadItems = async function(req, res) {
  try {
    // Sets HTTP header to prevent caching of the response
    res.set('Cache-Control', 'no-store');
    // Retrieves pantry items associated with the current user's pantry
    const pantryItems = await PantryStock.findByPantryId(req.session.user.pantryId);
    console.log(pantryItems); // Logs the retrieved pantry items for debugging
    // Loops through each pantry item to enrich them with grower and pantry information
    for (let item of pantryItems) {
      // If item has a growerId, retrieves the grower's details
      if (item.growerId !== null) {
        const grower = await User.findUserById(item.growerId);
        // Attaches grower details to the item or keeps original growerId if not found
        item.growerId = grower ? grower : item.growerId;
      }
      // If item has a pantryId, retrieves the pantry details
      if (item.pantryId !== null) {
        const pantry = await Pantry.findById(item.pantryId);
        // Attaches pantry details to the item or keeps original pantryId if not found
        item.pantryId = pantry ? pantry : item.pantryId;
      }
      // Converts expiry date from timestamp to Date object
      item.expiryDate = new Date(item.expiryDate);
    }
    // Renders the pantry manager view with enriched pantry items and user details
    res.render("pantryManager", { pantryItems, user: req.session.user });
  } catch (error) {
    console.error(error); // Logs error to the console
    res.status(500).send('An error occurred while loading items.'); // Error message
  }
};
// Deletes a pantry stock item and redirects to a confirmation page
exports.deletePantryStockItem = function (req, res) {
  const itemId = req.body.itemId; // Retrieves the itemId to delete from the request body
  res.redirect(`/pantryManager/deletePantryStockItemConfirmation?itemId=${itemId}`); // Redirects to a confirmation page with the itemId as a query parameter
};
// Confirms deletion of a pantry stock item after user confirmation
exports.confirmDeletePantryStockItem = function (req, res) {
  const itemId = req.body.itemId; // Retrieves the itemId from the request body
  PantryStock.deleteItem(itemId) // Calls the delete function in PantryStock model
    .then(() => {
      res.redirect("/pantryManager"); // Redirects back to the pantry manager view after successful deletion
    })
    .catch((err) => {
      console.error(err); // Logs any error during deletion
      res.status(500).send("Error deleting item"); // Error message
    });
};