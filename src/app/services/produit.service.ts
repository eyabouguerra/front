import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { OrderDetails } from '../model/order-details.model';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private produitURL: string = 'http://localhost:8080/api/produits/v1';
  private orderURL: string = 'http://localhost:8080/api/order';

  constructor(private httpClient: HttpClient) {}

  getAllProduits(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.produitURL).pipe(
      tap(() => console.log('Produits récupérés avec succès')),
      catchError(this.handleError<any[]>('getAllProduits', []))
    );
  }

  checkCodeProduitExists(code: string): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.produitURL}/check-code?code=${code}`);
  }

  addProduit(produit: any): Observable<any> {
    return this.httpClient.post(this.produitURL, produit).pipe(
      tap(() => console.log('Produit ajouté avec succès')),
      catchError(this.handleError<any>('addProduit'))
    );
  }

  updateProduit(produitObj: any): Observable<any> {
    return this.httpClient.put<any>(this.produitURL, produitObj).pipe(
      tap(() => console.log('Produit mis à jour avec succès')),
      catchError(this.handleError<any>('updateProduit'))
    );
  }

  getProduitById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.produitURL}/${id}`).pipe(
      tap(() => console.log(`Produit ID ${id} récupéré`)),
      catchError(this.handleError<any>('getProduitById'))
    );
  }

  deleteProduitById(id: number): Observable<void> {
    console.log('Envoi de la requête DELETE pour le produit ID:', id);
    return this.httpClient.delete<void>(`${this.produitURL}/${id}`).pipe(
      tap(() => console.log(`Produit ID ${id} supprimé`)),
      catchError((error) => {
        console.error('Échec de la suppression', error);
        return throwError(() => new Error('Échec de la suppression'));
      })
    );
  }

  getProduitsByType(typeId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.produitURL}/type/${typeId}`).pipe(
      tap(() => console.log(`Produits du type ${typeId} chargés`)),
      catchError(this.handleError<any[]>('getProduitsByType', []))
    );
  }

  addToCart(id: number): Observable<any> {
    return this.httpClient.get(`${this.orderURL}/addToCart/${id}`).pipe(
      tap(() => console.log(`Produit ID ${id} ajouté au panier`)),
      catchError(this.handleError<any>('addToCart'))
    );
  }

  getProductDetails(isSingleProductCheckout: boolean, id: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.produitURL}/getProductDetails/${isSingleProductCheckout}/${id}`).pipe(
      tap(() => console.log(`Détails du produit ${id} récupérés`)),
      catchError(this.handleError<any[]>('getProductDetails', []))
    );
  }

  placeOrder(orderDetails: OrderDetails): Observable<any> {
    return this.httpClient.post(`${this.orderURL}/placeOrder`, orderDetails).pipe(
      tap((response) => console.log('Commande placée avec succès:', response)),
      catchError(this.handleError<any>('placeOrder'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error('Détails de l\'erreur:', error);
      return of(result as T);
    };
  }
}