const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
require('dotenv').config();

// Initialiser l'application Express
const app = express();

// Configuration de Handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour les données de formulaire
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware pour les méthodes HTTP (PUT, DELETE)
app.use(methodOverride('_method'));

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Flash messages
app.use(flash());

// Variables globales pour les messages flash
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/activities', require('./routes/activities'));

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Page non trouvée'
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});