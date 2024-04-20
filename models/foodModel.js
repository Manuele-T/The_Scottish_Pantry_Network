const Datastore = require("nedb");
// Initializes a new NeDB datastore for food items, automatically loading the database from the specified file.
let Food = new Datastore({
  filename: "./database/CentralRepo.db",
  autoload: true,
});
// Finds all food items that are marked as available.
Food.findAvailable = function() {
  return new Promise((resolve, reject) => {
    this.find({ isAvailable: true }, (err, docs) => {
      if (err) reject(err); // Rejects the promise if an error occurs.
      else resolve(docs); // Resolves with the list of documents if found.
    });
  });
};
// Finds a single food item by its unique identifier.
Food.findOneById = function(id) {
  return new Promise((resolve, reject) => {
    this.findOne({ _id: id }, (err, doc) => {
      if (err) reject(err); // Rejects the promise if an error occurs.
      else resolve(doc); // Resolves with the document if found.
    });
  });
};
// Removes a food item from the database by its unique identifier.
Food.removeById = function(id) {
  return new Promise((resolve, reject) => {
    this.remove({ _id: id }, {}, (err, numRemoved) => {
      if (err) reject(err); // Rejects the promise if an error occurs.
      else resolve(numRemoved); // Resolves with the number of documents removed.
    });
  });
};
// Inserts a new food item into the database.
Food.insertItem = function(item) {
  return new Promise((resolve, reject) => {
    this.insert(item, (err, newDoc) => {
      if (err) reject(err); // Rejects the promise if an error occurs during insertion.
      else resolve(newDoc); // Resolves with the new document after successful insertion.
    });
  });
};
// Updates a food item in the database by its unique identifier.
Food.updateItem = function(id, update) {
  return new Promise((resolve, reject) => {
    this.update({ _id: id }, { $set: update }, {}, (err, numReplaced) => {
      if (err) reject(err); // Rejects the promise if an error occurs during update.
      else resolve(numReplaced); // Resolves with the number of documents replaced.
    });
  });
};
module.exports = Food; // Exports the Food datastore for use elsewhere in the application.