import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/cart';

  constructor(private http: HttpClient) {}

  getCartItems(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getCartDetails`);
  }

  addToCart(item: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/addToCart/${item.id}`);
  }

  updateQuantity(id: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/${quantity}`, {});
  }

  removeFromCart(id: number): Observable<any> {
    console.log(`Tentative de suppression pour ID : ${id}`);
    return this.http.delete(`${this.apiUrl}/remove/${id}`, { responseType: 'text' }).pipe(
      tap(response => console.log('Réponse du serveur:', response)),
      catchError(error => {
        console.error('Erreur lors de la suppression du panier:', error);
        return throwError(() => new Error(error));
      })
    );
    
    
  }
  
  

  getTotalPrice(): Observable<any> {
    return this.http.get(`${this.apiUrl}/total`);
  }
}
 