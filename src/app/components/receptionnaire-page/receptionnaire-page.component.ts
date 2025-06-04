import { Component, OnInit } from '@angular/core';
import { ReceptionnairePageService } from 'src/app/services/receptionnaire-page.service';
import { Chart, ChartData, ChartType, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-receptionnaire-page',
  templateUrl: './receptionnaire-page.component.html',
  styleUrls: ['./receptionnaire-page.component.css']
})
export class ReceptionnairePageComponent implements OnInit {
  allTypeProduits: any[] = [];
  allProduits: any[] = [];
  allCommandes: any[] = [];
  calendarEvents: any[] = [];
  allLivraisons: any[] = []; // Nouvelle propriété pour les livraisons

  typeProduitsChart: Chart | null = null;
  produitsChart: Chart | null = null;
  commandesChart: Chart | null = null;
  livraisonsChart: Chart | null = null;

  constructor(private receptionnaireService: ReceptionnairePageService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  async loadAllData(): Promise<void> {
    try {
      await Promise.all([
        this.loadTypeProduits(),
        this.loadProduits(),
        this.loadCommandes(),
        this.loadCalendarEvents(),
        this.loadLivraisons() // Ajout du chargement des livraisons
      ]);
      
      // Attendre un peu pour s'assurer que les données sont bien chargées
      setTimeout(() => {
        this.createOrUpdateCharts();
      }, 500);
    } catch (error) {
      console.error('Erreur lors du chargement des données', error);
    }
  }

  loadTypeProduits(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.receptionnaireService.getAllTypeProduits().subscribe({
        next: (data) => {
          this.allTypeProduits = data || [];
          console.log('Type produits chargés:', this.allTypeProduits);
          resolve();
        },
        error: (error) => reject(error)
      });
    });
  }

  loadProduits(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.receptionnaireService.getAllProduits().subscribe({
        next: (data) => {
          this.allProduits = data || [];
          console.log('Produits chargés:', this.allProduits);
          resolve();
        },
        error: (error) => reject(error)
      });
    });
  }

  loadCommandes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.receptionnaireService.getAllCommandes().subscribe({
        next: (data) => {
          this.allCommandes = data || [];
          console.log('Commandes chargées:', this.allCommandes);
          console.log('Première commande:', this.allCommandes[0]);
          resolve();
        },
        error: (error) => reject(error)
      });
    });
  }

  loadCalendarEvents(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.receptionnaireService.getCalendarEvents().subscribe({
        next: (data) => {
          this.calendarEvents = data || [];
          console.log('Événements calendrier chargés:', this.calendarEvents);
          resolve();
        },
        error: (error) => {
          console.error('Error loading calendar events:', error);
          reject(error);
        }
      });
    });
  }

  // Nouvelle méthode pour charger les livraisons
  loadLivraisons(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.receptionnaireService.getAllLivraisons().subscribe({
        next: (data) => {
          this.allLivraisons = data || [];
          console.log('Livraisons chargées:', this.allLivraisons);
          resolve();
        },
        error: (error) => {
          console.error('Error loading livraisons:', error);
          // Ne pas rejeter pour éviter de casser le chargement des autres données
          // Utiliser les données du calendrier comme fallback
          console.log('Utilisation du calendrier comme fallback pour les livraisons');
          resolve();
        }
      });
    });
  }

  prepareTypeProduitsData(): ChartData<'pie'> {
    const typeCount: { [key: string]: number } = {};
    let totalProducts = 0;
  
    this.allTypeProduits.forEach((type: any) => {
      const productCount = type.produits?.length || 0;
      if (productCount > 0) {
        typeCount[type.name] = productCount;
        totalProducts += productCount;
      }
    });
  
    const labels = Object.keys(typeCount);
    const data = labels.map(type => typeCount[type]);
  
    return {
      labels,
      datasets: [{
        label: 'Répartition des types de produits',
        data,
        backgroundColor: this.generateColors(labels.length),
        borderWidth: 1
      }]
    };
  }
  
  createOrUpdateChart(canvasId: string, chartType: ChartType, data: ChartData, existingChart: Chart | null): Chart {
    const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) {
      console.error(`Canvas with id ${canvasId} not found`);
      throw new Error(`Canvas with id ${canvasId} not found`);
    }
  
    if (existingChart) {
      existingChart.data = data;
      existingChart.update();
      return existingChart;
    }
  
    return new Chart(ctx, {
      type: chartType,
      data,
      options: {
        responsive: true,
        plugins: {
          datalabels: {
            color: '#000',
            font: { weight: 'bold' },
            formatter: (value: number) => value
          },
          legend: { display: true, position: 'bottom' },
          tooltip: { enabled: true }
        }
      }
    });
  }
  
  prepareProduitsData(): ChartData<'bar'> {
    const dataLength = this.allProduits.length;
    console.log('Nombre de produits pour le graphique:', dataLength);
    
    return {
      labels: ['Produits'],
      datasets: [{
        label: 'Nombre de Produits',
        data: [dataLength],
        backgroundColor: this.generateColors(1),
        borderWidth: 1
      }]
    };
  }
  
  // Méthode modifiée pour les commandes - ne compte que les commandes planifiées
  prepareCommandesData(): ChartData<'bar'> {
    let commandesPlanifiees = 0;
    
    console.log('Analyse des commandes:', this.allCommandes);
    
    this.allCommandes.forEach((order, index) => {
      console.log(`Commande ${index}:`, order);
      
      // Essayer différentes propriétés pour le statut
      const status = order.status || order.etat || order.state || order.statutCommande || order.statut || '';
      const statusStr = status.toString().toUpperCase().trim();
      
      console.log(`Commande ${index} - Statut original:`, status, '-> Statut nettoyé:', statusStr);
      
      // Compter seulement les commandes planifiées
      if (statusStr === 'PLANIFIEE' || statusStr === 'PLANIFIÉE' || 
          statusStr === 'PLANNIFIER' || statusStr === 'PLANNED') {
        commandesPlanifiees++;
        console.log('Commande planifiée trouvée:', order);
      }
    });
    
    console.log('Résultat final - Planifiées:', commandesPlanifiees);
    
    return {
      labels: ['Planifiées'],
      datasets: [{
        label: 'Commandes',
        data: [commandesPlanifiees],
        backgroundColor: [
          'rgba(247, 183, 51, 0.8)'   // jaune pour planifiées
        ],
        borderWidth: 1
      }]
    };
  }

  // Méthode alternative pour compter toutes les commandes actives
  prepareCommandesDataTotal(): ChartData<'bar'> {
    let totalCommandesActives = 0;

    this.allCommandes.forEach((order, index) => {
      const status = order.status || order.etat || order.state || order.statutCommande || order.statut || '';
      const statusStr = status.toString().toUpperCase().trim();
      
      console.log(`Commande ${index} - Statut:`, statusStr);
      
      // Compter toutes les commandes qui ne sont pas terminées/livrées/annulées
      if (statusStr !== 'LIVRE' && statusStr !== 'LIVREE' && statusStr !== 'DELIVERED' && 
          statusStr !== 'TERMINE' && statusStr !== 'TERMINEE' && statusStr !== 'FINISHED' &&
          statusStr !== 'ANNULE' && statusStr !== 'ANNULEE' && statusStr !== 'CANCELLED') {
        totalCommandesActives++;
        console.log('Commande active trouvée:', order);
      }
    });
    
    console.log('Total commandes actives:', totalCommandesActives);
    
    return {
      labels: ['Commandes actives'],
      datasets: [{
        label: 'Commandes actives',
        data: [totalCommandesActives],
        backgroundColor: this.generateColors(1),
        borderWidth: 1
      }]
    };
  }

  // Méthode corrigée pour analyser les livraisons à partir de la base de données
  prepareLivraisonsData(): ChartData<'bar'> {
    let livraisonsEnAttente = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    console.log('=== ANALYSE DES LIVRAISONS EN ATTENTE ===');
    console.log('Date actuelle:', currentDate);
    
    // Utiliser d'abord les données de livraisons si disponibles
    if (this.allLivraisons && this.allLivraisons.length > 0) {
      console.log('Utilisation des données de livraisons de la base de données');
      console.log('Nombre total de livraisons:', this.allLivraisons.length);
      console.log('Toutes les livraisons:', this.allLivraisons);

      this.allLivraisons.forEach((livraison, index) => {
        console.log(`\n--- Livraison ${index} ---`);
        console.log('Livraison complète:', livraison);
        
        // Analyser la date de livraison
        const rawDate = livraison.dateLivraison || livraison.date || livraison.dateEvent;
        console.log('Date brute:', rawDate);
        
        let livraisonDate: Date;
        
        if (rawDate) {
          if (typeof rawDate === 'string') {
            // Handle different date formats
            if (rawDate.includes('/')) {
              const [day, month, year] = rawDate.split('/').map(Number);
              livraisonDate = new Date(year, month - 1, day);
            } else if (rawDate.includes('-')) {
              livraisonDate = new Date(rawDate);
            } else {
              livraisonDate = new Date(rawDate);
            }
          } else {
            livraisonDate = new Date(rawDate);
          }
        } else {
          // Si pas de date, considérer comme future
          livraisonDate = new Date();
          livraisonDate.setDate(livraisonDate.getDate() + 1);
        }
        
        console.log('Date analysée:', livraisonDate);

        // Analyser le statut
        const status = livraison.statut || livraison.status || livraison.etat || '';
        const statusStr = status.toString().toUpperCase().trim();
        
        console.log('Statut original:', status);
        console.log('Statut nettoyé:', statusStr);
        
        const dateComparison = livraisonDate >= currentDate;
        console.log('Date future/actuelle?', dateComparison);

        // Chercher spécifiquement le statut "EN_ATTENTE"
        const isEnAttente = statusStr === 'EN_ATTENTE' || statusStr === 'EN ATTENTE' || 
                           statusStr === 'PENDING' || statusStr === 'WAITING' ||
                           statusStr === 'ATTENTE' || statusStr === 'EN-ATTENTE';
        
        console.log('Statut en attente?', isEnAttente);

        // Compter seulement les livraisons futures/actuelles ET en attente
        if (dateComparison && isEnAttente) {
          livraisonsEnAttente++;
          console.log('✓ Livraison en attente comptée!');
        } else {
          console.log('✗ Livraison non comptée - Date:', dateComparison, 'Statut en attente:', isEnAttente);
        }
      });
    } else {
      // Fallback: utiliser les événements du calendrier
      console.log('Utilisation du calendrier comme source de données (fallback)');
      console.log('Nombre total d\'événements:', this.calendarEvents.length);
      console.log('Tous les événements:', this.calendarEvents);

      this.calendarEvents.forEach((event, index) => {
        console.log(`\n--- Événement ${index} ---`);
        console.log('Événement complet:', event);
        console.log('Propriétés disponibles:', Object.keys(event));
        
        // Vérifier si c'est une livraison avec plusieurs critères
        const title = event.title || event.name || event.description || event.nom || '';
        const type = event.type || event.category || event.categorie || '';
        const eventType = event.eventType || event.typeEvenement || '';
        
        console.log('Titre:', title);
        console.log('Type:', type);
        console.log('EventType:', eventType);
        
        const isLivraison = title.toLowerCase().includes('livraison') || 
                           title.toLowerCase().includes('delivery') ||
                           title.toLowerCase().includes('livre') ||
                           type.toLowerCase().includes('livraison') ||
                           type.toLowerCase().includes('delivery') ||
                           eventType.toLowerCase().includes('livraison') ||
                           eventType.toLowerCase().includes('delivery');
        
        console.log('Est une livraison?', isLivraison);
        
        if (isLivraison) {
          console.log('✓ Livraison détectée');
          
          // Analyser la date avec plus de flexibilité
          const rawDate = event.date || event.start || event.eventDate || 
                         event.deliveryDate || event.startDate || event.dateEvent ||
                         event.dateLivraison || event.scheduledDate;
          
          console.log('Date brute:', rawDate);
          
          let eventDate: Date;
          
          if (rawDate) {
            if (typeof rawDate === 'string') {
              if (rawDate.includes('/')) {
                const [day, month, year] = rawDate.split('/').map(Number);
                eventDate = new Date(year, month - 1, day);
              } else if (rawDate.includes('-')) {
                eventDate = new Date(rawDate);
              } else {
                eventDate = new Date(rawDate);
              }
            } else {
              eventDate = new Date(rawDate);
            }
          } else {
            // Si pas de date, considérer comme future
            eventDate = new Date();
            eventDate.setDate(eventDate.getDate() + 1);
          }
          
          console.log('Date analysée:', eventDate);

          // Analyser le statut - chercher spécifiquement "en_attente"
          const status = event.status || event.etat || event.state || 
                        event.deliveryStatus || event.statut || event.statutLivraison || '';
          const statusStr = status.toString().toUpperCase().trim();
          
          console.log('Statut original:', status);
          console.log('Statut nettoyé:', statusStr);
          
          const dateComparison = eventDate >= currentDate;
          console.log('Date future/actuelle?', dateComparison);

          // Chercher spécifiquement le statut "en_attente"
          const isEnAttente = statusStr === 'EN_ATTENTE' || statusStr === 'EN ATTENTE' || 
                             statusStr === 'PENDING' || statusStr === 'WAITING' ||
                             statusStr === 'ATTENTE' || statusStr === 'EN-ATTENTE';
          
          console.log('Statut en attente?', isEnAttente);

          // Compter seulement les livraisons futures/actuelles ET en attente
          if (dateComparison && isEnAttente) {
            livraisonsEnAttente++;
            console.log('✓ Livraison en attente comptée!');
          } else {
            console.log('✗ Livraison non comptée - Date:', dateComparison, 'Statut en attente:', isEnAttente);
          }
        }
      });
    }

    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('Livraisons en attente trouvées:', livraisonsEnAttente);

    // Toujours afficher quelque chose même si 0
    const displayValue = livraisonsEnAttente;
    const displayLabel = livraisonsEnAttente === 0 ? 'Aucune livraison en attente' : 'Livraisons en attente';
    
    return {
      labels: [displayLabel],
      datasets: [{
        label: 'Livraisons en attente',
        data: [displayValue],
        backgroundColor: livraisonsEnAttente === 0 ? 
          ['rgba(128, 128, 128, 0.5)'] : 
          ['rgba(247, 183, 51, 0.8)'], // Orange pour "en attente"
        borderWidth: 1
      }]
    };
  }

  // Mise à jour des graphiques
  createOrUpdateCharts(): void {
    try {
      console.log('Création/mise à jour des graphiques...');
      
      this.produitsChart = this.createOrUpdateChart('chartProduits', 'bar', this.prepareProduitsData(), this.produitsChart);
      this.commandesChart = this.createOrUpdateChart('chartCommandes', 'bar', this.prepareCommandesData(), this.commandesChart);
      this.livraisonsChart = this.createOrUpdateChart('chartLivraisons', 'bar', this.prepareLivraisonsData(), this.livraisonsChart);
      this.typeProduitsChart = this.createOrUpdateChart('chartTypeProduits', 'pie', this.prepareTypeProduitsData(), this.typeProduitsChart);
      
      console.log('Graphiques créés/mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la création des graphiques:', error);
    }
  }

  generateColors(count: number): string[] {
    const baseColors = [
      'rgba(247, 183, 51, 0.8)',   // jaune
      'rgba(0, 0, 0, 0.8)',        // noir
      'rgba(255, 255, 255, 0.8)',  // blanc
      '#FFB84C',                   // orange
      'rgba(44, 44, 44, 0.8)',     // gris foncé
   
    ];
    
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  }

  // Méthode utilitaire pour déboguer les données
  debugData(): void {
    console.log('=== DÉBOGAGE DES DONNÉES ===');
    console.log('Type produits:', this.allTypeProduits);
    console.log('Produits:', this.allProduits);
    console.log('Commandes:', this.allCommandes);
    console.log('Événements calendrier:', this.calendarEvents);
    console.log('Livraisons:', this.allLivraisons);
    
    if (this.allCommandes.length > 0) {
      console.log('Exemple de commande:', this.allCommandes[0]);
      console.log('Propriétés de la première commande:', Object.keys(this.allCommandes[0]));
    }
    
    if (this.calendarEvents.length > 0) {
      console.log('Exemple d\'événement:', this.calendarEvents[0]);
      console.log('Propriétés du premier événement:', Object.keys(this.calendarEvents[0]));
    }

    if (this.allLivraisons.length > 0) {
      console.log('Exemple de livraison:', this.allLivraisons[0]);
      console.log('Propriétés de la première livraison:', Object.keys(this.allLivraisons[0]));
    }
  }
}