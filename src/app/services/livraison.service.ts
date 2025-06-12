import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LivraisonService  {

  private livraisonURL: string = 'http://localhost:8090/api/livraisons';
  private calendarUpdateSubject = new Subject<{ livraisonId: number, action: 'remove' | 'update' }>();
  private commandeArchiveSubject = new Subject<number[]>(); 
  constructor(private httpClient: HttpClient) { }

  getAllLivraisons(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.livraisonURL).pipe(
      catchError(this.handleError<any[]>('getAllLivraison', []))
    );
  }
  getProduitsLivresParLivraison(livraisonId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.livraisonURL}/${livraisonId}/produits-livres`);
  }
  
  
  checkCodeLivraisonExists(code: string) {
    return this.httpClient.get<{ exists: boolean }>(`${this.livraisonURL}/check-code?codeLivraison=${code}`);
  }
  getCamionsDisponibles(date: string): Observable<any> {
    return this.httpClient.get<any[]>(`http://localhost:8090/api/livraisons/camions/disponibles?date=${date}`);
  }
  
  // livraison.service.ts
getCiterneDisponiblesPourDate(date: string): Observable<any[]> {
  return this.httpClient.get<any[]>(`http://localhost:8090/api/livraisons/citerne/disponibles?date=${date}`);
}

  
  /*getCiternesDisponibles(date: string): Observable<Citerne[]> {
    return this.http.get<any[]>(`/api/citernes/disponibles?date=${date}`);
  }*/
    getLivraisonsByUser(username: string): Observable<any[]> {
      return this.httpClient.get<any[]>(`${this.livraisonURL}/user/${username}`);
    }
    
  
  addLivraison(livraisonData: any): Observable<any> {
    return this.httpClient.post(this.livraisonURL, livraisonData);
  }
  
  
  
  updateLivraison(id: number, livraisonData: any): Observable<any> {
    const url = `${this.livraisonURL}/${id}`;  // Assure-toi que l'ID est dans l'URL
    return this.httpClient.put<any>(url, livraisonData).pipe(
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
  

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
  getLivreurPosition(commandeId: number): Observable<{ lat: number, lng: number }> {
    return this.httpClient.get<{ lat: number, lng: number }>(`${this.livraisonURL}/position/${commandeId}`);
  }
  
  notifyCalendarUpdate(livraisonId: number, action: 'remove' | 'update') {
    this.calendarUpdateSubject.next({ livraisonId, action });
  }

  notifyCommandeArchive(commandeIds: number[]): void {
    this.commandeArchiveSubject.next(commandeIds);
  }

  getCommandeArchiveUpdates(): Observable<number[]> {
    return this.commandeArchiveSubject.asObservable();
  }

  getCalendarUpdates(): Observable<{ livraisonId: number, action: 'remove' | 'update' }> {
    return this.calendarUpdateSubject.asObservable();
  }

}
