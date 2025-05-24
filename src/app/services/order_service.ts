// src/app/services/order_service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderServiceService {
  private orderPlacedSource = new Subject<void>();
  
  // Observable pour que les composants puissent s'abonner aux notifications
  orderPlaced$ = this.orderPlacedSource.asObservable();

  constructor() { }

  // Méthode pour notifier qu'une nouvelle commande a été passée
  notifyOrderPlaced(): void {
    console.log('Notification: Nouvelle commande passée');
    this.orderPlacedSource.next();
  }
}

// Alternative si vous voulez aussi ajouter un service de gestion d'état plus robuste
@Injectable({
  providedIn: 'root'
})
export class OrderStateService {
  private orderUpdatedSource = new Subject<any>();
  
  orderUpdated$ = this.orderUpdatedSource.asObservable();

  constructor() { }

  // Notifier qu'une commande a été mise à jour
  notifyOrderUpdate(orderData?: any): void {
    console.log('Notification: Commande mise à jour', orderData);
    this.orderUpdatedSource.next(orderData);
  }

  // Notifier qu'une nouvelle commande a été créée
  notifyNewOrder(orderData: any): void {
    console.log('Notification: Nouvelle commande créée', orderData);
    this.orderUpdatedSource.next({ type: 'NEW_ORDER', data: orderData });
  }

  // Notifier qu'une commande a été supprimée
  notifyOrderDeleted(orderId: number): void {
    console.log('Notification: Commande supprimée', orderId);
    this.orderUpdatedSource.next({ type: 'DELETE_ORDER', orderId: orderId });
  }
}