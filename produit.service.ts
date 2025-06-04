import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private produitURL: string = 'http://localhost:8080/api/produits/v1';

  constructor(private httpClient: HttpClient) {}

  //Méthode pour récupérer toutes les commandes
  getAllProduits(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.produitURL).pipe(
      catchError(this.handleError<any[]>('getAllProduit', []))
    );
  } 
  

  addProduit(produitObj: any): Observable<any> {
    return this.httpClient.post(this.produitURL, produitObj);
  }
  
  
  
  updateProduit(produitObj: any): Observable<any> {
    return this.httpClient.put<any>(this.produitURL, produitObj).pipe(
      catchError(this.handleError<any>('updatePlat'))
    );
  }


  getProduitById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.produitURL}/${id}`).pipe(
      catchError(this.handleError<any>('getProduitById'))
    );
  }

  deleteProduitById(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.produitURL}/${id}`).pipe(
      catchError(this.handleError<void>('deleteProduitById'))
    );
  }

  getProduitsByType(typeId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.produitURL}/type/${typeId}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Log des détails de l'erreur
      console.error('Details de l\'erreur:', error);
      return of(result as T);
    };
  }


  
}
