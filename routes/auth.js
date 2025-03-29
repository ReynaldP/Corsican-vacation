const express = require('express');
const router = express.Router();
const { auth } = require('../config/firebase-client');
const { signInWithEmailAndPassword } = require('firebase/auth');
const { forwardAuthenticated } = require('../middleware/auth');

// Page de connexion
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('login', {
    title: 'Connexion'
  });
});

// Processus de connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Authentification via Firebase client SDK
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Stocker les informations utilisateur dans la session
    req.session.userUid = user.uid;
    req.session.userEmail = user.email;
    
    req.flash('success_msg', 'Vous êtes connecté');
    res.redirect('/dashboard');
  } catch (error) {
    let errorMessage = 'Erreur d\'authentification';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Adresse email invalide';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = 'Email ou mot de passe incorrect';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Trop de tentatives de connexion, veuillez réessayer plus tard';
        break;
      default:
        errorMessage = `Erreur d'authentification: ${error.message}`;
    }
    
    req.flash('error_msg', errorMessage);
    res.redirect('/auth/login');
  }
});

// Déconnexion
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion:', err);
      return res.redirect('/dashboard');
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;