import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, BehaviorSubject, forkJoin } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private commandeURL = 'http://localhost:8090/api/commandes/v1';
  private commandeUpdated = new Subject<void>();
  commandeUpdated$ = this.commandeUpdated.asObservable();
  private archivedCommandeIdsSubject = new BehaviorSubject<Set<number>>(new Set());
  public archivedCommandeIds$ = this.archivedCommandeIdsSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  getAllCommandes(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.commandeURL).pipe(
      catchError(this.handleError<any[]>('getAllCommandes', []))
    );
  }

  addCommande(commande: any): Observable<any> {
    return this.httpClient.post<any>(`${this.commandeURL}`, commande).pipe(
      catchError(this.handleError<any>('addCommande'))
    );
  }

  getTypeProduitsParCommande(idCommande: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`http://localhost:8090/commandes/${idCommande}/type-produits`).pipe(
      catchError(this.handleError<any[]>('getTypeProduitsParCommande', []))
    );
  }

  checkCodeCommandeExists(code: string) {
    return this.httpClient.get<any>(`${this.commandeURL}/check-code`, {
      params: { codeCommande: code }
    }).pipe(
      catchError(this.handleError<any>('checkCodeCommandeExists'))
    );
  }

  updateCommande(commandeObj: any): Observable<any> {
    return this.httpClient.put<any>(`${this.commandeURL}/${commandeObj.id}`, commandeObj).pipe(
      tap(() => {
        if (commandeObj.commandeProduits && commandeObj.commandeProduits.length > 0) {
          const cp = commandeObj.commandeProduits[0];
          this.httpClient.put<any>(`${this.commandeURL}/${commandeObj.id}/produits/${cp.id}`, cp).subscribe({
            error: err => console.error('Failed to update commande_produits:', err)
          });
        }
        this.commandeUpdated.next();
      }),
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

archiveCommandes(commandeIds: number[]): void {
  const currentArchived = this.archivedCommandeIdsSubject.value;
  commandeIds.forEach(id => currentArchived.add(id));
  this.archivedCommandeIdsSubject.next(currentArchived);
}

  // Méthode à ajouter dans votre CommandeService (commande.service.ts)

updateCommandesStatut(commandeIds: number[], nouveauStatut: string): Observable<any> {
  const requests = commandeIds.map(id =>
    this.httpClient.patch(`${this.commandeURL}/${id}/statut`, { statut: nouveauStatut })
  );
  return forkJoin(requests).pipe(
    tap(() => {
      this.archiveCommandes(commandeIds); // Archive after updating status
      this.commandeUpdated.next(); // Notify subscribers
    }),
    catchError(this.handleError<any>('updateCommandesStatut'))
  );
}

  getCommandesByUser(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.commandeURL}/mesCommandes`);
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}