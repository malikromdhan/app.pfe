const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  Id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["professor", "student"], required: true },
  uId: { type: String, required: true, unique: true },
  classe: { type: String },
  status: [{
    dates: 
    [{
        date: { type: Date}, 

        session1: {
          room1: { type: String, default: "__" },
          etats1: { type: String, default: "__" },
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now },
        },
        session2: {
          room2: { type: String, default: "__" },
          etats2: { type: String, default: "__" },
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now },
        },
        session3: {
          room3: { type: String, default: "__" },
          etats3: { type: String, default: "__" },
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now },
        },
        session4: {
          room4: { type: String, default: "__" },
          etats4: { type: String, default: "__" },
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now },
        },
      },
    ]
  }],
});

// Fonction de hachage du mot de passe avant de sauvegarder l'utilisateur
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});
// Méthode statique pour l'authentification de l'utilisateur
userSchema.statics.authenticate = async function (Id, password) {
  try {
    // Recherche de l'utilisateur par ID personnel
    const user = await this.findOne({ Id });
    if (!user) {
      throw new Error("Utilisateur non trouvé.");
    }

    // Vérification du mot de passe
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new Error("Mot de passe incorrect.");
    }

    // Si l'authentification réussit, retournez l'utilisateur authentifié
    return user;
  } catch (error) {
    throw new Error("Échec de l'authentification: " + error.message);
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
