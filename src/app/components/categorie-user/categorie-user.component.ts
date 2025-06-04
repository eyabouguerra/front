import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TypeProduitService } from 'src/app/services/type-produit.service';
@Component({
  selector: 'app-categorie-user',
  templateUrl: './categorie-user.component.html',
  styleUrls: ['./categorie-user.component.css']
})
export class CategorieUserComponent {
  allTypeProduits: any[] = [];
  searchTerm: string = ''; // ce que l'utilisateur tape
  filteredTypeProduits: any[] = [];
  constructor( 
    private pService: TypeProduitService,
    private router: Router) {}
  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.pService.getAllTypeProduits().subscribe({
      next: (data) => {
        this.filteredTypeProduits = data;
        this.allTypeProduits = data;
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

  viewProduitsByType(typeId: number): void {
    if (typeId) {
      this.router.navigate(['produits_user', typeId]); // Enlève `typeName`, l'ID suffit
    } else {
      console.error('typeId is undefined');
    }
  }
  
}