import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { LivraisonService } from 'src/app/services/livraison.service';
import { MatDialog } from '@angular/material/dialog';
import { AddLivraisonComponent } from '../add-livraison/add-livraison.component';
import { DialogLivraisonDetailsComponent } from '../dialog-livraison-details/dialog-livraison-details.component';

@Component({
  selector: 'app-livraisons',
  templateUrl: './livraisons.component.html',
  styleUrls: ['./livraisons.component.css']
})
export class LivraisonsComponent implements OnInit {
  public loading = false;
  public allLivraisons: any[] = [];
  public calendarEvents: any[] = [];

  public calendarOptions: any = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    locale: frLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this)
  };

  constructor(
    private lService: LivraisonService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadLivraisons();
  }

  
  loadLivraisons(): void {
    this.lService.getAllLivraisons().subscribe({
      next: (data) => {
        this.allLivraisons = data;
  
        this.calendarEvents = data.map((livraison: any) => ({
          title: `Livraison ${livraison.id}`,
          start: livraison.dateLivraison,
          description: livraison.statut,
          id: livraison.id,
          codeLivraison: livraison.codeLivraison,
          extendedProps: {
            codeLivraison: livraison.codeLivraison,
            statut: livraison.statut,
            marque: livraison.camion?.marque || 'Non définie',
            immatriculation: livraison.camion?.immatriculation || 'Non définie',
            codeCommande: livraison.commande?.codeCommande || 'Non définie',
            capaciteCompartiment: livraison.camion?.citerne?.compartiment?.capaciteMax || 'Non définie',
            referenceCompartiment: livraison.camion?.citerne?.compartiment?.reference || 'Non définie',
            referenceCiterne: livraison.camion?.citerne?.reference || 'Non définie',
            capaciteCiterne: livraison.camion?.citerne?.capacite || 'Non définie'
          }
        }));
  
        // Met à jour les événements du calendrier
        this.updateCalendarEvents();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des livraisons :', err);
      }
    });
  }
  
  editLivraison(livraisonId: number): void {
    const dialogRef = this.dialog.open(AddLivraisonComponent, {
      width: '600px',
      height: '800px',
      disableClose: true,
      data: { livraisonId } // ✅ Passe bien l'ID ici
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadLivraisons();
      }
    });
  }
  
  
  

  updateCalendarEvents(): void {
    this.calendarOptions.events = [...this.calendarEvents];
  }

  handleEventClick(clickInfo: any): void {
    const livraisonId = clickInfo.event.id;
  
    const dialogRef = this.dialog.open(DialogLivraisonDetailsComponent, {
      width: '600px',
      height: '400px',
      data: { livraisonId }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.deleted) {
        // Si la livraison a été supprimée, recharger les livraisons
        this.loadLivraisons();
      }
    });
  }
  
  
}
