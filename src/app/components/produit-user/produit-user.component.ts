import { Component } from '@angular/core';
import { ProduitService } from 'src/app/services/produit.service';
import { CartService } from 'src/app/services/cart.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-produit-user',
  templateUrl: './produit-user.component.html',
  styleUrls: ['./produit-user.component.css']
})
export class ProduitUserComponent {
  allProduits: any[] = [];
  produitsFiltres: any[] = [];
  typeId!: number;
  searchTerm: string = '';

  constructor(
    private produitService: ProduitService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.typeId = +params['typeId'];
      this.getProductsByType();
    });
  }

  getProductsByType(): void {
    this.produitService.getProduitsByType(this.typeId).subscribe(
      (data: any[]) => {
        this.allProduits = data;
        this.produitsFiltres = [...this.allProduits]; // Initialisation affichage complet
      },
      (error) => {
        console.error('Erreur lors de la récupération des produits:', error);
      }
    );
  }

  filterProduits(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (term) {
      this.produitsFiltres = this.allProduits.filter(p =>
        p.nomProduit.toLowerCase().includes(term) ||
        p.libelle.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.codeProduit.toString().includes(term)
      );
    } else {
      this.produitsFiltres = [...this.allProduits]; // Affiche tout si recherche vide
    }
  }

  addToCart(productId: number): void {
    const product = this.allProduits.find(p => p.id === productId);
    if (product) {
      this.cartService.addToCart(product).subscribe(
        () => console.log(`Produit ${productId} ajouté au panier.`),
        (error) => console.error('Erreur lors de l\'ajout du produit au panier:', error)
      );
    } else {
      console.log(`Produit avec l'ID ${productId} introuvable.`);
    }
  }

  buyProduct(productId: number) {
    this.router.navigate(['/buyProduct', productId, { isSingleProductCheckout: true }]);
  }
}

