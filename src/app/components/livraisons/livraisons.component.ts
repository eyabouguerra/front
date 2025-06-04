import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { LivraisonService } from 'src/app/services/livraison.service';
import { MatDialog } from '@angular/material/dialog';
import { AddLivraisonComponent } from '../add-livraison/add-livraison.component';
import { DialogLivraisonDetailsComponent } from '../dialog-livraison-details/dialog-livraison-details.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-livraisons',
  templateUrl: './livraisons.component.html',
  styleUrls: ['./livraisons.component.css']
})
export class LivraisonsComponent implements OnInit, OnDestroy {
  public loading = false;
  public allLivraisons: any[] = [];
  public calendarEvents: any[] = [];
  public archivedLivraisons: any[] = [];
  public showArchives = false;
  private calendarUpdateSubscription: Subscription = new Subscription();

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
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLivraisons();
    this.subscribeToCalendarUpdates();
  }

  ngOnDestroy(): void {
    if (this.calendarUpdateSubscription) {
      this.calendarUpdateSubscription.unsubscribe();
    }
  }

  subscribeToCalendarUpdates(): void {
    this.calendarUpdateSubscription = this.lService.getCalendarUpdates().subscribe(
      ({ livraisonId, action }) => {
        console.log(`🔔 Update received: livraisonId=${livraisonId}, action=${action}`);

        if (action === 'remove') {
          this.removeLivraisonFromCalendar(livraisonId);
          this.cdr.detectChanges();
          return;
        }

        if (action === 'update') {
          this.lService.getLivraisonById(livraisonId).subscribe({
            next: (updatedLivraison) => {
              if (!updatedLivraison) {
                console.warn(`⚠️ Livraison ${livraisonId} not found.`);
                return;
              }

              const statut = updatedLivraison.statut?.trim().toUpperCase() || '';
              console.log(`📦 Livraison ${livraisonId} status: ${statut}`);

              if (statut === 'LIVRE' || statut === 'LIVREE' || statut === 'ANNULE') {
                this.archiveLivraison(updatedLivraison);
              } else {
                this.updateOrAddLivraisonToCalendar(updatedLivraison);
              }

              this.updateCalendarEvents();
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error(`❌ Error fetching livraison ${livraisonId}:`, err);
              this.loadLivraisons();
            }
          });
        }
      },
      error => {
        console.error('❌ Error in calendar updates subscription:', error);
      }
    );
  }

  private removeLivraisonFromCalendar(livraisonId: number): void {
    this.calendarEvents = this.calendarEvents.filter(event => event.id !== livraisonId.toString());
    this.archivedLivraisons = this.archivedLivraisons.filter(liv => liv.id !== livraisonId);
    this.updateCalendarEvents();
    console.log(`🗑️ Livraison ${livraisonId} removed from calendar.`);
  }

  private archiveLivraison(livraison: any): void {
    const livraisonId = livraison.id;
    this.calendarEvents = this.calendarEvents.filter(event => event.id !== livraisonId.toString());

    const index = this.archivedLivraisons.findIndex(liv => liv.id === livraisonId);
    if (index !== -1) {
      this.archivedLivraisons[index] = livraison;
    } else {
      this.archivedLivraisons.push(livraison);
    }

    console.log(`📦 Livraison ${livraisonId} archived (Status: ${livraison.statut}).`);
    console.log('Updated archivedLivraisons:', this.archivedLivraisons);
    this.cdr.detectChanges();
  }

  private updateOrAddLivraisonToCalendar(livraison: any): void {
    const eventData = {
      title: `Livraison ${livraison.id}`,
      start: livraison.dateLivraison,
      description: livraison.statut,
      id: livraison.id.toString(),
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
    };

    const index = this.calendarEvents.findIndex(event => event.id === livraison.id.toString());
    if (index !== -1) {
      this.calendarEvents[index] = eventData;
      console.log(`🔁 Updated calendar event for livraison ${livraison.id}`);
    } else {
      this.calendarEvents.push(eventData);
      console.log(`➕ Added new calendar event for livraison ${livraison.id}`);
    }

    this.archivedLivraisons = this.archivedLivraisons.filter(liv => liv.id !== livraison.id);
  }

  loadLivraisons(): void {
    this.lService.getAllLivraisons().subscribe({
      next: (data) => {
        this.allLivraisons = data;

        this.calendarEvents = data
          .filter((livraison: any) => {
            const normalizedStatut = livraison.statut?.trim().toUpperCase();
            return normalizedStatut !== 'ANNULE' && normalizedStatut !== 'LIVRE' && normalizedStatut !== 'LIVREE';
          })
          .map((livraison: any) => ({
            title: `Livraison ${livraison.id}`,
            start: livraison.dateLivraison,
            description: livraison.statut,
            id: livraison.id.toString(),
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

        this.archivedLivraisons = data.filter((livraison: any) => {
          const normalizedStatut = livraison.statut?.trim().toUpperCase();
          return normalizedStatut === 'ANNULE' || normalizedStatut === 'LIVRE' || normalizedStatut === 'LIVREE';
        });

        this.updateCalendarEvents();
        console.log('Loaded calendar events:', this.calendarEvents);
        console.log('Loaded archived livraisons:', this.archivedLivraisons);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading livraisons:', err);
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
      height: '500px',
      data: { livraisonId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.deleted || result?.updated) {
        this.loadLivraisons();
      }
    });
  }

  toggleArchives(): void {
    this.showArchives = !this.showArchives;
    this.cdr.detectChanges();
  }

  getStatutClass(statut: string): string {
    const s = statut?.trim().toUpperCase();
    switch (s) {
      case 'EN_ATTENTE':
        return 'badge bg-warning text-dark';
      case 'LIVRE':
      case 'LIVREE':
        return 'badge bg-success';
      case 'ANNULE':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  viewArchivedLivraisonDetails(livraisonId: number): void {
    const dialogRef = this.dialog.open(DialogLivraisonDetailsComponent, {
      width: '600px',
      height: '500px',
      data: {
        livraisonId,
        isArchived: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.updated) {
        this.loadLivraisons();
      }
    });
  }
}