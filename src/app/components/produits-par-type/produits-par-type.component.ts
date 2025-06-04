import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduitService } from 'src/app/services/produit.service';
import { AddProduitComponent } from '../add-produit/add-produit.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-produits-par-type',
  templateUrl: './produits-par-type.component.html',
  styleUrls: ['./produits-par-type.component.css']
})

export class ProduitsParTypeComponent implements OnInit {
  typeId!: number;  // Déclaration de l'ID du type de produit
  typeName: string = '';  // Nom du type de produit
  produits: any[] = [];  // Liste des produits à afficher
  searchTerm: string = '';
  produitsFiltres: any[] = [];  // Liste des produits filtrés affichés

  constructor(
    private route: ActivatedRoute,
    private produitService: ProduitService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du type de produit depuis l'URL
    this.route.params.subscribe(params => {
      this.typeId = +params['id'];  // Convertir en nombre
      if (this.typeId) {
        this.loadProduits();  // Charger les produits si l'ID est valide
      } else {
        console.error('Invalid typeId:', this.typeId);
      }
    });

    // Récupérer le nom du type de produit depuis les paramètres de la requête
    this.route.queryParams.subscribe(queryParams => {
      this.typeName = queryParams['typeName'] || 'Inconnu';  // Valeur par défaut si non spécifié
    });
  }

  loadProduits(): void {
    if (this.typeId) {
      this.produitService.getProduitsByType(this.typeId).subscribe({
        next: (data) => {
          this.produits = data;
          this.produitsFiltres = data;  // initialiser la liste filtrée à la liste complète
        },
        error: (err) => {
          console.error('Erreur lors du chargement des produits:', err);
        }
      });
    }
  }
  filterProduits(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      this.produitsFiltres = this.produits.filter(p =>
        p.nomProduit.toLowerCase().includes(term) ||
        p.libelle.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.codeProduit.toString().includes(term)
      );
    } else {
      this.produitsFiltres = [...this.produits]; // reset à la liste complète
    }
  }
  
  
  
  // Méthode pour ajouter un produit
  addProduit(): void {
    const dialogRef = this.dialog.open(AddProduitComponent, {
      width: '650px', // Taille du popup
      height: '750px',
      disableClose: false,
      data: { typeId: this.typeId } // Passer l'ID du type de produit au popup
    });
  
    // Mettre à jour la liste après fermeture du popup
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProduits(); // Recharge la liste des produits
      }
    });}
  

  // Méthode pour éditer un produit
  editProduit(produitId: number): void {
    this.router.navigate(['/editproduit', produitId], {
      queryParams: { typeName: this.typeName },  // Pass the typeName as queryParam if needed
      queryParamsHandling: 'merge'  // This keeps the existing query params
    });
  }
  
  deleteProduit(produitId: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr de vouloir supprimer ce produit ?',
      text: `ID du produit : ${produitId}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.produitService.deleteProduitById(produitId).subscribe(
          () => {
            // Supprimer le produit de la liste localement
            this.produits = this.produits.filter(produit => produit.id !== produitId);
            Swal.fire({
              title: 'Supprimé !',
              text: 'Produit supprimé avec succès.',
              icon: 'success',
              confirmButtonColor: '#28a745'
            });
          },
          (error) => {
            console.error('Erreur lors de la suppression du produit:', error);
            Swal.fire({
              title: 'Erreur !',
              text: 'Une erreur est survenue lors de la suppression du produit.',
              icon: 'error',
              confirmButtonColor: '#d33'
            });
          }
        );
      }
    });
  }
  
  

  openDialog(): void {
    const dialogRef = this.dialog.open(AddProduitComponent, {
      data: { typeId: this.typeId }  // Passez `typeId` comme données
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Rafraîchir la liste des produits si nécessaire
        this.loadProduits();
      }
    });
  }
  

}
