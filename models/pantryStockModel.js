const Datastore = require('nedb');
// Initialize NeDB datastore for pantry stock with autoload feature.
const db = new Datastore({
  filename: './database/PantryStock.db',
  autoload: true
});
class PantryStockModel {
  // Retrieves all stock items associated with a specific pantry ID.
  findByPantryId(pantryId) {
    return new Promise((resolve, reject) => {
      db.find({ pantryId }, (err, items) => {
        if (err) reject(err);
        resolve(items);
      });
    });
  }
  // Finds a single stock item by its unique ID.
  findById(id) {
    return new Promise((resolve, reject) => {
      db.findOne({ _id: id }, (err, item) => {
        if (err) reject(err);
        resolve(item);
      });
    });
  }
  // Inserts a new stock item into the database.
  createItem(item) {
    return new Promise((resolve, reject) => {
      db.insert(item, (err, newItem) => {
        if (err) reject(err);
        resolve(newItem);
      });
    });
  }
  // Updates an existing stock item by its ID with new data.
  updateItem(id, item) {
    return new Promise((resolve, reject) => {
      db.update({ _id: id }, { $set: item }, {}, (err, numReplaced) => {
        if (err) reject(err);
        resolve(numReplaced);
      });
    });
  }
  // Removes a stock item from the database by its ID.
  deleteItem(id) {
    return new Promise((resolve, reject) => {
      db.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) reject(err);
        resolve(numRemoved);
      });
    });
  }
}
// Export an instance of the model to be used by other parts of the application.
module.exports = new PantryStockModel();