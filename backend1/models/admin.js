const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const adminSchema = new mongoose.Schema({
    Id: { type: Number, required: true, unique: true }, // ID personnel unique de l'administrateur
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }
});

// Fonction de hachage du mot de passe avant de sauvegarder l'administrateur
adminSchema.pre('save', async function (next) {
    const admin = this;
    if (!admin.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password, salt);
        admin.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Fonction pour créer un nouvel administrateur
adminSchema.statics.signup = async function (Id, password) {
    try {
        const existingAdmin = await this.findOne({ Id });
        if (existingAdmin) {
            throw new Error('Un administrateur avec le même ID existe déjà');
        }
        const admin = new this({ Id, password });
        await admin.save();
        return admin;
    } catch (error) {
        throw error;
    }
};

// Fonction pour connecter un administrateur
adminSchema.statics.login = async function (Id, password) {
    try {
        const admin = await this.findOne({ Id });
        if (!admin) {
            throw new Error('Identifiant personnel incorrect');
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            throw new Error('Mot de passe incorrect');
        }
        return admin;
    } catch (error) {
        throw error;
    }
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
