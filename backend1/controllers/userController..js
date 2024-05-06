// userController.js

const jwt = require('jsonwebtoken');

const User = require("../models/user");
const mongoose = require('mongoose');

const createUser = async (req, res) => {
  try {
    // Vérifier si un utilisateur avec le même Id existe déjà
    const existingUser = await User.findOne({ Id: req.body.Id });
    if (existingUser) {
      return res.status(400).json({ message: "Un utilisateur avec cet ID existe déjà." });
    }

    // Créer un nouvel utilisateur
    const newUser = await User.create({
      Id: req.body.Id,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
      uId: req.body.uId,
      classe:req.body.classe,
      status: req.body.status ,// Assurez-vous que req.body.status contient les données des sessions et des états
      
    });

    // Enregistrer l'utilisateur dans la base de données
    const createdUser = await newUser.save();

    // Répondre avec le nouvel utilisateur créé
    console.log("Utilisateur créé avec succès :", createdUser);
    res.status(201).json(createdUser);
  } catch (error) {
    // Gérer les erreurs de validation ou d'autres erreurs
    console.log("Il y a une erreur :", error);
    res.status(400).json({ message: error.message });
  }
};

// fonction login user

const login = async (req, res) => {
  const { Id, password } = req.body;

  try {
    const user = await User.authenticate(Id, password); // Utilisez la méthode authenticate du modèle User pour vérifier les informations d'identification
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Récupérer le rôle de l'utilisateur à partir de la base de données
    const role = user.role; // Assurez-vous que votre modèle User a une propriété "role"

    // Génération du token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // Envoyer une réponse avec les détails de l'utilisateur et le jeton JWT
    res.status(200).json({ user: { _id: user._id, username: user.username, role: user.role }, token });
    console.log("Utilisateur connecté avec succès !");
  } catch (error) {
    console.error("Erreur lors de la connexion de l'utilisateur :", error);
    res.status(401).json({ message: error.message });
  }
};


// Fonction pour récupérer tous les utilisateurs (professeurs ou étudiants)
const getUsers = async (req, res) => {
  try {
    // Vérifier si le corps de la requête est vide
   // if (!req.body || Object.keys(req.body).length === 0) {
     // return res.status(400).json({ message: "Le corps de la requête est vide." });
    //}

    // Parser le corps de la requête JSON
    const users = await User.find();
    res.status(200).json(users);
    console.log("Tous les utilisateurs dans la base de données ont été affichés.");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUserById = async (req, res) => {
  try {
    const Id = req.body.Id; // Utilisez Id pour correspondre au nom du paramètre d'URL dans votre route

    const user = await User.findOne({ Id }); // Utilisez findOne pour rechercher par Id
     console.log("ID reçu :", Id); // Ajoutez ce log pour vérifier la valeur de l'ID

   // if (!user) {
      //return res.status(404).json({ message: "Utilisateur non trouvé" });
   // }

    res.status(200).json(user);
    console.log("Utilisateur trouvé :", user);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error("Erreur lors de la recherche de l'utilisateur :", error);
  }
};



const updateUser = async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur à mettre à jour depuis les paramètres de la requête
    const Id = req .params.Id ;

    // Récupérer les nouvelles données de l'utilisateur depuis le corps de la requête
    const { email, username, password, role, uId, classe,  } = req.body;
   


    // Utiliser findOneAndUpdate pour mettre à jour l'utilisateur
    const updatedUser = await User.findOneAndUpdate(
      { Id },
      { email, username, password, role, uId ,classe},
      { new: true }
    );
    console.log("ID reçu :", Id); 

    // Vérifier si l'utilisateur a été trouvé et mis à jour avec succès
    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Répondre avec l'utilisateur mis à jour
    res.status(200).json(updatedUser);
    console.log("user modifier")
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour supprimer un utilisateur (professeur ou étudiant)
const deleteUser = async (req, res) => {
  try {
    const Id = req.body.Id; // Récupérer l'ID de l'utilisateur à supprimer
    const deletedUser = await User.findOneAndDelete({ Id });

    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé12" });
    }

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






//fonction pour modifier la statuts d'user 
const updateStatus = async (req, res) => {
  try {
    const Id = req.body.Id;
    const { status } = req.body;

    // Récupérer les données des sessions à partir de la requête
    const { session1, session2, session3, session4 } = status;

    // Trouver l'utilisateur dans la base de données
    const user = await User.findOne({ Id });
    console.log("ID reçu :", Id); 
    console.log('status recu :',status)

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mettre à jour les données de chaque session si elles existent dans la requête
    if (session1) {
      user.status.session1.room1 = session1.room1 || user.status.session1.room1;
      user.status.session1.etats1 = session1.etats1 || user.status.session1.etats1;
    }

    if (session2) {
      user.status.session2.room2 = session2.room2 || user.status.session2.room2;
      user.status.session2.etats2 = session2.etats2 || user.status.session2.etats2;
    }

    if (session3) {
      user.status.session3.room3 = session3.room3 || user.status.session3.room3;
      user.status.session3.etats3 = session3.etats3 || user.status.session3.etats3;
    }

    if (session4) {
      user.status.session4.room4 = session4.room4 || user.status.session4.room4;
      user.status.session4.etats4 = session4.etats4 || user.status.session4.etats4;
    }

    // Sauvegarder les modifications de l'utilisateur
    const updatedUser = await user.save();


    // Répondre avec l'utilisateur mis à jour
    res.status(200).json(updatedUser);
   
    console.log("la statuts modifier avec succsé")
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: error.message });
  }
};


// fonction pour ajouter statuts a un utilisateur
const addStatus = async (req, res) => {
  try {
    const uId = req.body.uId;
    const { session, room, etats } = req.body;

    // Recherche de l'utilisateur dans la base de données
    const user = await User.findOne({ uId: uId });

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si la session spécifiée existe dans le schéma
    if (!user.status[`session${session}`]) {
      return res.status(400).json({ message: `Session ${session} n'existe pas` });
    }

    // Mettre à jour la salle et l'état de la session spécifiée
    user.status[`session${session}`][`room${session}`] = room;
    user.status[`session${session}`][`etats${session}`] = etats;

    // Sauvegarder les modifications de l'utilisateur
    await user.save();

    // Répondre avec l'utilisateur mis à jour
    res.status(200).json({ message: "Statut ajouté avec succès", user });
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: error.message });
  }
};




 


// Exportation des fonctions

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  updateStatus,
  addStatus
};
