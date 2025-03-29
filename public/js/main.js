// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Sélection des éléments
    const filterButtons = document.querySelectorAll('[data-filter]');
    const activityItems = document.querySelectorAll('.activity-item');
    const addActivityBtns = document.querySelectorAll('.add-activity-btn');
    const saveActivityBtn = document.getElementById('saveActivityBtn');
    const deleteActivityBtn = document.getElementById('deleteActivityBtn');
    
    // Gestionnaire d'événements pour les boutons de filtre
    if (filterButtons) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                document.querySelectorAll('.day-card-container').forEach(day => {
                    if (filter === 'all') {
                        day.style.display = 'block';
                    } else if (filter === 'booked') {
                        day.style.display = day.querySelector('.day-card').classList.contains('has-booked') ? 'block' : 'none';
                    } else if (filter === 'not-booked') {
                        day.style.display = day.querySelector('.day-card').classList.contains('has-not-booked') ? 'block' : 'none';
                    }
                });
                
                // Style des boutons actifs
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // Gestionnaire d'événements pour les activités (ouverture du modal de modification)
    if (activityItems) {
        activityItems.forEach(item => {
            item.addEventListener('click', function() {
                const dayId = this.closest('[data-day-id]').getAttribute('data-day-id');
                const activityId = this.getAttribute('data-activity-id');
                
                // Rediriger vers le formulaire de modification
                window.location.href = `/activities/edit/${dayId}/${activityId}`;
            });
        });
    }
    
    // Gestionnaire d'événements pour les boutons d'ajout d'activité
    if (addActivityBtns) {
        addActivityBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const dayId = this.getAttribute('data-day-id');
                document.getElementById('dayId').value = dayId;
                
                // Réinitialiser le formulaire
                document.getElementById('activityForm').reset();
                document.getElementById('modalTitle').textContent = 'Ajouter une activité';
                
                // Cacher le bouton de suppression pour l'ajout
                if (deleteActivityBtn) {
                    deleteActivityBtn.style.display = 'none';
                }
                
                // Ouvrir le modal
                const activityModal = new bootstrap.Modal(document.getElementById('activityModal'));
                activityModal.show();
            });
        });
    }
    
    // Gestionnaire pour le formulaire d'ajout/modification d'activité
    const activityForm = document.getElementById('activityForm');
    if (activityForm) {
        activityForm.addEventListener('submit', function(e) {
            // La soumission sera gérée par le serveur
            // Ce code est juste pour la validation côté client
            const activityName = document.getElementById('activityName');
            
            if (!activityName.value.trim()) {
                e.preventDefault();
                alert('Le nom de l\'activité est requis');
            }
        });
    }
    
    // Auto-destruction des alertes après 5 secondes
    const alerts = document.querySelectorAll('.alert-dismissible');
    if (alerts) {
        alerts.forEach(alert => {
            setTimeout(() => {
                // Utiliser le framework Bootstrap pour fermer l'alerte
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }, 5000);
        });
    }
});