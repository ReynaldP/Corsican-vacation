const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const { db } = require('../config/firebase');

// Ajouter l'année courante pour le footer
router.use((req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();
  next();
});

// Page d'accueil
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Bienvenue'
  });
});

// Tableau de bord
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    // Récupérer les données du voyage depuis Firebase
    const tripRef = db.ref('trip');
    const snapshot = await tripRef.once('value');
    let tripData = snapshot.val();
    
    // Si aucune donnée n'existe, créer des données initiales
    if (!tripData) {
      tripData = createInitialData();
      await tripRef.set(tripData);
    }
    
    // Transformer les données pour qu'elles fonctionnent avec Handlebars
    // Si days est un objet avec des clés numériques, convertissez-le en tableau
    if (tripData.days && !Array.isArray(tripData.days)) {
      const daysArray = [];
      Object.keys(tripData.days).forEach(key => {
        const day = tripData.days[key];
        // Ajouter l'index comme ID si nécessaire
        day.id = day.id || key;
        daysArray.push(day);
      });
      tripData.days = daysArray;
    }
    
    // Préparer les données pour chaque jour
    tripData.days.forEach(day => {
      day.hasBookedActivities = false;
      day.hasNotBookedActivities = false;
      
      if (day.activities) {
        Object.keys(day.activities).forEach(activityId => {
          const activity = day.activities[activityId];
          if (activity.booked) {
            day.hasBookedActivities = true;
          } else {
            day.hasNotBookedActivities = true;
          }
        });
      }
    });
    
    // Calculer le pourcentage du budget
    const budgetPercentage = (tripData.budget.spent / tripData.budget.total) * 100;
    
    res.render('dashboard', {
      title: 'Tableau de bord',
      userData: {
        email: req.session.userEmail
      },
      tripData: tripData,
      budgetPercentage: budgetPercentage,
      budgetWarning: budgetPercentage > 75 && budgetPercentage <= 100,
      budgetOverflow: budgetPercentage > 100
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    req.flash('error_msg', 'Erreur lors du chargement des données');
    res.render('dashboard', {
      title: 'Tableau de bord',
      error: true
    });
  }
});

// Fonction pour créer des données initiales
function createInitialData() {
  return {
    days: [
      {
        id: "jour1",
        date: "10/06",
        title: "Arrivée à Porto-Vecchio",
        activities: {}
      },
      {
        id: "jour2",
        date: "11/06",
        title: "Aiguilles de Bavella & Piscines du Cavu",
        activities: {}
      },
      {
        id: "jour3",
        date: "12/06",
        title: "Bonifacio",
        activities: {}
      },
      {
        id: "jour4",
        date: "13/06",
        title: "Plages de Palombaggia",
        activities: {}
      },
      {
        id: "jour5",
        date: "14/06",
        title: "Réserve naturelle de Scandola",
        activities: {}
      },
      {
        id: "jour6",
        date: "15/06",
        title: "Corte & Vallée de la Restonica",
        activities: {}
      },
      {
        id: "jour7",
        date: "16/06",
        title: "Calvi",
        activities: {}
      },
      {
        id: "jour8",
        date: "17/06",
        title: "Cap Corse",
        activities: {}
      },
      {
        id: "jour9",
        date: "18/06",
        title: "Ajaccio",
        activities: {}
      },
      {
        id: "jour10",
        date: "19/06",
        title: "Départ",
        activities: {}
      }
    ],
    budget: {
      total: 2000,
      spent: 0
    }
  };
}

module.exports = router;