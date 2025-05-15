import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { ProduitService } from 'src/app/services/produit.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  total: number = 0;
  showOrderModal: boolean = false;
  
  orderDetails: any = {
    fullName: '',
    fullAddress: '',
    contactNumber: '',
    alternateContactNumber: '',
    orderProductQuantityList: []
  };

  constructor(
    private cartService: CartService,
    private produitService: ProduitService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.cartService.getCartItems().subscribe(
      data => {
        this.cartItems = data.map((item: any) => ({
          product: item.product,
          quantity: item.quantity || 1
        }));
        this.getTotalPrice();
        // Préparer les produits pour la commande
        this.prepareOrderProductList();
      },
      error => {
        console.error("Erreur de récupération du panier", error);
      }
    );
  }

  updateQuantity(codeProduit: number, quantity: number): void {
    if (quantity > 0) {
      const item = this.cartItems.find(item => item.product.codeProduit === codeProduit);
      if (item) {
        item.quantity = quantity;
        this.cartItems = [...this.cartItems];  // Crée une nouvelle référence pour forcer Angular à détecter les changements
        this.getTotalPrice();  // Recalcule le total
        this.prepareOrderProductList(); // Met à jour la liste des produits pour la commande
      }
    } else {
      alert("La quantité ne peut pas être inférieure à 1");
    }
  }

  getTotalPrice(): void {
    this.total = this.cartItems.reduce((acc, item) => acc + (item.product.prix * item.quantity), 0);
    this.cdr.detectChanges();  // Force la détection des changements
  }

  removeItem(id: number): void {
    if (!id) {
      console.error("ID invalide !");
      return;
    }
  
    this.cartService.removeFromCart(id).subscribe(
      (response) => {
        console.log('Réponse du backend:', response);
        this.cartItems = this.cartItems.filter(item => item.product.id !== id);
        this.getTotalPrice();
        this.prepareOrderProductList(); // Met à jour la liste des produits pour la commande
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Erreur lors de la suppression :', error);
      }
    );
  }
  
  // Préparation de la liste des produits pour la commande
  prepareOrderProductList(): void {
    this.orderDetails.orderProductQuantityList = this.cartItems.map(item => ({
      id: item.product.id,
      quantity: item.quantity
    }));
  }

  // Gestion du modal
  openOrderModal(): void {
    if (this.cartItems.length === 0) {
      alert("Votre panier est vide. Veuillez ajouter des produits avant de valider la commande.");
      return;
    }
    this.showOrderModal = true;
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
  }

  placeOrder(orderForm: NgForm): void {
    if (this.orderDetails.orderProductQuantityList.length === 0) {
      alert("Votre panier est vide!");
      return;
    }

    this.produitService.placeOrder(this.orderDetails).subscribe(
      (response) => {
        console.log('Commande placée avec succès:', response);
        this.closeOrderModal();
        orderForm.reset();
        // Vider le panier
        this.cartItems = [];
        this.getTotalPrice();
        // Rediriger vers la page de confirmation
        this.router.navigate(['/orderConfirm']);
      },
      (error) => {
        console.error('Erreur lors du placement de la commande:', error);
        alert("Une erreur s'est produite lors du placement de la commande. Veuillez réessayer.");
      }
    );
  }
}