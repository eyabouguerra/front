import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TypeProduitService {

  private typeproduitURL: string = 'http://localhost:8080/api/typeproduits/v1';

  constructor(private httpClient: HttpClient) {}

  //Méthode pour récupérer toutes les commandes
  getAllTypeProduits(): Observable<any[]> {
    console.log("Envoi de la requête GET...");
    return this.httpClient.get<any[]>(this.typeproduitURL).pipe(
      catchError(this.handleError<any[]>('getAllProduit', [])),
      tap(response => console.log("Réponse reçue : ", response)) // Ajoutez ce log pour vérifier la réponse
    );
  }
  
  getAllTypeProduitsAvecProduits(): Observable<any[]> {
    return this.httpClient.get<any[]>('http://localhost:8080/api/typeProduits?includeProduits=true'); 
  }
  

  addTypeProduit(produitObj: TypeProduitService): Observable<TypeProduitService> {
    return this.httpClient.post<TypeProduitService>(this.typeproduitURL, produitObj).pipe(
      catchError(this.handleError<TypeProduitService>('addTypeProduit'))
    );
  }
  
  
  
  updateTypeProduit(produitObj: any): Observable<any> {
    return this.httpClient.put<any>(`${this.typeproduitURL}/${produitObj.id}`, produitObj).pipe(
      catchError(this.handleError<any>('updateType'))
    );
  }
  
  
  getTypeProduitById(id: number): Observable<any> {
    const url = `${this.typeproduitURL}/${id}`;
    console.log("URL API appelée :", url);
    return this.httpClient.get<any>(url).pipe(
      catchError(this.handleError<any>('getProduitById'))
    );
  }
  

  deleteTypeProduitById(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.typeproduitURL}/${id}`).pipe(
      catchError(this.handleError<void>('deleteProduitById'))
    );
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
