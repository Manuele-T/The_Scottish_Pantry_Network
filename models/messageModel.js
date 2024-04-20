const Datastore = require("nedb");
// Initialize NeDB Datastore for messages.
const Message = new Datastore({ filename: "./database/Messages.db", autoload: true });
// Function to insert a new message into the datastore.
exports.insert = function(newMessage, callback) {
    Message.insert(newMessage, callback); // Insert new message and execute callback with result.
};
// Function to delete a message by its ID.
exports.delete = function(messageId, callback) {
    Message.remove({ _id: messageId }, {}, callback); // Remove message by ID and execute callback.
};
// Function to retrieve all messages from the datastore.
exports.findAll = function(callback) {
    Message.find({}, callback); // Retrieve all messages and execute callback with result.
};