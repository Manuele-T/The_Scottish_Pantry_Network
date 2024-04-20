const path = require("path");
const Food = require("../models/foodModel"); // Include the food model for database operations related to food items
const fs = require("fs"); // Filesystem module for handling file operations, not used in provided methods
const PantryStock = require('../models/pantryStockModel'); // Include the pantry stock model for operations related to pantry stock
// Displays the page to add new items to the repository
exports.show_add_item_page = function (req, res) {
  res.render("addItemToRepo"); // Uses the addItemToRepo view for rendering
};
// Processes the addition of a new food item to the repository
exports.addItemToRepo = function (req, res) {
  const { name, description, expiryDate } = req.body;
  const food = {
    name,
    description,
    isAvailable: true, // Marks the food as available by default
    hasBeenPickedUp: false, // Marks that the food has not been picked up
    expiryDate: new Date(expiryDate).getTime(), // Gets the expiry date
    growerId: req.session.user._id, // Assigns the food to the logged-in user (grower)
    pantryId: null, // Initially, no pantry is assigned
  };
  // Searches for an existing food item that matches the given criteria
  Food.findOne({
    name: food.name,
    description: food.description,
    expiryDate: food.expiryDate,
  }, async (err, existingFood) => {
    if (err) {
      console.log("Error occurred while finding food:", err); // Logs an error if the database operation fails
      return res.status(500).send("Error occurred while finding food");
    }
    if (!existingFood) { // If no existing food is found, proceeds to add the new item
      try {
        let newFood = await Food.insertItem(food); // Inserts the new food item into the database
        console.log("New food added:", newFood); // Logs the newly added food item
        res.redirect("/centralRepo"); // Redirects to the central repository page after successful addition
      } catch (err) {
        console.log("Error occurred while adding food:", err); // Logs an error if the insert operation fails
        return res.status(500).send("Error occurred while adding food");
      }
    } else {
      res.status(400).send("Food item already exists"); // Responds with an error if the food item already exists
    }
  });
};
// Loads and displays all available food items that have not expired
exports.loadItems = async function (req, res) {
  try {
    let foodItems = await Food.findAvailable(); // Retrieves all available food items from the database
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Sets the current date with time cleared to midnight
    foodItems = foodItems.filter((item) => {
      const expiryDate = new Date(item.expiryDate);
      expiryDate.setHours(0, 0, 0, 0); // Clears the time part of the expiry date to compare just the dates
      return expiryDate >= currentDate; // Filters out food items that have expired
    });
    res.render("centralRepo", { foodItems, user: req.session.user }); // Renders the central repository page with the filtered items
  } catch (err) {
    console.log("Error occurred while loading food:", err); // Logs an error if the database operation fails
    return res.status(500).send("Error occurred while loading food");
  }
};
// Retrieves and displays a confirmation page for deleting a food item
exports.getDeleteConfirmation = async (req, res) => {
  try {
    let food = await Food.findOneById(req.params.id); // Retrieves the food item by its ID
    res.render("deleteConfirmation", { food, user: req.session.user, itemId: req.params.id }); // Renders the delete confirmation page with the food item details
  } catch (err) {
    console.log("Error occurred while finding food:", err); // Logs an error if the food cannot be found
    return res.status(500).send("Error occurred while finding food");
  }
};
// Deletes a specified food item from the database
exports.deleteItem = async function (req, res) {
  try {
    let numRemoved = await Food.removeById(req.params.id); // Attempts to remove the food item by its ID
    if (numRemoved === 0) {
      return res.status(404).send("Food not found"); // Sends an error if the food item does not exist
    }
    res.redirect("/centralRepo"); // Redirects to the central repository page after deletion
  } catch (err) {
    console.log("Error occurred while deleting food:", err); // Error message
    return res.status(500).send("Error occurred while deleting food");
  }
};
// Reserves a food item for a pantry, marking it as unavailable and then moving it to the pantry database
exports.reserveItem = async function (req, res) {
  try {
    let numReplaced = await Food.updateItem(req.params.id, { pantryId: req.session.user.pantryId, isAvailable: false }); // Updates the food item to mark it as reserved and assigns it to the user's pantry
    if (numReplaced === 0) {
      return res.status(404).send("Food not found"); // Sends an error if the food item does not exist
    }
    await exports.addItemToPantryDb(req, res, false); // Adds the reserved food item to the pantry database
    let numRemoved = await Food.removeById(req.params.id); // Removes the food item from the central repository
    if (numRemoved === 0) {
      console.log("Error occurred while deleting food: Food not found");
    }
    res.redirect("/centralRepo"); // Redirects to the central repository page after reservation
  } catch (err) {
    console.log("Error occurred while reserving food:", err); // Error message
    return res.status(500).send("Error occurred while reserving food");
  }
};
// Adds a reserved item to the pantry database, optionally sending a response to the client
exports.addItemToPantryDb = async function (req, res, sendResponse = true) {
  console.log("addItemToPantryDb called with params:", req.params); // Logs the function call with parameters
  try {
    console.log("Attempting to find food with ID:", req.params.id); // Logs the attempt to find the food item
    let food = await Food.findOneById(req.params.id); // Retrieves the food item by its ID
    if (!food) {
      console.log("No food found with ID:", req.params.id); // Logs if no food is found
      if (sendResponse) {
        return res.status(404).send("Food not found"); // Sends an error if no food item is found
      }
    }
    let pantryStock = {
      name: food.name,
      description: food.description,
      isAvailable: food.isAvailable,
      hasBeenPickedUp: food.hasBeenPickedUp,
      expiryDate: food.expiryDate,
      growerId: food.growerId,
      pantryId: req.session.user.pantryId
    };
    console.log("Creating pantry stock item:", pantryStock); // Logs the creation of a pantry stock item
    let createdItem = await PantryStock.createItem(pantryStock); // Creates a new pantry stock item in the database
    console.log("Created pantry stock item:", createdItem); // Logs the newly created pantry stock item
    if (sendResponse) {
      res.redirect("/pantry"); // Redirects to the pantry page after successful addition
    }
  } catch (err) {
    console.log("Error in addItemToPantryDb:", err); // Logs any errors during the process
    if (sendResponse) {
      res.status(500).send("Error occurred while adding item to Pantry DB"); // Error message
    }
  }
};