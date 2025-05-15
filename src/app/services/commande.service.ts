// commande.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private commandeURL = 'http://localhost:8080/api/commandes/v1';

  constructor(private httpClient: HttpClient) {}

  getAllCommandes(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.commandeURL).pipe(
      catchError(this.handleError<any[]>('getAllCommandes', []))
    );
  }
  



addCommande(commande: any): Observable<any> {
  return this.httpClient.post<any>(`${this.commandeURL}`, commande)
 
}

// Dans ton service, exemple : commande.service.ts
getTypeProduitsParCommande(idCommande: number): Observable<any[]> {
  return this.httpClient.get<any[]>(`http://localhost:8080/commandes/${idCommande}/type-produits`);
}


  checkCodeCommandeExists(code: string) {
    return this.httpClient.get<any>(`${this.commandeURL}/check-code`, {
      params: { codeCommande: code }
    });
  }
  
  
  updateCommande(commandeObj: any): Observable<any> {
    return this.httpClient.put<any>(`${this.commandeURL}/${commandeObj.id}`, commandeObj).pipe(
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

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}