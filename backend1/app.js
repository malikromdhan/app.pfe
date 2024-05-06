const express = require('express');
const db = require('./database/database');
require('dotenv').config();
const routes = require('./routes/router');

const app = express();
const port = 3001;

const cors = require('cors');





// Utiliser CORS middleware
app.use(cors());


app.use(express.json()); // Utilisation de express.json() pour le parsing du corps JSON

// Middleware personnalisé pour vérifier les requêtes vides
app.use((req, res, next) => {
  // Vérifier si le corps de la requête est vide
  if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
    // Si le corps de la requête est vide, ajouter un objet vide
    req.body = {};
  }
  next();
});

// Utilisation des contrôleurs dans les routes
app.use('/api', routes); // Assurez-vous que les routes ont accès aux contrôleurs




const PORT = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
