import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LivraisonService } from 'src/app/services/livraison.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-livraison',
  templateUrl: './edit-livraison.component.html',
  styleUrls: ['./edit-livraison.component.css']
})
export class EditLivraisonComponent implements OnInit {
  livraisonId!: number;
  livraisonData: any = {};
  livraisonForm!: FormGroup;
  livraisonCommandes: any[] = [];
  minDate: string;
  originalStatus: string = '';

  constructor(
    private route: ActivatedRoute,
    private livraisonService: LivraisonService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.minDate = this.formatDateToYYYYMMDD(new Date());
  }

  ngOnInit(): void {
    this.livraisonId = this.route.snapshot.params['id'];
    this.livraisonForm = this.fb.group({
      codeLivraison: ['', Validators.required],
      dateLivraison: ['', Validators.required],
      marque: ['', Validators.required],
      immatriculation: ['', Validators.required],
      statut: ['', Validators.required],
      reference: [{ value: '', disabled: true }, Validators.required],
      commandes: this.fb.array([])
    });

    this.loadLivraisonData();
  }

  private loadLivraisonData(): void {
    this.livraisonService.getLivraisonById(this.livraisonId).subscribe(
      (res) => {
        console.log('Données reçues de l\'API:', res);
        this.livraisonData = res;
        this.livraisonCommandes = this.livraisonData.commandes || [];
        this.originalStatus = this.livraisonData.statut?.toUpperCase();

        this.livraisonForm.patchValue({
          codeLivraison: this.livraisonData.codeLivraison,
          marque: this.livraisonData.camion?.marque,
          reference: this.livraisonData.camion?.citerne?.reference,
          immatriculation: this.livraisonData.camion?.immatriculation,
          dateLivraison: this.livraisonData.dateLivraison,
          statut: this.originalStatus
        });
      },
      (err) => {
        console.error('Erreur lors de la récupération des données de la livraison:', err);
        this.snackBar.open('Erreur lors de la récupération des données', 'Fermer', { duration: 3000 });
      }
    );
  }

  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isStatusLocked(): boolean {
    return this.originalStatus === 'LIVRE';
  }

  getAvailableStatusOptions(): { value: string, label: string }[] {
    const allOptions = [
      { value: 'EN_ATTENTE', label: 'En Attente' },
      { value: 'LIVRE', label: 'Livré' },
      { value: 'ANNULE', label: 'Annulé' }
    ];

    if (this.isStatusLocked()) {
      return [{ value: 'LIVRE', label: 'Livré' }];
    }

    return allOptions;
  }

  editLivraison(): void {
    if (this.livraisonForm.valid) {
      const formValue = this.livraisonForm.getRawValue();
      const newStatus = formValue.statut.toUpperCase();

      if (this.originalStatus === 'LIVRE' && (newStatus === 'EN_ATTENTE' || newStatus === 'ANNULE')) {
        this.snackBar.open('Impossible de modifier un statut "Livré" vers "En Attente" ou "Annulé".', 'Fermer', { duration: 3000 });
        return;
      }

      const updatedLivraison = {
        id: this.livraisonId,
        codeLivraison: formValue.codeLivraison,
        dateLivraison: formValue.dateLivraison,
        statut: newStatus,
        commandes: this.livraisonData.commandes,
        camion: this.livraisonData.camion
      };

      this.livraisonService.updateLivraison(this.livraisonId, updatedLivraison).subscribe(
        (res) => {
          console.log('Livraison mise à jour:', res);

          // Mettre à jour originalStatus et les données après modification
          this.originalStatus = newStatus;
          this.livraisonData.statut = newStatus;

          // Mettre à jour la valeur affichée dans le formulaire
          this.livraisonForm.patchValue({
            statut: newStatus
          });

          if (newStatus === 'ANNULE') {
            this.livraisonService.notifyCalendarUpdate(this.livraisonId, 'remove');
            this.snackBar.open('Livraison annulée et supprimée du calendrier.', 'Fermer', { duration: 3000 });
          } else {
            this.livraisonService.notifyCalendarUpdate(this.livraisonId, 'update');
            this.snackBar.open(`Livraison mise à jour avec succès. Nouveau statut : ${this.getStatusLabel(newStatus)}.`, 'Fermer', { duration: 3000 });
          }

          this.router.navigate(['/livraisons']);
        },
        (err) => {
          console.error('Erreur lors de la mise à jour de la livraison:', err);
          this.snackBar.open('Erreur lors de la mise à jour de la livraison.', 'Fermer', { duration: 3000 });
        }
      );
    } else {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires.', 'Fermer', { duration: 3000 });
    }
  }

  private getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'EN_ATTENTE': 'En Attente',
      'LIVRE': 'Livré',
      'ANNULE': 'Annulé'
    };
    return statusMap[status] || status;
  }

  cancel(): void {
    this.router.navigate(['/livraisons']);
  }
}