const express = require('express');
const router = express.Router();

// Importez les contrôleurs nécessaires
const userController = require('../controllers/userController.');

const adminController = require('../controllers/adminController'); 


// Routes pour les utilisateurs
router.post('/users', userController.createUser);// route pour criée un user

router.post('/users/login', userController.login); // Route pour la connexion des utilisateurs

router.get('/users', userController.getUsers);

// Route pour récupérer un utilisateur par son id *******
router.get('/users/:Id', userController.getUserById);

router.put('/users/:Id', userController.updateUser);
router.delete('/users/:Id', userController.deleteUser);
 
// pour statuts d'user:
// route pour ajouter une statuts à l'user 
router.post('/users/:Id/status', userController.addOrUpdateStatusDate);// carte RFID 
// route poure mofifier la statuts du'user 
router.put ('/users/:Id/status', userController.updateStatus); //dashboard prof 


// Routes pour l'administration//
router.post('/admin/signup', adminController.signup); 
router.post('/admin/login', adminController.login); 

// Exportez les routes
module.exports = router;
