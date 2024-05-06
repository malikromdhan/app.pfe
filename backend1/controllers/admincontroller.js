const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
    const { Id, password } = req.body;

    try {
        const admin = await Admin.signup(Id, password);
        // Génération du token JWT
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.status(201).json({ admin, token });
        console.log("Admin créé avec succès !");
    } catch (error) {
        console.error("Erreur lors de l'inscription de l'administrateur :", error);
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    const { Id, password } = req.body;

    try {
        const admin = await Admin.login(Id, password);
        // Génération du token JWT
        const token = jwt.sign({ id: admin._id ,role: admin.role}, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ admin : { _id: admin._id, role: admin.role }, token });
        console.log("Admin connecté avec succès !");
    } catch (error) {
        console.error("Erreur lors de la connexion de l'administrateur :", error);
        res.status(401).json({ message: error.message });
    }
};

module.exports = {
    login,
    signup,
};
