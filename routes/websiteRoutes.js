const express = require('express');
const router = express.Router();
// All Controllers
const userController = require('../controllers/userController.js');
const homeController = require('../controllers/homeController.js');
const centralRepoController = require('../controllers/centralRepoController.js');
const adminController = require('../controllers/adminController.js');
const pantryController = require('../controllers/pantryController.js');
const pantryStockController = require('../controllers/pantryStockController.js');
// Middleware for authentication
const auth = require('../auth/auth');
// User Authentication Routes
router.get('/login', userController.show_login);
router.post('/login', (req, res, next) => {
    console.log('POST request received at /login');
    next();
}, userController.handle_login);
router.get('/register', userController.show_register_page);
router.post('/register', userController.post_new_user);
router.get('/logout', userController.logout);
// Home Routes
router.get('/', homeController.show_home_page);
router.get('/about', homeController.show_about_page);
router.get('/messageForm', homeController.showMessageForm);
router.post('/submitMessage', homeController.submitMessage);
// Admin Routes
router.get('/admin', auth.verifyRole(['Admin']), adminController.show_admin_dashboard);
router.get('/admin/managePantries', auth.verifyRole(['Admin']), adminController.manage_pantries);
router.get('/admin/managePantriesAndManagers', auth.verifyRole(['Admin']), adminController.show_manage_pantries_and_managers_page);
router.post('/admin/managePantriesAndManagers', auth.verifyRole(['Admin']), adminController.assign_pantry_to_manager);
router.get('/admin/managePantryManagers', auth.verifyRole(['Admin']), adminController.manage_pantry_managers);
router.get('/admin/createPantry', auth.verifyRole(['Admin']), pantryController.show_create_pantry_page);
router.post('/admin/createPantry', auth.verifyRole(['Admin']), pantryController.create_pantry);
router.get('/admin/deletePantryConfirmation', function(req, res) {
    res.render('deletePantryConfirmation', { pantryId: req.query.pantryId });
});
router.post('/admin/deletePantry', auth.verifyRole(['Admin']), adminController.deletePantry);
router.post('/admin/confirmDeletePantry', auth.verifyRole(['Admin']), adminController.confirmDeletePantry);
router.get('/admin/createPantryManager', auth.verifyRole(['Admin']), adminController.show_create_pantry_manager_page);
router.post('/admin/createPantryManager', auth.verifyRole(['Admin']), adminController.create_pantry_manager);
router.post('/admin/deletePantryManager', auth.verifyRole(['Admin']), adminController.deletePantryManager);
router.get('/admin/deletePantryManagerConfirmation', function(req, res) {
    res.render('deletePantryManagerConfirmation', { pantryManagerId: req.query.pantryManagerId });
});
router.post('/admin/confirmDeletePantryManager', auth.verifyRole(['Admin']), adminController.confirmDeletePantryManager);
router.post('/admin/changePantryManagerStatus', auth.verifyRole(['Admin']), adminController.changePantryManagerStatus);
router.get('/admin/manageGrowers', auth.verifyRole(['Admin']), adminController.manage_growers);
router.post('/admin/deleteGrower', auth.verifyRole(['Admin']), adminController.deleteGrower);
router.get('/admin/deleteGrowerConfirmation', function(req, res) {
    res.render('deleteGrowerConfirmation', { growerId: req.query.growerId });
});
router.post('/admin/confirmDeleteGrower', auth.verifyRole(['Admin']), adminController.confirmDeleteGrower);
router.post('/admin/changeGrowerStatus', auth.verifyRole(['Admin']), adminController.changeGrowerStatus);
router.get('/admin/messages', auth.verifyRole(['Admin']), adminController.show_messages);
router.get('/admin/messages/delete/:id', auth.verifyRole(['Admin']), adminController.delete_message);
// Central Repository Routes
router.get('/reserveItem/:id', auth.verifyRole(['PantryManager']), centralRepoController.reserveItem);
router.get('/addItemToRepo', auth.verifyRole(['Grower']), centralRepoController.show_add_item_page);
router.post('/addItemToRepo', auth.verifyRole(['Grower']), centralRepoController.addItemToRepo);
router.get('/centralRepo', auth.verify, centralRepoController.loadItems);
router.get('/deleteItem/:id', auth.verifyRole(['RepoManager']), centralRepoController.getDeleteConfirmation);
router.get('/deleteItemConfirmed/:id', auth.verifyRole(['RepoManager']), centralRepoController.deleteItem);
// Pantry Manager Routes
router.get('/pantryManager', auth.verifyRole(['PantryManager']), pantryStockController.loadItems);
router.post('/pantryManager/deletePantryStockItem', auth.verifyRole(['PantryManager']), pantryStockController.deletePantryStockItem);
router.get('/pantryManager/deletePantryStockItemConfirmation', function(req, res) {
    res.render('deletePantryStockItemConfirmed', { itemId: req.query.itemId });
});
router.post('/pantryManager/confirmDeletePantryStockItem', auth.verifyRole(['PantryManager']), pantryStockController.confirmDeletePantryStockItem);
// Refresh token route
router.get('/refresh-token', auth.refreshToken);
// Users list routes
router.get('/pantriesList', auth.verify, homeController.seePantriesList);
router.get('/growersList', auth.verify, homeController.seeGrowersList);
// Error handling Routes
router.use(function(req, res) {
    res.status(404);
    res.type('text/plain');
    res.send('404 Not found.');
});
router.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.type('text/plain');
    res.send('Internal Server Error.');
});
module.exports = router;