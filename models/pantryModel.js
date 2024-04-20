const Datastore = require('nedb');
// Initialize NeDB datastore for pantries with autoload feature.
const db = new Datastore({
  filename: './database/Pantry.db',
  autoload: true
});
class PantryModel {
  // Method to initialize pantry database with predefined data.
  async init() {
    const pantries = [
      { name: 'Pantry 1', location: 'Location 1' },
      { name: 'Pantry 2', location: 'Location 2' },
      { name: 'Pantry 3', location: 'Location 3' },
      { name: 'Pantry 4', location: 'Location 4' },
    ];
    // Loop through each pantry and add it to the database if it doesn't already exist.
    for (const pantry of pantries) {
      const existingPantry = await this.findByName(pantry.name);
      if (!existingPantry) {
        await this.createPantry(pantry);
      }
    }
  }
  // Finds a pantry by name.
  findByName(name) {
    return new Promise((resolve, reject) => {
      db.findOne({ name }, (err, pantry) => {
        if (err) reject(err);
        resolve(pantry);
      });
    });
  }
  // Creates a new pantry record in the database.
  createPantry(pantry) {
    return new Promise((resolve, reject) => {
      db.insert(pantry, (err, newPantry) => {
        if (err) reject(err);
        resolve(newPantry);
      });
    });
  }
  // Retrieves all pantries from the database.
  findAll() {
    return new Promise((resolve, reject) => {
      db.find({}, (err, pantries) => {
        if (err) reject(err);
        resolve(pantries);
      });
    });
  }
  // Finds a pantry by its unique ID.
  findById(id) {
    return new Promise((resolve, reject) => {
      db.findOne({ _id: id }, (err, pantry) => {
        if (err) reject(err);
        resolve(pantry);
      });
    });
  }
  // Deletes a pantry record from the database.
  deletePantry(id) {
    return new Promise((resolve, reject) => {
      db.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) reject(err);
        resolve(numRemoved);
      });
    });
  }
}
// Create an instance of the PantryModel and initialize it.
const pantryModel = new PantryModel();
pantryModel.init();
// Export the model for use elsewhere in the application.
module.exports = pantryModel;