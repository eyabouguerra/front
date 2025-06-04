import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TypeProduitService } from 'src/app/services/type-produit.service';
import { AddTypeProduitComponent } from '../add-type-produit/add-type-produit.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-type-produit',
  templateUrl: './type-produit.component.html',
  styleUrls: ['./type-produit.component.css']
})
export class TypeProduitComponent {
  allTypeProduits: any[] = [];
  searchTerm: string = ''; // ce que l'utilisateur tape
  filteredTypeProduits: any[] = [];
  constructor(
    private pService: TypeProduitService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.pService.getAllTypeProduits().subscribe({
      next: (data) => {
        this.allTypeProduits = data;
        this.filteredTypeProduits = data; // initialiser la liste filtrée
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits', err);
      }
    });
  }
  
  filterProduits(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredTypeProduits = this.allTypeProduits.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  }
  deleteProduitById(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer ce produit ?',
      text: `ID du produit : ${id}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pService.deleteTypeProduitById(id).subscribe({
          next: () => {
            console.log('Produit supprimé avec succès');
            Swal.fire({
              title: 'Supprimé !',
              text: 'Le produit a été supprimé avec succès.',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
            this.loadProduits();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression du produit', err);
            Swal.fire({
              title: 'Erreur !',
              text: `Erreur lors de la suppression du produit. Détails: ${err?.message || 'Inconnu'}`,
              icon: 'error',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }
  

  goToEdit(id: number): void {
    this.router.navigate(['edit_type_produit', id]);
  }

  openAddProduitDialog(): void {
    const dialogRef = this.dialog.open(AddTypeProduitComponent, {
      width: '900px',
      height: '410px',
  
      disableClose: false
     
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProduits();
      }
    });
  }

  viewProduitsByType(typeId: number, typeName: string): void {
    if (!typeId) {
      console.error('Erreur: typeId est undefined');
      return;
    }
  
    // Redirection vers la page avec les produits du type sélectionné
    this.router.navigate(['produits', typeId], { queryParams: { typeName } });
  }
  
  
  
  

  
}