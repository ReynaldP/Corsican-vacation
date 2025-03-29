module.exports = {
    // Middleware pour vérifier si l'utilisateur est authentifié
    ensureAuthenticated: function(req, res, next) {
      if (req.session.userUid) {
        return next();
      }
      
      req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page');
      res.redirect('/auth/login');
    },
    
    // Middleware pour rediriger les utilisateurs déjà connectés
    forwardAuthenticated: function(req, res, next) {
      if (!req.session.userUid) {
        return next();
      }
      res.redirect('/dashboard');
    }
  };