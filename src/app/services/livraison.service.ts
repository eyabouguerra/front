import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LivraisonService {
  private livraisonURL: string = 'http://localhost:8090/api/livraisons';
  private calendarUpdateSubject = new Subject<{ livraisonId: number, action: 'remove' | 'update' }>();
  private commandeArchiveSubject = new Subject<number[]>(); // New subject for archiving commandes

  constructor(private httpClient: HttpClient) {}

  getAllLivraisons(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.livraisonURL).pipe(
      catchError(this.handleError<any[]>('getAllLivraison', []))
    );
  }

  checkCodeLivraisonExists(code: string) {
    return this.httpClient.get<{ exists: boolean }>(`${this.livraisonURL}/check-code?codeLivraison=${code}`);
  }

  getCamionsDisponibles(date: string): Observable<any> {
    return this.httpClient.get<any[]>(`http://localhost:8090/api/livraisons/camions/disponibles?date=${date}`);
  }

  getCiterneDisponiblesPourDate(date: string): Observable<any[]> {
    return this.httpClient.get<any[]>(`http://localhost:8090/api/livraisons/citerne/disponibles?date=${date}`);
  }

  addLivraison(livraisonData: any): Observable<any> {
    return this.httpClient.post(this.livraisonURL, livraisonData);
  }

updateLivraison(id: number, livraisonData: any): Observable<any> {
  const url = `${this.livraisonURL}/${id}`;
  return this.httpClient.put<any>(url, livraisonData).pipe(
    tap((updatedLivraison) => {
      console.log('Updated livraison data:', updatedLivraison); // Debug log
      this.notifyCalendarUpdate(id, 'update');
      const statut = updatedLivraison.statut?.trim().toUpperCase();
      if (statut === 'ANNULE' || statut === 'LIVRE') {
        const commandeIds = updatedLivraison.commandes?.map((cmd: any) => cmd.id).filter((id: any) => id != null) || [];
        console.log(`Commande IDs to archive: ${commandeIds}`); // Debug log
        if (commandeIds.length > 0) {
          this.notifyCommandeArchive(commandeIds);
        } else {
          console.warn('No commande IDs found in livraison:', updatedLivraison);
        }
      }
    }),
    catchError(this.handleError<any>('updateLivraison'))
  );
}

  getLivraisonById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.livraisonURL}/${id}`).pipe(
      catchError(this.handleError<any>('getLivraisonById'))
    );
  }

  deleteLivraisonById(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.livraisonURL}/${id}`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la suppression de la livraison:', error);
        return throwError(() => new Error('Une erreur est survenue lors de la suppression de la livraison.'));
      })
    );
  }

  deleteLivraison(id: number): Observable<any> {
    return this.httpClient.delete(`${this.livraisonURL}/${id}`);
  }

  archiveCommandes(livraisonId: number): Observable<any> {
    return this.httpClient.post(`${this.livraisonURL}/${livraisonId}/archive-commandes`, {}).pipe(
      catchError(this.handleError<any>('archiveCommandes'))
    );
  }

  getLivreurPosition(commandeId: number): Observable<{ lat: number, lng: number }> {
    return this.httpClient.get<{ lat: number, lng: number }>(`${this.livraisonURL}/position/${commandeId}`);
  }

  notifyCalendarUpdate(livraisonId: number, action: 'remove' | 'update') {
    this.calendarUpdateSubject.next({ livraisonId, action });
  }

  getCalendarUpdates(): Observable<{ livraisonId: number, action: 'remove' | 'update' }> {
    return this.calendarUpdateSubject.asObservable();
  }

  notifyCommandeArchive(commandeIds: number[]): void {
    this.commandeArchiveSubject.next(commandeIds);
  }

  getCommandeArchiveUpdates(): Observable<number[]> {
    return this.commandeArchiveSubject.asObservable();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
      getLivraisonsByUser(username: string): Observable<any[]> {
      return this.httpClient.get<any[]>(`${this.livraisonURL}/user/${username}`);
    }
    
}