import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderServiceService {

   constructor(private http: HttpClient) {}

  // Exemple de méthode pour récupérer les détails de la commande
  getOrderDetails(orderId: number): Observable<any> {
    return this.http.get<any>(`/api/orders/${orderId}`);
  }
}
