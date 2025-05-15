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
typeId!: number;

  constructor(private produitService: ProduitService,private cartService: CartService,private route: ActivatedRoute,private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.typeId = +params['typeId']; // Récupération du typeId depuis l'URL
      this.getProductsByType();
    });
  }
  getProductsByType(): void {
    this.produitService.getProduitsByType(this.typeId).subscribe(
      (data: any[]) => {
        this.allProduits = data; // Met à jour la liste des produits
      },
      (error) => {
        console.error('Erreur lors de la récupération des produits:', error);
      }
    );
  }
  getProducts(): void {
    this.produitService.getAllProduits().subscribe(
      (data: any[]) => { // Ajout du type correct pour les données reçues
        this.allProduits = data;
      },
      (error) => { // Correction de la syntaxe de gestion des erreurs
        console.error('Erreur lors de la récupération des produits:', error);
      }
    );
  }
  

  addToCart(productId: number): void {
    // Find the product from the list of all products
    const product = this.allProduits.find(p => p.id === productId);

    if (product) {
      // Call the CartService to add the product to the cart
      this.cartService.addToCart(product).subscribe(
        (response) => {
          console.log(`Produit ${productId} ajouté au panier.`);
        },
        (error) => {
          console.error('Erreur lors de l\'ajout du produit au panier:', error);
        }
      );
    } else {
      console.log(`Produit avec l'ID ${productId} introuvable.`);
    }
  }
  buyProduct(productId: number) {
    this.router.navigate(['/buyProduct', productId, { isSingleProductCheckout: true }]);
  }
  
}

