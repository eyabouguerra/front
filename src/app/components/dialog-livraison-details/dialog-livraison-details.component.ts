import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LivraisonService } from 'src/app/services/livraison.service';
import { CommandeService } from 'src/app/services/commande.service'; // Import CommandeService
import { Subscription } from 'rxjs'; // Import Subscription for cleanup
import Swal from 'sweetalert2';

// Définition des interfaces
interface Produit {
  id?: number;
  nomProduit?: string;
}

interface CommandeProduit {
  produit?: Produit;
  quantite?: number;
}

interface Commande {
  id?: number;
  codeCommande: string;
  quantite?: number;
  commandeProduits?: CommandeProduit[];
  price?: number;
}

interface Citerne {
  reference?: string;
  capacite?: number;
}

interface Camion {
  marque?: string;
  immatriculation?: string;
}

interface LivraisonResponse {
  id: number;
  codeLivraison: string;
  dateLivraison: Date;
  statut: string;
  camion?: Camion;
  citerne?: Citerne;
  commandes?: Commande[];
}

interface LivraisonDetail {
  id: number;
  codeLivraison: string;
  dateLivraison: Date | string;
  statut: string;
  marque: string;
  immatriculation: string;
  citerne: {
    reference: string;
    capacite: number | string;
  };
  commandes: Array<{
    codeCommande: string;
    produitNom: string;
    commandeQuantite: number | string;
    price?: number;
  }>;
}

@Component({
  selector: 'app-dialog-livraison-details',
  templateUrl: './dialog-livraison-details.component.html',
  styleUrls: ['./dialog-livraison-details.component.css']
})
export class DialogLivraisonDetailsComponent implements OnInit, OnDestroy {
  livaisons: any[] = [];
  livraisonDetail: LivraisonDetail = {} as LivraisonDetail;
private commandeUpdateSubscription!: Subscription;
  constructor(
    public dialogRef: MatDialogRef<DialogLivraisonDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private livraisonService: LivraisonService,
    private commandeService: CommandeService, // Inject CommandeService
    private router: Router
  ) {}

  ngOnInit(): void {
    const livraisonId = this.data?.livraisonId;

    if (!livraisonId) {
      console.error('ID de livraison manquant.');
      this.dialogRef.close();
      return;
    }

    // Initial load of livraison details
    this.loadLivraisonDetails(livraisonId);

    // Subscribe to command updates to refresh data
    this.commandeUpdateSubscription = this.commandeService.commandeUpdated$.subscribe(() => {
      console.log('Commande updated, refreshing livraison details...');
      this.loadLivraisonDetails(livraisonId); // Re-fetch details on update
    });
  }

  ngOnDestroy(): void {
    // Cleanup subscription to avoid memory leaks
    if (this.commandeUpdateSubscription) {
      this.commandeUpdateSubscription.unsubscribe();
    }
  }

  private loadLivraisonDetails(livraisonId: number): void {
    this.livraisonService.getLivraisonById(livraisonId).subscribe({
      next: (res: LivraisonResponse) => {
        console.log('Données complètes de la réponse:', res);

        if (res.commandes && res.commandes.length > 0) {
          console.log('Nombre de commandes:', res.commandes.length);
        } else {
          console.log('Aucune commande trouvée dans la réponse.');
        }

        // Formatage des détails de la livraison avec correction de la quantité
        this.livraisonDetail = {
          id: res.id,
          codeLivraison: res.codeLivraison || 'Non définie',
          dateLivraison: res.dateLivraison || 'Non définie',
          statut: res.statut || 'Non défini',
          marque: res.camion?.marque || 'Non définie',
          immatriculation: res.camion?.immatriculation || 'Non définie',
          citerne: {
            reference: res.citerne?.reference || 'Non définie',
            capacite: res.citerne?.capacite || 'Non définie'
          },
          commandes: Array.isArray(res.commandes)
            ? res.commandes.map((cmd: Commande) => ({
                codeCommande: cmd.codeCommande || 'Non définie',
                produitNom: cmd.commandeProduits?.[0]?.produit?.nomProduit || 'Non défini',
                commandeQuantite: cmd.quantite ?? cmd.commandeProduits?.[0]?.quantite ?? 0, // Prioritize commandes.quantite
                price: cmd.price
              }))
            : []
        };

        console.log('Détails de livraison formatés:', this.livraisonDetail);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails :', err);
        this.dialogRef.close();
      }
    });
  }

  imprimerLivraison(): void {
    console.log('🖨️ Fonction imprimerLivraison() appelée');

    if (!this.livraisonDetail) {
      console.error('❌ livraisonDetail est undefined ou null.');
      return;
    }

    let totalPrix = 0;

    const commandesTableRows = this.livraisonDetail.commandes.map(cmd => {
      const quantite = Number(cmd.commandeQuantite) || 0;
      const prixUnitaire = Number(cmd.price) || 0;
      const prixTotalCommande = quantite * prixUnitaire;

      totalPrix += prixTotalCommande;

      return `
        <tr>
          <td>${cmd.codeCommande}</td>
          <td>${cmd.produitNom}</td>
          <td>${quantite} L</td>
          <td>${prixUnitaire.toFixed(2)} DT</td>
        </tr>
      `;
    }).join('');

    const contenu = `
      <div class="container">
        <div class="header-flex">
          <img src="assets/img/logo1.png" alt="Logo" class="header-image">
          <h1 class="titre">Détails de la Livraison</h1>
        </div>
        <table class="main-table">
          <tr><th>Code Livraison</th><td>${this.livraisonDetail.codeLivraison}</td></tr>
          <tr><th>Date de Livraison</th><td>${this.livraisonDetail.dateLivraison}</td></tr>
          <tr><th>Immatriculation</th><td>${this.livraisonDetail.immatriculation}</td></tr>
          <tr><th>Citerne</th><td>${this.livraisonDetail.citerne.reference} (${this.livraisonDetail.citerne.capacite} L)</td></tr>
          <tr><th>Statut</th><td>${this.livraisonDetail.statut}</td></tr>
          <tr>
            <th>Commandes</th>
            <td>
              <table class="sub-table">
                <thead>
                  <tr><th>Réf. Commande</th><th>Produit</th><th>Quantité (L)</th><th>Prix Unitaire</th></tr>
                </thead>
                <tbody>
                  ${commandesTableRows}
                </tbody>
              </table>
            </td>
          </tr>
          <tr><th>Prix total</th><td><strong>${totalPrix.toFixed(2)} DT</strong></td></tr>
        </table>
        <h4 class="signature">Signature</h4>
      </div>
    `;

    const fenetreImpression = window.open('', '_blank', 'width=1300,height=1000');
    if (!fenetreImpression) {
      console.error("❌ Impossible d'ouvrir la fenêtre d'impression.");
      return;
    }

    fenetreImpression.document.open();
    fenetreImpression.document.write(`
      <html>
        <head>
          <title>Impression - Livraison</title>
          <style>
            @media print {
              @page {
                size: A4 landscape;
                margin: 5mm;
              }
              body {
                margin: 0;
              }
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 16px;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
            }
            .container {
              width: 100%;
              padding: 15px;
              box-sizing: border-box;
            }
            .header-flex {
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: relative;
            }
            .header-image {
              width: 80px;
              height: auto;
            }
            .titre {
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
              font-size: 26px;
              margin: 0;
            }
            h1 {
              text-align: center;
              font-size: 26px;
              margin: 20px 0;
            }
            .main-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 16px;
              margin-top: 20px;
            }
            .main-table th, .main-table td {
              border: 2px solid #000;
              padding: 12px;
              text-align: left;
              vertical-align: top;
            }
            .main-table th {
              background-color: #dcdcdc;
            }
            .sub-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 15px;
            }
            .sub-table th, .sub-table td {
              border: 2px solid #555;
              padding: 10px;
              text-align: center;
            }
            .sub-table thead {
              background-color: #f5f5f5;
            }
            .signature {
              text-align: right;
              margin-top: 50px;
              margin-right: 20px;
            }
          </style>
        </head>
        <body>
          ${contenu}
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    fenetreImpression.document.close();
  }

  closeDialog(): void {
    const button = document.querySelector('button');
    if (button) {
      button.blur();
    }

    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.setAttribute('aria-hidden', 'true');
    }

    this.dialogRef.close();
  }

  deleteLivraison(): void {
    const livraisonId = this.data?.livraisonId;

    if (!livraisonId || livraisonId === 'ID inconnu') {
      Swal.fire({
        title: 'Erreur !',
        text: 'ID de livraison invalide.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer cette livraison ?',
      text: `ID de livraison : ${livraisonId}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.livraisonService.deleteLivraisonById(livraisonId).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimée !',
              text: 'La livraison a été supprimée avec succès.',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
            this.dialogRef.close({ deleted: true, livraisonId: livraisonId });
            this.removeLivraisonFromCalendar(livraisonId);
          },
          error: (err) => {
            console.error('Erreur lors de la suppression:', err);
            const errorMessage = err?.message || 'Inconnu';
            Swal.fire({
              title: 'Erreur !',
              text: `Erreur lors de la suppression. Détails: ${errorMessage}`,
              icon: 'error',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }

  removeLivraisonFromCalendar(livraisonId: number): void {
    if (!this.data?.calendarApi) {
      console.error('API de calendrier non disponible!');
      return;
    }

    console.log('API de calendrier disponible. Tentative de suppression de l\'événement.');

    const event = this.data.calendarApi.getEventById(livraisonId);

    if (event) {
      event.remove();
      console.log(`Livraison avec ID ${livraisonId} supprimée du calendrier`);
    } else {
      console.error(`Événement avec ID ${livraisonId} non trouvé.`);
    }
  }

  editLivraison(id: number): void {
    const livraisonId = id;
    if (!livraisonId) {
      alert("L'ID de livraison est manquant pour l'édition.");
      return;
    }

    console.log("Modification de la livraison avec l'ID:", livraisonId);

    this.dialogRef.close();
    this.router.navigate(['/edit-livraison', livraisonId]);
  }
}