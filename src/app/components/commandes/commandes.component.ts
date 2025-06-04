import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommandeService } from 'src/app/services/commande.service';
import { TypeProduitService } from 'src/app/services/type-produit.service';
import { ClientService } from 'src/app/services/client.service';
import { LivraisonService } from 'src/app/services/livraison.service';
import { MatDialog } from '@angular/material/dialog';
import { AddCommandeComponent } from '../add-commande/add-commande.component';
import { forkJoin, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-commandes',
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.css']
})
export class CommandesComponent implements OnInit, OnDestroy {
  allCommandes: any[] = [];
  produits: any[] = [];
  typeProduits: any[] = [];
  archivedCommandes: any[] = [];
  searchText: string = '';
  showArchives: boolean = false;
  page: number = 1;
  itemsPerPage: number = 5;
  private livraisonSubscription: Subscription = new Subscription();
  private commandeArchiveSubscription: Subscription = new Subscription();

  constructor(
    private cService: CommandeService,
    private typeProduitService: TypeProduitService,
    private clientService: ClientService,
    private livraisonService: LivraisonService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTypeProduitsAndCommandes();
    this.subscribeToLivraisonUpdates();
    this.subscribeToCommandeArchiveUpdates();
  }

  ngOnDestroy(): void {
    this.livraisonSubscription.unsubscribe();
    this.commandeArchiveSubscription.unsubscribe();
  }

  // Méthode pour s'abonner aux mises à jour d'archivage des commandes
  subscribeToCommandeArchiveUpdates(): void {
    this.commandeArchiveSubscription = this.livraisonService.getCommandeArchiveUpdates().subscribe({
      next: (commandeIds) => {
        console.log(`🗃️ Commandes à archiver: ${commandeIds.join(', ')}`);
        if (commandeIds.length === 0) {
          console.log('Aucune commande à archiver.');
          return;
        }

        this.livraisonService.getAllLivraisons().subscribe({
          next: (livraisons) => {
            const livraison = livraisons.find(liv =>
              liv.commandes?.some((cmd: any) => commandeIds.includes(cmd.id))
            );

            if (!livraison) {
              console.warn('⚠️ Aucune livraison trouvée pour les commandes:', commandeIds);
              return;
            }

            const livraisonStatut = livraison.statut?.trim().toUpperCase();
            if (!livraisonStatut) {
              console.warn('⚠️ Statut de livraison non trouvé pour livraison ID:', livraison.id);
              return;
            }

            // Nouvelle logique de mapping des statuts
            const commandeStatut = this.mapLivraisonStatutToCommandeStatut(livraisonStatut);
            this.cService.updateCommandesStatut(commandeIds, commandeStatut).subscribe({
              next: () => {
                commandeIds.forEach(commandeId => {
                  let commande = this.allCommandes.find(c => c.id === commandeId);
                  if (commande) {
                    commande.statut = commandeStatut;
                  }
                });
                
                // Archiver seulement si LIVRE ou EN_ATTENTE
                if (commandeStatut === 'LIVRE' || commandeStatut === 'EN_ATTENTE') {
                  this.archiveCommandesByIds(commandeIds);
                }
                
                this.extractProduits();
                console.log(`✅ Commandes ${commandeIds.join(', ')} mises à jour avec statut ${commandeStatut}`);
              },
              error: (err) => {
                console.error('❌ Erreur lors de la mise à jour des statuts des commandes:', err);
              }
            });
          },
          error: (err) => {
            console.error('❌ Erreur lors de la récupération des livraisons:', err);
          }
        });
      },
      error: (err) => {
        console.error('❌ Erreur dans l\'abonnement aux mises à jour d\'archivage:', err);
      }
    });
  }

  // Nouvelle méthode pour mapper les statuts de livraison vers les statuts de commande
private mapLivraisonStatutToCommandeStatut(livraisonStatut: string): string {
    if (!livraisonStatut) {
        return 'PLANNIFIER'; // Par défaut, si aucun statut de livraison
    }

    switch (livraisonStatut.trim().toUpperCase()) {
        case 'ANNULE':
        case 'ANNULÉ':
            return 'EN_ATTENTE';
        case 'LIVRE':
        case 'LIVRÉ':
            return 'LIVRE';
        case 'EN_ATTENTE':
            return 'PLANNIFIER';
        default:
            console.warn(`⚠️ Statut de livraison inconnu: ${livraisonStatut}. Retour à PLANNIFIER.`);
            return 'PLANNIFIER';
    }
}

  // Méthode pour archiver des commandes par leurs IDs
  archiveCommandesByIds(commandeIds: number[]): void {
    commandeIds.forEach(commandeId => {
      const commandeIndex = this.allCommandes.findIndex(c => c.id === commandeId);
      if (commandeIndex !== -1) {
        const commande = this.allCommandes[commandeIndex];
        const alreadyArchived = this.archivedCommandes.some(c => c.id === commandeId);
        if (!alreadyArchived) {
          this.archivedCommandes.push({ ...commande });
        }
        this.allCommandes.splice(commandeIndex, 1);
        console.log(`📦 Commande ${commandeId} archivée automatiquement`);
      }
    });
    this.extractProduits();
  }

  // Obtenir le libellé du statut de commande
getStatutCommandeLabel(statut: string | null | undefined): string {
    if (!statut) {
        return 'Non défini';
    }
    switch (statut.toUpperCase()) {
        case 'PLANNIFIER':
            return 'Planifiée';
        case 'LIVRE':
            return 'Livrée';
        case 'EN_ATTENTE':
            return 'En attente';
        default:
            console.warn(`⚠️ Statut de commande inconnu: ${statut}`);
            return 'Non défini';
    }
}

  // Ouvrir le dialog pour modifier le statut de commande
  openStatutDialog(produit: any): void {
    const statutsOptions = [
      { value: 'PLANNIFIER', label: 'Planifiée' },
      { value: 'LIVRE', label: 'Livrée' },
      { value: 'EN_ATTENTE', label: 'En attente' }
    ];

    const selectOptions = statutsOptions.map(s => 
      `<option value="${s.value}" ${s.value === produit.statutCommande ? 'selected' : ''}>${s.label}</option>`
    ).join('');

    Swal.fire({
      title: `Modifier le statut de la commande ${produit.codeCommande}`,
      html: `
        <div class="form-group">
          <label for="statutSelect" class="form-label">Nouveau statut :</label>
          <select id="statutSelect" class="form-control">
            ${selectOptions}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Modifier',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const select = document.getElementById('statutSelect') as HTMLSelectElement;
        const nouveauStatut = select.value;
        
        if (!nouveauStatut) {
          Swal.showValidationMessage('Veuillez sélectionner un statut');
          return false;
        }
        
        return nouveauStatut;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.updateCommandeStatut(produit.idCommande, result.value);
      }
    });
  }

  // Mettre à jour le statut de commande
  updateCommandeStatut(commandeId: number, nouveauStatut: string): void {
    this.cService.updateCommandesStatut([commandeId], nouveauStatut).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Succès !',
          text: 'Le statut de la commande a été mis à jour.',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
        this.loadTypeProduitsAndCommandes();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        Swal.fire({
          title: 'Erreur',
          text: 'Impossible de mettre à jour le statut de la commande.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Charger les types de produits, commandes et synchroniser avec les livraisons
  loadTypeProduitsAndCommandes(): void {
    forkJoin({
      types: this.typeProduitService.getAllTypeProduits(),
      commandes: this.cService.getAllCommandes(),
      livraisons: this.livraisonService.getAllLivraisons()
    }).subscribe({
      next: ({ types, commandes, livraisons }) => {
        this.typeProduits = types;
        this.allCommandes = commandes;
        this.synchronizeWithLivraisons(livraisons);
        this.fetchClientsForCommandes();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données', err);
      }
    });
  }

  // Synchroniser les commandes avec les livraisons au chargement initial
synchronizeWithLivraisons(livraisons: any[]): void {
    this.archivedCommandes = [];
    
    const livraisonMap = new Map<number, any>();
    livraisons.forEach(livraison => {
      if (livraison.commandes && Array.isArray(livraison.commandes)) {
        livraison.commandes.forEach((cmd: any) => {
          if (cmd.id) {
            livraisonMap.set(cmd.id, livraison);
          }
        });
      }
    });

    const commandesActives: any[] = [];
    
    this.allCommandes.forEach(cmd => {
      const livraison = livraisonMap.get(cmd.id);
      let livraisonStatut = livraison?.statut?.trim().toUpperCase() || 'SANS_LIVRAISON';
      
      cmd.livraisonStatut = livraisonStatut;
      
      // Utiliser la nouvelle logique de mapping
      if (livraisonStatut !== 'SANS_LIVRAISON') {
        cmd.statut = this.mapLivraisonStatutToCommandeStatut(livraisonStatut);
      } else {
        cmd.statut = cmd.statut || 'PLANNIFIER';
      }

      // Archiver uniquement si LIVRE
      const shouldArchive = cmd.statut === 'LIVRE';

      if (shouldArchive) {
        this.archivedCommandes.push({ ...cmd });
        console.log(`🗃️ Commande ${cmd.id} archivée - Statut livraison: ${livraisonStatut}, Statut commande: ${cmd.statut}`);
      } else {
        commandesActives.push(cmd);
        console.log(`📝 Commande ${cmd.id} active - Statut livraison: ${livraisonStatut}, Statut commande: ${cmd.statut}`);
      }
    });

    this.allCommandes = commandesActives;
    
    console.log(`📊 Synchronisation terminée: ${this.allCommandes.length} commandes actives, ${this.archivedCommandes.length} archivées`);
}

  // S'abonner aux mises à jour des livraisons
  subscribeToLivraisonUpdates(): void {
    this.livraisonSubscription = this.livraisonService.getCalendarUpdates().subscribe({
      next: ({ livraisonId, action }) => {
        console.log(`🔔 Mise à jour reçue: Livraison ${livraisonId}, Action: ${action}`);
        
        if (action === 'update') {
          this.livraisonService.getLivraisonById(livraisonId).subscribe({
            next: (livraison) => {
              if (livraison) {
                this.updateCommandeStatusFromLivraison(livraison);
              }
            },
            error: (err) => {
              console.error(`❌ Erreur lors de la récupération de la livraison ${livraisonId}:`, err);
            }
          });
        } else if (action === 'remove') {
          this.handleLivraisonRemoved(livraisonId);
        }
      },
      error: (err) => {
        console.error('❌ Erreur dans l\'abonnement aux mises à jour des livraisons:', err);
      }
    });
  }

  // Mettre à jour le statut des commandes en fonction des livraisons
updateCommandeStatusFromLivraison(livraison: any): void {
    const commandeIds: number[] = livraison.commandes?.map((cmd: any) => cmd.id).filter((id: any) => id != null) || [];
    if (commandeIds.length === 0) {
        console.warn(`⚠️ No commande IDs found in livraison ${livraison.id}`);
        return;
    }

    let livraisonStatut = livraison.statut?.trim().toUpperCase() || 'SANS_LIVRAISON';
    const newCommandeStatut = this.mapLivraisonStatutToCommandeStatut(livraisonStatut);
    const shouldArchive = newCommandeStatut === 'LIVRE'; // Archive only if LIVRE

    this.cService.updateCommandesStatut(commandeIds, newCommandeStatut).subscribe({
        next: () => {
            commandeIds.forEach(commandeId => {
                let commande = this.allCommandes.find(c => c.id === commandeId);
                let isFromArchive = false;

                if (!commande) {
                    commande = this.archivedCommandes.find(c => c.id === commandeId);
                    isFromArchive = true;
                }

                if (!commande) {
                    console.warn(`⚠️ Commande ${commandeId} non trouvée`);
                    return;
                }

                commande.livraisonStatut = livraisonStatut;
                commande.statut = newCommandeStatut;

                if (shouldArchive) {
                    if (!isFromArchive) {
                        this.allCommandes = this.allCommandes.filter(c => c.id !== commandeId);
                        const existingArchive = this.archivedCommandes.find(c => c.id === commandeId);
                        if (!existingArchive) {
                            this.archivedCommandes.push({ ...commande });
                        }
                        console.log(`📦 Commande ${commandeId} archivée avec statut ${livraisonStatut}, Nouveau statut commande: ${commande.statut}`);
                    }
                } else {
                    if (isFromArchive) {
                        this.archivedCommandes = this.archivedCommandes.filter(c => c.id !== commandeId);
                        const existingActive = this.allCommandes.find(c => c.id === commandeId);
                        if (!existingActive) {
                            this.allCommandes.push({ ...commande });
                        }
                        console.log(`📋 Commande ${commandeId} désarchivée avec statut ${livraisonStatut}, Nouveau statut commande: ${commande.statut}`);
                    }
                }
            });

            this.extractProduits();
        },
        error: (err) => {
            console.error('❌ Erreur lors de la mise à jour des statuts des commandes:', err);
        }
    });
}

  // Gérer la suppression d'une livraison
  handleLivraisonRemoved(livraisonId: number): void {
    this.loadTypeProduitsAndCommandes();
  }

  // Charger les commandes
  loadCommandes(): void {
    this.cService.getAllCommandes().subscribe({
      next: (data) => {
        this.allCommandes = data;
        this.fetchClientsForCommandes();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des commandes', error);
      }
    });
  }

  // Récupérer les clients pour les commandes
  fetchClientsForCommandes(): void {
    const allCommandesToProcess = [...this.allCommandes, ...this.archivedCommandes];
    
    if (allCommandesToProcess.length === 0) {
      this.extractProduits();
      return;
    }

    allCommandesToProcess.forEach(cmd => {
      cmd.clientNom = cmd.client?.fullName || 'Client inconnu';
    });

    const clientIds = [...new Set(
      allCommandesToProcess
        .filter(cmd => cmd.client?.clientId)
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

          allCommandesToProcess.forEach(cmd => {
            if (cmd.client?.clientId && clientMap.has(cmd.client.clientId)) {
              cmd.clientNom = clientMap.get(cmd.client.clientId) || 'Client inconnu';
            }
          });

          this.extractProduits();
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des clients :', error);
          this.extractProduits();
        }
      });
    } else {
      this.extractProduits();
    }
  }

  // Extraire les produits pour l'affichage
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

          if (!produitExist) {
            this.produits.push({
              idCommande: commande.id,
              codeCommande: commande.codeCommande || 'Code inconnu',
              clientNom: clientNom,
              produitNom: produit.nomProduit || 'Nom introuvable',
              commandeQuantite: cp.quantite || 'Non définie',
              dateCommande: commande.dateCommande,
              prix: commande.price || 0,
              typeProduit: typeTrouve?.name || 'Type inconnu',
              livraisonStatut: commande.livraisonStatut || 'SANS_LIVRAISON',
              statutCommande: commande.statut || 'PLANNIFIER'
            });
          }
        });
      }
    });

    console.log(`📊 Produits extraits: ${this.produits.length} actifs`);
  }

  // Supprimer une commande
  deleteCommandeById(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer cette commande ?',
      text: `ID de la commande : ${id}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Annuler',
      confirmButtonText: 'Oui, supprimer'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cService.deleteCommandeById(id).subscribe({
          next: () => {
            Swal.fire('Supprimé!', 'La commande a été supprimée.', 'success');
            this.loadTypeProduitsAndCommandes();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de la commande', err);
            Swal.fire('Erreur', "La commande n'a pas pu être supprimée.", 'error');
          }
        });
      }
    });
  }

  // Ouvrir la fenêtre d'ajout de commande
  openAddCommandeDialog(): void {
    const dialogRef = this.dialog.open(AddCommandeComponent, {
      width: '600px',
      height: '750px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        this.loadTypeProduitsAndCommandes();
        Swal.fire({
          title: 'Succès !',
          text: 'Commande ajoutée avec succès.',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
      }
    });
  }

  // Basculer entre l'affichage des commandes actives et archivées
  toggleArchives(): void {
    this.showArchives = !this.showArchives;
  }

  // Filtrer les produits pour l'affichage
  get produitsFiltres(): any[] {
    const search = this.searchText?.toLowerCase() || '';
    
    if (this.showArchives) {
      const produitsArchives: any[] = [];
      this.archivedCommandes.forEach((commande: any) => {
        const clientNom = commande.clientNom || 'Client inconnu';
        if (Array.isArray(commande.commandeProduits)) {
          commande.commandeProduits.forEach((cp: any) => {
            const produit = cp.produit || {};
            const typeTrouve = this.typeProduits.find(type =>
              type.produits?.some((p: any) => p.id === produit.id)
            );

            produitsArchives.push({
              idCommande: commande.id,
              codeCommande: commande.codeCommande || 'Code inconnu',
              clientNom: clientNom,
              produitNom: produit.nomProduit || 'Nom introuvable',
              commandeQuantite: cp.quantite || 'Non définie',
              dateCommande: commande.dateCommande,
              prix: commande.price || 0,
              typeProduit: typeTrouve?.name || 'Type inconnu',
              livraisonStatut: commande.livraisonStatut || 'SANS_LIVRAISON',
              statutCommande: commande.statut || 'PLANNIFIER'
            });
          });
        }
      });
      
      return produitsArchives.filter(produit => {
        return (
          !search ||
          produit.codeCommande?.toLowerCase().includes(search) ||
          produit.produitNom?.toLowerCase().includes(search) ||
          produit.clientNom?.toLowerCase().includes(search) ||
          produit.typeProduit?.toLowerCase().includes(search) ||
          this.getStatutCommandeLabel(produit.statutCommande)?.toLowerCase().includes(search)
        );
      });
    } else {
      return this.produits.filter(produit => {
        return (
          !search ||
          produit.codeCommande?.toLowerCase().includes(search) ||
          produit.produitNom?.toLowerCase().includes(search) ||
          produit.clientNom?.toLowerCase().includes(search) ||
          produit.typeProduit?.toLowerCase().includes(search) ||
          this.getStatutCommandeLabel(produit.statutCommande)?.toLowerCase().includes(search)
        );
      });
    }
  }
}