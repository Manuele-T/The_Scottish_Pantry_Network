// Import necessary modules
const db = require('../database/database.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;
// Define the UserModel class responsible for managing user data within the database.
class UserModel {
  // Initialize default users in the database upon startup of the application.
  async init() {
    // List of predefined users to populate the database.
    const defaultUsers = [
      { username: 'admin@example.com', password: 'adminPassword', role: 'Admin', isBlocked: false, pantryId: null },
      { username: 'pantrymanager01@example.com', password: 'pantryManagerPassword', role: 'PantryManager', isBlocked: false, pantryId: null },
      { username: 'grower01@example.com', password: 'growerPassword', role: 'Grower', isBlocked: true, pantryId: null },
      { username: 'repomanager01@example.com', password: 'repoManagerPassword', role: 'RepoManager', isBlocked: false, pantryId: null },
    ];
    // Loop through each default user and insert them into the database if they don't already exist.
    for (const user of defaultUsers) {
      const passwordHash = await bcrypt.hash(user.password, saltRounds); // Hash user password
      const existingUser = await this.findUserByUsername(user.username); // Check if user already exists in the database
      if (!existingUser) { // If user doesn't exist, create a new one
        this.createUser(user.username, passwordHash, user.role, user.pantryId);
      }
    }
  }
  // Method to create a new user in the database.
  async createUser(username, passwordHash, role, isBlocked, pantryId) {
    const newUser = { username, passwordHash, role, isBlocked, pantryId }; // New user object
    return new Promise((resolve, reject) => {
      db.insert(newUser, (err, doc) => { // Insert the new user into the database
        if (err) reject(err); // If there's an error, reject the promise
        resolve(doc); // Otherwise, resolve with the newly created user document
      });
    });
  }
  // Method to create a new user by an admin.
  async createUserByAdmin(user) {
    const newUser = { ...user }; // Clone the user object to avoid mutations
    return new Promise((resolve, reject) => {
      db.insert(newUser, (err, doc) => { // Insert the new user into the database
        if (err) reject(err); // If there's an error, reject the promise
        resolve(doc); // Otherwise, resolve with the newly created user document
      });
    });
  }
  // Find a user by their username.
  findUserByUsername(username) {
    return new Promise((resolve, reject) => {
      db.findOne({ username }, (err, user) => { // Look for a single user in the database by username
        if (err) reject(err); // If an error occurs, reject the promise
        resolve(user); // Otherwise, resolve with the user object
      });
    });
  }
  // Generic find method to retrieve users based on a query.
  find(criteria) {
    return new Promise((resolve, reject) => {
      db.find(criteria, (err, users) => { // Search for users in the database matching the criteria
        if (err) reject(err); // If an error occurs, reject the promise
        resolve(users); // Otherwise, resolve with the list of users
      });
    });
  }
  // Find a user by their unique database ID.
  findUserById(id) {
    return new Promise((resolve, reject) => {
      db.findOne({ _id: id }, (err, user) => { // Search for a single user by ID
        if (err) reject(err); // If an error occurs, reject the promise
        resolve(user); // Otherwise, resolve with the user object
      });
    });
  }
  // Update a user's data in the database.
  updateUser(user) {
    return new Promise((resolve, reject) => {
      db.update({ _id: user._id }, user, {}, (err, numReplaced) => { // Update the user document
        if (err) reject(err); // If an error occurs, reject the promise
        resolve(numReplaced); // Otherwise, resolve with the count of documents replaced
      });
    });
  }
  // Delete a user from the database.
  deleteUser(id) {
    return new Promise((resolve, reject) => {
      db.remove({ _id: id }, {}, (err, numRemoved) => { // Remove the user document by ID
        if (err) reject(err); // If an error occurs, reject the promise
        resolve(numRemoved); // Otherwise, resolve with the count of documents removed
      });
    });
  }
}
// Create an instance of the UserModel class and initialize it.
const userModel = new UserModel();
userModel.init();
// Export the instance methods of the UserModel to be used in other parts of the application.
module.exports = {
  createUser: userModel.createUser.bind(userModel),
  findUserByUsername: userModel.findUserByUsername.bind(userModel),
  find: userModel.find.bind(userModel),
  findUserById: userModel.findUserById.bind(userModel),
  updateUser: userModel.updateUser.bind(userModel),
  createUserByAdmin: userModel.createUserByAdmin.bind(userModel),
  deleteUser: userModel.deleteUser.bind(userModel),
};