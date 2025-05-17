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
    console.log('Commandes brutes avec client data:', JSON.stringify(this.allCommandes, null, 2));
    this.fetchClientsForCommandes();
  },
  error: (error) => {
    console.error('Erreur lors de la récupération des commandes', error);
  }
});
  }

fetchClientsForCommandes(): void {
  if (this.allCommandes.length === 0) {
    this.extractProduits();
    return;
  }

  // Try to use embedded client data first
  this.allCommandes.forEach(cmd => {
    if (cmd.client && cmd.client.fullName) {
      cmd.clientNom = cmd.client.fullName;
    } else {
      cmd.clientNom = 'Client inconnu'; // Placeholder until fetched
    }
  });

  // Fetch client IDs from cmd.client.clientId
  const clientIds = [...new Set(
    this.allCommandes
      .filter(cmd => cmd.client?.clientId) // Access clientId correctly
      .map(cmd => cmd.client.clientId)
      .filter(id => id != null)
  )];

  if (clientIds.length > 0) {
    this.clientService.getClientsByIds(clientIds).subscribe({
      next: (clients) => {
        const clientMap = new Map<number, string>();
        clients.forEach(client => {
          if (client.clientId && client.fullName) {
            clientMap.set(client.clientId, client.fullName);
          }
        });

        this.allCommandes.forEach(cmd => {
          if (cmd.client?.clientId && clientMap.has(cmd.client.clientId)) {
            cmd.clientNom = clientMap.get(cmd.client.clientId) || 'Client inconnu';
          }
        });

        this.extractProduits();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des clients :', error);
        this.extractProduits(); // Proceed with "Client inconnu" if fetch fails
      }
    });
  } else {
    this.extractProduits();
  }
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
            clientNom: clientNom, // Ensure clientNom is propagated
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