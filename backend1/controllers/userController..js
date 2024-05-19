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

const updateStatus = async (req, res) => {
  try {
    const { Id, date, session1, session2, session3, session4 } = req.body;

    // Trouver l'utilisateur dans la base de données
    const user = await User.findOne({ Id });

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    let dateExists = false;
    let existingDate;
    
    // Parcourir tous les objets status pour trouver la date
    user.status.forEach(statusObj => {
      const foundDate = statusObj.dates.find(entry => entry.date.toISOString() === new Date(date).toISOString());
      if (foundDate) {
        dateExists = true;
        existingDate = foundDate;
      }
    });

    // Si la date n'existe pas, renvoyer un message d'erreur
    if (!dateExists) {
      return res.status(404).json({ message: "La date spécifiée n'existe pas" });
    }

    // Mettre à jour les sessions si la date existe
    if (session1) {
      existingDate.session1.room1 = session1.room1 || existingDate.session1.room1;
      existingDate.session1.etats1 = session1.etats1 || existingDate.session1.etats1;
    }

    if (session2) {
      existingDate.session2.room2 = session2.room2 || existingDate.session2.room2;
      existingDate.session2.etats2 = session2.etats2 || existingDate.session2.etats2;
    }

    if (session3) {
      existingDate.session3.room3 = session3.room3 || existingDate.session3.room3;
      existingDate.session3.etats3 = session3.etats3 || existingDate.session3.etats3;
    }

    if (session4) {
      existingDate.session4.room4 = session4.room4 || existingDate.session4.room4;
      existingDate.session4.etats4 = session4.etats4 || existingDate.session4.etats4;
    }

    // Sauvegarder les modifications de l'utilisateur
    const updatedUser = await user.save();

    // Répondre avec l'utilisateur mis à jour
    res.status(200).json(updatedUser);

  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: error.message });
  }
};


// fonction pour ajouter statuts a un utilisateur


const addOrUpdateStatusDate = async (req, res) => {
  const { uId, date, session1, session2, session3, session4 } = req.body;

  try {
    // Recherche de l'utilisateur par uId
    let user = await User.findOne({ uId });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    let dateExists = false;
    // Vérification si la date existe déjà dans le tableau dates
    user.status.forEach(statusObj => {
      statusObj.dates.forEach(existingDate => {
        console.log("Existing Date:", existingDate.date.toISOString());
        console.log("Provided Date:", new Date(date).toISOString());
        if (existingDate.date.toISOString() === new Date(date).toISOString()) {
          // La date existe déjà, mise à jour des sessions
          dateExists = true;
          console.log("Date trouvée ! Mise à jour des sessions.");
          existingDate.session1 = session1 || existingDate.session1;
          existingDate.session2 = session2 || existingDate.session2;
          existingDate.session3 = session3 || existingDate.session3;
          existingDate.session4 = session4 || existingDate.session4;
        }
      });
    });

    // Si la date n'existe pas, créer un nouvel objet dates
    if (!dateExists) {
      const newDate = {
        date: new Date(date).toISOString(),
        session1: session1 || {},
        session2: session2 || {},
        session3: session3 || {},
        session4: session4 || {}
      };
      user.status.push({ dates: [newDate] });
      console.log("Date non trouvée. Création d'un nouvel objet dates.");
      console.log( "donner recu avec la requette :",newDate , uId);
    }

    // Enregistrement des modifications
    user = await user.save();

    res.status(200).json({ message: "Date de statut ajoutée ou mise à jour avec succès." });
  
  } catch (error) {
    res.status(500).json({ message: "Une erreur s'est produite lors de l'ajout ou de la mise à jour de la date de statut.", error: error.message });
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
  addOrUpdateStatusDate
};
