// Imports necessary models and libraries
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Pantry = require("../models/pantryModel.js");
const Message = require("../models/messageModel.js");
// Renders the page to create a new pantry manager using a Handlebars template
exports.show_create_pantry_manager_page = function (req, res) {
  res.render("createPantryManager");
};
// Handles POST request to create a new pantry manager
exports.create_pantry_manager = async function (req, res) {
  let { username, password } = req.body;
  username = username.toLowerCase(); // Convert username to lowercase for uniformity
  if (!username || !password) { // Validate input for presence of username and password
    return res.status(400).send("Both username and password are required.");
  }
  try {
    const userExists = await User.findUserByUsername(username); // Check if user already exists
    if (userExists) {
      return res.status(409).send("User already exists."); // Prevent duplicate usernames
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Securely hash the password
    const newUser = { // Create a new user object
      username: username,
      passwordHash: hashedPassword,
      role: "PantryManager",
      isBlocked: false,
      pantryId: null,
    };
    await User.createUserByAdmin(newUser); // Save the new user in the database
    res.redirect("/admin"); // Redirect to the admin dashboard after successful creation
  } catch (error) {
    console.error("Error in creating Pantry Manager:", error);
    res.status(500).send("Internal Server Error"); // Error message
  }
};
// Displays the admin dashboard main page
exports.show_admin_dashboard = function (req, res) {
  res.render("adminDashboard");
};
// Displays a page for managing both pantries and their managers
exports.show_manage_pantries_and_managers_page = async function (req, res) {
  try {
    const pantryManagers = await User.find({ role: "PantryManager" }); // Fetch all pantry managers
    const pantries = await Pantry.findAll(); // Fetch all pantries
    // Attach each manager's associated pantry for display
    for (let manager of pantryManagers) {
      if (manager.pantryId) {
        manager.pantry = await Pantry.findById(manager.pantryId);
      }
    }
    res.render("managePantriesAndManagers", { pantryManagers, pantries }); // Render the management page with fetched data
  } catch (error) {
    console.error("Error managing pantries and managers:", error);
    res.status(500).send("Internal Server Error"); // Error message
  }
};
// Assigns a pantry to a specific pantry manager, based on form submission
exports.assign_pantry_to_manager = async function (req, res) {
  const { pantryManagerId, pantryId } = req.body; // Extract IDs from request body
  try {
    const pantryManager = await User.findUserById(pantryManagerId); // Fetch the specific pantry manager
    if (!pantryManager) {
      return res.status(400).send("Pantry manager not found"); // Ensure the manager exists
    }
    pantryManager.pantryId = pantryId; // Set the manager's pantry ID
    await User.updateUser(pantryManager); // Save the updated manager information
    res.redirect("/admin/managePantriesAndManagers"); // Redirect back to the management page
  } catch (error) {
    console.error("Error assigning pantry to manager:", error);
    res.status(500).send("Internal Server Error"); // Error message
  }
};
// Displays a list of all pantry managers and allows administrative actions
exports.manage_pantry_managers = async function (req, res) {
  try {
    const pantryManagers = await User.find({ role: "PantryManager" }); // Fetch all managers with the role "PantryManager"
    // Attach each manager's pantry to their object if they manage one
    for (let manager of pantryManagers) {
      if (manager.pantryId) {
        manager.pantry = await Pantry.findById(manager.pantryId);
      }
    }
    res.render("managePantryManagers", { pantryManagers }); // Render the page with all pantry managers
  } catch (error) {
    console.error("Error managing pantry managers:", error);
    res.status(500).send("Internal Server Error"); // Error message
  }
};
// Manages all growers by listing them and providing options to modify their details
exports.manage_growers = async function (req, res) {
  try {
    const growers = await User.find({ role: "Grower" }); // Fetch all users with the role "Grower"
    res.render("manageGrowers", { growers }); // Render the grower management page with the list of growers
  } catch (error) {
    console.error("Error managing growers:", error);
    res.status(500).send("Internal Server Error"); // Error message
  }
};
// Toggles the blocked status of a grower based on their current status
exports.changeGrowerStatus = async function (req, res) {
  const { growerId } = req.body; // Extract grower ID from the form submission
  try {
    const grower = await User.findUserById(growerId); // Fetch the specific grower
    if (!grower) {
      return res.status(400).send("Grower not found"); // Ensure the grower exists
    }
    grower.isBlocked = !grower.isBlocked; // Toggle the 'isBlocked' status
    await User.updateUser(grower); // Update the grower's status in the database
    res.redirect("/admin/manageGrowers"); // Redirect to the grower management page
  } catch (error) {
    console.error("Error changing grower status:", error);
    res.status(500).send("Internal Server Error"); // Error message
  }
};
// Manages all pantries by listing them and providing administrative options
exports.manage_pantries = async function (req, res) {
  try {
    const pantries = await Pantry.findAll(); // Fetch all pantries from the database
    res.render("managePantries", { pantries }); // Render the pantry management page with the list of pantries
  } catch (error) {
    console.error("Error managing pantries:", error);
    res.status(500).send("Internal Server Error"); // Error message
  }
};
// Displays all messages sent by users or visitors
exports.show_messages = function (req, res) {
  Message.findAll((error, messages) => { // Retrieve all messages
    if (error) {
      console.error("Error showing messages:", error);
      return res.status(500).send("Internal Server Error"); // Handle retrieval errors
    }
    console.log(messages); // Log messages to the console for debugging
    res.render("messages", { messages }); // Render the messages page with the list of messages
  });
};
// Deletes a specific message by ID
exports.delete_message = async function (req, res) {
  try {
    await Message.delete(req.params.id); // Delete the message specified by the ID in the request
    res.redirect("/admin/messages"); // Redirect back to the message listing page
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).send("Internal Server Error"); // Error message
  }
};
// Initiates the deletion process for a grower by redirecting to a confirmation page
exports.deleteGrower = function (req, res) {
  const growerId = req.body.growerId; // Extract the grower's ID from the form submission
  res.redirect(`/admin/deleteGrowerConfirmation?growerId=${growerId}`); // Redirect to the grower deletion confirmation page
};
// Confirms the deletion of a grower after verifying their ID
exports.confirmDeleteGrower = function (req, res) {
  const growerId = req.body.growerId; // Extract the grower's ID from the confirmation form
  User.deleteUser(growerId) // Delete the grower from the database
    .then(() => {
      res.redirect("/admin/manageGrowers"); // Redirect back to the grower management page after deletion
    })
    .catch((err) => {
      console.error(err); // Log any errors that occur
      res.status(500).send("Error deleting grower"); // Error message
    });
};
// Initiates the deletion process for a pantry manager by redirecting to a confirmation page
exports.deletePantryManager = function (req, res) {
  const pantryManagerId = req.body.pantryManagerId; // Extract the pantry manager's ID from the form submission
  res.redirect(
    `/admin/deletePantryManagerConfirmation?pantryManagerId=${pantryManagerId}` // Redirect to the pantry manager deletion confirmation page
  );
};
// Confirms the deletion of a pantry manager after verifying their ID
exports.confirmDeletePantryManager = function (req, res) {
  const pantryManagerId = req.body.pantryManagerId; // Extract the pantry manager's ID from the confirmation form
  User.deleteUser(pantryManagerId) // Delete the pantry manager from the database
    .then(() => {
      res.redirect("/admin/managePantryManagers"); // Redirect back to the pantry manager management page after deletion
    })
    .catch((err) => {
      console.error(err); // Log any errors that occur
      res.status(500).send("Error deleting Pantry Manager"); // Error message
    });
};
// Toggles the blocked status of a pantry manager based on their current status
exports.changePantryManagerStatus = async function (req, res) {
  const { pantryManagerId } = req.body; // Extract the pantry manager's ID from the form submission
  try {
    const pantryManager = await User.findUserById(pantryManagerId); // Fetch the specific pantry manager
    if (!pantryManager) {
      return res.status(400).send("Pantry Manager not found"); // Error message
    }
    pantryManager.isBlocked = !pantryManager.isBlocked; // Toggle the 'isBlocked' status
    await User.updateUser(pantryManager); // Update the pantry manager's status in the database
    res.redirect("/admin/managePantryManagers"); // Redirect back to the pantry manager management page
  } catch (error) {
    console.error("Error changing grower status:", error);
    res.status(500).send("Internal Server Error"); // Error message
  }
};
// Initiates the deletion process for a pantry by redirecting to a confirmation page
exports.deletePantry = function (req, res) {
  const pantryId = req.body.pantryId; // Extract the pantry's ID from the form submission
  res.redirect(`/admin/deletePantryConfirmation?pantryId=${pantryId}`); // Redirect to the pantry deletion confirmation page
};
// Confirms the deletion of a pantry after verifying its ID
exports.confirmDeletePantry = function (req, res) {
  const pantryId = req.body.pantryId; // Extract the pantry's ID from the confirmation form
  Pantry.deletePantry(pantryId) // Delete the pantry from the database
    .then(() => {
      res.redirect("/admin/managePantries"); // Redirect back to the pantry management page after deletion
    })
    .catch((err) => {
      console.error(err); // Log any errors that occur
      res.status(500).send("Error deleting Pantry"); // Error message
    });
};