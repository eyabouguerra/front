import { Component, OnInit } from '@angular/core';
import { CommandeService } from 'src/app/services/commande.service';
import { TypeProduitService } from 'src/app/services/type-produit.service';
import { MatDialog } from '@angular/material/dialog';
import { AddCommandeComponent } from '../add-commande/add-commande.component';
import { ClientService } from 'src/app/services/client.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-commandes',
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.css']
})
export class CommandesComponent implements OnInit {
  allCommandes: any[] = [];
  produits: any[] = [];
  typeProduits: any[] = [];
  commandes: any[] = [];

  constructor(
    private cService: CommandeService,
    private typeProduitService: TypeProduitService,
    private clientService: ClientService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTypeProduitsAndCommandes();
  }

  loadTypeProduitsAndCommandes(): void {
    this.typeProduitService.getAllTypeProduits().subscribe({
      next: (types) => {
        this.typeProduits = types;
        this.loadCommandes();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des types de produits', err);
        this.loadCommandes();
      }
    });
  }

  loadCommandes(): void {
    this.cService.getAllCommandes().subscribe({
      next: (data) => {
        this.allCommandes = data;
        this.commandes = data;
        console.log('Données brutes des commandes :', JSON.stringify(this.allCommandes, null, 2));
        this.fetchClientsForCommandes();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des commandes', error);
      }
    });
  }

  fetchClientsForCommandes(): void {
    // Extrait les IDs des clients de manière robuste
    const clientIds = [...new Set(
      this.allCommandes
        .filter(cmd => (cmd.client_id && cmd.client_id > 0) || (cmd.client && cmd.client.id && cmd.client.id > 0))
        .map(cmd => cmd.client_id || (cmd.client && cmd.client.id))
    )];

    console.log('IDs clients extraits :', clientIds);

    if (clientIds.length === 0) {
      console.warn('Aucun ID de client trouvé. Données :', JSON.stringify(this.allCommandes, null, 2));
      this.allCommandes.forEach(cmd => {
        cmd.clientNom = 'Client inconnu';
      });
      this.extractProduits();
      return;
    }

    this.clientService.getClientsByIds(clientIds).subscribe({
      next: (clients) => {
        console.log('Réponse de l\'API pour les clients :', JSON.stringify(clients, null, 2));
        const clientMap = new Map<number, string>();
        clients.forEach(client => {
          const clientName = client.fullName || client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client inconnu';
          if (client.id && clientName) {
            clientMap.set(client.id, clientName);
          }
        });

        this.allCommandes.forEach(cmd => {
          const clientId = cmd.client_id || (cmd.client && cmd.client.id);
          cmd.clientNom = clientMap.get(clientId) || 'Client inconnu';
          console.log(`Commande ${cmd.codeCommande} - Client ID: ${clientId}, Nom: ${cmd.clientNom}`);
        });

        this.extractProduits();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des clients :', error);
        this.allCommandes.forEach(cmd => {
          cmd.clientNom = 'Client inconnu';
        });
        this.extractProduits();
      }
    });
  }

  extractProduits(): void {
    this.produits = [];
    this.allCommandes.forEach((commande: any) => {
      const clientNom = commande.clientNom || 'Client inconnu';

      if (Array.isArray(commande.commandeProduits)) {
        commande.commandeProduits.forEach((cp: any) => {
          const produit = cp.produit || {};
          const typeTrouve = this.typeProduits.find(type =>
            type.produits?.some((p: any) => p.id === produit.id)
          );

          const produitExist = this.produits.find(p =>
            p.idCommande === commande.id && p.produitNom === produit.nomProduit
          );

          if (produitExist) {
            produitExist.commandeQuantite = cp.quantite || 'Non définie';
          } else {
            this.produits.push({
              idCommande: commande.id,
              codeCommande: commande.codeCommande || 'Code inconnu',
              clientNom: clientNom,
              produitNom: produit.nomProduit || 'Nom introuvable',
              commandeQuantite: cp.quantite || 'Non définie',
              dateCommande: commande.dateCommande,
              prix: commande.price || 0,
              typeProduit: typeTrouve?.name || 'Type inconnu'
            });
          }
        });
      }
    });
  }

  deleteCommandeById(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer cette commande ?',
      text: `ID de la commande : ${id}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cService.deleteCommandeById(id).subscribe({
          next: (data) => {
            console.log('Commande supprimée', data);
            Swal.fire({
              title: 'Supprimée !',
              text: 'La commande a été supprimée avec succès.',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
            this.loadCommandes();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de la commande', err);
            Swal.fire({
              title: 'Erreur !',
              text: `Erreur lors de la suppression de la commande. Détails: ${err?.message || 'Inconnu'}`,
              icon: 'error',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }

  openAddCommandeDialog(): void {
    console.log('Button clicked: Opening AddCommandeDialog');
    const dialogRef = this.dialog.open(AddCommandeComponent, {
      width: '600px',
      height: '750px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed with result:', result);
      if (result === 'success') {
        this.loadCommandes();
        Swal.fire({
          title: 'Succès !',
          text: 'Commande ajoutée avec succès.',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
      }
    });
  }

  testClick(): void {
    console.log('Test button clicked!');
  }
}