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
        this.loadCalendarEvents()
      ]);
      this.createOrUpdateCharts();
    } catch (error) {
      console.error('Erreur lors du chargement des données', error);
    }
  }

  loadTypeProduits(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.receptionnaireService.getAllTypeProduits().subscribe({
        next: (data) => {
          this.allTypeProduits = data || [];
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
          resolve();
        },
        error: (error) => reject(error)
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
  
    if (totalProducts === 0) {
      return {
        labels: ['Aucun type détecté'],
        datasets: [{
          label: 'Aucun produit',
          data: [100],
          backgroundColor: ['#ccc'],
          borderWidth: 1
        }]
      };
    }
  
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
    if (!ctx) throw new Error(`Canvas with id ${canvasId} not found`);
  
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
            formatter: (value: number, context: any) => {
              const total = context.chart.data.datasets[0].data.reduce((acc: number, val: any) => acc + val, 0);
              const percentage = ((value / total) * 100).toFixed(1);  // Calcul du pourcentage
              const count = value;  // Nombre
              return `${count} (${percentage}%)`;  // Affichage Nombre et Pourcentage
            }
          },
          legend: { display: true, position: 'bottom' },
          tooltip: { enabled: true }
        }
      }
    });
  }
  
  
  
  prepareProduitsData(): ChartData<'bar'> {
    const dataLength = this.allProduits.length;
    
    // Si aucun produit n'est trouvé, ne pas afficher de graphique
    if (dataLength === 0) {
      return {
        labels: ['Aucun produit'],
        datasets: [{
          label: 'Nombre de Produits',
          data: [0],
          backgroundColor: ['#ccc'],
          borderWidth: 1
        }]
      };
    }
  
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
  

  prepareCommandesData(): ChartData<'bar'> {
    const ordersByStatus: { [key: string]: number } = {};

    this.allCommandes.forEach(order => {
 
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
    });
    

    return {
      labels: Object.keys(ordersByStatus),
      datasets: [{
        label: 'Commandes par Statut',
        data: Object.values(ordersByStatus),
        backgroundColor: this.generateColors(Object.keys(ordersByStatus).length),
        borderWidth: 1
      }]
    };
  }

  prepareLivraisonsData(): ChartData<'bar'> {
    const deliveriesByDate: { [key: string]: number } = {};
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    this.calendarEvents.forEach(event => {
      const rawDate = event.date || event.start;
      const eventDate = rawDate ? new Date(rawDate) : new Date();

      if (eventDate >= currentDate) {
        const key = eventDate.toLocaleDateString();
        deliveriesByDate[key] = (deliveriesByDate[key] || 0) + 1;
      }
    });

    return {
      labels: Object.keys(deliveriesByDate),
      datasets: [{
        label: 'Livraisons à partir de la date système',
        data: Object.values(deliveriesByDate),
        backgroundColor: this.generateColors(Object.keys(deliveriesByDate).length),
        borderWidth: 1
      }]
    };
  }

  createOrUpdateCharts(): void {
    this.produitsChart = this.createOrUpdateChart('chartProduits', 'bar', this.prepareProduitsData(), this.produitsChart);
    this.commandesChart = this.createOrUpdateChart('chartCommandes', 'bar', this.prepareCommandesData(), this.commandesChart);
    this.livraisonsChart = this.createOrUpdateChart('chartLivraisons', 'bar', this.prepareLivraisonsData(), this.livraisonsChart);
    this.typeProduitsChart = this.createOrUpdateChart('chartTypeProduits', 'pie', this.prepareTypeProduitsData(), this.typeProduitsChart);
  }

  generateColors(count: number): string[] {
    const baseColors = [
      'rgba(247, 183, 51, 0.8)',   // jaune
      'rgba(0, 0, 0, 0.8)',        // noir à la place de bleu clair
      'rgba(255, 255, 255, 0.8)',           // bleu marine à la place de turquoise
      '	#FFB84C',  
      'rgba(44, 44, 44, 0.8)',    // violet
      'rgba(255, 159, 64, 0.8)'    // orange
    ];
    
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  }
  
  

  
}