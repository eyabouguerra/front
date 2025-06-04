// src/app/cart/cart.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { ProduitService } from 'src/app/services/produit.service';
import { CommandeService } from 'src/app/services/commande.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { OrderServiceService } from 'src/app/services/order-service.service';
import { AdresseService } from 'src/app/services/adresse.service';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  total: number = 0;
  showOrderModal: boolean = false;
  latitude: number | null = null;
longitude: number | null = null;


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
    private adresseService: AdresseService,
    private commandeService: CommandeService, // Ajouter CommandeService
    private router: Router,
    private cdr: ChangeDetectorRef,
    private orderService: OrderServiceService
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }
  loadCartItems(): void {
    this.cartService.getCartItems().subscribe(
      data => {
        console.log("Panier reçu du backend :", data);
        
        const uniqueItems: any[] = [];
  
        data.forEach((item: any) => {
          const prod = item.product[0];
          const existing = uniqueItems.find(ui => ui.product.id === prod.id);
          
          if (existing) {
            existing.quantity += item.quantity || 1;
          } else {
            uniqueItems.push({
              product: prod,
              quantity: item.quantity || 1
            });
          }
        });
  
        this.cartItems = uniqueItems;
        this.getTotalPrice();
        this.prepareOrderProductList();
      },
      error => {
        console.error('Erreur de récupération du panier', error);
        Swal.fire({
          title: 'Erreur !',
          text: 'Erreur lors de la récupération du panier.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    );
  }
  
  

  updateQuantity(codeProduit: number, quantity: number): void {
    if (quantity > 0) {
      const item = this.cartItems.find(item => item.product.codeProduit === codeProduit);
      if (item) {
        item.quantity = quantity;
        this.cartItems = [...this.cartItems];
        this.getTotalPrice();
        this.prepareOrderProductList();
      }
    } else {
      Swal.fire({
        title: 'Erreur !',
        text: 'La quantité ne peut pas être inférieure à 1.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  }

  getTotalPrice(): void {
    this.total = this.cartItems.reduce((acc, item) => acc + (item.product.prix * item.quantity), 0);
    this.cdr.detectChanges();
  }

 removeItem(id: number): void {
  if (!id) {
    console.error('ID invalide !');
    return;
  }

  // Suppression immédiate du panier côté client
  const originalCart = [...this.cartItems]; // Pour rollback en cas d'erreur
  this.cartItems = this.cartItems.filter(item => item.product.id !== id);
  this.getTotalPrice();
  this.prepareOrderProductList();
  this.cdr.detectChanges();

  // Appel backend
  this.cartService.removeFromCart(id).subscribe(
    () => {
      // Suppression confirmée par le backend (rien à faire ici)
    },
    error => {
      // En cas d'erreur, rollback
      console.error('Erreur lors de la suppression :', error);
      this.cartItems = originalCart;
      this.getTotalPrice();
      this.prepareOrderProductList();
      this.cdr.detectChanges();

      Swal.fire({
        title: 'Erreur !',
        text: 'Erreur lors de la suppression de l\'article.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  );
}

  prepareOrderProductList(): void {
    this.orderDetails.orderProductQuantityList = this.cartItems.map(item => ({
      id: item.product.id,
      quantity: item.quantity
    }));
  }

  openOrderModal(): void {
    if (this.cartItems.length === 0) {
      Swal.fire({
        title: 'Panier vide !',
        text: 'Veuillez ajouter des produits avant de valider la commande.',
        icon: 'warning',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    this.showOrderModal = true;
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    // Reset form data
    this.orderDetails = {
      fullName: '',
      fullAddress: '',
      contactNumber: '',
      alternateContactNumber: '',
      orderProductQuantityList: this.orderDetails.orderProductQuantityList
    };
  }

  // Fonction corrigée pour créer une commande complète
  placeOrder(orderForm: NgForm): void {
    if (this.orderDetails.orderProductQuantityList.length === 0) {
      Swal.fire({
        title: 'Erreur !',
        text: 'Votre panier est vide !',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
      return;
    }
  
    this.adresseService.validateAddress(this.orderDetails.fullAddress).subscribe({
      next: (result: any) => {
        console.log('Résultat de validation adresse :', result);
    
        const latitude = result.latitude ?? result.lat;
        const longitude = result.longitude ?? result.lon;
    
        if (latitude == null || longitude == null) {
          Swal.fire('Erreur', 'Adresse invalide ou coordonnées non disponibles.', 'error');
          return;
        }
    
        const commandeData = {
          codeCommande: this.generateCommandeCode(),
          dateCommande: new Date().toISOString(),
          price: this.total,
          client: {
            fullName: this.orderDetails.fullName,
            fullAddress: this.orderDetails.fullAddress,
            contactNumber: this.orderDetails.contactNumber,
            alternateContactNumber: this.orderDetails.alternateContactNumber || null,
            latitude: latitude,
            longitude: longitude
          },
          commandeProduits: this.orderDetails.orderProductQuantityList.map((item: any) => {
            const cartItem = this.cartItems.find(ci => ci.product.id === item.id);
            return {
              produit: {
                id: item.id,
                nomProduit: cartItem?.product.nomProduit,
                prix: cartItem?.product.prix,
                codeProduit: cartItem?.product.codeProduit,
                libelle: cartItem?.product.libelle
              },
              quantite: item.quantity
            };
          })
        };
  
        console.log('Commande avec adresse validée :', commandeData);
  
        this.commandeService.addCommande(commandeData).subscribe({
          next: (response) => {
            Swal.fire('Succès', 'Commande envoyée avec succès !', 'success');
            this.clearCartAfterOrder();
            this.showOrderModal = false;
            orderForm.reset();
  
            // Naviguer vers le suivi
            Swal.fire({
              title: 'Commande passée !',
              text: `Code : ${commandeData.codeCommande}`,
              icon: 'success',
              confirmButtonText: 'Suivre le livreur',
              showCancelButton: true,
              cancelButtonText: 'Retour'
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/tracking', response.id]);
              } else {
                this.router.navigate(['/categories']);
              }
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Erreur', 'Impossible d’envoyer la commande.', 'error');
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors de la validation de l’adresse :', err);
        Swal.fire('Erreur', 'Adresse invalide ou erreur réseau.', 'error');
      }
    });
  }
  
  
  
  // Générer un code de commande unique
  private generateCommandeCode(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `CMD-${timestamp}-${random}`;
  }

  // Vider le panier après une commande réussie
  private clearCartAfterOrder(): void {
    // Supprimer tous les articles du panier
    const deletePromises = this.cartItems.map(item => 
      this.cartService.removeFromCart(item.product.id).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      this.cartItems = [];
      this.total = 0;
      this.orderDetails.orderProductQuantityList = [];
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Erreur lors du vidage du panier:', error);
    });
  }
}