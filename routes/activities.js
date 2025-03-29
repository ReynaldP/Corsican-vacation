const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const { db } = require('../config/firebase');



// Ajouter une activité
router.post('/add', ensureAuthenticated, async (req, res) => {
  try {
    const { dayId, name, time, price, link, notes, booked, tags } = req.body;
    
    // Validation des données
    if (!dayId || !name) {
      req.flash('error_msg', 'Le jour et le nom de l\'activité sont requis');
      return res.redirect('/dashboard');
    }
    
    console.log("Ajout d'activité pour le jour:", dayId); // Ajoutez cette ligne pour déboguer
    
    // Préparer l'objet d'activité
    const activityData = {
      name,
      time: time || '',
      price: parseFloat(price) || 0,
      link: link || '',
      notes: notes || '',
      booked: booked === 'on',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };
    
    // Ajouter l'activité à Firebase - utilisez l'index numérique ici
    const dayIndex = parseInt(dayId.replace('jour', '')) - 1; // Si dayId est "jour1", cela donne 0
    // Si dayId est déjà un nombre, utilisez-le directement
    const finalDayIndex = isNaN(dayIndex) ? dayId : dayIndex;
    
    const newActivityRef = db.ref(`trip/days/${finalDayIndex}/activities`).push();
    await newActivityRef.set(activityData);
    
    // Mettre à jour le budget
    await updateTripBudget();
    
    req.flash('success_msg', 'Activité ajoutée avec succès');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'activité:', error);
    req.flash('error_msg', 'Erreur lors de l\'ajout de l\'activité');
    res.redirect('/dashboard');
  }
});

// Routes pour modifier une activité
router.put('/update/:dayId/:activityId', ensureAuthenticated, async (req, res) => {
  try {
    const { dayId, activityId } = req.params;
    const { name, time, price, link, notes, booked, tags } = req.body;
    
    // Transformation de l'ID du jour si nécessaire
    const dayIndex = isNaN(parseInt(dayId)) ? parseInt(dayId.replace('jour', '')) - 1 : parseInt(dayId);
    
    // Mise à jour de l'activité
    await db.ref(`trip/days/${dayIndex}/activities/${activityId}`).update({
      name,
      time: time || '',
      price: parseFloat(price) || 0,
      link: link || '',
      notes: notes || '',
      booked: booked === 'on',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });
    
    // Mise à jour du budget
    await updateTripBudget();
    
    req.flash('success_msg', 'Activité mise à jour avec succès');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    req.flash('error_msg', 'Erreur lors de la mise à jour');
    res.redirect('/dashboard');
  }
});

// Route pour supprimer une activité
router.delete('/delete/:dayId/:activityId', ensureAuthenticated, async (req, res) => {
  try {
    const { dayId, activityId } = req.params;
    
    // Transformation de l'ID du jour si nécessaire
    const dayIndex = isNaN(parseInt(dayId)) ? parseInt(dayId.replace('jour', '')) - 1 : parseInt(dayId);
    
    // Suppression de l'activité
    await db.ref(`trip/days/${dayIndex}/activities/${activityId}`).remove();
    
    // Mise à jour du budget
    await updateTripBudget();
    
    req.flash('success_msg', 'Activité supprimée avec succès');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    req.flash('error_msg', 'Erreur lors de la suppression');
    res.redirect('/dashboard');
  }
});

// Route pour afficher le formulaire d'édition
// Route pour afficher le formulaire d'édition
router.get('/edit/:dayId/:activityId', ensureAuthenticated, async (req, res) => {
  try {
    const { dayId, activityId } = req.params;
    
    console.log("Paramètres reçus - dayId:", dayId, "activityId:", activityId);
    
    // Récupérer d'abord toutes les données du voyage
    const tripSnapshot = await db.ref('trip').once('value');
    const tripData = tripSnapshot.val();
    
    console.log("Structure des données:", JSON.stringify(tripData, null, 2));
    
    if (!tripData || !tripData.days) {
      req.flash('error_msg', 'Données du voyage introuvables');
      return res.redirect('/dashboard');
    }
    
    // Log détaillé des jours
    if (Array.isArray(tripData.days)) {
      console.log("days est un tableau de longueur:", tripData.days.length);
    } else {
      console.log("days est un objet avec les clés:", Object.keys(tripData.days));
    }
    
    // Trouver le jour, qu'il soit dans un tableau ou un objet
    let day;
    let dayKey = dayId;
    
    if (Array.isArray(tripData.days)) {
      // Si days est un tableau, utiliser l'index
      dayKey = parseInt(dayId);
      day = tripData.days[dayKey];
      console.log(`Recherche du jour à l'index ${dayKey} dans le tableau:`, day ? "trouvé" : "non trouvé");
    } else {
      // Si days est un objet, chercher par clé
      day = tripData.days[dayId];
      console.log(`Recherche du jour avec la clé ${dayId} dans l'objet:`, day ? "trouvé" : "non trouvé");
    }
    
    // Si le jour n'est pas trouvé avec l'ID fourni, essayons d'autres approches
    if (!day) {
      console.log("Jour non trouvé, essayons d'autres approches...");
      
      // Essayer avec un index numérique si l'ID est une chaîne comme "jour1"
      if (dayId.startsWith('jour')) {
        const index = parseInt(dayId.replace('jour', '')) - 1;
        if (Array.isArray(tripData.days) && index >= 0 && index < tripData.days.length) {
          dayKey = index;
          day = tripData.days[index];
          console.log(`Jour trouvé à l'index ${index} en utilisant l'ID formaté`);
        }
      }
      
      // Si toujours pas trouvé, essayons de parcourir tous les jours
      if (!day) {
        console.log("Parcours de tous les jours pour trouver une correspondance...");
        let found = false;
        
        if (Array.isArray(tripData.days)) {
          for (let i = 0; i < tripData.days.length; i++) {
            console.log(`Vérification du jour ${i}, ID:`, tripData.days[i].id);
            if (tripData.days[i].id === dayId) {
              dayKey = i;
              day = tripData.days[i];
              found = true;
              console.log(`Jour trouvé à l'index ${i} avec ID correspondant`);
              break;
            }
          }
        } else {
          for (const key in tripData.days) {
            console.log(`Vérification du jour ${key}, ID:`, tripData.days[key].id);
            if (tripData.days[key].id === dayId) {
              dayKey = key;
              day = tripData.days[key];
              found = true;
              console.log(`Jour trouvé avec la clé ${key} avec ID correspondant`);
              break;
            }
          }
        }
        
        if (!found) {
          console.log("Aucun jour ne correspond à l'ID fourni après une recherche exhaustive");
        }
      }
    }
    
    if (!day) {
      console.log("Jour introuvable après toutes les tentatives");
      req.flash('error_msg', 'Jour introuvable');
      return res.redirect('/dashboard');
    }
    
    // Afficher les activités disponibles
    console.log("Activités disponibles dans ce jour:", day.activities ? Object.keys(day.activities) : "aucune");
    
    if (!day.activities || !day.activities[activityId]) {
      console.log(`Activité ${activityId} introuvable dans le jour ${dayKey}`);
      
      // Essayons de trouver l'activité par un parcours exhaustif
      let foundActivity = null;
      let foundActivityId = null;
      
      if (day.activities) {
        for (const key in day.activities) {
          console.log(`Vérification de l'activité ${key}:`, day.activities[key].name);
          // On pourrait ajouter une logique pour trouver une correspondance approximative
        }
      }
      
      if (!foundActivity) {
        req.flash('error_msg', 'Activité introuvable');
        return res.redirect('/dashboard');
      }
      
      activityData = foundActivity;
      activityId = foundActivityId;
    } else {
      const activityData = day.activities[activityId];
      console.log("Activité trouvée:", activityData.name);
      
      // Formater les tags pour l'affichage
      const tagsString = activityData.tags ? activityData.tags.join(', ') : '';
      
      res.render('edit-activity', {
        title: 'Modifier une activité',
        dayId: dayKey,
        activity: {
          id: activityId,
          ...activityData,
          tagsString
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    req.flash('error_msg', 'Erreur lors de la récupération des données');
    res.redirect('/dashboard');
  }
});

// Fonction pour mettre à jour le budget total
async function updateTripBudget() {
  try {
    // Récupérer toutes les activités
    const daysSnapshot = await db.ref('trip/days').once('value');
    const days = daysSnapshot.val();
    let totalSpent = 0;
    
    // Calculer le budget total
    if (days) {
      Object.values(days).forEach(day => {
        if (day.activities) {
          Object.values(day.activities).forEach(activity => {
            if (activity.price) {
              totalSpent += parseFloat(activity.price);
            }
          });
        }
      });
    }
    
    // Mettre à jour le budget dans Firebase
    await db.ref('trip/budget').update({ spent: totalSpent });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du budget:', error);
    throw error;
  }
}

module.exports = router;