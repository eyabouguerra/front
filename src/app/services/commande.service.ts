// commande.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private commandeURL = 'http://localhost:8080/api/commandes/v1';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private httpClient: HttpClient) {}

  getAllCommandes(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.commandeURL).pipe(
      tap(commandes => console.log('Commandes récupérées:', commandes)),
      catchError(this.handleError<any[]>('getAllCommandes', []))
    );
  }

  // Méthode corrigée pour ajouter une commande
  addCommande(commande: any): Observable<any> {
    console.log('Envoi de la commande au backend:', commande);
    
    return this.httpClient.post<any>(this.commandeURL, commande, this.httpOptions).pipe(
      tap(response => console.log('Réponse du backend:', response)),
      catchError(error => {
        console.error('Erreur lors de l\'ajout de la commande:', error);
        return throwError(error);
      })
    );
  }

  // Créer une commande depuis le panier client
  createOrderFromCart(orderData: any): Observable<any> {
    const endpoint = `${this.commandeURL}/from-cart`;
    return this.httpClient.post<any>(endpoint, orderData, this.httpOptions).pipe(
      tap(response => console.log('Commande créée depuis le panier:', response)),
      catchError(error => {
        console.error('Erreur lors de la création de commande depuis le panier:', error);
        return throwError(error);
      })
    );
  }

  getTypeProduitsParCommande(idCommande: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`http://localhost:8080/commandes/${idCommande}/type-produits`);
  }

  checkCodeCommandeExists(code: string): Observable<any> {
    return this.httpClient.get<any>(`${this.commandeURL}/check-code`, {
      params: { codeCommande: code }
    });
  }
  
  updateCommande(commandeObj: any): Observable<any> {
    return this.httpClient.put<any>(`${this.commandeURL}/${commandeObj.id}`, commandeObj, this.httpOptions).pipe(
      catchError(this.handleError<any>('updateCommande'))
    );
  }

  getCommandeById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.commandeURL}/${id}`).pipe(
      catchError(this.handleError<any>('getCommandeById'))
    );
  }

  deleteCommandeById(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.commandeURL}/${id}`).pipe(
      catchError(this.handleError<void>('deleteCommandeById'))
    );
  }

  // Méthode pour rafraîchir les commandes (utile pour les composants qui écoutent)
  refreshCommandes(): Observable<any[]> {
    return this.getAllCommandes();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Log more details about the error
      if (error.error) {
        console.error('Error details:', error.error);
      }
      if (error.status) {
        console.error('Status code:', error.status);
      }
      
      return throwError(error); // Propager l'erreur au lieu de retourner un résultat vide
    };
  }
}